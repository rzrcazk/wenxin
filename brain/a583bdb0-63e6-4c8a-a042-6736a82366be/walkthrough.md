# Walkthrough - WeChat Divination Mini Program

I have generated the complete code for your WeChat Mini Program. Since I cannot run the simulator directly, follow these steps to run and test the app.

## Prerequisites
- **WeChat Developer Tools** (微信开发者工具) installed on your computer.

## Steps to Run

1.  **Locate the Project**:
    The project files are located at:
    `/Users/yanjuan/.gemini/antigravity/scratch/wechat-divination`

2.  **Import into Developer Tools**:
    - Open WeChat Developer Tools.
    - Click **Import Project** (导入项目).
    - Select the `wechat-divination` folder.
    - Use a **Test AppID** (or your own AppID).

3.  **Test the App**:
    - **Home Page**: Read the instructions. Click "开始卜卦".
    - **Divination Page**:
        - **Manual Toss**: Toss 3 real coins yourself.
        - **Record Result**: Click the button corresponding to your result:
            - **3 Fronts (9)**: Old Yang (老阳)
            - **3 Backs (6)**: Old Yin (老阴)
            - **1 Front 2 Backs (7)**: Young Yang (少阳)
            - **2 Fronts 1 Back (8)**: Young Yin (少阴)
        - Repeat 6 times.
        - Observe the lines building from bottom to top.
    - **Result Page**:
        - View the final Hexagram name and interpretation.
        - Verify the drawing matches the lines (Solid=Yang, Broken=Yin).

## Features Implemented
- **Manual Input**: User tosses real coins and inputs the result.
- **Hexagram Calculation**: Maps the 6 lines to one of the 64 I Ching hexagrams.
- **Visuals**:
    - Hexagram drawing (Yin/Yang lines).
    - Chinese localization.

## Code Structure
- `pages/index/`: Home page.
- `pages/divination/`: Manual input logic.
- `pages/result/`: Result display.
- `utils/iching.js`: Hexagram data and calculation logic.
