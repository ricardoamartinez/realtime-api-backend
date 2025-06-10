# 🎤 AI Voice Assistant - OpenAI Realtime API (WebRTC)

A stunning real-time voice conversation application powered by OpenAI's GPT-4o Realtime API. Features natural voice-to-voice conversation with interruption capabilities, live transcription, and beautiful shadCN-style UI.

## ✨ Features

- **🎯 WebRTC Connection**: Direct peer-to-peer connection to OpenAI for optimal audio quality
- **🗣️ Real-time Voice Conversation**: Natural speech-to-speech interaction with GPT-4o
- **⚡ Interruption Support**: Interrupt the AI mid-response for natural conversation flow
- **📝 Live Transcription**: Real-time transcription of both user and AI speech using GPT-4o-transcribe
- **👂 Voice Activity Detection**: Semantic VAD with configurable eagerness levels
- **🎵 Audio Visualization**: Beautiful real-time visual feedback of voice input
- **🎭 Multiple AI Voices**: Choose from 8 different AI voice personalities
- **🎨 Modern UI**: Glass-morphism design with shadCN styling and animated gradients
- **📊 Crystal-clear Status**: 4-indicator grid showing every aspect of the conversation

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
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
   - Click "🚀 Connect to AI"
   - Allow microphone access
   - Start speaking!

## 🎯 How It Works

### Architecture (WebRTC)

```
Browser Client ←→ Express Server → OpenAI Session API
     ↑               ↑                    ↑
  WebRTC          Ephemeral            Session
  Direct         Token Request        Management
  Connection
     ↓
OpenAI Realtime API
```

1. **Token Request**: Browser requests ephemeral token from Express server
2. **WebRTC Setup**: Browser establishes direct WebRTC connection to OpenAI
3. **Audio Streaming**: Real-time audio streamed directly via WebRTC peer connection
4. **Event Handling**: Real-time events handled via WebRTC data channel

### Key Components

- **`server.js`**: Express server providing ephemeral tokens (no WebSocket proxy needed!)
- **`public/index.html`**: Stunning glass-morphism UI with shadCN design patterns
- **`public/realtime-webrtc-client.js`**: Full WebRTC client following OpenAI documentation
- **`package.json`**: Minimal dependencies (no WebSocket library needed)

## 🎛️ Configuration Options

### 🎭 Voice Settings
- **AI Voice**: 8 personalities with emojis and descriptions
  - 🎪 Alloy - Balanced & Clear
  - 🌋 Ash - Deep & Warm  
  - 🎼 Ballad - Smooth & Musical
  - 🌊 Coral - Bright & Energetic
  - 📢 Echo - Rich & Resonant
  - 🧙‍♂️ Sage - Wise & Calm
  - ✨ Shimmer - Light & Airy
  - 📚 Verse - Natural & Conversational

### ⚡ Response Speed
- 🐌 **Slow**: Let me finish talking completely
- ⚖️ **Medium**: Balanced timing
- ⚡ **Fast**: Quick, responsive replies
- 🧠 **Auto**: Smart conversation timing

### 🚦 Interruption Control
- Toggle ability to interrupt AI responses
- Real-time setting updates without reconnection

## 📊 Crystal-Clear Status System

### 🔗 Connection Status
- 🔴 **Red**: Disconnected → 🟡 **Yellow**: Connecting → 🟢 **Green**: Connected

### 🎤 Microphone Status  
- ⚫ **Gray**: Inactive → 🟢 **Green**: Recording → 🔴 **Red**: Error

### 👂 Voice Detection
- 🟢 **Green**: Listening → 🔵 **Blue**: You're speaking → 🟡 **Yellow**: Processing

### 🤖 AI Response
- ⚫ **Gray**: Idle → 🟣 **Purple**: Thinking → 🟢 **Green**: Ready

Each indicator shows both status color AND plain English description!

## 🎨 Beautiful UI Features

### 🌈 Glass-Morphism Design
- Gradient animated background
- Glass cards with backdrop blur
- Modern shadCN color scheme
- Smooth hover animations and scaling

