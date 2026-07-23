/* ============================================================
   SKI PROTECT - Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCotizador();
    initCounters();
    initTestimoniosCarousel();
    initFAQ();
    initScrollReveal();
    initLanguageSwitcher();
    initSmoothScroll();
    initContactForm();
});

/* ─── Navigation ─── */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile toggle
    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const spans = mobileToggle.querySelectorAll('span');
        if (navLinks.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            const spans = mobileToggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

/* ─── Cotizador Multi-step ─── */
function initCotizador() {
    const form = document.getElementById('cotizadorForm');
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = document.querySelectorAll('.progress-line');
    const destinoSelect = document.getElementById('destino');
    const centroSelect = document.getElementById('centroSki');
    const fechaInicio = document.getElementById('fechaInicio');
    const fechaTermino = document.getElementById('fechaTermino');

    // Centros de ski por región
    const centrosPorRegion = {
        'metropolitana': ['Valle Nevado', 'La Parva', 'El Colorado', 'Farellones'],
        'valparaiso': ['Portillo'],
        'nuble': ['Nevados de Chillán', 'Volcán Chillán'],
        'araucania': ['Corralco', 'Pucón']
    };

    // Set minimum dates
    const today = new Date().toISOString().split('T')[0];
    if (fechaInicio) fechaInicio.setAttribute('min', today);
    if (fechaTermino) fechaTermino.setAttribute('min', today);

    // Update centros when region changes
    destinoSelect.addEventListener('change', () => {
        const region = destinoSelect.value;
        centroSelect.innerHTML = '<option value="">Selecciona un centro de ski</option>';
        centroSelect.disabled = !region;

        if (region && centrosPorRegion[region]) {
            centrosPorRegion[region].forEach(centro => {
                const option = document.createElement('option');
                option.value = centro.toLowerCase().replace(/\s+/g, '-');
                option.textContent = centro;
                centroSelect.appendChild(option);
            });
        }
    });

    // Date validation
    if (fechaTermino) {
        fechaInicio.addEventListener('change', () => {
            fechaTermino.setAttribute('min', fechaInicio.value);
            if (fechaTermino.value && fechaTermino.value < fechaInicio.value) {
                fechaTermino.value = '';
            }
        });
    }

    // Navigation
    document.querySelectorAll('.form-next').forEach(btn => {
        btn.addEventListener('click', () => {
            const nextStep = parseInt(btn.dataset.next);
            const currentStepEl = document.getElementById('step' + (nextStep - 1));

            // Validate current step
            if (!validateStep(nextStep - 1)) return;

            goToStep(nextStep);
        });
    });

    document.querySelectorAll('.form-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = parseInt(btn.dataset.prev);
            goToStep(prevStep);
        });
    });

    // "Ver Planes" button
    const verPlanes = document.getElementById('verPlanes');
    if (verPlanes) {
        verPlanes.addEventListener('click', () => {
            if (!validateStep(3)) return;
            goToStep(4);
            // Animate plan cards
            document.querySelectorAll('.plan-card').forEach((card, i) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, i * 150);
            });
        });
    }

    function goToStep(stepNum) {
        steps.forEach(s => s.classList.remove('active'));
        document.getElementById('step' + stepNum).classList.add('active');

        // Update progress
        progressSteps.forEach(ps => {
            const s = parseInt(ps.dataset.step);
            ps.classList.remove('active', 'completed');
            if (s === stepNum) ps.classList.add('active');
            if (s < stepNum) ps.classList.add('completed');
        });

        progressLines.forEach((line, i) => {
            line.classList.toggle('completed', i < stepNum - 1);
        });

        // Scroll to top of card
        document.querySelector('.cotizador-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function validateStep(stepNum) {
        const stepEl = document.getElementById('step' + stepNum);
        if (!stepEl) return true;

        const required = stepEl.querySelectorAll('[required]');
        let valid = true;

        required.forEach(field => {
            if (!field.value) {
                field.style.borderColor = '#E74C3C';
                field.style.boxShadow = '0 0 0 3px rgba(231,76,60,0.1)';
                valid = false;

                // Remove error styling after input
                field.addEventListener('input', function handler() {
                    field.style.borderColor = '';
                    field.style.boxShadow = '';
                    field.removeEventListener('input', handler);
                }, { once: true });
            }
        });

        // Extra validation for dates
        if (stepNum === 2) {
            const inicio = document.getElementById('fechaInicio');
            const termino = document.getElementById('fechaTermino');
            if (inicio && termino && inicio.value && termino.value && termino.value < inicio.value) {
                termino.style.borderColor = '#E74C3C';
                valid = false;
            }
        }

        if (!valid) {
            // Scroll to first invalid field
            const firstInvalid = stepEl.querySelector('[required]:invalid');
            if (firstInvalid) firstInvalid.focus();
        }

        return valid;
    }

    // Plan purchase buttons
    document.querySelectorAll('.plan-card .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const planName = btn.closest('.plan-card').querySelector('h4').textContent;
            const price = btn.closest('.plan-card').querySelector('.price-amount').textContent;

            // Show a nice alert
            showToast(`¡Excelente elección! Redirigiendo a la pasarela de pago para ${planName} (${price})...`);

            // Here you would redirect to payment gateway
            // window.location.href = '/checkout?plan=' + encodeURIComponent(planName);
        });
    });
}

