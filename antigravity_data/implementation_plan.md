# ゲーム詳細モーダル拡張計画

ゲームカードをクリックした際の詳細モーダルに、追加情報とYouTube動画再生機能を追加します。

## 追加する情報

| フィールド | 説明 | 例 |
|---|---|---|
| 対応人数 | プレイヤー数の範囲 | 2-4人 |
| 所要時間 | 1ゲームあたりの時間 | 30分〜 |
| タグ | ゲームのカテゴリ | #初心者歓迎, #戦略 |
| YouTube動画 | ルール説明動画の埋め込み再生 | iframe埋め込み |

---

## 変更内容

### データベース（Supabase）

#### [MODIFY] gamesテーブル

新規カラムを追加：

```sql
ALTER TABLE games ADD COLUMN IF NOT EXISTS players TEXT;        -- 例: "2-4人"
ALTER TABLE games ADD COLUMN IF NOT EXISTS playtime TEXT;       -- 例: "30分〜"
ALTER TABLE games ADD COLUMN IF NOT EXISTS youtube_url TEXT;    -- YouTubeのURL
```

---

### 管理画面

#### [MODIFY] [admin.html](file:///Users/toratanitaku/.gemini/antigravity/scratch/flat-space/admin.html)

ゲーム編集モーダルに新規入力欄を追加：
- 対応人数（テキスト入力）
- 所要時間（テキスト入力）
- YouTube URL（テキスト入力）

#### [MODIFY] [admin.js](file:///Users/toratanitaku/.gemini/antigravity/scratch/flat-space/assets/js/admin.js)

- ゲーム保存時に新規フィールドを含める
- ゲーム編集時に新規フィールドを読み込み

#### [MODIFY] [supabase-config.js](file:///Users/toratanitaku/.gemini/antigravity/scratch/flat-space/assets/js/supabase-config.js)

新規カラムのマッピングを追加

---

### フロントエンド

#### [MODIFY] [games.html](file:///Users/toratanitaku/.gemini/antigravity/scratch/flat-space/games.html)

モーダル構造を拡張：
- 対応人数・所要時間の表示エリア
- タグ表示エリア
- YouTube埋め込みエリア（iframe）

モーダルCSS追加：
- 詳細情報のスタイリング
- YouTube iframe のレスポンシブ対応

#### [MODIFY] [main.js](file:///Users/toratanitaku/.gemini/antigravity/scratch/flat-space/assets/js/main.js)

`openModal(game)` 関数を拡張：
- 新規フィールドをモーダルに反映
- YouTube URLを埋め込みURLに変換して表示

---

## 検証計画

### 手動テスト

1. **管理画面でゲームを編集**
   - https://flat-space.vercel.app/admin.html にアクセス
   - ゲームを選択し、対応人数・所要時間・YouTube URLを入力
   - 保存後、一覧で正しく表示されることを確認

2. **フロントエンドでモーダル確認**
   - https://flat-space.vercel.app/games.html にアクセス
   - ゲームカードをクリック
   - モーダルに以下が表示されることを確認：
     - タイトル・説明
     - 対応人数・所要時間
     - タグ一覧
     - YouTube動画（埋め込み再生可能）

3. **モバイル確認**
   - スマホでモーダルを開き、レイアウトが崩れないことを確認
