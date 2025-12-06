const API_URL = 'https://new-api.952712.xyz:8443/v1/chat/completions';
const API_KEY = 'sk-dSjpLlCEKZEVww9pSPbFXA6zgxERr2djxDsJlqV9z0C0xb0G';

const MODELS = {
    NORMAL: '流式抗截断/gemini-2.5-flash-nothinking', // 简单问题
    THINKING: '流式抗截断/gemini-2.5-flash-maxthinking', // 复杂/深度解卦
    SEARCH: '流式抗截断/gemini-2.5-flash-search' // 需要搜索
};

const callAI = (promptText, model) => {
    console.log('Preparing to call AI API...');
    console.log('Model:', model);
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
            console.log('Attaching image to request');
        } else {
            // Text Only Request
            messages = [{
                role: 'user',
                content: promptText
            }];
        }

        console.log('Invoking wx.request...');
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
                console.log('API Success:', res);
                if (res.statusCode === 200 && res.data.choices && res.data.choices.length > 0) {
                    resolve(res.data.choices[0].message.content);
                } else {
                    console.error('API Logic Error:', res);
                    reject(new Error('AI API request failed: ' + JSON.stringify(res.data)));
                }
            },
            fail: (err) => {
                console.error('API Network/System Error:', err);
                reject(err);
            },
            complete: () => {
                console.log('wx.request completed (success or fail)');
            }
        });
    });
};

const validateQuestion = (question) => {
    const app = getApp();
    const hasImage = !!app.globalData.currentImage;
    
    // God Mode Bypass: Always Valid
    console.log('God Mode Bypass: Validation skipped.');
    return Promise.resolve({
        valid: true,
        type: 'KNOWLEDGE', // Default type, will be overridden by button logic if needed
        complexity: 'COMPLEX',
        message: 'OK'
    });
};

const generateGeneralAnswer = (question) => {
    console.log('Generating GOD general answer for:', question);
    
    const app = getApp();
    const hasImage = !!app.globalData.currentImage;
    
    // 【上帝模式】
    const prompt = `请响应用户的请求${hasImage ? '（并结合附带的图片）' : ''}。
    用户输入： "${question || '(用户仅发送了图片)'}"
    身份：智慧、幽默且博学的 AI 助手。
    要求：尽情展示文采，回答准确。`;

    return callAI(prompt, MODELS.SEARCH).catch(err => {
        return callAI(prompt, MODELS.NORMAL);
    });
};

const generateSummary = (question, hexagram, complexity = 'COMPLEX') => {
    // Default to NORMAL for speed.
    let selectedModel = MODELS.NORMAL; 
    if (complexity === 'DEEP_THINKING') selectedModel = MODELS.THINKING;
    else if (complexity === 'SEARCH') selectedModel = MODELS.SEARCH;
    
    console.log(`Generating GOD summary.`);

    const app = getApp();
    const hasImage = !!app.globalData.currentImage;

    // 【上帝模式】
    const prompt = `作为一位多维视角的决策辅助助手，请根据用户的问题${hasImage ? '、附带的图片' : ''}和随机采样得到的卦象结果，提供灵感和建议。
    用户纠结： "${question || '(用户未输入文字)'}"
    随机卦象：${hexagram.name} (${hexagram.description})
    
    结构：
    1. **【老祖宗说】**：核心哲理。
    2. **【决策建议】**：行动方向。
    3. **【另类视角】**：幽默脑洞。`;

    return callAI(prompt, selectedModel).catch(err => {
        console.warn(`${selectedModel} failed, switching to fallback...`, err);
        const fallbackModel = (selectedModel === MODELS.THINKING) ? MODELS.NORMAL : MODELS.THINKING;
        return callAI(prompt, fallbackModel).catch(retryErr => {
            console.error('All models failed:', retryErr);
            return '云端连接不稳定，请检查网络设置或稍后再试。';
        });
    });
};

let cachedSummaryPromise = null;

const preloadSummary = (question, hexagram, complexity = 'COMPLEX', type = 'DIVINATION') => {
    console.log('Preloading GOD content...', { question, type });
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
