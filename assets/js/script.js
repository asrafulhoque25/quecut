// ===== MOBILE OFF-CANVAS MENU (open / close / services panel) =====
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.navbar-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (!navToggle) {
        console.warn('navbar-toggle button pawa jayni. HTML e .navbar-toggle class ache kina check korun.');
        return;
    }
    if (!mobileMenu) {
        console.warn('.mobile-menu element pawa jayni. HTML e mobile menu markup add kora hoyeche kina check korun.');
        return;
    }

    const closeButtons = mobileMenu.querySelectorAll('.mobile-menu-close');
    const expandLinks = mobileMenu.querySelectorAll('.mobile-menu-expand');
    const backButtons = mobileMenu.querySelectorAll('.mobile-menu-back');

    const openMenu = () => {
        mobileMenu.classList.add('active');
        document.body.classList.add('mobile-menu-active');
    };

    const closeMenu = () => {
        mobileMenu.classList.remove('active');
        mobileMenu.classList.remove('show-services');
        document.body.classList.remove('mobile-menu-active');
    };

    navToggle.addEventListener('click', openMenu);

    closeButtons.forEach((btn) => btn.addEventListener('click', closeMenu));

    expandLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            mobileMenu.classList.add('show-services');
        });
    });

    backButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            mobileMenu.classList.remove('show-services');
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) closeMenu();
    });
});





// ===== STICKY SHRINKING NAVBAR ON SCROLL =====
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const SCROLL_THRESHOLD = 40;
    let ticking = false;

    const updateNavbar = () => {
        navbar.classList.toggle('navbar-scrolled', window.scrollY > SCROLL_THRESHOLD);
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }, { passive: true });

    updateNavbar(); // handle page loaded already scrolled (e.g. anchor link, refresh mid-page)
});




// ================= BANNER SLIDERS (Splide + AutoScroll, responsive direction) =================
document.addEventListener('DOMContentLoaded', () => {
    let currentMode = null;
    let sliderInstances = [];

    function destroySliders() {
        sliderInstances.forEach((instance) => instance.destroy());
        sliderInstances = [];
    }

    const DESKTOP_GAP = 16;
    const DESKTOP_VISIBLE_COUNT = 2.5;
    const DESKTOP_COL_PADDING = 48;

    function computeDesktopSlideHeight() {
        return (window.innerHeight - DESKTOP_COL_PADDING - DESKTOP_GAP * (DESKTOP_VISIBLE_COUNT - 1)) / DESKTOP_VISIBLE_COUNT;
    }

    // helper: pause autoScroll while dragging, resume after release
    function attachDragPause(splideInstance) {
        splideInstance.on('mounted', () => {
            const autoScroll = splideInstance.Components.AutoScroll;
            splideInstance.on('drag', () => autoScroll.pause());
            splideInstance.on('dragged', () => autoScroll.play());
        });
    }

    function initDesktopColumns() {
        const slideHeight = computeDesktopSlideHeight();

        document.querySelectorAll('.banner-slide-col').forEach((el) => {
            const dir = el.dataset.direction; // 'up' or 'down'
            const slideCount = el.querySelectorAll('.splide__slide').length;
            const speed = dir === 'down' ? 0.5 : -0.5;

            const splide = new Splide(el, {
                type: 'loop',
                direction: 'ttb',
                height: '100%',
                fixedHeight: slideHeight,
                perPage: 1,
                gap: DESKTOP_GAP,
                arrows: false,
                pagination: false,
                drag: 'free',            // <-- fix: smooth free-drag, both directions
                clones: slideCount * 4,  // <-- fix: enough buffer for both up & down drag
                autoScroll: {
                    speed: speed,
                    pauseOnHover: true,
                    pauseOnFocus: false,
                },
            });

            attachDragPause(splide);
            splide.mount({ AutoScroll: window.splide.Extensions.AutoScroll });
            sliderInstances.push(splide);
        });
    }

    function initMobileRows() {
        document.querySelectorAll('.banner-slide-row').forEach((el) => {
            const dir = el.dataset.direction; // 'ltr' or 'rtl'
            const slideCount = el.querySelectorAll('.splide__slide').length;

            const splide = new Splide(el, {
                type: 'loop',
                direction: dir === 'rtl' ? 'rtl' : 'ltr',
                perPage: 'auto',
                autoWidth: true,          // <-- fix: accurate width detection for clone calculation
                gap: 12,
                arrows: false,
                pagination: false,
                drag: 'free',             // <-- fix: smooth free-drag, both directions
                clones: slideCount * 4,   // <-- fix: enough buffer for both left & right drag
                autoScroll: {
                    speed: 0.5,
                    pauseOnHover: true,
                    pauseOnFocus: false,
                },
            });

            attachDragPause(splide);
            splide.mount({ AutoScroll: window.splide.Extensions.AutoScroll });
            sliderInstances.push(splide);
        });
    }

    function initBannerSliders() {
        const mode = window.matchMedia('(max-width: 1023px)').matches ? 'mobile' : 'desktop';
        currentMode = mode;

        destroySliders();

        if (mode === 'mobile') {
            initMobileRows();
        } else {
            initDesktopColumns();
        }
    }

    initBannerSliders();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initBannerSliders, 250);
    });
});

// ================= BANNER BUTTONS: GSAP MAGNETIC HOVER =================
document.addEventListener('DOMContentLoaded', () => {
 
    const MAGNETIC_MAX_DISTANCE = 12; // px -- movement can never exceed this, however far the mouse goes
    const clamp = (value) => Math.max(-MAGNETIC_MAX_DISTANCE, Math.min(MAGNETIC_MAX_DISTANCE, value));
 
    // ---- grouped magnetic buttons: icon + text inside .btn-cta move TOGETHER,
    // driven by one mousemove listener on the shared outer anchor, so they
    // never drift apart / overlap independently anymore.
    document.querySelectorAll('.btn-cta').forEach((group) => {
        const magneticChildren = group.querySelectorAll('.magnetic-btn');
 
        group.addEventListener('mousemove', (e) => {
            const rect = group.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
 
            magneticChildren.forEach((child) => {
                gsap.to(child, {
                    x: clamp(x * 0.15),
                    y: clamp(y * 0.15),
                    duration: 0.4,
                    ease: 'power3.out',
                });
            });
        });
 
        group.addEventListener('mouseleave', () => {
            magneticChildren.forEach((child) => {
                gsap.to(child, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: 'elastic.out(1, 0.4)',
                });
            });
        });
    });
 
    // ---- standalone magnetic buttons (e.g. See Pricing): unchanged, independent per-element ----
    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
        if (btn.closest('.btn-cta')) return; // already handled by the group logic above
 
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
 
            gsap.to(btn, {
                x: clamp(x * 0.2),
                y: clamp(y * 0.2),
                duration: 0.4,
                ease: 'power3.out',
            });
        });
 
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.4)',
            });
        });
    });
});






// ================= ACHIEVEMENTS SLIDER (Splide + AutoScroll) =================
document.addEventListener('DOMContentLoaded', () => {
    const achievementsEl = document.querySelector('.achievements-slider');
    if (!achievementsEl) return;

    const slideCount = achievementsEl.querySelectorAll('.splide__slide').length;

    const achievementsSplide = new Splide(achievementsEl, {
        type: 'loop',
        direction: 'ltr',
        perPage: 5,       // desktop: 5 cards per view
        gap: 16,
        arrows: false,
        pagination: false,
        drag: 'free',        
        breakpoints: {
            1440: { perPage: 4 }, 
            1200: { perPage: 3.5 }, 
            991: { perPage: 2.5 }, 
            776: { perPage: 2.5 }, 
            667: { perPage: 2,gap:8 }, 
        },
        autoScroll: {
            speed: 0.5,
            pauseOnHover: true,
            pauseOnFocus: false,
        },
    });

    achievementsSplide.on('mounted', () => {
        const autoScroll = achievementsSplide.Components.AutoScroll;
        achievementsSplide.on('drag', () => autoScroll.pause());
        achievementsSplide.on('dragged', () => autoScroll.play());
    });

    achievementsSplide.mount({ AutoScroll: window.splide.Extensions.AutoScroll });
});









