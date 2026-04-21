"use client";

import { useState, useCallback } from "react";

type MoodData = {
  mood: string;
  color: string;
  gradientColor: string;
  textColor: string;
  label: string;
  emoji: string;
  reason: string;
};

type MemoEntry = {
  id: string;
  text: string;
  mood: MoodData;
  createdAt: Date;
};

const DEFAULT_MOOD: MoodData = {
  mood: "neutral",
  color: "#F8F9FA",
  gradientColor: "#E9ECEF",
  textColor: "#6C757D",
  label: "普通",
  emoji: "📝",
  reason: "",
};

export default function Home() {
  const [memo, setMemo] = useState("");
  const [currentMood, setCurrentMood] = useState<MoodData>(DEFAULT_MOOD);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [memos, setMemos] = useState<MemoEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyzeMood = useCallback(async () => {
    if (!memo.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze-mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: memo }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "分析に失敗しました");
      }

      const result: MoodData = await res.json();
      setCurrentMood(result);
      setMemos((prev) =>
        [
          {
            id: Date.now().toString(),
            text: memo,
            mood: result,
            createdAt: new Date(),
          },
          ...prev,
        ].slice(0, 20)
      );
      setMemo("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsAnalyzing(false);
    }
  }, [memo, isAnalyzing]);

  const bgStyle = {
    background: `linear-gradient(135deg, ${currentMood.color} 0%, ${currentMood.gradientColor} 100%)`,
    transition: "background 1.2s ease",
  };

  const textStyle = {
    color: currentMood.textColor,
    transition: "color 1.2s ease",
  };

  return (
    <div style={{ minHeight: "100vh", ...bgStyle }}>
      {/* Header */}
      <header
        style={{
          padding: "1.5rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              ...textStyle,
            }}
          >
            🎨 iro-dori
          </h1>
          <p style={{ fontSize: "0.82rem", opacity: 0.6, marginTop: "0.2rem", ...textStyle }}>
            ムード・メモ — 感情で色が変わるメモ帳
          </p>
        </div>

        {currentMood.mood !== "neutral" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1.25rem",
              borderRadius: "2rem",
              backgroundColor: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(8px)",
              fontWeight: 700,
              fontSize: "0.95rem",
              ...textStyle,
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>{currentMood.emoji}</span>
            <span>{currentMood.label}</span>
          </div>
        )}
      </header>

      {/* Main */}
      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "0.5rem 1.5rem 5rem" }}>
        {/* Input card */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(16px)",
            borderRadius: "1.25rem",
            padding: "1.5rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            marginBottom: "1.25rem",
          }}
        >
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") analyzeMood();
            }}
            placeholder={"今の気持ちをメモしよう...\n\n例: 今日は友達と久しぶりに会えて嬉しかった！"}
            rows={6}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: "1rem",
              lineHeight: "1.75",
              background: "transparent",
              color: "#222",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "0.75rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid rgba(0,0,0,0.07)",
            }}
          >
            <span style={{ fontSize: "0.78rem", color: "#999" }}>
              {memo.length > 0 ? `${memo.length} 文字` : "⌘+Enter で分析"}
            </span>
            <button
              onClick={analyzeMood}
              disabled={!memo.trim() || isAnalyzing}
              style={{
                padding: "0.55rem 1.4rem",
                borderRadius: "2rem",
                border: "none",
                backgroundColor: memo.trim() && !isAnalyzing ? currentMood.textColor : "#D0D0D0",
                color: "white",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: memo.trim() && !isAnalyzing ? "pointer" : "not-allowed",
                transition: "background-color 0.3s ease",
              }}
            >
              {isAnalyzing ? "分析中..." : "🔍 ムード分析"}
            </button>
          </div>

          {error && (
            <p style={{ color: "#D32F2F", fontSize: "0.83rem", marginTop: "0.75rem" }}>
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Mood reason bubble */}
        {currentMood.reason && (
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(8px)",
              borderRadius: "1rem",
              padding: "0.9rem 1.2rem",
              marginBottom: "1.75rem",
              fontSize: "0.88rem",
              lineHeight: "1.6",
              ...textStyle,
            }}
          >
            {currentMood.emoji} {currentMood.reason}
          </div>
        )}

        {/* Mood palette legend */}
        {memos.length === 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "0.5rem",
              marginBottom: "2rem",
            }}
          >
            {MOOD_LEGEND.map((m) => (
              <div
                key={m.mood}
                title={m.label}
                style={{
                  background: `linear-gradient(135deg, ${m.color}, ${m.gradientColor})`,
                  borderRadius: "0.75rem",
                  padding: "0.75rem 0.5rem",
                  textAlign: "center",
                  fontSize: "1.4rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                {m.emoji}
                <div style={{ fontSize: "0.65rem", color: m.textColor, marginTop: "0.25rem", fontWeight: 600 }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Memo history */}
        {memos.length > 0 ? (
          <>
            <h2
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                opacity: 0.55,
                marginBottom: "0.75rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                ...textStyle,
              }}
            >
              過去のメモ
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {memos.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.55)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "0.9rem",
                    padding: "0.9rem 1.1rem",
                    borderLeft: `3px solid ${entry.mood.textColor}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: entry.mood.textColor,
                      }}
                    >
                      {entry.mood.emoji} {entry.mood.label}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#999" }}>
                      {entry.createdAt.toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.87rem", color: "#444", lineHeight: "1.6" }}>
                    {entry.text.length > 120 ? `${entry.text.slice(0, 120)}...` : entry.text}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              opacity: 0.4,
              ...textStyle,
            }}
          >
            <p style={{ fontSize: "0.9rem" }}>メモを書いてムードを分析してみよう</p>
          </div>
        )}
      </main>
    </div>
  );
}

const MOOD_LEGEND = [
  { mood: "joy",      color: "#FFFDE7", gradientColor: "#FFF176", textColor: "#F9A825", label: "喜び",   emoji: "😊" },
  { mood: "sadness",  color: "#E3F2FD", gradientColor: "#90CAF9", textColor: "#1565C0", label: "悲しみ", emoji: "😢" },
  { mood: "anger",    color: "#FFEBEE", gradientColor: "#EF9A9A", textColor: "#C62828", label: "怒り",   emoji: "😠" },
  { mood: "fear",     color: "#F3E5F5", gradientColor: "#CE93D8", textColor: "#6A1B9A", label: "不安",   emoji: "😰" },
  { mood: "surprise", color: "#FFF3E0", gradientColor: "#FFCC80", textColor: "#E65100", label: "驚き",   emoji: "😲" },
  { mood: "disgust",  color: "#F1F8E9", gradientColor: "#AED581", textColor: "#33691E", label: "嫌悪",   emoji: "😒" },
  { mood: "calm",     color: "#E8F5E9", gradientColor: "#A5D6A7", textColor: "#2E7D32", label: "穏やか", emoji: "😌" },
  { mood: "tired",    color: "#FAFAFA", gradientColor: "#EEEEEE", textColor: "#424242", label: "疲れ",   emoji: "😴" },
  { mood: "excited",  color: "#FCE4EC", gradientColor: "#F48FB1", textColor: "#880E4F", label: "興奮",   emoji: "🤩" },
  { mood: "neutral",  color: "#F5F5F5", gradientColor: "#E0E0E0", textColor: "#616161", label: "普通",   emoji: "😐" },
];
