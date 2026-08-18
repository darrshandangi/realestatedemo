/* ═══════════════════════════════════════════════════════════════
   ATELIER NOIR INTERIORS — Main JavaScript
   GSAP Animations · Sparkle Cursor · Scroll Frame Sequence
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    /* ═══════════════════════════════════════
       1. SPARKLE MOUSE CURSOR
       ═══════════════════════════════════════ */
    const sparkleCanvas = document.getElementById('sparkle-canvas');
    const sparkleCtx = sparkleCanvas.getContext('2d');
    let sparkles = [];
    let mouseX = -100, mouseY = -100;
    let isMouseOnPage = false;

    function resizeSparkleCanvas() {
        sparkleCanvas.width = window.innerWidth;
        sparkleCanvas.height = window.innerHeight;
    }
    resizeSparkleCanvas();
    window.addEventListener('resize', resizeSparkleCanvas);

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseOnPage = true;
        // Spawn sparkles on move
        for (let i = 0; i < 2; i++) {
            sparkles.push(createSparkle(mouseX, mouseY));
        }
    });

    document.addEventListener('mouseleave', () => { isMouseOnPage = false; });

    function createSparkle(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        const size = Math.random() * 3 + 1.5;
        const goldHue = 35 + Math.random() * 15;
        return {
            x: x + (Math.random() - 0.5) * 16,
            y: y + (Math.random() - 0.5) * 16,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.5,
            size,
            life: 1,
            decay: 0.015 + Math.random() * 0.02,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 8,
            color: `hsl(${goldHue}, 70%, ${55 + Math.random() * 20}%)`,
            type: Math.random() > 0.5 ? 'star' : 'circle',
        };
    }

    function drawStar(ctx, x, y, size, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
        }
        ctx.stroke();
        ctx.restore();
    }

    function updateSparkles() {
        sparkleCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);

        sparkles = sparkles.filter(s => s.life > 0);

        for (const s of sparkles) {
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.02; // gravity
            s.life -= s.decay;
            s.rotation += s.rotationSpeed;
            s.size *= 0.99;

            sparkleCtx.globalAlpha = s.life;

            if (s.type === 'star') {
                sparkleCtx.strokeStyle = s.color;
                sparkleCtx.lineWidth = 0.8;
                drawStar(sparkleCtx, s.x, s.y, s.size * 2, s.rotation);
            } else {
                sparkleCtx.fillStyle = s.color;
                sparkleCtx.beginPath();
                sparkleCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                sparkleCtx.fill();
            }

            // Glow
            sparkleCtx.globalAlpha = s.life * 0.3;
            sparkleCtx.fillStyle = s.color;
            sparkleCtx.beginPath();
            sparkleCtx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
            sparkleCtx.fill();
        }

        sparkleCtx.globalAlpha = 1;
        requestAnimationFrame(updateSparkles);
    }
    updateSparkles();

    /* ═══════════════════════════════════════
       2. HERO SCROLL FRAME ANIMATION
       ═══════════════════════════════════════ */
    const FRAME_COUNT = 300;
    const SCROLL_HEIGHT = 10000;
    const heroContainer = document.getElementById('hero-scroll-container');
    const heroImg = document.getElementById('hero-frame-img');
    const heroLoader = document.getElementById('hero-loader');
    const loaderBarFill = document.getElementById('loader-bar-fill');
    const loaderPercent = document.getElementById('loader-percent');
    const scrollIndicator = document.getElementById('hero-scroll-indicator');

    // Set the hero scroll container height
    heroContainer.style.height = SCROLL_HEIGHT + 'px';

    // Preload all frames
    const frameImages = new Array(FRAME_COUNT);
    let loadedCount = 0;
    let framesLoaded = false;
    let currentFrame = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i + 1).padStart(3, '0');
        img.src = `frames/ezgif-frame-${num}.jpg`;
        img.onload = img.onerror = () => {
            loadedCount++;
            const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
            loaderBarFill.style.width = pct + '%';
            loaderPercent.textContent = pct + '%';
            if (loadedCount === FRAME_COUNT) {
                framesLoaded = true;
                heroLoader.classList.add('hidden');
                heroImg.src = frameImages[0].src;
                // Trigger entrance animations after load
                playEntranceAnimation();
            }
        };
        frameImages[i] = img;
    }

    // Scroll-driven frame update
    function updateHeroFrame() {
        if (!framesLoaded || !heroContainer) return;
        const rect = heroContainer.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / scrollable));

        const frameIndex = Math.round(progress * (FRAME_COUNT - 1));
        if (frameIndex !== currentFrame) {
            currentFrame = frameIndex;
            const target = frameImages[frameIndex];
            if (target && target.complete) {
                heroImg.src = target.src;
            }
        }

        // Fade scroll indicator
        if (scrollIndicator) {
            scrollIndicator.style.opacity = Math.max(0, 1 - progress * 8);
        }
    }

    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateHeroFrame);
    }, { passive: true });

    /* ═══════════════════════════════════════
       3. HERO TEXT OVERLAYS (GSAP ScrollTrigger)
       ═══════════════════════════════════════ */
    function setupHeroTextAnimations() {
        const heroText1 = document.getElementById('hero-text-1');

        gsap.timeline({
            scrollTrigger: {
                trigger: heroContainer,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.5,
            }
        })
        // Starts fully visible, fades out early in the scroll
        .fromTo(heroText1,
            { opacity: 1, y: 0 },
            { opacity: 0, y: -30, duration: 0.05, ease: 'power2.in' },
            0.02
        );
    }

    /* ═══════════════════════════════════════
       4. NAVBAR SCROLL STATE
       ═══════════════════════════════════════ */
    const navbar = document.getElementById('navbar');

    ScrollTrigger.create({
        start: 100,
        onUpdate: (self) => {
            if (self.scroll() > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    /* ═══════════════════════════════════════
       5. ENTRANCE ANIMATION (after frames load)
       ═══════════════════════════════════════ */
    function playEntranceAnimation() {
        const tl = gsap.timeline({ delay: 0.3 });

        // Navbar
        tl.fromTo('#nav-logo',
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
            0
        );
        tl.fromTo('#nav-links li',
            { opacity: 0, y: -15 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' },
            0.2
        );

        // Setup hero text animations after entrance
        setupHeroTextAnimations();
    }

    /* ═══════════════════════════════════════
       6. SCROLL-TRIGGERED SECTION REVEALS
       ═══════════════════════════════════════ */
    // Reveal Up
    gsap.utils.toArray('.reveal-up').forEach((el) => {
        gsap.fromTo(el,
            { opacity: 0, y: 60 },
            {
                opacity: 1, y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                }
            }
        );
    });

    // Reveal Left
    gsap.utils.toArray('.reveal-left').forEach((el) => {
        gsap.fromTo(el,
            { opacity: 0, x: -60 },
            {
                opacity: 1, x: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                }
            }
        );
    });

    // Reveal Right
    gsap.utils.toArray('.reveal-right').forEach((el) => {
        gsap.fromTo(el,
            { opacity: 0, x: 60 },
            {
                opacity: 1, x: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                }
            }
        );
    });

    // Reveal Scale
    gsap.utils.toArray('.reveal-scale').forEach((el) => {
        gsap.fromTo(el,
            { opacity: 0, scale: 0.9 },
            {
                opacity: 1, scale: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                }
            }
        );
    });

    /* ═══════════════════════════════════════
       7. STAT COUNTER ANIMATION
       ═══════════════════════════════════════ */
    gsap.utils.toArray('.stat-number').forEach((el) => {
        const target = parseInt(el.getAttribute('data-count'), 10);
        const obj = { val: 0 };

        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(obj, {
                    val: target,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: () => {
                        el.textContent = Math.round(obj.val) + '+';
                    }
                });
            }
        });
    });

    /* ═══════════════════════════════════════
       8. SERVICE CARD HOVER (GSAP)
       ═══════════════════════════════════════ */
    document.querySelectorAll('.service-card').forEach(card => {
        const img = card.querySelector('.service-card-image');
        const number = card.querySelector('.service-card-number');

        card.addEventListener('mouseenter', () => {
            gsap.to(img, { scale: 1.06, duration: 0.6, ease: 'power2.out' });
            gsap.to(number, { color: 'rgba(201,169,110,0.25)', duration: 0.4 });
            gsap.to(card, { y: -6, duration: 0.4, ease: 'power2.out' });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(img, { scale: 1, duration: 0.6, ease: 'power2.out' });
            gsap.to(number, { color: 'rgba(201,169,110,0.12)', duration: 0.4 });
            gsap.to(card, { y: 0, duration: 0.4, ease: 'power2.out' });
        });
    });

    /* ═══════════════════════════════════════
       9. PORTFOLIO HORIZONTAL SCROLL (GSAP)
       ═══════════════════════════════════════ */
    const portfolioTrack = document.getElementById('portfolio-track');
    const portfolioWrapper = document.getElementById('portfolio-scroll-wrapper');

    if (portfolioTrack && portfolioWrapper) {
        // Calculate how far to scroll
        const getScrollDistance = () => portfolioTrack.scrollWidth - portfolioWrapper.offsetWidth;

        gsap.to(portfolioTrack, {
            x: () => -getScrollDistance(),
            ease: 'none',
            scrollTrigger: {
                trigger: portfolioWrapper,
                start: 'top 20%',
                end: () => `+=${getScrollDistance()}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
            }
        });

        // Parallax on individual items
        gsap.utils.toArray('.portfolio-item img').forEach((img) => {
            gsap.fromTo(img,
                { scale: 1.15 },
                {
                    scale: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: img.closest('.portfolio-item'),
                        start: 'left right',
                        end: 'right left',
                        containerAnimation: gsap.getById && gsap.getById('portfolioScroll'), // fallback
                        scrub: 1,
                    }
                }
            );
        });
    }

    /* ═══════════════════════════════════════
       10. TESTIMONIAL CAROUSEL (GSAP)
       ═══════════════════════════════════════ */
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.testimonial-dot');
    let currentSlide = 0;
    let autoPlayTimer;

    function goToSlide(index) {
        const outgoing = slides[currentSlide];
        const incoming = slides[index];

        gsap.to(outgoing, {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: 'power2.in',
            onComplete: () => {
                outgoing.classList.remove('active');
                outgoing.style.transform = '';
                outgoing.style.visibility = 'hidden';
            }
        });

        incoming.style.visibility = 'visible';
        incoming.classList.add('active');
        gsap.fromTo(incoming,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.15 }
        );

        dots.forEach(d => d.classList.remove('active'));
        dots[index].classList.add('active');
        currentSlide = index;
    }

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const idx = parseInt(dot.getAttribute('data-index'), 10);
            if (idx !== currentSlide) {
                goToSlide(idx);
                resetAutoPlay();
            }
        });
    });

    function autoPlay() {
        autoPlayTimer = setInterval(() => {
            const next = (currentSlide + 1) % slides.length;
            goToSlide(next);
        }, 5000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayTimer);
        autoPlay();
    }

    autoPlay();

    /* ═══════════════════════════════════════
       11. CTA SECTION PARALLAX CORNERS
       ═══════════════════════════════════════ */
    const ctaInner = document.querySelector('.cta-inner');
    if (ctaInner) {
        gsap.fromTo(ctaInner,
            { borderColor: 'rgba(201,169,110,0.05)' },
            {
                borderColor: 'rgba(201,169,110,0.3)',
                duration: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: ctaInner,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    scrub: 1,
                }
            }
        );
    }

    /* ═══════════════════════════════════════
       12. FOOTER REVEAL
       ═══════════════════════════════════════ */
    gsap.fromTo('.footer-grid',
        { opacity: 0, y: 40 },
        {
            opacity: 1, y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.footer',
                start: 'top 85%',
                toggleActions: 'play none none none',
            }
        }
    );

    /* ═══════════════════════════════════════
       13. MOBILE NAV TOGGLE
       ═══════════════════════════════════════ */
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    let mobileNavOpen = false;

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            mobileNavOpen = !mobileNavOpen;
            if (mobileNavOpen) {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'rgba(10,10,10,0.95)';
                navLinks.style.backdropFilter = 'blur(20px)';
                navLinks.style.padding = '24px';
                navLinks.style.gap = '20px';
                navLinks.style.borderBottom = '1px solid rgba(201,169,110,0.15)';

                gsap.fromTo(navLinks.children,
                    { opacity: 0, x: -20 },
                    { opacity: 1, x: 0, stagger: 0.05, duration: 0.4, ease: 'power3.out' }
                );
            } else {
                gsap.to(navLinks.children, {
                    opacity: 0,
                    x: -20,
                    stagger: 0.03,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        navLinks.style.display = '';
                        navLinks.style.flexDirection = '';
                        navLinks.style.position = '';
                        navLinks.style.top = '';
                        navLinks.style.left = '';
                        navLinks.style.width = '';
                        navLinks.style.background = '';
                        navLinks.style.backdropFilter = '';
                        navLinks.style.padding = '';
                        navLinks.style.gap = '';
                        navLinks.style.borderBottom = '';
                    }
                });
            }
        });
    }

    /* ═══════════════════════════════════════
       14. SMOOTH SCROLL FOR ANCHOR LINKS
       ═══════════════════════════════════════ */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                gsap.to(window, {
                    scrollTo: { y: target, offsetY: 80 },
                    duration: 1.2,
                    ease: 'power3.inOut',
                });
            }
        });
    });

}); // end DOMContentLoaded
