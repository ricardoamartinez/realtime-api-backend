// ✨ Enhanced WebRTC Realtime Client for OpenAI GPT-4o with LATEST 2025-06-03 API Features
class RealtimeWebRTCClient {
    constructor() {
        this.pc = null;
        this.dataChannel = null;
        this.isConnected = false;
        this.isVoiceActive = false;
        this.currentUserTranscript = '';
        this.currentAiTranscript = '';
        this.currentResponseId = null;
        this.rateLimitRetryDelay = 0;
        this.lastConnectionAttempt = 0;
        this.connectionInProgress = false;
        this.consecutiveFailures = 0; // Track consecutive failures for exponential backoff
        
        // ✨ LATEST settings with 2025-06-03 API features and conservative defaults
        this.settings = {
            voice: 'ballad', // Default to ballad voice
            vadType: 'semantic_vad', // ✨ LATEST: Use new semantic VAD by default
            vadEagerness: 'auto', // ✨ LATEST: Auto-adaptive eagerness
            transcriptionModel: 'whisper-1', // 🛡️ CONSERVATIVE: Use stable Whisper to avoid rate limits
            noiseReductionType: 'near_field', // ✨ LATEST: Enhanced noise reduction
            interruptResponse: true,
            includeLogprobs: false // 🛡️ CONSERVATIVE: Disable by default to reduce API overhead
        };
        
        // Initialize everything
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeVisualizer();
        this.log('🎉 Enhanced WebRTC Client initialized with OpenAI Realtime API (LATEST 2025-06-03)', 'success');
    }
    
