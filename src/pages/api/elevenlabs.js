import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || "eb00bd5be4df666ee93ac2b3be1ef8309d3c48e75ebacf85f35904a638459b7a"
});

// Access levels configuration (server-side)
const ACCESS_LEVELS = {
  FREE: {
    maxMonthlyCharacters: 10000,
    dailyLimit: 1000,
    voiceId: 'rPNcQ53R703tTmtue1AT',
    model: 'eleven_turbo_v2_5',
    outputFormat: 'mp3_22050_32'
  },
  BASIC: {
    maxMonthlyCharacters: 30000,
    dailyLimit: 3000,
    voiceId: 'rPNcQ53R703tTmtue1AT',
    model: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_64'
  },
  PREMIUM: {
    maxMonthlyCharacters: 100000,
    dailyLimit: 10000,
    voiceId: 'rPNcQ53R703tTmtue1AT',
    model: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128'
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      text,
      accessLevel = 'FREE',
      voiceId,
      model,
      outputFormat,
      stability = 0.5,
      similarityBoost = 0.8,
      style = 0.5,
      useSpeakerBoost = true
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Validate access level
    if (!ACCESS_LEVELS[accessLevel]) {
      return res.status(400).json({ error: 'Invalid access level' });
    }

    const limits = ACCESS_LEVELS[accessLevel];
    const textLength = text.length;

    // Basic length validation (more sophisticated usage tracking would be implemented with a database)
    if (textLength > limits.dailyLimit) {
      return res.status(429).json({
        error: 'Text too long for current access level',
        maxLength: limits.dailyLimit
      });
    }

    // Prepare request options
    const requestOptions = {
      text,
      modelId: model || limits.model,
      outputFormat: outputFormat || limits.outputFormat,
      voiceSettings: {
        stability,
        similarityBoost,
        style,
        useSpeakerBoost
      }
    };

    // Generate speech
    const audio = await client.textToSpeech.convert(
      voiceId || limits.voiceId,
      requestOptions
    );

    // Convert to buffer for response
    const buffer = Buffer.from(audio);

    // Set appropriate headers
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');

    // Send audio data
    res.status(200).send(buffer);

  } catch (error) {
    console.error('ElevenLabs API error:', error);

    // Handle different types of errors
    if (error.message.includes('quota')) {
      return res.status(429).json({
        error: 'API quota exceeded',
        message: 'Please upgrade your plan or try again later'
      });
    }

    if (error.message.includes('unauthorized')) {
      return res.status(401).json({
        error: 'API key invalid or unauthorized'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate speech'
    });
  }
}