// =========================================
// ADMIN PANEL LOGIC
// =========================================

// Configuration
const ADMIN_PASSWORD = 'flatspace2024'; // Change this to your desired password
const STORAGE_KEYS = {
    AUTH: 'flatspace_admin_auth',
    GALLERY: 'flatspace_gallery',
    GAMES: 'flatspace_games',
    NEWS: 'flatspace_news'
};

// State
let currentEditingId = null;
let currentTab = 'gallery';
let currentUploadedImage = null; // For storing uploaded image data
let currentCropTarget = null; // 'gallery' or 'game'
let cropImage = null;
let cropScale = 1;
let cropX = 0;
let cropY = 0;

// =========================================
// AUTHENTICATION
// =========================================
function checkAuth() {
    const auth = sessionStorage.getItem(STORAGE_KEYS.AUTH);
    return auth === 'true';
}

function login() {
    const password = document.getElementById('admin-password').value;
    const errorMsg = document.getElementById('login-error');

    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        initAdmin();
    } else {
        errorMsg.textContent = 'パスワードが正しくありません';
    }
}

function logout() {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH);
    location.reload();
}

// =========================================
// DATA MANAGEMENT
// =========================================
function getGalleryData() {
    const data = localStorage.getItem(STORAGE_KEYS.GALLERY);
    return data ? JSON.parse(data) : [
        'assets/images/gallery_01.jpg',
        'assets/images/gallery_02.jpg',
        'assets/images/gallery_03.jpg',
        'assets/images/gallery_04.jpg',
        'assets/images/gallery_05.jpg'
    ];
}

function saveGalleryData(data) {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(data));
}

function getGamesData() {
    const data = localStorage.getItem(STORAGE_KEYS.GAMES);
    return data ? JSON.parse(data) : [
        { id: 1, title: "Catan", desc: "無人島を開拓する世界的ベストセラー。", img: "assets/images/game_catan.jpg", tags: ["#初心者歓迎", "#60分〜"], featured: true },
        { id: 2, title: "Dominion", desc: "自分だけのデッキを構築するカードゲーム。", img: "assets/images/game_dominion.jpg", tags: ["#戦略", "#30分〜"], featured: true },
        { id: 3, title: "Blokus", desc: "テトリスのようなピースを角で繋げる陣取りゲーム。", img: "assets/images/game_blokus.jpg", tags: ["#パズル", "#20分〜"], featured: true },
        { id: 4, title: "Geister", desc: "良いオバケと悪いオバケを取り合う心理戦。", img: "assets/images/game_geister.jpg", tags: ["#心理戦", "#15分〜"], featured: true },
        { id: 5, title: "Ito", desc: "数字を言葉で例えて協力するパーティーゲーム。", img: "assets/images/game_sample.png", tags: ["#盛り上がる", "#20分〜"], featured: true },
        { id: 6, title: "Splendor", desc: "宝石商となり威信ポイントを稼ぐ戦略ゲーム。", img: "assets/images/game_sample.png", tags: ["#買い物", "#30分〜"], featured: true },
        { id: 7, title: "Dixit", desc: "抽象的な絵柄から親の想像を当てるゲーム。", img: "assets/images/game_sample.png", tags: ["#想像力", "#30分〜"], featured: true },
        { id: 8, title: "Skull", desc: "嘘と度胸の心理戦ブラフゲーム。", img: "assets/images/game_sample.png", tags: ["#心理戦", "#15分〜"], featured: true }
    ];
}

function saveGamesData(data) {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(data));
}

function getNewsData() {
    const data = localStorage.getItem(STORAGE_KEYS.NEWS);
    return data ? JSON.parse(data) : [
        { id: 1, title: "オープン記念キャンペーン", content: "オープン記念で入場料無料キャンペーン実施中！", date: "2024-01-15", important: true },
        { id: 2, title: "営業時間のお知らせ", content: "平日12:00-22:00、土日祝11:00-23:00で営業しております。", date: "2024-01-10", important: false }
    ];
}

function saveNewsData(data) {
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(data));
}

// =========================================
// GALLERY MANAGEMENT
// =========================================
function renderGallery() {
    const list = document.getElementById('gallery-list');
    const data = getGalleryData();

    list.innerHTML = data.map((url, index) => `
        <div class="gallery-item">
            <img src="${url}" alt="Gallery ${index + 1}" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Error'">
            <div class="gallery-item-actions">
                <button class="btn-danger btn-small" onclick="deleteGalleryItem(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <div class="gallery-item-url">${url}</div>
        </div>
    `).join('');
}

