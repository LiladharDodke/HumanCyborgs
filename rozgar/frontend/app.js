// =============================================
// ROZGAR — app.js
// Shared: API, translations, auth, navigation
// =============================================

const API = 'http://localhost:3000';

// ---------- LANGUAGE ----------
function getLang() {
  return localStorage.getItem('rozgar_lang') || 'en';
}
function setLang(lang) {
  localStorage.setItem('rozgar_lang', lang);
  applyTranslations();
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
}
function t(key) {
  const lang = getLang();
  if (!translations[key]) return key;
  return translations[key][lang] || translations[key]['en'] || key;
}
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (el.tagName === 'INPUT' && el.placeholder !== undefined) {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });
}
function initLangSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
    if (btn.dataset.lang === getLang()) btn.classList.add('active');
  });
}

// ---------- AUTH ----------
function getUser() {
  try { return JSON.parse(localStorage.getItem('rozgar_user')); } catch { return null; }
}
function setUser(u) { localStorage.setItem('rozgar_user', JSON.stringify(u)); }
function clearUser() { localStorage.removeItem('rozgar_user'); }

function logout() {
  clearUser();
  window.location.href = 'index.html';
}

function requireAuth(role) {
  const user = getUser();
  if (!user) { window.location.href = 'login.html'; return false; }
  if (role && user.role !== role) { window.location.href = 'index.html'; return false; }
  return true;
}

// ---------- API HELPERS ----------
async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  return res.json();
}

// ---------- LOCATION ----------
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return; }
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => reject(new Error('Location denied'))
    );
  });
}

// ---------- RENDER HELPERS ----------
function renderStars(rating) {
  const full = Math.round(rating);
  let s = '';
  for (let i = 1; i <= 5; i++) {
    s += i <= full ? '⭐' : '☆';
  }
  return s;
}

function renderSkillTags(skills) {
  if (!skills) return '';
  const list = typeof skills === 'string' ? skills.split(',') : skills;
  return list.map(sk => {
    const key = sk.trim();
    return `<span class="skill-tag">${t(key) || key}</span>`;
  }).join('');
}

function showMsg(container, text, type = 'info') {
  const div = document.createElement('div');
  div.className = `msg msg-${type}`;
  div.textContent = text;
  container.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

function clearMsg(container) {
  container.querySelectorAll('.msg').forEach(m => m.remove());
}

// ---------- TOPBAR ----------
function renderTopbar(title = '') {
  const user = getUser();
  return `
    <nav class="topbar">
      <a href="index.html" class="logo">Roz<span>gar</span></a>
      <div class="topbar-right">
        <div class="lang-switcher">
          <button class="lang-btn" data-lang="en">EN</button>
          <button class="lang-btn" data-lang="hi">हिं</button>
          <button class="lang-btn" data-lang="mr">म</button>
        </div>
        ${user ? `<button class="btn-logout" onclick="logout()" data-i18n="logout">${t('logout')}</button>` : ''}
      </div>
    </nav>`;
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  initLangSwitcher();
  applyTranslations();
});
