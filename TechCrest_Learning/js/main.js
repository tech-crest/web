/* ============================================
   TechCrest Learning — Main JavaScript
   main.js
   ============================================ */

'use strict';

/* ==========================================
   1. NAVBAR — Scroll + Mobile Hamburger
   ========================================== */

const navbar   = document.querySelector('.navbar');
const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.querySelector('.nav-mobile-menu');
const mobileSubmenuToggle = document.querySelector('.mobile-submenu-toggle');
const mobileSubmenu = document.querySelector('.mobile-submenu');

/* Sticky navbar on scroll */
function handleNavbarScroll() {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll(); // run once on load

/* Hamburger toggle */
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    document.body.classList.toggle('modal-open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });
}

/* Mobile submenu toggle (Courses dropdown) */
if (mobileSubmenuToggle && mobileSubmenu) {
  mobileSubmenuToggle.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = mobileSubmenu.classList.toggle('open');
    mobileSubmenuToggle.querySelector('.chevron')
      ?.style.setProperty('transform', isOpen ? 'rotate(180deg)' : 'rotate(0deg)');
  });
}

/* Close mobile menu when a link is clicked */
document.querySelectorAll('.mobile-nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    document.body.classList.remove('modal-open');
  });
});

/* Close mobile menu on outside click */
document.addEventListener('click', (e) => {
  if (
    mobileMenu?.classList.contains('open') &&
    !mobileMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.classList.remove('modal-open');
  }
});

/* Active nav link highlight based on current page */
function setActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
    const href = link.getAttribute('href')?.split('/').pop();
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

setActiveNavLink();


/* ==========================================
   2. SCROLL REVEAL — Intersection Observer
   ========================================== */

function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealEls.forEach(el => observer.observe(el));
}

initScrollReveal();


/* ==========================================
   3. COUNTER ANIMATION — Stats numbers
   ========================================== */

function animateCounter(el) {
  const target    = parseFloat(el.dataset.target || el.innerText.replace(/[^0-9.]/g, ''));
  const suffix    = el.dataset.suffix || '';
  const prefix    = el.dataset.prefix || '';
  const duration  = parseInt(el.dataset.duration || '2000');
  const decimals  = (target % 1 !== 0) ? 1 : 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;

    el.textContent = prefix + current.toFixed(decimals) + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const counterEls = document.querySelectorAll('.counter');
  if (!counterEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counterEls.forEach(el => observer.observe(el));
}

initCounters();


/* ==========================================
   4. PROGRESS BARS — Hero card animation
   ========================================== */

function initProgressBars() {
  const bars = document.querySelectorAll('.progress-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const width = bar.dataset.width || '0';
          // Small delay for visual polish
          setTimeout(() => {
            bar.style.width = width + '%';
          }, 300);
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach(bar => {
    bar.style.width = '0%'; // reset first
    observer.observe(bar);
  });
}

initProgressBars();


/* ==========================================
   5. SMOOTH SCROLL — Anchor links
   ========================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();

    const navHeight = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height')
    ) || 72;

    const top = targetEl.getBoundingClientRect().top
              + window.scrollY
              - navHeight
              - 16;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ==========================================
   6. SYLLABUS ACCORDION
   ========================================== */

function initAccordion() {
  const accordionItems = document.querySelectorAll('.syllabus-item');
  if (!accordionItems.length) return;

  accordionItems.forEach(item => {
    const header  = item.querySelector('.syllabus-item-header');
    const content = item.querySelector('.syllabus-item-content');
    const icon    = item.querySelector('.accordion-icon');

    if (!header || !content) return;

    // Set initial max-height for open items
    if (item.classList.contains('open')) {
      content.style.maxHeight = content.scrollHeight + 'px';
    }

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all items
      accordionItems.forEach(i => {
        i.classList.remove('open');
        const c = i.querySelector('.syllabus-item-content');
        const ico = i.querySelector('.accordion-icon');
        if (c) c.style.maxHeight = '0';
        if (ico) ico.style.transform = 'rotate(0deg)';
      });

      // Open clicked item (if it was closed)
      if (!isOpen) {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        if (icon) icon.style.transform = 'rotate(45deg)';
      }
    });
  });
}

initAccordion();


/* ==========================================
   7. TABS — Course page tabs
   ========================================== */

