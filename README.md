# 🎤🖼️ Enhanced AI Assistant - Voice & Vision

A comprehensive multimodal AI application powered by OpenAI's latest APIs. Features real-time voice conversation, image generation & analysis, advanced transcription with GPT-4o Transcribe, and a modern responsive UI with extensive customization options.

## ✨ Features

### 🎤 Voice Conversation
- **🎯 WebRTC Connection**: Direct peer-to-peer connection to OpenAI for optimal audio quality
- **🗣️ Real-time Voice Conversation**: Natural speech-to-speech interaction with GPT-4o
- **⚡ Interruption Support**: Interrupt the AI mid-response for natural conversation flow
- **📝 Advanced Transcription**: Real-time transcription using GPT-4o-transcribe, GPT-4o-mini-transcribe, or Whisper-1
- **👂 Enhanced Voice Activity Detection**: Configurable VAD threshold and silence duration
- **🎵 Audio Visualization**: Beautiful real-time visual feedback of voice input
- **🎭 Complete Voice Selection**: Choose from 11 different AI voice personalities

### 🖼️ Image Capabilities
- **🎨 Image Generation**: DALL-E 3 powered image creation with customizable size and style
- **🔍 Image Analysis**: Upload and analyze images with GPT-4o vision capabilities
- **📱 Dual View Interface**: Toggle between conversation and image gallery views
- **💾 Download Support**: Save generated images directly to your device
- **🖼️ Image History**: Keep track of all generated images and analyses

### 📹 FaceTime-Style Video Chat
- **👁️ Real-time Vision**: Camera feed with live emotion detection using GPT-4o Vision
- **🎭 AI Pixel Art Faces**: Cute animated pixel art faces with emotional expressions
- **🧠 Behavior Tree System**: Intelligent emotional state management and reactions
- **😊 Emotion Mirroring**: AI can mirror user's detected emotions when enabled
- **🎯 Context-Aware Expressions**: AI face reacts to conversation content and tone
- **🎨 Multiple Face Styles**: Choose from Cute, Professional, Playful, or Super Expressive
- **📊 Real-time Analytics**: Live emotion analysis with confidence scores
- **🔄 Dynamic Responsiveness**: Adjustable emotion sensitivity and behavior settings

### ⚙️ Advanced Settings
- **🎛️ Real-time Controls**: Adjust all settings without disconnecting
- **🎯 Speech Speed Control**: Fine-tune AI speaking speed (0.25x - 1.5x)
- **🌡️ Temperature Control**: Adjust AI creativity and randomness (0.6 - 1.2)
- **🎤 VAD Threshold**: Customize voice detection sensitivity
- **⏱️ Silence Duration**: Control how long to wait before processing speech
- **📊 Confidence Scores**: Enable log probabilities for transcription confidence
- **🔇 Noise Reduction**: Advanced near-field noise reduction

### 🎨 Modern UI & UX
- **🌈 Glass-Morphism Design**: Modern translucent design with backdrop blur
- **📊 Crystal-clear Status**: Multi-indicator system showing all connection states
- **📱 Responsive Layout**: Optimized for desktop, tablet, and mobile
- **🎵 Enhanced Visualizer**: 24-bar audio visualization with gradient styling
- **🔄 Smooth Transitions**: Animated interactions and state changes

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- OpenAI API key with Realtime API access
- Modern browser with WebRTC support

### Installation

1. **Clone and setup:**
   ```bash
   git clone <your-repo-url>
   cd realtime-api-backend
   npm install
   ```

2. **Set your OpenAI API key globally:**
   ```bash
   # Windows (PowerShell)
   $env:OPENAI_API_KEY="your-api-key-here"
   
   # Windows (Command Prompt)
   set OPENAI_API_KEY=your-api-key-here
   
   # macOS/Linux
   export OPENAI_API_KEY="your-api-key-here"
   ```

3. **Start the application:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - Click "🚀 Connect" to start voice conversation
   - Use "🎨 Generate Image" for image creation
   - Upload images for analysis with "🔍 Analyze Image"
   - Click "📹 Start Video Chat" for FaceTime-style interaction with AI pixel faces

## 🎯 How It Works

### Enhanced Architecture

```
Browser Client ←→ Express Server → OpenAI APIs
     ↑               ↑              ↑
  WebRTC          Multimodal     Session Management
  Connection      Endpoints      Image Processing
     ↓               ↓              ↓
Voice Realtime ←→ Image Gen ←→ Image Analysis
     API           DALL-E 3      GPT-4o Vision
```

### API Endpoints

- **`POST /session`**: Create enhanced realtime sessions with full configuration
- **`POST /transcription-session`**: Create dedicated transcription sessions
- **`POST /generate-image`**: Generate images using DALL-E 3
- **`POST /analyze-image`**: Analyze uploaded images with GPT-4o vision
- **`POST /transcribe`**: Enhanced audio transcription with confidence scores
- **`POST /analyze-video-frame`**: Real-time video frame emotion analysis with GPT-4o Vision
- **`POST /update-ai-face`**: Control AI pixel art facial expressions via behavior trees

## 🎛️ Advanced Configuration

### 🎭 Voice Settings
- **AI Voices**: 11 unique personalities including the latest additions:
  - 🎪 Alloy - Balanced & Professional
  - 🌋 Ash - Rich & Warm  
  - 🎼 Ballad - Smooth & Musical
  - 🌊 Coral - Bright & Energetic
  - 📢 Echo - Rich & Resonant
  - 📚 Fable - Storytelling & Narrative
  - ⚫ Onyx - Deep & Authoritative
  - ⭐ Nova - Young & Energetic
  - 🧙‍♂️ Sage - Wise & Calm
  - ✨ Shimmer - Light & Airy
  - 🎭 Verse - Most Human-like (Default)

