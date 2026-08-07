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
        clones: slideCount * 4,  
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
// Scoped to '.portfolio-tabs' / '.portfolio-card' only, no generic selectors.
document.addEventListener('DOMContentLoaded', () => {
    const tabsWrapper = document.querySelector('.portfolio-tabs-wrapper');
    const tabs = document.querySelectorAll('.portfolio-tab');
    const cards = document.querySelectorAll('.portfolio-card');
    if (!tabs.length || !cards.length) return;

    // ---- filtering ----
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.dataset.filter;

            cards.forEach((card) => {
                const matches = filter === 'all' || card.dataset.category === filter;
                card.classList.toggle('is-hidden', !matches);
            });
        });
    });

    // ---- drag-to-scroll for the tab bar (mouse on desktop; touch works natively) ----
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






// ================= TESTIMONIALS: SPLIDE MARQUEE (continuous, auto-scroll, draggable) =================
// Scoped to '.testimonial-slider' only, no generic selectors.
document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('.testimonial-slider');
    if (!el) return;

    const slideCount = el.querySelectorAll('.splide__slide').length;

    const splide = new Splide(el, {
        type: 'loop',
        direction: 'ltr',
        perPage: 'auto',
        gap: 24,
        arrows: false,
        pagination: false,
        drag: 'free',           // <-- fix: smooth free-drag, both directions
        autoWidth: true,        // <-- fix: accurate width detection for clone calculation
        clones: slideCount * 6, // <-- fix: enough buffer for both left-to-right & right-to-left drag
        autoScroll: {
            speed: 0.6,
            pauseOnHover: true,
            pauseOnFocus: false,
        },
        breakpoints: {
            640: {
                gap: 12,
            },
        },
    });

    splide.on('mounted', () => {
        const autoScroll = splide.Components.AutoScroll;
        splide.on('drag', () => autoScroll.pause());
        splide.on('dragged', () => autoScroll.play());
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




//industry page radiul



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

  /* ── SCROLLSPY ── */
  function initScrollSpy(headings, navWrap, mobileSelect) {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id, navWrap, mobileSelect);
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    headings.forEach((h) => observer.observe(h));
  }

  function setActive(id, navWrap, mobileSelect) {
    if (navWrap) {
      navWrap.querySelectorAll(".toc-link").forEach((link) => {
        link.classList.toggle(ACTIVE_CLASS, link.dataset.tocId === id);
      });

      // auto-open parent group when an h3 scrolls into view
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