// ================= PORTFOLIO: TAB FILTER + DRAG-SCROLL TABS =================
// ================= PORTFOLIO: TAB FILTER + PAGINATION + DRAG-SCROLL TABS =================
document.addEventListener('DOMContentLoaded', () => {
    const tabsWrapper = document.querySelector('.portfolio-tabs-wrapper');
    const tabs = document.querySelectorAll('.portfolio-tab');
    const cards = Array.from(document.querySelectorAll('.portfolio-card'));
    const loadMoreBtn = document.getElementById('portfolioLoadMoreBtn');
    if (!tabs.length || !cards.length || !loadMoreBtn) return; // <- guard: skip entirely if this page has no tabs
 
    const INITIAL_COUNT = 9;
    const LOAD_STEP = 6;
 
    let currentFilter = 'all';
    let visibleCount = INITIAL_COUNT;
 
    function matchingCards() {
        return cards.filter((card) => currentFilter === 'all' || card.dataset.category === currentFilter);
    }
 
    function render() {
        const matches = matchingCards();
 
        cards.forEach((card) => {
            const matches_ = currentFilter === 'all' || card.dataset.category === currentFilter;
            card.classList.toggle('is-hidden', !matches_);
        });
 
        matches.forEach((card, i) => {
            card.classList.toggle('is-hidden', i >= visibleCount);
        });
 
        if (visibleCount >= matches.length) {
            loadMoreBtn.classList.add('is-disabled');
            loadMoreBtn.setAttribute('aria-disabled', 'true');
        } else {
            loadMoreBtn.classList.remove('is-disabled');
            loadMoreBtn.removeAttribute('aria-disabled');
        }
    }
 
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            visibleCount = INITIAL_COUNT;
            render();
        });
    });
 
    loadMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (loadMoreBtn.classList.contains('is-disabled')) return;
        visibleCount += LOAD_STEP;
        render();
    });
 
    render();
 
    if (!tabsWrapper) return;
    let isDown = false;
    let startX = 0;
    let scrollLeftStart = 0;
    tabsWrapper.addEventListener('mousedown', (e) => {
        isDown = true;
        tabsWrapper.classList.add('is-dragging');
        startX = e.pageX - tabsWrapper.offsetLeft;
        scrollLeftStart = tabsWrapper.scrollLeft;
    });
    ['mouseleave', 'mouseup'].forEach((evt) => {
        tabsWrapper.addEventListener(evt, () => {
            isDown = false;
            tabsWrapper.classList.remove('is-dragging');
        });
    });
    tabsWrapper.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - tabsWrapper.offsetLeft;
        const walk = x - startX;
        tabsWrapper.scrollLeft = scrollLeftStart - walk;
    });
});
 
// ================= 2) PLAIN LOAD MORE (industryGrid / loadMoreBtn) =================
// Only runs on pages that have #industryGrid — i.e. every page that
// is NOT the home page (home uses #portfolioLoadMoreBtn above instead).
document.addEventListener('DOMContentLoaded', () => {
    const ITEMS_PER_CLICK = 6;
    const grid = document.getElementById('industryGrid');
    const button = document.getElementById('loadMoreBtn');
    if (!grid || !button) return; // <- guard: skip entirely if this page has no plain load-more grid
 
    const cards = Array.from(grid.querySelectorAll('.industry-card'));
    const initialCount = ITEMS_PER_CLICK;
    let visibleCount = Math.min(initialCount, cards.length);
 
    function render() {
        cards.forEach((card, i) => {
            card.classList.toggle('hidden', i >= visibleCount);
        });
 
        const allVisible = visibleCount >= cards.length;
        button.textContent = allVisible ? 'SHOW LESS' : 'LOAD MORE';
        button.disabled = false;
 
        if (cards.length <= initialCount) {
            button.disabled = true;
            button.textContent = 'LOAD MORE';
        }
    }
 
    button.addEventListener('click', () => {
        const allVisible = visibleCount >= cards.length;
        if (allVisible) {
            visibleCount = initialCount;
            render();
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            visibleCount = Math.min(visibleCount + ITEMS_PER_CLICK, cards.length);
            render();
        }
    });
 
    render();
});
 
// ================= 3) VIDEO HOVER PREVIEW =================
// Generic — safely does nothing on pages with no video cards.
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.portfolio-card[data-type="video"]').forEach((card) => {
        const video = card.querySelector('.portfolio-hover-video');
        if (!video) return;
        const src = card.dataset.video;
 
        card.addEventListener('mouseenter', () => {
            if (!video.src) video.src = src;
            video.currentTime = 0;
            video.play().catch(() => {});
        });
        card.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
        card.addEventListener('touchstart', () => {
            if (!video.src) video.src = src;
            video.play().catch(() => {});
        }, { passive: true });
    });
});
 
