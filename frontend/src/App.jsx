import React, { useState, useEffect } from 'react';
import { Video, Scissors, Send, Download, Loader2, Share2 } from 'lucide-react';
import axios from 'axios';

const App = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [clips, setClips] = useState([]);
  const [status, setStatus] = useState('');
  const [tokens, setTokens] = useState(null);

  useEffect(() => {
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleAuthCallback(code);
    }
  }, []);

  const handleAuthCallback = async (code) => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/google/callback', { code });
      setTokens(response.data.tokens);
      setStatus('YouTube Authentication Successful!');
      window.history.replaceState({}, document.title, "/");
    } catch (error) {
      console.error(error);
      setStatus('YouTube Authentication Failed.');
    }
  };

  const handleConnectYouTube = async () => {
    const response = await axios.get('http://localhost:3001/api/auth/google/url');
    window.location.href = response.data.url;
  };

  const handleProcess = async () => {
    if (!url) return;
    setLoading(true);
    setStatus('Processing video... this may take a few minutes.');
    setClips([]);

    try {
      const response = await axios.post('http://localhost:3001/api/process-video', { url });
      setClips(response.data.clips);
      setStatus('Success! Your clips are ready.');
    } catch (error) {
      console.error(error);
      setStatus('An error occurred during processing.');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (clipId) => {
    if (!tokens) {
      setStatus('Please connect your YouTube account first.');
      return;
    }
    const publishAt = prompt("Enter publish time (YYYY-MM-DD HH:MM:SS)", new Date(Date.now() + 3600000).toISOString().slice(0, 19).replace('T', ' '));
    if (!publishAt) return;

    try {
      await axios.post('http://localhost:3001/api/schedule/youtube', {
        tokens,
        clipId,
        publishAt
      });
      setStatus('Clip scheduled successfully!');
    } catch (error) {
      console.error(error);
      setStatus('Failed to schedule clip.');
    }
  };

  const handlePublish = async (clip) => {
    if (!tokens) {
      setStatus('Please connect your YouTube account first.');
      return;
    }
    setStatus(`Publishing ${clip.title} to YouTube...`);
    try {
      await axios.post('http://localhost:3001/api/publish/youtube', {
        tokens,
        clipId: clip.id,
        title: clip.title,
        description: clip.explanation
      });
      setStatus(`Successfully published ${clip.title}!`);
    } catch (error) {
      console.error(error);
      setStatus(`Failed to publish ${clip.title}.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Video size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">OpusClip Clone</h1>
          </div>
          <button
            onClick={handleConnectYouTube}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tokens ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'}`}
          >
            <Share2 size={18} />
            {tokens ? 'YouTube Connected' : 'Connect YouTube'}
          </button>
        </header>

        <main className="space-y-8">
          <section className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Create Viral Clips</h2>
            <p className="text-slate-400 mb-6">Drop a YouTube link and let AI do the magic.</p>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                onClick={handleProcess}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Scissors size={20} />}
                {loading ? 'Processing...' : 'Get Clips'}
              </button>
            </div>
            {status && <p className="mt-4 text-sm text-blue-400 font-medium">{status}</p>}
          </section>

          {clips.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clips.map((clip, index) => (
                <div key={index} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-600 transition-all">
                  <div className="aspect-[9/16] bg-black">
                    <video
                      src={clip.url}
                      poster={clip.thumbnailUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">{clip.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{clip.explanation}</p>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                        <span>{clip.start}s - {clip.end}s</span>
                      </div>
                      <div className="flex gap-3">
                        <a
                          href={clip.url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                        >
                          <Download size={16} />
                          Download
                        </a>
                        <button
                          onClick={() => handlePublish(clip)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                        >
                          <Send size={16} />
                          Now
                        </button>
                        <button
                          onClick={() => handleSchedule(clip.id)}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                        >
                          <Loader2 size={16} />
                          Schedule
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
