// ═══════════════════════════════════════════
//  INFRAVEX — Ultimate Interactive Script
// ═══════════════════════════════════════════

// ── PRELOADER ──
(function () {
    const fill = document.getElementById('preloaderFill');
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 18 + 5;
        if (progress >= 100) progress = 100;
        if (fill) fill.style.width = progress + '%';
        if (progress >= 100) clearInterval(interval);
    }, 200);

    window.addEventListener('load', () => {
        if (fill) fill.style.width = '100%';
        setTimeout(() => {
            const pre = document.getElementById('preloader');
            if (pre) pre.classList.add('loaded');
            document.body.style.overflow = '';
        }, 600);
    });

    document.body.style.overflow = 'hidden';
})();

// ── PAGE NAVIGATION ──
const pages = ['home', 'services', 'about', 'contact'];

function showPage(name) {
    pages.forEach(p => {
        const el = document.getElementById('page-' + p);
        const btn = document.getElementById('nav-' + p);
        if (el) el.classList.toggle('active', p === name);
        if (btn) btn.classList.toggle('active', p === name);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMobile();
    setTimeout(() => {
        initReveal();
        initScrollEffects();
        if (name === 'home') { initCounters(); initBars(); initCharts(); initStatCounters(); }
    }, 100);
}

// ── MOBILE MENU ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger) hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
});

function closeMobile() {
    if (mobileMenu) mobileMenu.classList.remove('open');
    if (hamburger) hamburger.classList.remove('active');
}

// ── NAV SCROLL + SCROLL PROGRESS ──
const navbar = document.getElementById('navbar');
const scrollProgress = document.getElementById('scrollProgress');
const backToTop = document.getElementById('backToTop');
const scrollIndicator = document.getElementById('scrollIndicator');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', scrollY > 20);
    if (scrollProgress) {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress.style.width = (docH > 0 ? (scrollY / docH) * 100 : 0) + '%';
    }
    // Back to top
    if (backToTop) backToTop.classList.toggle('visible', scrollY > 400);
    // Scroll indicator
    if (scrollIndicator) scrollIndicator.classList.toggle('hidden', scrollY > 100);
    // Scroll-driven effects
    handleScrollEffects();
});

if (backToTop) backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ══════════════════════════════════════
//  MOUSE SCROLL CSS EFFECTS
// ══════════════════════════════════════

function handleScrollEffects() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    // Parallax elements
    document.querySelectorAll('.scroll-parallax').forEach(el => {
        const speed = parseFloat(el.dataset.speed || 0.3);
        const rect = el.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
            const offset = (rect.top - vh / 2) * speed;
            el.style.transform = `translateY(${offset}px)`;
        }
    });

    // Scale on scroll
    document.querySelectorAll('.scroll-scale').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
            const progress = 1 - Math.max(0, Math.min(1, (rect.top) / vh));
            const scale = 0.85 + progress * 0.15;
            const opacity = 0.3 + progress * 0.7;
            el.style.transform = `scale(${scale})`;
            el.style.opacity = opacity;
        }
    });

    // Rotate on scroll
    document.querySelectorAll('.scroll-rotate').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
            const progress = (vh - rect.top) / (vh + rect.height);
            const rotation = -5 + progress * 10;
            el.style.transform = `rotate(${rotation}deg)`;
        }
    });

    // Section progress bars
    document.querySelectorAll('.scroll-progress-section').forEach(section => {
        const rect = section.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
        section.style.setProperty('--section-progress', progress);
    });
}

// ── MOUSE SPOTLIGHT EFFECT ──
function initMouseSpotlight() {
    document.querySelectorAll('.mouse-spotlight').forEach(section => {
        section.addEventListener('mousemove', e => {
            const rect = section.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            section.style.setProperty('--mouse-x', x + 'px');
            section.style.setProperty('--mouse-y', y + 'px');
        });
    });
}

function initScrollEffects() {
    // Add scroll classes to sections dynamically
    document.querySelectorAll('.page.active section, .page.active .values-section, .page.active .team-section').forEach(section => {
        if (!section.classList.contains('scroll-progress-section')) {
            section.classList.add('scroll-progress-section');
        }
    });
}