// ================= 4) CLICK -> IMAGE / VIDEO POPUP =================
// Generic — targets every .portfolio-card on any page. Works whether
// the page has an image modal only, a video modal only, both, or
// (in the unlikely case) neither — each modal is independently
// optional via the hasImageModal / hasVideoModal checks below.
document.addEventListener('DOMContentLoaded', () => {
    const imageModal = document.getElementById('portfolioImageModal');
    const imageModalImg = document.getElementById('portfolioImageModalImg');
    const imageModalClose = document.getElementById('portfolioImageModalClose');
 
    const videoModal = document.getElementById('portfolioVideoModal');
    const videoModalClose = document.getElementById('portfolioVideoModalClose');
    const videoModalPlayer = document.getElementById('portfolioVideoModalPlayer');
    const videoModalTitle = document.getElementById('portfolioVideoModalTitle');
    const videoModalCurrent = document.getElementById('portfolioVideoModalCurrent');
    const videoModalDuration = document.getElementById('portfolioVideoModalDuration');
    const videoModalProgress = document.getElementById('portfolioVideoModalProgress');
    const videoModalBubble = document.getElementById('portfolioVideoModalBubble');
 
    const hasImageModal = imageModal && imageModalImg && imageModalClose;
    const hasVideoModal = videoModal && videoModalPlayer && videoModalTitle && videoModalCurrent && videoModalDuration && videoModalProgress && videoModalBubble;
 
    if (!hasImageModal && !hasVideoModal) return; // <- guard: skip entirely if neither modal exists on this page
 
    const playPauseBtn = hasVideoModal ? videoModal.querySelector('.video-modal-playpause') : null;
    const iconPlay = playPauseBtn ? playPauseBtn.querySelector('.icon-play') : null;
    const iconPause = playPauseBtn ? playPauseBtn.querySelector('.icon-pause') : null;
 
    function formatTime(sec) {
        if (!isFinite(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
 
    function openImageModal(src, alt) {
        if (!hasImageModal) return;
        imageModalImg.src = src;
        imageModalImg.alt = alt || '';
        imageModal.classList.remove('hidden');
        imageModal.classList.add('flex', 'is-open');
        document.body.style.overflow = 'hidden';
    }
    function closeImageModal() {
        if (!hasImageModal) return;
        imageModal.classList.add('hidden');
        imageModal.classList.remove('flex', 'is-open');
        imageModalImg.src = '';
        document.body.style.overflow = '';
    }
 
    function openVideoModal(src, title) {
        if (!hasVideoModal) return;
        videoModalPlayer.src = src;
        videoModalTitle.textContent = title || '';
        videoModal.classList.remove('hidden');
        videoModal.classList.add('flex', 'is-open');
        document.body.style.overflow = 'hidden';
        videoModalPlayer.currentTime = 0;
        videoModalPlayer.play().catch(() => {});
    }
    function closeVideoModal() {
        if (!hasVideoModal) return;
        videoModal.classList.add('hidden');
        videoModal.classList.remove('flex', 'is-open');
        videoModalPlayer.pause();
        videoModalPlayer.removeAttribute('src');
        videoModalPlayer.load();
        document.body.style.overflow = '';
    }
 
    document.querySelectorAll('.portfolio-card').forEach((card) => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            if (card.dataset.type === 'video') {
                openVideoModal(card.dataset.video, card.dataset.title);
            } else {
                const img = card.querySelector('.portfolio-card-img') || card.querySelector('img');
                if (img) openImageModal(card.dataset.image || img.src, img.alt);
            }
        });
    });
 
    if (hasImageModal) {
        imageModalClose.addEventListener('click', closeImageModal);
        imageModal.addEventListener('click', (e) => { if (e.target === imageModal) closeImageModal(); });
    }
 
    if (hasVideoModal) {
        videoModalClose.addEventListener('click', closeVideoModal);
        videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideoModal(); });
    }
 
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (hasImageModal && imageModal.classList.contains('is-open')) closeImageModal();
        if (hasVideoModal && videoModal.classList.contains('is-open')) closeVideoModal();
    });
 
    if (hasVideoModal) {
        videoModal.querySelectorAll('[data-action]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'toggle') {
                    videoModalPlayer.paused ? videoModalPlayer.play() : videoModalPlayer.pause();
                } else if (action === 'rewind') {
                    videoModalPlayer.currentTime = Math.max(0, videoModalPlayer.currentTime - 10);
                } else if (action === 'forward') {
                    videoModalPlayer.currentTime = Math.min(videoModalPlayer.duration || 0, videoModalPlayer.currentTime + 10);
                }
            });
        });
 
        videoModalPlayer.addEventListener('play', () => {
            if (iconPlay) iconPlay.classList.add('hidden');
            if (iconPause) iconPause.classList.remove('hidden');
        });
        videoModalPlayer.addEventListener('pause', () => {
            if (iconPlay) iconPlay.classList.remove('hidden');
            if (iconPause) iconPause.classList.add('hidden');
        });
        videoModalPlayer.addEventListener('loadedmetadata', () => {
            videoModalDuration.textContent = formatTime(videoModalPlayer.duration);
        });
        videoModalPlayer.addEventListener('timeupdate', () => {
            if (!videoModalPlayer.duration) return;
            const pct = (videoModalPlayer.currentTime / videoModalPlayer.duration) * 100;
            videoModalProgress.value = pct;
            videoModalProgress.style.setProperty('--progress', pct + '%');
            videoModalCurrent.textContent = formatTime(videoModalPlayer.currentTime);
        });
        videoModalProgress.addEventListener('input', () => {
            if (!videoModalPlayer.duration) return;
            const pct = parseFloat(videoModalProgress.value);
            videoModalPlayer.currentTime = (pct / 100) * videoModalPlayer.duration;
            videoModalProgress.style.setProperty('--progress', pct + '%');
            const time = (pct / 100) * videoModalPlayer.duration;
            videoModalBubble.textContent = formatTime(time);
            videoModalBubble.classList.remove('hidden');
            videoModalBubble.style.left = pct + '%';
        });
        videoModalProgress.addEventListener('change', () => {
            videoModalBubble.classList.add('hidden');
        });
    }
});



// ================= TESTIMONIALS: SPLIDE MARQUEE (continuous, auto-scroll, draggable) =================
// Scoped to '.testimonial-slider' only, no generic selectors.
document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('.testimonial-slider');
    if (!el) return;

    const splide = new Splide(el, {
        type: 'loop',
        drag: 'free',
        focus: 'center',        
        perPage: 1,             
        autoWidth: true,
        gap: 24,
        arrows: false,
        pagination: false,
      
        autoScroll: {
            speed: 0.6,
            pauseOnHover: true,
            pauseOnFocus: false,
            rewind: false,      
        },
        breakpoints: {
            640: {
                gap: 12,
            },
        },
    });

    splide.on('mounted', () => {
        const autoScroll = splide.Components.AutoScroll;
        if (autoScroll) {
            splide.on('drag', () => autoScroll.pause());
            splide.on('dragged', () => autoScroll.play());
        }
    });

    splide.mount({ AutoScroll: window.splide.Extensions.AutoScroll });
});








// ================= WHY CHOOSE: LEFT SHAPE SCROLL ROTATION =================
// Scoped to '.choose-section-shape' only, no generic selectors.
document.addEventListener('DOMContentLoaded', () => {
    const shapes = document.querySelectorAll('.choose-section-shape');
    if (!shapes.length) return;
 
    shapes.forEach((shape) => {
        const section = shape.closest('section');
        gsap.set(shape, {
            rotation: -50,
            rotationY: -20,
            scale: 1,
            transformPerspective: 1200,
        });
 
        gsap.to(shape, {
            rotation: 0,
            rotationY: 0,
            scale: 1,
            ease: 'none', // linear -- motion should feel directly tied to scroll, not eased on its own
            scrollTrigger: {
                trigger: section || shape,
                start: 'top bottom',   // begins as soon as the section enters the viewport
                end: 'top 10%',        // finishes once the section has scrolled most of the way up
                scrub: 1,               // smoothly follows scroll position, with a little lag for smoothness
            },
        });
    });
});




document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger); // ensure registered

  const shapes = document.querySelectorAll('.choose-section-shape2');
  if (!shapes.length) return;

  shapes.forEach((shape) => {
    const section = shape.closest('section');

    gsap.fromTo(
      shape,
      {
        
        rotation: 0,
        transformOrigin: 'right bottom', 
      },
      {
        
        rotation: -35, 
        transformOrigin: 'right bottom',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'bottom center', 
          end: 'bottom 20%',     
          scrub: 1,               
          markers: false,        
        },
      }
    );
  });
});




// faq section start




function initFAQ(section) {
const faqItems = section.querySelectorAll('.faq-item');
if (!faqItems.length) return;

faqItems.forEach(item => {
const trigger = item.querySelector('.faq-trigger');
const content = item.querySelector('.faq-content');
const icon = item.querySelector('.icon-close');

if (!trigger || !content) return;

if (icon) {
icon.style.transition =
'transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)';
}

trigger.addEventListener('click', () => {
const isOpen = item.classList.contains('active');

// Close all other FAQs
faqItems.forEach(other => {
if (other !== item && other.classList.contains('active')) {
other.classList.remove('active');

other.classList.remove('border', 'border-[#A4DF00]/30');

const otherContent = other.querySelector('.faq-content');
const otherIcon = other.querySelector('.icon-close');

if (otherContent) {
otherContent.style.maxHeight = '0';
}

if (otherIcon) {
otherIcon.style.transform = 'rotate(0deg)';
}
}
});

if (isOpen) {
// Close current
item.classList.remove('active');
item.classList.remove('border', 'border-[#A4DF00]/30');

content.style.maxHeight = '0';

if (icon) {
icon.style.transform = 'rotate(0deg)';
}
} else {
// Open current
item.classList.add('active');
item.classList.add('border', 'border-[#A4DF00]/30');

content.style.maxHeight = content.scrollHeight + 'px';

if (icon) {
icon.style.transform = 'rotate(180deg)';
}
}
});
});
}

