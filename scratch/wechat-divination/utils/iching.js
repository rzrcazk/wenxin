const { hexagramsData } = require('./iching-data.js');

const hexagrams = {
    "111111": { name: "乾为天", pinyin: "Qián", description: "元亨利贞。天行健，君子以自强不息。" },
    "000000": { name: "坤为地", pinyin: "Kūn", description: "元亨利牝马之贞。地势坤，君子以厚德载物。" },
    // ... (keep existing hexagrams for fallback/names)
    "100010": { name: "水雷屯", pinyin: "Zhūn", description: "元亨利贞。勿用有攸往，利建侯。" },
    "010001": { name: "山水蒙", pinyin: "Méng", description: "亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。利贞。" },
    "111010": { name: "水天需", pinyin: "Xū", description: "有孚，光亨，贞吉。利涉大川。" },
    "010111": { name: "天水讼", pinyin: "Sòng", description: "有孚，窒。惕中吉。终凶。利见大人，不利涉大川。" },
    "010000": { name: "地水师", pinyin: "Shī", description: "贞，丈人，吉无咎。" },
    "000010": { name: "水地比", pinyin: "Bǐ", description: "吉。原筮元永贞，无咎。不宁方来，后夫凶。" },
    "111011": { name: "风天小畜", pinyin: "Xiǎo Chù", description: "亨。密云不雨，自我西郊。" },
    "110111": { name: "天泽履", pinyin: "Lǚ", description: "履虎尾，不咥人，亨。" },
    "111000": { name: "地天泰", pinyin: "Tài", description: "小往大来，吉亨。" },
    "000111": { name: "天地否", pinyin: "Pǐ", description: "否之匪人，不利君子贞，大往小来。" },
    "101111": { name: "天火同人", pinyin: "Tóng Rén", description: "同人于野，亨。利涉大川，利君子贞。" },
    "111101": { name: "火天大有", pinyin: "Dà Yǒu", description: "元亨。" },
    "001000": { name: "地山谦", pinyin: "Qiān", description: "亨，君子有终。" },
    "000100": { name: "雷地豫", pinyin: "Yù", description: "利建侯行师。" },
    "100110": { name: "泽雷随", pinyin: "Suí", description: "元亨利贞，无咎。" },
    "011001": { name: "山风蛊", pinyin: "Gǔ", description: "元亨，利涉大川。先甲三日，后甲三日。" },
    "110000": { name: "地泽临", pinyin: "Lín", description: "元亨利贞。至于八月有凶。" },
    "000011": { name: "风地观", pinyin: "Guān", description: "盥而不荐，有孚颙若。" },
    "100101": { name: "火雷噬嗑", pinyin: "Shì Kè", description: "亨。利用狱。" },
    "101001": { name: "山火贲", pinyin: "Bì", description: "亨。小利有攸往。" },
    "000001": { name: "山地剥", pinyin: "Bō", description: "不利有攸往。" },
    "100000": { name: "地雷复", pinyin: "Fù", description: "亨。出入无疾，朋来无咎。反复其道，七日来复，利有攸往。" },
    "100111": { name: "天雷无妄", pinyin: "Wú Wàng", description: "元亨利贞。其匪正有眚，不利有攸往。" },
    "111001": { name: "山天大畜", pinyin: "Dà Chù", description: "利贞，不家食吉，利涉大川。" },
    "100001": { name: "山雷颐", pinyin: "Yí", description: "贞吉。观颐，自求口实。" },
    "011110": { name: "泽风大过", pinyin: "Dà Guò", description: "栋桡，利有攸往，亨。" },
    "010010": { name: "坎为水", pinyin: "Kǎn", description: "习坎，有孚，维心亨，行有尚。" },
    "101101": { name: "离为火", pinyin: "Lí", description: "利贞，亨。畜牝牛，吉。" },
    "001110": { name: "泽山咸", pinyin: "Xián", description: "亨，利贞，取女吉。" },
    "011100": { name: "雷风恒", pinyin: "Héng", description: "亨，无咎，利贞，利有攸往。" },
    "001111": { name: "天山遁", pinyin: "Dùn", description: "亨，小利贞。" },
    "111100": { name: "雷天大壮", pinyin: "Dà Zhuàng", description: "利贞。" },
    "000101": { name: "火地晋", pinyin: "Jìn", description: "康侯用锡马蕃庶，昼日三接。" },
    "101000": { name: "地火明夷", pinyin: "Míng Yí", description: "利艰贞。" },
    "101011": { name: "风火家人", pinyin: "Jiā Rén", description: "利女贞。" },
    "110101": { name: "火泽睽", pinyin: "Kuí", description: "小事吉。" },
    "001010": { name: "水山蹇", pinyin: "Jiǎn", description: "利西南，不利东北；利见大人，贞吉。" },
    "010100": { name: "雷水解", pinyin: "Xiè", description: "利西南，无所往，其来复吉。有攸往，夙吉。" },
    "110001": { name: "山泽损", pinyin: "Sǔn", description: "有孚，元吉，无咎，可贞，利有攸往。曷之用，二簋可用享。" },
    "100011": { name: "风雷益", pinyin: "Yì", description: "利有攸往，利涉大川。" },
    "111110": { name: "泽天夬", pinyin: "Guài", description: "扬于王庭，孚号，有厉，告自邑，不利即戎，利有攸往。" },
    "011111": { name: "天风姤", pinyin: "Gòu", description: "女壮，勿用取女。" },
    "000110": { name: "泽地萃", pinyin: "Cuì", description: "亨。王假有庙，利见大人，亨，利贞。用大牲吉，利有攸往。" },
    "011000": { name: "地风升", pinyin: "Shēng", description: "元亨，用见大人，勿恤，南征吉。" },
    "010110": { name: "泽水困", pinyin: "Kùn", description: "亨，贞，大人吉，无咎，有言不信。" },
    "011010": { name: "水风井", pinyin: "Jǐng", description: "改邑不改井，无丧无得，往来井井。汔至，亦未繘井，羸其瓶，凶。" },
    "101110": { name: "泽火革", pinyin: "Gé", description: "己日乃孚，元亨利贞，悔亡。" },
    "011101": { name: "火风鼎", pinyin: "Dǐng", description: "元吉，亨。" },
    "100100": { name: "震为雷", pinyin: "Zhèn", description: "亨。震来虩虩，笑言哑哑。震惊百里，不丧匕鬯。" },
    "001001": { name: "艮为山", pinyin: "Gèn", description: "艮其背，不获其身，行其庭，不见其人，无咎。" },
    "001011": { name: "风山渐", pinyin: "Jiàn", description: "女归吉，利贞。" },
    "110100": { name: "雷泽归妹", pinyin: "Guī Mèi", description: "征凶，无攸利。" },
    "101100": { name: "雷火丰", pinyin: "Fēng", description: "亨，王假之，勿忧，宜日中。" },
    "001101": { name: "火山旅", pinyin: "Lǚ", description: "小亨，旅贞吉。" },
    "011011": { name: "巽为风", pinyin: "Xùn", description: "小亨，利有攸往，利见大人。" },
    "110110": { name: "兑为泽", pinyin: "Duì", description: "亨，利贞。" },
    "010011": { name: "风水涣", pinyin: "Huàn", description: "亨。王假有庙，利涉大川，利贞。" },
    "110010": { name: "水泽节", pinyin: "Jié", description: "亨。苦节，不可贞。" },
    "110011": { name: "风泽中孚", pinyin: "Zhōng Fú", description: "豚鱼吉，利涉大川，利贞。" },
    "001100": { name: "雷山小过", pinyin: "Xiǎo Guò", description: "亨，利贞。可小事，不可大事。飞鸟遗之音，不宜上，宜下，大吉。" },
    "101010": { name: "水火既济", pinyin: "Jì Jì", description: "亨，小利贞，初吉终乱。" },
    "010101": { name: "火水未济", pinyin: "Wèi Jì", description: "亨，小狐汔济，濡其尾，无攸利。" }
};

