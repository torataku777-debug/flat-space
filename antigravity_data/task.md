# Flat Space 修正タスク

## ゲーム詳細モーダル拡張
- [x] Supabaseスキーマ更新（players, playtime, youtube_url）
- [x] 管理画面に入力欄追加
- [x] supabase-config.jsのマッピング更新
- [x] main.jsのopenModal関数拡張
- [x] games.htmlのモーダル構造拡張
- [x] デプロイ完了

## 次のステップ
- [ ] SupabaseのSQL Editorで新規カラムを追加（以下実行）:
```sql
ALTER TABLE games ADD COLUMN IF NOT EXISTS players TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS playtime TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS youtube_url TEXT;
```

## 完了済み
- [x] ギャラリー・ボドゲの無限ループ実装
- [x] NEWSセクションを料金の下に移動
- [x] ボドゲの表示サイズを大きくする
- [x] ピックアップチェックの反映問題を修正
- [x] 本棚レイアウト実装
- [x] モバイル表示最適化
