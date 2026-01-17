// ===== Theme Toggle System =====
(function() {
    // Get saved theme or default to dark
    try {
        const savedTheme = localStorage.getItem('celtic-cure-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // Set initial state from current theme
        try {
            const currentTheme = localStorage.getItem('celtic-cure-theme') || 'dark';
            themeToggle.checked = currentTheme === 'bright';
            document.documentElement.setAttribute('data-theme', currentTheme);
        } catch (e) {
            themeToggle.checked = false;
        }
        
        // Handle toggle changes
        function handleThemeChange() {
            const theme = themeToggle.checked ? 'bright' : 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            try {
                localStorage.setItem('celtic-cure-theme', theme);
            } catch (e) {
                // localStorage not available
            }
        }
        
        themeToggle.addEventListener('change', handleThemeChange);
        
        // Also handle click on the toggle wrapper for better accessibility
        const toggleWrapper = document.querySelector('.theme-toggle');
        if (toggleWrapper) {
            toggleWrapper.addEventListener('click', function(e) {
                // Only toggle if clicking the wrapper, not the checkbox directly
                if (e.target !== themeToggle) {
                    e.preventDefault();
                    themeToggle.checked = !themeToggle.checked;
                    handleThemeChange();
                }
            });
        }
    }

    // ===== Mobile Navigation Toggle =====
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ===== Navbar Scroll Effect =====
    const navbar = document.getElementById('navbar');
    
    function handleScroll() {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // ===== Smooth Scroll for Anchor Links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== Scroll Animations with Intersection Observer =====
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    // Optional: unobserve after animation
                    // animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animateElements.forEach(el => animationObserver.observe(el));
    } else {
        // Fallback for browsers without IntersectionObserver
        animateElements.forEach(el => el.classList.add('animated'));
    }

    // ===== Active Navigation Link Highlight =====
    const sections = document.querySelectorAll('section[id]');

    function highlightNavLink() {
        const scrollY = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);

    // ===== Form Validation & Feedback =====
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');
            
            if (!name?.value.trim() || !email?.value.trim() || !subject?.value || !message?.value.trim()) {
                e.preventDefault();
                showFormError('Please fill in all required fields.');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value)) {
                e.preventDefault();
                showFormError('Please enter a valid email address.');
                return;
            }
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitButton.disabled = true;
            }
        });
    }

    function showFormError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification error';
        toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== Copyright Year =====
    const yearElement = document.querySelector('.footer-bottom p');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.innerHTML = yearElement.innerHTML.replace('2024', currentYear);
    }
});

// ===== Gesture Support for Galleries =====
class SwipeGallery {
    constructor(element) {
        this.gallery = element;
        this.track = element.querySelector('.swipe-gallery-track');
        this.items = element.querySelectorAll('.swipe-gallery-item');
        
        if (!this.track || this.items.length === 0) return;
        
        this.currentIndex = 0;
        this.startX = 0;
        this.currentX = 0;
        this.isDragging = false;
        this.trackOffset = 0;
        
        this.itemWidth = this.items[0].offsetWidth + 16; // Including gap
        this.maxIndex = Math.max(0, this.items.length - Math.floor(this.gallery.offsetWidth / this.itemWidth));
        
        this.init();
    }
    
    init() {
        // Touch events
        this.gallery.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.gallery.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.gallery.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Mouse events for desktop
        this.gallery.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.gallery.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.gallery.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.gallery.addEventListener('mouseleave', this.handleMouseUp.bind(this));
        
        // Navigation buttons
        const prevBtn = this.gallery.parentElement.querySelector('.gallery-prev');
        const nextBtn = this.gallery.parentElement.querySelector('.gallery-next');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.navigate(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.navigate(1));
        
        // Keyboard navigation
        this.gallery.setAttribute('tabindex', '0');
        this.gallery.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.navigate(-1);
            if (e.key === 'ArrowRight') this.navigate(1);
        });
    }
    
    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.isDragging = true;
        this.track.style.transition = 'none';
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        this.currentX = e.touches[0].clientX;
        const diff = this.currentX - this.startX;
        this.track.style.transform = `translateX(${this.trackOffset + diff}px)`;
    }
    
    handleTouchEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.track.style.transition = '';
        
        const diff = this.currentX - this.startX;
        const threshold = this.itemWidth / 3;
        
        if (Math.abs(diff) > threshold) {
            this.navigate(diff > 0 ? -1 : 1);
        } else {
            this.updatePosition();
        }
    }
    
    handleMouseDown(e) {
        e.preventDefault();
        this.startX = e.clientX;
        this.isDragging = true;
        this.track.style.transition = 'none';
        this.gallery.style.cursor = 'grabbing';
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        this.currentX = e.clientX;
        const diff = this.currentX - this.startX;
        this.track.style.transform = `translateX(${this.trackOffset + diff}px)`;
    }
    
    handleMouseUp() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.track.style.transition = '';
        this.gallery.style.cursor = 'grab';
        
        const diff = this.currentX - this.startX;
        const threshold = this.itemWidth / 3;
        
        if (Math.abs(diff) > threshold) {
            this.navigate(diff > 0 ? -1 : 1);
        } else {
            this.updatePosition();
        }
    }
    
    navigate(direction) {
        this.currentIndex = Math.max(0, Math.min(this.maxIndex, this.currentIndex + direction));
        this.updatePosition();
    }
    
    updatePosition() {
        this.trackOffset = -this.currentIndex * this.itemWidth;
        this.track.style.transform = `translateX(${this.trackOffset}px)`;
    }
}

// Initialize swipe galleries
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.swipe-gallery').forEach(gallery => {
        new SwipeGallery(gallery);
    });
});

// ===== Parallax Effect for Hero =====
document.addEventListener('DOMContentLoaded', function() {
    const hero = document.querySelector('.hero');
    
    if (hero && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                hero.style.backgroundPositionY = `${scrolled * 0.4}px`;
            }
        });
    }
});

// ===== Magnetic Button Effect =====
document.addEventListener('DOMContentLoaded', function() {
    const magneticButtons = document.querySelectorAll('.btn-primary, .btn-outline');
    
    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) translateY(-3px)`;
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
});

// ===== Toast Notification Styles (injected) =====
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .toast-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: var(--bg-card);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .toast-notification.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        
        .toast-notification.error {
            border-color: #dc3545;
        }
        
        .toast-notification.error i {
            color: #dc3545;
        }
        
        .toast-notification.success {
            border-color: var(--gold);
        }
        
        .toast-notification.success i {
            color: var(--gold);
        }
    `;
    document.head.appendChild(style);
})();
