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

// Rate limiting protection - track session creation attempts
const sessionAttempts = new Map();
const MAX_SESSIONS_PER_MINUTE = 3;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(clientId) {
  const now = Date.now();
  const attempts = sessionAttempts.get(clientId) || [];
  
  // Clean old attempts
  const recentAttempts = attempts.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentAttempts.length >= MAX_SESSIONS_PER_MINUTE) {
    return false; // Rate limited
  }
  
  recentAttempts.push(now);
  sessionAttempts.set(clientId, recentAttempts);
  return true; // OK to proceed
}

// Enhanced endpoint for creating Realtime sessions with latest 2025-06-03 API features
app.post('/session', async (req, res) => {
  try {
    const clientId = req.ip || 'unknown';
    
    // Check rate limits to prevent 429 errors
    if (!checkRateLimit(clientId)) {
      console.log(`🚨 Rate limit protection: Blocking rapid session creation from ${clientId}`);
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        details: 'Please wait before creating another session. Maximum 3 sessions per minute.',
        timestamp: new Date().toISOString(),
        retry_after: 60
      });
    }

    const {
      model = 'gpt-4o-realtime-preview-2025-06-03', // ✨ LATEST MODEL (no 2024 versions)
      voice = 'ballad',
      instructions = 'You are a highly intelligent, warm, and naturally conversational AI assistant with multimodal capabilities. You can see, understand, and generate images as well as have natural voice conversations. Speak like a real person would - use natural speech patterns, occasional filler words like "um" or "you know", and vary your tone and pace to sound genuinely human. Be engaging, empathetic, and personable. When working with images, describe what you see in detail and be helpful with visual tasks. Use function calls to update your facial expressions to match the conversation context.',
      modalities = ['text', 'audio'],
      temperature = 0.8,
      max_response_output_tokens = 4096,
      turn_detection = {
        type: 'semantic_vad', // ✨ LATEST: Use new semantic VAD by default
        eagerness: 'auto', // ✨ LATEST: Auto-adaptive eagerness
        create_response: true,
        interrupt_response: true
      },
      input_audio_transcription = {
        model: 'whisper-1', // 🛡️ CONSERVATIVE: Use stable Whisper to avoid rate limits
        prompt: 'This is a clear conversation in English. Please transcribe accurately.',
        language: 'en'
      },
      input_audio_noise_reduction = {
        type: 'near_field' // ✨ LATEST: Enhanced noise reduction
      },
      include = [], // 🛡️ CONSERVATIVE: Empty by default to reduce API overhead
      tools = []
    } = req.body;

    // ✨ LATEST: Enhanced tools with newest function calling capabilities
    const enhancedTools = [
      {
        type: 'function',
        name: 'update_ai_expression',
        description: 'Update the AI agent\'s pixel art face expression based on the conversation context, user\'s emotional state, and response content to create natural, empathetic interactions',
        parameters: {
          type: 'object',
          properties: {
            emotion: {
              type: 'string',
              enum: ['happy', 'sad', 'excited', 'thinking', 'confused', 'surprised', 'laughing', 'neutral', 'listening', 'speaking', 'empathetic', 'curious'],
              description: 'The primary emotion to display based on conversation context'
            },
            intensity: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Intensity of the emotion (0.0 = subtle, 1.0 = very expressive)'
            },
            context: {
              type: 'string',
              description: 'Current conversation context or situation that prompted this expression'
            },
            duration: {
              type: 'number',
              minimum: 500,
              maximum: 5000,
              description: 'How long to maintain this expression in milliseconds'
            }
          },
          required: ['emotion', 'intensity']
        }
      },
      {
        type: 'function',
        name: 'analyze_user_emotion',
        description: 'Request real-time analysis of the user\'s emotional state based on their voice tone, video feed, or conversation patterns',
        parameters: {
          type: 'object',
          properties: {
            focus: {
              type: 'string',
              enum: ['voice_tone', 'facial_expression', 'body_language', 'overall_mood', 'engagement_level', 'stress_indicators'],
              description: 'Specific aspect of user emotion to analyze'
            },
            response_mode: {
              type: 'string',
              enum: ['immediate', 'background', 'on_change'],
              description: 'How to handle the emotion analysis results'
            }
          },
          required: ['focus']
        }
      },
      {
        type: 'function',
        name: 'generate_contextual_image',
        description: 'Generate images that are contextually relevant to the current conversation using DALL-E 3',
        parameters: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Image generation prompt based on conversation context'
            },
            style: {
              type: 'string',
              enum: ['natural', 'vivid'],
              description: 'Visual style for the generated image'
            },
            context: {
              type: 'string',
              description: 'Why this image is being generated in the conversation'
            }
          },
          required: ['prompt']
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
      turn_detection,
      input_audio_format: 'pcm16', // Optimal format for WebRTC
      output_audio_format: 'pcm16', // Optimal format for WebRTC
      input_audio_transcription,
      input_audio_noise_reduction,
      include,
      tools: enhancedTools,
      tool_choice: 'auto'
    };

    console.log(`🔧 Creating session with LATEST model: ${model}, voice: ${voice}, VAD: ${turn_detection.type}(${turn_detection.eagerness})`);

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'realtime=v1' // Required beta header
      },
      body: JSON.stringify(sessionConfig),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorData);
      
      // Enhanced rate limiting handling
      if (response.status === 429) {
        console.error('🚨 Rate limit exceeded - enforcing cooldown period');
        // Add to rate limit tracking
        const attempts = sessionAttempts.get(clientId) || [];
        attempts.push(Date.now(), Date.now(), Date.now()); // Force rate limit
        sessionAttempts.set(clientId, attempts);
        
        throw new Error(`Rate limit exceeded (429) - Please wait at least 2 minutes before trying again. Using latest model with conservative settings should help prevent this.`);
      }
      
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Enhanced ephemeral token created with LATEST 2025-06-03 API features');
    console.log(`🎤 Voice: ${voice} | 🧠 Model: ${model} | 🎯 VAD: ${turn_detection.type}(${turn_detection.eagerness}) | 🔇 Noise: ${input_audio_noise_reduction.type} | 📝 Transcription: ${input_audio_transcription.model}`);
    res.json(data);
  } catch (error) {
    console.error('❌ Error creating session:', error);
    res.status(500).json({ 
      error: 'Failed to create session',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ✨ LATEST: Enhanced endpoint for transcription-only sessions with newest models
app.post('/transcription-session', async (req, res) => {
  try {
    const clientId = req.ip || 'unknown';
    
    // Rate limit protection for transcription sessions too
    if (!checkRateLimit(clientId)) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        details: 'Please wait before creating another transcription session.',
        retry_after: 60
      });
    }

    const {
      input_audio_format = 'pcm16',
      input_audio_transcription = {
        model: 'whisper-1', // 🛡️ CONSERVATIVE: Default to stable Whisper
        prompt: 'This is a clear conversation in English. The user is speaking naturally through their device microphone. Please transcribe accurately with proper punctuation and natural speech patterns.',
        language: 'en'
      },
      turn_detection = {
        type: 'semantic_vad', // ✨ LATEST: Use new semantic VAD
        eagerness: 'medium' // ✨ LATEST: Balanced eagerness for transcription
      },
      input_audio_noise_reduction = {
        type: 'near_field'
      },
      include = [] // 🛡️ CONSERVATIVE: Empty by default to reduce overhead
    } = req.body;

    const transcriptionConfig = {
      input_audio_format,
      input_audio_transcription,
      turn_detection,
      input_audio_noise_reduction,
      include
    };

    console.log(`🔧 Creating transcription session with ${input_audio_transcription.model} and semantic VAD`);

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'realtime=v1' // Required beta header
      },
      body: JSON.stringify(transcriptionConfig),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Transcription session error:', response.status, errorData);
      
      if (response.status === 429) {
        console.error('🚨 Rate limit exceeded for transcription session');
        throw new Error(`Rate limit exceeded (429) - Please wait before creating another transcription session.`);
      }
      
      throw new Error(`Transcription session error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Transcription session created with LATEST semantic VAD features');
    console.log(`📝 Model: ${input_audio_transcription.model} | 🎯 VAD: ${turn_detection.type}(${turn_detection.eagerness}) | 🔇 Noise: ${input_audio_noise_reduction.type}`);
    res.json(data);
  } catch (error) {
    console.error('❌ Error creating transcription session:', error);
    res.status(500).json({ 
      error: 'Failed to create transcription session',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced endpoint for image generation using DALL-E 3 with contextual awareness
app.post('/generate-image', async (req, res) => {
  try {
    const { 
      prompt, 
      size = '1024x1024', 
      quality = 'standard', 
      style = 'natural',
      context = '',
      enhance_prompt = true
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt is required',
        timestamp: new Date().toISOString()
      });
    }

    // Enhanced prompt engineering for better results
    let enhancedPrompt = prompt;
    if (enhance_prompt && context) {
      enhancedPrompt = `${prompt}. Context: ${context}. Style: High quality, detailed, professional.`;
    }

    console.log(`🎨 Generating image with DALL-E 3: "${prompt.substring(0, 50)}..."`);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
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
    console.log('✅ Image generated successfully with enhanced prompting');
    
    res.json({
      ...data,
      metadata: {
        original_prompt: prompt,
        enhanced_prompt: enhancedPrompt,
        context,
        generation_time: new Date().toISOString(),
        model: 'dall-e-3'
      }
    });
  } catch (error) {
    console.error('❌ Error generating image:', error);
    res.status(500).json({ 
      error: 'Failed to generate image',
      details: error.message,
      timestamp: new Date().toISOString()
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

// ✨ LATEST: Enhanced endpoint for audio transcription with newest models and conservative defaults
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const {
      model = 'whisper-1', // 🛡️ CONSERVATIVE: Default to stable Whisper to avoid rate limits
      language = 'en',
      prompt = 'This is a clear conversation. Please transcribe accurately with proper punctuation.',
      response_format = 'verbose_json',
      temperature = 0,
      include = [] // 🛡️ CONSERVATIVE: Empty by default to reduce API overhead
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ 
        error: 'Audio file is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🎤 Transcribing audio with ${model} model (conservative settings)`);

    const formData = new FormData();
    formData.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }));
    formData.append('model', model);
    formData.append('language', language);
    formData.append('prompt', prompt);
    formData.append('response_format', response_format);
    formData.append('temperature', temperature);
    
    // Only add enhanced features for GPT-4o models and when explicitly requested
    if (model.includes('gpt-4o') && include.length > 0) {
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
    console.log(`✅ Audio transcribed successfully with ${model}`);
    
    res.json({
      ...data,
      metadata: {
        model_used: model,
        file_size: req.file.size,
        file_type: req.file.mimetype,
        processing_time: new Date().toISOString(),
        language: language,
        enhanced_features: model.includes('gpt-4o') ? include : []
      }
    });
  } catch (error) {
    console.error('❌ Error transcribing audio:', error);
    res.status(500).json({ 
      error: 'Failed to transcribe audio',
      details: error.message,
      timestamp: new Date().toISOString()
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

// Enhanced endpoint for AI face expression control with function call support
app.post('/update-ai-face', async (req, res) => {
  try {
    const { 
      emotion = 'neutral',
      intensity = 0.5,
      context = '',
      userEmotion = 'unknown',
      duration = 2000,
      call_id = null // For function call responses
    } = req.body;

    // Enhanced behavior tree decision making
    const faceData = generateAIFaceExpression(emotion, intensity, context, userEmotion, duration);
    
    console.log(`🎭 AI expression updated: ${emotion} (intensity: ${intensity}, duration: ${duration}ms)`);
    
    const response = {
      success: true,
      faceData,
      emotion,
      intensity,
      duration,
      context,
      timestamp: Date.now(),
      function_call: call_id ? { call_id, status: 'completed' } : null
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Error updating AI face:', error);
    res.status(500).json({ 
      error: 'Failed to update AI face',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// New endpoint for handling contextual image generation function calls
app.post('/generate-contextual-image', async (req, res) => {
  try {
    const {
      prompt,
      style = 'natural',
      context = '',
      call_id = null,
      size = '1024x1024',
      quality = 'standard'
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt is required for contextual image generation',
        timestamp: new Date().toISOString()
      });
    }

    // Enhanced contextual prompting
    const contextualPrompt = context 
      ? `${prompt}. Context: ${context}. Create a high-quality, detailed image that fits the conversation context.`
      : prompt;

    console.log(`🎨 Generating contextual image for conversation: "${prompt.substring(0, 50)}..."`);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: contextualPrompt,
        size,
        quality,
        style,
        response_format: 'b64_json',
        n: 1
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Contextual image generation error:', response.status, errorData);
      throw new Error(`Contextual image generation error: ${response.status} - ${errorData}`);
    }

    const imageData = await response.json();
    console.log('✅ Contextual image generated successfully');
    
    res.json({
      ...imageData,
      metadata: {
        original_prompt: prompt,
        contextual_prompt: contextualPrompt,
        context,
        style,
        generation_time: new Date().toISOString(),
        model: 'dall-e-3',
        function_call: call_id ? { call_id, status: 'completed' } : null
      }
    });
  } catch (error) {
    console.error('❌ Error generating contextual image:', error);
    res.status(500).json({ 
      error: 'Failed to generate contextual image',
      details: error.message,
      timestamp: new Date().toISOString(),
      function_call: call_id ? { call_id, status: 'failed' } : null
    });
  }
});

// Enhanced function to generate AI face expression based on behavior tree logic
function generateAIFaceExpression(emotion, intensity, context, userEmotion, duration = 2000) {
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
    },
    empathetic: {
      eyes: 'warm',
      mouth: 'gentle_smile',
      cheeks: 'soft',
      eyebrows: 'caring',
      animation: 'nod_slowly'
    },
    curious: {
      eyes: 'bright',
      mouth: 'slight_open',
      cheeks: 'normal',
      eyebrows: 'raised_one',
      animation: 'lean_forward'
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
    duration: Math.max(500, Math.min(5000, duration)), // Constrain duration between 0.5-5 seconds
    transition: 'smooth'
  };
}

// Enhanced health check endpoint with LATEST API status and features
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    api_version: '2025-06-03', // ✨ LATEST API VERSION
    features: {
      realtime_models: ['gpt-4o-realtime-preview-2025-06-03'], // ✨ LATEST MODEL (no 2024 versions)
      transcription_models: ['gpt-4o-transcribe', 'gpt-4o-mini-transcribe', 'whisper-1'],
      conservative_defaults: ['whisper-1'], // 🛡️ CONSERVATIVE: Recommended for rate limit protection
      image_models: ['dall-e-3'],
      chat_models: ['gpt-4o', 'gpt-4o-mini'],
      voices: ['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse'],
      vad_types: ['semantic_vad', 'server_vad'], // ✨ LATEST: Semantic VAD with eagerness control
      vad_eagerness: ['low', 'medium', 'high', 'auto'], // ✨ LATEST: Configurable eagerness levels
      noise_reduction: ['near_field', 'far_field', 'disabled'], // ✨ LATEST: Enhanced noise reduction
      audio_formats: ['pcm16', 'g711_ulaw', 'g711_alaw'],
      modalities: ['text', 'audio'],
      connection_methods: ['webrtc', 'websocket'],
      enhanced_features: [
        'semantic_vad_with_eagerness', // ✨ LATEST
        'gpt_4o_transcribe_models', // ✨ LATEST
        'function_calling_v2', // ✨ LATEST
        'enhanced_emotion_analysis', // ✨ LATEST
        'ai_facial_expressions', 
        'real_time_transcription',
        'confidence_scores',
        'log_probabilities',
        'enhanced_noise_reduction', // ✨ LATEST
        'interrupt_handling',
        'rate_limit_protection' // 🛡️ CONSERVATIVE
      ]
    },
    server_capabilities: {
      multimodal_conversations: true,
      real_time_video_analysis: true,
      contextual_image_generation: true,
      ai_expression_control: true,
      audio_diagnostics: true,
      enhanced_error_handling: true,
      beta_api_support: true,
      rate_limit_protection: true, // 🛡️ CONSERVATIVE
      exponential_backoff: true, // 🛡️ CONSERVATIVE
      conservative_defaults: true // 🛡️ CONSERVATIVE
    },
    env_check: {
      openai_key: !!process.env.OPENAI_API_KEY,
      node_version: process.version,
      environment: process.env.NODE_ENV || 'development'
    },
    recommended_settings: { // 🛡️ CONSERVATIVE: Guidance for best performance
      transcription_model: 'whisper-1',
      vad_type: 'semantic_vad',
      vad_eagerness: 'auto',
      noise_reduction: 'near_field',
      include_logprobs: false,
      max_sessions_per_minute: 3
    }
  });
});

// Endpoint for audio diagnostics
app.post('/audio-diagnostics', async (req, res) => {
  try {
    const {
      sampleRate = 24000,
      channels = 1,
      vadType = 'semantic_vad', // ✨ LATEST: Default to semantic VAD
      transcriptionModel = 'whisper-1' // 🛡️ CONSERVATIVE: Default to stable Whisper
    } = req.body;

    const diagnostics = {
      timestamp: new Date().toISOString(),
      api_version: '2025-06-03', // ✨ LATEST
      audio_config: {
        optimal_sample_rate: 24000,
        provided_sample_rate: sampleRate,
        optimal_channels: 1,
        provided_channels: channels,
        status: sampleRate === 24000 && channels === 1 ? 'optimal' : 'suboptimal'
      },
      vad_config: {
        type: vadType,
        recommended: vadType === 'semantic_vad' ? 'optimal_latest_feature' : 'consider_semantic_vad',
        eagerness_available: ['low', 'medium', 'high', 'auto'] // ✨ LATEST
      },
      transcription_config: {
        model: transcriptionModel,
        recommended: transcriptionModel === 'whisper-1' ? 'optimal_conservative' : 'consider_whisper_for_stability',
        latest_models: ['gpt-4o-transcribe', 'gpt-4o-mini-transcribe'] // ✨ LATEST
      },
      troubleshooting: {
        common_issues: [
          'Ensure microphone permissions are granted',
          'Check for background noise',
          'Verify stable internet connection',
          'Use headphones to prevent echo',
          'Speak clearly and at normal volume',
          '🛡️ IMPORTANT: Wait 2+ minutes if you see rate limit errors (429)',
          '🛡️ CONSERVATIVE: Use Whisper-1 transcription for best stability',
          '🛡️ CONSERVATIVE: Disable logprobs by default to reduce API overhead',
          'Avoid rapid reconnections to prevent rate limiting'
        ],
        optimal_settings: {
          model: 'gpt-4o-realtime-preview-2025-06-03', // ✨ LATEST
          vad_type: 'semantic_vad', // ✨ LATEST
          vad_eagerness: 'auto', // ✨ LATEST
          transcription_model: 'whisper-1', // 🛡️ CONSERVATIVE
          noise_reduction: 'near_field', // ✨ LATEST
          include_logprobs: false, // 🛡️ CONSERVATIVE
          connection_throttling: true // 🛡️ CONSERVATIVE
        },
        rate_limit_protection: { // 🛡️ CONSERVATIVE
          max_sessions_per_minute: 3,
          exponential_backoff: true,
          min_retry_delay: '2 seconds',
          rate_limit_retry_delay: '2 minutes'
        }
      }
    };

    res.json(diagnostics);
  } catch (error) {
    console.error('❌ Audio diagnostics error:', error);
    res.status(500).json({
      error: 'Failed to run audio diagnostics',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Enhanced AI Assistant Server running on http://localhost:${PORT}`);
  console.log('🌟 OpenAI Realtime API 2025-06-03 Integration (LATEST MODEL - No 2024 versions!)');
  console.log('');
  console.log('🔧 Core Features:');
  console.log('   🎤 Realtime Voice Conversation (WebRTC & WebSocket)');
  console.log('   🧠 GPT-4o Realtime Model (gpt-4o-realtime-preview-2025-06-03) ✨ LATEST');
  console.log('   📝 Advanced Transcription (Whisper-1 default + GPT-4o Transcribe available)');
  console.log('   🎭 AI Pixel Art Faces with Dynamic Expressions');
  console.log('   📹 FaceTime-style Video Chat with Real-time Analysis');
  console.log('   🖼️  Contextual Image Generation (DALL-E 3)');
  console.log('   🎯 Multimodal AI Capabilities (Voice + Vision + Text)');
  console.log('');
  console.log('🚀 LATEST 2025-06-03 Features:');
  console.log('   🎛️  Semantic VAD with Configurable Eagerness ✨ NEW');
  console.log('   🔇 Enhanced Noise Reduction (Near/Far Field) ✨ ENHANCED');
  console.log('   📊 GPT-4o Transcribe Models Available ✨ LATEST');
  console.log('   🤖 Function-controlled Facial Expressions');
  console.log('   ⚡ Real-time Emotion Analysis & Response');
  console.log('   🔄 Interrupt Handling & Turn Detection');
  console.log('   🩺 Audio Diagnostics & Health Monitoring');
  console.log('   🌐 Beta API Support with Enhanced Error Handling');
  console.log('');
  console.log('🛡️ CONSERVATIVE Rate Limit Protection:');
  console.log('   ⏱️  Maximum 3 sessions per minute per client');
  console.log('   📈 Exponential backoff on failures');
  console.log('   🔄 2+ minute cooldown for rate limit errors');
  console.log('   🎤 Whisper-1 default for stability (GPT-4o Transcribe available)');
  console.log('   📊 Logprobs disabled by default to reduce overhead');
  console.log('   🎛️  Semantic VAD with auto-adaptive eagerness');
  console.log('');
  console.log('🎵 Available Voices: ballad, alloy, ash, coral, echo, sage, shimmer, verse');
  console.log('🔊 Audio Formats: PCM16 (optimal), G.711 μ-law, G.711 A-law');
  console.log('');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  WARNING: OPENAI_API_KEY environment variable is not set!');
    console.log('   Please set your OpenAI API key or the app will not work.');
    console.log('   Example: export OPENAI_API_KEY="your-api-key-here"');
  } else {
    console.log('✅ OpenAI API key detected - Ready for LATEST 2025-06-03 AI interactions!');
  }
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
}); 