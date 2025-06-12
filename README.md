# 🎤🖼️📹 Enhanced AI Assistant - OpenAI Realtime API 2024-12-17

A cutting-edge real-time AI assistant featuring voice conversations, video analysis, image generation, and AI facial expressions. Built with the latest OpenAI Realtime API (2024-12-17) featuring semantic VAD, enhanced function calling, and multimodal capabilities.

## ✨ Latest Features (2024-12-17)

### 🚀 Core Capabilities
- **Real-time Voice Conversations** with GPT-4o Realtime model (`gpt-4o-realtime-preview-2024-12-17`)
- **Semantic VAD** with eagerness control for natural conversation flow
- **Enhanced Transcription** using `gpt-4o-transcribe` with confidence scores
- **FaceTime-style Video Chat** with real-time emotion analysis
- **AI Pixel Art Faces** with dynamic emotional expressions
- **Contextual Image Generation** using DALL-E 3
- **Advanced Function Calling** for interactive AI behaviors

### 🎛️ Advanced Audio Features
- **Semantic VAD** - AI understands when you're finished speaking
- **Server VAD** - Traditional silence-based voice detection
- **Noise Reduction** - Near-field and far-field optimization
- **Multiple Audio Formats** - PCM16 (optimal), G.711 μ-law, G.711 A-law
- **Interrupt Handling** - Natural conversation interruptions
- **Confidence Scores** - Real-time transcription accuracy metrics

### 🎭 AI Expression System
- **Dynamic Facial Expressions** - 12 emotion types with intensity control
- **Behavior Trees** - Context-aware expression selection
- **Real-time Adaptation** - Expressions match conversation context
- **Function-controlled** - AI can update its own face during conversation

### 🔊 Available Voices
- **ballad** - Melodic & smooth (default)
- **alloy** - Balanced & clear
- **ash** - Deep & resonant
- **coral** - Warm & friendly
- **echo** - Professional & confident
- **sage** - Wise & calming
- **shimmer** - Bright & energetic
- **verse** - Expressive & dynamic

## 🛠️ Setup & Installation

### Prerequisites
- **Node.js** 18.0.0 or higher
- **OpenAI API Key** with access to Realtime API
- **Modern Browser** supporting WebRTC

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/realtime-api-backend.git
   cd realtime-api-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Windows (PowerShell)
   $env:OPENAI_API_KEY="your-openai-api-key-here"
   
   # macOS/Linux
   export OPENAI_API_KEY="your-openai-api-key-here"
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## 🎮 Usage Guide

### Getting Started
1. **Health Check** - Visit `/health` to verify API configuration
2. **Connect** - Click "🚀 Connect" to establish WebRTC connection
3. **Start Voice** - Click "🎤 Start Voice" to begin conversation
4. **Adjust Settings** - Use the settings panel for voice, VAD, and audio preferences

### Settings Optimization

#### For Best Performance
- **Voice**: `ballad` (default) or `echo` for clarity
- **VAD Type**: `semantic_vad` with `auto` eagerness
- **Transcription**: `gpt-4o-transcribe` for accuracy
- **Noise Reduction**: `near_field` for close microphones

#### For Mobile Devices
- **VAD Type**: `server_vad` for stability
- **Noise Reduction**: `far_field` for built-in microphones
- **Voice**: `coral` or `sage` for mobile speakers

### Advanced Features

#### Function Calling
The AI can call functions to:
- Update facial expressions based on conversation
- Generate contextual images
- Analyze user emotions
- Control interaction behaviors

#### Image Generation
- **Contextual**: AI generates images relevant to conversation
- **Manual**: Use the image generation panel
- **Styles**: Natural or vivid rendering options

#### Video Analysis
- **Real-time**: Continuous emotion and expression analysis
- **Frame-by-frame**: Upload images for detailed analysis
- **Privacy**: All processing respects user privacy settings

## 🔧 API Endpoints

### Core Endpoints
- `POST /session` - Create enhanced Realtime session
- `POST /transcription-session` - Create transcription-only session
- `GET /health` - Comprehensive system status

### Media Endpoints
- `POST /generate-image` - Enhanced DALL-E 3 generation
- `POST /analyze-image` - GPT-4o vision analysis
- `POST /transcribe` - Advanced audio transcription
- `POST /analyze-video-frame` - Real-time video analysis

### AI Control Endpoints
- `POST /update-ai-face` - Function-controlled expressions
- `POST /generate-contextual-image` - Conversation-aware generation
- `POST /audio-diagnostics` - Audio performance analysis

## ⚙️ Configuration Options

### Session Configuration
```javascript
{
  model: 'gpt-4o-realtime-preview-2024-12-17',
  voice: 'ballad',
  modalities: ['text', 'audio'],
  turn_detection: {
    type: 'semantic_vad',
    eagerness: 'auto',
    create_response: true,
    interrupt_response: true
  },
  input_audio_transcription: {
    model: 'gpt-4o-transcribe',
    language: 'en'
  },
  input_audio_noise_reduction: {
    type: 'near_field'
  }
}
```

### VAD Configuration
- **Semantic VAD**: Understands conversation context
  - `eagerness`: `low` | `medium` | `high` | `auto`
- **Server VAD**: Traditional silence detection
  - `threshold`: 0.0-1.0 (sensitivity)
  - `silence_duration_ms`: Milliseconds of silence required

