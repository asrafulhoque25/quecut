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










// ================= BANNER SLIDERS (Splide + AutoScroll, responsive direction) =================
// ================= BANNER SLIDERS (Splide + AutoScroll, responsive direction) =================
document.addEventListener('DOMContentLoaded', () => {
    let currentMode = null;
    let sliderInstances = [];

    function destroySliders() {
        sliderInstances.forEach((instance) => instance.destroy());
        sliderInstances = [];
    }

    // how many images should be visible at once per column (2.5 = one and a half peeking)
    //
    // IMPORTANT: Splide does parseFloat() on fixedHeight internally for its clone-count
    // math. parseFloat('calc(...)') returns NaN, which was causing Splide to generate
    // thousands of clone <li> elements (the hang / black-shadow rendering glitch you saw).
    // fixedHeight must be a real NUMBER (px) or a simple percentage string, never calc().
    const DESKTOP_GAP = 16;
    const DESKTOP_VISIBLE_COUNT = 2.5;
    const DESKTOP_COL_PADDING = 48; // .banner-slider-desktop has p-6 (24px top + 24px bottom)

    function computeDesktopSlideHeight() {
        return (window.innerHeight - DESKTOP_COL_PADDING - DESKTOP_GAP * (DESKTOP_VISIBLE_COUNT - 1)) / DESKTOP_VISIBLE_COUNT;
    }

    function initDesktopColumns() {
        const slideHeight = computeDesktopSlideHeight(); // a plain number, e.g. 296.8

        document.querySelectorAll('.banner-slide-col').forEach((el) => {
            const dir = el.dataset.direction; // 'up' or 'down'
            const slideCount = el.querySelectorAll('.splide__slide').length;

            // NOTE: speed sign controls direction.
            // negative = images travel upward, positive = images travel downward.
            // Flip the sign below if the direction looks reversed for your design.
            const speed = dir === 'down' ? 0.5 : -0.5;

            const splide = new Splide(el, {
                type: 'loop',
                direction: 'ttb',
                height: '100%',       // required by Splide's internal validation for direction:'ttb'
                fixedHeight: slideHeight, // real number, not a calc() string
                perPage: 1,
                gap: DESKTOP_GAP,
                arrows: false,
                pagination: false,
                drag: true,
                clones: slideCount * 3, // enough duplicated slides so continuous autoScroll never runs out at the loop seam
                autoScroll: {
                    speed: speed,
                    pauseOnHover: true,
                    pauseOnFocus: false,
                },
            });

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
                autoWidth: false,
                gap: 12,
                arrows: false,
                pagination: false,
                drag: true,
                clones: slideCount * 3, // enough duplicated slides so continuous autoScroll never runs out at the loop seam
                autoScroll: {
                    speed: 0.5,
                    pauseOnHover: true,
                    pauseOnFocus: false,
                },
            });

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
        drag: true,
        clones: slideCount * 2, // enough duplicated slides so the continuous marquee never shows a gap at the loop seam
        breakpoints: {
            1024: { perPage: 3 }, // tablet
            640: { perPage: 2 },  // mobile: 2 cards per view
        },
        autoScroll: {
            speed: 0.5,
            pauseOnHover: true,
            pauseOnFocus: false,
        },
    });
 
    achievementsSplide.mount({ AutoScroll: window.splide.Extensions.AutoScroll });
});
 
 





// ================= HOW IT WORKS: COUNTER REVEAL ANIMATION =================
document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('.how-it-works-section');
    const counters = document.querySelectorAll('.how-card-counter');       // number wrapper (position)
    const counterBgs = document.querySelectorAll('.how-card-counter-bg'); // circle background (appears)
    if (!section || !counters.length) return;
 
    // start state: number sitting 45px lower (fully visible), background circle hidden
    gsap.set(counters, { y: 45 });
    gsap.set(counterBgs, { opacity: 0, scale: 0.6 });
 
    const tl = gsap.timeline({ paused: true });
 
    tl.to(counters, {
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.22,
    }, 0)
    .to(counterBgs, {
        opacity: 1,
        scale: 1,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.22,
    }, 0); // same start time (0) as the rise -> bg appears together with the movement
 
    ScrollTrigger.create({
        trigger: section,
        start: 'top 60%',   // triggers when section top reaches 60% down the viewport (= 40% up from the bottom)
        onEnter: () => tl.play(),
        onLeaveBack: () => tl.reverse(), // resets when scrolling back above the trigger, so it can replay
    });
});
 





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