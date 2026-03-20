/* ============================================
   TechCrest Learning — Enrollment Logic
   enrollment.js
   ============================================ */

'use strict';

/* ==========================================
   CONFIGURATION
   — Edit WHATSAPP_NUMBER to your number
   — Edit courses to match your offerings
   ========================================== */

const ENROLLMENT_CONFIG = {

  // Your WhatsApp number (country code + number, no + or spaces)
  WHATSAPP_NUMBER: '919897654321',

  // Redirect delay after form submit (milliseconds)
  REDIRECT_DELAY: 3000,

  // Course data — name, icon, badge label
  courses: {
    embedded: {
      name:    'Embedded Systems',
      icon:    '🔌',
      badge:   'Hardware',
      color:   'badge-blue'
    },
    iot: {
      name:    'Internet of Things (IoT)',
      icon:    '📡',
      badge:   'Connectivity',
      color:   'badge-teal'
    },
    pcb: {
      name:    'PCB Design',
      icon:    '🔧',
      badge:   'Electronics',
      color:   'badge-orange'
    },
    dsa: {
      name:    'Data Structures & Algorithms',
      icon:    '🧠',
      badge:   'Programming',
      color:   'badge-blue'
    },
    mern: {
      name:    'MERN Stack Development',
      icon:    '💻',
      badge:   'Web Dev',
      color:   'badge-teal'
    }
  }
};


/* ==========================================
   STATE
   ========================================== */

let currentCourseKey = null;   // which course triggered the modal
let countdownTimer   = null;   // reference to countdown interval


/* ==========================================
   DOM REFERENCES
   ========================================== */

const modalOverlay   = document.getElementById('enrollModal');
const modalBox       = modalOverlay?.querySelector('.modal-box');
const modalClose     = document.getElementById('modalClose');
const enrollForm     = document.getElementById('enrollmentForm');
const formView       = document.getElementById('formView');
const successView    = document.getElementById('successView');

// Form fields
const fieldName      = document.getElementById('enrollName');
const fieldEmail     = document.getElementById('enrollEmail');
const fieldPhone     = document.getElementById('enrollPhone');

// Display elements
const modalCourseIcon  = document.getElementById('modalCourseIcon');
const modalCourseName  = document.getElementById('modalCourseName');
const courseDisplay    = document.getElementById('courseDisplayField');
const successCourseName = document.getElementById('successCourseName');
const successStudentName = document.getElementById('successStudentName');
const countdownEl      = document.getElementById('countdownNumber');
const manualWABtn      = document.getElementById('manualWhatsAppBtn');
const submitBtn        = document.getElementById('submitEnrollBtn');


/* ==========================================
   1. OPEN MODAL
   ========================================== */

/**
 * Opens the enrollment modal for a specific course.
 * Called by every "Enroll Now" button with data-course attribute.
 *
 * @param {string} courseKey - matches a key in ENROLLMENT_CONFIG.courses
 */
function openEnrollModal(courseKey) {
  const course = ENROLLMENT_CONFIG.courses[courseKey];
  if (!course) {
    console.warn(`TechCrest: Unknown course key "${courseKey}"`);
    return;
  }

  currentCourseKey = courseKey;

  // Populate modal header
  if (modalCourseIcon)  modalCourseIcon.textContent  = course.icon;
  if (modalCourseName)  modalCourseName.textContent  = course.name;

  // Populate the auto-filled course display field
  if (courseDisplay) {
    courseDisplay.textContent = `${course.icon}  ${course.name}`;
  }

  // Reset form to clean state
  resetModal();

  // Show modal
  modalOverlay?.classList.add('active');
  document.body.classList.add('modal-open');

  // Focus first input after animation
  setTimeout(() => fieldName?.focus(), 380);
}

// Expose globally so HTML onclick attributes can call it
window.openEnrollModal = openEnrollModal;


/* ==========================================
   2. CLOSE MODAL
   ========================================== */

function closeEnrollModal() {
  modalOverlay?.classList.remove('active');
  document.body.classList.remove('modal-open');

  // Clear countdown if running
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }

  // Reset after transition ends
  setTimeout(resetModal, 350);
}

// Close button
modalClose?.addEventListener('click', closeEnrollModal);