function initTabs() {
  const tabContainers = document.querySelectorAll('.tabs-container');
  if (!tabContainers.length) return;

  tabContainers.forEach(container => {
    const tabs    = container.querySelectorAll('.tab-btn');
    const panels  = container.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        // Deactivate all
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => {
          p.classList.remove('active');
          p.style.opacity = '0';
        });

        // Activate clicked
        tab.classList.add('active');
        const activePanel = container.querySelector(`[data-panel="${target}"]`);
        if (activePanel) {
          activePanel.classList.add('active');
          requestAnimationFrame(() => {
            activePanel.style.opacity = '1';
          });
        }
      });
    });
  });
}

initTabs();


/* ==========================================
   8. TOOLTIP — Simple hover tooltips
   ========================================== */

function initTooltips() {
  const tooltipEls = document.querySelectorAll('[data-tooltip]');
  if (!tooltipEls.length) return;

  tooltipEls.forEach(el => {
    const tip = document.createElement('div');
    tip.className = 'tooltip';
    tip.textContent = el.dataset.tooltip;
    document.body.appendChild(tip);

    el.addEventListener('mouseenter', (e) => {
      const rect = el.getBoundingClientRect();
      tip.style.cssText = `
        position: fixed;
        background: var(--bg-elevated);
        color: var(--text-primary);
        border: 1px solid var(--border);
        padding: 5px 10px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-family: var(--font-body);
        white-space: nowrap;
        z-index: 9999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s ease;
        top: ${rect.top - 36}px;
        left: ${rect.left + rect.width / 2}px;
        transform: translateX(-50%);
        box-shadow: var(--shadow-sm);
      `;
      requestAnimationFrame(() => tip.style.opacity = '1');
    });

    el.addEventListener('mouseleave', () => {
      tip.style.opacity = '0';
    });
  });
}

initTooltips();


/* ==========================================
   9. BACK TO TOP BUTTON
   ========================================== */

function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  `;
  btn.setAttribute('aria-label', 'Back to top');
  btn.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--primary);
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-blue);
    z-index: 999;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    pointer-events: none;
  `;

  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    btn.style.opacity  = show ? '1' : '0';
    btn.style.transform = show ? 'translateY(0)' : 'translateY(12px)';
    btn.style.pointerEvents = show ? 'all' : 'none';
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

initBackToTop();


/* ==========================================
   10. COURSE CARD — "View Details" hover link
   ========================================== */

function initCourseCardLinks() {
  document.querySelectorAll('.course-card[data-href]').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if enroll button was clicked
      if (e.target.closest('.btn-enroll')) return;
      window.location.href = card.dataset.href;
    });
  });
}

initCourseCardLinks();


/* ==========================================
   11. CURRENT YEAR — Footer copyright
   ========================================== */

const yearEl = document.getElementById('current-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ==========================================
   12. PAGE LOAD ANIMATION
   ========================================== */

window.addEventListener('load', () => {
  document.body.classList.add('page-loaded');

  // Animate hero content immediately on load
  document.querySelectorAll('.hero-content > *').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.1}s,
                           transform 0.6s ease ${i * 0.1}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });
});


/* ==========================================
   13. UTILITY FUNCTIONS (exported to window)
   ========================================== */

// Debounce
window.tcDebounce = function(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

// Format phone number display
window.tcFormatPhone = function(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5)  return digits;
  if (digits.length <= 10) return digits.slice(0,5) + '-' + digits.slice(5);
  return digits.slice(0,5) + '-' + digits.slice(5,10);
};

// Show toast notification
window.tcToast = function(message, type = 'info', duration = 3500) {
  const existing = document.querySelector('.tc-toast');
  if (existing) existing.remove();

  const colors = {
    info:    { bg: 'var(--primary-glow)',          border: 'var(--border-bright)', color: 'var(--primary)' },
    success: { bg: 'rgba(0,200,150,0.12)',          border: 'rgba(0,200,150,0.25)', color: 'var(--secondary)' },
    error:   { bg: 'rgba(255,77,77,0.12)',          border: 'rgba(255,77,77,0.25)', color: '#ff6b6b' },
  };

  const c = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.className = 'tc-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 5rem;
    right: 2rem;
    background: ${c.bg};
    border: 1px solid ${c.border};
    color: ${c.color};
    padding: 0.75rem 1.25rem;
    border-radius: 10px;
    font-size: 0.88rem;
    font-family: var(--font-body);
    font-weight: 500;
    z-index: 9999;
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(12px);
    opacity: 0;
    transform: translateY(8px) translateX(0);
    transition: opacity 0.3s ease, transform 0.3s ease;
    max-width: 300px;
    line-height: 1.5;
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 350);
  }, duration);
};

// Validate email
window.tcValidateEmail = function(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validate phone (10 digits)
window.tcValidatePhone = function(phone) {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
};