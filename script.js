document.addEventListener('DOMContentLoaded', () => {
    class DissolveParticle {
        constructor(x, y, color) {
            this.x = x; this.y = y; this.color = color;
            this.size = Math.random() * 3 + 1; this.initialSize = this.size;
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4 - 2;
            this.life = Math.random() * 120 + 80; this.initialLife = this.life;
            this.gravity = 0.1;
            this.rotation = Math.random() * 2 * Math.PI;
            this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        }
        update() {
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            this.life--;
            this.size = this.initialSize * (this.life / this.initialLife);
            if (this.size < 0) this.size = 0;
        }
        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            const alpha = this.life / this.initialLife;
            ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${Math.sin(alpha * Math.PI) * 0.5})`;
            ctx.shadowBlur = this.size * 2;
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;
            ctx.beginPath();
            ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.fill();
            ctx.restore();
        }
    }

    class CustomCursor {
        constructor() {
            this.cursor = document.querySelector('.cursor');
            this.cursorDot = document.querySelector('.cursor-dot');
            this.cursorX = 0; this.cursorY = 0; this.targetX = 0; this.targetY = 0;
            this.speed = 0.1;
            this.init();
            this.animate();
        }
        init() {
            window.addEventListener('mousemove', e => {
                this.targetX = e.clientX;
                this.targetY = e.clientY;
            });
            document.querySelectorAll('a, button, .image-placeholder, .skill-logo-item, .project-link, .contact-icon-link').forEach(el => {
                el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
                el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
            });
        }
        animate() {
            this.cursorX += (this.targetX - this.cursorX) * this.speed;
            this.cursorY += (this.targetY - this.cursorY) * this.speed;
            this.cursor.style.left = `${this.cursorX}px`;
            this.cursor.style.top = `${this.cursorY}px`;
            this.cursorDot.style.left = `${this.targetX}px`;
            this.cursorDot.style.top = `${this.targetY}px`;
            requestAnimationFrame(this.animate.bind(this));
        }
    }

    class LoadingAnimation {
        constructor(callback) {
            this.loadingScreen = document.getElementById('loadingScreen');
            this.loadingText = document.getElementById('loadingText');
            this.mainContent = document.getElementById('mainContent');
            this.dissolveCanvas = document.getElementById('dissolveCanvas');
            this.ctx = this.dissolveCanvas.getContext('2d');
            this.particles = [];
            this.onFinished = callback;
            this.init();
        }
        init() {
            this.animateText();
            setTimeout(() => this.startDissolveTransition(), 2000);
        }
        animateText() {
            const text = 'BHAVYA GUPTA';
            this.loadingText.innerHTML = '';
            [...text].forEach((letter, index) => {
                const span = document.createElement('span');
                span.className = 'letter';
                span.textContent = letter === ' ' ? '\u00A0' : letter;
                span.style.animationDelay = `${index * 0.075}s`;
                this.loadingText.appendChild(span);
            });
        }
        startDissolveTransition() {
            requestAnimationFrame(() => {
                this.dissolveCanvas.width = window.innerWidth;
                this.dissolveCanvas.height = window.innerHeight;
                if (this.dissolveCanvas.width === 0 || this.dissolveCanvas.height === 0) {
                    this.fallback();
                    return;
                }
                const computedStyle = getComputedStyle(this.loadingText);
                this.ctx.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
                this.ctx.fillStyle = computedStyle.color;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText("BHAVYA GUPTA", this.dissolveCanvas.width / 2, this.dissolveCanvas.height / 2);
                this.loadingText.classList.add('hidden');
                const imageData = this.ctx.getImageData(0, 0, this.dissolveCanvas.width, this.dissolveCanvas.height);
                this.createParticles(imageData);
                this.loadingScreen.style.opacity = '0';
                setTimeout(() => this.loadingScreen.style.display = 'none', 1500);
                this.mainContent.style.display = 'block';
                setTimeout(() => this.showMainContent(), 500);
                this.animateDissolve();
            });
        }
        fallback() {
            this.loadingText.classList.add('hidden');
            this.loadingScreen.style.opacity = '0';
            setTimeout(() => this.loadingScreen.style.display = 'none', 1500);
            this.mainContent.style.display = 'block';
            setTimeout(() => this.showMainContent(), 500);
        }
        showMainContent() {
            this.mainContent.classList.add('visible');
            if (this.onFinished) this.onFinished();
        }
        createParticles(imageData) {
            const data = imageData.data;
            const { width, height } = imageData;
            const step = 3;
            for (let y = 0; y < height; y += step) {
                for (let x = 0; x < width; x += step) {
                    const index = (y * width + x) * 4;
                    const alpha = data[index + 3];
                    if (alpha > 128) {
                        this.particles.push(new DissolveParticle(x, y, { r: data[index], g: data[index + 1], b: data[index + 2] }));
                    }
                }
            }
        }
        animateDissolve() {
            this.ctx.clearRect(0, 0, this.dissolveCanvas.width, this.dissolveCanvas.height);
            this.particles.forEach((p, i) => {
                p.update();
                p.draw(this.ctx);
                if (p.life <= 0) {
                    this.particles.splice(i, 1);
                }
            });
            if (this.particles.length > 0) {
                requestAnimationFrame(() => this.animateDissolve());
            }
        }
    }

    class ParticleSystem {
        constructor() {
            this.canvas = document.getElementById('particleCanvas');
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.particleCount = 50;
            this.init();
        }
        init() {
            this.resizeCanvas();
            this.createParticles();
            this.animate();
            window.addEventListener('resize', () => this.resizeCanvas());
        }
        resizeCanvas() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
        createParticles() {
            for (let i = 0; i < this.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: Math.random() * 2 + 1,
                    speedX: (Math.random() - 0.5) * 0.2,
                    speedY: Math.random() * 0.4 + 0.2,
                    opacity: Math.random() * 0.5 + 0.3
                });
            }
        }
        updateParticles() {
            this.particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.y > this.canvas.height) {
                    p.y = 0;
                    p.x = Math.random() * this.canvas.width;
                }
                if (p.x > this.canvas.width) { p.x = 0; }
                else if (p.x < 0) { p.x = this.canvas.width; }
            });
        }
        drawParticles() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.particles.forEach(p => {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(0, 127, 255, ${p.opacity})`;
                this.ctx.fill();
            });
        }
        animate() {
            this.updateParticles();
            this.drawParticles();
            requestAnimationFrame(() => this.animate());
        }
    }

    class SmoothScroller {
        constructor() {
            this.container = document.getElementById('fullpage-container');
            this.animatedElements = document.querySelectorAll('.has-animation');
            this.isDetailPageActive = false;
            this.currentY = 0;
            this.targetY = 0;
            this.easing = 0.08;
            this.scrollHeight = 0;
            this.init();
        }
        init() {
            this.handleResize();
            window.addEventListener('wheel', this.handleWheel.bind(this));
            window.addEventListener('resize', this.handleResize.bind(this));
            this.initIntersectionObserver();
            this.animate();
        }
        handleResize() {
            this.scrollHeight = this.container.scrollHeight;
            document.body.style.height = `${this.scrollHeight}px`;
        }
        handleWheel(e) {
            if (this.isDetailPageActive) return;
            this.targetY += e.deltaY;
            this.targetY = Math.max(0, Math.min(this.targetY, this.scrollHeight - window.innerHeight));
        }
        animate() {
            if (!this.isDetailPageActive) {
                let diff = this.targetY - this.currentY;
                if (Math.abs(diff) > 0.05) {
                    this.currentY += diff * this.easing;
                    this.container.style.transform = `translateY(-${this.currentY.toFixed(2)}px)`;
                }
            }
            requestAnimationFrame(this.animate.bind(this));
        }
        initIntersectionObserver() {
            const options = { root: null, rootMargin: '0px', threshold: 0.2 };
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    } else {
                        entry.target.classList.remove('visible');
                    }
                });
            }, options);
            this.animatedElements.forEach(el => this.observer.observe(el));
        }
        scrollTo(targetElement) {
            const targetOffset = targetElement.getBoundingClientRect().top + this.currentY;
            this.targetY = targetOffset;
        }
        setDetailPageState(isActive) {
            this.isDetailPageActive = isActive;
        }
    }

    class PageTransitions {
        constructor(scroller) {
            this.scroller = scroller;
            this.projectLinks = document.querySelectorAll('.project-link');
            this.backButtons = document.querySelectorAll('.back-button');
            this.transitionCover = document.getElementById('transition-cover');
            this.hoverPreview = document.getElementById('project-hover-preview');
            this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            this.detailScrollTriggers = [];
            this.init();
        }
        init() {
            gsap.registerPlugin(ScrollTrigger);
            if (this.isTouchDevice) this.hoverPreview.style.display = 'none';
            this.projectLinks.forEach(link => {
                link.addEventListener('click', (e) => this.openProject(e));
                if (!this.isTouchDevice) {
                    link.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
                }
            });
            document.querySelector('.projects-list').addEventListener('mouseleave', () => {
                if (!this.isTouchDevice) this.hoverPreview.classList.remove('active');
            });
            this.backButtons.forEach(button => {
                button.addEventListener('click', (e) => this.closeProject(e));
            });
        }
        handleMouseEnter(e) {
            const link = e.currentTarget;
            const imageUrl = link.dataset.image;
            const linkRect = link.getBoundingClientRect();
            const containerRect = this.hoverPreview.parentElement.getBoundingClientRect();
            const topPosition = (linkRect.top - containerRect.top) + (linkRect.height / 2) - (this.hoverPreview.offsetHeight / 2);
            this.hoverPreview.style.backgroundImage = `url(${imageUrl})`;
            this.hoverPreview.style.top = `${topPosition}px`;
            this.hoverPreview.classList.add('active');
        }
        openProject(e) {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('href');
            const targetPage = document.querySelector(targetId);
            if (!targetPage) return;
            this.scroller.setDetailPageState(true);
            gsap.timeline()
                .set(this.transitionCover, { transformOrigin: 'bottom' })
                .to(this.transitionCover, { scaleY: 1, duration: 0.4, ease: 'power2.inOut' })
                .call(() => {
                    targetPage.classList.add('is-active');
                    targetPage.scrollTop = 0;
                    this.initDetailAnimations(targetPage);
                })
                .set(this.transitionCover, { transformOrigin: 'top' })
                .to(this.transitionCover, { scaleY: 0, duration: 0.4, ease: 'power2.inOut' });
        }
        closeProject(e) {
            e.preventDefault();
            const targetPage = e.currentTarget.closest('.project-detail-page');
            if (!targetPage) return;
            this.detailScrollTriggers.forEach(st => st.kill());
            this.detailScrollTriggers = [];
             gsap.timeline()
                .set(this.transitionCover, { transformOrigin: 'top' })
                .to(this.transitionCover, { scaleY: 1, duration: 0.4, ease: 'power2.inOut' })
                .call(() => {
                    targetPage.classList.remove('is-active');
                    this.scroller.setDetailPageState(false);
                })
                .set(this.transitionCover, { transformOrigin: 'bottom' })
                .to(this.transitionCover, { scaleY: 0, duration: 0.4, ease: 'power2.inOut' });
        }
        initDetailAnimations(page) {
            const textSections = gsap.utils.toArray(page.querySelectorAll('.gallery-text-section'));
            const images = gsap.utils.toArray(page.querySelectorAll('.gallery-image'));
            if(images.length === 0) return;

            this.setActiveImage(images, 0);
            textSections.forEach((section, i) => {
                const st = ScrollTrigger.create({
                    trigger: section,
                    scroller: page,
                    start: 'top center',
                    end: 'bottom center',
                    onEnter: () => this.setActiveImage(images, i),
                    onEnterBack: () => this.setActiveImage(images, i)
                });
                this.detailScrollTriggers.push(st);
            });
        }
        setActiveImage(images, index) {
            images.forEach((img, i) => {
                if (i === index) { img.classList.add('is-active'); }
                else { img.classList.remove('is-active'); }
            });
        }
    }

    const smoothScroller = new SmoothScroller();
    new ParticleSystem();
    new CustomCursor();
    new PageTransitions(smoothScroller);
    new LoadingAnimation(() => {
        smoothScroller.handleResize();
        smoothScroller.initIntersectionObserver();
    });

    document.getElementById('hero-cta-button').addEventListener('click', (e) => {
        e.preventDefault();
        const contactSection = document.querySelector('.page-section.contact');
        smoothScroller.scrollTo(contactSection);
    });
});