// Click outside modal box
modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay ||
      e.target.classList.contains('modal-backdrop')) {
    closeEnrollModal();
  }
});

// ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay?.classList.contains('active')) {
    closeEnrollModal();
  }
});


/* ==========================================
   3. RESET MODAL
   ========================================== */

function resetModal() {
  // Reset form fields
  enrollForm?.reset();

  // Clear validation states
  clearAllErrors();

  // Show form view, hide success view
  if (formView)    formView.style.display    = 'flex';
  if (successView) successView.style.display = 'none';
  successView?.classList.remove('visible');

  // Reset submit button
  if (submitBtn) {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }

  // Reset step dots
  updateStepDots(1);
}


/* ==========================================
   4. FORM VALIDATION
   ========================================== */

function validateField(input, errorElId, validatorFn, errorMsg) {
  const errorEl = document.getElementById(errorElId);
  const value   = input.value.trim();

  if (!value || !validatorFn(value)) {
    // Show error
    input.classList.add('input-error');
    input.classList.remove('input-success');
    if (errorEl) {
      errorEl.textContent = errorMsg;
      errorEl.classList.add('visible');
    }
    return false;
  } else {
    // Show success
    input.classList.remove('input-error');
    input.classList.add('input-success');
    if (errorEl) errorEl.classList.remove('visible');
    return true;
  }
}

function clearAllErrors() {
  document.querySelectorAll('.field-error').forEach(el => {
    el.classList.remove('visible');
  });
  document.querySelectorAll('.enrollment-form input').forEach(el => {
    el.classList.remove('input-error', 'input-success');
  });
}

// Live validation on blur
fieldName?.addEventListener('blur', () => {
  validateField(
    fieldName,
    'nameError',
    val => val.length >= 2,
    '⚠ Please enter your full name (at least 2 characters)'
  );
});

fieldEmail?.addEventListener('blur', () => {
  validateField(
    fieldEmail,
    'emailError',
    val => window.tcValidateEmail(val),
    '⚠ Please enter a valid email address'
  );
});

fieldPhone?.addEventListener('blur', () => {
  validateField(
    fieldPhone,
    'phoneError',
    val => window.tcValidatePhone(val),
    '⚠ Please enter a valid 10-digit Indian mobile number'
  );
});

// Live phone formatting while typing
fieldPhone?.addEventListener('input', () => {
  const digits = fieldPhone.value.replace(/\D/g, '').slice(0, 10);
  fieldPhone.value = digits;
});


/* ==========================================
   5. BUILD WHATSAPP MESSAGE
   ========================================== */

/**
 * Builds the pre-filled WhatsApp message URL.
 *
 * Message format:
 * Hello TechCrest Learning! 👋
 * I want to enroll in [Course Name].
 *
 * 📋 My Details:
 * • Name  : [Student Name]
 * • Email : [Email]
 * • Phone : [Phone]
 *
 * Please guide me on the next steps. 🙏
 */
