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

    function render() {
        const next = opposite(current());
        button.textContent = next === 'light' ? '☀ Light' : '☾ Dark';
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

// ---------- Active section in the nav ----------

function initActiveNav() {
    if (!('IntersectionObserver' in window)) return;

    // Nav links that point to a section on this page
    const sectionLinks = new Map();
    $$('.nav-link').forEach(link => {
        const url = new URL(link.href);
        if (!url.hash || url.pathname !== location.pathname) return;
        const section = document.getElementById(url.hash.slice(1));
        if (section) sectionLinks.set(section, link);
    });
    if (!sectionLinks.size) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            sectionLinks.forEach(link => link.classList.remove('is-active'));
            sectionLinks.get(entry.target).classList.add('is-active');
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sectionLinks.forEach((_, section) => observer.observe(section));
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

initThemeToggle();
initMobileMenu();
initActiveNav();
initLocalTime();
initAppShowcase();
initContactForm();
