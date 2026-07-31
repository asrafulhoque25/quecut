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
            rotation: -200,
            rotationY: -20,
            scale: 0.85,
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
// faq section start

function initFAQ(section) {
  const faqItems = section.querySelectorAll('.faq-item');
  if (faqItems.length === 0) return;

  faqItems.forEach(item => {
    const trigger   = item.querySelector('.faq-trigger');
    const content   = item.querySelector('.faq-content');
    const border    = item.querySelector('.faq-border');
    const iconClose = item.querySelector('.icon-close');
    if (!trigger) return;

    if (iconClose) {
      // matches the 0.6s / cubic-bezier(0.65, 0, 0.35, 1) transition on .faq-content
      // so the arrow rotation and the panel opening finish in sync
      iconClose.style.transition = 'transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)';
    }

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close any other open item in this same FAQ list
      const siblingItems = section.querySelectorAll('.faq-item');

      siblingItems.forEach(other => {
        if (other !== item && other.classList.contains('active')) {
          other.classList.remove('active');
          const oc = other.querySelector('.faq-content');
          const ob = other.querySelector('.faq-border');
          const oC = other.querySelector('.icon-close');
          if (oc) oc.style.maxHeight = '0';
          if (ob) ob.classList.add('hidden');
          if (oC) oC.style.transform = 'rotate(0deg)';
        }
      });

      if (isOpen) {
        item.classList.remove('active');
        if (content)   content.style.maxHeight = '0';
        if (border)    border.classList.add('hidden');
        if (iconClose) iconClose.style.transform = 'rotate(0deg)';
      } else {
        item.classList.add('active');
        if (content)   content.style.maxHeight = content.scrollHeight + 'px';
        if (border)    border.classList.remove('hidden');
        if (iconClose) iconClose.style.transform = 'rotate(180deg)'; // arrow flips upside-down when open
      }
    });
  });
}

// Quecut FAQ
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.quecut-faq').forEach(section => {
    initFAQ(section);
  });
});

//blog  section


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