    initializeElements() {
        // Main UI elements
        this.connectBtn = document.getElementById('connectBtn');
        this.micBtn = document.getElementById('micBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.userTranscript = document.getElementById('userTranscript');
        this.aiTranscript = document.getElementById('aiTranscript');
        this.visualizer = document.getElementById('visualizer');
        
        // Status elements
        this.connectionStatusIcon = document.getElementById('connectionStatusIcon');
        this.connectionStatusText = document.getElementById('connectionStatusText');
        this.micStatusIcon = document.getElementById('micStatusIcon');
        this.micStatusText = document.getElementById('micStatusText');
        this.aiStatusIcon = document.getElementById('aiStatusIcon');
        this.aiStatusText = document.getElementById('aiStatusText');
        
        // Status display
        this.statusDisplay = document.getElementById('statusDisplay');
        
        // Debug element
        this.debugLogs = document.getElementById('debugLogs');
        
        // Settings elements
        this.aiVoice = document.getElementById('aiVoice');
        this.vadType = document.getElementById('vadType');
        this.vadEagerness = document.getElementById('vadEagerness');
        this.transcriptionModel = document.getElementById('transcriptionModel');
        this.noiseReductionType = document.getElementById('noiseReductionType');
        this.interruptResponse = document.getElementById('interruptResponse');
        this.includeLogprobs = document.getElementById('includeLogprobs');
    }
    
    initializeEventListeners() {
        if (this.connectBtn) this.connectBtn.addEventListener('click', () => this.toggleConnection());
        if (this.micBtn) this.micBtn.addEventListener('click', () => this.toggleMicrophone());
        if (this.clearBtn) this.clearBtn.addEventListener('click', () => this.clearTranscripts());
        
        // Real-time settings listeners
        const settingsElements = [
            this.aiVoice, 
            this.vadType, 
            this.vadEagerness, 
            this.transcriptionModel, 
            this.noiseReductionType, 
            this.interruptResponse, 
            this.includeLogprobs
        ];
        settingsElements.forEach(element => {
            if (element) element.addEventListener('change', () => this.updateSettingsRealtime());
        });
    }
    
    initializeVisualizer() {
        if (!this.visualizer) return;
        
        this.visualizer.innerHTML = '';
        
        // Create 24 visualization bars
        for (let i = 0; i < 24; i++) {
            const bar = document.createElement('div');
            bar.className = 'w-1 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full transition-all duration-150';
            bar.style.height = '8px';
            this.visualizer.appendChild(bar);
        }
    }
    
    updateSettingsRealtime() {
        const newSettings = {
            voice: this.aiVoice?.value || 'ballad',
            vadType: this.vadType?.value || 'semantic_vad', // ✨ LATEST: Default to semantic VAD
            vadEagerness: this.vadEagerness?.value || 'auto', // ✨ LATEST: Auto-adaptive eagerness
            transcriptionModel: this.transcriptionModel?.value || 'whisper-1', // 🛡️ CONSERVATIVE: Default to Whisper
            noiseReductionType: this.noiseReductionType?.value || 'near_field',
            interruptResponse: this.interruptResponse?.checked ?? true,
            includeLogprobs: this.includeLogprobs?.checked ?? false // 🛡️ CONSERVATIVE: Default to false
        };
        
        this.settings = { ...this.settings, ...newSettings };
        this.log(`⚙️ Settings updated: voice=${newSettings.voice}, VAD=${newSettings.vadType}(${newSettings.vadEagerness}), transcription=${newSettings.transcriptionModel}`, 'info');
        
        if (this.isConnected) {
            this.sendSessionUpdate();
        }
    }
    
    async toggleConnection() {
        if (this.connectBtn) this.connectBtn.disabled = true;
        
        try {
            if (this.isConnected) {
                this.disconnect();
                this.consecutiveFailures = 0; // Reset on manual disconnect
            } else {
                // ✨ ENHANCED rate limiting protection with exponential backoff
                const now = Date.now();
                const timeSinceLastAttempt = now - this.lastConnectionAttempt;
                
                // Calculate backoff delay based on consecutive failures
                const baseDelay = 2000; // 2 seconds base delay
                const exponentialDelay = Math.min(60000, baseDelay * Math.pow(2, this.consecutiveFailures)); // Max 1 minute
                const minDelay = Math.max(baseDelay, this.rateLimitRetryDelay, exponentialDelay);
                
                if (this.connectionInProgress) {
                    this.log('⚠️ Connection already in progress', 'warning');
                    return;
                }
                
                if (timeSinceLastAttempt < minDelay) {
                    const waitTime = Math.ceil((minDelay - timeSinceLastAttempt) / 1000);
                    this.log(`⏰ Please wait ${waitTime} seconds before reconnecting (consecutive failures: ${this.consecutiveFailures})`, 'warning');
                    this.updateStatus(`⏰ Wait ${waitTime}s before reconnecting`);
                    return;
                }
                
                this.lastConnectionAttempt = now;
                this.connectionInProgress = true;
                await this.connect();
            }
        } finally {
            this.connectionInProgress = false;
            if (this.connectBtn) this.connectBtn.disabled = false;
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
            this.updateStatus('🔄 Connecting to OpenAI with LATEST API...');
            this.log('🚀 Starting connection to OpenAI Realtime API (2025-06-03 Model)...', 'info');
            
            // Get ephemeral token with latest settings
            this.log('🔑 Requesting ephemeral token with conservative settings...', 'info');
            const tokenResponse = await fetch('/session', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    // Send current settings to backend
                    voice: this.settings.voice,
                    turn_detection: {
                        type: this.settings.vadType,
                        eagerness: this.settings.vadEagerness,
                        create_response: true,
                        interrupt_response: this.settings.interruptResponse
                    },
                    input_audio_transcription: {
                        model: this.settings.transcriptionModel,
                        prompt: 'This is a clear conversation in English. Please transcribe accurately.',
                        language: 'en'
                    },
                    input_audio_noise_reduction: {
                        type: this.settings.noiseReductionType
                    },
                    include: this.settings.includeLogprobs ? ['item.input_audio_transcription.logprobs'] : []
                })
            });
            
            if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json();
                
                // Handle rate limiting from server
                if (tokenResponse.status === 429) {
                    this.consecutiveFailures++;
                    this.rateLimitRetryDelay = 60000; // 1 minute delay
                    throw new Error(`Server rate limit: ${errorData.details}. Please wait before reconnecting.`);
                }
                
