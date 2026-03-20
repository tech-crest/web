/* ============================================
   TechCrest Learning — Course Page Scripts
   courses.js — FIXED VERSION
   ============================================ */

'use strict';

/* ==========================================
   1. TABS — Complete rewrite, no animation
   ========================================== */

function initCourseTabs() {
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  if (!tabBtns.length) return;

  /* Force-show the active panel on load */
  tabPanels.forEach(panel => {
    if (panel.classList.contains('active')) {
      panel.style.cssText = 'display:block !important; opacity:1 !important;';
    } else {
      panel.style.cssText = 'display:none !important;';
    }
  });

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;

      /* Deactivate all tabs */
      tabBtns.forEach(b => b.classList.remove('active'));

      /* Hide all panels */
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        panel.style.cssText = 'display:none !important;';
      });

      /* Activate clicked tab */
      btn.classList.add('active');

      /* Show target panel */
      const target = document.querySelector(
        `.tab-panel[data-panel="${targetId}"]`
      );
      if (target) {
        target.classList.add('active');
        target.style.cssText = 'display:block !important; opacity:1 !important;';
      }
    });
  });
}

/* ==========================================
   2. SYLLABUS ACCORDION
   ========================================== */

function initSyllabusAccordion() {
  const syllabusItems = document.querySelectorAll('.syllabus-item');
  if (!syllabusItems.length) return;

  syllabusItems.forEach((item, index) => {
    const header  = item.querySelector('.syllabus-item-header');
    const content = item.querySelector('.syllabus-item-content');
    const icon    = item.querySelector('.accordion-icon');
    const weekNum = item.querySelector('.week-number');

    if (!header || !content) return;

    /* Set initial styles directly */
    content.style.overflow   = 'hidden';
    content.style.transition = 'max-height 0.38s ease';

    if (index === 0) {
      /* Open first item */
      item.classList.add('open');
      content.style.maxHeight = content.scrollHeight + 'px';
      if (icon)    icon.style.transform    = 'rotate(45deg)';
      if (weekNum) weekNum.style.background = 'var(--primary)';
      if (weekNum) weekNum.style.color      = '#fff';
    } else {
      content.style.maxHeight = '0px';
    }

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      /* Close all */
      syllabusItems.forEach(i => {
        i.classList.remove('open');
        const c   = i.querySelector('.syllabus-item-content');
        const ico = i.querySelector('.accordion-icon');
        const wn  = i.querySelector('.week-number');
        if (c)   c.style.maxHeight   = '0px';
        if (ico) ico.style.transform = 'rotate(0deg)';
        if (wn) {
          wn.style.background = '';
          wn.style.color      = '';
        }
      });

      /* Open clicked if it was closed */
      if (!isOpen) {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        if (icon)    icon.style.transform    = 'rotate(45deg)';
        if (weekNum) weekNum.style.background = 'var(--primary)';
        if (weekNum) weekNum.style.color      = '#fff';
      }
    });
  });
}

/* ==========================================
   3. STICKY ENROLL SIDEBAR PULSE
   ========================================== */

function initStickyEnrollSidebar() {
  const enrollBtn = document.querySelector('.enroll-btn-main');
  if (!enrollBtn) return;

  setTimeout(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse-enroll {
        0%, 100% { box-shadow: 0 10px 36px rgba(10,132,255,0.4); }
        50%       { box-shadow: 0 10px 60px rgba(10,132,255,0.7),
                                0 0 0 6px rgba(10,132,255,0.15); }
      }
    `;
    document.head.appendChild(style);
    enrollBtn.style.animation = 'pulse-enroll 1s ease 3';
    setTimeout(() => { enrollBtn.style.animation = ''; }, 3200);
  }, 4000);
}

/* ==========================================
   4. SKILL TAGS ANIMATION
   ========================================== */

function initSkillTagsAnimation() {
  const tags = document.querySelectorAll('.skill-tag');
  if (!tags.length) return;

  tags.forEach((tag, i) => {
    tag.style.opacity    = '0';
    tag.style.transform  = 'translateY(10px)';
    tag.style.transition = `opacity 0.4s ease ${0.1 + i * 0.07}s,
                             transform 0.4s ease ${0.1 + i * 0.07}s`;
    setTimeout(() => {
      tag.style.opacity   = '1';
      tag.style.transform = 'translateY(0)';
    }, 300);
  });
}

/* ==========================================
   5. READING PROGRESS BAR
   ========================================== */

function initReadingProgress() {
  const isCourse = document.querySelector('.course-page-layout');
  if (!isCourse) return;

  const bar = document.createElement('div');
  bar.style.cssText = `
    position:fixed; top:0; left:0; height:3px; width:0%;
    background:var(--grad-primary); z-index:1001;
    transition:width 0.1s linear; pointer-events:none;
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/* ==========================================
   6. COPY EMAIL
   ========================================== */

function initCopyEmail() {
  document.querySelectorAll('[data-copy]').forEach(el => {
    el.addEventListener('click', () => {
      navigator.clipboard?.writeText(el.dataset.copy).then(() => {
        window.tcToast?.('Copied!', 'success', 2000);
      });
    });
  });
}

/* ==========================================
   7. RELATED COURSE CARD CLICKS
   ========================================== */

function initRelatedCards() {
  document.querySelectorAll('.course-card[data-href]').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.btn-enroll')) return;
      window.location.href = card.dataset.href;
    });
  });
}

/* ==========================================
   8. NO-OP — keeps compatibility
   ========================================== */

function injectCoursePageStyles() {
  /* Styles now live in css/cards.css — nothing to inject */
}

/* ==========================================
   INIT ALL
   ========================================== */

/* Run after DOM is ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAll);
} else {
  runAll();
}

function runAll() {
  initCourseTabs();
  initSyllabusAccordion();
  initStickyEnrollSidebar();
  initSkillTagsAnimation();
  initReadingProgress();
  initCopyEmail();
  initRelatedCards();
}