// utils/iching-data.js

const hexagramsData = {
    "111111": {
        name: "乾",
        pinyin: "Qián",
        judgment: "乾：元，亨，利，贞。",
        image: "天行健，君子以自强不息。",
        lines: {
            1: "初九：潜龙，勿用。",
            2: "九二：见龙在田，利见大人。",
            3: "九三：君子终日乾乾，夕惕若，厉，无咎。",
            4: "九四：或跃在渊，无咎。",
            5: "九五：飞龙在天，利见大人。",
            6: "上九：亢龙，有悔。",
            7: "用九：见群龙无首，吉。" // Special case for Qian
        }
    },
    "000000": {
        name: "坤",
        pinyin: "Kūn",
        judgment: "坤：元，亨，利牝马之贞。君子有攸往，先迷后得主，利西南得朋，东北丧朋。安贞，吉。",
        image: "地势坤，君子以厚德载物。",
        lines: {
            1: "初六：履霜，坚冰至。",
            2: "六二：直，方，大，不习无不利。",
            3: "六三：含章可贞。或从王事，无成有终。",
            4: "六四：括囊；无咎，无誉。",
            5: "六五：黄裳，元吉。",
            6: "上六：龙战于野，其血玄黄。",
            7: "用六：利永贞。" // Special case for Kun
        }
    },
    // ... Add more hexagrams as needed. 
    // For the purpose of the demo, we will handle missing data gracefully in the logic.
};

module.exports = {
    hexagramsData
};