                throw new Error(`Session creation failed: ${errorData.error} - ${errorData.details || ''}`);
            }
            
            const sessionData = await tokenResponse.json();
            const ephemeralKey = sessionData.client_secret.value;
            this.log('✅ Ephemeral token received with latest features', 'success');
            
            // Create WebRTC peer connection
            this.log('🔗 Creating WebRTC peer connection...', 'info');
            this.pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            
            // Set up remote audio stream
            const audioEl = document.createElement('audio');
            audioEl.autoplay = true;
            this.pc.ontrack = e => {
                this.log('🎵 Received AI audio stream', 'success');
                audioEl.srcObject = e.streams[0];
            };
            
            // Get microphone with enhanced settings for better transcription
            this.log('🎤 Requesting microphone access with enhanced settings...', 'info');
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 24000, // Optimal for realtime API
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    // ✨ LATEST: Enhanced audio constraints for better transcription accuracy
                    googEchoCancellation: true,
                    googAutoGainControl: true,
                    googNoiseSuppression: true,
                    googHighpassFilter: true,
                    googTypingNoiseDetection: true,
                    latency: 0.02, // Lower latency for real-time performance
                    deviceId: 'default',
                    advanced: [
                        { googAutoGainControl2: true },
                        { googNoiseSuppression2: true },
                        { googEchoCancellation2: true },
                        { googHighpassFilter: true },
                        { googAudioMirroring: false },
                        { googExperimentalAutoGainControl: true },
                        { googExperimentalNoiseSuppression: true }
                    ]
                }
            });
            
            const audioTrack = mediaStream.getAudioTracks()[0];
            this.pc.addTrack(audioTrack, mediaStream);
            this.mediaStream = mediaStream;
            this.log('✅ Microphone connected with enhanced settings', 'success');
            
            // Set up data channel
            this.dataChannel = this.pc.createDataChannel('oai-events');
            
            this.dataChannel.addEventListener('open', () => {
                this.log('📡 Data channel opened', 'success');
                this.isConnected = true;
                this.consecutiveFailures = 0; // Reset on successful connection
                this.rateLimitRetryDelay = 0; // Reset delay
                this.updateStatus('✅ Connected to AI (Latest Model)');
                this.updateStatusIndicator(this.connectionStatusIcon, this.connectionStatusText, true, 'Connected');
                
                if (this.connectBtn) this.connectBtn.textContent = '🔌 Disconnect';
                if (this.micBtn) this.micBtn.disabled = false;
                
                this.sendSessionUpdate();
            });
            
            this.dataChannel.addEventListener('message', (e) => {
                const serverEvent = JSON.parse(e.data);
                this.handleServerMessage(serverEvent);
            });
            
            this.dataChannel.addEventListener('close', () => {
                this.log('📡 Data channel closed', 'warning');
                this.handleDisconnection();
            });
            
            this.dataChannel.addEventListener('error', (error) => {
                this.log('❌ Data channel error', 'error');
                this.consecutiveFailures++;
                this.showError('Data channel error occurred');
            });
            
            // Create and send offer
            const offer = await this.pc.createOffer();
            await this.pc.setLocalDescription(offer);
            this.log('📤 Sending WebRTC offer to OpenAI with latest model...', 'info');
            
            const baseUrl = 'https://api.openai.com/v1/realtime';
            const model = 'gpt-4o-realtime-preview-2025-06-03'; // ✨ LATEST MODEL (no 2024 versions!)
            
            const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
                method: 'POST',
                body: offer.sdp,
                headers: {
                    'Authorization': `Bearer ${ephemeralKey}`,
                    'Content-Type': 'application/sdp'
                }
            });
            
            if (!sdpResponse.ok) {
                const errorText = await sdpResponse.text();
                this.consecutiveFailures++;
                throw new Error(`SDP exchange failed: ${sdpResponse.status} - ${errorText}`);
            }
            
            const answer = {
                type: 'answer',
                sdp: await sdpResponse.text()
            };
            
            await this.pc.setRemoteDescription(answer);
            this.log('🎉 WebRTC connection established with LATEST 2025-06-03 model!', 'success');
            
        } catch (error) {
            this.consecutiveFailures++;
            this.log('❌ Connection failed: ' + error.message, 'error');
            this.showError('Connection failed: ' + error.message);
            this.updateStatus('❌ Connection Failed');
            this.updateStatusIndicator(this.connectionStatusIcon, this.connectionStatusText, false, 'Error');
            
            // Set retry delay based on error type
            if (error.message.includes('rate limit') || error.message.includes('429')) {
                this.rateLimitRetryDelay = 120000; // 2 minutes for rate limits
                this.log('🚨 Rate limit detected - enforcing 2 minute cooldown', 'warning');
            }
        }
    }
    
    sendSessionUpdate() {
        if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
            this.log('⚠️ Data channel not ready', 'warning');
            return;
        }
        
        // ✨ LATEST: Build turn_detection configuration with new semantic VAD
        let turnDetectionConfig;
        if (this.settings.vadType === 'semantic_vad') {
            turnDetectionConfig = {
                type: 'semantic_vad', // ✨ LATEST: Use new semantic VAD
                eagerness: this.settings.vadEagerness, // ✨ LATEST: Configurable eagerness
                create_response: true,
                interrupt_response: this.settings.interruptResponse
            };
        } else {
            // Conservative server VAD settings for stability
            turnDetectionConfig = {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 500,
                create_response: true,
                interrupt_response: this.settings.interruptResponse
            };
        }

        // Build noise reduction configuration
        let noiseReductionConfig = null;
        if (this.settings.noiseReductionType !== 'none') {
            noiseReductionConfig = {
                type: this.settings.noiseReductionType // ✨ LATEST: Enhanced noise reduction
            };
        }

        // 🛡️ CONSERVATIVE: Build include array only when needed
        const includeArray = [];
        if (this.settings.includeLogprobs) {
            includeArray.push('item.input_audio_transcription.logprobs');
        }
        
        // Enhanced transcription prompt based on model
        const transcriptionPrompt = this.settings.transcriptionModel === 'whisper-1' 
            ? 'This is a clear conversation in English. The user is speaking naturally through their device microphone. Please transcribe accurately with proper punctuation and formatting.'
            : 'Transcribe this audio clearly and accurately with the latest GPT-4o Transcribe features. The speaker is using a device microphone in a conversational setting. Include proper punctuation and natural speech patterns.';
        
        const sessionUpdate = {
            type: 'session.update',
            session: {
                instructions: 'You are a highly intelligent, warm, and naturally conversational AI assistant with the latest multimodal capabilities. Speak like a real person would - use natural speech patterns, occasional filler words like "um" or "you know", and vary your tone and pace to sound genuinely human. Be engaging, empathetic, and personable. Feel free to express enthusiasm, curiosity, or gentle humor when appropriate. Respond as if you\'re having a natural conversation with a friend. Use function calls to update your facial expressions based on conversation context.',
                voice: this.settings.voice,
                modalities: ['text', 'audio'],
                turn_detection: turnDetectionConfig,
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: {
                    model: this.settings.transcriptionModel,
                    prompt: transcriptionPrompt,
                    language: 'en'
                },
                ...(noiseReductionConfig && {
                    input_audio_noise_reduction: noiseReductionConfig
                }),
                ...(includeArray.length > 0 && {
                    include: includeArray
                }),
                temperature: 0.8,
                max_response_output_tokens: 4096
            }
        };
        
        this.log('⚙️ Sending LATEST session configuration...', 'info');
        this.log(`🔧 Config: voice=${this.settings.voice}, VAD=${this.settings.vadType}(${this.settings.vadEagerness}), transcription=${this.settings.transcriptionModel}, noise=${this.settings.noiseReductionType}`, 'info');
        this.dataChannel.send(JSON.stringify(sessionUpdate));
    }
    
    async startVoice() {
        if (!this.isConnected) {
            this.showError('Please connect to AI first');
            return;
        }
        
        if (this.isVoiceActive) return;
        
        try {
            // Set up audio context for visualization
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            const analyser = this.audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            
            this.analyser = analyser;
            this.isVoiceActive = true;
            
            this.updateStatusIndicator(this.micStatusIcon, this.micStatusText, true, 'Recording');
            this.updateStatus('🎤 Voice Active');
            
            if (this.micBtn) {
                this.micBtn.textContent = '🔇 Stop Voice';
                this.micBtn.className = 'w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md';
            }
            
            this.startVisualization();
            this.log('🎉 Voice input activated', 'success');
            
        } catch (error) {
            this.log('❌ Voice error: ' + error.message, 'error');
            this.showError('Voice setup failed: ' + error.message);
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
            const height = Math.max(8, Math.min(60, (average / 255) * 60));
            bars[i].style.height = `${height}px`;
        }
    }
    
    stopVoice() {
        this.log('🔇 Stopping voice input...', 'info');
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        
        this.isVoiceActive = false;
        this.audioContext = null;
        this.analyser = null;
        
        this.updateStatusIndicator(this.micStatusIcon, this.micStatusText, false, 'Inactive');
        this.updateStatus('🔇 Voice Stopped');
        
        if (this.micBtn) {
            this.micBtn.textContent = '🎤 Start Voice';
            this.micBtn.className = 'w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md';
        }
        
        this.log('✅ Voice input stopped', 'success');
    }
    
    disconnect() {
        this.log('🔌 Disconnecting...', 'info');
        
        this.stopVoice();
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        
        if (this.dataChannel) this.dataChannel.close();
        if (this.pc) this.pc.close();
        
        this.handleDisconnection();
        this.log('✅ Disconnected successfully', 'success');
    }
    
    handleDisconnection() {
        this.isConnected = false;
        this.isVoiceActive = false;
        
        this.updateStatus('🔌 Disconnected');
        this.updateStatusIndicator(this.connectionStatusIcon, this.connectionStatusText, false, 'Disconnected');
        this.updateStatusIndicator(this.micStatusIcon, this.micStatusText, false, 'Inactive');
        this.updateStatusIndicator(this.aiStatusIcon, this.aiStatusText, false, 'Idle');
        
        if (this.connectBtn) this.connectBtn.textContent = '🚀 Connect';
        if (this.micBtn) {
            this.micBtn.textContent = '🎤 Start Voice';
            this.micBtn.disabled = true;
        }
    }
    
    handleServerMessage(message) {
        this.log(`📥 ${message.type}`, 'info');
        
        switch (message.type) {
            case 'session.created':
                this.log('🎉 Session created successfully', 'success');
                break;
                
            case 'session.updated':
                this.log('⚙️ Session configuration updated', 'success');
                break;
                
            case 'input_audio_buffer.speech_started':
                this.log('🗣️ Speech detected', 'info');
                this.updateStatus('🗣️ You are speaking');
                this.addUserMessage('🎤 Speaking...', true);
                break;
                
            case 'input_audio_buffer.speech_stopped':
                this.log('⏸️ Speech ended, processing...', 'info');
                this.updateStatus('⏸️ Processing speech');
                break;
                
            case 'input_audio_buffer.committed':
                this.log('📝 Audio buffer committed for processing', 'info');
                break;
                
            case 'conversation.item.created':
                this.log('💬 Conversation item created', 'info');
                break;
                
            case 'conversation.item.input_audio_transcription.delta':
                if (message.delta) this.updateUserTranscript(message.delta, true);
                break;
                
            case 'conversation.item.input_audio_transcription.completed':
                this.log('📝 Speech transcription completed', 'success');
                if (message.transcript) this.updateUserTranscript(message.transcript, false);
                
                // Log confidence if available
                if (message.logprobs && this.settings.includeLogprobs) {
                    const avgConfidence = message.logprobs.reduce((sum, item) => sum + Math.exp(item.logprob), 0) / message.logprobs.length;
                    this.log(`📊 Transcription confidence: ${(avgConfidence * 100).toFixed(1)}%`, 'info');
                }
                break;
                
            case 'conversation.item.input_audio_transcription.failed':
                this.log('❌ Speech transcription failed - audio may be unclear or too quiet', 'error');
                this.handleTranscriptionFailure(message);
                break;
                
            case 'response.created':
                this.currentResponseId = message.response.id;
                this.log('🤖 AI generating response...', 'info');
                this.updateStatus('🤖 AI thinking');
                this.updateStatusIndicator(this.aiStatusIcon, this.aiStatusText, true, 'Generating');
                this.addAiMessage('🤖 Thinking...', true);
                break;
                
            case 'response.output_item.added':
                this.log('➕ Response output item added', 'info');
                break;
                
            case 'response.content_part.added':
                this.log('📄 Content part added to response', 'info');
                break;
                
            case 'response.audio.delta':
                this.log('🎵 Receiving AI audio...', 'info');
                break;
                
            case 'response.audio.done':
                this.log('🎵 AI audio completed', 'success');
                break;
                
            case 'response.audio_transcript.delta':
                if (message.delta) this.updateAiTranscript(message.delta, true);
                break;
                
            case 'response.audio_transcript.done':
                this.log('🎵 AI audio transcript completed', 'success');
                if (message.transcript) this.updateAiTranscript(message.transcript, false);
                break;
                
            case 'response.text.delta':
                if (message.delta) this.updateAiTranscript(message.delta, true);
                break;
                
            case 'response.text.done':
                this.log('📝 AI text completed', 'success');
                if (message.text) this.updateAiTranscript(message.text, false);
                break;
                
            case 'response.done':
                this.log('🎉 AI response completed', 'success');
                this.currentResponseId = null;
                this.updateStatusIndicator(this.aiStatusIcon, this.aiStatusText, false, 'Ready');
                this.updateStatus('👂 Listening');
                break;
                
            case 'error':
                this.log('❌ Server error: ' + (message.error?.message || 'Unknown error'), 'error');
                this.showError('Server error: ' + (message.error?.message || 'Unknown error'));
                break;
                
            case 'rate_limits.updated':
                this.log('📊 Rate limits updated', 'info');
                break;
                
            default:
                this.log(`❓ Unknown message type: ${message.type}`, 'warning');
                break;
        }
    }
    
    updateStatusIndicator(iconElement, textElement, isActive, text = null) {
        if (iconElement && textElement) {
            iconElement.className = `w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`;
            if (text) textElement.textContent = text;
        }
    }
    
    updateStatus(text) {
        if (this.statusDisplay) {
            this.statusDisplay.textContent = text;
        }
    }
    
    addUserMessage(text, isLive = false) {
        if (!this.userTranscript) return;
        
        if (isLive) {
            const prevLive = this.userTranscript.querySelector('.bg-blue-50');
            if (prevLive) prevLive.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `p-3 mb-3 rounded-lg ${isLive ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-100 border-l-4 border-gray-400'}`;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'text-xs text-gray-500 mb-1';
        timestamp.textContent = new Date().toLocaleTimeString();
        
        const content = document.createElement('div');
        content.className = `text-sm ${isLive ? 'text-blue-800 italic' : 'text-gray-800'}`;
        content.textContent = text;
        
        messageDiv.appendChild(timestamp);
        messageDiv.appendChild(content);
        this.userTranscript.appendChild(messageDiv);
        this.userTranscript.scrollTop = this.userTranscript.scrollHeight;
    }
    
    addAiMessage(text, isLive = false) {
        if (!this.aiTranscript) return;
        
        if (isLive) {
            const prevLive = this.aiTranscript.querySelector('.bg-green-50');
            if (prevLive) prevLive.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `p-3 mb-3 rounded-lg ${isLive ? 'bg-green-50 border-l-4 border-green-400' : 'bg-gray-100 border-l-4 border-gray-400'}`;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'text-xs text-gray-500 mb-1';
        timestamp.textContent = new Date().toLocaleTimeString();
        
        const content = document.createElement('div');
        content.className = `text-sm ${isLive ? 'text-green-800 italic' : 'text-gray-800'}`;
        content.textContent = text;
        
        messageDiv.appendChild(timestamp);
        messageDiv.appendChild(content);
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
            this.userTranscript.innerHTML = '<div class="text-gray-500 text-sm text-center mt-20">🎤 Start speaking to see your words here...</div>';
        }
        if (this.aiTranscript) {
            this.aiTranscript.innerHTML = '<div class="text-gray-500 text-sm text-center mt-20">🤖 AI responses will appear here...</div>';
        }
        this.currentUserTranscript = '';
        this.currentAiTranscript = '';
        this.log('🧹 Chat history cleared', 'info');
    }
    
    handleTranscriptionFailure(message) {
        // Enhanced error handling with context-aware messaging
        const failureReason = message.error?.code || 'unknown';
        const failureMessage = message.error?.message || 'Transcription failed';
        
        // Check for rate limiting in the message
        const isRateLimit = failureMessage.includes('429') || 
                           failureMessage.includes('Too Many Requests') || 
                           failureMessage.includes('rate limit') ||
                           failureReason.includes('rate_limit');
        
        if (isRateLimit) {
            this.rateLimitRetryDelay = Math.min(60000, this.rateLimitRetryDelay + 10000); // Increase delay up to 60 seconds
            this.log(`🚨 RATE LIMIT DETECTED! Increasing connection delay to ${this.rateLimitRetryDelay/1000} seconds`, 'error');
            this.updateStatus('⚠️ Rate limited - disconnecting to prevent further issues');
            
            this.addUserMessage('⚠️ OpenAI Rate Limit Reached - Please wait 2-3 minutes before reconnecting', false);
            
            // Auto-disconnect to prevent further rate limiting
            setTimeout(() => {
                this.disconnect();
            }, 1000);
            
            this.log('🔧 RATE LIMIT SOLUTIONS:', 'error');
            this.log('  • Wait 2-3 minutes before reconnecting', 'warning');
            this.log('  • Use Server VAD (more reliable)', 'warning');
            this.log('  • Use Whisper-1 transcription model', 'warning');
            this.log('  • Disable confidence scores checkbox', 'warning');
            this.log('  • Avoid rapid reconnections', 'warning');
            
            return;
        }
        
        let userMessage = '❌ Transcription failed';
        let suggestion = '';
        
        // Provide specific guidance based on failure type
        switch (failureReason) {
            case 'audio_too_quiet':
                userMessage = '🔇 Audio too quiet';
                suggestion = 'Try speaking louder or moving closer to the microphone';
                break;
            case 'audio_unclear':
                userMessage = '🎤 Audio unclear';
                suggestion = 'Try speaking more clearly and reduce background noise';
                break;
            case 'audio_too_short':
                userMessage = '⏱️ Audio too short';
                suggestion = 'Try speaking for a longer duration';
                break;
            case 'unsupported_language':
                userMessage = '🌐 Language not supported';
                suggestion = 'Please speak in English';
                break;
            default:
                userMessage = '❌ Transcription failed';
                suggestion = 'Try speaking more clearly, louder, or check your microphone';
                break;
        }
        
        this.addUserMessage(`${userMessage} - ${suggestion}`, false);
        this.log(`📊 Transcription failure details: ${failureReason} - ${failureMessage}`, 'error');
        
        // Auto-suggest settings adjustments
        if (failureReason === 'audio_too_quiet' && this.settings.vadType === 'server_vad') {
            this.log('💡 Suggestion: Try lowering VAD threshold or switching to Semantic VAD', 'info');
        }
    }

    showError(message) {
        // Error display implementation would go here
        if (message) {
            this.log(`❌ Error: ${message}`, 'error');
        }
    }
    
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        if (this.isConnected) {
            this.sendSessionUpdate();
        }
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const colors = {
            info: 'text-blue-600',
            success: 'text-green-600',
            warning: 'text-yellow-600',
            error: 'text-red-600'
        };
        
        console.log(`[${timestamp}] ${message}`);
        
        if (this.debugLogs) {
            const logEntry = document.createElement('div');
            logEntry.className = `${colors[type]} mb-1 text-xs`;
            logEntry.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> ${message}`;
            
            this.debugLogs.appendChild(logEntry);
            this.debugLogs.scrollTop = this.debugLogs.scrollHeight;
            
            // Keep only last 50 entries
            while (this.debugLogs.children.length > 50) {
                this.debugLogs.removeChild(this.debugLogs.firstChild);
            }
        }
    }
}

// Global functions for UI
function updateSettings() {
    const client = window.realtimeClient;
    if (client && client.isConnected) {
        client.updateSettingsRealtime();
    }
}

function clearLogs() {
    const debugLogs = document.getElementById('debugLogs');
    if (debugLogs) {
        debugLogs.innerHTML = '<div class="text-blue-400 text-xs">🔄 Logs cleared...</div>';
    }
}

// Initialize client on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 Initializing Enhanced WebRTC Client...');
    try {
        window.realtimeClient = new RealtimeWebRTCClient();
    } catch (error) {
        console.error('❌ Failed to initialize client:', error);
    }
});