document.addEventListener('DOMContentLoaded', () => {
document.querySelectorAll('.quecut-faq').forEach(section => {
initFAQ(section);
});
});









//blog  section



/* ============================
   BLOG FILTER + SEARCH + LOAD MORE
   ============================ */
(function () {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    const items       = Array.from(grid.querySelectorAll('.blog-item'));
    const tabs        = Array.from(document.querySelectorAll('.blog-tab-btn'));
    const searchInput = document.getElementById('blogSearch');
    const loadMoreBtn = document.getElementById('blogLoadMore');
    const loadMoreWrap= document.getElementById('blogLoadMoreWrap');
    const emptyMsg    = document.getElementById('blogEmpty');

    const STEP    = 6;      // koto gula card ekbare dekhabe
    let visible   = STEP;
    let category  = 'all';
    let query     = '';

    function matches(item) {
        const cats  = (item.dataset.category || '').toLowerCase().split(/\s+/);
        const okCat = category === 'all' || cats.includes(category);
        if (!okCat) return false;

        if (!query) return true;
        const titleEl = item.querySelector('.blog-title');
        const title   = titleEl ? titleEl.textContent.toLowerCase() : '';
        return title.includes(query);
    }

    function render() {
        const matched = items.filter(matches);

        items.forEach(item => {
            item.classList.add('hidden');
            item.classList.remove('is-entering');
        });

        matched.slice(0, visible).forEach(item => {
            item.classList.remove('hidden');
            item.classList.add('is-entering');
        });

        // empty state
        emptyMsg.classList.toggle('hidden', matched.length !== 0);

        // load more button
        loadMoreWrap.classList.toggle('hidden', matched.length <= visible);
    }

    // ---- tab click ----
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            category = tab.dataset.filter;
            visible  = STEP;
            render();
        });
    });

    // ---- search (debounced) ----
    if (searchInput) {
        let timer;
        const runSearch = () => {
            query   = searchInput.value.trim().toLowerCase();
            visible = STEP;
            render();
        };
        searchInput.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(runSearch, 200);
        });
        searchInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); runSearch(); }
        });
    }

    // ---- load more ----
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', e => {
            e.preventDefault();
            visible += STEP;
            render();
        });
    }

    render();
})();


// document.addEventListener('DOMContentLoaded', () => {
//     const el = document.querySelector('.blog-slider');
//     if (!el) return;

//     const slideCount = el.querySelectorAll('.splide__slide').length;

//     const splide = new Splide(el, {
//         type: 'loop',
//         direction: 'ltr',
//         perPage: 3,              
//         gap: 24,
//         arrows: false,
//         pagination: false,
//         drag: 'free',
//         clones: slideCount * 4,   
//         breakpoints: {
//             1024: { perPage: 2 }, 
//             640:  { perPage: 1,
//                  gap: 12,
//              }, 
//         },
//         autoScroll: {
//             speed: 0.6,
//             pauseOnHover: true,
//             pauseOnFocus: false,
//         },
//     });

//     splide.on('mounted', () => {
//         const autoScroll = splide.Components.AutoScroll;
//         splide.on('drag', () => autoScroll.pause());
//         splide.on('dragged', () => autoScroll.play());
//     });

//     splide.mount({ AutoScroll: window.splide.Extensions.AutoScroll });
// });







// ===== SMOOTH SCROLL (Lenis) =====
const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.3,
    infinite: false,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);





// load more home page industry section

(function () {
  const ITEMS_PER_CLICK = 6;
  const grid   = document.getElementById('industryGrid');
  const button = document.getElementById('loadMoreBtn');
  if (!grid || !button) return;
 
  const cards = Array.from(grid.querySelectorAll('.industry-card'));
  const initialCount = ITEMS_PER_CLICK;
  let visibleCount = Math.min(initialCount, cards.length);
 
  function render() {
    cards.forEach((card, i) => {
      card.classList.toggle('hidden', i >= visibleCount);
    });
 
    const allVisible = visibleCount >= cards.length;
 
    if (allVisible) {
      // Everything is showing → offer Show less
      button.textContent = 'SHOW LESS';
      button.disabled = false;
    } else {
      button.textContent = 'LOAD MORE';
      button.disabled = false;
    }
 
    // If there was never more than one batch to begin with, disable entirely
    if (cards.length <= initialCount) {
      button.disabled = true;
      button.textContent = 'LOAD MORE';
    }
  }
 
  button.addEventListener('click', () => {
    const allVisible = visibleCount >= cards.length;
 
    if (allVisible) {
      // Collapse back to the first batch
      visibleCount = initialCount;
      render();
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Reveal the next batch
      visibleCount = Math.min(visibleCount + ITEMS_PER_CLICK, cards.length);
      render();
    }
  });
 
  render();
})(); 




//contact us arrow

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.js-select-rotate').forEach((wrapper) => {
        const select = wrapper.querySelector('select');
        const arrow = wrapper.querySelector('.js-select-arrow');
        if (!select || !arrow) return;
 
        select.addEventListener('focus', () => arrow.classList.add('rotate-180'));
        select.addEventListener('blur', () => arrow.classList.remove('rotate-180'));
        // some browsers fire 'change' without a preceding blur when picking via keyboard
        select.addEventListener('change', () => arrow.classList.remove('rotate-180'));
    });
});



// Why not a freelancer


document.addEventListener('DOMContentLoaded', () => {

    const backgrounds = document.querySelectorAll('.sec-bg-ani-grad');

    if (!backgrounds.length) return;

    backgrounds.forEach((bg) => {
        const section = bg.closest('section');

        gsap.to(bg, {
            opacity: 1,
            filter: 'brightness(1)',
            duration: 1.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: section || bg,
                start: 'top 70%',
                toggleActions: 'play none none reverse',
            },
        });
    });
});


// before and after drugable

if (typeof Draggable !== 'undefined') {
    gsap.registerPlugin(Draggable);

    document.querySelectorAll('.before-after-wrap').forEach((wrap) => {
        const afterImgWrap = wrap.querySelector('.img-wrap.is-after');
        const dragger      = wrap.querySelector('.dragger');
        if (!afterImgWrap || !dragger) return;

        gsap.set(dragger, { left: wrap.offsetWidth / 2 });

        function updateClip() {
            const draggerLeft = parseFloat(gsap.getProperty(dragger, 'left'));
            const revealFromRight = wrap.offsetWidth - draggerLeft;
            afterImgWrap.style.clipPath = `inset(0px ${revealFromRight}px 0px 0px)`;
        }

        const [draggableInstance] = Draggable.create(dragger, {
            type: 'left',
            bounds: wrap,
            onDrag: updateClip
        });

        function animateTo(leftPx) {
            gsap.to(dragger, {
                left: leftPx,
                duration: 0.7,
                ease: 'power3.out',
                onUpdate: updateClip
            });
        }

        // click / tap anywhere on the frame to smoothly jump the divider there
        wrap.addEventListener('click', (e) => {
            if (draggableInstance.isDragging) return;
            const rect = wrap.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clamped = Math.max(0, Math.min(clickX, wrap.offsetWidth));
            animateTo(clamped);
        });

        // re-clamp on resize so the split stays proportionally correct
        window.addEventListener('resize', () => {
            const current = parseFloat(gsap.getProperty(dragger, 'left'));
            const clamped = Math.max(0, Math.min(current, wrap.offsetWidth));
            gsap.set(dragger, { left: clamped });
            updateClip();
        });

        // initial paint
        updateClip();
    });
}