// ── REVEAL ON SCROLL (ENHANCED) ──
function initReveal() {
    const selectors = '.page.active .reveal:not(.visible), .page.active .reveal-left:not(.visible), .page.active .reveal-right:not(.visible), .page.active .reveal-scale:not(.visible), .page.active .reveal-rotate:not(.visible)';
    const els = document.querySelectorAll(selectors);
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
}

// ── COUNTERS ──
function animateCount(el, target, suffix, duration) {
    if (!el) return;
    const isFloat = String(target).includes('.');
    const start = performance.now();
    function frame(ts) {
        const p = Math.min((ts - start) / duration, 1);
        const val = target * (1 - Math.pow(1 - p, 3));
        el.textContent = (isFloat ? val.toFixed(1) : Math.floor(val)) + (suffix || '');
        if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

function initCounters() {
    const seen = new Set();
    [{ id: 'heroCounter1', target: 500, suffix: '+', delay: 400 },
    { id: 'heroCounter2', target: 40, suffix: '+', delay: 600 },
    { id: 'heroCounter3', target: 8, suffix: '+', delay: 800 }
    ].forEach(({ id, target, suffix, delay }) => {
        if (seen.has(id)) return; seen.add(id);
        setTimeout(() => animateCount(document.getElementById(id), target, suffix, 1800), delay);
    });
}

// ── STATS BAR COUNTERS ──
function initStatCounters() {
    const stats = document.querySelectorAll('.stat-number[data-target]');
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting && !e.target.dataset.counted) {
                e.target.dataset.counted = '1';
                const target = parseInt(e.target.dataset.target);
                const suffix = e.target.dataset.suffix || '';
                animateCount(e.target, target, suffix, 2000);
            }
        });
    }, { threshold: 0.3 });
    stats.forEach(s => obs.observe(s));
}

// ── PERFORMANCE BARS ──
function initBars() {
    [{ id: 'bar1', w: '98%' }, { id: 'bar2', w: '99.9%' }, { id: 'bar3', w: '85%' }, { id: 'bar4', w: '96%' }, { id: 'bar5', w: '92%' }]
        .forEach(({ id, w }, i) => { setTimeout(() => { const el = document.getElementById(id); if (el) el.style.width = w; }, 500 + i * 150); });
}

// ── CHART BARS ──
function initCharts() {
    [45, 60, 52, 78, 65, 88, 95].forEach((h, i) => {
        const fills = document.querySelectorAll('#heroChart .chart-bar-fill');
        if (fills[i]) setTimeout(() => { fills[i].style.height = h + '%'; }, 600 + i * 100);
    });
}

