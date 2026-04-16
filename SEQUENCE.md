# SEQUENCE.md

## 前提・対象範囲

このファイルは `SPEC.md` に基づく「Win11用 静かなアラーム時計」の主要シーケンス図を示す。  
対象範囲は **Ver 1.0** の必須機能に限定する。  
未確定事項は `QandA.md` を参照。

入力情報: `SPEC.md`（全セクション）、`USECASE.md`

---

## 登場コンポーネント

| コンポーネント | 役割 |
|-------------|------|
| User | アプリを操作するユーザー |
| MainWindow | メイン画面（現在時刻・アラーム一覧表示） |
| AlarmDialog | アラーム追加・編集ダイアログ |
| AlarmMonitor | 定期的に時刻チェックを行うタイマー機構 |
| NotificationWindow | 通知ポップアップ画面 |
| AlarmStorage | JSONファイルへの読み書きを担当するモジュール |
| AlarmData | アラームのデータ（毎日/単発） |

---

## SEQ-01: アプリ起動シーケンス

```mermaid
sequenceDiagram
    participant User
    participant MainWindow
    participant AlarmMonitor
    participant AlarmStorage
    participant AlarmData

    User->>MainWindow: アプリ起動
    MainWindow->>AlarmStorage: load()
    alt JSONファイルが存在する場合
        AlarmStorage->>AlarmData: JSONパース・オブジェクト生成
        AlarmData-->>AlarmStorage: アラームリスト
        AlarmStorage-->>MainWindow: アラームリスト返却
    else JSONファイルが存在しない場合
        AlarmStorage-->>MainWindow: 空のアラームリスト返却
        Note over MainWindow: 初回起動扱い。空データで続行。
    else JSONファイルが破損している場合
        AlarmStorage-->>MainWindow: エラー通知
        MainWindow->>User: エラーメッセージ表示
        Note over MainWindow: 空データで続行（暫定。QandA Q8 参照）
    end
    MainWindow->>MainWindow: 現在時刻表示開始（1秒更新）
    MainWindow->>AlarmMonitor: start()
    Note over AlarmMonitor: 定期監視を開始。間隔は未確定（QandA Q2 参照）
    MainWindow-->>User: メイン画面表示
```

---

## SEQ-02: 毎日アラーム登録シーケンス

```mermaid
sequenceDiagram
    participant User
    participant MainWindow
    participant AlarmDialog
    participant AlarmStorage

    User->>MainWindow: 「追加（毎日）」ボタン押下
    Note over MainWindow: ※追加ボタンのUI設計は未確定（USECASE.md 参照）
    MainWindow->>AlarmDialog: 毎日アラーム追加ダイアログを開く
    AlarmDialog-->>User: 入力フォーム表示（時・分・メッセージ・有効チェック）

    User->>AlarmDialog: 各項目を入力
    User->>AlarmDialog: 「登録」ボタン押下

    AlarmDialog->>AlarmDialog: 入力値バリデーション
    alt バリデーションOK
        AlarmDialog->>AlarmStorage: save(新規毎日アラーム)
        AlarmStorage-->>AlarmDialog: 保存完了
        AlarmDialog-->>MainWindow: 登録完了通知
        MainWindow->>MainWindow: アラーム一覧を更新
        MainWindow-->>User: 更新後のメイン画面表示
    else バリデーションNG（例: 時が0〜23範囲外）
        AlarmDialog-->>User: エラーメッセージ表示
        Note over AlarmDialog: 入力ダイアログを閉じずにエラー表示
    end

    opt キャンセル
        User->>AlarmDialog: 「キャンセル」ボタン押下
        AlarmDialog-->>MainWindow: ダイアログを閉じる（変更なし）
    end
```

---

## SEQ-03: 単発アラーム登録シーケンス

```mermaid
sequenceDiagram
    participant User
    participant MainWindow
    participant AlarmDialog
    participant AlarmStorage

    User->>MainWindow: 「追加（単発）」ボタン押下
    MainWindow->>AlarmDialog: 単発アラーム追加ダイアログを開く
    AlarmDialog-->>User: 入力フォーム表示（日付・時・分・メッセージ・有効チェック）

    User->>AlarmDialog: 各項目を入力
    User->>AlarmDialog: 「登録」ボタン押下

    AlarmDialog->>AlarmDialog: 入力値バリデーション
    alt バリデーションOK
        AlarmDialog->>AlarmStorage: save(新規単発アラーム)
        AlarmStorage-->>AlarmDialog: 保存完了
        AlarmDialog-->>MainWindow: 登録完了通知
        MainWindow->>MainWindow: アラーム一覧を更新
        MainWindow-->>User: 更新後のメイン画面表示
    else バリデーションNG（例: 不正な日付形式）
        AlarmDialog-->>User: エラーメッセージ表示
    end
    Note over AlarmDialog: 過去日付を入力した場合の扱いは未確定（QandA Q10 参照）
```

---

## SEQ-04: 毎日アラームの通知シーケンス

