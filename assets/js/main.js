const init = async () => {

    // --- Opening Video ---
    const openingOverlay = document.getElementById('opening-overlay');
    const openingVideo = document.getElementById('opening-video');

    // Check for skip_intro param
    const urlParams = new URLSearchParams(window.location.search);
    const skipIntro = urlParams.get('skip_intro');

    if (openingOverlay && openingVideo) {
        if (skipIntro === 'true') {
            openingOverlay.style.display = 'none';
        } else {
            // イーズアウト効果：最初は速く、徐々に遅く（0.8倍に調整）
            let initialRate = 2.0;
            let targetRate = 1.2;
            openingVideo.playbackRate = initialRate;

            // Attempt to play
            const playPromise = openingVideo.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Autoplay prevented or video failed:", error);
                    openingOverlay.style.display = 'none';
                });
            }

            // SAFETY: Force hide after 4 seconds
            setTimeout(() => {
                if (openingOverlay.style.display !== 'none') {
                    openingOverlay.classList.add('fade-out');
                    setTimeout(() => {
                        openingOverlay.style.display = 'none';
                        document.body.style.overflow = '';
                        document.documentElement.style.overflow = ''; // Unlock html too
                    }, 500);
                }
            }, 4000);

            let fadeStarted = false;

            // Lock scroll initially (Both body and html for better coverage)
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';

            openingVideo.addEventListener('timeupdate', () => {
                // イーズアウトアニメーション
                if (openingVideo.duration > 0) {
                    const progress = openingVideo.currentTime / openingVideo.duration;
                    if (progress > 0.3 && progress < 0.95) {
                        const easeProgress = Math.min((progress - 0.3) / 0.65, 1);
                        openingVideo.playbackRate = initialRate - (initialRate - targetRate) * easeProgress;
                    }
                }

                // Start fade out at 3.5s mark
                if (!fadeStarted && (openingVideo.currentTime >= 3.5 || (openingVideo.duration > 0 && openingVideo.duration - openingVideo.currentTime <= 0.5))) {
                    fadeStarted = true;
                    openingOverlay.classList.add('fade-out');
                }
            });

            openingVideo.addEventListener('ended', () => {
                if (!fadeStarted) {
                    openingOverlay.classList.add('fade-out');
                }
                setTimeout(() => {
                    openingOverlay.style.display = 'none';
                    document.body.style.overflow = '';
                    document.documentElement.style.overflow = '';
                }, 200);
            });
        }
    }

    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = mobileMenu.querySelectorAll('a');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            if (mobileMenu.style.right === '0px') {
                mobileMenu.style.right = '-100%';
            } else {
                mobileMenu.style.right = '0';
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileMenu.style.right = '-100%';
            });
        });
    }

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 70;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // --- Dynamic Gallery from LocalStorage or Supabase ---
    async function loadGallery() {
        const galleryContent = document.querySelector('.marquee-content');
        if (!galleryContent) return;

        let images = null;

        // Supabaseから直接取得
        if (typeof getGalleryDataFromDB !== 'undefined') {
            images = await getGalleryDataFromDB();
        }

        // データがない場合のみデフォルト値
        if (!images || images.length === 0) {
            images = [
                'assets/images/gallery_01.jpg',
                'assets/images/gallery_02.jpg',
                'assets/images/gallery_03.jpg',
                'assets/images/gallery_04.jpg',
                'assets/images/gallery_05.jpg'
            ];
            console.warn('ギャラリーデータが取得できませんでした。デフォルト画像を表示します。');
        }

        // Triple the array for seamless infinite loop
        const tripled = [...images, ...images, ...images];

        galleryContent.innerHTML = tripled.map((img, index) => `
            <div class="gallery-item">
                <img src="${img}" alt="Interior View ${(index % images.length) + 1}">
            </div>
        `).join('');
    }

    loadGallery();

    // --- Game Library Grid & Modal ---
    // Load games from Supabase
    async function getGamesData() {
        let dbData = null;

        // Supabaseから直接取得
        if (typeof getGamesDataFromDB !== 'undefined') {
            console.log('[DEBUG] Attempting to fetch from DB...');
            dbData = await getGamesDataFromDB();
            if (dbData && dbData.length > 0) {
                console.log('[DEBUG] Fetched from DB:', dbData);
                return dbData;
            } else {
                console.warn('[DEBUG] DB returned empty or null.');
            }
        } else {
            console.error('[DEBUG] getGamesDataFromDB is undefined');
        }

        // データがない場合のみデフォルト値
        console.warn('ゲームデータが取得できませんでした。デフォルトデータを表示します。');
        return [
            {
                id: 1,
                title: "Catan",
                desc: "無人島を開拓する世界的ベストセラー。",
                overview: "ボドゲの面白さの全てがここにある。資源を巡る「交渉」が戦略を熱くし、ダイス一投がドラマを生む。島を開拓するワクワクと、相手を出し抜く心理戦。一度遊べば誰もが虜になる、世界で最も愛される伝説の傑作です。",
                img: "assets/images/game_catan.jpg",
                tags: ["#初心者歓迎", "#60分〜"],
                featured: true,
                players: "3-4人",
                playtime: "60-90分",
                youtubeUrl: "https://www.youtube.com/watch?v=TN8vjBQnPQk"
            },
            {
                id: 2,
                title: "Dominion",
                desc: "自分だけのデッキを構築するカードゲーム。",
                overview: "デッキ構築型ゲームの元祖にして金字塔。最初は銅貨と屋敷しかない小さなデッキが、徐々に強力な王国へと発展していきます。カードの組み合わせは無限大。",
                img: "assets/images/game_dominion.jpg",
                tags: ["#戦略", "#30分〜"],
                featured: true,
                players: "2-4人",
                playtime: "30分"
            },
            { id: 3, title: "Blokus", desc: "テトリスのようなピースを角で繋げる陣取りゲーム。", overview: "", img: "assets/images/game_blokus.jpg", tags: ["#パズル", "#20分〜"], featured: true, players: "2-4人", playtime: "20-30分" },
            { id: 4, title: "Geister", desc: "良いオバケと悪いオバケを取り合う心理戦。", overview: "", img: "assets/images/game_geister.jpg", tags: ["#心理戦", "#15分〜"], featured: true, players: "2人", playtime: "15分" },
            { id: 5, title: "Ito", desc: "数字を言葉で例えて協力するパーティーゲーム。", overview: "", img: "assets/images/game_sample.png", tags: ["#盛り上がる", "#20分〜"], featured: true, players: "2-10人", playtime: "20分" },
            { id: 6, title: "Splendor", desc: "宝石商となり威信ポイントを稼ぐ戦略ゲーム。", overview: "", img: "assets/images/game_sample.png", tags: ["#買い物", "#30分〜"], featured: true, players: "2-4人", playtime: "30分" },
            { id: 7, title: "Dixit", desc: "抽象的な絵柄から親の想像を当てるゲーム。", overview: "", img: "assets/images/game_sample.png", tags: ["#想像力", "#30分〜"], featured: true, players: "3-6人", playtime: "30分" },
            { id: 8, title: "Skull", desc: "嘘と度胸の心理戦ブラフゲーム。", overview: "", img: "assets/images/game_sample.png", tags: ["#心理戦", "#15分〜"], featured: true, players: "3-6人", playtime: "15-30分" }
        ];
    }

    const games = await getGamesData();
    const gameGridFull = document.getElementById('game-grid-full'); // For games.html

    const modal = document.getElementById('game-modal');
    const closeModalBtn = modal ? modal.querySelector('.close-modal') : null;
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');

    function createGameElement(game) {
        const item = document.createElement('div');
        item.classList.add('game-item');

        let tagsHtml = '';
        if (game.tags) {
            tagsHtml = '<div class="game-tags">' + game.tags.map(tag => `<span>${tag}</span>`).join('') + '</div>';
        }

        item.innerHTML = `
            <div class="game-img-wrapper">
                <img src="${game.img}" alt="${game.title}">
            </div>
            ${tagsHtml}
            <div class="game-title-overlay">${game.title}</div>
            `;

        item.addEventListener('click', () => {
            openModal(game);
        });

        return item;
    }

    // Populate Games Page (Full Grid - Bookshelf Style)
    if (gameGridFull) {
        // Group games into rows of 5 for bookshelf layout
        const gamesPerRow = 5;
        for (let i = 0; i < games.length; i += gamesPerRow) {
            const rowGames = games.slice(i, i + gamesPerRow);
            const row = document.createElement('div');
            row.classList.add('bookshelf-row');

            rowGames.forEach(game => {
                row.appendChild(createGameElement(game));
            });

            gameGridFull.appendChild(row);
        }
    }

    // Populate Home Page (Featured games only - in marquee)
    const gameMarqueeContent = document.querySelector('.game-marquee-content');

    if (gameMarqueeContent) {
        try {
            // Display featured games (max 8)
            const featuredGames = games.filter(g => g.featured).slice(0, 8);

            if (featuredGames.length > 0) {
                // Triple the content for seamless infinite loop
                const tripled = [...featuredGames, ...featuredGames, ...featuredGames];

                gameMarqueeContent.innerHTML = tripled.map(game => {
                    const tagsHtml = game.tags ? game.tags.map(tag => `<span>${tag}</span>`).join('') : '';
                    return `
                        <div class="game-item" data-game-id="${game.id}">
                            <div class="game-img-wrapper"><img src="${game.img}" alt="${game.title}"></div>
                            <div class="game-tags">${tagsHtml}</div>
                            <div class="game-title-overlay">${game.title}</div>
                        </div>
                    `;
                }).join('');

                // Add click listeners for modal
                gameMarqueeContent.querySelectorAll('.game-item').forEach(item => {
                    const gameId = parseInt(item.dataset.gameId);
                    const game = games.find(g => g.id === gameId);
                    if (game) {
                        item.addEventListener('click', () => openModal(game));
                    }
                });
            }
        } catch (e) {
            console.error("Game Marquee Population Failed:", e);
        }
    }

    // Modal Functions
    function openModal(game) {
        if (!modal) return;
        modalImg.src = game.img;
        modalTitle.textContent = game.title;
        modalDesc.textContent = game.desc;

        // Display players and playtime
        const modalMeta = document.getElementById('modal-meta');
        const modalPlayers = document.getElementById('modal-players');
        const modalPlaytime = document.getElementById('modal-playtime');

        if (game.players) {
            modalPlayers.innerHTML = `<i class="fas fa-users"></i> ${game.players}`;
            modalPlayers.style.display = 'flex';
        } else {
            modalPlayers.style.display = 'none';
        }

        if (game.playtime) {
            modalPlaytime.innerHTML = `<i class="fas fa-clock"></i> ${game.playtime}`;
            modalPlaytime.style.display = 'flex';
        } else {
            modalPlaytime.style.display = 'none';
        }

        // Hide meta container if both are empty
        if (!game.players && !game.playtime) {
            modalMeta.style.display = 'none';
        } else {
            modalMeta.style.display = 'flex';
        }

        // Display tags
        const modalTags = document.getElementById('modal-tags');
        if (game.tags && game.tags.length > 0) {
            modalTags.innerHTML = game.tags.map(tag => `<span>${tag}</span>`).join('');
            modalTags.style.display = 'flex';
        } else {
            modalTags.style.display = 'none';
        }

        // Display YouTube video
        const videoContainer = document.getElementById('modal-video-container');
        const videoIframe = document.getElementById('modal-video');

        if (game.youtubeUrl) {
            // Convert YouTube URL to embed URL
            let embedUrl = '';
            const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
            const match = game.youtubeUrl.match(youtubeRegex);
            if (match) {
                embedUrl = `https://www.youtube.com/embed/${match[1]}`;
            }

            if (embedUrl) {
                videoIframe.src = embedUrl;
                videoContainer.style.display = 'block';
            } else {
                videoContainer.style.display = 'none';
            }
        } else {
            videoContainer.style.display = 'none';
            videoIframe.src = '';
        }

        // Display game overview
        const overviewContainer = document.getElementById('modal-overview-container');
        const overviewText = document.getElementById('modal-overview');

        if (game.overview && overviewContainer && overviewText) {
            overviewText.textContent = game.overview;
            overviewContainer.style.display = 'block';
        } else if (overviewContainer) {
            overviewContainer.style.display = 'none';
        }

        modal.style.display = 'flex';
        // Small delay to allow display flex to apply before opacity transition
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    function hideModal() {
        if (!modal) return;
        modal.classList.remove('show');
        // Stop video when closing modal
        const videoIframe = document.getElementById('modal-video');
        if (videoIframe) {
            videoIframe.src = '';
        }
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }

    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal();
            }
        });
    }

    // Header Scroll Logic
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Intersection Observer for Scroll Animation ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.scroll-fade');
    fadeElements.forEach(el => observer.observe(el));

    // --- Price Calculator ---
    const calcModal = document.getElementById('calc-modal');
    const closeCalc = document.querySelector('.close-calc');
    const priceCards = document.querySelectorAll('.price-card[data-plan]');

    // Inputs
    const calcHours = document.getElementById('calc-hours');
    const calcMinutes = document.getElementById('calc-minutes');

    // Displays
    const calcPlanName = document.getElementById('calc-plan-name');
    const calcTimeFee = document.getElementById('calc-time-fee');
    const calcTotalFee = document.getElementById('calc-total-fee');

    let currentRate = 0; // yen per 10 mins

    priceCards.forEach(card => {
        card.addEventListener('click', () => {
            try {
                const plan = card.getAttribute('data-plan');
                const rateStr = card.getAttribute('data-rate');

                if (!plan || !rateStr) {
                    return;
                }

                const rate = parseInt(rateStr, 10);

                // Robust title extraction
                const h3 = card.querySelector('h3');
                const title = h3 ? h3.textContent.trim().replace(/\s+/g, '') : 'プラン';

                currentRate = rate;
                if (calcPlanName) calcPlanName.textContent = title;

                // Reset inputs
                if (calcHours) calcHours.value = 1;
                if (calcMinutes) calcMinutes.value = 0;

                updateCalculation();

                if (calcModal) {
                    calcModal.style.display = 'flex';
                    // Force reflow to ensure transition plays
                    void calcModal.offsetWidth;
                    calcModal.classList.add('show');
                }
            } catch (e) {
                console.error("Error opening simulation modal:", e);
            }
        });
    });

    function updateCalculation() {
        if (!calcHours || !calcMinutes) return;
        const hours = parseInt(calcHours.value) || 0;
        const minutes = parseInt(calcMinutes.value) || 0;

        const totalMinutes = (hours * 60) + minutes;
        const units = Math.ceil(totalMinutes / 10); // Round up to nearest 10 min

        const timeFee = units * currentRate;
        const admissionFee = 500;
        const total = timeFee + admissionFee;

        if (calcTimeFee) calcTimeFee.textContent = `¥${timeFee.toLocaleString()}`;
        if (calcTotalFee) calcTotalFee.textContent = `¥${total.toLocaleString()}`;
    }

    // Listen for inputs
    if (calcHours) calcHours.addEventListener('input', updateCalculation);
    if (calcMinutes) calcMinutes.addEventListener('input', updateCalculation);

    // Close Modal Logic
    if (closeCalc) {
        closeCalc.addEventListener('click', () => {
            if (calcModal) {
                calcModal.classList.remove('show');
                setTimeout(() => calcModal.style.display = 'none', 300);
            }
        });
    }

    if (calcModal) {
        window.addEventListener('click', (e) => {
            if (e.target === calcModal) {
                calcModal.classList.remove('show');
                setTimeout(() => calcModal.style.display = 'none', 300);
            }
        });
    }

    // --- Touch Scroll for Gallery and Games (with infinite loop) ---
    function addTouchScroll(wrapper, content) {
        if (!wrapper || !content) return;

        let isDown = false;
        let startX;
        let scrollLeft;
        let velocity = 0;
        let lastX = 0;
        let lastTime = Date.now();
        let isResetting = false;

        // Infinite scroll loop handler
        const handleInfiniteScroll = () => {
            if (isResetting) return;

            const scrollWidth = wrapper.scrollWidth;
            const clientWidth = wrapper.clientWidth;
            const currentScroll = wrapper.scrollLeft;

            // コンテンツは3倍になっているので、1/3の位置を基準にする
            const oneThirdWidth = scrollWidth / 3;
            const twoThirdWidth = (scrollWidth / 3) * 2;

            // 右端（2/3を超えた）に到達した場合、中央（1/3）に戻す
            if (currentScroll >= twoThirdWidth - clientWidth) {
                isResetting = true;
                wrapper.scrollLeft = currentScroll - oneThirdWidth;
                setTimeout(() => { isResetting = false; }, 50);
            }
            // 左端（1/3より前）に到達した場合、中央（2/3）に移動
            else if (currentScroll <= oneThirdWidth) {
                isResetting = true;
                wrapper.scrollLeft = currentScroll + oneThirdWidth;
                setTimeout(() => { isResetting = false; }, 50);
            }
        };

        // Scroll event listener for infinite loop
        wrapper.addEventListener('scroll', handleInfiniteScroll);

        // Pause animation on touch
        wrapper.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX;
            lastX = startX;
            scrollLeft = wrapper.scrollLeft;
            lastTime = Date.now();
            velocity = 0;
            content.style.animationPlayState = 'paused';
        });

        wrapper.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            wrapper.scrollLeft = scrollLeft - walk;

            // Calculate velocity for momentum
            const now = Date.now();
            const dt = now - lastTime;
            if (dt > 0) {
                velocity = (x - lastX) / dt;
            }
            lastX = x;
            lastTime = now;
        });

        wrapper.addEventListener('touchend', () => {
            isDown = false;
            // Apply momentum scrolling
            let momentum = velocity * 100;
            const deceleration = 0.95;

            const momentumScroll = () => {
                if (Math.abs(momentum) > 0.5) {
                    wrapper.scrollLeft -= momentum;
                    momentum *= deceleration;
                    requestAnimationFrame(momentumScroll);
                } else {
                    content.style.animationPlayState = 'running';
                }
            };
            momentumScroll();
        });

        // Mouse drag support for desktop
        wrapper.addEventListener('mousedown', (e) => {
            isDown = true;
            wrapper.style.cursor = 'grabbing';
            startX = e.pageX;
            scrollLeft = wrapper.scrollLeft;
            content.style.animationPlayState = 'paused';
        });

        wrapper.addEventListener('mouseleave', () => {
            if (isDown) {
                isDown = false;
                wrapper.style.cursor = 'grab';
                content.style.animationPlayState = 'running';
            }
        });

        wrapper.addEventListener('mouseup', () => {
            isDown = false;
            wrapper.style.cursor = 'grab';
            content.style.animationPlayState = 'running';
        });

        wrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX;
            const walk = (x - startX) * 2;
            wrapper.scrollLeft = scrollLeft - walk;
        });

        wrapper.style.cursor = 'grab';
        wrapper.style.overflowX = 'auto';
        wrapper.style.scrollbarWidth = 'none'; // Firefox
        wrapper.style.msOverflowStyle = 'none'; // IE

        // 初期スクロール位置を中央に設定（ループの開始点 = 1/3の位置から）
        setTimeout(() => {
            const oneThirdWidth = wrapper.scrollWidth / 3;
            wrapper.scrollLeft = oneThirdWidth;
        }, 100);
    }

    // Apply to gallery
    const galleryWrapper = document.querySelector('.marquee-wrapper');
    const galleryContent = document.querySelector('.marquee-content');
    addTouchScroll(galleryWrapper, galleryContent);

    // Apply to games
    const gameWrapper = document.querySelector('.game-marquee-wrapper');
    const gameContent = document.querySelector('.game-marquee-content');
    addTouchScroll(gameWrapper, gameContent);

    // --- Dynamic News from Supabase ---
    async function loadNews() {
        const newsList = document.getElementById('news-list');
        if (!newsList) return;

        let news = null;

        // Supabaseから直接取得
        if (typeof getNewsDataFromDB !== 'undefined') {
            news = await getNewsDataFromDB();
        }

        // データがない場合のみデフォルト値
        if (!news || news.length === 0) {
            news = [
                { id: 1, title: "オープン記念キャンペーン", content: "オープン記念で入場料無料キャンペーン実施中！", date: "2024-01-15", important: true },
                { id: 2, title: "営業時間のお知らせ", content: "平日12:00-22:00、土日祝11:00-23:00で営業しております。", date: "2024-01-10", important: false }
            ];
            console.warn('お知らせデータが取得できませんでした。デフォルトデータを表示します。');
        }

        // Sort by date (newest first)
        news.sort((a, b) => new Date(b.date) - new Date(a.date));

        newsList.innerHTML = news.map(item => `
            <div class="news-item ${item.important ? 'important' : ''}">
                <div class="news-header">
                    <span class="news-date">${item.date}</span>
                    ${item.important ? '<span class="news-badge">重要</span>' : ''}
                </div>
                <h3 class="news-title">${item.title}</h3>
                <p class="news-content">${item.content}</p>
            </div>
        `).join('');
    }

    loadNews();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// --- Scroll-linked Geometric Shapes Animation ---
// スクロール連動の幾何学図形アニメーション
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(scrollY / maxScroll, 1);

    // body::before（円形）の動き
    const circleRotate = scrollProgress * 360; // 1回転
    const circleScale = 1 + scrollProgress * 0.3; // 最大1.3倍

    // body::after（三角形）の動き
    const triangleRotate = -scrollProgress * 180; // 半回転（逆方向）
    const triangleTranslate = scrollProgress * 50; // 50px移動

    // CSSカスタムプロパティとして設定
    document.documentElement.style.setProperty('--scroll-circle-rotate', circleRotate + 'deg');
    document.documentElement.style.setProperty('--scroll-circle-scale', circleScale);
    document.documentElement.style.setProperty('--scroll-triangle-rotate', triangleRotate + 'deg');
    document.documentElement.style.setProperty('--scroll-triangle-translate', triangleTranslate + 'px');
});
