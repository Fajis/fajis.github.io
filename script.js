/*

Tooplate 2141 Minimal White

https://www.tooplate.com/view/2141-minimal-white

*/

// JavaScript Document

document.querySelector('footer p').innerHTML = `&copy; ${new Date().getFullYear()} Fajis PM &mdash; Developer Portfolio.`;

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', function () {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function () {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Navbar scroll effect and active menu highlighting
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', function () {
    const navbar = document.getElementById('navbar');

    // Navbar style on scroll
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Active menu highlighting
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').slice(1) === current) {
            item.classList.add('active');
        }
    });
});

// Trigger scroll event on load to set initial active state
window.dispatchEvent(new Event('scroll'));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Fade in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Form submission (prevent default for demo)
// Form submission (prevent default for demo)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    const originalBackground = submitBtn.style.background || '#475569';

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // 1. Start loading state and disable button
        submitBtn.textContent = 'Sending...';
        submitBtn.style.background = '#059669'; // Success color during loading
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        const data = new FormData(e.target);

        try {
            // 2. Send data using the fetch API
            const response = await fetch(e.target.action, {
                method: e.target.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            // 3. Handle success or failure response
            if (response.ok) {
                submitBtn.textContent = 'Message Sent!';
                // Delay for user to see the success message
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = originalBackground;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                    e.target.reset(); // Reset the form fields on success
                }, 3000);
            } else {
                // Handle non-200 responses (e.g., Formspree error)
                submitBtn.textContent = 'Error!';
                submitBtn.style.background = '#b91c1c'; // Error color

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = originalBackground;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                }, 3000);
            }
        } catch (error) {
            // 4. Handle network errors
            submitBtn.textContent = 'Network Error!';
            submitBtn.style.background = '#b91c1c'; // Error color

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = originalBackground;
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }, 3000);
        }
    });
}