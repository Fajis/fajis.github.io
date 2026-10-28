// Site-wide behaviour. Content is rendered by Jekyll; this file only adds
// interaction. Each feature is a small init function that does nothing when
// its elements are not on the page.

// ---------- Helpers ----------

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// localStorage can throw (private mode, blocked storage): fail quietly
const storage = {
    get(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) { /* choice lasts for this visit only */ }
    }
};

// ---------- Theme ----------

function initThemeToggle() {
    const button = $('#themeToggle');
    if (!button) return;

    const root = document.documentElement;
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)');
    const current = () => root.dataset.theme || (prefersLight.matches ? 'light' : 'dark');
    const opposite = theme => (theme === 'dark' ? 'light' : 'dark');

    const label = $('.theme-label', button);

    // data-next picks the icon in CSS (sun for light, moon for dark)
    function render() {
        const next = opposite(current());
        button.dataset.next = next;
        label.textContent = next === 'light' ? 'Light' : 'Dark';
        button.setAttribute('aria-label', `Switch to ${next} theme`);
    }

    button.addEventListener('click', () => {
        const next = opposite(current());
        root.dataset.theme = next;
        storage.set('theme', next);
        render();
    });
    prefersLight.addEventListener('change', render);
    render();
}

// ---------- Mobile menu ----------

function initMobileMenu() {
    const header = $('#siteHeader');
    const toggle = $('#navToggle');
    const menu = $('#navMenu');
    if (!header || !toggle || !menu) return;

    function setOpen(open) {
        header.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.firstElementChild.textContent = open ? 'Close' : 'Menu';
    }

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    $$('a', menu).forEach(link => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') setOpen(false);
    });
}

// ---------- Entrance animations ----------

// Start the headline animations once fonts are ready and the page has
// painted, so they play in front of the visitor instead of during loading
function initEntrance() {
    const root = document.documentElement;
    const start = () => requestAnimationFrame(() => root.classList.add('is-loaded'));
    if (document.fonts && document.fonts.status !== 'loaded') {
        document.fonts.ready.then(start);
    } else {
        start();
    }
}

// ---------- Scroll reveal ----------

function initReveal() {
    const root = document.documentElement;
    const items = [
        ...$$('[data-reveal]'),
        ...$$('[data-reveal-stagger] > *'),
        ...$$('.section')
    ];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
        items.forEach(item => item.classList.add('is-visible'));
        root.classList.add('motion-ready');
        return;
    }

    // Children of a stagger group come in one after another
    $$('[data-reveal-stagger]').forEach(group => {
        [...group.children].forEach((child, i) => {
            child.style.setProperty('--delay', `${Math.min(i, 8) * 70}ms`);
        });
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -8% 0px' });

    items.forEach(item => observer.observe(item));
    root.classList.add('motion-ready');
}

// ---------- Reading progress (amber line under the header) ----------

function initScrollProgress() {
    const header = $('#siteHeader');
    if (!header) return;

    let queued = false;
    function update() {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
        header.style.setProperty('--scroll', progress.toFixed(4));
        queued = false;
    }

    window.addEventListener('scroll', () => {
        if (!queued) {
            queued = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });
    update();
}

// ---------- Local time ----------

function initLocalTime() {
    const time = $('#localTime');
    if (!time) return;

    const formatter = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: time.dataset.timezone
    });
    const tick = () => {
        time.textContent = `${formatter.format(new Date())} local`;
    };
    tick();
    setInterval(tick, 30000);
}

// ---------- App showcase: a table row shows its README in the terminal ----------

function initAppShowcase() {
    const rows = $$('.app-row');
    if (!rows.length) return;

    function select(row) {
        rows.forEach(r => {
            const selected = r === row;
            r.classList.toggle('is-selected', selected);
            $('.row-select', r).setAttribute('aria-pressed', String(selected));
            document.getElementById(r.dataset.target).hidden = !selected;
        });
    }

    rows.forEach(row => {
        row.addEventListener('click', e => {
            // Let real links (Play Store) navigate normally
            if (e.target.closest('a')) return;
            select(row);
        });
    });
}

// ---------- Contact form (Formspree, sent with fetch) ----------

function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    const button = $('button[type="submit"]', form);
    const label = $('.btn-label', button);
    const defaultLabel = label.textContent;

    function showStatus(text, state, { reset = false } = {}) {
        label.textContent = text;
        button.classList.add(state);
        setTimeout(() => {
            label.textContent = defaultLabel;
            button.classList.remove(state);
            button.disabled = false;
            if (reset) form.reset();
        }, 3000);
    }

    form.addEventListener('submit', async e => {
        e.preventDefault();
        label.textContent = 'Sending…';
        button.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });
            if (response.ok) {
                showStatus('Message sent. Thank you!', 'is-success', { reset: true });
            } else {
                showStatus('Something went wrong. Try again.', 'is-error');
            }
        } catch (error) {
            showStatus('No connection. Try again.', 'is-error');
        }
    });
}

// ---------- Start ----------

initEntrance();
initReveal();
initScrollProgress();
initThemeToggle();
initMobileMenu();
initLocalTime();
initAppShowcase();
initContactForm();
