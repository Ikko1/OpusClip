const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { downloadVideo, extractAudio, transcribeAudio, cutClip, processFinalClip, generateThumbnail } = require('./services/videoService');
const { identifyClips, suggestBRoll } = require('./services/aiService');
const { getAuthUrl, getTokens, uploadToYouTube } = require('./services/socialService');
const { initDb, pool } = require('./db');

dotenv.config();

// Initialize Database
initDb().catch(console.error);

// Scheduler Worker: Check for pending schedules every minute
setInterval(async () => {
  try {
    const now = new Date();
    const pendingSchedules = await pool.query(
      "SELECT s.*, c.url, c.title, c.explanation FROM schedules s JOIN clips c ON s.clip_id = c.id WHERE s.status = 'pending' AND s.publish_at <= $1",
      [now]
    );

    for (const schedule of pendingSchedules.rows) {
      console.log(`Executing scheduled publish for clip ${schedule.clip_id}...`);
      try {
        const filename = path.basename(schedule.url);
        const filePath = path.join(__dirname, '../temp', filename);

        if (fs.existsSync(filePath)) {
          await uploadToYouTube(schedule.tokens, filePath, schedule.title, schedule.explanation);
          await pool.query("UPDATE schedules SET status = 'published' WHERE id = $1", [schedule.id]);
        } else {
          console.error(`File not found for scheduled clip ${schedule.clip_id}`);
          await pool.query("UPDATE schedules SET status = 'failed' WHERE id = $1", [schedule.id]);
        }
      } catch (err) {
        console.error(`Failed to execute schedule ${schedule.id}:`, err);
        await pool.query("UPDATE schedules SET status = 'failed' WHERE id = $1", [schedule.id]);
      }
    }
  } catch (err) {
    console.error('Scheduler worker error:', err);
  }
}, 60000);

// Cleanup task: Delete files older than 1 hour in temp directory,
// but ONLY if they are not part of a pending schedule.
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
setInterval(async () => {
  const tempDir = path.join(__dirname, '../temp');
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    const now = Date.now();

    // Get all files that are currently needed for pending schedules
    const pendingSchedules = await pool.query("SELECT url FROM clips c JOIN schedules s ON s.clip_id = c.id WHERE s.status = 'pending'");
    const neededFiles = new Set(pendingSchedules.rows.map(row => path.basename(row.url)));

    files.forEach(file => {
      if (neededFiles.has(file)) return; // Skip if needed for a schedule

      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > CLEANUP_INTERVAL) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up temporary file: ${file}`);
      }
    });
  }
}, CLEANUP_INTERVAL);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve generated clips as static files
app.use('/clips', express.static(path.join(__dirname, '../temp')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/auth/google/url', (req, res) => {
  res.json({ url: getAuthUrl() });
});

app.post('/api/auth/google/callback', async (req, res) => {
  const { code } = req.body;
  try {
    const tokens = await getTokens(code);
    res.json({ tokens });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/schedule/youtube', async (req, res) => {
  const { tokens, clipId, publishAt } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO schedules (clip_id, publish_at, platform, tokens) VALUES ($1, $2, $3, $4) RETURNING *',
      [clipId, publishAt, 'youtube', tokens]
    );
    res.json({ success: true, schedule: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/publish/youtube', async (req, res) => {
  const { tokens, clipId, title, description } = req.body;
  try {
    const clipResult = await pool.query('SELECT url FROM clips WHERE id = $1', [clipId]);
    if (clipResult.rows.length === 0) return res.status(404).json({ error: 'Clip not found' });

    const clipUrl = clipResult.rows[0].url;
    const filename = path.basename(clipUrl);
    const filePath = path.join(__dirname, '../temp', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Clip file not found' });
    }

    const result = await uploadToYouTube(tokens, filePath, title, description);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/process-video', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const videoId = Date.now();
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const videoPath = path.join(tempDir, `${videoId}.mp4`);
    const audioPath = path.join(tempDir, `${videoId}.mp3`);

    console.log('Downloading video...');
    await downloadVideo(url, videoPath);

    console.log('Extracting audio...');
    await extractAudio(videoPath, audioPath);

    console.log('Transcribing audio...');
    const transcription = await transcribeAudio(audioPath);

    console.log('Identifying clips...');
    const clips = await identifyClips(transcription);

    const generatedClips = [];
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const rawClipPath = path.join(tempDir, `${videoId}_clip_${i}_raw.mp4`);
      const finalClipPath = path.join(tempDir, `${videoId}_clip_${i}_final.mp4`);

      console.log(`Cutting clip ${i}...`);
      await cutClip(videoPath, rawClipPath, clip.start, clip.end);

      console.log(`Processing final clip ${i} (Reframing & Captions)...`);
      // Filter segments relevant to this clip
      const clipSegments = transcription.segments.filter(s => s.start >= clip.start && s.end <= clip.end)
        .map(s => ({ ...s, start: s.start - clip.start, end: s.end - clip.start }));

      // Suggest B-Roll
      const brollSuggestions = await suggestBRoll(clipSegments);
      console.log(`B-Roll Suggestions for clip ${i}:`, brollSuggestions);

      await processFinalClip(rawClipPath, finalClipPath, clipSegments, brollSuggestions);

      console.log(`Generating thumbnail for clip ${i}...`);
      const thumbnailPath = path.join(tempDir, `${videoId}_clip_${i}_thumb.jpg`);
      await generateThumbnail(finalClipPath, thumbnailPath);

      const clipUrl = `http://localhost:${port}/clips/${path.basename(finalClipPath)}`;
      const thumbUrl = `http://localhost:${port}/clips/${path.basename(thumbnailPath)}`;

      const dbClip = await pool.query(
        'INSERT INTO clips (video_id, title, explanation, url, thumbnail_url, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [videoId.toString(), clip.title, clip.explanation, clipUrl, thumbUrl, clip.start, clip.end, 'processed']
      );

      generatedClips.push(dbClip.rows[0]);
    }

    res.json({
      message: 'Video processed and clips generated',
      transcription,
      clips: generatedClips
    });

  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
