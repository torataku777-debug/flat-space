document.addEventListener('DOMContentLoaded', () => {

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
            // Attempt to play
            const playPromise = openingVideo.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Autoplay prevented or video failed:", error);
                    openingOverlay.style.display = 'none';
                });
            }

            // SAFETY: Force hide after 1.5 seconds (ultra short)
            setTimeout(() => {
                if (openingOverlay.style.display !== 'none') {
                    openingOverlay.classList.add('fade-out');
                    setTimeout(() => {
                        openingOverlay.style.display = 'none';
                        document.body.style.overflow = '';
                        document.documentElement.style.overflow = ''; // Unlock html too
                    }, 500);
                }
            }, 1500);

            let fadeStarted = false;

            // Lock scroll initially (Both body and html for better coverage)
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';

            openingVideo.addEventListener('timeupdate', () => {
                // Start fade out at 1.0s mark
                if (!fadeStarted && (openingVideo.currentTime >= 1.0 || (openingVideo.duration > 0 && openingVideo.duration - openingVideo.currentTime <= 0.5))) {
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

        // --- Mobile Menu Toggle ---
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileLinks = mobileMenu.querySelectorAll('a');

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

        // --- Game Library Grid & Modal ---
        const games = [
            { title: "Catan", desc: "無人島を開拓する世界的ベストセラー。", img: "assets/images/game_catan.jpg", tags: ["#初心者歓迎", "#60分〜"] },
            { title: "Dominion", desc: "自分だけのデッキを構築するカードゲーム。", img: "assets/images/game_dominion.jpg", tags: ["#戦略", "#30分〜"] },
            { title: "Blokus", desc: "テトリスのようなピースを角で繋げる陣取りゲーム。", img: "assets/images/game_blokus.jpg", tags: ["#パズル", "#20分〜"] },
            { title: "Geister", desc: "良いオバケと悪いオバケを取り合う心理戦。", img: "assets/images/game_geister.jpg", tags: ["#心理戦", "#15分〜"] },
            { title: "Ito", desc: "数字を言葉で例えて協力するパーティーゲーム。", img: "assets/images/game_sample.png", tags: ["#盛り上がる", "#20分〜"] },
            { title: "Splendor", desc: "宝石商となり威信ポイントを稼ぐ戦略ゲーム。", img: "assets/images/game_sample.png", tags: ["#買い物", "#30分〜"] },
            { title: "Dixit", desc: "抽象的な絵柄から親の想像を当てるゲーム。", img: "assets/images/game_sample.png", tags: ["#想像力", "#30分〜"] },
            { title: "Skull", desc: "嘘と度胸の心理戦ブラフゲーム。", img: "assets/images/game_sample.png", tags: ["#心理戦", "#15分〜"] }
        ];

        const gameGridFull = document.getElementById('game-grid-full'); // For games.html

        const modal = document.getElementById('game-modal');
        const closeModal = document.querySelector('.close-modal');
        const modalImg = document.getElementById('modal-img');
        const modalTitle = document.getElementById('modal-title');
        const modalDesc = document.getElementById('modal-desc');

        function createGameElement(game) {
            const item = document.createElement('div');
            item.classList.add('game-item');
            // item.classList.add('scroll-fade'); // Removed to force visibility

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

        // Populate Games Page (Full Grid)
        if (gameGridFull) {
            games.forEach(game => {
                gameGridFull.appendChild(createGameElement(game));
});