// ── TOAST NOTIFICATIONS ──
function showToast(message, type = 'success') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = `<span class="toast-icon">${icons[type] || '✅'}</span><span>${message}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 3500);
}

// ── FORM SUBMIT (ENHANCED) ──
function handleFormSubmit(btn) {
    const form = btn.closest('.contact-form-wrap');
    const inputs = form ? form.querySelectorAll('input[type="text"], input[type="email"], textarea') : [];
    let valid = true;
    inputs.forEach(inp => {
        if (inp.closest('.form-group')?.querySelector('label')?.textContent.includes('*')) {
            if (!inp.value.trim()) { inp.classList.add('invalid'); inp.classList.remove('valid'); valid = false; }
            else { inp.classList.remove('invalid'); inp.classList.add('valid'); }
        }
    });
    const em = form?.querySelector('input[type="email"]');
    if (em && em.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) { em.classList.add('invalid'); em.classList.remove('valid'); valid = false; }
    if (!valid) { showToast('Please fill in all required fields correctly.', 'error'); return; }

    btn.classList.add('loading');
    setTimeout(() => {
        btn.classList.remove('loading');
        btn.textContent = '✓ Message Sent!'; btn.style.background = '#16a34a'; btn.disabled = true;
        // Store contact request for admin dashboard
        const allInputs = form ? form.querySelectorAll('input, textarea, select') : [];
        const data = {};
        allInputs.forEach(inp => {
            const label = inp.closest('.form-group')?.querySelector('label')?.textContent.replace('*', '').trim().toLowerCase();
            if (label) {
                if (label.includes('first')) data.firstName = inp.value;
                else if (label.includes('last')) data.lastName = inp.value;
                else if (label.includes('email')) data.email = inp.value;
                else if (label.includes('phone')) data.phone = inp.value;
                else if (label.includes('company')) data.company = inp.value;
                else if (label.includes('service')) data.service = inp.value;
                else if (label.includes('budget')) data.budget = inp.value;
                else if (label.includes('project') || label.includes('tell')) data.message = inp.value;
            }
        });
        if (typeof storeContactRequest === 'function') storeContactRequest(data);
        showToast("Your message has been sent! We'll respond within 2 hours.", 'success');
        setTimeout(() => {
            btn.textContent = 'Send Message →'; btn.style.background = ''; btn.disabled = false;
            inputs.forEach(inp => { inp.value = ''; inp.classList.remove('valid', 'invalid'); });
            if (form) form.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
        }, 3000);
    }, 1200);
}

// ── NEWSLETTER SUBMIT ──
function handleNewsletter(btn) {
    const form = btn.closest('.newsletter-form');
    const input = form?.querySelector('input');
    if (!input || !input.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        showToast('Please enter a valid email address.', 'error');
        return;
    }
    btn.textContent = '✓ Subscribed!';
    btn.style.background = '#16a34a';
    btn.style.color = '#fff';
    if (typeof storeNewsletterRequest === 'function') storeNewsletterRequest(input.value);
    showToast('Welcome! You\'re now subscribed to our newsletter.', 'success');
    setTimeout(() => {
        btn.textContent = 'Subscribe';
        btn.style.background = '';
        btn.style.color = '';
        input.value = '';
    }, 3000);
}

// ── DARK MODE ──
function initDarkMode() {
    const toggle = document.getElementById('darkToggle');
    const saved = localStorage.getItem('infravex-dark');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'true' || (saved === null && prefersDark)) document.body.classList.add('dark');
    updateIcon();
    function flip() { document.body.classList.toggle('dark'); localStorage.setItem('infravex-dark', document.body.classList.contains('dark')); updateIcon(); }
    function updateIcon() { if (toggle) toggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙'; }
    if (toggle) toggle.addEventListener('click', flip);
}

// ── CUSTOM CURSOR ──
function initCursor() {
    if (window.innerWidth < 769) return;
    const dot = document.getElementById('cursorDot'), ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
    (function loop() { rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(loop); })();
    document.querySelectorAll('a,button,.service-card-home,.service-full-card,.pricing-card,.testimonial,.team-card,.value-card,.feature-item,.faq-question,input,textarea,select').forEach(el => {
        el.addEventListener('mouseenter', () => { dot.classList.add('hover'); ring.classList.add('hover'); });
        el.addEventListener('mouseleave', () => { dot.classList.remove('hover'); ring.classList.remove('hover'); });
    });
}

// ── MAGNETIC BUTTONS ──
function initMagnetic() {
    if (window.innerWidth < 769) return;
    document.querySelectorAll('.btn-primary,.btn-secondary,.btn-accent,.nav-cta').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.2}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
}

// ── 3D TILT CARDS ──
function initTilt() {
    if (window.innerWidth < 769) return;
    document.querySelectorAll('.service-card-home,.service-full-card,.pricing-card,.testimonial,.value-card,.team-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
}

// ── HERO PARALLAX ──
function initParallax() {
    if (window.innerWidth < 769) return;
    const hero = document.getElementById('hero');
    if (!hero) return;
    const grid = hero.querySelector('.hero-bg-grid'), grad = hero.querySelector('.hero-bg-gradient'), floats = hero.querySelectorAll('.float-card');
    hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        if (grid) grid.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
        if (grad) grad.style.transform = `translate(${x * -20}px, ${y * -20}px)`;
        floats.forEach((f, i) => { f.style.transform = `translate(${x * (i + 1) * 8}px, ${y * (i + 1) * 8}px)`; });
    });
}

// ── PARTICLE CANVAS ──
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const count = window.innerWidth < 768 ? 30 : 60;

    function resize() {
        const hero = document.getElementById('hero');
        if (!hero) return;
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.4 + 0.1
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(27, 79, 216, ${p.opacity})`;
            ctx.fill();
        });
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(27, 79, 216, ${0.08 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
}

// ── FAQ ACCORDION ──
function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isActive = item.classList.contains('active');
            // Close all
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            // Open clicked if wasn't active
            if (!isActive) item.classList.add('active');
        });
    });
}