// ================= PROCESS TIMELINE (mobile): line starts/ends exactly at dot centers =================
(function () {
    function sizeProcessTimelines() {
        document.querySelectorAll('.process-timeline').forEach((container) => {
            const line = container.querySelector('.process-timeline-line');
            const dots = container.querySelectorAll('.process-timeline-dot');
            if (!line || dots.length < 2) return;
 
            const firstDot = dots[0];
            const lastDot = dots[dots.length - 1];
 
            const containerTop = container.getBoundingClientRect().top;
            const firstCenter = firstDot.getBoundingClientRect().top + firstDot.offsetHeight / 2 - containerTop;
            const lastCenter = lastDot.getBoundingClientRect().top + lastDot.offsetHeight / 2 - containerTop;
 
            line.style.top = firstCenter + 'px';
            line.style.height = Math.max(0, lastCenter - firstCenter) + 'px';
        });
    }
 
    document.addEventListener('DOMContentLoaded', sizeProcessTimelines);
 
    // card illustrations are images — their load can shift card height after
    // the initial DOMContentLoaded measurement, so re-measure once everything's in
    window.addEventListener('load', sizeProcessTimelines);
 
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(sizeProcessTimelines, 200);
    });
})();




// video start on hover 

document.querySelectorAll('.portfolio-card').forEach((card) => {
  const video  = card.querySelector('.card-video');
  const poster = card.querySelector('.card-poster');
  if (!video) return;

  let loaded = false;

  const playVideo = () => {
    if (!loaded) {            // prothom hover e load hobe — page fast thakbe
      video.load();
      loaded = true;
    }
    const p = video.play();
    if (p) p.catch(() => {});

    gsap.to(video,  { opacity: 1, duration: 0.4, ease: 'power2.out' });
    gsap.to(poster, { opacity: 0, duration: 0.4, ease: 'power2.out' });
  };

  const stopVideo = () => {
    gsap.to(video, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.inOut',
      onComplete: () => { video.pause(); video.currentTime = 0; }
    });
    gsap.to(poster, { opacity: 1, duration: 0.35, ease: 'power2.inOut' });
  };

  card.addEventListener('mouseenter', playVideo);
  card.addEventListener('mouseleave', stopVideo);
  card.addEventListener('focusin',  playVideo);  
  card.addEventListener('focusout', stopVideo);
});



//blog detail all js

/* ============================
   BLOG DETAILS — TABLE OF CONTENTS
   ============================ */
