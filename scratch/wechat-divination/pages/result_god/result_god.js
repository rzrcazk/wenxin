const iching = require('../../utils/iching.js');
const ai = require('../../utils/ai_god.js');

Page({
    data: {
        lines: [],
        hexagram: {},
        audioStatus: 'idle', // idle, loading, ready, playing
        summary: '',
        isThinking: true // Track AI generation status
    },

    onLoad(options) {
        let question = options.question ? decodeURIComponent(options.question) : "";
        if (!question || question === "undefined") {
             question = (options.type === 'KNOWLEDGE') ? "【图片百科】" : "【无字问天】";
        }
        
        // Store promises for synchronization
        this.summaryReadyPromise = null;

        // Case 1: Knowledge / General Answer
        if (options.type === 'KNOWLEDGE') {
             this.setData({
                isKnowledge: true,
                question: question,
                summary: '', // Empty initially
                isThinking: true,
                step: 0
            });

            // Get preloaded summary
            const summaryPromise = ai.getPreloadedSummary() || ai.generateGeneralAnswer(question);
            this.summaryReadyPromise = summaryPromise; // Store reference

            summaryPromise.then(summary => {
                this.setData({ 
                    summary: summary,
                    isThinking: false 
                });
                this.prefetchAudio(summary);
            }).catch(() => {
                this.setData({ 
                    summary: "云端连接不稳定，请稍后再试。",
                    isThinking: false 
                });
            });

            this.initAudio();
            return;
        }

        // Case 2: Standard Divination
        if (options.lines) {
            const lines = JSON.parse(options.lines);
            const analysis = iching.analyzeResult(lines);
            const complexity = options.complexity || 'COMPLEX';

            this.setData({
                isKnowledge: false,
                lines: lines,
                hexagram: analysis,
                question: question,
                complexity: complexity,
                summary: '', // Empty initially
                isThinking: true,
                step: 0
            });

            this.initAudio();

            const summaryPromise = ai.getPreloadedSummary() || ai.generateSummary(question, { name: analysis.title, description: analysis.text }, complexity);
            this.summaryReadyPromise = summaryPromise; // Store reference

            summaryPromise.then(summary => {
                this.setData({ 
                    summary: summary,
                    isThinking: false 
                });
                this.prefetchAudio(summary);
            }).catch(() => {
                this.setData({ 
                    summary: "云端连接不稳定，请稍后再试。",
                    isThinking: false 
                });
            });
        }
    },

    initAudio() {
        this.innerAudioContext = wx.createInnerAudioContext();
        this.innerAudioContext.onPlay(() => {
            this.setData({ audioStatus: 'playing' });
        });
        this.innerAudioContext.onEnded(() => {
            this.setData({ audioStatus: 'ready' });
        });
        this.innerAudioContext.onError((res) => {
            console.error('Audio Error:', res);
            this.setData({ audioStatus: 'ready' });
        });
    },

    prefetchAudio(text) {
        console.log("Audio prefetch requested for:", text.substring(0, 20) + "...");
        this.setData({ audioStatus: 'loading' });

        wx.request({
            url: 'https://tts.juanshen.eu.org/api/tts',
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg'
            },
            data: {
                text: text,
                voice: "zh-CN-XiaoxiaoNeural",
                rate: 0,
                pitch: 0,
                preview: false
            },
            responseType: 'arraybuffer',
            success: (res) => {
                if (res.statusCode === 200 && res.data) {
                    const fs = wx.getFileSystemManager();
                    const tempFilePath = `${wx.env.USER_DATA_PATH}/tts_audio_${Date.now()}.mp3`;
                    
                    fs.writeFile({
                        filePath: tempFilePath,
                        data: res.data,
                        encoding: 'binary',
                        success: () => {
                            console.log('Audio saved to:', tempFilePath);
                            this.audioPath = tempFilePath;
                            this.setData({ audioStatus: 'ready' });
                        },
                        fail: (err) => {
                            console.error('File write failed:', err);
                            this.setData({ audioStatus: 'ready' });
                        }
                    });
                } else {
                    console.error('TTS API Error:', res);
                    this.setData({ audioStatus: 'ready' });
                }
            },
            fail: (err) => {
                console.error('TTS Request Failed:', err);
                this.setData({ audioStatus: 'ready' });
            }
        });
    },

    toggleAudio() {
        if (this.data.audioStatus === 'disabled') return;

        if (this.data.audioStatus === 'playing') {
            this.innerAudioContext.pause();
            this.setData({ audioStatus: 'ready' });
        } else {
            if (this.audioPath) {
                this.innerAudioContext.src = this.audioPath;
                this.innerAudioContext.play();
            } else {
                 // Fallback if no audio file
                 wx.showToast({ title: '语音服务维护中', icon: 'none' });
            }
        }
    },

    openBook() {
        // Start Animation
        this.setData({ step: 0.5 });

        // Only wait for the animation time (1.5s) for a smooth visual transition
        // We NO LONGER wait for the AI summary here. 
        // The user should see the Hexagram (local data) immediately.
        setTimeout(() => {
             this.setData({ step: 1 });
        }, 1500);
    },

    goHome() {
        if (this.innerAudioContext) {
            this.innerAudioContext.stop();
        }
        wx.reLaunch({
            url: '../index/index'
        });
    },

    onHide() {
        if (this.innerAudioContext) {
            this.innerAudioContext.stop();
            this.setData({ audioStatus: 'ready' });
        }
    },

    onUnload() {
        // Stop audio
        if (this.innerAudioContext) {
            this.innerAudioContext.stop();
            this.innerAudioContext.destroy();
        }
        
        // Clean up temp file
        if (this.audioPath) {
            const fs = wx.getFileSystemManager();
            fs.unlink({
                filePath: this.audioPath,
                success: () => console.log('Temp audio file removed'),
                fail: (err) => console.error('Failed to remove temp file', err)
            });
        }
    },

    onShareAppMessage() {
        if (this.data.isKnowledge) {
             return {
                title: `关于“${this.data.question}”的解答`,
                path: `/pages/result_god/result_god?type=KNOWLEDGE&question=${encodeURIComponent(this.data.question)}`
            };
        }
        const hexagramName = (this.data.hexagram && this.data.hexagram.name) ? this.data.hexagram.name : '未名';
        const linesStr = JSON.stringify(this.data.lines);
        const question = encodeURIComponent(this.data.question || '');
        const complexity = this.data.complexity || 'COMPLEX';
        return {
            title: `我求得一卦：${hexagramName}，快来看看！`,
            path: `/pages/result_god/result_god?lines=${linesStr}&question=${question}&complexity=${complexity}`
        };
    },

    onShareTimeline() {
        if (this.data.isKnowledge) {
             return {
                title: `关于“${this.data.question}”的解答`,
                query: `type=KNOWLEDGE&question=${encodeURIComponent(this.data.question)}`
            };
        }
        const hexagramName = (this.data.hexagram && this.data.hexagram.name) ? this.data.hexagram.name : '未名';
        const linesStr = JSON.stringify(this.data.lines);
        const question = encodeURIComponent(this.data.question || '');
        const complexity = this.data.complexity || 'COMPLEX';
        return {
            title: `我求得一卦：${hexagramName}`,
            query: `lines=${linesStr}&question=${question}&complexity=${complexity}`
        };
    }
})
