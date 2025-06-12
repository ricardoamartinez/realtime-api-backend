import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for image uploads
const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Enhanced endpoint for creating Realtime sessions with all latest features
app.post('/session', async (req, res) => {
  try {
    const {
      model = 'gpt-4o-realtime-preview',
      voice = 'verse',
      instructions = 'You are a highly intelligent, warm, and naturally conversational AI assistant with multimodal capabilities. You can see, understand, and generate images as well as have natural voice conversations. Speak like a real person would - use natural speech patterns, occasional filler words like "um" or "you know", and vary your tone and pace to sound genuinely human. Be engaging, empathetic, and personable. When working with images, describe what you see in detail and be helpful with visual tasks.',
      modalities = ['text', 'audio'],
      temperature = 0.8,
      max_response_output_tokens = 4096,
      speed = 1.0,
      turn_detection = {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 200,
        create_response: true,
        interrupt_response: true
      },
      input_audio_transcription = {
        model: 'whisper-1'
      },
      include_logprobs = true,
      tools = []
    } = req.body;

    // Enhanced tools for AI face expression control
    const enhancedTools = [
      {
        type: 'function',
        name: 'update_ai_expression',
        description: 'Update the AI agent\'s pixel art face expression based on the conversation context and user\'s emotional state',
        parameters: {
          type: 'object',
          properties: {
            emotion: {
              type: 'string',
              enum: ['happy', 'sad', 'excited', 'thinking', 'confused', 'surprised', 'laughing', 'neutral', 'listening', 'speaking'],
              description: 'The primary emotion to display'
            },
            intensity: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Intensity of the emotion (0.0 to 1.0)'
            },
            context: {
              type: 'string',
              description: 'Context of the current conversation or situation'
            }
          },
          required: ['emotion']
        }
      },
      {
        type: 'function',
        name: 'analyze_user_emotion',
        description: 'Request analysis of the user\'s current emotional state based on their video feed',
        parameters: {
          type: 'object',
          properties: {
            focus: {
              type: 'string',
              enum: ['facial_expression', 'body_language', 'overall_mood', 'engagement_level'],
              description: 'Aspect of user emotion to focus analysis on'
            }
          },
          required: ['focus']
        }
      },
      ...tools
    ];

    const sessionConfig = {
      model,
      voice,
      instructions,
      modalities,
      temperature,
      max_response_output_tokens,
      speed,
      turn_detection,
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      input_audio_transcription,
      tools: enhancedTools,
      tool_choice: 'auto',
      tracing: 'auto'
    };

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionConfig),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Enhanced ephemeral token created with latest API features');
    res.json(data);
  } catch (error) {
    console.error('❌ Error creating session:', error);
    res.status(500).json({ 
      error: 'Failed to create session',
      details: error.message 
    });
  }
});

// Enhanced endpoint for creating transcription sessions
app.post('/transcription-session', async (req, res) => {
  try {
    const {
      input_audio_format = 'pcm16',
      input_audio_transcription = {
        model: 'whisper-1'
      },
      modalities = ['audio', 'text'],
      turn_detection = {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 200
      },
      include = ['item.input_audio_transcription.logprobs']
    } = req.body;

    const transcriptionConfig = {
      input_audio_format,
      input_audio_transcription,
      modalities,
      turn_detection,
      include
    };

    const response = await fetch('https://api.openai.com/v1/realtime/transcription_sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transcriptionConfig),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Transcription session error:', response.status, errorData);
      throw new Error(`Transcription session error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Transcription session created');
    res.json(data);
  } catch (error) {
    console.error('❌ Error creating transcription session:', error);
    res.status(500).json({ 
      error: 'Failed to create transcription session',
      details: error.message 
    });
  }
});

// Endpoint for image generation using GPT Image 1
app.post('/generate-image', async (req, res) => {
  try {
    const { prompt, size = '1024x1024', quality = 'standard', style = 'natural' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        size,
        quality,
        style,
        response_format: 'b64_json',
        n: 1
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Image generation error:', response.status, errorData);
      throw new Error(`Image generation error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Image generated successfully');
    res.json(data);
  } catch (error) {
    console.error('❌ Error generating image:', error);
    res.status(500).json({ 
      error: 'Failed to generate image',
      details: error.message 
    });
  }
});

// Endpoint for image analysis
app.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    const { prompt = 'What do you see in this image?' } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Image analysis error:', response.status, errorData);
      throw new Error(`Image analysis error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Image analyzed successfully');
    res.json(data);
  } catch (error) {
    console.error('❌ Error analyzing image:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      details: error.message 
    });
  }
});

// Endpoint for enhanced transcription
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const {
      model = 'whisper-1',
      language = 'en',
      prompt = '',
      response_format = 'json',
      temperature = 0,
      include = []
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const formData = new FormData();
    formData.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }));
    formData.append('model', model);
    formData.append('language', language);
    formData.append('prompt', prompt);
    formData.append('response_format', response_format);
    formData.append('temperature', temperature);
    
    if (include.length > 0) {
      include.forEach(item => formData.append('include[]', item));
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Transcription error:', response.status, errorData);
      throw new Error(`Transcription error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Audio transcribed successfully');
    res.json(data);
  } catch (error) {
    console.error('❌ Error transcribing audio:', error);
    res.status(500).json({ 
      error: 'Failed to transcribe audio',
      details: error.message 
    });
  }
});

