# 🎤🖼️📹 Enhanced AI Assistant - Voice & Vision (2025-06-03 LATEST)

✨ **LATEST OpenAI Realtime API Integration** with `gpt-4o-realtime-preview-2025-06-03` model, featuring conservative rate limiting, semantic VAD with configurable eagerness, and bulletproof 429 error protection.

A cutting-edge multimodal AI assistant that combines real-time voice conversation, contextual image generation/analysis, and FaceTime-style video chat with AI pixel art faces. Built with the **LATEST 2025-06-03 OpenAI Realtime API** and optimized for stability and rate limit protection.

## 🌟 What's New in v5.0.0 (2025-06-03 LATEST)

### ✨ LATEST API Features
- **🧠 gpt-4o-realtime-preview-2025-06-03** - The newest and most advanced model (no 2024 versions!)
- **🎯 Semantic VAD with Configurable Eagerness** - Smart voice activity detection with auto-adaptive settings
- **📝 GPT-4o Transcribe Models** - Latest transcription capabilities (gpt-4o-transcribe, gpt-4o-mini-transcribe)
- **🔇 Enhanced Noise Reduction** - Improved near/far field audio processing
- **🤖 Function Calling v2** - Enhanced AI expression control and contextual responses

### 🛡️ CONSERVATIVE Rate Limit Protection
- **⏱️ Maximum 3 sessions per minute** per client to prevent API overload
- **📈 Exponential backoff** on connection failures (2s → 4s → 8s → up to 60s)
- **🔄 2+ minute cooldown** for rate limit errors (429 responses)
- **🎤 Whisper-1 default transcription** for maximum stability (GPT-4o available but may trigger rate limits)
- **📊 Logprobs disabled by default** to reduce API overhead
- **🚫 Connection throttling** to prevent rapid reconnection attempts

### 🎛️ Optimized Defaults for Stability
- **Semantic VAD** as default (with auto-eagerness)
- **Whisper-1 transcription** for reliability
- **Near-field noise reduction** enabled
- **Conservative include settings** (no logprobs by default)
- **Enhanced error handling** with detailed troubleshooting

## 🚀 Core Features

### 🎤 Real-time Voice Conversation
- **WebRTC/WebSocket dual connectivity** for optimal performance
- **Semantic VAD with configurable eagerness** (low/medium/high/auto)
- **Multiple transcription models** (Whisper-1 recommended, GPT-4o available)
- **Enhanced noise reduction** (near-field/far-field options)
- **Real-time interrupt handling** with natural conversation flow
- **Conservative rate limiting** to prevent 429 errors

### 🖼️ Contextual Image Generation & Analysis
- **DALL-E 3 integration** with contextual prompting
- **Real-time image analysis** using GPT-4o vision
- **Multiple image formats** and sizes supported
- **Contextual generation** based on conversation flow

### 📹 FaceTime-style Video Chat
- **AI pixel art faces** with dynamic expressions
- **Real-time emotion analysis** and response
- **Function-controlled facial expressions** based on conversation context
- **Multiple face styles** (cute, professional, playful, expressive)
- **Configurable emotion responsiveness**

### 🎵 Enhanced Audio Features
- **24kHz audio processing** for optimal quality
- **Real-time audio visualization** with 24-bar spectrum
- **Advanced audio constraints** with echo cancellation
- **Multiple voice options** (8 voices: ballad, alloy, ash, coral, echo, sage, shimmer, verse)

## 🛠️ Setup & Installation

