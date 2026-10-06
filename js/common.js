/* =========================================================
   urdashboard – shared script (index.html + lms.html)
   Theme, sign up, email + OTP login, profile, mobile dock,
   scroll motion. Prototype only: accounts live in localStorage.
   ========================================================= */
(function () {
  'use strict';
  const root = document.documentElement;
  const IS_LMS = document.body.classList.contains('lms');
  const DEMO_OTP = '123456';
  const EMAIL = /^\S+@\S+\.\S+$/;
  const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Chandigarh','Puducherry','Other'];
  // Logged-out clicks on these open the sign-in dialog. Edit freely.
  const GATE = 'a[href*="lms.html"], .course .foot a, .cta .btn, .slot';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const rd = (k, d) => { try { const v = localStorage.getItem('cl_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const wr = (k, v) => { try { localStorage.setItem('cl_' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- theme ---------- */
  try { const saved = localStorage.getItem('cl_theme'); if (saved) root.dataset.theme = saved; } catch (e) { /* ignore */ }
  const themeBtn = $('#theme');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const isDark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = isDark ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('cl_theme', next); } catch (e) { /* ignore */ }
  });

  /* ---------- users ---------- */
  const users = () => rd('users', {});
  const user = () => { const e = rd('session', null); return e ? users()[e] || null : null; };
  const initials = n => n.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const first = n => n.trim().split(/\s+/)[0];
  const digits = p => String(p || '').replace(/\D/g, '').slice(-10);

  function toast(m) {
    let t = $('#clToast');
    if (!t) { t = document.createElement('div'); t.id = 'clToast'; t.className = 'a-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = m; t.classList.add('show');
    clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function check(v, needEmail) {
    const e = {};
    if (!v.name || v.name.trim().length < 2) e.name = 'Enter your full name.';
    if (!/^[6-9]\d{9}$/.test(digits(v.phone))) e.phone = 'Enter a 10-digit mobile number.';
    if (needEmail && !EMAIL.test((v.email || '').trim())) e.email = 'Enter a valid email, like name@example.com.';
    if (!v.city || v.city.trim().length < 2) e.city = 'Enter your city.';
    if (!v.state) e.state = 'Choose your state.';
    return e;
  }
  function showErr(form, prefix, errs) {
    $$('[data-err]', form).forEach(s => {
      const k = s.dataset.err, msg = errs[k] || '';
      s.textContent = msg;
      const inp = $('#' + prefix + k, form);
      if (inp) inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
    });
    const bad = Object.keys(errs)[0];
    if (bad) { const el = $('#' + prefix + bad, form); if (el) el.focus(); }
  }

  /* ---------- markup ---------- */
  const ICON = {
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    lms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>',
    person: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'
  };
  const opts = '<option value="">Select state</option>' + STATES.map(s => '<option>' + s + '</option>').join('');
  const fld = (id, label, type, ph, extra, cls) => '<div class="f ' + (cls || '') + '"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + type + '" placeholder="' + ph + '" ' + (extra || '') + '><span class="f-err" data-err="' + id.slice(2) + '"></span></div>';
  const phone = id => '<div class="f"><label for="' + id + '">Phone number</label><div class="pre"><span>+91</span><input id="' + id + '" type="tel" inputmode="numeric" maxlength="14" placeholder="98765 43210" autocomplete="tel"></div><span class="f-err" data-err="phone"></span></div>';
  const stateSel = id => '<div class="f"><label for="' + id + '">State</label><select id="' + id + '">' + opts + '</select><span class="f-err" data-err="state"></span></div>';

  document.body.insertAdjacentHTML('beforeend',
    '<dialog class="adlg" id="authDlg" aria-labelledby="aTitle"><div class="a-wrap">' +
      '<aside class="a-side">' +
        '<svg class="a-art" viewBox="0 0 300 260" fill="none" aria-hidden="true">' +
          '<g transform="translate(34 40) scale(3.4)"><g class="c" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".5"><rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2 20h20M8 9l-2 2 2 2M16 9l2 2-2 2M13 8l-2 6"/></g></g>' +
          '<g transform="translate(190 118) scale(3)"><g class="c c2" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".4"><path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2zM12 6v14"/></g></g>' +
          '<path id="aPath" class="dash" d="M20 230 C 90 230, 100 160, 160 150 S 250 80, 285 40" stroke="#ffb84d" stroke-width="3.5" stroke-linecap="round"/>' +
          '<g><circle r="13" fill="#fff"/><path d="M-6 3 L7 0 L-6 -3 L-4 0Z" fill="#2b8fe0"/><animateMotion dur="5s" repeatCount="indefinite" rotate="auto" path="M20 230 C 90 230, 100 160, 160 150 S 250 80, 285 40"/></g>' +
        '</svg>' +
        '<h2>Your seat on the next flight</h2>' +
        '<ul><li>Join live classes with working mentors</li><li>Rewatch recordings and keep your notes</li><li>Ask doubts and get mentor answers</li></ul>' +
      '</aside>' +
      '<div class="a-main">' +
        '<button class="a-x" data-a-close aria-label="Close">' + ICON.close + '</button>' +
        '<div class="a-tabs" id="aTabs" data-tab="signup" role="tablist"><i class="a-ind"></i>' +
          '<button role="tab" id="tabSignup" aria-selected="true">Sign up</button><button role="tab" id="tabLogin" aria-selected="false">Log in</button></div>' +
        /* sign up */
        '<form id="signupForm" novalidate>' +
          '<h3 id="aTitle">Create your account</h3><p class="a-sub">Takes a minute. No password, we log you in with a code.</p>' +
          '<div class="a-form">' +
            fld('s_name', 'Full name', 'text', 'Riya Sharma', 'autocomplete="name" maxlength="60"', 'full') + phone('s_phone') +
            fld('s_email', 'Email', 'email', 'you@example.com', 'autocomplete="email"') +
            fld('s_city', 'City', 'text', 'Hyderabad', 'autocomplete="address-level2" maxlength="40"') + stateSel('s_state') +
          '</div><button class="btn btn-primary a-go" type="submit">Create account</button>' +
          '<p class="a-alt">Already registered? <button type="button" data-tab="login">Log in</button></p>' +
        '</form>' +
        /* log in */
        '<form id="loginForm" novalidate hidden>' +
          '<h3>Welcome back</h3>' +
          '<div id="lNote" class="a-note" hidden></div>' +
          '<div id="lStep1"><p class="a-sub">Enter your email and we will send a 6-digit code.</p>' +
            '<div class="a-form">' + fld('l_email', 'Email', 'email', 'you@example.com', 'autocomplete="email"', 'full') + '</div>' +
            '<button class="btn btn-primary a-go" type="submit">Send OTP</button>' +
            '<p class="a-alt">New here? <button type="button" data-tab="signup">Create an account</button></p></div>' +
          '<div id="lStep2" hidden><p class="a-sub" id="lSent"></p>' +
            '<div class="otp" id="otp">' + '<input inputmode="numeric" maxlength="1" aria-label="Digit 1" autocomplete="one-time-code">'.repeat(1) + [2,3,4,5,6].map(n => '<input inputmode="numeric" maxlength="1" aria-label="Digit ' + n + '">').join('') + '</div>' +
            '<button type="button" class="demo-otp" id="demoOtp">Demo OTP: <b>' + DEMO_OTP + '</b> (tap to fill)</button>' +
            '<button class="btn btn-primary a-go" type="submit">Verify and log in</button>' +
            '<p class="a-alt"><button type="button" id="lBack">Change email</button> &nbsp;·&nbsp; <button type="button" id="lResend">Resend code</button></p></div>' +
        '</form>' +
      '</div></div></dialog>' +

    '<dialog class="pdlg" id="profDlg" aria-labelledby="pName"><div class="p-head"><button class="p-x" data-p-close>Close</button>' +
      '<div class="p-id"><div class="p-av" data-user-initials>?</div><div><h3 id="pName" data-user-name>Guest</h3><p data-user-email></p></div></div></div>' +
      '<div class="p-stats"><div><b id="stV">0</b><span>Lessons done</span></div><div><b id="stC">0</b><span>Classes joined</span></div><div><b id="stN">0</b><span>My notes</span></div></div>' +
      '<form class="p-body" id="profForm" novalidate><div class="a-form">' +
        fld('p_name', 'Full name', 'text', 'Full name', 'maxlength="60"', 'full') + phone('p_phone') + fld('p_email', 'Email', 'email', '', 'readonly') +
        fld('p_city', 'City', 'text', 'City', 'maxlength="40"') + stateSel('p_state') +
      '</div><div class="p-acts"><button class="btn btn-primary" type="submit">Save changes</button>' + (IS_LMS ? '' : '<a class="btn btn-ghost" href="lms.html">Open LMS</a>') + '<span class="grow"></span><button class="btn btn-danger" type="button" id="logoutBtn">Log out</button></div></form></dialog>');

  const dlg = $('#authDlg'), pdlg = $('#profDlg');
  const sForm = $('#signupForm'), lForm = $('#loginForm'), pForm = $('#profForm');
  let pending = null, lock = false, pendingEmail = '';

  /* ---------- auth dialog ---------- */
  function setTab(t) {
    $('#aTabs').dataset.tab = t;
    $('#tabSignup').setAttribute('aria-selected', t === 'signup');
    $('#tabLogin').setAttribute('aria-selected', t === 'login');
    sForm.hidden = t !== 'signup'; lForm.hidden = t !== 'login';
    $('#lStep1').hidden = false; $('#lStep2').hidden = true; $('#lNote').hidden = true;
    const f = $(t === 'signup' ? '#s_name' : '#l_email'); if (f) setTimeout(() => f.focus(), 60);
  }
  function openAuth(o) {
    o = o || {};
    pending = o.next || null; lock = !!o.lock;
    if (pdlg.open) pdlg.close();
    setTab(o.tab || (Object.keys(users()).length ? 'login' : 'signup'));
    if (!dlg.open) dlg.showModal();
  }
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-a-close]')) dlg.close(); });
  dlg.addEventListener('close', () => { if (lock && !user()) location.href = 'index.html'; });
  $('#tabSignup').onclick = () => setTab('signup');
  $('#tabLogin').onclick = () => setTab('login');
  $$('[data-tab]', dlg).forEach(b => { if (b.tagName === 'BUTTON' && b.type === 'button') b.onclick = () => setTab(b.dataset.tab); });

  sForm.addEventListener('submit', e => {
    e.preventDefault();
    const v = { name: $('#s_name').value, phone: $('#s_phone').value, email: $('#s_email').value, city: $('#s_city').value, state: $('#s_state').value };
    const errs = check(v, true), key = v.email.trim().toLowerCase();
    if (!errs.email && users()[key]) errs.email = 'This email is already registered. Log in instead.';
    showErr(sForm, 's_', errs);
    if (Object.keys(errs).length) return;
    const all = users();
    all[key] = { name: v.name.trim(), phone: digits(v.phone), email: key, city: v.city.trim(), state: v.state, joined: Date.now() };
    wr('users', all);
    sForm.reset();
    setTab('login');
    $('#l_email').value = key;
    const n = $('#lNote'); n.className = 'a-note'; n.textContent = 'Account created. Now log in: we will send a code to your email.'; n.hidden = false;
  });

  const otpBoxes = () => $$('#otp input');
  const otpCode = () => otpBoxes().map(i => i.value).join('');
  function sendOtp(email) {
    pendingEmail = email;
    const [a, d] = email.split('@');
    $('#lSent').textContent = 'Code sent to ' + a.slice(0, 2) + '***@' + d + '. Enter it below.';
    $('#lStep1').hidden = true; $('#lStep2').hidden = false;
    otpBoxes().forEach(i => i.value = ''); otpBoxes()[0].focus();
  }
  function verify() {
    if (otpCode() !== DEMO_OTP) {
      const o = $('#otp'); o.classList.remove('bad'); void o.offsetWidth; o.classList.add('bad');
      const n = $('#lNote'); n.className = 'a-note err'; n.textContent = 'That code does not match. Use the demo OTP ' + DEMO_OTP + '.'; n.hidden = false;
      otpBoxes().forEach(i => i.value = ''); otpBoxes()[0].focus();
      return;
    }
    wr('session', pendingEmail);
    const u = user(), next = pending;
    lock = false; dlg.close(); applyUser();
    if (IS_LMS) { location.reload(); return; }
    toast('Welcome, ' + first(u.name) + '. You are logged in.');
    if (next) setTimeout(() => { location.href = next; }, 500);
  }
  lForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!$('#lStep1').hidden) {
      const em = $('#l_email').value.trim().toLowerCase(), errs = {};
      if (!EMAIL.test(em)) errs.email = 'Enter a valid email, like name@example.com.';
      else if (!users()[em]) errs.email = 'No account with this email. Create one first.';
      showErr(lForm, 'l_', errs);
      if (Object.keys(errs).length) return;
      $('#lNote').hidden = true; sendOtp(em);
    } else verify();
  });
  $('#otp').addEventListener('input', e => {
    const i = e.target; i.value = i.value.replace(/\D/g, '').slice(-1);
    if (i.value && i.nextElementSibling) i.nextElementSibling.focus();
    if (otpCode().length === 6) setTimeout(verify, 200);
  });
  $('#otp').addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !e.target.value && e.target.previousElementSibling) e.target.previousElementSibling.focus();
  });
  $('#otp').addEventListener('paste', e => {
    const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!d) return; e.preventDefault();
    otpBoxes().forEach((b, n) => b.value = d[n] || ''); if (d.length === 6) setTimeout(verify, 200);
  });
  $('#demoOtp').onclick = () => { otpBoxes().forEach((b, n) => b.value = DEMO_OTP[n]); setTimeout(verify, 250); };
  $('#lBack').onclick = () => { $('#lStep1').hidden = false; $('#lStep2').hidden = true; $('#lNote').hidden = true; $('#l_email').focus(); };
  $('#lResend').onclick = () => { const n = $('#lNote'); n.className = 'a-note'; n.textContent = 'New code sent. (Demo OTP is ' + DEMO_OTP + ')'; n.hidden = false; otpBoxes().forEach(i => i.value = ''); otpBoxes()[0].focus(); };

  /* ---------- profile ---------- */
  function openProfile() {
    const u = user();
    if (!u) { openAuth(); return; }
    $('#p_name').value = u.name; $('#p_phone').value = u.phone; $('#p_email').value = u.email; $('#p_city').value = u.city; $('#p_state').value = u.state;
    const prog = rd('prog', {});
    $('#stV').textContent = Object.keys(prog).filter(k => prog[k] && prog[k].done).length;
    $('#stC').textContent = rd('attended', []).length;
    $('#stN').textContent = rd('notes', []).length;
    showErr(pForm, 'p_', {});
    pdlg.showModal();
  }
  pdlg.addEventListener('click', e => { if (e.target === pdlg || e.target.closest('[data-p-close]')) pdlg.close(); });
  pForm.addEventListener('submit', e => {
    e.preventDefault();
    const u = user(), v = { name: $('#p_name').value, phone: $('#p_phone').value, city: $('#p_city').value, state: $('#p_state').value };
    const errs = check(v, false); showErr(pForm, 'p_', errs);
    if (Object.keys(errs).length) return;
    const all = users(); all[u.email] = Object.assign({}, u, { name: v.name.trim(), phone: digits(v.phone), city: v.city.trim(), state: v.state });
    wr('users', all); applyUser(); pdlg.close(); toast('Profile updated');
    if (IS_LMS) setTimeout(() => location.reload(), 600);
  });
  $('#logoutBtn').onclick = () => {
    wr('session', null); pdlg.close();
    if (IS_LMS) { location.href = 'index.html'; return; }
    document.body.classList.remove('dock-on'); applyUser(); toast('You are logged out');
  };

  /* ---------- nav button + mobile dock (landing page) ---------- */
  let userBtn = null, dockProf = null;
  if (!IS_LMS) {
    const acts = $('.nav-actions');
    if (acts) { userBtn = document.createElement('button'); userBtn.className = 'user-btn'; userBtn.id = 'userBtn'; acts.insertBefore(userBtn, $('#burger')); userBtn.onclick = () => user() ? openProfile() : openAuth(); }
    document.body.insertAdjacentHTML('beforeend',
      '<nav class="dock" id="dock" aria-label="Quick actions"><a class="fab fab-lms" href="lms.html">' + ICON.lms + 'LMS</a>' +
      '<button class="fab fab-prof" id="dockProf"></button>' +
      '<button class="fab fab-theme" id="dockTheme" type="button" aria-label="Toggle dark mode"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button></nav>');
    $('#dockTheme').onclick = () => { const t = $('#theme'); if (t) t.click(); };
    dockProf = $('#dockProf'); dockProf.onclick = () => { document.body.classList.remove('dock-on'); const b = $('#burger'); if (b) b.setAttribute('aria-expanded', 'false'); const m = $('#menu'); if (m) m.classList.remove('open'); user() ? openProfile() : openAuth(); };
    const burger = $('#burger'), menu = $('#menu');
    if (burger && menu) {
      // full-screen mobile menu: add a Back button + logo row at the top
      const head = document.createElement('li'); head.className = 'm-head';
      head.innerHTML = '<button class="m-back" id="mBack" type="button"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>Back</button>';
      menu.insertBefore(head, menu.firstChild);
      $$('li', menu).forEach((li, i) => li.style.setProperty('--i', i));
      const closeMenu = () => { menu.classList.remove('open'); };
      $('#mBack').onclick = closeMenu;
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu(); });
      // single source of truth: the menu's "open" class (main.js toggles it)
      new MutationObserver(() => {
        const o = menu.classList.contains('open');
        document.body.classList.toggle('menu-open', o);
        document.body.classList.toggle('dock-on', o);
        burger.setAttribute('aria-expanded', o ? 'true' : 'false');
        burger.innerHTML = o ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
      }).observe(menu, { attributes: true, attributeFilter: ['class'] });
      addEventListener('resize', () => { if (innerWidth > 960) closeMenu(); });
    }
  }
  const who = $('#whoBtn'); if (who) who.onclick = openProfile;

  function applyUser() {
    const u = user();
    document.body.dataset.auth = u ? 'in' : 'out';
    $$('[data-user-name]').forEach(el => el.textContent = u ? u.name : 'Guest');
    $$('[data-user-first]').forEach(el => el.textContent = u ? first(u.name) : 'there');
    $$('[data-user-email]').forEach(el => el.textContent = u ? u.email : '');
    $$('[data-user-initials]').forEach(el => el.textContent = u ? initials(u.name) : '?');
    if (userBtn) userBtn.innerHTML = u ? '<span class="av">' + esc(initials(u.name)) + '</span>' + esc(first(u.name)) : ICON.person + ' Log in';
    if (userBtn) userBtn.classList.toggle('out', !u);
    if (dockProf) dockProf.innerHTML = u ? '<span class="fab-av">' + esc(initials(u.name)) + '</span>Profile' : ICON.person.replace('width="18" height="18"', 'width="22" height="22"') + 'Log in';
  }
  applyUser();


  /* ---------- touch ripple ---------- */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('pointerdown', e => {
      const t = e.target.closest && e.target.closest('.btn,.chip,.fab,.nav-item,.m-back,.back-btn,.icon-btn');
      if (!t) return;
      const r = t.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2, sp = document.createElement('span');
      sp.className = 'rip';
      sp.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
      t.appendChild(sp); setTimeout(() => sp.remove(), 650);
    }, { passive: true });
  }

  /* ---------- page dots under swipe rows (mobile) ---------- */
  ['.hub-grid', '#courseGrid', '.mentors', '.projects'].forEach(sel => {
    const el = $(sel); if (!el) return;
    const dots = document.createElement('div'); dots.className = 'snap-dots'; dots.setAttribute('aria-hidden', 'true');
    el.insertAdjacentElement('afterend', dots);
    const kids = () => $$(':scope > *:not(.empty)', el);
    const sync = () => {
      const mid = el.scrollLeft + el.clientWidth / 2; let best = 0, bd = 1e9;
      kids().forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
      $$('i', dots).forEach((d, i) => d.classList.toggle('on', i === best));
    };
    const build = () => { dots.innerHTML = kids().map(() => '<i></i>').join(''); sync(); };
    el.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    new MutationObserver(build).observe(el, { childList: true });
    build();
  });

  /* ---------- gate: logged-out clicks open the dialog ---------- */
  document.addEventListener('click', e => {
    if (user()) return;
    const el = e.target.closest(GATE);
    if (!el) return;
    e.preventDefault(); e.stopPropagation();
    const h = el.getAttribute('href');
    openAuth({ next: h && h !== '#' ? h : null });
  }, true);
  // LMS needs a login: show the dialog straight away
  if (IS_LMS && !user()) { document.body.classList.add('locked'); openAuth({ lock: true }); }
  // after an LMS gate on the landing page, handle plain #hash arrival too
  window.CL = { user: user, openAuth: openAuth, openProfile: openProfile };

  /* ---------- motion: scroll bar, reveal, card spotlight ---------- */
  const nav = $('header.nav');
  if (nav) {
    const bar = document.createElement('div'); bar.className = 'sbar'; document.body.appendChild(bar);
    let tick = false;
    const upd = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(scrollY / h, 1) : 0) + ')';
      nav.classList.toggle('scrolled', scrollY > 10); tick = false;
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in'); io.unobserve(en.target);
      setTimeout(() => { en.target.classList.remove('rv', 'in'); en.target.style.transitionDelay = ''; }, 1100);
    }), { threshold: 0.12 });
    $$('.sec-head,.hub-card,.step,.proj,.mentor,.col,.quotes,.faq details,.cta,.band .wrap>div').forEach(el => {
      el.classList.add('rv');
      el.style.transitionDelay = ($$(el.tagName, el.parentNode).indexOf(el) % 4) * 90 + 'ms';
      io.observe(el);
    });
  }
  const SPOT = '.hub-card,.course,.mentor,.stat,.panel,.vcard,.item,.post';
  document.addEventListener('pointermove', e => {
    const c = e.target.closest && e.target.closest(SPOT); if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- study background: laptops, books, research ---------- */
  (function () {
    const P = {
      laptop: '<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2 20h20M8 9l-2 2 2 2M16 9l2 2-2 2M13 8l-2 6"/>',
      book: '<path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2zM12 6v14"/>',
      search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l6 6M8 12l2-2 2 1.5 2-3"/>',
      cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/>',
      flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 15h9"/>',
      chart: '<path d="M4 20V4M4 20h16"/><rect x="7" y="12" width="3" height="5"/><rect x="12" y="8" width="3" height="9"/><rect x="17" y="5" width="3" height="12"/>',
      bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
      pencil: '<path d="M4 20l1-4L16 5l3 3L8 19zM14 7l3 3"/>',
      monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M7 12l3-3 2 2 4-4"/>',
      doc: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5"/>',
      atom: '<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>'
    };
    const keys = Object.keys(P), colors = ['var(--azure)', 'var(--azure)', 'var(--sun)', 'var(--ok)'];
    const box = document.createElement('div'); box.className = 'study-bg'; box.setAttribute('aria-hidden', 'true');
    const small = innerWidth < 700, n = small ? 10 : 18, rnd = (a, b) => a + Math.random() * (b - a);
    let html = '';
    for (let i = 0; i < n; i++) {
      const size = Math.round(small ? rnd(26, 46) : rnd(34, 68)), near = size > (small ? 38 : 52);
      html += '<span class="sb" style="--x:' + ((i + .5) / n * 100 + rnd(-3, 3)).toFixed(1) + '%;--s:' + size + 'px;--d:' + Math.round(near ? rnd(24, 34) : rnd(36, 54)) + 's;--dl:-' + Math.round(rnd(0, 50)) + 's;--dx:' + Math.round(rnd(-60, 60)) + 'px;--o:' + (near ? .24 : .15).toFixed(2) + ';--c:' + colors[i % colors.length] + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + P[keys[(i * 5) % keys.length]] + '</svg></span>';
    }
    box.innerHTML = html; document.body.insertBefore(box, document.body.firstChild);
  })();

  /* ---------- fixed header: scroll state + active link ---------- */
  (function () {
    const tb = $('body.lms .topbar'), links = $$('.nav ul a[href^="#"]');
    const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
    let t = false;
    const run = () => {
      t = false;
      if (tb) tb.classList.toggle('scrolled', scrollY > 6);
      let cur = null; secs.forEach(s => { if (s.getBoundingClientRect().top <= 140) cur = s.id; });
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
    };
    addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  })();
})();