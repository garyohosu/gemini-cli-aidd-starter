import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const MOOD_CONFIG: Record<
  string,
  { color: string; gradientColor: string; textColor: string; label: string; emoji: string }
> = {
  joy:      { color: "#FFFDE7", gradientColor: "#FFF176", textColor: "#F9A825", label: "喜び",   emoji: "😊" },
  sadness:  { color: "#E3F2FD", gradientColor: "#90CAF9", textColor: "#1565C0", label: "悲しみ", emoji: "😢" },
  anger:    { color: "#FFEBEE", gradientColor: "#EF9A9A", textColor: "#C62828", label: "怒り",   emoji: "😠" },
  fear:     { color: "#F3E5F5", gradientColor: "#CE93D8", textColor: "#6A1B9A", label: "不安",   emoji: "😰" },
  surprise: { color: "#FFF3E0", gradientColor: "#FFCC80", textColor: "#E65100", label: "驚き",   emoji: "😲" },
  disgust:  { color: "#F1F8E9", gradientColor: "#AED581", textColor: "#33691E", label: "嫌悪",   emoji: "😒" },
  calm:     { color: "#E8F5E9", gradientColor: "#A5D6A7", textColor: "#2E7D32", label: "穏やか", emoji: "😌" },
  tired:    { color: "#FAFAFA", gradientColor: "#EEEEEE", textColor: "#424242", label: "疲れ",   emoji: "😴" },
  excited:  { color: "#FCE4EC", gradientColor: "#F48FB1", textColor: "#880E4F", label: "興奮",   emoji: "🤩" },
  neutral:  { color: "#F5F5F5", gradientColor: "#E0E0E0", textColor: "#616161", label: "普通",   emoji: "😐" },
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY が設定されていません" },
      { status: 500 }
    );
  }

  let text: string;
  try {
    const body = await request.json();
    text = (body.text ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "テキストを入力してください" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "リクエストが無効です" }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `以下のテキストの感情を分析してください。
テキスト: "${text}"

感情カテゴリ一覧:
- joy (喜び・嬉しい・楽しい・幸せ)
- sadness (悲しい・憂鬱・落ち込み)
- anger (怒り・イライラ・腹立たしい)
- fear (不安・恐怖・心配・緊張)
- surprise (驚き・びっくり)
- disgust (嫌悪・不満・うんざり)
- calm (穏やか・平和・リラックス・落ち着き)
- tired (疲れ・眠い・だるい)
- excited (興奮・ワクワク・テンション高い)
- neutral (普通・中立・特に感情なし)

必ず以下のJSON形式のみで返してください（コードブロック・説明不要）:
{"mood": "英語カテゴリ名", "reason": "日本語で1文の理由"}`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    const match = raw.match(/\{[^}]+\}/);
    if (!match) throw new Error("Invalid AI response format");

    const parsed = JSON.parse(match[0]) as { mood?: string; reason?: string };
    const mood = parsed.mood && parsed.mood in MOOD_CONFIG ? parsed.mood : "neutral";

    return NextResponse.json({
      mood,
      ...MOOD_CONFIG[mood],
      reason: parsed.reason ?? "",
    });
  } catch (err) {
    console.error("Mood analysis error:", err);
    return NextResponse.json(
      { error: "感情分析に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
