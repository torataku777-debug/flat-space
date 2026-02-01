// =========================================
// SUPABASE CONFIGURATION
// =========================================

// Supabase credentials - ブラウザ環境ではハードコーディング
// 本番環境ではVercelの環境変数から読み込まれます
const SUPABASE_URL = window.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Supabaseクライアントの初期化
let supabaseClient = null;
let isSupabaseEnabled = false;

// Supabaseが利用可能かチェック
function initSupabase() {
    // Supabaseライブラリがロードされているかチェック
    if (typeof window.supabase === 'undefined') {
        console.warn('Supabase library not loaded');
        return false;
    }

    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('Supabase credentials not configured. Using localStorage as fallback.');
        return false;
    }

    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        return false;
    }
}

// 初期化を実行
isSupabaseEnabled = initSupabase();

// =========================================
// DATABASE HELPER FUNCTIONS
// =========================================

// Gallery Data
async function getGalleryDataFromDB() {
    if (!isSupabaseEnabled) return null;

    try {
        const { data, error } = await supabaseClient
            .from('gallery')
            .select('*')
            .order('order_index', { ascending: true });

        if (error) throw error;
        return data.map(item => item.image_url);
    } catch (error) {
        console.error('Error fetching gallery data:', error);
        return null;
    }
}

async function saveGalleryDataToDB(images) {
    if (!isSupabaseEnabled) return false;

    try {
        // まず既存のデータを削除
        await supabaseClient.from('gallery').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 新しいデータを挿入
        const records = images.map((url, index) => ({
            image_url: url,
            order_index: index
        }));

        const { error } = await supabaseClient.from('gallery').insert(records);
        if (error) throw error;

        console.log('Gallery data saved to Supabase');
        return true;
    } catch (error) {
        console.error('Error saving gallery data:', error);
        return false;
    }
}

// Games Data
async function getGamesDataFromDB() {
    if (!isSupabaseEnabled) return null;

    try {
        const { data, error } = await supabaseClient
            .from('games')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;
        // Supabaseのカラム名からフロントエンド用に変換
        return data.map(game => ({
            id: game.id,
            title: game.title,
            desc: game.description,  // description -> desc
            img: game.image_url,     // image_url -> img
            tags: game.tags || [],
            featured: game.featured,
            players: game.players || '',
            playtime: game.playtime || '',
            youtubeUrl: game.youtube_url || ''  // youtube_url -> youtubeUrl
        }));
    } catch (error) {
        console.error('Error fetching games data:', error);
        return null;
    }
}

async function saveGamesDataToDB(games) {
    if (!isSupabaseEnabled) return false;

    try {
        // 既存のすべてのゲームを削除
        await supabaseClient.from('games').delete().neq('id', 0);

        // フロントエンドのデータをSupabaseのカラム名に変換
        const records = games.map(game => ({
            id: game.id,
            title: game.title,
            description: game.desc,   // desc -> description
            image_url: game.img,      // img -> image_url
            tags: game.tags || [],
            featured: game.featured,
            players: game.players || null,
            playtime: game.playtime || null,
            youtube_url: game.youtubeUrl || null  // youtubeUrl -> youtube_url
        }));

        const { error } = await supabaseClient.from('games').insert(records);
        if (error) throw error;

        console.log('Games data saved to Supabase');
        return true;
    } catch (error) {
        console.error('Error saving games data:', error);
        return false;
    }
}

// News Data
async function getNewsDataFromDB() {
    if (!isSupabaseEnabled) return null;

    try {
        const { data, error } = await supabaseClient
            .from('news')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching news data:', error);
        return null;
    }
}

async function saveNewsDataToDB(news) {
    if (!isSupabaseEnabled) return false;

    try {
        // 既存のすべてのニュースを削除
        await supabaseClient.from('news').delete().neq('id', 0);

        // 新しいデータを挿入
        const { error } = await supabaseClient.from('news').insert(news);
        if (error) throw error;

        console.log('News data saved to Supabase');
        return true;
    } catch (error) {
        console.error('Error saving news data:', error);
        return false;
    }
}

// =========================================
// EXPORT TO GLOBAL SCOPE
// =========================================
// admin.js や main.js から参照できるようにwindowオブジェクトにエクスポート
window.getGalleryDataFromDB = getGalleryDataFromDB;
window.saveGalleryDataToDB = saveGalleryDataToDB;
window.getGamesDataFromDB = getGamesDataFromDB;
window.saveGamesDataToDB = saveGamesDataToDB;
window.getNewsDataFromDB = getNewsDataFromDB;
window.saveNewsDataToDB = saveNewsDataToDB;

