# Gemini CLIで始めるAI駆動開発 一式

この一式は、Gemini CLI で「計画 → 実装 → レビュー」を分離した AI駆動開発を始めるためのテンプレートです。

## 含まれるもの
- `SPEC.md`
  - プロジェクトの要件・仕様を記述するファイル
- `GEMINI.md`
  - Gemini CLI が実際に参照するプロジェクト運用ルール
- `.gemini/skills/start-skill/SKILL.md`
  - 今やるべき作業を判断する親スキル
- `.gemini/skills/spec-to-design/SKILL.md`
  - `SPEC.md` から設計書群を段階的に起こすスキル
- `.gemini/commands/feature-pipeline.toml`
  - 機能追加の入口コマンド
- `.gemini/commands/review-current.toml`
  - 現在の変更をレビューする入口コマンド

## 使い方の流れ
1. この一式をプロジェクトのルートに配置する
2. `SPEC.md` を作る
3. Gemini CLI で Plan Mode を使って要件整理を行う
4. `/feature-pipeline` を起動して設計書の生成と実装の流れに入る
5. `/review-current` で変更内容を確認する
6. 不明点は `QandA.md` に残す

## 最初の一歩
最初は小さなテーマで試すのがおすすめです。
例えば:
- 毎日指定時刻に通知を出す Windows アプリ
- シンプルな Todo Web アプリ
- CSV を読み込んで集計する小さなツール

AI に全部丸投げすると、たまに全力で道を外すことがあります。
なので「小さく区切る」「レビューを挟む」「不明点を残す」の3つを守ると安定します。