/* ─── Animated Counters ─── */
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    let counted = false;

    function animateCounters() {
        if (counted) return;

        const whySection = document.querySelector('.why-section');
        if (!whySection) return;

        const rect = whySection.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            counted = true;

            counters.forEach(counter => {
                const target = parseInt(counter.dataset.target);
                const duration = 2000;
                const start = performance.now();

                function update(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(target * eased);
                    counter.textContent = current.toLocaleString();

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        counter.textContent = target.toLocaleString();
                    }
                }

                requestAnimationFrame(update);
            });
        }
    }

    window.addEventListener('scroll', animateCounters);
    animateCounters(); // Check on load
}

/* ─── Testimonios Carousel ─── */
function initTestimoniosCarousel() {
    const track = document.getElementById('testimoniosTrack');
    const prevBtn = document.getElementById('testPrev');
    const nextBtn = document.getElementById('testNext');
    const dotsContainer = document.getElementById('testDots');

    if (!track) return;

    const cards = track.querySelectorAll('.testimonio-card');
    const totalCards = cards.length;
    let currentIndex = 0;

    // Create dots
    for (let i = 0; i < totalCards; i++) {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    const dots = dotsContainer.querySelectorAll('.carousel-dot');

    function goToSlide(index) {
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        dots.forEach((d, i) => {
            d.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        goToSlide((currentIndex + 1) % totalCards);
    }

    function prevSlide() {
        goToSlide((currentIndex - 1 + totalCards) % totalCards);
    }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Auto-rotate every 6 seconds
    setInterval(nextSlide, 6000);

    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    });
}

/* ─── FAQ Accordion ─── */
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Open clicked one (if wasn't already open)
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

/* ─── Scroll Reveal ─── */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.beneficio-card, .why-card, .centro-card, .proceso-step, .blog-card, .faq-item'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, i * 50);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
}

/* ─── Language Switcher ─── */
function initLanguageSwitcher() {
    const langBtns = document.querySelectorAll('.lang-btn');
    const translations = {
        es: {
            'hero-badge': 'Líder en planes de asistencia de viaje',
            'hero-title': 'Protege tu aventura en la nieve',
            'hero-subtitle': 'Compra tu plan de asistencia de viaje en menos de un minuto y disfruta tu viaje con tranquilidad.',
            'cotizar-badge': 'Cotizador',
            'cotizar-title': 'Cotiza tu plan en segundos',
            'cotizar-subtitle': 'Completa los datos y obtén los mejores planes para tu viaje a la nieve',
            'coberturas-badge': 'Coberturas',
            'coberturas-title': 'Todo lo que incluye tu plan',
            'coberturas-subtitle': 'Protección completa para que solo te preocupes de disfrutar'
        },
        en: {
            'hero-badge': 'Leader in travel assistance plans',
            'hero-title': 'Protect your snow adventure',
            'hero-subtitle': 'Get your travel assistance plan in less than a minute and enjoy your trip with peace of mind.',
            'cotizar-badge': 'Quote',
            'cotizar-title': 'Get your plan in seconds',
            'cotizar-subtitle': 'Fill in your details and get the best plans for your snow trip',
            'coberturas-badge': 'Coverage',
            'coberturas-title': 'Everything included in your plan',
            'coberturas-subtitle': 'Complete protection so you only worry about enjoying'
        },
        pt: {
            'hero-badge': 'Líder em planos de assistência de viagem',
            'hero-title': 'Proteja sua aventura na neve',
            'hero-subtitle': 'Compre seu plano de assistência de viagem em menos de um minuto e aproveite sua viagem com tranquilidade.',
            'cotizar-badge': 'Cotação',
            'cotizar-title': 'Faça sua cotação em segundos',
            'cotizar-subtitle': 'Preencha os dados e obtenha os melhores planos para sua viagem à neve',
            'coberturas-badge': 'Coberturas',
            'coberturas-title': 'Tudo que seu plano inclui',
            'coberturas-subtitle': 'Proteção completa para você se preocupar apenas em aproveitar'
        }
    };

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;

            // Update active state
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Translate data-translate elements
            if (translations[lang]) {
                document.querySelectorAll('[data-translate]').forEach(el => {
                    const key = el.dataset.translate;
                    if (translations[lang][key]) {
                        el.textContent = translations[lang][key];
                    }
                });
            }

            // Update HTML lang attribute
            document.documentElement.lang = lang;
        });
    });
}