### 🎤 Audio Settings
- **VAD Threshold**: 0.1 (Sensitive) - 0.9 (Conservative)
- **Silence Duration**: 100ms - 1000ms for speech end detection
- **Transcription Models**:
  - 🎯 GPT-4o Transcribe (Latest, most accurate)
  - ⚡ GPT-4o Mini Transcribe (Fast, efficient)
  - 🔄 Whisper-1 (Classic, reliable)

### 🖼️ Image Settings
- **Generation Sizes**: Square (1024x1024), Portrait (1024x1792), Landscape (1792x1024)
- **Styles**: Natural (photorealistic) or Vivid (enhanced colors and contrast)
- **Analysis Detail**: High-resolution image understanding with GPT-4o vision

### 📹 FaceTime Video Settings
- **AI Face Styles**: 
  - 🥰 Cute & Friendly (Default)
  - 👔 Professional
  - 🎮 Playful
  - 🎭 Super Expressive
- **Emotion Responsiveness**: 0.1 (Subtle) - 1.0 (Intense) sensitivity control
- **Real-time Analysis**: Toggle live emotion detection from camera feed
- **Face Mirroring**: AI mirrors user's detected facial expressions
- **Context-Aware Expressions**: AI face reacts to conversation content and keywords
- **Behavior Tree Controls**: Intelligent emotional state management system

### ⚙️ Performance Settings
- **Speech Speed**: 0.25x (Very Slow) - 1.5x (Very Fast)
- **Temperature**: 0.6 (Focused) - 1.2 (Creative)
- **Response Tokens**: Up to 4096 tokens per response
- **Noise Reduction**: Near-field optimization for clear audio

## 📊 Enhanced Status System

### 🔗 Connection Status
- 🔴 **Disconnected** → 🟡 **Connecting** → 🟢 **Connected**

### 🎤 Microphone Status
- ⚫ **Inactive** → 🟢 **Recording** → 🔴 **Error**

### 🤖 AI Status
- ⚫ **Idle** → 🟣 **Generating** → 🟢 **Ready**

## 🎨 UI Features

### 🌈 Modern Design
- Glass-morphism cards with backdrop blur
- Gradient backgrounds and smooth animations
- Interactive hover effects and scaling
- Beautiful slider controls with gradient thumbs

### 📱 Responsive Interface
- **Desktop**: Multi-panel layout with extensive controls
- **Tablet**: Optimized two-column layout
- **Mobile**: Collapsible single-column design

### 🖼️ Image Gallery
- **Generated Images**: View all AI-created images with metadata
- **Analysis Results**: Display uploaded images with AI analysis
- **Download Support**: Save images with one click
- **Clear Controls**: Manage image history easily

## 🔧 Technical Implementation

### WebRTC Enhancements
- Direct peer-to-peer audio streaming
- Enhanced session configuration with all latest parameters
- Real-time setting updates without reconnection
- Comprehensive error handling and recovery

### Image Processing
- Multi-format support (PNG, JPEG, WEBP, GIF)
- High-resolution analysis with GPT-4o vision
- Base64 encoding for efficient transfer
- 50MB file size limit with proper validation

### Advanced Transcription
- Multiple model support with seamless switching
- Confidence score display when available
- Language detection and optimization
- Streaming transcription support

### FaceTime Video System
- Real-time camera access with emotion detection every 2 seconds
- Pixel art face engine with 16x16 grid-based rendering
- Behavior tree system for intelligent emotional responses
- WebRTC integration for synchronized audio/video experience
- Canvas-based pixel art with crisp rendering and smooth animations

## 🌐 Browser Compatibility

- **Chrome/Edge**: Full support including latest WebRTC features ✅
- **Firefox**: Complete multimodal support ✅
- **Safari**: WebRTC and image features (HTTPS required) ✅

## 🔒 Security & Performance

- **Ephemeral Tokens**: Short-lived API keys for maximum security
- **File Validation**: Secure image upload with type and size checking
- **Error Handling**: Graceful degradation and user feedback
- **Performance**: Optimized for real-time audio and image processing

## 🚀 Deployment

### Local Development
```bash
npm start
# Server: http://localhost:3000
# Full multimodal capabilities available
```

### Production Checklist
- Set `OPENAI_API_KEY` environment variable
- Enable HTTPS for WebRTC and secure file uploads
- Configure proper CORS for image endpoints
- Add rate limiting for API endpoints
- Set up CDN for image delivery (optional)

## 🛠️ Troubleshooting

### Connection Issues
- Verify OpenAI API key has Realtime API access
- Check browser WebRTC support and permissions
- Ensure HTTPS in production environments

### Image Problems
- Verify file formats (PNG, JPEG, WEBP, GIF)
- Check file size (max 50MB)
- Ensure stable internet for large uploads

### Audio Quality
- Use high-quality microphone
- Enable noise reduction settings
- Adjust VAD threshold for your environment

## 📁 Enhanced Project Structure

```
realtime-api-backend/
├── server.js                    # Enhanced Express server with multimodal endpoints
├── package.json                 # Updated dependencies including multer
├── public/
│   ├── index.html              # Comprehensive multimodal UI
│   └── realtime-webrtc-client.js # Enhanced WebRTC client with all features
└── README.md                   # This documentation
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test all multimodal features thoroughly  
5. Submit a pull request

---

**Built with ❤️ using OpenAI's Realtime API, DALL-E 3, GPT-4o Vision, and WebRTC** 