```mermaid
sequenceDiagram
    participant AlarmMonitor
    participant AlarmData
    participant AlarmStorage
    participant NotificationWindow
    participant User

    loop 定期チェック（間隔は未確定: QandA Q2 参照）
        AlarmMonitor->>AlarmMonitor: 現在日時を取得
        AlarmMonitor->>AlarmData: 全毎日アラームを取得
        loop 各毎日アラームを確認
            AlarmMonitor->>AlarmMonitor: 発火条件を確認
            Note over AlarmMonitor: 条件: enabled=true かつ 現在時刻(時:分) = アラーム(時:分) かつ last_triggered_date ≠ 今日の日付
            alt 発火条件を満たす
                AlarmMonitor->>AlarmData: last_triggered_date を今日の日付に更新
                AlarmMonitor->>AlarmStorage: save()
                AlarmMonitor->>NotificationWindow: show(message, 通知時刻)
                NotificationWindow-->>User: 通知ウィンドウ表示（最前面）
                Note over NotificationWindow: 最前面表示の実装可否は未確定（USECASE.md 参照）
                User->>NotificationWindow: 「閉じる」ボタン押下
                NotificationWindow-->>User: ウィンドウを閉じる
            end
        end
    end
```

---

## SEQ-05: 単発アラームの通知シーケンス

```mermaid
sequenceDiagram
    participant AlarmMonitor
    participant AlarmData
    participant AlarmStorage
    participant NotificationWindow
    participant User

    loop 定期チェック（間隔は未確定: QandA Q2 参照）
        AlarmMonitor->>AlarmMonitor: 現在日時を取得
        AlarmMonitor->>AlarmData: 全単発アラームを取得
        loop 各単発アラームを確認
            AlarmMonitor->>AlarmMonitor: 発火条件を確認
            Note over AlarmMonitor: 条件: enabled=true かつ done=false かつ 現在日時 = アラーム日時（日付+時:分）
            alt 発火条件を満たす
                AlarmMonitor->>AlarmData: done = true に更新
                AlarmMonitor->>AlarmStorage: save()
                AlarmMonitor->>NotificationWindow: show(message, 通知時刻)
                NotificationWindow-->>User: 通知ウィンドウ表示
                User->>NotificationWindow: 「閉じる」ボタン押下
                NotificationWindow-->>User: ウィンドウを閉じる
            end
        end
    end
```

---

## SEQ-06: アラーム編集シーケンス

```mermaid
sequenceDiagram
    participant User
    participant MainWindow
    participant AlarmDialog
    participant AlarmStorage

    User->>MainWindow: 対象アラームを選択 → 「編集」ボタン押下
    MainWindow->>AlarmDialog: 編集ダイアログを開く（現在値を渡す）
    AlarmDialog-->>User: 編集フォーム表示（現在値が入力済み）

    User->>AlarmDialog: 項目を変更
    User->>AlarmDialog: 「保存」ボタン押下

    AlarmDialog->>AlarmDialog: 入力値バリデーション
    alt バリデーションOK
        AlarmDialog->>AlarmStorage: save(更新後アラーム)
        AlarmStorage-->>AlarmDialog: 保存完了
        AlarmDialog-->>MainWindow: 編集完了通知
        MainWindow->>MainWindow: アラーム一覧を更新
        MainWindow-->>User: 更新後のメイン画面表示
    else バリデーションNG
        AlarmDialog-->>User: エラーメッセージ表示
    end
```

---

## SEQ-07: アラーム削除シーケンス

```mermaid
sequenceDiagram
    participant User
    participant MainWindow
    participant AlarmStorage

    User->>MainWindow: 対象アラームを選択 → 「削除」ボタン押下
    Note over MainWindow: 確認ダイアログの有無は未確定（QandA 追加候補）
    MainWindow->>AlarmStorage: delete(対象アラーム)
    AlarmStorage-->>MainWindow: 削除完了
    MainWindow->>MainWindow: アラーム一覧を更新
    MainWindow-->>User: 更新後のメイン画面表示
```

---

## 未確定事項サマリー

| シーケンス | 未確定項目 | 参照 |
|---------|----------|------|
| SEQ-01 | JSONファイル破損時の挙動 | QandA Q8 |
| SEQ-01 | 起動前に過ぎた単発アラームの done フラグ更新の有無 | QandA Q7 |
| SEQ-02/03 | 追加ボタンのUI設計（1ボタン種別選択 vs 2ボタン） | USECASE.md |
| SEQ-04/05 | 監視間隔（1秒 or 5秒） | QandA Q2 |
| SEQ-04/05 | 複数アラーム同時発火の扱い | QandA Q3 |
| SEQ-04/05 | 通知ウィンドウが既に開いている場合の挙動 | QandA Q4 |
| SEQ-04 | 最前面表示の実装可否（Ver 1.0 or 1.1） | QandA 追加候補 |
| SEQ-07 | 削除確認ダイアログの有無 | QandA 追加候補 |