### Prerequisites
- **Node.js 18+** (required for ES modules)
- **OpenAI API key** with Realtime API access
- **Modern web browser** with WebRTC support

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ricardoamartinez/realtime-api-backend.git
   cd realtime-api-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set your OpenAI API key:**
   ```bash
   # Windows
   set OPENAI_API_KEY=your-api-key-here
   
   # Mac/Linux
   export OPENAI_API_KEY=your-api-key-here
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🛡️ Rate Limiting & Troubleshooting

### Common 429 "Too Many Requests" Issues

If you're experiencing persistent "❌ Transcription failed" with 429 errors, here's how to fix it:

#### ✅ RECOMMENDED Settings (Conservative)
- **Transcription Model:** `whisper-1` (most stable)
- **VAD Type:** `semantic_vad` (latest feature)
- **VAD Eagerness:** `auto` (adaptive)
- **Include Logprobs:** `disabled` (reduces API overhead)
- **Connection Frequency:** Max 3 sessions per minute

#### 🚫 AVOID These Settings (Aggressive)
- **Transcription Model:** `gpt-4o-transcribe` (may trigger rate limits)
- **Include Logprobs:** `enabled` (increases API calls)
- **Rapid reconnections** (triggers rate limiting)
- **Multiple simultaneous sessions**

#### 🔧 Troubleshooting Steps
1. **Wait 2+ minutes** after seeing 429 errors before reconnecting
2. **Use Whisper-1** instead of GPT-4o transcription models
3. **Disable confidence scores** (logprobs) in settings
4. **Check your OpenAI usage** dashboard for rate limit status
5. **Avoid rapid connect/disconnect cycles**

### Rate Limit Protection Features
- **Automatic cooldown periods** after rate limit detection
- **Exponential backoff** on connection failures
- **Session attempt tracking** (max 3 per minute)
- **Enhanced error messages** with specific guidance
- **Conservative defaults** out of the box

## ⚙️ Configuration Options

### Voice Settings
- **Voice Selection:** 8 premium voices (ballad recommended)
- **Speech Speed:** 0.25x - 1.5x adjustable
- **Temperature:** 0.6 - 1.2 (0.8 recommended)

### Audio Settings
- **VAD Type:** Semantic VAD (latest) or Server VAD (classic)
- **VAD Eagerness:** Auto/Low/Medium/High
- **Transcription:** Whisper-1 (stable) or GPT-4o (advanced)
- **Noise Reduction:** Near-field/Far-field/Disabled
- **Silence Duration:** 100-1000ms adjustable

### Advanced Features
- **Function Calling:** Enhanced v2 with expression control
- **Real-time Analysis:** Emotion detection and response
- **Image Generation:** Contextual DALL-E 3 integration
- **Debug Logging:** Comprehensive event tracking

## 📊 API Endpoints

### Session Management
- `POST /session` - Create enhanced Realtime session with latest features
- `POST /transcription-session` - Create transcription-only session
- `GET /health` - Health check with feature status

### Image Processing
- `POST /generate-image` - Generate contextual images with DALL-E 3
- `POST /analyze-image` - Analyze uploaded images with GPT-4o vision
- `POST /analyze-video-frame` - Real-time video frame analysis

### Audio Processing
- `POST /transcribe` - Enhanced audio transcription with multiple models
- `POST /audio-diagnostics` - Audio configuration diagnostics

### AI Features
- `POST /update-ai-face` - Control AI facial expressions
- `POST /generate-contextual-image` - Function-callable image generation

## 🔧 Environment Variables

```bash
OPENAI_API_KEY=your-openai-api-key    # Required: Your OpenAI API key
PORT=3000                             # Optional: Server port (default: 3000)
NODE_ENV=production                   # Optional: Environment mode
```

## 🎯 Best Practices for Stable Operation

### 🛡️ Rate Limit Prevention
1. **Use Whisper-1** for transcription (most stable)
2. **Disable logprobs** unless specifically needed
3. **Wait 2+ minutes** between reconnection attempts after errors
4. **Use semantic VAD** for better speech detection
5. **Monitor the debug logs** for rate limit warnings

### 🚀 Performance Optimization
1. **Enable noise reduction** for better audio quality
2. **Use near-field mode** for headset/mobile scenarios
3. **Adjust VAD eagerness** based on your speaking style
4. **Keep sessions under 30 minutes** (API limit)

### 🔒 Security Best Practices
1. **Use ephemeral tokens** for client connections (implemented)
2. **Don't expose API keys** in frontend code
3. **Implement proper CORS** for production deployment
4. **Monitor API usage** and costs regularly

## 🌐 Browser Compatibility

### ✅ Fully Supported
- **Chrome 88+** (recommended)
- **Firefox 85+**
- **Safari 14+**
- **Edge 88+**

### 📱 Mobile Support
- **iOS Safari 14+**
- **Android Chrome 88+**
- **Mobile-optimized** UI and controls

## 🚀 Deployment

### Production Deployment
1. **Set environment variables** appropriately
2. **Configure CORS** for your domain
3. **Use HTTPS** for WebRTC functionality
4. **Implement rate limiting** at the server level
5. **Monitor API usage** and costs

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Version History

### v5.0.0 (Latest - 2025-06-03)
- ✨ Updated to gpt-4o-realtime-preview-2025-06-03 (LATEST model)
- 🛡️ Implemented conservative rate limiting protection
- 🎯 Added semantic VAD with configurable eagerness
- 📝 Enhanced transcription with GPT-4o models (optional)
- 🔇 Improved noise reduction capabilities
- 📈 Exponential backoff on connection failures
- 🎤 Whisper-1 as stable default transcription
- 📊 Disabled logprobs by default for better performance

### v4.1.0 (Previous)
- Updated to 2024-12-17 model
- Added basic rate limiting
- Implemented semantic VAD
- Enhanced function calling

## 🆘 Support & Troubleshooting

### Getting Help
1. **Check the debug logs** in the browser console
2. **Review rate limiting guidance** above
3. **Verify API key permissions** in OpenAI dashboard
4. **Test with conservative settings** first

### Common Issues
- **"Transcription failed" errors:** Use Whisper-1, wait between connections
- **WebRTC connection fails:** Check browser permissions and HTTPS
- **AI not responding:** Verify API key and check rate limits
- **Poor audio quality:** Enable noise reduction, check microphone

### Debug Information
- Enable debug logging in the browser console
- Check `/health` endpoint for system status
- Monitor network requests for 429 errors
- Use `/audio-diagnostics` for audio troubleshooting

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for the incredible Realtime API and latest 2025-06-03 model
- **WebRTC community** for the real-time communication standards
- **Contributors** who help improve this project

---

**Built with ❤️ using the latest OpenAI Realtime API 2025-06-03 model**

🔗 **Repository:** https://github.com/ricardoamartinez/realtime-api-backend
🌟 **Give it a star** if you find it useful!

---

*For the most stable experience, use the recommended conservative settings: Whisper-1 transcription, semantic VAD, and disabled logprobs. These settings provide the best balance of features and reliability while minimizing rate limit issues.* 