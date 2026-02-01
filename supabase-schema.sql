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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
