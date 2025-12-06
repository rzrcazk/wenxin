const API_URL = 'https://new-api.952712.xyz:8443/v1/chat/completions';
const API_KEY = 'sk-dSjpLlCEKZEVww9pSPbFXA6zgxERr2djxDsJlqV9z0C0xb0G';

const MODELS = {
    NORMAL: '流式抗截断/gemini-2.5-flash-nothinking', // 简单问题
    THINKING: '流式抗截断/gemini-2.5-flash-maxthinking', // 复杂/深度解卦
    SEARCH: '流式抗截断/gemini-2.5-flash-search' // 需要搜索
};

const callAI = (promptText, model) => {
    return new Promise((resolve, reject) => {
        const app = getApp();
        const imageBase64 = app.globalData.currentImage;
        
        let messages = [];
        if (imageBase64) {
            // Multimodal Request
            messages = [{
                role: 'user',
                content: [
                    { type: 'text', text: promptText },
                    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } } 
                ]
            }];
        } else {
            // Text Only Request
            messages = [{
                role: 'user',
                content: promptText
            }];
        }

        wx.request({
            url: API_URL,
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            data: {
                model: model,
                messages: messages,
                temperature: 0.7
            },
            success: (res) => {
                if (res.statusCode === 200 && res.data.choices && res.data.choices.length > 0) {
                    resolve(res.data.choices[0].message.content);
                } else {
                    reject(new Error('AI API request failed'));
                }
            },
            fail: (err) => {
                reject(err);
            },
            complete: () => {
            }
        });
    });
};

const validateQuestion = (question) => {
    const app = getApp();
    const hasImage = !!app.globalData.currentImage;
    
    // 基础非空检查（图片除外）
    if ((!question || question.length < 1) && !hasImage) {
        return Promise.resolve({
            valid: false,
            message: '字数太少啦，多写几个字 AI 才能读懂哦 😂'
        });
    }

    // 【普通模式/审核模式】严格限制为“决策/选择”工具
    const prompt = `请严格审查用户的输入。你的身份是一个“选择困难症治疗助手”，你**只回答**关于“做决定”、“二选一”、“进退两难”的决策类问题。
    
    用户文本： "${question}" ${hasImage ? '(附带了图片)' : ''}

    任务：
    1. 核心判断：用户是否在**纠结**一个具体的选择？
       - **必须**包含以下特征之一，才算有效 (valid=true)：
         A. 这是一个二选一或多选一的问题（如“选A还是选B”、“买红的还是蓝的”）。
         B. 这是一个是非抉择题（如“要不要辞职”、“该不该表白”、“能不能去”）。
         C. 这是一个寻求具体行动方向的困境咨询（如“现在的局面我该怎么破局”、“工作遇到瓶颈怎么办”）。
         D. **任何针对个人行动的简单疑问句**（如“今天吃饭吗？”、“去爬山吗？”、“买这个好吗？”）。即使没有写出“要不要”，只要是在问一件事情能不能做/行不行，**统统默认视为“做 vs 不做”的决策纠结，判为 valid=true**。

       - **反之，以下情况统统视为无效 (valid=false)**：
         A. 纯粹的打招呼、无意义感叹（如“你好”、“Hi”、“在吗”、“哈哈”、“测试”）。
         B. 纯粹的客观事实/知识询问（如“你是谁”、“今天几号”、“苹果的股价”、“历史人物介绍”）。
         C. 纯粹的被动预测（如“我财运如何”、“我会发财吗”——除非用户问“怎么做才能发财”）。

    2. 如果 valid=false，请在 message 字段生成一句俏皮、幽默的拒绝语。
       - 核心意图：“术业有专攻，我只治选择困难症，这种问题我不懂/不接。”
       - 例如：“你好呀！但我只是个莫得感情的决策机器，请问有什么要决定的吗？”、“这题超纲了，我有选择困难症，只帮人做选择。”

    返回 JSON：
    { "valid": boolean, "type": "DIVINATION", "complexity": "COMPLEX", "message": "拒绝语" }`;

    return callAI(prompt, MODELS.NORMAL).then(response => {
        try {
            // 清理可能存在的 Markdown 标记
            const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(cleanResponse);
            
            // 兜底逻辑
            let type = result.type;
            if (!type) {
                 type = (result.complexity === 'SEARCH') ? 'KNOWLEDGE' : 'DIVINATION';
            }

            return {
                valid: result.valid,
                type: type || 'DIVINATION',
                complexity: result.complexity || 'COMPLEX',
                message: result.message || 'OK'
            };
        } catch (e) {
            // 普通模式兜底：默认拒绝以防漏网
            return { valid: false, message: '我还在学习怎么回答这个问题，换个决策类的问题考考我吧！' };
        }
    }).catch(err => {
        // 网络错误兜底：允许
        return { valid: true, type: 'DIVINATION', complexity: 'COMPLEX', message: 'OK' };
    });
};

