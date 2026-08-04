// ---------- Tab switching ----------
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

function showForm(target) {
  const isLogin = target === 'login';
  tabLogin.classList.toggle('active', isLogin);
  tabSignup.classList.toggle('active', !isLogin);
  tabLogin.setAttribute('aria-selected', isLogin);
  tabSignup.setAttribute('aria-selected', !isLogin);
  loginForm.classList.toggle('active', isLogin);
  signupForm.classList.toggle('active', !isLogin);
}

tabLogin.addEventListener('click', () => showForm('login'));
tabSignup.addEventListener('click', () => showForm('signup'));

// ---------- Show/hide password ----------
document.querySelectorAll('.toggle-visibility').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? 'Hide' : 'Show';
  });
});

// ---------- Validation helpers ----------
// Standard, widely-used email pattern. Not RFC 5322 complete,
// but covers the vast majority of real-world addresses.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setFieldState(fieldEl, errorEl, message) {
  if (message) {
    fieldEl.classList.add('invalid');
    fieldEl.classList.remove('valid');
    errorEl.textContent = message;
  } else {
    fieldEl.classList.remove('invalid');
    fieldEl.classList.add('valid');
    errorEl.textContent = '';
  }
}

function clearFieldState(fieldEl, errorEl) {
  fieldEl.classList.remove('invalid', 'valid');
  errorEl.textContent = '';
}

// ---------- LOGIN validation ----------
const loginEmail = document.getElementById('login-email');
const loginEmailField = loginEmail.closest('.field');
const loginEmailError = document.getElementById('login-email-error');

const loginPassword = document.getElementById('login-password');
const loginPasswordField = loginPassword.closest('.field');
const loginPasswordError = document.getElementById('login-password-error');

function validateLoginEmail() {
  const value = loginEmail.value.trim();
  if (!value) {
    setFieldState(loginEmailField, loginEmailError, 'Email is required.');
    return false;
  }
  if (!EMAIL_REGEX.test(value)) {
    setFieldState(loginEmailField, loginEmailError, 'Enter a valid email address.');
    return false;
  }
  setFieldState(loginEmailField, loginEmailError, '');
  return true;
}

function validateLoginPassword() {
  const value = loginPassword.value;
  if (!value) {
    setFieldState(loginPasswordField, loginPasswordError, 'Password is required.');
    return false;
  }
  setFieldState(loginPasswordField, loginPasswordError, '');
  return true;
}

loginEmail.addEventListener('input', () => {
  if (loginEmailField.classList.contains('invalid')) validateLoginEmail();
});
loginEmail.addEventListener('blur', validateLoginEmail);

loginPassword.addEventListener('input', () => {
  if (loginPasswordField.classList.contains('invalid')) validateLoginPassword();
});
loginPassword.addEventListener('blur', validateLoginPassword);

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const emailOk = validateLoginEmail();
  const passwordOk = validateLoginPassword();
  const status = document.getElementById('login-status');

  if (emailOk && passwordOk) {
    status.textContent = 'Logged in successfully.';
    status.className = 'form-status success';
  } else {
    status.textContent = 'Please fix the errors above.';
    status.className = 'form-status error';
  }
});

// ---------- Forgot password ----------
// This only demonstrates the front-end interaction. Wiring this up to an
// actual "send reset email" flow needs a real backend endpoint.
const forgotLink = document.getElementById('forgot-password');
const loginStatus = document.getElementById('login-status');

forgotLink.addEventListener('click', (e) => {
  e.preventDefault();
  const emailOk = validateLoginEmail();

  if (!emailOk) {
    loginStatus.textContent = 'Enter a valid email above first, then click "Forgot password?" again.';
    loginStatus.className = 'form-status error';
    loginEmail.focus();
    return;
  }

  loginStatus.textContent = `If an account exists for ${loginEmail.value.trim()}, a reset link has been sent.`;
  loginStatus.className = 'form-status success';
});

// ---------- Remember me ----------
// Front-end only demo: stores the email in localStorage so it's pre-filled
// next time this page loads, if the box was ticked.
const rememberCheckbox = document.getElementById('remember-me');
const REMEMBER_KEY = 'rememberedEmail';

window.addEventListener('DOMContentLoaded', () => {
  const savedEmail = localStorage.getItem(REMEMBER_KEY);
  if (savedEmail) {
    loginEmail.value = savedEmail;
    rememberCheckbox.checked = true;
  }
});

