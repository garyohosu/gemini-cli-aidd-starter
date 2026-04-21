# 🎨 iro-dori — ムード・メモ

感情で色が変わるメモ帳。今の気持ちをメモすると、Google AI Studio（Gemini）が感情を分析して画面の色が変わります。

## 感情カテゴリと色

| 感情 | 色 |
|------|-----|
| 😊 喜び | 暖かい黄色 |
| 😢 悲しみ | 優しい青 |
| 😠 怒り | 柔らかい赤 |
| 😰 不安 | 淡い紫 |
| 😲 驚き | オレンジ |
| 😒 嫌悪 | 薄いグリーン |
| 😌 穏やか | ミントグリーン |
| 😴 疲れ | グレー |
| 🤩 興奮 | ピンク |
| 😐 普通 | ライトグレー |

## セットアップ

### 1. Google AI Studio APIキーを取得

1. [Google AI Studio](https://aistudio.google.com) にアクセス
2. **「Get API key」** からAPIキーを発行

### 2. 環境変数を設定

```bash
cp .env.example .env.local
# .env.local を編集して GEMINI_API_KEY を設定
```

### 3. 開発サーバーを起動

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

## Vercelへのデプロイ

1. このリポジトリを GitHub にプッシュ
2. [vercel.com](https://vercel.com) でリポジトリをインポート
3. **Environment Variables** に `GEMINI_API_KEY` を追加
4. **Deploy** をクリック

## 技術スタック

- [Next.js 15](https://nextjs.org) — App Router
- [Google Generative AI SDK](https://ai.google.dev) — Gemini 2.0 Flash
- [Vercel](https://vercel.com) — ホスティング