// ── RIPPLE EFFECT ON BUTTONS ──
function initRipple() {
    document.querySelectorAll('.btn-primary, .btn-accent, .btn-secondary').forEach(btn => {
        btn.classList.add('btn-ripple');
        btn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple-wave';
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// ── TYPING TEXT EFFECT ──
function initTypingEffect() {
    const el = document.getElementById('typingText');
    if (!el) return;
    const words = ['InfraVex', 'Innovation', 'Growth', 'Scale'];
    let wordIndex = 0, charIndex = 0, isDeleting = false;
    function type() {
        const current = words[wordIndex];
        if (isDeleting) {
            el.textContent = current.substring(0, charIndex - 1);
            charIndex--;
        } else {
            el.textContent = current.substring(0, charIndex + 1);
            charIndex++;
        }
        let delay = isDeleting ? 50 : 100;
        if (!isDeleting && charIndex === current.length) {
            delay = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 500;
        }
        setTimeout(type, delay);
    }
    type();
}

// ── SMOOTH SCROLL SECTIONS ON MOUSE WHEEL ──
function initSmoothSections() {
    // Add smooth momentum to scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        document.body.classList.add('is-scrolling');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.body.classList.remove('is-scrolling');
        }, 150);
    }, { passive: true });
}


// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
    initReveal(); initCounters(); initBars(); initCharts();
    initDarkMode(); initCursor(); initMagnetic(); initTilt(); initParallax();
    initParticles(); initFAQ(); initRipple(); initTypingEffect();
    initMouseSpotlight(); initScrollEffects(); initStatCounters();
    initSmoothSections(); checkAdminSession();
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const t = document.querySelector(a.getAttribute('href'));
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
});

// ══════════════════════════════════════
//  ADMIN PANEL SYSTEM
// ══════════════════════════════════════

const ADMIN_CREDENTIALS = { username: 'admin', password: 'infravex2025' };

// ── ADMIN LOGIN ──
function openAdminLogin() {
    if (sessionStorage.getItem('infravex-admin') === 'true') {
        showToast('You are already logged in as admin.', 'info');
        return;
    }
    document.getElementById('adminOverlay').classList.add('open');
    document.getElementById('adminUser').focus();
}
function closeAdminLogin() {
    document.getElementById('adminOverlay').classList.remove('open');
    document.getElementById('adminError').classList.remove('show');
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
}

function handleAdminLogin() {
    const user = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value;
    if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('infravex-admin', 'true');
        closeAdminLogin();
        activateAdminMode();
        showToast('Welcome, Admin! You can now edit content and view requests.', 'success');
    } else {
        document.getElementById('adminError').classList.add('show');
        document.getElementById('adminPass').value = '';
        setTimeout(() => document.getElementById('adminError').classList.remove('show'), 3000);
    }
}

// Allow Enter key to submit login
document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.getElementById('adminOverlay').classList.contains('open')) {
        handleAdminLogin();
    }
});

function activateAdminMode() {
    document.getElementById('adminToolbar').classList.add('open');
    document.getElementById('adminTrigger').style.display = 'none';
    // Shift page content down for toolbar
    document.querySelectorAll('.page.active').forEach(p => {
        p.style.paddingTop = '44px';
    });
    showToast('Admin toolbar active. Use ✏️ Edit to modify content.', 'info');
}

function adminLogout() {
    sessionStorage.removeItem('infravex-admin');
    document.getElementById('adminToolbar').classList.remove('open');
    document.getElementById('adminTrigger').style.display = '';
    document.body.classList.remove('admin-editing');
    const editBtn = document.getElementById('editModeBtn');
    if (editBtn) editBtn.classList.remove('active');
    // Remove editable states
    document.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
    });
    document.querySelectorAll('.page.active').forEach(p => {
        p.style.paddingTop = '';
    });
    showToast('Logged out successfully.', 'success');
}

// ── INLINE EDIT MODE ──
function toggleEditMode() {
    const btn = document.getElementById('editModeBtn');
    const isEditing = document.body.classList.toggle('admin-editing');
    btn.classList.toggle('active', isEditing);

    document.querySelectorAll('[data-editable]').forEach(el => {
        if (isEditing) {
            el.setAttribute('contenteditable', 'true');
            el.addEventListener('blur', saveEditableContent);
        } else {
            el.removeAttribute('contenteditable');
            el.removeEventListener('blur', saveEditableContent);
        }
    });

    showToast(isEditing ? 'Edit mode ON — click any highlighted text to edit it.' : 'Edit mode OFF — changes saved.', 'info');
}

