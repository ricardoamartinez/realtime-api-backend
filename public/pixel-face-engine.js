// 🎭 Pixel Art Face Engine with Emotional Behavior Trees
class PixelFaceEngine {
    constructor(canvasId, width = 200, height = 200) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.pixelSize = 8;
        
        // Set canvas size
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.imageRendering = '-moz-crisp-edges';
        this.canvas.style.imageRendering = 'crisp-edges';
        
        // Current face state
        this.currentEmotion = 'neutral';
        this.currentIntensity = 0.5;
        this.animationFrame = 0;
        this.isAnimating = false;
        
        // Animation system
        this.animations = new Map();
        this.behaviorTree = new EmotionalBehaviorTree();
        
        // Initialize face
        this.initializeFace();
        this.startAnimationLoop();
        
        console.log('🎭 Pixel Face Engine initialized');
    }
    
    initializeFace() {
        // Create base face structure
        this.baseFace = this.createBaseFace();
        this.currentFace = { ...this.baseFace };
        this.renderFace();
    }
    
    createBaseFace() {
        return {
            // Face outline (16x16 grid)
            outline: [
                [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
                [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
                [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
                [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
                [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
                [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
                [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
                [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
                [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
                [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
                [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
                [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
                [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
                [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0]
            ],
            eyes: { left: { x: 4, y: 4 }, right: { x: 11, y: 4 } },
            mouth: { x: 8, y: 10 },
            cheeks: { left: { x: 3, y: 7 }, right: { x: 12, y: 7 } },
            eyebrows: { left: { x: 4, y: 3 }, right: { x: 11, y: 3 } }
        };
    }
    
    // Color palette for cute pixel art
    getColorPalette() {
        return {
            // Skin tones
            skin: '#FFE4B5',
            skinShadow: '#DEB887',
            
            // Eye colors
            eyeWhite: '#FFFFFF',
            eyeBlack: '#000000',
            eyeBlue: '#4A90E2',
            eyeSparkle: '#FFE4E1',
            
            // Mouth colors
            mouthPink: '#FF69B4',
            mouthRed: '#FF6B6B',
            mouthDark: '#8B4513',
            
            // Cheek colors
            cheekPink: '#FFB6C1',
            cheekRed: '#FF7F7F',
            
            // Outline
            outline: '#8B4513',
            background: 'transparent',
            
            // Special effects
            sparkle: '#FFD700',
            hearts: '#FF1493'
        };
    }
    
    // Emotion-specific eye patterns
    getEyePattern(emotion, side = 'left') {
        const patterns = {
            normal: [[1,1],[1,1]],
            sparkle: [[1,3],[1,1]],
            droopy: [[0,1],[1,1]],
            wide: [[1,1,1],[1,1,1]],
            focused: [[0,1],[1,0]],
            squinted: [[1],[1]],
            shocked: [[1,1,1],[1,1,1],[1,1,1]],
            closed: [[0,0],[2,2]],
            attentive: [[1,1],[1,2]],
            engaging: [[1,2],[1,1]],
            sympathetic: [[1,1],[2,1]],
            inquisitive: [[2,1],[1,1]]
        };
        return patterns[emotion] || patterns.normal;
    }
    
    // Emotion-specific mouth patterns
    getMouthPattern(emotion) {
        const patterns = {
            neutral: [[2,2,2]],
            smile: [[0,2,2,2,0],[2,2,2,2,2]],
            frown: [[2,2,2,2,2],[0,2,2,2,0]],
            grin: [[0,2,2,2,2,2,0],[2,2,2,2,2,2,2]],
            contemplative: [[2,2]],
            puzzled: [[2,2,0,2,2]],
            open: [[2,2,2],[0,0,0],[2,2,2]],
            laugh: [[0,2,2,2,2,2,0],[2,0,0,0,0,0,2],[2,2,2,2,2,2,2]],
            slight_smile: [[0,2,2,0]],
            talking: [[2,2,0,2,2],[0,0,0,0,0]]
        };
        return patterns[emotion] || patterns.neutral;
    }
    
    // Emotion-specific eyebrow patterns
    getEyebrowPattern(emotion, side = 'left') {
        const patterns = {
            normal: [[1,1,1]],
            raised: [[0,1,1,1]],
            lowered: [[1,1,1,0]],
            high: [[0,0,1,1,1]],
            furrowed: [[1,1,0,1,1]],
            asymmetric: side === 'left' ? [[1,1,1]] : [[0,1,1,1]],
            concerned: [[1,1,1,1]],
            interested: [[0,1,1,1,0]],
            curious: [[0,0,1,1,1,1]],
            expressive: [[1,0,1,1,1]]
        };
        return patterns[emotion] || patterns.normal;
    }
    
    // Main render function
    renderFace() {
        this.clearCanvas();
        this.drawFaceOutline();
        this.drawEyes();
        this.drawEyebrows();
        this.drawMouth();
        this.drawCheeks();
        this.drawSpecialEffects();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    drawFaceOutline() {
        const colors = this.getColorPalette();
        const outline = this.baseFace.outline;
        
        for (let y = 0; y < outline.length; y++) {
            for (let x = 0; x < outline[y].length; x++) {
                const pixel = outline[y][x];
                let color;
                
                switch (pixel) {
                    case 1: color = colors.outline; break;
                    case 2: color = colors.skin; break;
                    default: continue;
                }
                
                this.drawPixel(x, y, color);
            }
        }
    }
    
    drawEyes() {
        const eyeType = this.getEyeTypeForEmotion(this.currentEmotion);
        const leftPattern = this.getEyePattern(eyeType, 'left');
        const rightPattern = this.getEyePattern(eyeType, 'right');
        
        this.drawEyePattern(this.baseFace.eyes.left.x, this.baseFace.eyes.left.y, leftPattern);
        this.drawEyePattern(this.baseFace.eyes.right.x, this.baseFace.eyes.right.y, rightPattern);
    }
    
    drawEyePattern(startX, startY, pattern) {
        const colors = this.getColorPalette();
        
        for (let y = 0; y < pattern.length; y++) {
            for (let x = 0; x < pattern[y].length; x++) {
                const pixel = pattern[y][x];
                let color;
                
                switch (pixel) {
                    case 1: color = colors.eyeBlack; break;
                    case 2: color = colors.eyeWhite; break;
                    case 3: color = colors.eyeSparkle; break;
                    default: continue;
                }
                
                this.drawPixel(startX + x, startY + y, color);
            }
        }
    }
    
    drawEyebrows() {
        const eyebrowType = this.getEyebrowTypeForEmotion(this.currentEmotion);
        const leftPattern = this.getEyebrowPattern(eyebrowType, 'left');
        const rightPattern = this.getEyebrowPattern(eyebrowType, 'right');
        
        this.drawEyebrowPattern(this.baseFace.eyebrows.left.x, this.baseFace.eyebrows.left.y, leftPattern);
        this.drawEyebrowPattern(this.baseFace.eyebrows.right.x, this.baseFace.eyebrows.right.y, rightPattern);
    }
    
    drawEyebrowPattern(startX, startY, pattern) {
        const colors = this.getColorPalette();
        
        for (let y = 0; y < pattern.length; y++) {
            for (let x = 0; x < pattern[y].length; x++) {
                if (pattern[y][x] === 1) {
                    this.drawPixel(startX + x, startY + y, colors.outline);
                }
            }
        }
    }
    
    drawMouth() {
        const mouthType = this.getMouthTypeForEmotion(this.currentEmotion);
        const pattern = this.getMouthPattern(mouthType);
        
        this.drawMouthPattern(this.baseFace.mouth.x - Math.floor(pattern[0].length / 2), this.baseFace.mouth.y, pattern);
    }
    
    drawMouthPattern(startX, startY, pattern) {
        const colors = this.getColorPalette();
        
        for (let y = 0; y < pattern.length; y++) {
            for (let x = 0; x < pattern[y].length; x++) {
                const pixel = pattern[y][x];
                let color;
                
                switch (pixel) {
                    case 2: color = colors.mouthPink; break;
                    case 0: color = colors.mouthDark; break;
                    default: continue;
                }
                
                this.drawPixel(startX + x, startY + y, color);
            }
        }
    }
    
    drawCheeks() {
        const cheekIntensity = this.getCheekIntensityForEmotion(this.currentEmotion);
        if (cheekIntensity > 0) {
            const colors = this.getColorPalette();
            const cheekColor = cheekIntensity > 0.7 ? colors.cheekRed : colors.cheekPink;
            
            // Left cheek
            this.drawPixel(this.baseFace.cheeks.left.x, this.baseFace.cheeks.left.y, cheekColor);
            this.drawPixel(this.baseFace.cheeks.left.x + 1, this.baseFace.cheeks.left.y, cheekColor);
            
            // Right cheek
            this.drawPixel(this.baseFace.cheeks.right.x, this.baseFace.cheeks.right.y, cheekColor);
            this.drawPixel(this.baseFace.cheeks.right.x - 1, this.baseFace.cheeks.right.y, cheekColor);
        }
    }
    
    drawSpecialEffects() {
        // Add sparkles, hearts, or other effects based on emotion
        if (this.currentEmotion === 'excited' || this.currentEmotion === 'happy') {
            const colors = this.getColorPalette();
            const sparklePositions = [
                { x: 2, y: 2 }, { x: 13, y: 3 }, { x: 1, y: 8 }, { x: 14, y: 9 }
            ];
            
            sparklePositions.forEach(pos => {
                if (Math.random() > 0.5) { // Random twinkling
                    this.drawPixel(pos.x, pos.y, colors.sparkle);
                }
            });
        }
    }
    
    drawPixel(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
    }
    
    // Emotion mapping functions
    getEyeTypeForEmotion(emotion) {
        const mapping = {
            happy: 'sparkle',
            sad: 'droopy',
            excited: 'wide',
            thinking: 'focused',
            confused: 'squinted',
            surprised: 'shocked',
            laughing: 'closed',
            neutral: 'normal',
            listening: 'attentive',
            speaking: 'engaging'
        };
        return mapping[emotion] || 'normal';
    }
    
    getEyebrowTypeForEmotion(emotion) {
        const mapping = {
            happy: 'raised',
            sad: 'lowered',
            excited: 'high',
            thinking: 'furrowed',
            confused: 'asymmetric',
            surprised: 'raised',
            laughing: 'normal',
            neutral: 'normal',
            listening: 'interested',
            speaking: 'expressive'
        };
        return mapping[emotion] || 'normal';
    }
    
    getMouthTypeForEmotion(emotion) {
        const mapping = {
            happy: 'smile',
            sad: 'frown',
            excited: 'grin',
            thinking: 'contemplative',
            confused: 'puzzled',
            surprised: 'open',
            laughing: 'laugh',
            neutral: 'neutral',
            listening: 'slight_smile',
            speaking: 'talking'
        };
        return mapping[emotion] || 'neutral';
    }
    
    getCheekIntensityForEmotion(emotion) {
        const mapping = {
            happy: 0.6,
            sad: 0,
            excited: 0.9,
            thinking: 0.2,
            confused: 0.3,
            surprised: 0.4,
            laughing: 0.8,
            neutral: 0.1,
            listening: 0.3,
            speaking: 0.5
        };
        return mapping[emotion] || 0;
    }
    
    // Animation system
    startAnimationLoop() {
        const animate = () => {
            this.animationFrame++;
            this.updateAnimations();
            this.renderFace();
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    updateAnimations() {
        // Add subtle idle animations
        if (this.currentEmotion === 'neutral' || this.currentEmotion === 'listening') {
            // Subtle breathing effect
            const breathe = Math.sin(this.animationFrame * 0.05) * 0.1;
            // Could modify face slightly based on breathing
        }
        
        // Handle active animations
        this.animations.forEach((animation, id) => {
            animation.update();
            if (animation.isComplete()) {
                this.animations.delete(id);
            }
        });
    }
    
    // Public API for emotion control
    setEmotion(emotion, intensity = 0.5, duration = 2000) {
        console.log(`🎭 Setting face emotion: ${emotion} (intensity: ${intensity})`);
        
        // Validate emotion
        const validEmotions = ['happy', 'sad', 'excited', 'thinking', 'confused', 'surprised', 'laughing', 'neutral', 'listening', 'speaking'];
        if (!validEmotions.includes(emotion)) {
            console.warn(`Invalid emotion: ${emotion}. Using neutral.`);
            emotion = 'neutral';
        }
        
        this.currentEmotion = emotion;
        this.currentIntensity = Math.max(0, Math.min(1, intensity));
        
        // Add transition animation
        this.addEmotionTransition(emotion, duration);
    }
    
    addEmotionTransition(targetEmotion, duration) {
        const animation = new EmotionTransition(this.currentEmotion, targetEmotion, duration);
        this.animations.set(`emotion_transition_${Date.now()}`, animation);
    }
    
    // Behavior tree integration
    processBehaviorTree(context) {
        const decision = this.behaviorTree.evaluate(context);
        if (decision.emotion) {
            this.setEmotion(decision.emotion, decision.intensity, decision.duration);
        }
    }
}

// Emotional Behavior Tree for AI decision making
class EmotionalBehaviorTree {
    constructor() {
        this.rules = [
            // User emotion responsive rules
            {
                condition: (ctx) => ctx.userEmotion === 'sad',
                action: () => ({ emotion: 'sympathetic', intensity: 0.8 })
            },
            {
                condition: (ctx) => ctx.userEmotion === 'happy',
                action: () => ({ emotion: 'happy', intensity: 0.9 })
            },
            {
                condition: (ctx) => ctx.userEmotion === 'excited',
                action: () => ({ emotion: 'excited', intensity: 0.8 })
            },
            
            // Context-based rules
            {
                condition: (ctx) => ctx.context.includes('question'),
                action: () => ({ emotion: 'thinking', intensity: 0.7 })
            },
            {
                condition: (ctx) => ctx.context.includes('joke') || ctx.context.includes('funny'),
                action: () => ({ emotion: 'laughing', intensity: 0.9 })
            },
            {
                condition: (ctx) => ctx.isListening,
                action: () => ({ emotion: 'listening', intensity: 0.6 })
            },
            {
                condition: (ctx) => ctx.isSpeaking,
                action: () => ({ emotion: 'speaking', intensity: 0.7 })
            },
            
            // Default fallback
            {
                condition: () => true,
                action: () => ({ emotion: 'neutral', intensity: 0.5 })
            }
        ];
    }
    
    evaluate(context) {
        for (const rule of this.rules) {
            if (rule.condition(context)) {
                return rule.action();
            }
        }
        return { emotion: 'neutral', intensity: 0.5 };
    }
}

// Animation class for smooth emotion transitions
class EmotionTransition {
    constructor(fromEmotion, toEmotion, duration) {
        this.fromEmotion = fromEmotion;
        this.toEmotion = toEmotion;
        this.duration = duration;
        this.startTime = Date.now();
        this.complete = false;
    }
    
    update() {
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        // Smooth easing function
        const eased = this.easeInOutCubic(progress);
        
        if (progress >= 1) {
            this.complete = true;
        }
        
        return eased;
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    
    isComplete() {
        return this.complete;
    }
}

// Export for global use
window.PixelFaceEngine = PixelFaceEngine; 