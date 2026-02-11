-- =========================================
-- Flat Space Database Schema
-- =========================================
-- このSQLをSupabaseのSQL Editorで実行してください

-- 1. Gallery テーブル
CREATE TABLE IF NOT EXISTS gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Games テーブル
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    players TEXT,              -- 対応人数 (例: "2-4人")
    playtime TEXT,             -- 所要時間 (例: "30分〜")
    youtube_url TEXT,          -- ルール説明動画のURL
    overview TEXT,             -- ゲーム概要（詳細な説明）
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 既存テーブルへのカラム追加（既にテーブルがある場合）
ALTER TABLE games ADD COLUMN IF NOT EXISTS players TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS playtime TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS overview TEXT;

-- 3. News テーブル
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    important BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- Row Level Security (RLS) ポリシー設定
-- =========================================

-- RLSを有効化
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能（SELECT）
CREATE POLICY "Enable read access for all users" ON gallery
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON games
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON news
    FOR SELECT USING (true);

-- 全員が書き込み可能（INSERT, UPDATE, DELETE）
-- 注: 本番環境では認証を追加することを推奨
CREATE POLICY "Enable insert for all users" ON gallery
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON gallery
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON gallery
    FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON games
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON games
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON games
    FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON news
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON news
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON news
    FOR DELETE USING (true);

-- =========================================
-- 完了！
-- =========================================
-- テーブルが正常に作成されました。
-- Table Editorで確認してください。


-- =========================================
-- 4. Terms (利用規約) テーブル
-- =========================================
CREATE TABLE IF NOT EXISTS terms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能（SELECT）
CREATE POLICY "Enable read access for all users" ON terms
    FOR SELECT USING (true);

-- 全員が書き込み可能（INSERT, UPDATE, DELETE）
CREATE POLICY "Enable insert for all users" ON terms
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON terms
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON terms
    FOR DELETE USING (true);

-- 初期データを挿入
INSERT INTO terms (content) VALUES ('【ふらっとスペース 利用規約】

当店をご利用いただく前に、必ず以下の利用規約をお読みください。

■ 第1条（適用）
本規約は、ふらっとスペース（以下「当店」）のサービスを利用するすべてのお客様に適用されます。

■ 第2条（利用料金）
・入場料：500円（店舗貸切プランを除く）
・時間料金：10分単位でのご利用が可能です
・料金の詳細は店内掲示物またはウェブサイトをご確認ください

■ 第3条（禁止事項）
以下の行為を禁止します：
・他のお客様の迷惑となる行為
・店内の備品・ゲームの破損、紛失
・飲食物の無断持ち込み（持ち込み可能な場合を除く）
・店内での喫煙
・法令に違反する行為

■ 第4条（損害賠償）
お客様が当店の設備やゲーム等を破損、紛失された場合、相応の賠償をお願いする場合があります。

■ 第5条（個人情報の取り扱い）
当店はお客様の個人情報を適切に管理し、お客様の同意なしに第三者に開示・提供することはありません。

■ 第6条（規約の変更）
当店は、必要に応じて本規約を変更することがあります。変更後の規約は、店内掲示またはウェブサイトへの掲載をもって効力を生じるものとします。

■ お問い合わせ
ご不明な点がございましたら、スタッフまでお気軽にお声がけください。');
