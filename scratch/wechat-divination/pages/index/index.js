const ai = require('../../utils/ai.js');
const aiGod = require('../../utils/ai_god.js');
const app = getApp();

const GOD_MODE_COLORS = [
    '#d93a49', // 朱砂红
    '#FFD700', // 帝王金
    '#800080', // 紫气东来
    '#00CED1', // 绿松石
    '#FF4500', // 橘红
    '#1E90FF'  // 宝蓝
];

Page({
    data: {
        question: '',
        tempImagePath: '',
        titleText: '遇事不决？',
        titleColor: '' // Default (CSS defined)
    },

    onLoad() {
        const isGodMode = wx.getStorageSync('GOD_MODE') || false;
        this.setData({
            titleText: isGodMode ? '遇事不决！' : '遇事不决？',
            titleColor: isGodMode ? this.getRandomColor() : ''
        });
    },

    getRandomColor() {
        return GOD_MODE_COLORS[Math.floor(Math.random() * GOD_MODE_COLORS.length)];
    },

    onTitleLongPress() {
        const currentMode = wx.getStorageSync('GOD_MODE') || false;
        const newMode = !currentMode;
        
        wx.setStorageSync('GOD_MODE', newMode);
        
        this.setData({
            titleText: newMode ? '遇事不决！' : '遇事不决？',
            titleColor: newMode ? this.getRandomColor() : ''
        });

        wx.vibrateShort({ type: 'heavy' });
    },

    onInputQuestion(e) {
        this.setData({
            question: e.detail.value
        });
    },

    chooseImage() {
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                const tempFilePath = res.tempFiles[0].tempFilePath;
                this.setData({
                    tempImagePath: tempFilePath
                });

                // Convert to Base64 and store in globalData
                wx.getFileSystemManager().readFile({
                    filePath: tempFilePath,
                    encoding: 'base64',
                    success: (data) => {
                        app.globalData.currentImage = data.data;
                        console.log('Image encoded to base64');
                    },
                    fail: (err) => {
                        console.error('Failed to read image', err);
                        wx.showToast({ title: '图片处理失败', icon: 'none' });
                    }
                });
            }
        });
    },

    previewImage() {
        if (this.data.tempImagePath) {
            wx.previewImage({
                urls: [this.data.tempImagePath]
            });
        }
    },

    removeImage() {
        this.setData({
            tempImagePath: ''
        });
        app.globalData.currentImage = null;
    },

    // Unified request processor
    processRequest(targetType) {
        let question = this.data.question.trim();
        const hasImage = !!app.globalData.currentImage;
        const isGodModeActive = wx.getStorageSync('GOD_MODE') || false;
        let isGodTrigger = isGodModeActive;

        // Check for 9527 prefix
        if (question.startsWith('9527')) {
            isGodTrigger = true;
            question = question.substring(4).trim(); // Remove prefix
            // Optionally update UI to reflect stripped question if needed, but for now just use it for logic
        }

        if (!question && !hasImage) {
            wx.showToast({
                title: '请先描述问题或上传图片',
                icon: 'none'
            });
            return;
        }

        wx.showLoading({
            title: '正在分析...',
            mask: true
        });

        const targetAI = isGodTrigger ? aiGod : ai;

        targetAI.validateQuestion(question).then(result => {
            wx.hideLoading();

            // 1. Intercept Invalid Requests (Gatekeeper)
            if (!result.valid) {
                wx.showModal({
                    title: '哎呀',
                    content: result.message || '这个问题有点超纲，我只擅长帮人做决定哦。',
                    showCancel: false,
                    confirmText: '知道了'
                });
                return;
            }

            // 2. Route to correct flow based on User's Button Choice
            
            if (targetType === 'KNOWLEDGE') {
                // "Smart Analysis" Flow -> Result Page
                const resultPage = isGodTrigger ? '../result_god/result_god' : '../result/result';
                
                targetAI.preloadSummary(question, null, 'SIMPLE', 'KNOWLEDGE');
                wx.navigateTo({
                    url: `${resultPage}?question=${encodeURIComponent(question)}&type=KNOWLEDGE`
                });
            } else {
                // "Coin Toss/Divination" Flow
                const complexity = result.complexity || 'COMPLEX';
                if (isGodTrigger) {
                    wx.navigateTo({
                        url: `../divination_god/divination_god?question=${encodeURIComponent(question)}&complexity=${complexity}`
                    });
                } else {
                    wx.navigateTo({
                        url: `../divination/divination?question=${encodeURIComponent(question)}&complexity=${complexity}`
                    });
                }
            }

        }).catch(err => {
            wx.hideLoading();
            console.error(err);
            wx.showModal({
                title: '提示',
                content: '网络连接不畅，是否继续尝试？',
                success: (res) => {
                    if (res.confirm) {
                         // Fallback logic
                        if (targetType === 'KNOWLEDGE') {
                             const resultPage = isGodTrigger ? '../result_god/result_god' : '../result/result';
                            wx.navigateTo({
                                url: `${resultPage}?question=${encodeURIComponent(question)}&type=KNOWLEDGE`
                            });
                        } else {
                            if (isGodTrigger) {
                                wx.navigateTo({
                                    url: `../divination_god/divination_god?question=${encodeURIComponent(question)}&complexity=COMPLEX`
                                });
                            } else {
                                wx.navigateTo({
                                    url: `../divination/divination?question=${encodeURIComponent(question)}&complexity=COMPLEX`
                                });
                            }
                        }
                    }
                }
            });
        });
    },

    // Quick access / Smart Analysis
    directAsk() {
        this.processRequest('KNOWLEDGE');
    },

    // Start Ritual / Coin Toss
    startDivination() {
        this.processRequest('DIVINATION');
    },

    onShareAppMessage() {
        return {
            title: '专治选择困难症，快来试试',
            path: '/pages/index/index'
        };
    },

    onShareTimeline() {
        return {
            title: '专治选择困难症',
            query: 'from=timeline'
        };
    }
})