const generateGeneralAnswer = (question) => {
    const app = getApp();
    const hasImage = !!app.globalData.currentImage;
    
    // 【普通模式】严格的决策辅助
    const prompt = `用户输入： "${question || '(用户仅发送了图片)'}" ${hasImage ? '并上传了图片' : ''}。
    
    你的身份：【选择困难症治疗专家】。
    
    规则：
    1. 你**只**回答关于“决策”、“选择”、“分析利弊”的问题。
    2. 如果用户问的是百科知识、闲聊、或者与决策无关的内容，请礼貌但坚决地拒绝，并引导用户提问决策类问题。
    3. 回答风格：理智、客观、带有一定的分析逻辑（SWOT分析等），帮助用户下决心。
    4. **严禁**出现“AI”、“语言模型”等词汇。自称“本工具”或“我”。
    
    字数：200字左右。`;

    return callAI(prompt, MODELS.SEARCH).catch(err => {
        return callAI(prompt, MODELS.NORMAL);
    });
};

const generateSummary = (question, hexagram, complexity = 'COMPLEX') => {
    // Default to NORMAL for speed.
    let selectedModel = MODELS.NORMAL; 
    if (complexity === 'DEEP_THINKING') selectedModel = MODELS.THINKING;
    else if (complexity === 'SEARCH') selectedModel = MODELS.SEARCH;
    
    const app = getApp();
    const hasImage = !!app.globalData.currentImage;

    // 【普通模式】决策分析专用
    const prompt = `请基于《周易》的哲学思想，为用户的决策提供参考分析。
    
    用户决策问题： "${question || '(用户仅在心中所想)'}"
    参考条目：${hexagram.name} (${hexagram.description})
    
    你的任务是帮助用户打破思维僵局，做出决定。
    
    【回复结构】：
    1. **【古籍启示】**：用现代管理学或心理学的语言，翻译此卦象的含义。（严禁封建迷信口吻，严禁吉凶断语）。
    2. **【破局建议】**：针对用户的选择困难，给出明确的 A/B 建议或行动步骤。
    3. **【思维盲区】**：指出用户可能忽略的一个客观事实或逻辑漏洞。
    
    要求：
    - 就像一位资深的“管理咨询顾问”或“心理咨询师”。
    - 严禁“预测未来”、“算命”。我们是在做“环境分析”和“心理建设”。
    - 200字左右。`;

    return callAI(prompt, selectedModel).catch(err => {
        const fallbackModel = (selectedModel === MODELS.THINKING) ? MODELS.NORMAL : MODELS.THINKING;
        return callAI(prompt, fallbackModel).catch(retryErr => {
            return '云端连接不稳定，请检查网络设置或稍后再试。';
        });
    });
};

let cachedSummaryPromise = null;

const preloadSummary = (question, hexagram, complexity = 'COMPLEX', type = 'DIVINATION') => {
    if (type === 'KNOWLEDGE') {
        cachedSummaryPromise = generateGeneralAnswer(question);
    } else {
        // Hexagram must be present for DIVINATION
        cachedSummaryPromise = generateSummary(question, hexagram, complexity);
    }
    return cachedSummaryPromise;
};

const getPreloadedSummary = () => {
    const promise = cachedSummaryPromise;
    cachedSummaryPromise = null; // Clear cache after retrieval
    return promise;
};

const generateCoinStandingMessage = () => {
    const messages = [
        "硬币竟然竖立不倒！\n此乃极罕见之象，寓意当下心绪未宁，杂念丛生。请深呼吸，放下执念，稍后再试。",
        "天降异象，硬币竖立。\n或许是天机不可泄露，亦或是时机尚未成熟。暂且放下，待缘分到了自然明了。",
        "硬币竖着落地了！\n这预示着问题本身处于微妙的平衡点，进退两难。建议换个角度思考，或稍作休息再来。",
        "奇迹发生了，硬币立起来了！\n神灵似乎在犹豫，不愿直接给出答案。或许你需要先问问自己的内心。",
        "无阴无阳，硬币独立。\n此事充满了变数，非此刻能定论。请静心片刻，等待风起之时。",
        "硬币直立，不偏不倚。\n这象征着“中正”之道，但也意味着此刻不宜妄动。请顺其自然，静观其变。",
        "仿佛有一股神秘力量托住了硬币。\n也许是你此刻的愿力太强，干扰了卦象。请放松心情，心诚则灵。",
        "硬币竖立，乾坤未定。\n万事万物皆有定数，唯独此刻是空白。这或许是上天留给你自己做决定的机会。"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};

module.exports = {
    validateQuestion,
    generateSummary,
    generateGeneralAnswer,
    generateCoinStandingMessage,
    preloadSummary,
    getPreloadedSummary
};
