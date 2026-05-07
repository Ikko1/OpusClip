const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function suggestBRoll(clipTranscription) {
  const prompt = `
    Analyze this clip transcription and suggest 3 moments where adding B-Roll footage would be beneficial.
    Provide keywords for searching stock footage for each moment.

    Transcription:
    ${JSON.stringify(clipTranscription)}

    Return a JSON array:
    [
      { "start": number, "end": number, "keywords": "string" }
    ]
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content);
  return result.broll || result;
}

async function identifyClips(transcription) {
  const prompt = `
    Analyze the following video transcription and identify the most viral, engaging, and coherent segments.
    Each segment should be between 30 and 60 seconds long.
    Focus on "hook" moments, strong statements, or highly emotional parts.

    Transcription:
    ${JSON.stringify(transcription.segments)}

    Return the results as a JSON array of objects with the following structure:
    [
      {
        "start": number (start time in seconds),
        "end": number (end time in seconds),
        "title": "A catchy title for the clip",
        "explanation": "Brief reason why this segment is viral-worthy"
      }
    ]
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a social media expert and video editor." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content);
  return result.clips || result;
}

module.exports = {
  identifyClips,
  suggestBRoll
};