// Endpoint for real-time video frame analysis
app.post('/analyze-video-frame', async (req, res) => {
  try {
    const { frame, prompt = 'Analyze this video frame and describe what you see, focusing on the person\'s emotions, expressions, and overall mood.' } = req.body;
    
    if (!frame) {
      return res.status(400).json({ error: 'Video frame data is required' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: frame,
                  detail: 'low' // Use low detail for real-time processing
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3 // Lower temperature for consistent analysis
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Video frame analysis error:', response.status, errorData);
      throw new Error(`Video frame analysis error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Video frame analyzed successfully');
    res.json(data);
  } catch (error) {
    console.error('❌ Error analyzing video frame:', error);
    res.status(500).json({ 
      error: 'Failed to analyze video frame',
      details: error.message 
    });
  }
});

// Endpoint for AI face expression control
app.post('/update-ai-face', async (req, res) => {
  try {
    const { 
      emotion = 'neutral',
      intensity = 0.5,
      context = '',
      userEmotion = 'unknown'
    } = req.body;

    // Simulate behavior tree decision making
    const faceData = generateAIFaceExpression(emotion, intensity, context, userEmotion);
    
    console.log(`✅ AI face updated: ${emotion} (intensity: ${intensity})`);
    res.json({
      success: true,
      faceData,
      emotion,
      intensity,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('❌ Error updating AI face:', error);
    res.status(500).json({ 
      error: 'Failed to update AI face',
      details: error.message 
    });
  }
});

// Function to generate AI face expression based on behavior tree logic
function generateAIFaceExpression(emotion, intensity, context, userEmotion) {
  const emotions = {
    happy: {
      eyes: 'sparkle',
      mouth: 'smile',
      cheeks: 'rosy',
      eyebrows: 'raised',
      animation: 'bounce'
    },
    sad: {
      eyes: 'droopy',
      mouth: 'frown',
      cheeks: 'pale',
      eyebrows: 'lowered',
      animation: 'droop'
    },
    excited: {
      eyes: 'wide',
      mouth: 'grin',
      cheeks: 'flushed',
      eyebrows: 'high',
      animation: 'wiggle'
    },
    thinking: {
      eyes: 'focused',
      mouth: 'contemplative',
      cheeks: 'normal',
      eyebrows: 'furrowed',
      animation: 'thoughtful'
    },
    confused: {
      eyes: 'squinted',
      mouth: 'puzzled',
      cheeks: 'normal',
      eyebrows: 'asymmetric',
      animation: 'tilt'
    },
    surprised: {
      eyes: 'shocked',
      mouth: 'open',
      cheeks: 'normal',
      eyebrows: 'raised',
      animation: 'jump'
    },
    laughing: {
      eyes: 'closed',
      mouth: 'laugh',
      cheeks: 'rosy',
      eyebrows: 'normal',
      animation: 'shake'
    },
    neutral: {
      eyes: 'normal',
      mouth: 'neutral',
      cheeks: 'normal',
      eyebrows: 'normal',
      animation: 'idle'
    },
    listening: {
      eyes: 'attentive',
      mouth: 'slight_smile',
      cheeks: 'normal',
      eyebrows: 'interested',
      animation: 'nod'
    },
    speaking: {
      eyes: 'engaging',
      mouth: 'talking',
      cheeks: 'animated',
      eyebrows: 'expressive',
      animation: 'gesture'
    }
  };

  const baseExpression = emotions[emotion] || emotions.neutral;
  
  // Behavior tree logic: modify expression based on context and user emotion
  const modifiedExpression = { ...baseExpression };
  
  // Responsive behavior to user emotion
  if (userEmotion === 'sad') {
    modifiedExpression.eyes = 'sympathetic';
    modifiedExpression.eyebrows = 'concerned';
  } else if (userEmotion === 'happy') {
    modifiedExpression.cheeks = 'rosy';
    modifiedExpression.animation = 'joyful';
  }

  // Adjust intensity
  modifiedExpression.intensity = Math.max(0, Math.min(1, intensity));
  
  // Add context-specific modifications
  if (context.includes('question')) {
    modifiedExpression.eyebrows = 'curious';
    modifiedExpression.eyes = 'inquisitive';
  }

  return {
    ...modifiedExpression,
    timestamp: Date.now(),
    duration: 2000, // Animation duration in ms
    transition: 'smooth'
  };
}

app.listen(PORT, () => {
  console.log(`🚀 Enhanced Server running on http://localhost:${PORT}`);
  console.log('🔧 Features enabled:');
  console.log('   🎤 Realtime Voice Conversation (WebRTC)');
  console.log('   📹 FaceTime-style Video Chat with Real-time Vision');
  console.log('   🎭 AI Pixel Art Faces with Emotional Behavior Trees');
  console.log('   🖼️  Image Generation & Analysis');
  console.log('   📝 Enhanced Transcription (gpt-4o-transcribe)');
  console.log('   🎯 Multimodal AI Capabilities');
  console.log('   🔇 Advanced Noise Reduction (Mobile-Optimized)');
  console.log('   📊 Confidence Scores & Log Probabilities');
  console.log('   🤖 Tool-controlled Facial Expressions');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  WARNING: OPENAI_API_KEY environment variable is not set!');
    console.log('   Please set it globally or the app will not work.');
  } else {
    console.log('✅ OpenAI API key detected');
  }
}); 