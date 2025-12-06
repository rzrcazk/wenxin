const ai = require('../../utils/ai.js');
const app = getApp();

Page({
    data: {
        question: '',
        tempImagePath: ''
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

    // Quick access to AI answer without divination ritual
    directAsk() {
        const question = this.data.question.trim();
        const hasImage = !!app.globalData.currentImage;

        if (!question && !hasImage) {
            wx.showToast({
                title: '请先描述问题或上传图片',
                icon: 'none'
            });
            return;
        }

        // Directly preload as KNOWLEDGE type
        // Use 'SIMPLE' complexity for faster response if appropriate, or keep defaults
        ai.preloadSummary(question, null, 'SIMPLE', 'KNOWLEDGE');
        
        // Navigate to Result page in "Knowledge Mode"
        wx.navigateTo({
            url: `../result/result?question=${encodeURIComponent(question)}&type=KNOWLEDGE`
        });
    },

    startDivination() {
        const question = this.data.question.trim();
        const hasImage = !!app.globalData.currentImage;

        if (!question && !hasImage) {
            wx.showToast({
                title: '请描述问题或上传图片',
                icon: 'none'
            });
            return;
        }

        wx.showLoading({
            title: '正在准备...',
            mask: true
        });

        ai.validateQuestion(question).then(result => {
            wx.hideLoading();
            // result 现在是一个对象 { valid: boolean, message: string, complexity: string, type: string }
            if (!result.valid) {
                wx.showToast({
                    title: result.message, // 显示AI生成的俏皮话
                    icon: 'none',
                    duration: 3000 // 增加显示时间，让用户看清
                });
                return;
            }

            // Check for KNOWLEDGE type (General questions)
            if (result.type === 'KNOWLEDGE') {
                wx.showModal({
                    title: '提示',
                    content: '这个问题似乎属于科普/通用知识范畴，您想要？',
                    cancelText: '普通回答', // Left button
                    confirmText: '深度分析', // Right button
                    success: (res) => {
                        if (res.confirm) {
                            // User chose "Force Divination" -> Deep Analysis
                            wx.navigateTo({
                                url: `../divination/divination?question=${encodeURIComponent(question)}&complexity=COMPLEX`
                            });
                        } else if (res.cancel) {
                            // User chose "General Answer"
                            // Preload the general answer immediately
                            ai.preloadSummary(question, null, 'SIMPLE', 'KNOWLEDGE');
                            // Navigate to Result page in "Knowledge Mode"
                            wx.navigateTo({
                                url: `../result/result?question=${encodeURIComponent(question)}&type=KNOWLEDGE`
                            });
                        }
                    }
                });
                return;
            }
            
            // Standard Divination Flow
            const complexity = result.complexity || 'COMPLEX';
            wx.navigateTo({
                url: `../divination/divination?question=${encodeURIComponent(question)}&complexity=${complexity}`
            })
        }).catch(err => {
            wx.hideLoading();
            console.error(err);
            wx.showModal({
                title: '提示',
                content: '网络连接不畅，是否继续尝试？',
                success: (res) => {
                    if (res.confirm) {
                        // Fallback to COMPLEX if validation fails
                        wx.navigateTo({
                            url: `../divination/divination?question=${encodeURIComponent(question)}&complexity=COMPLEX`
                        })
                    }
                }
            });
        });
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
