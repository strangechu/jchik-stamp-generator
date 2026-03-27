# 囧雞貼圖產生器 JChik Stamp Generator

一個基於 **Gemini 2.5 Flash** 圖像生成能力的 Next.js Web App，專門用來產生風格一致的「囧雞」原創角色貼圖。

透過 **Identity-Locked Prompting** 技術，確保無論用戶輸入什麼情境，生成的圖像都能忠實保留囧雞的核心視覺特徵——黃色圓潤小雞、紅色三瓣雞冠、標誌性的「囧」字表情、粗黑描邊線條與平鋪色塊風格。

## 功能特色

- **風格鎖定**：自動載入 `/public/references/` 中的參考圖作為 Gemini API 的 style anchor，搭配嚴格的 Identity Anchor prompt，確保角色一致性
- **情境自訂**：用戶只需輸入情境描述（如「騎腳踏車」、「在下雨天撐傘」），系統自動建構完整 prompt
- **API Key 管理**：支援用戶自備 Gemini API Key，或使用預設 Key（附帶每日 10 次限額）
- **公開貼圖牆**：所有人產生的貼圖儲存於 server 端，供所有訪客瀏覽與下載，超過 10 張自動分頁；每張貼圖顯示情境描述與作者名稱
- **一鍵下載**：生成後或從貼圖牆皆可直接下載 PNG 圖片

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端框架 | Next.js 15 + React 19 + TypeScript |
| 樣式 | Tailwind CSS 4.0（亮黃色主題） |
| 圖像生成 | Google Gemini 2.5 Flash Image API |
| 速率限制 | 檔案持久化限流器（全域 300 次/天 + 每 IP 10 次/天） |
| 公開貼圖牆 | Server 端檔案儲存（`.gallery-data/`），支援分頁瀏覽 |

## 專案結構

```
jchik-stamp-generator/
├── public/
│   └── references/          # 囧雞參考圖（作為 style anchor）
│       ├── 01.png
│       ├── 22.png
│       ├── 24.png
│       ├── 31.png
│       └── 35.png
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/
│   │   │   │   └── route.ts    # POST /api/generate 端點
│   │   │   └── gallery/
│   │   │       ├── route.ts    # GET /api/gallery?page=N
│   │   │       └── image/
│   │   │           └── route.ts # GET /api/gallery/image?file=xxx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx            # 主頁面（表單 + 結果顯示）
│   ├── components/
│   │   ├── ApiKeySettings.tsx  # API Key 設定區塊
│   │   ├── GalleryPanel.tsx    # 公開貼圖牆（分頁瀏覽 + 下載）
│   │   └── ResultDisplay.tsx   # 生成結果顯示與下載
│   └── lib/
│       ├── gallery-store.ts    # Server 端圖片儲存與分頁邏輯
│       ├── prompt-builder.ts   # Identity-Locked Prompt 建構器
│       ├── rate-limiter.ts     # IP 速率限制邏輯
│       └── references.ts       # 參考圖載入（轉 base64）
├── .env.local                  # 環境變數（不納入版本控制）
├── .gitignore
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 快速開始

### 前置需求

- [Node.js](https://nodejs.org/) 18 以上
- Gemini API Key（從 [Google AI Studio](https://aistudio.google.com/apikey) 取得）

### 安裝步驟

```bash
# 1. Clone 專案
git clone https://github.com/strangechu/jchik-stamp-generator.git
cd jchik-stamp-generator

# 2. 安裝依賴
npm install

# 3. 設定環境變數（詳見下方說明）
cp .env.local.example .env.local

# 4. 啟動開發伺服器
npm run dev
```

開啟瀏覽器前往 http://localhost:3000 即可使用。

## 環境變數設定

在專案根目錄建立 `.env.local` 檔案，內容如下：

```bash
# ====================================
# 囧雞貼圖產生器 環境變數設定
# ====================================

