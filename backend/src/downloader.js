const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

/**
 * Utility to download a YouTube video from a link.
 * Used for the YouTube Automation Clipper Workflow.
 */
async function downloadVideo(url, outputName = 'video.mp4') {
    console.log(`Starting download for: ${url}`);

    const outputDir = path.join(__dirname, '../downloads');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const outputPath = path.join(outputDir, outputName);

    return new Promise((resolve, reject) => {
        const stream = ytdl(url, {
            quality: 'highestvideo',
            filter: format => format.container === 'mp4'
        });

        stream.pipe(fs.createWriteStream(outputPath));

        stream.on('info', (info) => {
            console.log(`Video Title: ${info.videoDetails.title}`);
        });

        stream.on('progress', (chunkLength, downloaded, total) => {
            const percent = (downloaded / total) * 100;
            process.stdout.write(`\rDownloading... ${percent.toFixed(2)}%`);
        });

        stream.on('end', () => {
            console.log(`\nDownload complete! Saved to: ${outputPath}`);
            resolve(outputPath);
        });

        stream.on('error', (err) => {
            console.error('\nError downloading video:', err);
            reject(err);
        });
    });
}

// Example usage: node src/downloader.js <youtube_url>
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('Please provide a YouTube URL.');
        console.log('Usage: node src/downloader.js https://www.youtube.com/watch?v=XXXXX');
        process.exit(1);
    }

    const url = args[0];
    downloadVideo(url).catch(err => {
        console.error('Failed to download.');
    });
}

module.exports = { downloadVideo };