function addGalleryItem() {
    const url = document.getElementById('gallery-url').value.trim();
    if (!url) {
        alert('画像URLを入力してください');
        return;
    }

    const data = getGalleryData();
    data.push(url);
    saveGalleryData(data);
    renderGallery();
    closeModal('gallery-modal');
    document.getElementById('gallery-url').value = '';
}

function deleteGalleryItem(index) {
    if (!confirm('この画像を削除しますか？')) return;

    const data = getGalleryData();
    data.splice(index, 1);
    saveGalleryData(data);
    renderGallery();
}

// =========================================
// GAMES MANAGEMENT
// =========================================
function renderGames() {
    const list = document.getElementById('games-list');
    const data = getGamesData();
    const featuredCount = data.filter(g => g.featured).length;

    list.innerHTML = `
        <div class="game-row header">
            <div>画像</div>
            <div>タイトル</div>
            <div>説明</div>
            <div>タグ</div>
            <div>ピックアップ (${featuredCount}/8)</div>
            <div>操作</div>
        </div>
        ${data.map(game => `
            <div class="game-row">
                <div>
                    <img src="${game.img}" class="game-img-preview" alt="${game.title}" onerror="this.src='https://via.placeholder.com/60?text=?'">
                </div>
                <div class="game-title">${game.title}</div>
                <div>${game.desc}</div>
                <div class="game-tags">
                    ${game.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div>
                    <label class="checkbox-label">
                        <input type="checkbox" ${game.featured ? 'checked' : ''} 
                               onchange="toggleFeatured(${game.id}, this.checked)"
                               ${!game.featured && featuredCount >= 8 ? 'disabled' : ''}>
                    </label>
                </div>
                <div class="game-actions">
                    <button class="btn-secondary btn-small" onclick="editGame(${game.id})">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn-danger btn-small" onclick="deleteGame(${game.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('')}
    `;
}

function openGameModal(gameId = null) {
    const modal = document.getElementById('game-modal');
    const title = document.getElementById('game-modal-title');

    if (gameId) {
        const data = getGamesData();
        const game = data.find(g => g.id === gameId);
        if (!game) return;

        title.textContent = 'ゲームを編集';
        document.getElementById('game-title').value = game.title;
        document.getElementById('game-desc').value = game.desc;
        document.getElementById('game-img').value = game.img;
        document.getElementById('game-tags').value = game.tags.join(',');
        document.getElementById('game-featured').checked = game.featured;
        currentEditingId = gameId;
    } else {
        title.textContent = 'ゲームを追加';
        document.getElementById('game-title').value = '';
        document.getElementById('game-desc').value = '';
        document.getElementById('game-img').value = '';
        document.getElementById('game-tags').value = '';
        document.getElementById('game-featured').checked = false;
        currentEditingId = null;
    }

    showModal(modal);
}

function saveGame() {
    const title = document.getElementById('game-title').value.trim();
    const desc = document.getElementById('game-desc').value.trim();
    const img = document.getElementById('game-img').value.trim();
    const tagsStr = document.getElementById('game-tags').value.trim();
    const featured = document.getElementById('game-featured').checked;

    if (!title || !desc || !img) {
        alert('必須項目を入力してください');
        return;
    }

    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];
    const data = getGamesData();

    if (currentEditingId) {
        const game = data.find(g => g.id === currentEditingId);
        if (game) {
            game.title = title;
            game.desc = desc;
            game.img = img;
            game.tags = tags;
            game.featured = featured;
        }
    } else {
        const newId = data.length > 0 ? Math.max(...data.map(g => g.id)) + 1 : 1;
        data.push({ id: newId, title, desc, img, tags, featured });
    }

    saveGamesData(data);
    renderGames();
    closeModal('game-modal');
}

function editGame(id) {
    openGameModal(id);
}

function deleteGame(id) {
    if (!confirm('このゲームを削除しますか？')) return;

    const data = getGamesData();
    const index = data.findIndex(g => g.id === id);
    if (index !== -1) {
        data.splice(index, 1);
        saveGamesData(data);
        renderGames();
    }
}

function toggleFeatured(id, checked) {
    const data = getGamesData();
    const featuredCount = data.filter(g => g.featured).length;

    if (checked && featuredCount >= 8) {
        alert('ピックアップは最大8個までです');
        renderGames();
        return;
    }

    const game = data.find(g => g.id === id);
    if (game) {
        game.featured = checked;
        saveGamesData(data);
        renderGames();
    }
}

// =========================================
// NEWS MANAGEMENT
// =========================================
function renderNews() {
    const list = document.getElementById('news-list');
    const data = getNewsData();

    list.innerHTML = `
        <div class="news-row header">
            <div>公開日</div>
            <div>タイトル</div>
            <div>内容</div>
            <div>重要度</div>
            <div>操作</div>
        </div>
        ${data.map(news => `
            <div class="news-row">
                <div class="news-date">${news.date}</div>
                <div class="news-title">${news.title}</div>
                <div class="news-content-preview">${news.content}</div>
                <div>
                    <span class="badge ${news.important ? 'badge-important' : 'badge-normal'}">
                        ${news.important ? '重要' : '通常'}
                    </span>
                </div>
                <div class="game-actions">
                    <button class="btn-secondary btn-small" onclick="editNews(${news.id})">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn-danger btn-small" onclick="deleteNews(${news.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('')}
    `;
}

function openNewsModal(newsId = null) {
    const modal = document.getElementById('news-modal');
    const title = document.getElementById('news-modal-title');

    if (newsId) {
        const data = getNewsData();
        const news = data.find(n => n.id === newsId);
        if (!news) return;

        title.textContent = 'お知らせを編集';
        document.getElementById('news-title').value = news.title;
        document.getElementById('news-content').value = news.content;
        document.getElementById('news-date').value = news.date;
        document.getElementById('news-important').checked = news.important;
        currentEditingId = newsId;
    } else {
        title.textContent = 'お知らせを追加';
        document.getElementById('news-title').value = '';
        document.getElementById('news-content').value = '';
        document.getElementById('news-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('news-important').checked = false;
        currentEditingId = null;
    }

    showModal(modal);
}

function saveNews() {
    const title = document.getElementById('news-title').value.trim();
    const content = document.getElementById('news-content').value.trim();
    const date = document.getElementById('news-date').value;
    const important = document.getElementById('news-important').checked;

    if (!title || !content) {
        alert('必須項目を入力してください');
        return;
    }

    const data = getNewsData();

    if (currentEditingId) {
        const news = data.find(n => n.id === currentEditingId);
        if (news) {
            news.title = title;
            news.content = content;
            news.date = date;
            news.important = important;
        }
    } else {
        const newId = data.length > 0 ? Math.max(...data.map(n => n.id)) + 1 : 1;
        data.push({ id: newId, title, content, date, important });
    }

    saveNewsData(data);
    renderNews();
    closeModal('news-modal');
}

function editNews(id) {
    openNewsModal(id);
}

function deleteNews(id) {
    if (!confirm('このお知らせを削除しますか？')) return;

    const data = getNewsData();
    const index = data.findIndex(n => n.id === id);
    if (index !== -1) {
        data.splice(index, 1);
        saveNewsData(data);
        renderNews();
    }
}

// =========================================
// DATA EXPORT/IMPORT
// =========================================
function exportData() {
    const data = {
        gallery: getGalleryData(),
        games: getGamesData(),
        news: getNewsData(),
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flatspace-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    document.getElementById('import-file-input').click();
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            if (data.gallery) saveGalleryData(data.gallery);
            if (data.games) saveGamesData(data.games);
            if (data.news) saveNewsData(data.news);

            alert('データを正常にインポートしました');
            renderAll();
        } catch (error) {
            alert('エラー: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// =========================================
// UI HELPERS
// =========================================
function showModal(modal) {
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');

    currentTab = tabName;
}

function renderAll() {
    renderGallery();
    renderGames();
    renderNews();
}

// =========================================
// INITIALIZATION
// =========================================
function initAdmin() {
    renderAll();

    // Event listeners - Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Event listeners - Gallery
    document.getElementById('add-gallery-btn').addEventListener('click', () => {
        showModal(document.getElementById('gallery-modal'));
    });
    document.getElementById('save-gallery-btn').addEventListener('click', addGalleryItem);

    // Event listeners - Games
    document.getElementById('add-game-btn').addEventListener('click', () => openGameModal());
    document.getElementById('save-game-btn').addEventListener('click', saveGame);

    // Event listeners - News
    document.getElementById('add-news-btn').addEventListener('click', () => openNewsModal());
    document.getElementById('save-news-btn').addEventListener('click', saveNews);

    // Event listeners - Data management
    document.getElementById('export-data-btn').addEventListener('click', exportData);
    document.getElementById('import-data-btn').addEventListener('click', importData);
    document.getElementById('import-file-input').addEventListener('change', handleImportFile);

    // Event listeners - Auth
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Event listeners - Modal close
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Setup image upload functionality
    setupImageUpload();
}

// Initialize on load
if (checkAuth()) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    initAdmin();
} else {
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('admin-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });
}

// =========================================
// IMAGE UPLOAD & CROP FUNCTIONALITY
// =========================================

// Upload Tab Switching
function setupUploadTabs(modalPrefix) {
    const tabBtns = document.querySelectorAll(`#${modalPrefix}-modal .upload-tab-btn`);
    const tabContents = document.querySelectorAll(`#${modalPrefix}-modal .upload-tab-content`);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab
            btn.classList.add('active');
            const tabName = btn.dataset.tab;
            document.getElementById(`${modalPrefix}-${tabName}-tab`).classList.add('active');
        });
    });
}

// Handle Image File Selection
function handleImageSelect(file, target) {
    if (!file || !file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const imageData = e.target.result;

        if (target === 'game') {
            // For game images, open crop modal
            currentCropTarget = 'game';
            openCropModal(imageData);
        } else {
            // For gallery, show preview and store data
            currentUploadedImage = imageData;
            const preview = document.getElementById('gallery-preview');
            preview.innerHTML = `<img src="${imageData}" alt="Preview">`;

            // Update the URL input with a placeholder
            document.getElementById('gallery-url').value = '[アップロード画像]';
        }
    };
    reader.readAsDataURL(file);
}

// Open Crop Modal
function openCropModal(imageData) {
    const modal = document.getElementById('crop-modal');
    const canvas = document.getElementById('crop-canvas');
    const ctx = canvas.getContext('2d');

    cropImage = new Image();
    cropImage.onload = () => {
        // Set initial scale and position
        const size = Math.max(cropImage.width, cropImage.height);
        canvas.width = 500;
        canvas.height = 500;

        cropScale = Math.max(canvas.width / cropImage.width, canvas.height / cropImage.height);
        cropX = (canvas.width - cropImage.width * cropScale) / 2;
        cropY = (canvas.height - cropImage.height * cropScale) / 2;

        drawCropCanvas();
        showModal(modal);
    };
    cropImage.src = imageData;
}

// Draw Crop Canvas
function drawCropCanvas() {
    const canvas = document.getElementById('crop-canvas');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.drawImage(cropImage, cropX, cropY, cropImage.width * cropScale, cropImage.height * cropScale);
    ctx.restore();

    // Draw crop area overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    const cropSize = Math.min(canvas.width, canvas.height);
    const cropLeft = (canvas.width - cropSize) / 2;
    const cropTop = (canvas.height - cropSize) / 2;

    // Draw overlay
    ctx.fillRect(0, 0, canvas.width, cropTop);
    ctx.fillRect(0, cropTop, cropLeft, cropSize);
    ctx.fillRect(cropLeft + cropSize, cropTop, canvas.width - (cropLeft + cropSize), cropSize);
    ctx.fillRect(0, cropTop + cropSize, canvas.width, canvas.height - (cropTop + cropSize));

    // Draw crop border
    ctx.strokeStyle = '#E69500';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropLeft, cropTop, cropSize, cropSize);
}

// Zoom Controls
function zoomCrop(direction) {
    const canvas = document.getElementById('crop-canvas');
    const factor = direction === 'in' ? 1.1 : 0.9;
    const newScale = cropScale * factor;

    // Calculate new position to keep center
    const centerX = cropX + (cropImage.width * cropScale) / 2;
    const centerY = cropY + (cropImage.height * cropScale) / 2;

    cropScale = newScale;
    cropX = centerX - (cropImage.width * cropScale) / 2;
    cropY = centerY - (cropImage.height * cropScale) / 2;

    drawCropCanvas();
}

// Canvas Dragging
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

function setupCanvasDrag() {
    const canvas = document.getElementById('crop-canvas');

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.offsetX - cropX;
        dragStartY = e.offsetY - cropY;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        cropX = e.offsetX - dragStartX;
        cropY = e.offsetY - dragStartY;
        drawCropCanvas();
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDragging = true;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        dragStartX = touch.clientX - rect.left - cropX;
        dragStartY = touch.clientY - rect.top - cropY;
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isDragging) return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        cropX = touch.clientX - rect.left - dragStartX;
        cropY = touch.clientY - rect.top - dragStartY;
        drawCropCanvas();
    });

    canvas.addEventListener('touchend', () => {
        isDragging = false;
    });
}