// King Wen Sequence Mapping (Binary Key -> Index 0-63)
// Note: Unicode 4DC0 is Hexagram 1 (Qian), 4DC1 is Hexagram 2 (Kun), etc.
// We need to map our binary keys to the King Wen index (1-64).
const kingWenSequence = {
    "111111": 1, "000000": 2, "100010": 3, "010001": 4, "111010": 5, "010111": 6, "010000": 7, "000010": 8,
    "111011": 9, "110111": 10, "111000": 11, "000111": 12, "101111": 13, "111101": 14, "001000": 15, "000100": 16,
    "100110": 17, "011001": 18, "110000": 19, "000011": 20, "100101": 21, "101001": 22, "000001": 23, "100000": 24,
    "100111": 25, "111001": 26, "100001": 27, "011110": 28, "010010": 29, "101101": 30, "001110": 31, "011100": 32,
    "001111": 33, "111100": 34, "000101": 35, "101000": 36, "101011": 37, "110101": 38, "001010": 39, "010100": 40,
    "110001": 41, "100011": 42, "111110": 43, "011111": 44, "000110": 45, "011000": 46, "010110": 47, "011010": 48,
    "101110": 49, "011101": 50, "100100": 51, "001001": 52, "001011": 53, "110100": 54, "101100": 55, "001101": 56,
    "011011": 57, "110110": 58, "010011": 59, "110010": 60, "110011": 61, "001100": 62, "101010": 63, "010101": 64
};

