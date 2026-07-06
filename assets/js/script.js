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
        drag: 'free',            // <-- fix: smooth free-drag, both directions
        clones: slideCount * 4,  // <-- fix: enough buffer for both left-to-right & right-to-left drag
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

    achievementsSplide.on('mounted', () => {
        const autoScroll = achievementsSplide.Components.AutoScroll;
        achievementsSplide.on('drag', () => autoScroll.pause());
        achievementsSplide.on('dragged', () => autoScroll.play());
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





// ================= WHY CHOOSE: LEFT SHAPE SCROLL ROTATION =================
// Scoped to '.choose-section-shape' only, no generic selectors.
document.addEventListener('DOMContentLoaded', () => {
    const shapes = document.querySelectorAll('.choose-section-shape');
    if (!shapes.length) return;
 
    shapes.forEach((shape) => {
        const section = shape.closest('section');
 
        // starting state: rotated -200deg, anchored at the bottom (transform-origin already
        // set to bottom via the 'origin-bottom' class in HTML), plus a subtle 3D tilt + scale
        // so it doesn't feel like a flat 2D spin.
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
 
 

// ================= WHY CHOOSE: BACKGROUND "LIGHT ON" REVEAL =================
// Scoped to '.why-choose-bg' only, no generic selectors.
document.addEventListener('DOMContentLoaded', () => {
    const bg = document.querySelector('.why-choose-bg');
    if (!bg) return;

    const section = bg.closest('section') || bg.closest('.why-choose-us');

    gsap.to(bg, {
        opacity: 1,
        filter: 'brightness(1)',
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: section || bg,
            start: 'top 70%', // section top reaches 70% down the viewport = 30% up from the bottom
            toggleActions: 'play none none reverse', // dims back out if you scroll back above the trigger
        },
    });
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
    });

    splide.on('mounted', () => {
        const autoScroll = splide.Components.AutoScroll;
        splide.on('drag', () => autoScroll.pause());
        splide.on('dragged', () => autoScroll.play());
    });

    splide.mount({ AutoScroll: window.splide.Extensions.AutoScroll });
});


// ================= TESTIMONIALS: STAT COUNTERS =================
// Scoped to '.testimonial-stats' / '.stat-counter' only, no generic selectors.
document.addEventListener('DOMContentLoaded', () => {
    const statsSection = document.querySelector('.testimonial-stats');
    const counters = document.querySelectorAll('.stat-counter');
    if (!statsSection || !counters.length) return;

    ScrollTrigger.create({
        trigger: statsSection,
        start: 'top 70%', // "bottom theke 30% upore ashle" = section top reaches 70% down the viewport
        once: true,
        onEnter: () => {
            counters.forEach((el) => {
                const target = parseFloat(el.dataset.target);
                const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
                const suffix = el.dataset.suffix || '';
                const counterObj = { val: 0 };

                gsap.to(counterObj, {
                    val: target,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: () => {
                        el.textContent = counterObj.val.toFixed(decimals) + suffix;
                    },
                });
            });
        },
    });
});




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
      iconClose.style.transition = 'transform 0.5s ease-in-out';
    }

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // IMPORTANT: only close other items within the SAME column (item.parentElement),
      // not every '.faq-item' in the whole section -- otherwise opening a card in the
      // left column would also close whatever is open in the right column.
      const columnItems = item.parentElement.querySelectorAll('.faq-item');

      columnItems.forEach(other => {
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
        if (iconClose) iconClose.style.transform = 'rotate(180deg)'; // chevron flips upside-down when open
      }
    });
  });
}

function initFAQGrid(section) {
  const wrap = section.querySelector('#faqGridWrap');
  if (!wrap) return;

  const items = Array.from(wrap.querySelectorAll('.faq-item'));
  if (items.length === 0) return;

  const leftCol  = document.createElement('div');
  const rightCol = document.createElement('div');
  leftCol.className  = 'flex flex-col gap-0 w-full md:w-1/2';
  rightCol.className = 'flex flex-col gap-0 w-full md:w-1/2';

  items.forEach((item, i) => {
    if (i % 2 === 0) leftCol.appendChild(item);
    else             rightCol.appendChild(item);
  });

  wrap.innerHTML = '';
  wrap.className = 'flex flex-col md:flex-row md:gap-8 items-start';
  wrap.appendChild(leftCol);
  wrap.appendChild(rightCol);
}

// Quecut FAQ
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.quecut-faq').forEach(section => {
    initFAQGrid(section);
    initFAQ(section);
  });
});


// Home Services FAQ
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.home-services-faq').forEach(section => {
    initFAQGrid(section);
    initFAQ(section);
  });
});


// Real Estate Agency FAQ
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.realestate-agency-faq').forEach(section => {
    initFAQGrid(section);
    initFAQ(section);
  });
});






