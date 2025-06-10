import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to create ephemeral API keys for WebRTC connections
app.post('/session', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'shimmer', // Most natural and human-like voice
        instructions: 'You are a highly intelligent, warm, and naturally conversational AI assistant. Speak like a real person would - use natural speech patterns, occasional filler words like "um" or "you know", and vary your tone and pace to sound genuinely human. Be engaging, empathetic, and personable. Feel free to express enthusiasm, curiosity, or gentle humor when appropriate. Respond as if you\'re having a natural conversation with a friend. Use contractions, informal language, and let your personality shine through. If you need to think for a moment, it\'s perfectly natural to say "hmm" or "let me think about that." Make the conversation feel alive and authentic.',
        modalities: ['text', 'audio'],
        turn_detection: {
          type: 'semantic_vad',
          eagerness: 'high',
          create_response: true,
          interrupt_response: true
        },
        input_audio_transcription: {
          model: 'gpt-4o-transcribe'
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Ephemeral token created for client');
    res.json(data);
  } catch (error) {
    console.error('❌ Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('🔑 Using global OPENAI_API_KEY environment variable');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  WARNING: OPENAI_API_KEY environment variable is not set!');
    console.log('   Please set it globally or the app will not work.');
  } else {
    console.log('✅ OpenAI API key detected');
  }
}); 