const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const root = document.documentElement;
const themeMeta = document.querySelector('meta[name="theme-color"]');
const THEME_KEY = 'pgd-theme';

const getSystemPref = () => window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

const applyTheme = (mode) => {
  root.setAttribute('data-theme', mode);
  const bg = getComputedStyle(document.body).getPropertyValue('--bg').trim();
  themeMeta?.setAttribute('content', bg);
  const btn = $('#theme-toggle');
  if (btn) {
    const isLight = mode === 'light';
    btn.setAttribute('aria-pressed', isLight);
    btn.textContent = isLight ? '☀️' : '🌙';
    btn.title = isLight ? 'Switch to dark theme' : 'Switch to light theme';
  }
};

const saved = localStorage.getItem(THEME_KEY);
applyTheme(saved || getSystemPref());

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'light' : 'dark');
});

const navToggle = $('.nav-toggle');
const navMenu = $('#nav-menu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
}

$('#year').textContent = new Date().getFullYear();

const testimonials = $$('.testimonial');
let activeIndex = 0;
const prevBtn = $('.carousel .prev');
const nextBtn = $('.carousel .next');

const showTestimonial = (idx) => {
  testimonials.forEach((t, i) => t.classList.toggle('is-active', i === idx));
};

prevBtn?.addEventListener('click', () => {
  activeIndex = (activeIndex - 1 + testimonials.length) % testimonials.length;
  showTestimonial(activeIndex);
});

nextBtn?.addEventListener('click', () => {
  activeIndex = (activeIndex + 1) % testimonials.length;
  showTestimonial(activeIndex);
});

if (testimonials.length > 1) {
  setInterval(() => {
    activeIndex = (activeIndex + 1) % testimonials.length;
    showTestimonial(activeIndex);
  }, 8000);
}

const form = $('#contact-form');
const nameInput = $('#name');
const emailInput = $('#email');
const phoneInput = $('#phone');
const messageInput = $('#message');
const statusEl = $('#form-status');

const validators = {
  name: (v) => v.trim().length >= 2 || 'Please enter your full name',
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address',
  message: (v) => v.trim().length >= 10 || 'Message should be at least 10 characters',
};

const showError = (id, msg) => {
  const el = $(`#error-${id}`);
  if (el) el.textContent = msg || '';
};

const validateField = (input) => {
  const id = input.id;
  const value = input.value;
  const rule = validators[id];
  if (!rule) return true;
  const result = rule(value);
  showError(id, result === true ? '' : result);
  return result === true;
};

['input', 'blur'].forEach(evt => {
  [nameInput, emailInput, messageInput].forEach(inp => inp?.addEventListener(evt, () => validateField(inp)));
});

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fields = [nameInput, emailInput, messageInput];
  const allValid = fields.every((inp) => validateField(inp));
  if (!allValid) {
    statusEl.textContent = 'Please fix the highlighted fields.';
    return;
  }

  statusEl.textContent = 'Sending...';
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  try {
    // Submit form to Formspree (replace 'your-formspree-id' with actual ID)
    const response = await fetch(form.action, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Network response was not ok');

    statusEl.textContent = 'Thanks! Your request has been sent. I will reply soon.';
    form.reset();
    fields.forEach(inp => showError(inp.id));
  } catch (err) {
    statusEl.textContent = 'Something went wrong. Please try again later.';
    console.error(err);
  }
});

$('#theme-toggle')?.addEventListener('click', () => {
  const isLight = root.getAttribute('data-theme') === 'light';
  const next = isLight ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});