// ================= DESIGN MARKET: SPLIDE SLIDER (draggable, 2.5 cards per view) =================
// ================= DESIGN MARKET: SPLIDE SLIDER (draggable, progress bar) =================
// Scoped to '.design-market-slider' / '.design-market-progress-bar' only, no generic selectors.
document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('.design-market-slider');
    if (!el) return;

    const splide = new Splide(el, {
        type: 'slide',
        drag: true,
        gap: 24,
        perPage: 2,
        padding: { right: '12%' },
        arrows: false,
        pagination: false,
        breakpoints: {
            1024: {
                perPage: 1,
                padding: { right: '18%' },
            },
            640: {
                perPage: 1,
                padding: { right: '10%' },
            },
        },
    });

    const progressBar = document.querySelector('.design-market-progress-bar');
    if (!progressBar) {
        console.warn('Design Market: .design-market-progress-bar element not found in the DOM.');
    }

    function updateProgress() {
        if (!progressBar) return;

        let end;
        try {
            // official Splide approach
            end = splide.Components.Controller.getEnd() + 1;
        } catch (err) {
            // fallback in case Components.Controller isn't accessible for any reason
            const perPage = typeof splide.options.perPage === 'number' ? splide.options.perPage : 1;
            end = Math.max(splide.length - perPage + 1, 1);
        }

        const rate = Math.min((splide.index + 1) / end, 1);
        progressBar.style.width = (100 * rate) + '%';
    }

    splide.on('mounted move', updateProgress);
    splide.mount();

    // safety net: force an update right after mount in case the 'mounted' event
    // fired before this listener was fully wired up
    updateProgress();
});





//blog  section


document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('.blog-slider');
    if (!el) return;

    const slideCount = el.querySelectorAll('.splide__slide').length;

    const splide = new Splide(el, {
        type: 'loop',
        direction: 'ltr',
        perPage: 3,               // <-- desktop: 3 ta item ekbare dekhabe
        gap: 24,
        arrows: false,
        pagination: false,
        drag: 'free',
        clones: slideCount * 4,   // <-- fix: dui dik e (forward + backward) drag korar jonne yothesto buffer
        breakpoints: {
            1024: { perPage: 2 }, // tablet: 2 ta
            640:  { perPage: 2 }, // mobile: 2 ta (tumi cheye chile 1 o korte paro)
        },
        autoScroll: {
            speed: 0.6,
            pauseOnHover: true,
            pauseOnFocus: false,
        },
    });

    splide.on('mounted', () => {
        const autoScroll = splide.Components.AutoScroll;
        splide.on('drag', () => autoScroll.pause());
        splide.on('dragged', () => autoScroll.play());
    });

    splide.mount({ AutoScroll: window.splide.Extensions.AutoScroll });
});





// ================= CTA SECTION: "LIGHTS ON" RADIAL REVEAL (sequential) =================
// Scoped to '.cta-section' / '.cta-radial' only, no generic selectors.
document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('.cta-section');
    if (!section) return;

    const gray   = section.querySelector('.cta-radial-gray');
    const orange = section.querySelector('.cta-radial-orange');
    if (!gray || !orange) return;
    gsap.set(gray, {
        opacity: 0,
        clipPath: 'inset(0 0 100% 0)',
        filter: 'brightness(0.4)',
    });

    gsap.set(orange, {
        opacity: 0,
        filter: 'brightness(0.4)',
    });

    
  const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: 'top 80%',           
            end: 'top 50%',            
            toggleActions: 'restart none none reset', 
        },
    });

   
    tl.to(gray, {
        opacity: 1,
        clipPath: 'inset(0 0 0% 0)',
        filter: 'brightness(1)',
        duration: 0.7,
        ease: 'power2.out',
    });


    tl.to(orange, {
        opacity: 1,
        filter: 'brightness(1)',
        duration: 1.5,
        ease: 'power2.out',
    }, '-=0.4');
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





// footer 

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.quecut-mega-logo');
    if (!container) return;

    const blobs = container.querySelectorAll('.quecut-blob');
    if (!blobs.length) return;

    function setupWaveAnimation() {
        const width = container.offsetWidth;

        // start/end positions -- blobs are off-screen at both extremes so the
        // "wrap-around" moment (right edge -> left edge) is always invisible
        const startX = -400;
        const endX = width + 400;
        const totalDuration = 14; // seconds -- longer = slower, more subtle wave

        blobs.forEach((blob, i) => {
            // kill any existing tweens so resize doesn't stack tweens on top of each other
            gsap.killTweensOf(blob);

            // centering: xPercent/yPercent shift blob by half its own size,
            // so (x, y) refers to the blob's CENTER instead of its top-left
            gsap.set(blob, {
                x: startX,
                y: 0,
                xPercent: -50,
                yPercent: -50,
            });

            // ---- horizontal continuous drift ----
            // each blob moves left -> right in `totalDuration` seconds, then loops back.
            // `progress(...)` offsets each blob's start point so they're evenly distributed
            // in the animation cycle from the start -- no bunching, no visible gaps.
            const hTween = gsap.to(blob, {
                x: endX,
                duration: totalDuration,
                ease: 'none',
                repeat: -1,
            });
            hTween.progress(i / blobs.length);

            // ---- subtle vertical float -- adds "wave" feel to the horizontal drift ----
            const vTween = gsap.to(blob, {
                y: i % 2 === 0 ? -80 : 80,
                duration: 3.5 + i * 0.4,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            });
            vTween.progress(i * 0.25);
        });
    }

    setupWaveAnimation();

    // re-setup on resize so blob travel distance always matches new container width
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setupWaveAnimation, 250);
    });
});