function getHexagramSymbol(key) {
    const index = kingWenSequence[key];
    if (index) {
        // Unicode 4DC0 is index 0. So Hexagram 1 is 4DC0 + 0.
        const codePoint = 0x4DC0 + (index - 1);
        return String.fromCodePoint(codePoint);
    }
    return "";
}

/**
 * Calculates the hexagram based on 6 lines.
 * @param {Array<number>} lines - Array of 6 numbers (6, 7, 8, 9), from bottom to top.
 * @returns {Object} Hexagram info.
 */
function getHexagram(lines) {
    let key = "";
    for (let i = 0; i < 6; i++) {
        const val = lines[i];
        if (val === 7 || val === 9) {
            key += "1";
        } else {
            key += "0";
        }
    }

    // Merge basic info with detailed data if available
    const basicInfo = hexagrams[key] || { name: "未知", description: "无法解析卦象" };
    const detailedInfo = hexagramsData[key] || {};
    const symbol = getHexagramSymbol(key);

    return { ...basicInfo, ...detailedInfo, key, symbol };
}

/**
 * Calculates the transformed hexagram (Zhi Gua) by flipping moving lines.
 * @param {Array<number>} lines - Original lines.
 * @returns {Object} Transformed hexagram info.
 */
function getTransformedHexagram(lines) {
    const newLines = lines.map(val => {
        if (val === 6) return 7; // Old Yin -> Young Yang
        if (val === 9) return 8; // Old Yang -> Young Yin
        return val;
    });
    return getHexagram(newLines);
}

/**
 * Analyzes the divination result using Zhu Xi's 7 Rules.
 * @param {Array<number>} lines - Array of 6 numbers (6, 7, 8, 9), from bottom to top.
 * @returns {Object} Analysis result containing text, type, and explanation.
 */