// Confirm Crop
function confirmCrop() {
    const canvas = document.getElementById('crop-canvas');
    const outputCanvas = document.createElement('canvas');
    const ctx = outputCanvas.getContext('2d');

    const cropSize = Math.min(canvas.width, canvas.height);
    const cropLeft = (canvas.width - cropSize) / 2;
    const cropTop = (canvas.height - cropSize) / 2;

    outputCanvas.width = 500;
    outputCanvas.height = 500;

    // Draw cropped portion
    ctx.drawImage(
        canvas,
        cropLeft, cropTop, cropSize, cropSize,
        0, 0, 500, 500
    );

    const croppedData = outputCanvas.toDataURL('image/jpeg', 0.9);

    if (currentCropTarget === 'game') {
        currentUploadedImage = croppedData;
        const preview = document.getElementById('game-preview');
        preview.innerHTML = `<img src="${croppedData}" alt="Preview">`;
        document.getElementById('game-img').value = '[アップロード画像]';
    }

    closeModal('crop-modal');
}

// Update Gallery Save Function
function addGalleryItem() {
    let url = document.getElementById('gallery-url').value.trim();

    // Check if it's an uploaded image
    if (url === '[アップロード画像]' && currentUploadedImage) {
        url = currentUploadedImage;
    }

    if (!url) {
        alert('画像URLを入力するか、画像をアップロードしてください');
        return;
    }

    const data = getGalleryData();
    data.push(url);
    saveGalleryData(data);
    renderGallery();
    closeModal('gallery-modal');

    // Reset
    document.getElementById('gallery-url').value = '';
    currentUploadedImage = null;
    document.getElementById('gallery-preview').innerHTML = '';
}