function saveEditableContent(e) {
    const key = e.target.getAttribute('data-editable');
    const content = e.target.innerHTML;
    // Save to localStorage
    const edits = JSON.parse(localStorage.getItem('infravex-edits') || '{}');
    edits[key] = content;
    localStorage.setItem('infravex-edits', JSON.stringify(edits));
    showToast('Content saved: ' + key, 'success');
}

// Restore saved edits on load
function restoreSavedEdits() {
    const edits = JSON.parse(localStorage.getItem('infravex-edits') || '{}');
    Object.entries(edits).forEach(([key, html]) => {
        const el = document.querySelector(`[data-editable="${key}"]`);
        if (el) el.innerHTML = html;
    });
}

// ── VISITOR REQUESTS STORAGE ──
function storeContactRequest(data) {
    const requests = JSON.parse(localStorage.getItem('infravex-contacts') || '[]');
    requests.unshift({ ...data, timestamp: new Date().toISOString(), id: Date.now() });
    localStorage.setItem('infravex-contacts', JSON.stringify(requests));
}

function storeNewsletterRequest(email) {
    const subs = JSON.parse(localStorage.getItem('infravex-newsletters') || '[]');
    subs.unshift({ email, timestamp: new Date().toISOString(), id: Date.now() });
    localStorage.setItem('infravex-newsletters', JSON.stringify(subs));
}

// ── DASHBOARD ──
function openDashboard() {
    document.getElementById('dashboardOverlay').classList.add('open');
    renderDashboard('contacts');
}
function closeDashboard() {
    document.getElementById('dashboardOverlay').classList.remove('open');
}

