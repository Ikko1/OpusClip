const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegStatic);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function downloadVideo(url, outputPath) {
  return new Promise((resolve, reject) => {
    // Requesting 'highest' to get a combined audio/video stream
    const stream = ytdl(url, { filter: 'audioandvideo', quality: 'highest' });
    const fileStream = fs.createWriteStream(outputPath);
    stream.pipe(fileStream);
    fileStream.on('finish', resolve);
    fileStream.on('error', reject);
  });
}

async function extractAudio(videoPath, audioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .toFormat('mp3')
      .on('end', resolve)
      .on('error', reject)
      .save(audioPath);
  });
}

async function transcribeAudio(audioPath) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["word", "segment"],
  });
  return transcription;
}

async function cutClip(inputPath, outputPath, start, end) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(start)
      .setDuration(end - start)
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
}

async function generateThumbnail(videoPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['50%'],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '1080x1920'
      })
      .on('end', resolve)
      .on('error', reject);
  });
}

async function processFinalClip(inputPath, outputPath, segments, brollSuggestions = []) {
  // Enhanced implementation of burning captions, reframing, and B-Roll overlays.

  let filterString = "crop=ih*9/16:ih"; // Reframe to 9:16

  // Use a fallback for the font path to improve portability
  const fontPath = fs.existsSync('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
    ? '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
    : 'sans-serif';

  // Apply B-Roll overlays (Simulated with a semi-transparent box and label)
  brollSuggestions.forEach((broll) => {
    filterString += `,drawbox=y=0:color=blue@0.5:width=iw:height=h/4:t=fill:enable='between(t,${broll.start},${broll.end})'`;
    filterString += `,drawtext=text='B-ROLL\: ${broll.keywords.toUpperCase()}':fontcolor=white:fontsize=24:fontfile='${fontPath}':x=(w-text_w)/2:y=50:enable='between(t,${broll.start},${broll.end})'`;
  });

  // Process all segments for captions
  segments.forEach((seg, index) => {
    const text = seg.text.trim().toUpperCase().replace(/'/g, "'\\\\\\''").replace(/:/g, "\\:");
    // Alternating colors to simulate "animated" or "dynamic" captions
    const color = index % 2 === 0 ? 'yellow' : 'white';
    filterString += `,drawtext=text='${text}':fontcolor=${color}:fontsize=32:fontfile='${fontPath}':borderw=2:bordercolor=black:x=(w-text_w)/2:y=h*0.8:enable='between(t,${seg.start},${seg.end})'`;
  });

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters(filterString)
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
}

module.exports = {
  downloadVideo,
  extractAudio,
  transcribeAudio,
  cutClip,
  processFinalClip,
  generateThumbnail
};
