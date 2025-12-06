const { iching } = require('../../utils/iching-data.js');
const ichingLogic = require('../../utils/iching.js');
const { generateCoinStandingMessage, preloadSummary } = require('../../utils/ai_god.js');

Page({
    data: {
        tossCount: 0,
        lines: [], // Stores 6, 7, 8, 9. Index 0 is bottom line.
        selectedType: null, // Currently selected coin result
        question: '',
        lineLabels: ['初', '二', '三', '四', '五', '上'],
        isTossing: false,
        animationClass: '',
        isShowingResult: false
    },

    selectResult(e) {
        if (this.data.tossCount >= 6) return;
        const type = parseInt(e.currentTarget.dataset.type);
        this.setData({
            selectedType: type
        });
    },

    confirmSelection() {
        if (!this.data.selectedType) return;

        const type = this.data.selectedType;
        const newLines = [...this.data.lines, type];

        this.setData({
            lines: newLines,
            tossCount: newLines.length,
            selectedType: null // Reset selection
        });

        if (newLines.length === 6) {
            // Preload AI summary immediately, passing complexity
            const analysis = ichingLogic.analyzeResult(newLines);
            preloadSummary(this.data.question, { name: analysis.title, description: analysis.text }, this.complexity);

            setTimeout(() => {
                this.goToResult();
            }, 500);
        }
    },

    undo() {
        const currentLines = this.data.lines;
        if (currentLines.length === 0) return;

        const newLines = currentLines.slice(0, -1);
        this.setData({
            lines: newLines,
            tossCount: newLines.length
        });
    },

    virtualToss() {
        if (this.data.isTossing || this.data.tossCount >= 6 || this.data.isShowingResult) return;

        // Play sound
        if (this.tossAudio) {
            this.tossAudio.stop();
            this.tossAudio.seek(0);
            this.tossAudio.play();
        }

        this.setData({
            isTossing: true,
            animationClass: 'spinning',
            isShowingResult: false
        });

        // Simulate toss duration
        setTimeout(() => {
            // Stop sound exactly when animation ends
            if (this.tossAudio) {
                this.tossAudio.stop();
            }

            // 模拟硬币竖立彩蛋 (千分之一概率)
            if (Math.random() < 0.001) {
                this.setData({
                    isTossing: false,
                    animationClass: '',
                    selectedType: null
                });
                
                wx.showModal({
                    title: '天降异象',
                    content: generateCoinStandingMessage(),
                    showCancel: false,
                    confirmText: '随缘',
                    success: () => {
                        // 用户确认后，无需做额外操作，只需保持在当前进度，允许重新投掷
                    }
                });
                return;
            }

            const rand = Math.random();
            let result;

            if (rand < 0.125) {
                result = 6; // Old Yin (3 Tails)
            } else if (rand < 0.5) { // Young Yang (1 Head, 2 Tails)
                result = 7;
            } else if (rand < 0.875) { // Young Yin (2 Heads, 1 Tail)
                result = 8;
            } else {
                result = 9; // Old Yang (3 Heads)
            }

            this.setData({
                isTossing: false,
                animationClass: '',
                isShowingResult: true,
                selectedType: result
            });

            // Wait for user to see the result (highlighted option)
            setTimeout(() => {
                this.setData({
                    isShowingResult: false
                });
                // Auto confirm
                this.confirmSelection();
            }, 1000);

        }, 1000);
    },

    onLoad(options) {
        if (options.question) {
            this.setData({
                question: decodeURIComponent(options.question)
            });
        }
        // Store complexity
        this.complexity = options.complexity || 'COMPLEX';

        // Initialize audio context
        this.tossAudio = wx.createInnerAudioContext();
        this.tossAudio.obeyMuteSwitch = false; // Play even in silent mode
        this.tossAudio.src = '/audio/shake.mp3';
        this.tossAudio.onError((res) => {
            console.error('Audio play failed:', res);
        });
    },

    onUnload() {
        if (this.tossAudio) {
            this.tossAudio.destroy();
        }
    },

    goToResult() {
        const linesStr = JSON.stringify(this.data.lines);
        const question = encodeURIComponent(this.data.question || '');
        // Pass complexity to result page
        wx.navigateTo({
            url: `../result_god/result_god?lines=${linesStr}&question=${question}&complexity=${this.complexity}`
        });
    },

    confirmSelection() {
        if (!this.data.selectedType) return;

        const type = this.data.selectedType;
        const newLines = [...this.data.lines, type];

        this.setData({
            lines: newLines,
            tossCount: newLines.length,
            selectedType: null // Reset selection
        });

        if (newLines.length === 6) {
            // Preload AI summary immediately, passing complexity
            const analysis = ichingLogic.analyzeResult(newLines);
            preloadSummary(this.data.question, { name: analysis.title, description: analysis.text }, this.complexity);

            setTimeout(() => {
                this.goToResult();
            }, 500);
        }
    },

    onShareTimeline() {
        return {
            title: '诚心求卦，指点迷津'
        };
    }
})