### 📱 Responsive Layout
- **Desktop**: 4-column grid with sidebar settings
- **Tablet**: 2-column responsive layout  
- **Mobile**: Single column with collapsible panels

### 🎵 Audio Visualizer
- 30 animated bars showing real-time voice levels
- Purple-to-pink gradient styling
- Smooth transitions and animations

### 💬 Chat Panels
- **Your Speech**: Blue-themed with live transcription
- **AI Response**: Green-themed with timestamps
- Live vs. final message differentiation
- Auto-scroll and message history

### ⚙️ Settings Panel
- Beautiful dropdown selectors with emojis
- Real-time setting application
- Connection info display
- Debug logs with color coding

## 🔧 WebRTC Implementation

### Session Management
- Ephemeral API keys for secure direct connection
- WebRTC peer connection with OpenAI servers
- Real-time session updates via data channel

### Audio Processing
- **Input**: getUserMedia with echo cancellation and noise suppression
- **Output**: Remote media stream from OpenAI
- **Visualization**: AudioContext with frequency analysis
- **Format**: 24kHz PCM16 for optimal quality

### Event Handling
- Real-time events via WebRTC data channel
- Speech detection and transcription events
- Response generation and completion events
- Comprehensive error handling and reconnection

## 🌐 Browser Compatibility

- **Chrome/Edge**: Full WebRTC support ✅ (Recommended)
- **Firefox**: Full WebRTC support ✅  
- **Safari**: WebRTC support ✅ (HTTPS required in production)

## 🔒 Security Features

- **Ephemeral Keys**: Short-lived tokens (1 minute expiry)
- **Server-side API Management**: Main API key never exposed to client
- **Direct WebRTC**: No proxy server needed for audio data
- **HTTPS Ready**: Secure connections for production

## 🚀 Deployment

### Local Development
```bash
npm start
# Server: http://localhost:3000
# No WebSocket server needed!
```

### Production
1. Set `OPENAI_API_KEY` environment variable
2. Enable HTTPS for WebRTC compatibility  
3. Configure proper CORS if needed
4. Optional: Add rate limiting for `/session` endpoint

## 📝 API Reference

### Server Endpoints
- `POST /session`: Create ephemeral OpenAI API keys for WebRTC
- `GET /`: Serve static web application

### WebRTC Events (via Data Channel)
- `session.update`: Update voice and behavior settings
- `input_audio_buffer.*`: Voice activity detection events
- `conversation.item.*`: Transcription events  
- `response.*`: AI response and audio events

## 🛠️ Troubleshooting

### Common Issues

1. **WebRTC connection fails**:
   - Ensure valid OpenAI API key
   - Check browser WebRTC support
   - Try HTTPS in production

2. **Microphone access denied**:
   - Check browser permissions
   - Ensure HTTPS for production
   - Try refreshing the page

3. **Audio quality issues**:
   - Check microphone settings
   - Ensure stable internet connection
   - Try different browser

4. **"Cannot set properties of undefined" error**:
   - ✅ Fixed! All DOM elements properly initialized
   - WebRTC client handles missing elements gracefully

## 🎉 What's New in WebRTC Version

- ✅ **Fixed DOM errors**: All elements properly handled
- 🚀 **Better performance**: Direct connection, no proxy overhead
- 🎨 **Beautiful UI**: Complete shadCN redesign with glass-morphism
- 📊 **Clear status**: 4-indicator system with plain English descriptions
- 🎛️ **Rich settings**: Emoji-enhanced dropdowns and real-time updates
- 🐛 **Bug fixes**: Resolved all connection and audio issues

## 📁 Project Structure

```
realtime-api-backend/
├── server.js                    # Express server with ephemeral token endpoint
├── package.json                 # Dependencies (no WebSocket library needed)
├── public/
│   ├── index.html              # Beautiful glass-morphism UI
│   └── realtime-webrtc-client.js # WebRTC client with full OpenAI integration
└── README.md                   # This file
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly  
5. Submit a pull request

---

**Built with ❤️ using OpenAI's Realtime API and WebRTC** 