function analyzeResult(lines) {
    const originalHex = getHexagram(lines);
    const transformedHex = getTransformedHexagram(lines);

    const movingLines = [];
    lines.forEach((val, index) => {
        if (val === 6 || val === 9) {
            movingLines.push({ index: index + 1, value: val });
        }
    });

    const count = movingLines.length;
    let result = {
        title: originalHex.name,
        type: 'hexagram',
        text: '',
        explanation: '',
        focusLine: null, // 1-6
        isTransformed: false // Whether we are reading the Transformed Hexagram
    };

    // Zhu Xi's 7 Rules
    if (count === 0) {
        // 1. Six lines unchanged: Read Original Hexagram Judgment.
        result.text = originalHex.judgment || originalHex.description;
        result.explanation = "六爻安静，以本卦卦辞占。";

    } else if (count === 1) {
        // 2. One line changes: Read Original Hexagram's Moving Line.
        const focus = movingLines[0];
        result.type = 'line';
        result.focusLine = focus.index;
        const lineText = originalHex.lines ? originalHex.lines[focus.index] : null;
        result.text = lineText || (originalHex.description + "\n(注：该爻辞暂缺，请参考本卦卦辞及下方大师详解)");
        result.explanation = `一爻变（${['初', '二', '三', '四', '五', '上'][focus.index - 1]}爻），以本卦变爻爻辞占。`;

    } else if (count === 2) {
        // 3. Two lines change: Read Original Hexagram's Upper Moving Line.
        const focus = movingLines[1]; // The upper one (index 1 in array of 2)
        result.type = 'line';
        result.focusLine = focus.index;
        const lineText = originalHex.lines ? originalHex.lines[focus.index] : null;
        result.text = lineText || (originalHex.description + "\n(注：该爻辞暂缺，请参考本卦卦辞及下方大师详解)");
        result.explanation = `两爻变，以本卦上变爻（${['初', '二', '三', '四', '五', '上'][focus.index - 1]}爻）爻辞占。`;

    } else if (count === 3) {
        // 4. Three lines change
        result.text = originalHex.judgment || originalHex.description;
        result.explanation = `三爻变，以本卦卦辞占，并参考之卦（${transformedHex.name}）。`;

    } else if (count === 4) {
        // 5. Four lines change: Read Transformed Hexagram's Lower Static Line.
        const staticLines = [];
        lines.forEach((val, index) => {
            if (val === 7 || val === 8) staticLines.push(index + 1);
        });
        const focusIndex = staticLines[0];
        result.type = 'line';
        result.isTransformed = true;
        result.focusLine = focusIndex;
        result.title = transformedHex.name + " (之卦)";
        
        const lineText = transformedHex.lines ? transformedHex.lines[focusIndex] : null;
        result.text = lineText || (transformedHex.description + "\n(注：该爻辞暂缺，请参考之卦卦辞及下方大师详解)");
        result.explanation = `四爻变，以之卦（${transformedHex.name}）下静爻（${['初', '二', '三', '四', '五', '上'][focusIndex - 1]}爻）爻辞占。`;

    } else if (count === 5) {
        // 6. Five lines change: Read Transformed Hexagram's Static Line.
        const staticLines = [];
        lines.forEach((val, index) => {
            if (val === 7 || val === 8) staticLines.push(index + 1);
        });
        const focusIndex = staticLines[0];
        result.type = 'line';
        result.isTransformed = true;
        result.focusLine = focusIndex;
        result.title = transformedHex.name + " (之卦)";
        
        const lineText = transformedHex.lines ? transformedHex.lines[focusIndex] : null;
        result.text = lineText || (transformedHex.description + "\n(注：该爻辞暂缺，请参考之卦卦辞及下方大师详解)");
        result.explanation = `五爻变，以之卦（${transformedHex.name}）静爻（${['初', '二', '三', '四', '五', '上'][focusIndex - 1]}爻）爻辞占。`;

    } else if (count === 6) {
        // 7. Six lines change: 
        // If Qian: Use "Yong Jiu". If Kun: Use "Yong Liu".
        // Else: Read Transformed Hexagram Judgment.
        if (originalHex.key === "111111") {
            result.type = 'line';
            result.text = originalHex.lines[7]; // Yong Jiu
            result.explanation = "乾卦六爻皆变，以'用九'占。";
        } else if (originalHex.key === "000000") {
            result.type = 'line';
            result.text = originalHex.lines[7]; // Yong Liu
            result.explanation = "坤卦六爻皆变，以'用六'占。";
        } else {
            result.title = transformedHex.name + " (之卦)";
            result.text = transformedHex.judgment || transformedHex.description;
            result.explanation = `六爻皆变，以之卦（${transformedHex.name}）卦辞占。`;
        }
    }

    return result;
}

module.exports = {
    getHexagram,
    analyzeResult
};

