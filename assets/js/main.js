const init = () => {

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
    }

    // Populate Home Page (Grid)
    const gameLibraryGrid = document.getElementById('game-library-grid');

    if (gameLibraryGrid) {
        try {
            // Clear static content first
            gameLibraryGrid.innerHTML = '';

            // Display top 8 games
            const topGames = games.slice(0, 8);

            topGames.forEach(game => {
                const item = createGameElement(game);
                gameLibraryGrid.appendChild(item);
            });
        } catch (e) {
            console.error("Game Grid Population Failed:", e);
            gameLibraryGrid.innerHTML = '<p style="color:white; text-align:center;">読み込みエラーが発生しました。</p>';
        }
    }

    // Modal Functions
    function openModal(game) {
        if (!modal) return;
        modalImg.src = game.img;
        modalTitle.textContent = game.title;
        modalDesc.textContent = game.desc;
        modal.style.display = 'flex';
        // Small delay to allow display flex to apply before opacity transition
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    function hideModal() {
        if (!modal) return;
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
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
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
