// Shared site behaviour: theme, navigation, app showcase, local time, contact form.

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
    themeToggle.textContent = next === 'light' ? '☀ Light' : '☾ Dark';
    themeToggle.setAttribute('aria-label', `Switch to ${next} theme`);
}

if (themeToggle) {
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
    navToggle.firstElementChild.textContent = open ? 'Close' : 'Menu';
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
        localTime.textContent = `${formatter.format(new Date())} local`;
    };
    tick();
    setInterval(tick, 30000);
}

// ---------- Render content from data.js ----------
const data = window.SITE_DATA || { links: [], stack: [], experience: [], apps: [] };

// Small element builder: el('td', { class: 'mono' }, 'text', childEl)
function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
        if (value === false || value == null) return;
        node.setAttribute(key, value === true ? '' : value);
    });
    node.append(...children);
    return node;
}

const playUrl = app => `https://play.google.com/store/apps/details?id=${app.package}`;
const pad = n => String(n).padStart(2, '0');

function fillStack(tbody) {
    data.stack.forEach(row => {
        tbody.append(el('tr', { class: row.muted ? 'is-muted' : null },
            el('th', { scope: 'row' }, row.area),
            el('td', {}, row.tools),
            el('td', {}, row.use)
        ));
    });
}

function fillExperience(list) {
    data.experience.forEach(job => {
        const projects = el('ul', { class: 'job-projects' },
            ...job.projects.map((name, i) => el('li', {}, el('span', { class: 'mono' }, pad(i + 1)), name)));
        if (job.more) {
            projects.append(el('li', { class: 'is-more' }, el('span', { class: 'mono' }, '+'), job.more));
        }

        list.append(el('article', { class: 'job' },
            el('p', { class: 'job-dates mono' }, el('time', { datetime: job.start }, job.start), ` — ${job.end}`),
            el('div', { class: 'job-main' },
                el('h3', { class: 'job-role' }, job.role),
                el('p', { class: 'job-company' }, job.company),
                el('p', { class: 'job-intro' }, 'Systems I have built here:'),
                projects
            )
        ));
    });
}

function fillAppShowcase(tbody, screens) {
    data.apps.forEach((app, i) => {
        const target = `app-${app.id}`;
        const selected = i === 0;

        tbody.append(el('tr', { class: selected ? 'app-row is-selected' : 'app-row', 'data-target': target },
            el('td', { class: 'mono' }, pad(i + 1)),
            el('td', {}, el('button', {
                type: 'button', class: 'row-select', 'aria-controls': target, 'aria-pressed': String(selected)
            }, app.name)),
            el('td', { class: 'col-optional' }, app.category),
            el('td', { class: 'col-optional mono' }, app.platform),
            el('td', { class: 'col-link' }, el('a', { href: playUrl(app), target: '_blank', rel: 'noopener' }, 'Play ↗'))
        ));

        const line = (key, value) => el('li', {}, el('span', { class: 'key' }, key), value);
        const command = (...content) => el('li', { class: 'cmd' }, el('span', { class: 'prompt' }, '$'), ' ', ...content);

        screens.append(el('article', { class: 'terminal-screen', id: target, hidden: !selected },
            el('ol', { class: 'terminal-lines mono' },
                command(`cat apps/${app.id}/README`),
                line('name', app.name),
                line('platform', app.platform),
                line('package', app.package),
                line('about', app.about),
                line('features', app.features),
                command(el('a', { href: playUrl(app), target: '_blank', rel: 'noopener' }, 'open play-store ↗'))
            )
        ));
    });
}

function fillAppList(list) {
    data.apps.forEach(app => {
        list.append(el('li', {},
            el('a', { class: 'index-row', href: playUrl(app) },
                el('img', { class: 'index-logo', src: app.logo, alt: '', width: 40, height: 40 }),
                el('span', { class: 'index-name' }, app.name),
                el('span', { class: 'index-desc' }, app.about),
                el('span', { class: 'index-go' }, 'Get it ↗')
            )
        ));
    });
}

function externalLink(link, text) {
    return el('a', { href: link.url, target: '_blank', rel: 'noopener' }, text);
}

// Contact section: one row per link, right after the Email row
const contactEmailRow = document.getElementById('contactEmailRow');
if (contactEmailRow) {
    contactEmailRow.after(...data.links.map(link => el('div', {},
        el('dt', { class: 'mono' }, link.label),
        el('dd', {}, externalLink(link, `${link.handle} ↗`))
    )));
}

// Footer: links first, then the page's own items (CV, Google Play)
const footerLinks = document.getElementById('footerLinks');
if (footerLinks) {
    footerLinks.prepend(...data.links.map(link => el('li', {}, externalLink(link, `${link.label} ↗`))));
}

const stackRows = document.getElementById('stackRows');
if (stackRows) fillStack(stackRows);

const experienceList = document.getElementById('experienceList');
if (experienceList) fillExperience(experienceList);

const appTable = document.getElementById('appRows');
const appScreens = document.getElementById('appScreens');
if (appTable && appScreens) fillAppShowcase(appTable, appScreens);

const appList = document.getElementById('appList');
if (appList) fillAppList(appList);

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
        submitLabel.textContent = text;
        submitBtn.classList.add(state);
        setTimeout(() => {
            submitLabel.textContent = 'Send message';
            submitBtn.classList.remove(state);
            submitBtn.disabled = false;
            if (reset) contactForm.reset();
        }, 3000);
    }

    contactForm.addEventListener('submit', async e => {
        e.preventDefault();
        submitLabel.textContent = 'Sending…';
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