// Update Game Save Function
function saveGame() {
    const title = document.getElementById('game-title').value.trim();
    const desc = document.getElementById('game-desc').value.trim();
    let img = document.getElementById('game-img').value.trim();
    const tagsStr = document.getElementById('game-tags').value.trim();
    const featured = document.getElementById('game-featured').checked;

    // Check if it's an uploaded image
    if (img === '[アップロード画像]' && currentUploadedImage) {
        img = currentUploadedImage;
    }

    if (!title || !desc || !img) {
        alert('必須項目を入力してください');
        return;
    }

    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];
    const data = getGamesData();

    if (currentEditingId) {
        const game = data.find(g => g.id === currentEditingId);
        if (game) {
            game.title = title;
            game.desc = desc;
            game.img = img;
            game.tags = tags;
            game.featured = featured;
        }
    } else {
        const newId = data.length > 0 ? Math.max(...data.map(g => g.id)) + 1 : 1;
        data.push({ id: newId, title, desc, img, tags, featured });
    }

    saveGamesData(data);
    renderGames();
    closeModal('game-modal');

    // Reset
    currentUploadedImage = null;
    document.getElementById('game-preview').innerHTML = '';
}

// Setup Upload Event Listeners
function setupImageUpload() {
    setupUploadTabs('gallery');
    setupUploadTabs('game');
    setupCanvasDrag();

    // Gallery upload buttons
    document.getElementById('gallery-file-btn').addEventListener('click', () => {
        document.getElementById('gallery-file-input').click();
    });

    document.getElementById('gallery-camera-btn').addEventListener('click', () => {
        document.getElementById('gallery-camera-input').click();
    });

    document.getElementById('gallery-file-input').addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleImageSelect(e.target.files[0], 'gallery');
        }
    });

    document.getElementById('gallery-camera-input').addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleImageSelect(e.target.files[0], 'gallery');
        }
    });

    // Game upload buttons
    document.getElementById('game-file-btn').addEventListener('click', () => {
        document.getElementById('game-file-input').click();
    });

    document.getElementById('game-camera-btn').addEventListener('click', () => {
        document.getElementById('game-camera-input').click();
    });

    document.getElementById('game-file-input').addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleImageSelect(e.target.files[0], 'game');
        }
    });

    document.getElementById('game-camera-input').addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleImageSelect(e.target.files[0], 'game');
        }
    });

    // Crop controls
    document.getElementById('crop-zoom-in').addEventListener('click', () => zoomCrop('in'));
    document.getElementById('crop-zoom-out').addEventListener('click', () => zoomCrop('out'));
    document.getElementById('crop-confirm-btn').addEventListener('click', confirmCrop);
}

// Add setupImageUpload to initAdmin
// Modify the initAdmin function to include this at the end