# [必填] Gemini API Key
# 當用戶未在網頁端自行輸入 API Key 時，系統會使用此預設 Key。
# 取得方式：前往 https://aistudio.google.com/apikey 建立 API Key
NANO_BANANA_API_KEY=your_gemini_api_key_here

# [選填] 網站 Base URL
# 用於部署環境的絕對路徑參照，開發時使用預設值即可。
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> **安全提醒**：`.env.local` 已被列入 `.gitignore`，不會被推送到 GitHub。請勿將 API Key 直接寫在程式碼中。

## 使用方式

1. 開啟網頁後，在輸入框中描述你想要的情境（最多 30 字，例如：「騎腳踏車」、「在雨中跑步」）
2. （選配）在作者欄位輸入你的名字，留空則顯示「匿名」
3. （選配）展開「API Key 設定」區塊，輸入你自己的 Gemini API Key
4. 按下「產生貼圖」按鈕
5. 等待生成完成後，可預覽圖片、查看完整 prompt、或點擊下載按鈕儲存
6. 頁面底部「大家產生的貼圖」牆會自動更新，所有訪客都可瀏覽與下載，每張貼圖固定顯示情境與作者名稱

## API 端點

### `POST /api/generate`

**Request Body：**

```json
{
  "scenario": "騎腳踏車",
  "author": "你的名字（選填，最多 20 字）",
  "apiKey": "your_api_key（選填）"
}
```

**Response（成功）：**

```json
{
  "success": true,
  "prompt": "完整 prompt 文字",
  "imageBase64": "base64 編碼的圖片資料",
  "imageMimeType": "image/png",
  "responseText": "Gemini 回傳的文字訊息",
  "referenceCount": 5
}
```

**錯誤代碼：**

| 狀態碼 | 說明 |
|--------|------|
| 400 | 情境描述為空或超過 30 字 |
| 401 | 未設定 API Key |
| 429 | 超過每日使用次數限制 |
| 422 | API 未回傳圖片（可能被內容安全過濾） |
| 500 | 伺服器內部錯誤 |

### `GET /api/gallery?page=N`

回傳分頁後的公開貼圖列表（每頁 10 筆）。

**Response：**

```json
{
  "items": [
    {
      "id": "1234567890-abc12",
      "scenario": "在下雨天撐傘",
      "author": "strangechu",
      "imageFile": "1234567890-abc12.png",
      "createdAt": "2026-03-27T10:00:00.000Z"
    }
  ],
  "total": 42,
  "totalPages": 5,
  "page": 1
}
```

### `GET /api/gallery/image?file=xxx.png`

提供指定圖片的實際檔案（`image/png` 或 `image/jpeg`），可直接用於 `<img src>` 或下載連結。

## 速率限制

當使用預設 API Key 時，系統採用**雙層防護**機制：

| 層級 | 對象 | 上限 | 重置時間 |
|------|------|------|----------|
| 全域總量 | 所有請求合計 | **300 次/天** | 每日午夜 00:00 |
| 單一 IP | 每個 IP 位址 | **10 次/天** | 每日午夜 00:00 |

- 計數器採**檔案持久化**（`.rate-limit-data/`），server 重啟後不歸零
- 用戶自行輸入 API Key 時**完全不受限制**（使用自己的配額）
- 建議同時在 [Google AI Studio](https://aistudio.google.com/) 設定每日花費上限作為終極保護

## 參考圖管理

將囧雞的代表性原始貼圖放置於 `/public/references/` 目錄中，支援格式：

- `.png`、`.jpg`、`.jpeg`、`.webp`

系統會自動讀取該目錄下所有支援格式的圖片，轉為 base64 後作為 Gemini API 的 inline image 一併送出，確保生成結果與原創風格一致。

## 原創貼圖

「囧雞」原創 LINE 貼圖系列：

- [囧雞第一彈](https://store.line.me/stickershop/product/1288484)
- [囧雞第二彈](https://store.line.me/stickershop/product/30304770)

## 授權

本專案為個人創作工具，「囧雞」角色為原創 IP，未經授權請勿將生成的圖像用於商業用途。