(function () {
  "use strict";

  const OFFSET          = -100;
  const SCROLL_DURATION = 1.2;
  const ACTIVE_CLASS    = "toc-active";
  const MAX_OPT_CHARS   = 38;

    const ACTIVATION_LINE = 140;   

  // module-level refs — scrollToSection theke setActive call korar jonno
  let navWrapRef, mobileSelectRef;
  let lastActiveId = null;
  let spyLocked    = false;
  let spyLockTimer;

  /* ── SLUG ── */
  const usedSlugs = {};
  function toSlug(text) {
    let slug = text.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    usedSlugs[slug] = (usedSlugs[slug] || 0) + 1;
    return usedSlugs[slug] > 1 ? slug + "-" + usedSlugs[slug] : slug;
  }

  /* ── INIT ── */
  function init() {
    const contentWrap = document.querySelector("[data-toc-content]");
    if (!contentWrap) return;

    const navWrap      = document.querySelector("[data-toc-nav]");
    const progressBar  = document.querySelector("[data-toc-progress]");
    const mobileSelect = document.querySelector("[data-toc-select]");

    navWrapRef      = navWrap;        // ← added
    mobileSelectRef = mobileSelect;   // ← added

    const headings = Array.from(contentWrap.querySelectorAll("h2, h3"));
    if (!headings.length) return;

    headings.forEach((h) => { if (!h.id) h.id = toSlug(h.textContent); });

    buildNav(headings, navWrap, mobileSelect);
    if (progressBar)  initProgressBar(contentWrap, progressBar);
    initScrollSpy(headings, navWrap, mobileSelect);
    if (navWrap)      bindNavClicks(navWrap);
    if (mobileSelect) { injectSelectArrow(mobileSelect); bindSelectChange(mobileSelect); }
  }

  /* ── BUILD NAV ── */
  function buildNav(headings, navWrap, mobileSelect) {
    if (!navWrap && !mobileSelect) return;
    if (navWrap)      navWrap.innerHTML      = "";
    if (mobileSelect) mobileSelect.innerHTML = "";

    // Group headings into [{h2, children:[h3…]}, …]
    const groups = [];
    headings.forEach((h) => {
      if (h.tagName === "H2") {
        groups.push({ h2: h, children: [] });
      } else if (h.tagName === "H3" && groups.length) {
        groups[groups.length - 1].children.push(h);
      }
    });

    groups.forEach((group) => {
      const { h2, children } = group;
      const hasChildren = children.length > 0;

      /* ── Desktop ── */
      if (navWrap) {

        // group wrapper — holds the h2 row + its collapsible h3 list
        const groupWrap = document.createElement("div");
        groupWrap.className = "toc-group";
        groupWrap.dataset.groupWrap = h2.id;

        // h2 row (link + optional arrow)
        const row = document.createElement("div");
        row.className = "toc-row";

        const a = document.createElement("a");
        a.href          = "#" + h2.id;
        a.dataset.tocId = h2.id;
        a.dataset.level = "2";
        a.textContent   = h2.textContent.trim();
        a.className     = "toc-link";
        row.appendChild(a);

        if (hasChildren) {
          const btn = document.createElement("button");
          btn.type          = "button";
          btn.dataset.group = h2.id;
          btn.setAttribute("aria-expanded", "false");
          btn.innerHTML     = arrowSVG(false);
          btn.className     = "toc-arrow-btn";
          row.appendChild(btn);
        }

        groupWrap.appendChild(row);

        // h3 wrapper — collapsed by default
        if (hasChildren) {
          const childWrap = document.createElement("div");
          childWrap.className = "toc-child-wrap";
          childWrap.dataset.parentGroup = h2.id;

          children.forEach((h3) => {
            const child = document.createElement("a");
            child.href          = "#" + h3.id;
            child.dataset.tocId = h3.id;
            child.dataset.level = "3";
            child.textContent   = h3.textContent.trim();
            child.className     = "toc-link";
            childWrap.appendChild(child);
          });

          const spacer = document.createElement("div");
          spacer.style.height = "6px";
          childWrap.appendChild(spacer);

          groupWrap.appendChild(childWrap);
        }

        navWrap.appendChild(groupWrap);
      }

      /* ── Mobile select ── */
      if (mobileSelect) {
        const opt2 = document.createElement("option");
        opt2.value       = h2.id;
        const l2         = h2.textContent.trim();
        opt2.textContent = l2.length > MAX_OPT_CHARS ? l2.slice(0, MAX_OPT_CHARS - 1) + "…" : l2;
        mobileSelect.appendChild(opt2);

        children.forEach((h3) => {
          const opt3 = document.createElement("option");
          opt3.value       = h3.id;
          const l3         = h3.textContent.trim();
          const t          = l3.length > MAX_OPT_CHARS - 2 ? l3.slice(0, MAX_OPT_CHARS - 3) + "…" : l3;
          opt3.textContent = "— " + t;
          mobileSelect.appendChild(opt3);
        });
      }
    });

    // Arrow toggle — event delegation
    if (navWrap) {
      navWrap.addEventListener("click", (e) => {
        const btn = e.target.closest(".toc-arrow-btn");
        if (!btn) return;
        e.stopPropagation();
        toggleGroup(btn.dataset.group, navWrap);
      });
    }
  }

  function toggleGroup(groupId, navWrap, forceOpen) {
    const childWrap = navWrap.querySelector("[data-parent-group='" + groupId + "']");
    const btn       = navWrap.querySelector("[data-group='" + groupId + "']");
    if (!childWrap || !btn) return;

    const isOpen = forceOpen !== undefined ? !forceOpen : btn.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      childWrap.style.maxHeight = "0";
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = arrowSVG(false);
    } else {
      childWrap.style.maxHeight = childWrap.scrollHeight + "px";
      btn.setAttribute("aria-expanded", "true");
      btn.innerHTML = arrowSVG(true);
    }
  }

  /* ── ARROW SVG ── */
  function arrowSVG(open) {
    return '<svg style="transform:' + (open ? "rotate(180deg)" : "rotate(0deg)") + ';transition:transform 0.25s ease;" width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.995807 0H12.1758C12.3736 0.000829231 12.5667 0.0602841 12.7306 0.170847C12.8946 0.28141 13.0222 0.438116 13.0971 0.621148C13.172 0.804181 13.191 1.00532 13.1516 1.19913C13.1122 1.39295 13.0162 1.57073 12.8758 1.71L7.29581 7.29C7.20284 7.38373 7.09224 7.45812 6.97038 7.50889C6.84853 7.55966 6.71782 7.5858 6.58581 7.5858C6.4538 7.5858 6.32309 7.55966 6.20123 7.50889C6.07937 7.45812 5.96877 7.38373 5.87581 7.29L0.295808 1.71C0.155386 1.57073 0.059415 1.39295 0.0200298 1.19913C-0.0193553 1.00532 -0.000386119 0.804181 0.0745395 0.621148C0.149465 0.438116 0.276982 0.28141 0.440965 0.170847C0.604949 0.0602841 0.798035 0.000829231 0.995807 0Z" fill="currentColor"/></svg>';
  }

  /* ── CUSTOM SELECT ARROW ── */
  function injectSelectArrow(select) {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "position:relative;width:100%;";

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    select.style.appearance       = "none";
    select.style.webkitAppearance = "none";
    select.style.backgroundImage  = "none";
    select.style.paddingRight     = "36px";

    const arrow = document.createElement("span");
    arrow.innerHTML = arrowSVG(false);
    arrow.style.cssText = [
      "position:absolute",
      "right:16px",
      "top:50%",
      "transform:translateY(-50%)",
      "transition:transform 0.25s ease",
      "pointer-events:none",
      "display:flex",
      "align-items:center",
      "color:#696B69",
    ].join(";");

    wrapper.appendChild(arrow);

    let isOpen = false;
    function setArrow(open) {
      isOpen = open;
      arrow.style.transform = open
        ? "translateY(-50%) rotate(180deg)"
        : "translateY(-50%) rotate(0deg)";
    }

    select.addEventListener("click",  () => setArrow(!isOpen));
    select.addEventListener("blur",   () => setArrow(false));
    select.addEventListener("change", () => setArrow(false));
  }

  /* ── PROGRESS BAR ── */
  function initProgressBar(contentWrap, progressBar) {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.to(progressBar, {
      width: "100%", ease: "none",
      scrollTrigger: { trigger: contentWrap, start: "top top", end: "bottom 40%", scrub: true },
    });
  }

/* ── SCROLLSPY ──
     scroll position based, not IntersectionObserver: the active heading is
     simply the last one whose top has passed the activation line. this always
     agrees with where scrollToSection actually parks the heading. */
  function initScrollSpy(headings, navWrap, mobileSelect) {
    let ticking = false;

    function update() {
      ticking = false;
      if (spyLocked) return;   // programmatic scroll cholakalin off

      let currentId = headings[0].id;

      for (let i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top <= ACTIVATION_LINE) {
          currentId = headings[i].id;
        } else {
          break;
        }
      }

      // page-er ekdom nichey pouchale shesh heading active thakbe
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        currentId = headings[headings.length - 1].id;
      }

      setActive(currentId, navWrap, mobileSelect);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* click korar por scroll animation cholakalin spy off rakhe, jate
     majhkhaner heading gulo temporarily active hoye na jay */
  function lockSpy(duration) {
    spyLocked = true;
    clearTimeout(spyLockTimer);
    spyLockTimer = setTimeout(() => { spyLocked = false; }, duration);
  }

function setActive(id, navWrap, mobileSelect) {
    if (id === lastActiveId) return;   // ← added: redundant kaj bondho
    lastActiveId = id;

    if (navWrap) {
      navWrap.querySelectorAll(".toc-link").forEach((link) => {
        link.classList.toggle(ACTIVE_CLASS, link.dataset.tocId === id);
      });

      // auto-open parent group when an h3 becomes active
      const activeLink = navWrap.querySelector(".toc-link[data-toc-id='" + id + "']");
      if (activeLink && activeLink.dataset.level === "3") {
        const childWrap = activeLink.closest("[data-parent-group]");
        if (childWrap) {
          const groupId = childWrap.dataset.parentGroup;
          const btn = navWrap.querySelector("[data-group='" + groupId + "']");
          if (btn && btn.getAttribute("aria-expanded") !== "true") {
            toggleGroup(groupId, navWrap, false);
          }
        }
      }
    }
    if (mobileSelect) mobileSelect.value = id;
  }

  /* ── SCROLL TO ── */
  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;
    if (typeof lenis !== "undefined" && lenis) {
      lenis.scrollTo(target, { offset: OFFSET, duration: SCROLL_DURATION, easing: (t) => 1 - Math.pow(1 - t, 3) });
    } else {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + OFFSET, behavior: "smooth" });
    }
  }

  /* ── CLICK + CHANGE ── */
  function bindNavClicks(navWrap) {
    navWrap.addEventListener("click", (e) => {
      const link = e.target.closest(".toc-link");
      if (!link) return;
      e.preventDefault();

      if (link.dataset.level === "2") {
        const groupId   = link.dataset.tocId;
        const childWrap = navWrap.querySelector("[data-parent-group='" + groupId + "']");
        if (childWrap) {
          toggleGroup(groupId, navWrap);
          return;
        }
      }

      scrollToSection(link.dataset.tocId);
    });
  }

  function bindSelectChange(mobileSelect) {
    mobileSelect.addEventListener("change", () => scrollToSection(mobileSelect.value));
  }

  /* ── BOOT ── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();








// ================= FEATURED WORKS: TAB FILTER =================
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.fw-tab');
    const cards = document.querySelectorAll('.fw-card');
    if (!tabs.length || !cards.length) return;
 
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            const filter = tab.dataset.filter;
            cards.forEach((card) => {
                const matches = filter === 'all' || card.dataset.category === filter;
                card.classList.toggle('hidden', !matches);
            });
        });
    });
});
 
// ================= FEATURED WORKS: TABS DRAG-SCROLL + PREV/NEXT ARROWS =================
document.addEventListener('DOMContentLoaded', () => {
    const scroller = document.getElementById('fwTabsScroller');
    const prevBtn = document.getElementById('fwTabsPrev');
    const nextBtn = document.getElementById('fwTabsNext');
    if (!scroller || !prevBtn || !nextBtn) return;
 
    const SCROLL_STEP = 260;
    const EPS = 4; // tolerance for float rounding
 
    function updateArrows() {
        const maxScroll = scroller.scrollWidth - scroller.clientWidth;
        const atStart = scroller.scrollLeft <= EPS;
        const atEnd = scroller.scrollLeft >= maxScroll - EPS;
 
        prevBtn.classList.toggle('hidden', atStart);
        prevBtn.classList.toggle('flex', !atStart);
 
        nextBtn.classList.toggle('hidden', atEnd || maxScroll <= 0);
        nextBtn.classList.toggle('flex', !atEnd && maxScroll > 0);
    }
 
    prevBtn.addEventListener('click', () => {
        scroller.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
        scroller.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
    });
 
    let ticking = false;
    scroller.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateArrows();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
 
    window.addEventListener('resize', updateArrows);
 
    // ---- drag-to-scroll (desktop mouse; touch scrolls natively) ----
    let isDown = false;
    let startX = 0;
    let scrollLeftStart = 0;
 
    scroller.addEventListener('mousedown', (e) => {
        isDown = true;
        scroller.classList.add('is-dragging');
        startX = e.pageX - scroller.offsetLeft;
        scrollLeftStart = scroller.scrollLeft;
    });
    ['mouseleave', 'mouseup'].forEach((evt) => {
        scroller.addEventListener(evt, () => {
            isDown = false;
            scroller.classList.remove('is-dragging');
        });
    });
    scroller.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scroller.offsetLeft;
        const walk = x - startX;
        scroller.scrollLeft = scrollLeftStart - walk;
    });
 
    updateArrows();
});



//work page card stack animation





// ================= FAQ: CATEGORY FILTER (desktop sidebar + tablet tabs + mobile select) =================
document.addEventListener('DOMContentLoaded', () => {
    const faqList = document.getElementById('faqList');
    if (!faqList) return;
 
    const items = Array.from(faqList.querySelectorAll('.faq-item'));
    const allTabButtons = document.querySelectorAll('.faq-tab-btn');
    const mobileSelect = document.getElementById('faqMobileSelect');
 
    function applyFilter(filter) {
        items.forEach((item) => {
            const matches = filter === 'all' || item.dataset.category === filter;
            item.classList.toggle('hidden', !matches);
        });
 
        // keep every tab-button UI (sidebar + tablet row) and the mobile select in sync
        allTabButtons.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        if (mobileSelect && mobileSelect.value !== filter) {
            mobileSelect.value = filter;
        }
    }
 
    allTabButtons.forEach((btn) => {
        btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
    });
 
    if (mobileSelect) {
        mobileSelect.addEventListener('change', () => applyFilter(mobileSelect.value));
    }
 
    applyFilter('all');
});
 
// ================= FAQ TABS (tablet): drag-to-scroll =================
document.addEventListener('DOMContentLoaded', () => {
    const scroller = document.getElementById('faqTabsScroller');
    if (!scroller) return;
 
    let isDown = false;
    let startX = 0;
    let scrollLeftStart = 0;
 
    scroller.addEventListener('mousedown', (e) => {
        isDown = true;
        scroller.classList.add('is-dragging');
        startX = e.pageX - scroller.offsetLeft;
        scrollLeftStart = scroller.scrollLeft;
    });
    ['mouseleave', 'mouseup'].forEach((evt) => {
        scroller.addEventListener(evt, () => {
            isDown = false;
            scroller.classList.remove('is-dragging');
        });
    });
    scroller.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scroller.offsetLeft;
        const walk = x - startX;
        scroller.scrollLeft = scrollLeftStart - walk;
    });
});




// ================= FAQ: MOBILE CUSTOM DROPDOWN =================
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('faqMobileDropdown');
    if (!dropdown) return;

    const btn = document.getElementById('faqMobileDropdownBtn');
    const panel = document.getElementById('faqMobileDropdownPanel');
    const iconEl = document.getElementById('faqMobileDropdownIcon');
    const labelEl = document.getElementById('faqMobileDropdownLabel');
    const chevron = document.getElementById('faqMobileDropdownChevron');
    const options = dropdown.querySelectorAll('.faq-mobile-option');

    function openPanel() {
        panel.classList.remove('hidden');
        chevron.style.transform = 'rotate(180deg)';
    }
    function closePanel() {
        panel.classList.add('hidden');
        chevron.style.transform = 'rotate(0deg)';
    }

    btn.addEventListener('click', () => {
        panel.classList.contains('hidden') ? openPanel() : closePanel();
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) closePanel();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePanel();
    });

    options.forEach((opt) => {
        opt.addEventListener('click', () => {
            iconEl.src = opt.dataset.icon;
            labelEl.textContent = opt.dataset.label;
            options.forEach((o) => o.classList.remove('active'));
            opt.classList.add('active');
            closePanel();
            // hook into the shared filter function from the main FAQ script
            if (typeof applyFilter === 'function') applyFilter(opt.dataset.filter);
        });
    });
});





//cookies part js
document.addEventListener('DOMContentLoaded', () => {
    const CONSENT_KEY = 'pixxen_cookie_consent';
    const banner = document.getElementById('cookieConsent');
    if (!banner) return;

    // show only if no choice has been stored yet
    if (!localStorage.getItem(CONSENT_KEY)) {
        banner.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // lock scroll while the mobile modal / bar first appears
    }

    function hideBanner() {
        banner.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function setConsent(value) {
        localStorage.setItem(CONSENT_KEY, value);
        hideBanner();
    }

    document.getElementById('cookieAcceptDesktop')?.addEventListener('click', () => setConsent('accepted'));
    document.getElementById('cookieDeclineDesktop')?.addEventListener('click', () => setConsent('declined'));
    document.getElementById('cookieAcceptMobile')?.addEventListener('click', () => setConsent('accepted'));
    document.getElementById('cookieDeclineMobile')?.addEventListener('click', () => setConsent('declined'));

    // the mobile ✕ just dismisses this visit — no choice is stored, so it will ask again next visit
    document.getElementById('cookieCloseMobile')?.addEventListener('click', hideBanner);
});





//free audit contact form popup

document.addEventListener('DOMContentLoaded', () => {
    const openBtns = document.querySelectorAll('.js-open-audit-modal');
    const auditModal = document.getElementById('freeAuditModal');
    const closeAuditBtn = document.getElementById('closeAuditModalBtn');
    const auditForm = document.getElementById('freeAuditForm');
 
    const thankYouModal = document.getElementById('thankYouModal');
    const closeThankYouBtn = document.getElementById('closeThankYouModalBtn');
 
    function openModal(modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
    function closeModal(modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }
 
    openBtns.forEach((btn) => btn.addEventListener('click', () => openModal(auditModal)));
    closeAuditBtn?.addEventListener('click', () => closeModal(auditModal));
    closeThankYouBtn?.addEventListener('click', () => closeModal(thankYouModal));
 
    // click on the dark backdrop closes the modal
    [auditModal, thankYouModal].forEach((modal) => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });
 
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (!auditModal.classList.contains('hidden')) closeModal(auditModal);
        if (!thankYouModal.classList.contains('hidden')) closeModal(thankYouModal);
    });
 
    // submit -> swap audit form modal for the thank-you modal
    auditForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        closeModal(auditModal);
        openModal(thankYouModal);
        auditForm.reset();
    });
});


//for carrer counter 

document.addEventListener('DOMContentLoaded', () => {
        const counters = document.querySelectorAll('.career-counter, #career-counter');

        function formatNum(n, format) {
          return format === 'comma' ? n.toLocaleString() : n;
        }

        function animateCounter(el) {
          const target = parseInt(el.dataset.target, 10);
          if (isNaN(target)) return;

          const suffix = el.dataset.suffix || '';
          const prefix = el.dataset.prefix || '';
          const format = el.dataset.format || '';
          const duration = 1800; // Total time in ms
          let startTime = null;

          function step(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            // Easing function (easeOutExpo for smooth slowing down at the end)
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentVal = Math.round(easeProgress * target);

            el.textContent = prefix + formatNum(currentVal, format) + suffix;

            if (progress < 1) {
              requestAnimationFrame(step);
            }
          }

          requestAnimationFrame(step);
        }

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            if (el.dataset.animated === 'true') return;

            el.dataset.animated = 'true';
            animateCounter(el);
            observer.unobserve(el);
          });
        }, {
          threshold: 0.3
        });

        counters.forEach(counter => observer.observe(counter));
      });






      // timeline about page

      

document.addEventListener("DOMContentLoaded", function () {
  const track = document.getElementById("timelineTrack");
  if (!track) return;

  const line = track.querySelector(".timeline-line");
  const fill = document.getElementById("timelineFill");
  const badges = Array.prototype.slice.call(track.querySelectorAll(".timeline-badge"));
  const cards = Array.prototype.slice.call(track.querySelectorAll(".timeline-card"));

  // ---------------------------------------------------------------
  // LINE POSITIONING — plain DOM/CSS, does NOT depend on GSAP.
  // Runs regardless of whether the GSAP CDN loaded, so the line is
  // never invisible just because a script tag failed to fetch.
  // Positions it so it starts at the CENTER of the first badge and
  // ends at the CENTER of the last badge (no overhang), horizontally
  // on desktop and vertically on mobile.
  // ---------------------------------------------------------------
  function positionLine(refreshTrigger) {
    if (!line || badges.length < 2) return;

    const isDesktop = window.matchMedia("(min-width: 901px)").matches;
    const trackRect = track.getBoundingClientRect();
    const firstRect = badges[0].getBoundingClientRect();
    const lastRect = badges[badges.length - 1].getBoundingClientRect();

    if (isDesktop) {
      const startX = firstRect.left + firstRect.width / 2 - trackRect.left;
      const endX = lastRect.left + lastRect.width / 2 - trackRect.left;
      const centerY = firstRect.top + firstRect.height / 2 - trackRect.top;

      line.style.top = centerY + "px";
      line.style.left = startX + "px";
      line.style.width = Math.max(endX - startX, 0) + "px";
      line.style.right = "auto";
      line.style.bottom = "auto";
      line.style.height = "2px";
    } else {
      const startY = firstRect.top + firstRect.height / 2 - trackRect.top;
      const endY = lastRect.top + lastRect.height / 2 - trackRect.top;
      const centerX = firstRect.left + firstRect.width / 2 - trackRect.left;

      line.style.left = centerX + "px";
      line.style.top = startY + "px";
      line.style.height = Math.max(endY - startY, 0) + "px";
      line.style.right = "auto";
      line.style.bottom = "auto";
      line.style.width = "2px";
    }

    // Only recalculate ScrollTrigger's own trigger positions when
    // explicitly asked (after a real layout change) — doing this on
    // every scroll frame would be wasteful and can fight the scrub.
    if (refreshTrigger && window.ScrollTrigger) ScrollTrigger.refresh();
  }

  // ---------------------------------------------------------------
  // CARD HEIGHT MATCHING — plain JS, does NOT rely on flexbox stretch.
  // On desktop, every card is forced to the height of the TALLEST
  // card (whichever item has the most text). This is done directly
  // in JS instead of trusting CSS align-items:stretch, because that
  // can silently break if any other CSS on the page (theme resets,
  // Bootstrap-style grid classes, etc.) touches flex/height on these
  // elements. On mobile the inline height is cleared — each row there
  // pairs its own badge + card and doesn't need cross-item matching.
  // ---------------------------------------------------------------
  function matchCardHeights() {
    if (!cards.length) return;
    const isDesktop = window.matchMedia("(min-width: 901px)").matches;

    // reset first so we measure NATURAL (content) height, not a
    // previously-forced one
    cards.forEach(function (card) {
      card.style.minHeight = "";
    });

    if (!isDesktop) return; // mobile: natural per-row height is correct

    let max = 0;
    cards.forEach(function (card) {
      max = Math.max(max, card.getBoundingClientRect().height);
    });
    cards.forEach(function (card) {
      card.style.minHeight = max + "px";
    });
  }

  positionLine(true);
  matchCardHeights();

  // Belt-and-suspenders: a few delayed re-checks right after load, to
  // catch any late reflow (e.g. the Tailwind Play CDN script — loaded
  // from cdn.tailwindcss.com — finishes generating utility styles a
  // moment after DOMContentLoaded, which can shift badge height).
  window.addEventListener("load", function () {
    positionLine(true);
    matchCardHeights();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        positionLine(true);
        matchCardHeights();
      });
    });
    setTimeout(function () {
      positionLine(true);
      matchCardHeights();
    }, 300);
    setTimeout(function () {
      positionLine(true);
      matchCardHeights();
    }, 800);
  });

  // The real fix: watch the badges themselves. Any time a badge's
  // rendered box changes size for ANY reason (late Tailwind styling,
  // a web font swapping in, a resize), this fires and we re-measure —
  // so the line is always locked to the badge's true center instead
  // of a snapshot taken before styles finished applying.
  if (window.ResizeObserver) {
    let roTimer;
    const ro = new ResizeObserver(function () {
      clearTimeout(roTimer);
      roTimer = setTimeout(function () {
        positionLine(true);
      }, 30);
    });
    badges.forEach(function (badge) {
      ro.observe(badge);
    });
    ro.observe(track);
  }

  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      positionLine(true);
      matchCardHeights();
    }, 150);
  });

  // Extra safety net: re-check on scroll too (rAF-throttled, and does
  // NOT force a ScrollTrigger.refresh — just keeps the line's own
  // top/left/width in sync). Nothing in the current animations should
  // shift the badge centers mid-scroll anymore, but this keeps the
  // line self-healing if anything else on the page ever does.
  let scrollTicking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(function () {
        positionLine(false);
        scrollTicking = false;
      });
    },
    { passive: true }
  );

  // ---------------------------------------------------------------
  // GSAP ANIMATIONS — layered on top, only if GSAP actually loaded.
  // If the CDN is blocked/offline this block just quietly skips and
  // the line/badges/cards still show (without the scroll animation).
  // ---------------------------------------------------------------
  if (typeof gsap === "undefined") {
    console.warn("GSAP did not load — timeline is showing without scroll animation.");
    return;
  }
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  let mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: "(min-width: 901px)",
      isMobile: "(max-width: 900px)",
    },
    (context) => {
      const { isDesktop } = context.conditions;

      gsap.set(fill, { clearProps: "transform" });
      positionLine(true);
      matchCardHeights();

      const lineTween = gsap.fromTo(
        fill,
        isDesktop ? { scaleX: 0 } : { scaleY: 0 },
        {
          scaleX: isDesktop ? 1 : undefined,
          scaleY: isDesktop ? undefined : 1,
          ease: "none",
          scrollTrigger: {
            trigger: track,
            // Desktop: one horizontal row — a fixed viewport-% window
            // is fine and completes quickly (before top reaches 70%).
            // Mobile: the stacked column can be MANY screen-heights
            // tall, so tying "end" to a fixed top-% finishes the fill
            // after barely any scrolling — the rest of the (long)
            // scroll then just shows solid yellow with no visible
            // change. Tying it to the track's own BOTTOM instead makes
            // it scale with however tall the stack actually is.
            start: isDesktop ? "top 80%" : "top 85%",
            end: isDesktop ? "top 50%" : "bottom 60%",
            scrub: 0.6,
          },
        }
      );

      // badges pop in with opacity + scale only (NO x/y translate).
      // Scale is centered by default, so the badge's rendered CENTER
      // point never shifts during the animation — this is what keeps
      // the line's measured position correct at every moment, instead
      // of drifting/jumping when measured mid-animation.
      const badgeTween = gsap.from(badges, {
        opacity: 0,
        scale: 0.4,
        duration: 0.5,
        ease: "back.out(2)",
        stagger: 0.15,
        scrollTrigger: {
          trigger: track,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

      // cards fade + rise in right after their badge
      const cardTween = gsap.from(cards, {
        opacity: 0,
        y: 40,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.15,
        delay: 0.1,
        scrollTrigger: {
          trigger: track,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

      return () => {
        lineTween.kill();
        badgeTween.kill();
        cardTween.kill();
      };
    }
  );
});




//vision mission section
