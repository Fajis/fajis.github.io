// Shared site behaviour: theme, language, navigation, app showcase, local time,
// contact form. Expects i18n.js to be loaded first.

const i18n = window.siteI18n || { t: text => text, lang: 'en', setLang() {}, onChange() {} };
const t = i18n.t;
const root = document.documentElement;

// Theme: follows the device setting until the visitor picks one
const themeToggle = document.getElementById('themeToggle');
const lightQuery = window.matchMedia('(prefers-color-scheme: light)');

function currentTheme() {
    return root.dataset.theme || (lightQuery.matches ? 'light' : 'dark');
}

function renderThemeToggle() {
    if (!themeToggle) return;
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    themeToggle.textContent = t(next === 'light' ? 'Light' : 'Dark');
    themeToggle.setAttribute('aria-label', t(next === 'light' ? 'Switch to light theme' : 'Switch to dark theme'));
}

if (themeToggle) {
    themeToggle.hidden = false;
    themeToggle.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        try {
            localStorage.setItem('theme', next);
        } catch (e) { /* storage unavailable: choice lasts for this visit */ }
        renderThemeToggle();
    });
    lightQuery.addEventListener('change', renderThemeToggle);
    renderThemeToggle();
}

// Language toggle: shows the language you can switch to
const langToggle = document.getElementById('langToggle');

function renderLangToggle() {
    if (!langToggle) return;
    const toMalayalam = i18n.lang === 'en';
    langToggle.textContent = toMalayalam ? 'മലയാളം' : 'English';
    langToggle.lang = toMalayalam ? 'ml' : 'en';
    langToggle.setAttribute('aria-label', toMalayalam ? 'മലയാളത്തിൽ കാണുക' : 'View in English');
}

if (langToggle) {
    langToggle.hidden = false;
    langToggle.addEventListener('click', () => {
        i18n.setLang(i18n.lang === 'en' ? 'ml' : 'en');
    });
    renderLangToggle();
}

i18n.onChange(() => {
    renderLangToggle();
    renderThemeToggle();
});

const header = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

// Footer year
document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
});

// Mobile menu
function setMenuOpen(open) {
    header.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.firstElementChild.textContent = t(open ? 'Close' : 'Menu');
}

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        setMenuOpen(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') setMenuOpen(false);
    });
}

// Highlight the nav link of the section currently in view
const sectionLinks = new Map();
document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) sectionLinks.set(section, link);
});

if (sectionLinks.size && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            sectionLinks.forEach(link => link.classList.remove('is-active'));
            sectionLinks.get(entry.target).classList.add('is-active');
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sectionLinks.forEach((_, section) => sectionObserver.observe(section));
}

// Local time in Bahrain (UTC+3)
const localTime = document.getElementById('localTime');
if (localTime) {
    const formatter = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bahrain'
    });
    const tick = () => {
        localTime.textContent = `${formatter.format(new Date())} ${t('local')}`;
    };
    tick();
    setInterval(tick, 30000);
    i18n.onChange(tick);
}

// App showcase: selecting a table row shows its README in the terminal
const appRows = document.querySelectorAll('.app-row');

function selectApp(row) {
    appRows.forEach(r => {
        const selected = r === row;
        r.classList.toggle('is-selected', selected);
        r.querySelector('.row-select').setAttribute('aria-pressed', String(selected));
        document.getElementById(r.dataset.target).hidden = !selected;
    });
}

appRows.forEach(row => {
    row.addEventListener('click', e => {
        // Let real links (Play Store, tools) navigate normally
        if (e.target.closest('a')) return;
        selectApp(row);
    });
});

// Contact form (Formspree, submitted via fetch)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const submitLabel = submitBtn.querySelector('.btn-label');

    function showStatus(text, state, reset) {
        submitLabel.textContent = t(text);
        submitBtn.classList.add(state);
        setTimeout(() => {
            submitLabel.textContent = t('Send message');
            submitBtn.classList.remove(state);
            submitBtn.disabled = false;
            if (reset) contactForm.reset();
        }, 3000);
    }

    contactForm.addEventListener('submit', async e => {
        e.preventDefault();
        submitLabel.textContent = t('Sending…');
        submitBtn.disabled = true;

        try {
            const response = await fetch(contactForm.action, {
                method: contactForm.method,
                body: new FormData(contactForm),
                headers: { Accept: 'application/json' }
            });

            if (response.ok) {
                showStatus('Message sent. Thank you!', 'is-success', true);
            } else {
                showStatus('Something went wrong. Try again.', 'is-error', false);
            }
        } catch (error) {
            showStatus('No connection. Try again.', 'is-error', false);
        }
    });
}
