# YouTube Automation Clippers Workflow: Comedy & Dating Niche

This workflow is designed for speed, consistency, and growth, focusing on turning viral long-form comedy and dating content into high-performing Shorts and clips.

---

## Step 1: Viral Research & Discovery
**Goal:** Find high-potential content before the trend peaks.

### How to Find Viral Videos
*   **Competitor Analysis:** Identify 5-10 "Clipper" channels in the comedy/dating niche (e.g., clips from *Kill Tony*, *Flagrant*, or dating shows like *Whatever* or *Fresh & Fit*). Use the "Videos" tab and sort by "Popular" to see what worked recently.
*   **YouTube Trending:** Check the "Trending" tab daily, filtering for "Entertainment" or "Comedy".
*   **Search Queries:** Use keywords like:
    *   "Dating show awkward moments"
    *   "Stand up comedy crowd work"
    *   "Podcast name + funny moments"
*   **The "7-Day Rule":** Look for videos uploaded in the last 7 days that already have more views than the channel’s average subscriber count.

### Tools to Identify Potential
*   **VidIQ / TubeBuddy:** Check the "Views Per Hour" (VPH). A high VPH on an older video indicates it’s being picked up by the algorithm.
*   **Social Blade:** To track competitor growth and see which channels are currently "hot."

---

## Step 2: Link Organization & Tracking
**Goal:** Maintain a pipeline of content so you never run out of ideas.

*   **Tracking System:** Use a Simple Google Sheet or Notion Board.
*   **Columns:** `Video Title`, `Link`, `Source Channel`, `Viral Reason (e.g., Hot Take, Fail)`, `Status (To Download, Clipped, Uploaded)`.
*   **Example:**
    *   *Title:* Comedian destroys heckler about dating.
    *   *Link:* `youtube.com/watch?v=...`
    *   *Viral Reason:* High engagement in comments.

---

## Step 3: Downloading Clips
**Goal:** Get high-quality source material quickly.

*   **Tool:** Use the custom Node.js script (provided in `backend/src/downloader.js`) or tools like `yt-dlp`.
*   **Resolution:** Always download in 1080p or higher.
*   **Organization:** Store downloads in a dedicated folder named `Source_Videos`.

---

## Step 4: The Clipping Strategy
**Goal:** Identify the "Gold" in the video.

### Rules for Selecting Moments
1.  **The Conflict/Emotion:** In dating shows, look for the moment an argument starts or a shocking revelation is made.
2.  **The Punchline:** In comedy, ensure the clip includes the setup and the immediate laugh.
3.  **Standalone Value:** Does this clip make sense to someone who has never seen the full video?

### Clip Length Guidelines
*   **YouTube Shorts / TikTok / Reels:** 30–58 seconds. (Avoid exactly 60s as some platforms may categorize it as long-form).
*   **Long-form Clips:** 3–8 minutes for "Best of" compilations.

---

## Step 5: Editing Workflow (Fast Production)
**Goal:** Transform the content to avoid copyright issues and maximize retention.

### Transformation Techniques (Avoid "Reused Content")
1.  **Split Screen:** Add a relevant reaction or "satisfying" video (like Minecraft parkour or GTA ramps) at the bottom if the main clip is just a talking head.
2.  **AI Voiceover Commentary:** Use **ElevenLabs** to add a 3-second intro or periodic commentary explaining the context. *Example: "This dating show guest just said the unthinkable..."*
3.  **Captions:** Use **OpusClip** or **CapCut** to auto-generate "Alex Hormozi style" captions (large, colorful, moving).

### Hook Formulas (First 3 Seconds)
*   *The Question:* "Would you ever date a guy who...?"
*   *The Cliffhanger:* "He had no idea she was about to say this..."
*   *The Conflict:* "The moment the interview went wrong."

---

## Step 6: Packaging (Titles & Thumbnails)
### Title Formulas
*   [Shocking Moment] + [Show Name]: "She actually said this?! | Whatever Podcast"
*   [The Outcome]: "Comedian humbles toxic heckler"
*   **Pro Tip:** Keep Shorts titles under 40 characters so they aren't cut off on mobile.

### Thumbnail Workflow
*   For Shorts, the frame is the thumbnail. Ensure the frame at the 0:01 mark is the most visually intriguing.
*   For long-form, use high-contrast faces and "Big Text" (e.g., "SHE LEFT!").

---

## Step 7: Automation & Scaling
**Goal:** Work *on* the business, not *in* it.

### Automation Tools
*   **OpusClip:** Best for automatically finding viral moments in long videos and adding captions.
*   **Repurpose.io:** Automatically take your YouTube Short and post it to TikTok, Instagram Reels, and Facebook Reels.
*   **ElevenLabs:** For high-quality AI voiceovers.

### Upload Schedule
*   **Consistency:** 1 Short per day, every day.
*   **Timing:** 12 PM EST or 6 PM EST (test both for your audience).

### Scaling to Multiple Channels
1.  **Systemize:** Use the same Google Sheet for all channels.
2.  **VAs:** Once one channel makes $500/mo, hire a virtual assistant to handle the downloading and OpusClip processing.
3.  **Niche Expansion:** Move from "Comedy Clips" to "Dating Clips" to "Podcast Highlights" using the same workflow.

---

## Step 8: Avoiding Copyright Issues
*   **Add Value:** Never just repost. Add captions, AI voiceover, or a background video.
*   **Fair Use:** Keep clips short and transformative.
*   **Credit:** Always credit the original creator in the description and a pinned comment.

---

## Summary of Tools
| Step | Free Tools | Paid Tools |
| :--- | :--- | :--- |
| **Research** | YouTube Trending | VidIQ, Social Blade |
| **Clipping** | CapCut (Desktop) | **OpusClip** (Essential) |
| **Voiceover** | CapCut Text-to-Speech | **ElevenLabs** |
| **Distribution** | Manual Upload | **Repurpose.io** |
| **Organization** | Google Sheets | Notion |
