// WebRTC Realtime Client for OpenAI GPT-4o
class RealtimeWebRTCClient {
    constructor() {
        this.pc = null;
        this.dataChannel = null;
        this.isConnected = false;
        this.isVoiceActive = false;
        this.isAiSpeaking = false;
        this.currentUserTranscript = '';
        this.currentAiTranscript = '';
        this.currentResponseId = null;
        
        // Settings
        this.settings = {
            voice: 'verse',
            vadEagerness: 'high',
            interruptResponse: true
        };
        
        // Initialize everything
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeVisualizer();
        this.log('🎉 WebRTC Client initialized', 'success');
    }
    
    initializeElements() {
        // Main UI elements
        this.connectBtn = document.getElementById('connectBtn');
        this.micBtn = document.getElementById('micBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.userTranscript = document.getElementById('userTranscript');
        this.aiTranscript = document.getElementById('aiTranscript');
        this.errorContainer = document.getElementById('errorContainer');
        this.visualizer = document.getElementById('visualizer');
        
        // Status elements
        this.connectionStatusIcon = document.getElementById('connectionStatusIcon');
        this.connectionStatusText = document.getElementById('connectionStatusText');
        this.micStatusIcon = document.getElementById('micStatusIcon');
        this.micStatusText = document.getElementById('micStatusText');
        this.vadStatusIcon = document.getElementById('vadStatusIcon');
        this.vadStatusText = document.getElementById('vadStatusText');
        this.aiStatusIcon = document.getElementById('aiStatusIcon');
        this.aiStatusText = document.getElementById('aiStatusText');
        
        // Status display elements
        this.statusDisplay = document.getElementById('statusDisplay');
        this.lastActionDisplay = document.getElementById('lastActionDisplay');
        
        // Debug elements
        this.debugLogs = document.getElementById('debugLogs');
        
        // Settings elements
        this.aiVoice = document.getElementById('aiVoice');
        this.vadEagerness = document.getElementById('vadEagerness');
        this.interruptResponse = document.getElementById('interruptResponse');
    }
    
    initializeEventListeners() {
        if (this.connectBtn) this.connectBtn.addEventListener('click', () => this.toggleConnection());
        if (this.micBtn) this.micBtn.addEventListener('click', () => this.toggleMicrophone());
        if (this.clearBtn) this.clearBtn.addEventListener('click', () => this.clearTranscripts());
    }
    
    initializeVisualizer() {
        if (!this.visualizer) return;
        
        // Create 30 visualization bars
        for (let i = 0; i < 30; i++) {
            const bar = document.createElement('div');
            bar.className = 'w-1 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full transition-all duration-150';
            bar.style.height = '8px';
            this.visualizer.appendChild(bar);
        }
    }
    
    async toggleConnection() {
        if (this.isConnected) {
            this.disconnect();
        } else {
            await this.connect();
        }
    }
    
    async toggleMicrophone() {
        if (this.isVoiceActive) {
            this.stopVoice();
        } else {
            await this.startVoice();
        }
    }
    
    async connect() {
        try {
            this.showError(null);
            this.updateStatus('🔄 Connecting to AI...', 'Establishing connection');
            this.log('🚀 Starting WebRTC connection process...', 'info');
            
            // Get ephemeral token from backend
            this.log('🔑 Requesting ephemeral token...', 'info');
            const tokenResponse = await fetch('/session', { method: 'POST' });
            if (!tokenResponse.ok) {
                throw new Error(`Failed to create session: ${tokenResponse.status}`);
            }
            
            const sessionData = await tokenResponse.json();
            const ephemeralKey = sessionData.client_secret.value;
            this.log('✅ Ephemeral token received', 'success');
            
            // Create WebRTC peer connection
            this.log('🔗 Creating WebRTC peer connection...', 'info');
            this.pc = new RTCPeerConnection();
            
            // Set up audio element for remote audio from the model
            const audioEl = document.createElement('audio');
            audioEl.autoplay = true;
            this.pc.ontrack = e => {
                this.log('🎵 Received remote audio stream', 'success');
                audioEl.srcObject = e.streams[0];
            };
            
            // Set up data channel for sending and receiving events
            this.dataChannel = this.pc.createDataChannel('oai-events');
            this.dataChannel.addEventListener('message', (e) => {
                const serverEvent = JSON.parse(e.data);
                this.log(`📥 Received: ${serverEvent.type}`, 'info');
                this.handleServerMessage(serverEvent);
            });
            
            this.dataChannel.addEventListener('open', () => {
                this.log('📡 Data channel opened', 'success');
                this.isConnected = true;
                this.updateStatus('✅ Connected to AI', 'Ready for voice interaction');
                this.updateStatusIndicator(this.connectionStatusIcon, this.connectionStatusText, true, 'Connected', 'bg-green-500');
                if (this.connectBtn) this.connectBtn.textContent = '🔌 Disconnect';
                if (this.micBtn) this.micBtn.disabled = false;
                
                // Send initial session configuration
                this.sendSessionUpdate();
            });
            
            this.dataChannel.addEventListener('close', () => {
                this.log('📡 Data channel closed', 'warning');
                this.handleDisconnection();
            });
            
            this.dataChannel.addEventListener('error', (error) => {
                this.log('❌ Data channel error: ' + error, 'error');
                this.showError('Data channel error occurred');
            });
            
            // Create and set local description
            const offer = await this.pc.createOffer();
            await this.pc.setLocalDescription(offer);
            this.log('📤 Created WebRTC offer', 'info');
            
            // Send offer to OpenAI Realtime API
            const baseUrl = 'https://api.openai.com/v1/realtime';
            const model = 'gpt-4o-realtime-preview-2024-12-17';
            
            this.log('🌐 Sending offer to OpenAI...', 'info');
            const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
                method: 'POST',
                body: offer.sdp,
                headers: {
                    'Authorization': `Bearer ${ephemeralKey}`,
                    'Content-Type': 'application/sdp'
                }
            });
            
            if (!sdpResponse.ok) {
                throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
            }
            
            const answer = {
                type: 'answer',
                sdp: await sdpResponse.text()
            };
            
            await this.pc.setRemoteDescription(answer);
            this.log('✅ WebRTC connection established', 'success');
            
        } catch (error) {
            this.log('❌ Connection failed: ' + error.message, 'error');
            this.showError('Failed to connect: ' + error.message);
            this.updateStatus('❌ Connection Failed', 'Check your internet and API key');
            this.updateStatusIndicator(this.connectionStatusIcon, this.connectionStatusText, false, 'Error', 'bg-red-500');
        }
    }
    
    sendSessionUpdate() {
        if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
            this.log('⚠️ Data channel not ready for session update', 'warning');
            return;
        }
        
        const sessionUpdate = {
            type: 'session.update',
            session: {
                instructions: 'You are a helpful AI assistant. Be conversational, engaging, and feel free to interrupt when appropriate. Respond naturally and actively participate in the conversation.',
                voice: this.settings.voice,
                modalities: ['text', 'audio'],
                turn_detection: {
                    type: 'semantic_vad',
                    eagerness: this.settings.vadEagerness,
                    create_response: true,
                    interrupt_response: this.settings.interruptResponse
                },
                input_audio_transcription: {
                    model: 'gpt-4o-transcribe'
                }
            }
        };
        
        this.log('⚙️ Sending session configuration...', 'info');
        this.dataChannel.send(JSON.stringify(sessionUpdate));
    }
    
    async startVoice() {
        if (!this.isConnected) {
            this.showError('Please connect to AI first before starting voice');
            return;
        }
        
        try {
            this.log('🎤 Requesting microphone access...', 'info');
            
            // Get user media for microphone input
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 24000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            this.log('✅ Microphone access granted', 'success');
            this.updateStatusIndicator(this.micStatusIcon, this.micStatusText, true, 'Recording', 'bg-green-500');
            
            // Add local audio track to peer connection
            const audioTrack = mediaStream.getAudioTracks()[0];
            this.pc.addTrack(audioTrack, mediaStream);
            
            // Set up audio context for visualization
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            const source = this.audioContext.createMediaStreamSource(mediaStream);
            const analyser = this.audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            
            this.mediaStream = mediaStream;
            this.analyser = analyser;
            this.isVoiceActive = true;
            
            if (this.micBtn) {
                this.micBtn.textContent = '🔇 Stop Voice';
                this.micBtn.className = 'px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105';
            }
            
            this.updateStatus('🎤 Voice Active', 'Listening for your speech');
            this.updateStatusIndicator(this.vadStatusIcon, this.vadStatusText, true, 'Listening', 'bg-green-500');
            
            // Start visualization loop
            this.startVisualization();
            
            this.log('🎉 Voice input started successfully', 'success');
            
        } catch (error) {
            this.log('❌ Microphone error: ' + error.message, 'error');
            this.showError('Failed to access microphone: ' + error.message);
            this.updateStatusIndicator(this.micStatusIcon, this.micStatusText, false, 'Error', 'bg-red-500');
        }
    }
    
    startVisualization() {
        const animate = () => {
            if (!this.isVoiceActive || !this.analyser) return;
            
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            this.analyser.getByteFrequencyData(dataArray);
            
            this.updateVisualizerFromAudio(dataArray);
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    updateVisualizerFromAudio(audioData) {
        if (!this.visualizer) return;
        
        const bars = this.visualizer.querySelectorAll('div');
        const bufferLength = audioData.length;
        const barCount = bars.length;
        const dataPerBar = Math.floor(bufferLength / barCount);
        
        for (let i = 0; i < barCount; i++) {
            let sum = 0;
            for (let j = i * dataPerBar; j < (i + 1) * dataPerBar; j++) {
                sum += audioData[j];
            }
            const average = sum / dataPerBar;
            const height = Math.max(8, Math.min(80, (average / 255) * 80));
            bars[i].style.height = `${height}px`;
        }
    }
    
    stopVoice() {
        this.log('🔇 Stopping voice input...', 'info');
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        
        this.isVoiceActive = false;
        this.mediaStream = null;
        this.audioContext = null;
        this.analyser = null;
        
        this.updateStatusIndicator(this.micStatusIcon, this.micStatusText, false, 'Inactive', 'bg-gray-400');
        this.updateStatusIndicator(this.vadStatusIcon, this.vadStatusText, false, 'Inactive', 'bg-gray-400');
        
        if (this.micBtn) {
            this.micBtn.textContent = '🎤 Start Voice Chat';
            this.micBtn.className = 'px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105';
        }
        
        this.updateStatus('🔇 Voice Stopped', 'Voice input disabled');
        this.log('✅ Voice input stopped', 'success');
    }
    
    disconnect() {
        this.log('🔌 Disconnecting...', 'info');
        
        this.stopVoice();
        
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        if (this.pc) {
            this.pc.close();
        }
        
        this.handleDisconnection();
        this.log('✅ Disconnected successfully', 'success');
    }
    
    handleDisconnection() {
        this.isConnected = false;
        this.isVoiceActive = false;
        this.isAiSpeaking = false;
        
        this.updateStatus('🔌 Disconnected', 'Connection closed');
        this.updateStatusIndicator(this.connectionStatusIcon, this.connectionStatusText, false, 'Disconnected', 'bg-red-500');
        this.updateStatusIndicator(this.micStatusIcon, this.micStatusText, false, 'Inactive', 'bg-gray-400');
        this.updateStatusIndicator(this.vadStatusIcon, this.vadStatusText, false, 'Inactive', 'bg-gray-400');
        this.updateStatusIndicator(this.aiStatusIcon, this.aiStatusText, false, 'Idle', 'bg-gray-400');
        
        if (this.connectBtn) {
            this.connectBtn.textContent = '🚀 Connect to AI';
        }
        if (this.micBtn) {
            this.micBtn.textContent = '🎤 Start Voice Chat';
            this.micBtn.className = 'px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100';
            this.micBtn.disabled = true;
        }
    }
    
    handleServerMessage(message) {
        switch (message.type) {
            case 'session.created':
                this.log('🎉 Session created successfully', 'success');
                break;
                
            case 'session.updated':
                this.log('⚙️ Session configuration updated', 'success');
                break;
                
            case 'input_audio_buffer.speech_started':
                this.log('🗣️ Speech detected by VAD', 'info');
                this.updateStatusIndicator(this.vadStatusIcon, this.vadStatusText, true, 'You are speaking', 'bg-blue-500');
                this.updateStatus('🗣️ Speaking', 'Your voice detected');
                this.addUserMessage('🎤 Speaking...', true);
                break;
                
            case 'input_audio_buffer.speech_stopped':
                this.log('⏸️ Speech ended, processing...', 'info');
                this.updateStatusIndicator(this.vadStatusIcon, this.vadStatusText, true, 'Processing speech', 'bg-yellow-500');
                this.updateStatus('⏸️ Processing', 'Understanding your speech');
                break;
                
            case 'conversation.item.input_audio_transcription.delta':
                if (message.delta) this.updateUserTranscript(message.delta, true);
                break;
                
            case 'conversation.item.input_audio_transcription.completed':
                this.log('📝 Speech transcription completed', 'success');
                if (message.transcript) this.updateUserTranscript(message.transcript, false);
                break;
                
            case 'response.created':
                this.currentResponseId = message.response.id;
                this.log('🤖 AI generating response...', 'info');
                this.isAiSpeaking = true;
                this.updateStatusIndicator(this.aiStatusIcon, this.aiStatusText, true, 'AI is thinking', 'bg-purple-500');
                this.updateStatus('🤖 AI Thinking', 'Generating response');
                this.addAiMessage('🤖 Thinking...', true);
                break;
                
            case 'response.audio_transcript.delta':
                if (message.delta) this.updateAiTranscript(message.delta, true);
                break;
                
            case 'response.audio_transcript.done':
                this.log('🎵 AI audio transcription completed', 'success');
                if (message.transcript) this.updateAiTranscript(message.transcript, false);
                break;
                
            case 'response.text.delta':
                if (message.delta) this.updateAiTranscript(message.delta, true);
                break;
                
            case 'response.text.done':
                this.log('📝 AI text generation completed', 'success');
                if (message.text) this.updateAiTranscript(message.text, false);
                break;
                
            case 'response.done':
                this.log('🎉 AI response completed', 'success');
                this.currentResponseId = null;
                this.isAiSpeaking = false;
                this.updateStatusIndicator(this.aiStatusIcon, this.aiStatusText, false, 'Ready', 'bg-gray-400');
                this.updateStatusIndicator(this.vadStatusIcon, this.vadStatusText, true, 'Listening', 'bg-green-500');
                this.updateStatus('👂 Listening', 'Ready for your next question');
                break;
                
            case 'error':
                this.log('❌ Server error: ' + (message.error || 'Unknown error'), 'error');
                this.showError('Server error: ' + (message.error || 'Unknown error'));
                break;
                
            default:
                this.log(`❓ Unknown message type: ${message.type}`, 'warning');
                break;
        }
    }
    
    updateStatusIndicator(iconElement, textElement, isActive, text = null, color = null) {
        if (iconElement && textElement) {
            if (isActive) {
                iconElement.className = `w-4 h-4 rounded-full status-indicator active ${color || 'bg-green-500'}`;
                if (text) textElement.textContent = text;
            } else {
                iconElement.className = 'w-4 h-4 rounded-full status-indicator bg-gray-400';
                if (text) textElement.textContent = text;
            }
        }
    }
    
    updateStatus(mainText, description = null) {
        if (this.statusDisplay) {
            this.statusDisplay.textContent = mainText;
        }
        if (description && this.lastActionDisplay) {
            this.lastActionDisplay.textContent = description;
        }
        
        // Update status display colors
        if (this.statusDisplay) {
            if (mainText.includes('Connected') || mainText.includes('✅')) {
                this.statusDisplay.className = 'ml-2 text-green-600 font-medium';
            } else if (mainText.includes('Connecting') || mainText.includes('🔄')) {
                this.statusDisplay.className = 'ml-2 text-yellow-600 font-medium';
            } else if (mainText.includes('Failed') || mainText.includes('❌')) {
                this.statusDisplay.className = 'ml-2 text-red-600 font-medium';
            } else {
                this.statusDisplay.className = 'ml-2 text-blue-600 font-medium';
            }
        }
    }
    
    addUserMessage(text, isLive = false) {
        if (!this.userTranscript) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `p-4 mb-4 rounded-xl ${isLive ? 'bg-blue-50 border-l-4 border-blue-400 shadow-md' : 'bg-gray-50 border-l-4 border-gray-400'}`;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'text-xs text-gray-500 mb-2 font-mono';
        timestamp.textContent = new Date().toLocaleTimeString();
        
        const content = document.createElement('div');
        content.className = `text-sm ${isLive ? 'text-blue-800 italic font-medium' : 'text-gray-800'}`;
        content.textContent = text;
        
        messageDiv.appendChild(timestamp);
        messageDiv.appendChild(content);
        
        // Remove previous live message if exists
        if (isLive) {
            const prevLive = this.userTranscript.querySelector('.bg-blue-50');
            if (prevLive) prevLive.remove();
            
            // Clear placeholder text
            const placeholder = this.userTranscript.querySelector('.text-slate-400');
            if (placeholder && placeholder.parentElement) placeholder.parentElement.remove();
        }
        
        this.userTranscript.appendChild(messageDiv);
        this.userTranscript.scrollTop = this.userTranscript.scrollHeight;
    }
    
    addAiMessage(text, isLive = false) {
        if (!this.aiTranscript) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `p-4 mb-4 rounded-xl ${isLive ? 'bg-green-50 border-l-4 border-green-400 shadow-md' : 'bg-slate-50 border-l-4 border-slate-400'}`;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'text-xs text-gray-500 mb-2 font-mono';
        timestamp.textContent = new Date().toLocaleTimeString();
        
        const content = document.createElement('div');
        content.className = `text-sm ${isLive ? 'text-green-800 italic font-medium' : 'text-gray-800'}`;
        content.textContent = text;
        
        messageDiv.appendChild(timestamp);
        messageDiv.appendChild(content);
        
        // Remove previous live message if exists
        if (isLive) {
            const prevLive = this.aiTranscript.querySelector('.bg-green-50');
            if (prevLive) prevLive.remove();
            
            // Clear placeholder text
            const placeholder = this.aiTranscript.querySelector('.text-slate-400');
            if (placeholder && placeholder.parentElement) placeholder.parentElement.remove();
        }
        
        this.aiTranscript.appendChild(messageDiv);
        this.aiTranscript.scrollTop = this.aiTranscript.scrollHeight;
    }
    
    updateUserTranscript(text, isPartial = false) {
        if (isPartial) {
            this.currentUserTranscript += text;
            this.addUserMessage(this.currentUserTranscript, true);
        } else {
            this.currentUserTranscript = text;
            this.addUserMessage(text, false);
            this.currentUserTranscript = '';
        }
    }
    
    updateAiTranscript(text, isPartial = false) {
        if (isPartial) {
            this.currentAiTranscript += text;
            this.addAiMessage(this.currentAiTranscript, true);
        } else {
            this.currentAiTranscript = text;
            this.addAiMessage(text, false);
            this.currentAiTranscript = '';
        }
    }
    
    clearTranscripts() {
        if (this.userTranscript) {
            this.userTranscript.innerHTML = `
                <div class="text-slate-400 italic text-center mt-20">
                    <div class="text-4xl mb-4">🎤</div>
                    <div>Start speaking to see your words appear here...</div>
                </div>
            `;
        }
        if (this.aiTranscript) {
            this.aiTranscript.innerHTML = `
                <div class="text-slate-400 italic text-center mt-20">
                    <div class="text-4xl mb-4">🤖</div>
                    <div>AI responses will appear here...</div>
                </div>
            `;
        }
        this.currentUserTranscript = '';
        this.currentAiTranscript = '';
        this.log('🧹 Chat history cleared', 'info');
    }
    
    showError(message) {
        if (!this.errorContainer) return;
        
        if (message) {
            this.errorContainer.innerHTML = `
                <div class="glass-card rounded-2xl shadow-2xl p-6 mb-6 bg-red-50 border border-red-200">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <span class="text-red-500 text-2xl">⚠️</span>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold text-red-800">Error</h3>
                            <div class="text-sm text-red-700 mt-1">${message}</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            this.errorContainer.innerHTML = '';
        }
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        
        // Style based on type
        let colorClass = 'text-blue-600'; // info
        if (type === 'success') colorClass = 'text-green-600';
        else if (type === 'warning') colorClass = 'text-yellow-600';
        else if (type === 'error') colorClass = 'text-red-600';
        
        console.log(`[${timestamp}] ${message}`);
        
        if (this.debugLogs) {
            const logEntry = document.createElement('div');
            logEntry.className = `${colorClass} mb-1 hover:bg-slate-100 p-1 rounded`;
            logEntry.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> ${message}`;
            
            this.debugLogs.appendChild(logEntry);
            this.debugLogs.scrollTop = this.debugLogs.scrollHeight;
            
            // Keep only last 100 log entries
            while (this.debugLogs.children.length > 100) {
                this.debugLogs.removeChild(this.debugLogs.firstChild);
            }
        }
        
        // Update last action display
        if (this.lastActionDisplay) {
            const cleanMessage = message.replace(/[🔄📞✅❌⚠️🔌🔑📥🛑🎤📝💬🗣️⏸️📤🔊🎉📊❓🚀🎵🔇]/g, '').trim();
            this.lastActionDisplay.textContent = cleanMessage;
        }
    }
}

// Global functions for UI interactions
function updateSettings() {
    const client = window.realtimeClient;
    if (!client || !client.isConnected) {
        if (client) client.log('⚠️ Cannot update settings - not connected', 'warning');
        alert('Please connect to AI first before changing settings.');
        return;
    }
    
    // Get current settings from UI
    const voiceSelect = document.getElementById('aiVoice');
    const vadSelect = document.getElementById('vadEagerness');
    const interruptCheck = document.getElementById('interruptResponse');
    
    if (voiceSelect && vadSelect && interruptCheck) {
        client.settings = {
            voice: voiceSelect.value,
            vadEagerness: vadSelect.value,
            interruptResponse: interruptCheck.checked
        };
        
        client.log('⚙️ Updating session settings...', 'info');
        client.sendSessionUpdate();
        client.log('✅ Settings applied successfully', 'success');
    }
}

function clearLogs() {
    const debugLogs = document.getElementById('debugLogs');
    if (debugLogs) {
        debugLogs.innerHTML = '<div class="text-blue-600">🔄 Debug logs cleared...</div>';
    }
    
    const client = window.realtimeClient;
    if (client) client.log('🧹 Debug logs cleared', 'info');
}

// Initialize the client when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 Initializing WebRTC Client...');
    try {
        window.realtimeClient = new RealtimeWebRTCClient();
    } catch (error) {
        console.error('❌ Failed to initialize client:', error);
    }
}); 