/* ─── Smooth Scroll ─── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ─── Contact Form ─── */
function initContactForm() {
    const contactoForm = document.getElementById('contactoForm');
    if (!contactoForm) return;

    contactoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = contactoForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        // Simulate form submission
        setTimeout(() => {
            showToast('¡Mensaje enviado con éxito! Te contactaremos pronto.');
            contactoForm.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 1500);
    });
}

/* ─── Toast Notification ─── */
function showToast(message) {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;

    // Add toast styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            top: 100px;
            right: 30px;
            z-index: 9999;
            background: var(--navy-dark);
            color: var(--white);
            padding: 16px 24px;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-xl);
            animation: toastIn 0.4s ease, toastOut 0.4s ease 3.6s forwards;
            max-width: 380px;
        }
        .toast-content {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.9rem;
        }
        .toast-content i {
            font-size: 1.2rem;
            color: var(--accent-green);
            flex-shrink: 0;
        }
        @keyframes toastIn {
            from { transform: translateX(120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(120%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.remove();
        style.remove();
    }, 4000);
}

/* ─── Global: selectCentro for centro cards ─── */
function selectCentro(nombre) {
    const destinoSelect = document.getElementById('destino');
    const centroSelect = document.getElementById('centroSki');

    if (!destinoSelect || !centroSelect) return;

    // Map centro names to regions
    const centroRegionMap = {
        'Valle Nevado': 'metropolitana',
        'La Parva': 'metropolitana',
        'El Colorado': 'metropolitana',
        'Portillo': 'valparaiso',
        'Nevados de Chillán': 'nuble'
    };

    const region = centroRegionMap[nombre];
    if (region) {
        destinoSelect.value = region;
        destinoSelect.dispatchEvent(new Event('change'));

        // Wait for options to populate
        setTimeout(() => {
            const options = centroSelect.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].textContent === nombre) {
                    centroSelect.value = options[i].value;
                    break;
                }
            }
        }, 200);

        // Go to step 1
        const cotizadorSection = document.getElementById('cotizar');
        if (cotizadorSection) {
            cotizadorSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Reset to step 1
        document.querySelectorAll('.form-next').forEach(btn => {
            if (btn.dataset.next === '2') btn.click();
        });
    }
}
