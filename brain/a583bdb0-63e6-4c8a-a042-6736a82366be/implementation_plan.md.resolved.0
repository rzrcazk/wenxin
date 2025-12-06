# Implementation Plan - WeChat Divination Mini Program

## Goal
Create a WeChat Mini Program that simulates a traditional 3-coin divination method (卜卦). Users toss coins 6 times to generate a hexagram and receive an interpretation based on the I Ching.

## User Review Required
> [!IMPORTANT]
> Since I cannot run the WeChat Mini Program simulator, I will generate the code files. You will need to open the `wechat-divination` directory in **WeChat Developer Tools** to run and test the app.

## Proposed Changes

### Project Configuration
#### [NEW] [app.json](file:///Users/yanjuan/.gemini/antigravity/scratch/wechat-divination/app.json)
- Define pages: `pages/index/index`, `pages/divination/divination`, `pages/result/result`.
- Configure window appearance (title, colors).

#### [NEW] [project.config.json](file:///Users/yanjuan/.gemini/antigravity/scratch/wechat-divination/project.config.json)
- Standard WeChat Mini Program configuration.

#### [NEW] [app.js](file:///Users/yanjuan/.gemini/antigravity/scratch/wechat-divination/app.js)
- Global app logic (minimal).

#### [NEW] [app.wxss](file:///Users/yanjuan/.gemini/antigravity/scratch/wechat-divination/app.wxss)
- Global styles (variables, reset).

### Core Logic
#### [NEW] [utils/iching.js](file:///Users/yanjuan/.gemini/antigravity/scratch/wechat-divination/utils/iching.js)
- `getHexagram(lines)`: Function to take 6 line values (6,7,8,9) and return the hexagram info.
- Data structure containing the 64 hexagrams (Name, Symbol, Description).

### UI Implementation
#### [NEW] [pages/index/index](file:///Users/yanjuan/.gemini/antigravity/scratch/wechat-divination/pages/index/index.wxml) (and .js, .wxss)
- Landing page with instructions and rules (e.g., "No bed/bathroom", "3 coins").
- "Start Divination" button.

#### [NEW] [pages/divination/divination](file:///Users/yanjuan/.gemini/antigravity/scratch/wechat-divination/pages/divination/divination.wxml) (and .js, .wxss)
- **Logic**:
    - `tossCoins()`: Randomly generate 3 coins (Front=3, Back=2).
    - Calculate sum (6, 7, 8, 9).
    - Store result.
    - Repeat 6 times.
    - Auto-navigate to Result page after 6th toss.
- **UI**:
    - Animation/Display of 3 coins.
    - Display of lines generated so far (bottom-up).
    - "Toss" button.

#### [NEW] [pages/result/result](file:///Users/yanjuan/.gemini/antigravity/scratch/wechat-divination/pages/result/result.wxml) (and .js, .wxss)
- **Logic**:
    - Parse passed data (array of 6 numbers).
    - Call `utils/iching.js` to get result.
- **UI**:
    - Draw the final Hexagram.
    - Show Hexagram Name (e.g., "乾为天").
    - Show Interpretation/Judgment.

## Verification Plan
### Automated Tests
- None (Environment limitation).

### Manual Verification
- **Code Review**: I will review the generated code for logical correctness, especially the coin scoring and hexagram lookup.
- **User Verification**:
    1. Open WeChat Developer Tools.
    2. Import the `wechat-divination` folder.
    3. Click "Start" on the home page.
    4. Click "Toss" 6 times. Verify that coins animate/update and lines appear from bottom to top.
    5. Verify the result page shows a valid hexagram and text.
