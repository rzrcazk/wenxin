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

    if ((!question || question.trim().length < 1) && !hasImage) {
        return Promise.resolve({
            valid: false,
            message: '字数太少啦，多写几个字 AI 才能读懂哦 😂'
        });
    }

    const prompt = `请分析以下用户输入的文本${hasImage ? '和附带的图片' : ''}。
    任务：
    1. 判断输入内容是否具有“语义”或“咨询价值”。
       - 如果有图片，通常视为有效（valid=true），除非图片明显是误操作（如全黑全白）。
       - 如果仅有文本且是乱码，则 valid=false。
    2. 判断类型（Type）：
       - "KNOWLEDGE": 通用知识、百科、闲聊、科学事实，或者**单纯要求解读图片内容**（例如“这是什么花”、“帮我看看这个手相说明了什么”）。
       - "DIVINATION": 涉及个人运势、事业、感情抉择、玄学咨询。**注意**：如果用户发了手相、面相图求测，或者发了环境图问风水，请归类为 "DIVINATION"。
    3. 复杂度判断（仅针对 DIVINATION）：
       - "SIMPLE": 简单祝福。
       - "COMPLEX": 深度咨询（手相、风水、复杂问题）。
    
    返回格式（JSON）：
    {
       "valid": boolean,
       "type": "KNOWLEDGE" | "DIVINATION" | "INVALID",
       "complexity": "SIMPLE" | "SEARCH" | "COMPLEX",
       "message": "如果无效，请在此生成一句俏皮、幽默的吐槽；如果有效，留空。"
    }

    用户文本： "${question || '(用户未输入文本，仅上传了图片)'}"
    
    请直接返回 JSON 字符串，不要包含 Markdown 标记。`;

    return callAI(prompt, MODELS.NORMAL).then(response => {
        try {
            // 清理可能存在的 Markdown 标记
            const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(cleanResponse);
            
            // 兼容旧逻辑，如果没有 type 字段，根据 complexity 推断
            let type = result.type;
            if (!type) {
                if (result.complexity === 'SEARCH') type = 'KNOWLEDGE';
                else type = 'DIVINATION';
            }

            return {
                valid: result.valid,
                type: type || 'DIVINATION',
                complexity: result.complexity || 'COMPLEX',
                message: result.message || 'OK'
            };
        } catch (e) {
            console.error('JSON Parse Error:', e, response);
            // Fallback strategy
            return { valid: true, type: 'DIVINATION', complexity: 'COMPLEX', message: 'OK' };
        }
    }).catch(err => {
        console.error('Validation failed:', err);
        // Network fail fallback -> assume valid complex divination
        return {
            valid: true,
            type: 'DIVINATION',
            complexity: 'COMPLEX',
            message: 'OK'
        };
    });
};

const generateGeneralAnswer = (question) => {
    console.log('Generating general answer for:', question);
    const app = getApp();
    const hasImage = !!app.globalData.currentImage;
    
    const prompt = `请响应用户的请求${hasImage ? '（并结合附带的图片）' : ''}。
    用户输入： "${question || '(用户仅发送了图片)'}"
    
    你的身份：你是一个智慧、幽默且博学的 AI 助手。
    
    核心原则：
    1. **识别真实意图**：
       - 如果用户要求**创意写作**（如“写个笑话”、“给出类似的排比句”、“仿写毒蛇毒舌”），请**直接满足**，尽情展示你的文采和幽默感，**不要**去解释科学原理（除非用户问的是科学问题）。
       - 如果用户问**事实/科普**（如“这是什么花”、“电鳗为什么有电”），则提供准确、通俗的科学解答。
       - 如果用户在**闲聊**，请用轻松、有趣的语气回应。
    
    2. **关于图片**：如果用户上传了图片，请务必描述并分析图片内容。
    
    3. **格式要求**：
       - 字数控制在 200 字左右（若是创作类可适当灵活）。
       - 语气自然，不要有 AI 味。
       - 使用中文。`;

    return callAI(prompt, MODELS.SEARCH).catch(err => {
        return callAI(prompt, MODELS.NORMAL);
    });
};

const generateSummary = (question, hexagram, complexity = 'COMPLEX') => {
    // Default to NORMAL for speed.
    // Only use THINKING if explicitly requested via a new complexity level (future proofing)
    // or if we decide 'COMPLEX' really needs it. But user asked for speed.
    let selectedModel = MODELS.NORMAL; 

    if (complexity === 'DEEP_THINKING') {
        selectedModel = MODELS.THINKING;
    } else if (complexity === 'SEARCH') {
        selectedModel = MODELS.SEARCH; 
    }
    
    console.log(`Generating summary using model: ${selectedModel} for complexity: ${complexity}`);

    const app = getApp();
    const hasImage = !!app.globalData.currentImage;

    const prompt = `作为一位多维视角的决策辅助助手，请根据用户的问题${hasImage ? '、附带的图片' : ''}和随机采样得到的卦象结果，提供灵感和建议。
    用户纠结： "${question || '(用户未输入文字，请基于图片和卦象分析)'}"
    随机卦象：${hexagram.name} (${hexagram.description})
    
    请不要算命，也不要预测未来。利用这个卦象的隐喻，为用户提供三个不同视角的解读，帮助他/她打破思维定势。
    
    【回复结构】：
    1. **【老祖宗说】**：用通俗、现代的语言解释这个卦象的核心哲理，就像一位睿智的老爷爷在讲道理。（约 60 字）
    2. **【决策建议】**：针对用户的纠结，给出一个干脆利落的行动方向（冲 / 稳住 / 换条路 / 躺平）。（约 60 字）
    3. **【另类视角】**：用幽默、反转、略带毒舌或脑洞大开的语气，点破用户的小心思，或者给出一个意想不到的解释。（约 60 字）
    
    回复要求：
    - 严禁使用迷信断语（如“吉凶”、“祸福”、“注定”）。
    - 语气轻松有趣，不沉重。
    - 必须包含以上三个标题。
    - 总字数控制在 200 字左右。`;

    return callAI(prompt, selectedModel).catch(err => {
        console.warn(`${selectedModel} failed, switching to normal/thinking fallback...`, err);
        // 降级策略
        const fallbackModel = (selectedModel === MODELS.THINKING) ? MODELS.NORMAL : MODELS.THINKING;
        return callAI(prompt, fallbackModel).catch(retryErr => {
            console.error('All models failed:', retryErr);
            return '云端连接不稳定，请检查网络设置或稍后再试。（大师正在闭关中...）';
        });
    });
};

let cachedSummaryPromise = null;

const preloadSummary = (question, hexagram, complexity = 'COMPLEX', type = 'DIVINATION') => {
    console.log('Preloading content...', { question, type });
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
