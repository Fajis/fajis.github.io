// Shared site behaviour: navigation, scroll state, reveal animations, contact form.

const header = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

// Footer year
document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
});

// Mobile menu
function setMenuOpen(open) {
    if (!header || !navToggle) return;
    header.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
}

if (navToggle) {
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

// Header background once the page has scrolled
function updateHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

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

// Reveal elements as they scroll into view
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
} else {
    revealEls.forEach(el => el.classList.add('is-visible'));
}

// Border light that follows the pointer on interactive cards
document.querySelectorAll('.card--interactive').forEach(card => {
    card.addEventListener('pointermove', e => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
});

// Contact form (Formspree, submitted via fetch)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    function showStatus(text, state, reset) {
        submitBtn.textContent = text;
        submitBtn.classList.add(state);
        setTimeout(() => {
            submitBtn.textContent = originalText;
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
                showStatus('Message sent!', 'is-success', true);
            } else {
                showStatus('Something went wrong', 'is-error', false);
            }
        } catch (error) {
            showStatus('Network error', 'is-error', false);
        }
    });
}