loginForm.addEventListener('submit', () => {
  if (rememberCheckbox.checked) {
    localStorage.setItem(REMEMBER_KEY, loginEmail.value.trim());
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
});

// ---------- SIGNUP validation ----------
const signupName = document.getElementById('signup-name');
const signupNameField = signupName.closest('.field');
const signupNameError = document.getElementById('signup-name-error');

const signupEmail = document.getElementById('signup-email');
const signupEmailField = signupEmail.closest('.field');
const signupEmailError = document.getElementById('signup-email-error');

const signupPassword = document.getElementById('signup-password');
const signupPasswordField = signupPassword.closest('.field');
const signupPasswordError = document.getElementById('signup-password-error');

const signupConfirm = document.getElementById('signup-confirm');
const signupConfirmField = signupConfirm.closest('.field');
const signupConfirmError = document.getElementById('signup-confirm-error');

const strengthMeter = document.getElementById('strength-meter');
const strengthLabel = document.getElementById('strength-label');
const requirementItems = document.querySelectorAll('#requirements li');

function validateName() {
  const value = signupName.value.trim();
  if (!value) {
    setFieldState(signupNameField, signupNameError, 'Name is required.');
    return false;
  }
  if (value.length < 2) {
    setFieldState(signupNameField, signupNameError, 'Name looks too short.');
    return false;
  }
  setFieldState(signupNameField, signupNameError, '');
  return true;
}

function validateSignupEmail() {
  const value = signupEmail.value.trim();
  if (!value) {
    setFieldState(signupEmailField, signupEmailError, 'Email is required.');
    return false;
  }
  if (!EMAIL_REGEX.test(value)) {
    setFieldState(signupEmailField, signupEmailError, 'Enter a valid email address.');
    return false;
  }
  setFieldState(signupEmailField, signupEmailError, '');
  return true;
}

// Password rules, checked live as the user types
const passwordRules = {
  length: (v) => v.length >= 8,
  upper: (v) => /[A-Z]/.test(v),
  lower: (v) => /[a-z]/.test(v),
  number: (v) => /[0-9]/.test(v),
  special: (v) => /[^A-Za-z0-9]/.test(v),
};

function getPasswordScore(value) {
  return Object.values(passwordRules).filter((rule) => rule(value)).length;
}

function updateStrengthMeter(value) {
  const bars = strengthMeter.querySelectorAll('span');
  const score = getPasswordScore(value);

  // Map 0-5 rules met onto a 0-4 bar scale
  const filled = value.length === 0 ? 0 : Math.max(1, Math.ceil((score / 5) * 4));

  const levels = [
    { color: 'var(--border)', label: '' },
    { color: 'var(--weak)', label: 'Weak' },
    { color: 'var(--fair)', label: 'Fair' },
    { color: 'var(--good)', label: 'Good' },
    { color: 'var(--strong)', label: 'Strong' },
  ];

  const level = value.length === 0 ? 0 : filled;

  bars.forEach((bar, i) => {
    bar.style.background = i < filled ? levels[level].color : 'var(--border)';
  });

  strengthLabel.textContent = value.length === 0 ? '' : levels[level].label;
  strengthLabel.style.color = value.length === 0 ? 'var(--ink-soft)' : levels[level].color;

  requirementItems.forEach((item) => {
    const rule = item.dataset.rule;
    item.classList.toggle('met', passwordRules[rule](value));
  });
}

function validateSignupPassword() {
  const value = signupPassword.value;
  updateStrengthMeter(value);

  if (!value) {
    setFieldState(signupPasswordField, signupPasswordError, 'Password is required.');
    return false;
  }

  const allMet = Object.values(passwordRules).every((rule) => rule(value));
  if (!allMet) {
    setFieldState(signupPasswordField, signupPasswordError, 'Password does not meet all requirements yet.');
    return false;
  }

  setFieldState(signupPasswordField, signupPasswordError, '');
  return true;
}

function validateConfirm() {
  const value = signupConfirm.value;
  if (!value) {
    setFieldState(signupConfirmField, signupConfirmError, 'Please confirm your password.');
    return false;
  }
  if (value !== signupPassword.value) {
    setFieldState(signupConfirmField, signupConfirmError, 'Passwords do not match.');
    return false;
  }
  setFieldState(signupConfirmField, signupConfirmError, '');
  return true;
}

// Live listeners
signupName.addEventListener('input', () => {
  if (signupNameField.classList.contains('invalid')) validateName();
});
signupName.addEventListener('blur', validateName);

signupEmail.addEventListener('input', () => {
  if (signupEmailField.classList.contains('invalid')) validateSignupEmail();
});
signupEmail.addEventListener('blur', validateSignupEmail);

signupPassword.addEventListener('input', () => {
  updateStrengthMeter(signupPassword.value);
  if (signupPasswordField.classList.contains('invalid')) validateSignupPassword();
  // Re-check confirm field live if it's already been touched
  if (signupConfirm.value) validateConfirm();
});
signupPassword.addEventListener('blur', validateSignupPassword);

signupConfirm.addEventListener('input', () => {
  if (signupConfirmField.classList.contains('invalid')) validateConfirm();
});
signupConfirm.addEventListener('blur', validateConfirm);

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nameOk = validateName();
  const emailOk = validateSignupEmail();
  const passwordOk = validateSignupPassword();
  const confirmOk = validateConfirm();
  const status = document.getElementById('signup-status');

  if (nameOk && emailOk && passwordOk && confirmOk) {
    status.textContent = 'Account created successfully.';
    status.className = 'form-status success';
    signupForm.reset();
    updateStrengthMeter('');
    [signupNameField, signupEmailField, signupPasswordField, signupConfirmField].forEach((f) =>
      clearFieldState(f, f.querySelector('.error-msg'))
    );
  } else {
    status.textContent = 'Please fix the errors above.';
    status.className = 'form-status error';
  }
});
