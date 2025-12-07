const ai = require('../../utils/ai.js');
const aiGod = require('../../utils/ai_god.js');
const aiSuper = require('../../utils/ai_super.js');
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
        
        // Title Parts for Styling
        titlePrefix: '遇事',
        titleSpecial: '不',
        titleSuffix: '决？',
        
        titleColor: '', // Main color
        specialCharColor: '', // Color for '不'
        
        // AI Button Dynamic
        aiButtonText: '智能分析',
        aiButtonIcon: '💡',

        // Internal State
        tapCount: 0,
        lastTapTime: 0
    },

    onLoad() {
        this.updateUI();
    },

    updateUI() {
        const isGodMode = wx.getStorageSync('GOD_MODE') || false;
        const isSuperGodMode = wx.getStorageSync('SUPER_GOD_MODE') || false;

        let prefix = '遇事';
        let special = '不';
        let suffix = '决？';
        let mainColor = '';
        let specialColor = '';
        let btnText = '智能分析';
        let btnIcon = '💡';

        if (isSuperGodMode) {
            // Level 3: Super God Mode
            suffix = '决！';
            mainColor = this.getRandomColor(); // Base God Mode Color
            specialColor = '#FF0000'; // Special '不' becomes Red (or distinct)
            btnText = '智能AI回答';
            btnIcon = '❗';
        } else if (isGodMode) {
            // Level 2: God Mode
            suffix = '决！';
            mainColor = this.getRandomColor();
            specialColor = mainColor; // Same as main
            btnText = '智能AI回答';
            btnIcon = '❗';
        } else {
            // Level 1: Normal Mode
            suffix = '决？';
            // Colors default (empty string uses CSS)
        }

        this.setData({
            titlePrefix: prefix,
            titleSpecial: special,
            titleSuffix: suffix,
            titleColor: mainColor,
            specialCharColor: specialColor,
            aiButtonText: btnText,
            aiButtonIcon: btnIcon
        });
    },

    getRandomColor() {
        return GOD_MODE_COLORS[Math.floor(Math.random() * GOD_MODE_COLORS.length)];
    },

    // Level 2 Trigger: Long Press
    onTitleLongPress() {
        const currentGodMode = wx.getStorageSync('GOD_MODE') || false;
        const currentSuperMode = wx.getStorageSync('SUPER_GOD_MODE') || false;

        if (currentSuperMode) {
            // If in Super Mode, Reset to Normal
            wx.setStorageSync('SUPER_GOD_MODE', false);
            wx.setStorageSync('GOD_MODE', false);
            wx.showToast({ title: '已重置', icon: 'none' });
        } else {
            // Toggle God Mode (Normal <-> God)
            const newMode = !currentGodMode;
            wx.setStorageSync('GOD_MODE', newMode);
            // Ensure Super Mode is off if turning off God Mode
            if (!newMode) wx.setStorageSync('SUPER_GOD_MODE', false);
        }
        
        this.updateUI();
        wx.vibrateShort({ type: 'heavy' });
    },

    // Level 3 Trigger: Fast Taps (Only valid if already in God Mode)
    onTitleTap() {
        const isGodMode = wx.getStorageSync('GOD_MODE') || false;
        if (!isGodMode) return; // Must be in God Mode first

        const now = Date.now();
        const lastTime = this.data.lastTapTime || 0;
        
        if (now - lastTime < 500) { // 500ms interval for consecutive taps
            this.data.tapCount++;
        } else {
            this.data.tapCount = 1; // Reset count
        }

        this.setData({ lastTapTime: now });

        if (this.data.tapCount >= 5) {
            // Trigger Super God Mode
            const isSuper = wx.getStorageSync('SUPER_GOD_MODE') || false;
            if (!isSuper) {
                 wx.setStorageSync('SUPER_GOD_MODE', true);
                 wx.showToast({ title: '已进入超级模式', icon: 'none' });
                 wx.vibrateLong();
                 this.updateUI();
            }
            this.data.tapCount = 0; // Reset
        }
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
                    },
                    fail: (err) => {
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
        const isSuperGodModeActive = wx.getStorageSync('SUPER_GOD_MODE') || false;
        
        let isGodTrigger = isGodModeActive || isSuperGodModeActive;

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

        const targetAI = isSuperGodModeActive ? aiSuper : (isGodTrigger ? aiGod : ai);

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
                let resultPage = '../result/result';
                if (isSuperGodModeActive) resultPage = '../result_super/result_super';
                else if (isGodTrigger) resultPage = '../result_god/result_god';
                
                // Super God Mode Flag for immediate display
                const skipAnimation = isSuperGodModeActive ? 'true' : 'false';

                targetAI.preloadSummary(question, null, 'SIMPLE', 'KNOWLEDGE');
                wx.navigateTo({
                    url: `${resultPage}?question=${encodeURIComponent(question)}&type=KNOWLEDGE&skip=${skipAnimation}`
                });
            } else {
                // "Coin Toss/Divination" Flow
                const complexity = result.complexity || 'COMPLEX';
                if (isSuperGodModeActive) {
                    wx.navigateTo({
                        url: `../divination_super/divination_super?question=${encodeURIComponent(question)}&complexity=${complexity}`
                    });
                } else if (isGodTrigger) {
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
            // console.error(err); // Removed for cleaner log
            wx.showModal({
                title: '提示',
                content: '网络连接不畅，是否继续尝试？',
                success: (res) => {
                    if (res.confirm) {
                         // Fallback logic
                        if (targetType === 'KNOWLEDGE') {
                             let resultPage = '../result/result';
                             if (isSuperGodModeActive) resultPage = '../result_super/result_super';
                             else if (isGodTrigger) resultPage = '../result_god/result_god';

                             const skipAnimation = isSuperGodModeActive ? 'true' : 'false';
                             
                            wx.navigateTo({
                                url: `${resultPage}?question=${encodeURIComponent(question)}&type=KNOWLEDGE&skip=${skipAnimation}`
                            });
                        } else {
                            if (isSuperGodModeActive) {
                                wx.navigateTo({
                                    url: `../divination_super/divination_super?question=${encodeURIComponent(question)}&complexity=COMPLEX`
                                });
                            } else if (isGodTrigger) {
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