function buildWhatsAppURL(studentName, email, phone, courseName) {
  const message = [
    `Hello TechCrest Learning! 👋`,
    ``,
    `I want to enroll in *${courseName}*.`,
    ``,
    `📋 My Details:`,
    `• Name  : ${studentName}`,
    `• Email : ${email}`,
    `• Phone : ${phone}`,
    ``,
    `Please guide me on the next steps. 🙏`
  ].join('\n');

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${ENROLLMENT_CONFIG.WHATSAPP_NUMBER}?text=${encoded}`;
}


/* ==========================================
   6. FORM SUBMIT — Main enrollment flow
   ========================================== */

enrollForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  // Run all validations
  const nameValid  = validateField(
    fieldName, 'nameError',
    val => val.length >= 2,
    '⚠ Please enter your full name (at least 2 characters)'
  );

  const emailValid = validateField(
    fieldEmail, 'emailError',
    val => window.tcValidateEmail(val),
    '⚠ Please enter a valid email address'
  );

  const phoneValid = validateField(
    fieldPhone, 'phoneError',
    val => window.tcValidatePhone(val),
    '⚠ Please enter a valid 10-digit Indian mobile number'
  );

  // Stop if any validation failed
  if (!nameValid || !emailValid || !phoneValid) {
    // Shake the modal box for visual feedback
    shakeModal();
    return;
  }

  // Get values
  const studentName = fieldName.value.trim();
  const email       = fieldEmail.value.trim().toLowerCase();
  const phone       = fieldPhone.value.trim();
  const course      = ENROLLMENT_CONFIG.courses[currentCourseKey];

  // Show loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  updateStepDots(2);

  // Build WhatsApp URL
  const waURL = buildWhatsAppURL(studentName, email, phone, course.name);

  // Store manual URL on button (fallback)
  if (manualWABtn) manualWABtn.href = waURL;

  // Simulate brief processing delay then show success
  setTimeout(() => {
    showSuccessScreen(studentName, course.name, waURL);
  }, 900);
});


/* ==========================================
   7. SUCCESS SCREEN + COUNTDOWN REDIRECT
   ========================================== */

function showSuccessScreen(studentName, courseName, waURL) {
  // Hide form, show success
  if (formView) {
    formView.style.opacity = '0';
    formView.style.transform = 'translateY(-12px)';
    formView.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

    setTimeout(() => {
      formView.style.display = 'none';

      if (successView) {
        successView.style.display = 'flex';
        successView.classList.add('visible');
        successView.style.opacity = '0';
        successView.style.transform = 'translateY(12px)';
        successView.style.transition = 'opacity 0.35s ease, transform 0.35s ease';

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            successView.style.opacity = '1';
            successView.style.transform = 'translateY(0)';
          });
        });
      }
    }, 260);
  }

  // Fill in success screen details
  if (successStudentName) successStudentName.textContent = studentName.split(' ')[0];
  if (successCourseName)  successCourseName.textContent  = courseName;

  // Update step dots
  updateStepDots(3);

  // Start countdown
  startCountdown(waURL);
}

function startCountdown(waURL) {
  let seconds = Math.round(ENROLLMENT_CONFIG.REDIRECT_DELAY / 1000);
  if (countdownEl) countdownEl.textContent = seconds;

  countdownTimer = setInterval(() => {
    seconds--;
    if (countdownEl) countdownEl.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;

      // Redirect to WhatsApp
      window.open(waURL, '_blank');

      // Close modal after redirect
      setTimeout(closeEnrollModal, 500);
    }
  }, 1000);
}


/* ==========================================
   8. STEP DOTS UPDATE
   ========================================== */

function updateStepDots(activeStep) {
  const dots = document.querySelectorAll('.modal-step-dot');
  dots.forEach((dot, index) => {
    dot.classList.remove('active', 'done');
    if (index + 1 === activeStep) {
      dot.classList.add('active');
    } else if (index + 1 < activeStep) {
      dot.classList.add('done');
    }
  });
}


/* ==========================================
   9. SHAKE ANIMATION (validation fail)
   ========================================== */

function shakeModal() {
  if (!modalBox) return;
  modalBox.style.animation = 'none';
  modalBox.offsetHeight; // reflow trick

  modalBox.style.animation = 'shake 0.4s ease';

  // Inject shake keyframes if not already present
  if (!document.getElementById('shakeKeyframes')) {
    const style = document.createElement('style');
    style.id = 'shakeKeyframes';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%       { transform: translateX(-8px); }
        40%       { transform: translateX(8px); }
        60%       { transform: translateX(-5px); }
        80%       { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    modalBox.style.animation = '';
  }, 420);
}


/* ==========================================
   10. ALL "ENROLL NOW" BUTTONS
       Auto-bind via data-course attribute
   ========================================== */

/**
 * Any element with class "btn-enroll" and data-course="embedded"
 * (or any other course key) will automatically open the modal.
 *
 * HTML usage:
 *   <button class="btn-enroll" data-course="embedded">Enroll Now</button>
 *   <button class="btn-enroll" data-course="iot">Enroll Now</button>
 *   etc.
 */
function bindEnrollButtons() {
  document.querySelectorAll('[data-course]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const courseKey = btn.dataset.course;
      openEnrollModal(courseKey);
    });
  });
}

bindEnrollButtons();


/* ==========================================
   11. RE-BIND after dynamic content
       (useful if cards are loaded later)
   ========================================== */

window.tcRebindEnrollButtons = bindEnrollButtons;