## 🎭 AI Expression Types

| Emotion | Description | Use Case |
|---------|-------------|----------|
| `happy` | Joyful with sparkly eyes | Positive responses |
| `excited` | High energy with wide eyes | Enthusiasm |
| `thinking` | Contemplative expression | Processing questions |
| `confused` | Asymmetric eyebrows | Clarification needed |
| `empathetic` | Warm, caring expression | Emotional support |
| `curious` | Bright eyes, one raised eyebrow | Asking questions |
| `listening` | Attentive expression | User speaking |
| `speaking` | Animated expression | AI responding |

## 🔧 Troubleshooting

### Common Issues

#### ⚠️ Rate Limiting (MOST COMMON)
```
❌ Transcription failed - 429 Too Many Requests
⚠️ OpenAI Rate Limit Reached
```
**✅ SOLUTION (Automated):**
- System automatically detects and handles rate limits
- Auto-disconnects to prevent further issues
- Wait 2-3 minutes before reconnecting
- Use pre-configured stable settings (Server VAD + Whisper-1)

**Manual Steps if Needed:**
1. Wait 2-3 minutes minimum
2. Ensure VAD Type: "Server VAD (Classic)"
3. Ensure Transcription: "Whisper-1 (Classic)"
4. Uncheck "Confidence scores" checkbox
5. Avoid rapid reconnections

#### Connection Problems
```
⚠️ Connection failed
```
- Verify OpenAI API key is set correctly
- Check internet connection
- Ensure browser supports WebRTC
- Wait if you recently hit rate limits

#### Audio Issues (After Rate Limits Are Resolved)
```
❌ Transcription failed - please speak more clearly
```
- Adjust microphone closer to mouth
- Reduce background noise
- Check microphone permissions
- Try different VAD settings

#### Performance Issues
- Use `server_vad` (default) instead of `semantic_vad` 
- Use `whisper-1` (default) instead of GPT-4o models
- Reduce `max_response_output_tokens` for faster responses
- Use `near_field` noise reduction for better performance

### Browser Compatibility
- ✅ Chrome 88+
- ✅ Firefox 84+
- ✅ Safari 14.1+
- ✅ Edge 88+

## 🌟 Advanced Features

### Real-time Emotion Analysis
The system continuously analyzes:
- Voice tone and inflection
- Facial expressions (when video enabled)
- Conversation patterns
- Engagement levels

### Contextual AI Behaviors
- **Adaptive Responses**: AI adjusts personality based on user mood
- **Expression Matching**: Facial expressions reflect conversation tone
- **Proactive Generation**: AI suggests relevant images or actions

### Privacy & Security
- **Ephemeral Tokens**: Secure client-side authentication
- **No Data Storage**: Real-time processing without persistence
- **User Control**: Complete control over audio/video permissions

## 📱 Mobile Optimization

### Recommended Settings
```javascript
{
  turn_detection: {
    type: 'server_vad',
    threshold: 0.3,
    silence_duration_ms: 1500
  },
  input_audio_noise_reduction: {
    type: 'far_field'
  }
}
```

### Performance Tips
- Use wired headphones for best audio quality
- Enable airplane mode + WiFi to reduce interference
- Close other apps for better performance
- Use landscape orientation for video features

## ⚠️ **IMPORTANT: Rate Limiting Solution Implemented**

**✅ FIXED:** This version includes comprehensive solutions for OpenAI rate limiting issues that were affecting transcription reliability.

### 🛠️ **Rate Limit Protection Features:**
- **Smart Detection:** Automatically detects 429 rate limit errors
- **Auto-Disconnect:** Prevents further API calls when rate limited
- **Connection Throttling:** Enforces wait times between reconnection attempts
- **Optimal Defaults:** Uses Server VAD + Whisper-1 for maximum reliability
- **Clear Guidance:** Provides actionable solutions when rate limits occur

### 🎯 **Recommended Settings (Pre-configured):**
- **VAD Type:** Server VAD (Classic) ⚡ Reliable
- **Transcription:** Whisper-1 (Classic) ⚡ Stable  
- **Confidence Scores:** Disabled (reduces API calls)
- **Connection:** Wait 2-3 minutes between reconnects

## 🔄 Version History

### v4.1.0 (Latest) - December 2024 🚀
- **MAJOR FIX:** Resolved OpenAI 429 rate limiting errors
- Added intelligent rate limit detection and auto-disconnect
- Updated to stable defaults (Server VAD + Whisper-1)
- Enhanced error handling with specific guidance
- Improved user experience with actionable solutions
- Added connection throttling to prevent rapid reconnects

### v4.0.0 - December 2024
- Updated to OpenAI Realtime API 2024-12-17
- Added semantic VAD with eagerness control
- Enhanced function calling capabilities
- Improved error handling with event IDs
- Added contextual image generation
- Enhanced AI facial expression system

### v3.0.0 - Previous Release
- Basic Realtime API integration
- WebRTC voice conversations
- Image generation and analysis
- Basic AI facial expressions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/health` endpoint for system status
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

## 🔮 Roadmap

- [ ] Multi-language support
- [ ] Advanced emotion detection models
- [ ] Custom voice training
- [ ] Plugin system for extensions
- [ ] WebSocket implementation
- [ ] Mobile app versions

---

**Built with ❤️ using OpenAI's latest Realtime API (2024-12-17)** 