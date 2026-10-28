// Shared site behaviour: navigation, app showcase, local time, contact form.

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
    const originalHTML = submitBtn.innerHTML;

    function showStatus(text, state, reset) {
        submitBtn.textContent = text;
        submitBtn.classList.add(state);
        setTimeout(() => {
            submitBtn.innerHTML = originalHTML;
            submitBtn.classList.remove(state);
            submitBtn.disabled = false;
            if (reset) contactForm.reset();
        }, 3000);
    }

    contactForm.addEventListener('submit', async e => {
        e.preventDefault();
        submitBtn.textContent = 'Sending…';
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