function switchDashTab(tab, btn) {
    document.querySelectorAll('.admin-dash-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderDashboard(tab);
}

function renderDashboard(tab) {
    const body = document.getElementById('dashBody');
    if (tab === 'contacts') {
        const requests = JSON.parse(localStorage.getItem('infravex-contacts') || '[]');
        if (requests.length === 0) {
            body.innerHTML = `
                <div class="admin-stats-grid">
                    <div class="admin-stat-card"><div class="admin-stat-num">0</div><div class="admin-stat-label">Total Requests</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-num">0</div><div class="admin-stat-label">Today</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-num">0</div><div class="admin-stat-label">This Week</div></div>
                </div>
                <div class="admin-dash-empty">
                    <div class="empty-icon">📭</div>
                    <p>No contact requests yet. They'll appear here when visitors submit the contact form.</p>
                </div>`;
            return;
        }
        const today = new Date().toDateString();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const todayCount = requests.filter(r => new Date(r.timestamp).toDateString() === today).length;
        const weekCount = requests.filter(r => new Date(r.timestamp) >= weekAgo).length;

        let html = `
            <div class="admin-stats-grid">
                <div class="admin-stat-card"><div class="admin-stat-num">${requests.length}</div><div class="admin-stat-label">Total Requests</div></div>
                <div class="admin-stat-card"><div class="admin-stat-num">${todayCount}</div><div class="admin-stat-label">Today</div></div>
                <div class="admin-stat-card"><div class="admin-stat-num">${weekCount}</div><div class="admin-stat-label">This Week</div></div>
            </div>`;

        requests.forEach(r => {
            const date = new Date(r.timestamp);
            const timeStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            html += `
                <div class="admin-request-card" id="req-${r.id}">
                    <div class="admin-req-header">
                        <div>
                            <div class="admin-req-name">${r.firstName || ''} ${r.lastName || ''}</div>
                            <div class="admin-req-email">${r.email || 'N/A'}</div>
                        </div>
                        <span class="admin-req-time">${timeStr}</span>
                    </div>
                    <div class="admin-req-details">
                        <div class="admin-req-detail"><div class="admin-req-detail-label">Service</div><div class="admin-req-detail-val">${r.service || 'N/A'}</div></div>
                        <div class="admin-req-detail"><div class="admin-req-detail-label">Budget</div><div class="admin-req-detail-val">${r.budget || 'N/A'}</div></div>
                        <div class="admin-req-detail"><div class="admin-req-detail-label">Phone</div><div class="admin-req-detail-val">${r.phone || 'N/A'}</div></div>
                        <div class="admin-req-detail"><div class="admin-req-detail-label">Company</div><div class="admin-req-detail-val">${r.company || 'N/A'}</div></div>
                    </div>
                    ${r.message ? `<div class="admin-req-message">"${r.message}"</div>` : ''}
                    <div class="admin-req-actions">
                        <button class="admin-req-btn" onclick="window.open('mailto:${r.email}')">📧 Reply</button>
                        <button class="admin-req-btn delete" onclick="deleteRequest(${r.id}, 'contacts')">🗑️ Delete</button>
                    </div>
                </div>`;
        });
        body.innerHTML = html;
    } else if (tab === 'newsletters') {
        const subs = JSON.parse(localStorage.getItem('infravex-newsletters') || '[]');
        if (subs.length === 0) {
            body.innerHTML = `
                <div class="admin-stats-grid">
                    <div class="admin-stat-card"><div class="admin-stat-num">0</div><div class="admin-stat-label">Subscribers</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-num">0</div><div class="admin-stat-label">Today</div></div>
                    <div class="admin-stat-card"><div class="admin-stat-num">0</div><div class="admin-stat-label">This Week</div></div>
                </div>
                <div class="admin-dash-empty">
                    <div class="empty-icon">📬</div>
                    <p>No newsletter subscribers yet. They'll appear here when visitors sign up.</p>
                </div>`;
            return;
        }
        const today = new Date().toDateString();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const todayCount = subs.filter(s => new Date(s.timestamp).toDateString() === today).length;
        const weekCount = subs.filter(s => new Date(s.timestamp) >= weekAgo).length;

        let html = `
            <div class="admin-stats-grid">
                <div class="admin-stat-card"><div class="admin-stat-num">${subs.length}</div><div class="admin-stat-label">Total Subscribers</div></div>
                <div class="admin-stat-card"><div class="admin-stat-num">${todayCount}</div><div class="admin-stat-label">Today</div></div>
                <div class="admin-stat-card"><div class="admin-stat-num">${weekCount}</div><div class="admin-stat-label">This Week</div></div>
            </div>`;

        subs.forEach(s => {
            const date = new Date(s.timestamp);
            const timeStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            html += `
                <div class="admin-request-card" id="sub-${s.id}">
                    <div class="admin-req-header">
                        <div class="admin-req-email" style="font-size:0.9rem;">${s.email}</div>
                        <span class="admin-req-time">${timeStr}</span>
                    </div>
                    <div class="admin-req-actions">
                        <button class="admin-req-btn" onclick="window.open('mailto:${s.email}')">📧 Send Email</button>
                        <button class="admin-req-btn delete" onclick="deleteRequest(${s.id}, 'newsletters')">🗑️ Remove</button>
                    </div>
                </div>`;
        });
        body.innerHTML = html;
    }
}

function deleteRequest(id, type) {
    const key = type === 'contacts' ? 'infravex-contacts' : 'infravex-newsletters';
    let data = JSON.parse(localStorage.getItem(key) || '[]');
    data = data.filter(d => d.id !== id);
    localStorage.setItem(key, JSON.stringify(data));
    renderDashboard(type);
    showToast('Entry deleted.', 'info');
}

// ── CHECK ADMIN SESSION ON LOAD ──
function checkAdminSession() {
    if (sessionStorage.getItem('infravex-admin') === 'true') {
        activateAdminMode();
    }
    restoreSavedEdits();
}

// Handle admin login — redirect to admin.html dashboard
const origHandleAdminLogin = handleAdminLogin;
handleAdminLogin = function () {
    const user = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value;
    const savedPass = localStorage.getItem('infravex-admin-pass') || 'infravex2025';
    if (user === 'admin' && pass === savedPass) {
        sessionStorage.setItem('infravex-session', JSON.stringify({ role: 'admin', name: 'Administrator', email: 'admin@infravex.in' }));
        closeAdminLogin();
        showToast('Welcome, Admin! Redirecting to dashboard...', 'success');
        setTimeout(() => { window.location.href = 'admin.html'; }, 800);
    } else {
        document.getElementById('adminError').classList.add('show');
        document.getElementById('adminPass').value = '';
        setTimeout(() => document.getElementById('adminError').classList.remove('show'), 3000);
    }
};
