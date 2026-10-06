/* =========================================================
   Cloudlift – LMS behaviour (lms.html)
   Prototype only: all data lives in this file + localStorage.
   To go live, replace the DATA section with calls to your API.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- tiny helpers ---------- */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const initials = n => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const store = {
    get(k, d) { try { const v = localStorage.getItem('cl_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('cl_' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2600);
  }
  function ago(ts) {
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + ' min ago';
    const h = Math.round(m / 60);
    if (h < 24) return h + ' h ago';
    return Math.round(h / 24) + ' d ago';
  }
  function download(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
  }
  function bindChips(id, cb) {
    const box = $(id);
    box.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      $$('.chip', box).forEach(c => c.setAttribute('aria-pressed', c === b));
      cb(b.dataset.f);
    });
  }

  /* =======================================================
     DATA  (edit here to change content)
     ======================================================= */
  const NOW = Date.now(), MIN = 60000;

  // `start` = minutes from now. Negative = already started.
  const SESSIONS = [
    { id: 's0', title: 'Excel pivot tables, solved live', mentor: 'Ananya Rao',    module: 'Module 1', start: -1500, dur: 60, video: 'v2' },
    { id: 's1', title: 'SQL joins in practice',           mentor: 'Ananya Rao',    module: 'Module 2', start: -12,   dur: 60 },
    { id: 's2', title: 'Window functions workshop',       mentor: 'Karthik Menon', module: 'Module 2', start: 1620,  dur: 75 },
    { id: 's3', title: 'Dashboard design critique',       mentor: 'Sana Basha',    module: 'Module 3', start: 3060,  dur: 60 },
    { id: 's4', title: 'Resume and portfolio clinic',     mentor: 'Pranav Nair',   module: 'Career',   start: 5940,  dur: 45 }
  ].map(s => Object.assign({}, s, { startAt: NOW + s.start * MIN, endAt: NOW + (s.start + s.dur) * MIN }));

  // dur in seconds. Add `src: 'videos/xyz.mp4'` when you have real files.
  const VIDEOS = [
    { id: 'v1', title: 'Excel basics for analysts',     module: 'Module 1', dur: 1100, mentor: 'Ananya Rao' },
    { id: 'v2', title: 'Pivot tables and charts',       module: 'Module 1', dur: 1445, mentor: 'Ananya Rao' },
    { id: 'v3', title: 'Data cleaning checklist',       module: 'Module 1', dur: 940,  mentor: 'Ananya Rao' },
    { id: 'v4', title: 'SQL SELECT and WHERE',          module: 'Module 2', dur: 1270, mentor: 'Karthik Menon' },
    { id: 'v5', title: 'JOINs explained',               module: 'Module 2', dur: 1710, mentor: 'Karthik Menon' },
    { id: 'v6', title: 'Window functions intro',        module: 'Module 2', dur: 1605, mentor: 'Karthik Menon' },
    { id: 'v7', title: 'Dashboard design principles',   module: 'Module 3', dur: 1155, mentor: 'Sana Basha' },
    { id: 'v8', title: 'Building a Power BI report',    module: 'Module 3', dur: 1920, mentor: 'Sana Basha' }
  ];

  const CLASS_NOTES = [
    { id: 'n1', title: 'Excel formulas cheat sheet',    module: 'Module 1', type: 'PDF',    size: '420 KB' },
    { id: 'n2', title: 'Pivot table walkthrough',       module: 'Module 1', type: 'Slides', size: '1.8 MB' },
    { id: 'n3', title: 'SQL query patterns',            module: 'Module 2', type: 'PDF',    size: '610 KB' },
    { id: 'n4', title: 'JOIN types at a glance',        module: 'Module 2', type: 'Cheat sheet', size: '180 KB' },
    { id: 'n5', title: 'Dashboard checklist',           module: 'Module 3', type: 'PDF',    size: '300 KB' }
  ];

  const GROUPS = [
    { id: 'g1', name: 'SQL night owls',     info: 'Mon and Thu, 9 pm',  members: 24 },
    { id: 'g2', name: 'Excel to Power BI',  info: 'Sat, 11 am',         members: 31 },
    { id: 'g3', name: 'Interview prep',     info: 'Sun, 6 pm',          members: 18 }
  ];
  const HOURS = [
    { who: 'Ananya Rao',    topic: 'SQL and Excel',    when: 'Tue, 7 pm' },
    { who: 'Sana Basha',    topic: 'Dashboards',       when: 'Wed, 8 pm' },
    { who: 'Pranav Nair',   topic: 'Career guidance',  when: 'Fri, 6 pm' }
  ];

  const seedPosts = () => [
    { id: 'p1', title: 'My LEFT JOIN returns more rows than the left table has. Why?', body: 'I joined orders to customers on customer_id and got 1,240 rows from a table with 1,000 rows.', tag: 'SQL', author: 'Karan S.', at: NOW - 3 * 3600e3, votes: 12, voted: false, solved: true,
      replies: [
        { by: 'Ananya Rao', role: 'Mentor', text: 'A LEFT JOIN repeats the left row once per match. Check if customer_id is duplicated in the right table. Use COUNT(*) GROUP BY customer_id to confirm.', at: NOW - 2.5 * 3600e3 },
        { by: 'Karan S.', role: 'Student', text: 'Found it. There were duplicate customer records. Thank you!', at: NOW - 2 * 3600e3 }
      ] },
    { id: 'p2', title: 'Which should I learn first for entry-level roles, Power BI or Tableau?', body: 'I see both in job posts. I only have time for one this month.', tag: 'Dashboards', author: 'Divya P.', at: NOW - 26 * 3600e3, votes: 8, voted: false, solved: false,
      replies: [
        { by: 'Sana Basha', role: 'Mentor', text: 'Check 10 job posts in your city and count which one appears more. In most Indian job boards, Power BI wins for entry-level roles.', at: NOW - 24 * 3600e3 }
      ] },
    { id: 'p3', title: 'How do I remove duplicates but keep the latest row per customer?', body: 'Using Excel. Remove Duplicates keeps the first row, not the latest.', tag: 'Excel', author: 'Imran K.', at: NOW - 50 * 60000, votes: 3, voted: false, solved: false, replies: [] },
    { id: 'p4', title: 'Can I put the class projects on my resume?', body: '', tag: 'Career', author: 'Neha R.', at: NOW - 5 * 24 * 3600e3, votes: 15, voted: false, solved: true,
      replies: [{ by: 'Pranav Nair', role: 'Mentor', text: 'Yes. Link each project with one line on the problem, the tool and the result. Add your skill passport link at the top.', at: NOW - 4.8 * 24 * 3600e3 }] }
  ];

  /* =======================================================
     STATE
     ======================================================= */
  let prog      = store.get('prog', {});        // { videoId: { t, done } }
  let marks     = store.get('marks', {});       // { videoId: [seconds] }
  let attended  = store.get('attended', []);    // [sessionId]
  let reminders = store.get('reminders', []);   // [sessionId]
  let notes     = store.get('notes', []);       // my notes
  let posts     = store.get('posts', null) || seedPosts();
  let joined    = store.get('groups', []);      // [groupId]
  let openPosts = new Set();
  let liveFilter = 'all', videoFilter = 'all', videoQuery = '', noteQuery = '', postFilter = 'all', postQuery = '';
  const U = (window.CL && CL.user && CL.user()) || { name: 'Riya Sharma' };
  const NAME_PARTS = U.name.trim().split(/\s+/);
  const ME = NAME_PARTS[0] + (NAME_PARTS[1] ? ' ' + NAME_PARTS[1][0] + '.' : '');

  const status = s => { const n = Date.now(); return n < s.startAt ? 'upcoming' : n <= s.endAt ? 'live' : 'ended'; };
  const vdone = id => !!(prog[id] && prog[id].done);
  const vt = id => (prog[id] && prog[id].t) || 0;

  /* =======================================================
     NAVIGATION
     ======================================================= */
  const VIEWS = {
    dashboard: ['Dashboard',        'Welcome back, ' + NAME_PARTS[0] + '. Here is your day.'],
    live:      ['Live classes',     'Join a class, set a reminder, or catch the recording.'],
    recorded:  ['Recorded classes', 'Watch at your own pace. Progress is saved.'],
    notes:     ['Notes',            'Mentor notes and your own notes in one place.'],
    community: ['Community',        'Ask doubts, help others, join a study group.']
  };
  const RENDER = { dashboard: renderDashboard, live: renderLive, recorded: renderVideos, notes: renderNotes, community: renderCommunity };
  let current = 'dashboard';

  function show(view, push) {
    if (!VIEWS[view]) view = 'dashboard';
    current = view;
    $$('.view').forEach(v => v.hidden = v.id !== 'view-' + view);
    $$('#lmsNav .nav-item').forEach(b => b.setAttribute('aria-current', b.dataset.view === view ? 'page' : 'false'));
    $('#viewTitle').textContent = VIEWS[view][0];
    $('#viewSub').textContent = VIEWS[view][1];
    document.title = 'Cloudlift LMS – ' + VIEWS[view][0];
    const bb = $('#backBtn');
    if (bb) {
      const home = view === 'dashboard';
      bb.classList.toggle('desk-hide', home);
      $('span', bb).textContent = home ? 'Website' : 'Dashboard';
      bb.setAttribute('aria-label', home ? 'Back to website' : 'Back to dashboard');
    }
    // push a history entry per view so the phone's back button steps back through them
    if (push !== false && location.hash.slice(1) !== view) history.pushState(null, '', '#' + view);
    RENDER[view]();
    window.scrollTo(0, 0);
  }
  $('#lmsNav').addEventListener('click', e => { const b = e.target.closest('.nav-item'); if (b) show(b.dataset.view); });
  $('#backBtn').addEventListener('click', () => {
    if (current === 'dashboard') location.href = 'index.html'; else show('dashboard');
  });
  window.addEventListener('hashchange', () => show(location.hash.slice(1), false));

  // global click actions (buttons rendered by templates)
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-goto],[data-join],[data-remind],[data-watch],[data-dl]');
    if (!el) return;
    if (el.dataset.goto)  show(el.dataset.goto);
    if (el.dataset.join)  openLive(el.dataset.join);
    if (el.dataset.watch) openPlayer(el.dataset.watch);
    if (el.dataset.remind) toggleReminder(el.dataset.remind);
    if (el.dataset.dl) {
      const n = CLASS_NOTES.find(x => x.id === el.dataset.dl);
      download(n.title.replace(/\s+/g, '-').toLowerCase() + '.txt',
        n.title + '\n' + n.module + '\n\nSample notes file from the Cloudlift prototype.\nReplace this with a real PDF link in production.\n');
      toast('Downloaded ' + n.title);
    }
  });

  /* =======================================================
     DASHBOARD
     ======================================================= */
  function human(ms) {
    const m = Math.max(0, Math.floor(ms / 60000)), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60);
    return d ? d + 'd ' + h + 'h' : h ? h + 'h ' + (m % 60) + 'm' : m + ' min';
  }
  function renderDashboard() {
    const next = SESSIONS.find(s => status(s) !== 'ended');
    if (next) {
      const st = status(next), rem = reminders.includes(next.id);
      $('#dNext').innerHTML =
        '<span class="pill ' + (st === 'live' ? 'live' : '') + '">' + (st === 'live' ? 'Live now' : 'Next live class') + '</span>' +
        '<h2>' + esc(next.title) + '</h2>' +
        '<p>' + esc(next.mentor) + ', ' + esc(next.module) + '</p>' +
        '<div class="bp-bot"><div class="countdown" id="cd" data-id="' + next.id + '"></div>' +
        (st === 'live'
          ? '<button class="btn" data-join="' + next.id + '">Join class</button>'
          : '<button class="btn" data-remind="' + next.id + '">' + (rem ? 'Reminder set' : 'Remind me') + '</button>') + '</div>';
      updateCountdown();
    } else {
      $('#dNext').innerHTML = '<h2>No classes scheduled</h2><p>New sessions are added every week.</p>';
    }

    const total = VIDEOS.length, done = VIDEOS.filter(v => vdone(v.id)).length, pct = Math.round(done / total * 100);
    const mods = ['Module 1', 'Module 2', 'Module 3'].map(m => {
      const vs = VIDEOS.filter(v => v.module === m), d = vs.filter(v => vdone(v.id)).length, p = Math.round(d / vs.length * 100);
      return '<div><span>' + m + '</span><span class="bar"><i style="width:' + p + '%"></i></span><span>' + p + '%</span></div>';
    }).join('');
    $('#dProgress').innerHTML =
      '<h2 class="h-sm">Course progress</h2>' +
      '<div class="ring-row"><div class="ring" style="--p:' + pct + '"><b>' + pct + '%</b></div>' +
      '<p class="muted">' + done + ' of ' + total + ' recordings completed.</p></div><div class="mod-bars">' + mods + '</div>';

    const cont = VIDEOS.find(v => vt(v.id) > 0 && !vdone(v.id)) || VIDEOS.find(v => !vdone(v.id)) || VIDEOS[0];
    $('#dContinue').innerHTML =
      '<h2 class="h-sm">' + (vt(cont.id) > 0 ? 'Continue watching' : 'Start learning') + '</h2>' +
      '<h3>' + esc(cont.title) + '</h3><p class="muted small">' + esc(cont.module) + ', ' + fmt(cont.dur) + ' min</p>' +
      '<div class="bar" style="margin:12px 0"><i style="width:' + Math.round(vt(cont.id) / cont.dur * 100) + '%"></i></div>' +
      '<button class="btn btn-primary btn-sm" data-watch="' + cont.id + '">' + (vt(cont.id) > 0 ? 'Resume at ' + fmt(vt(cont.id)) : 'Play') + '</button>';

    $('#dStats').innerHTML =
      stat(attended.length, 'Live classes attended') +
      stat(done, 'Recordings completed') +
      stat(notes.length, 'Notes you wrote') +
      stat(posts.filter(p => p.author === ME).length, 'Community questions');
  }
  const stat = (n, l) => '<div class="stat"><b>' + n + '</b><span>' + l + '</span></div>';

  function updateCountdown() {
    const el = $('#cd'); if (!el) return;
    const s = SESSIONS.find(x => x.id === el.dataset.id); if (!s) return;
    el.textContent = status(s) === 'live' ? 'Started ' + human(Date.now() - s.startAt) + ' ago' : 'Starts in ' + human(s.startAt - Date.now());
  }

  /* =======================================================
     LIVE CLASSES
     ======================================================= */
  function toggleReminder(id) {
    reminders = reminders.includes(id) ? reminders.filter(x => x !== id) : reminders.concat(id);
    store.set('reminders', reminders);
    toast(reminders.includes(id) ? 'Reminder set. We will notify you 15 minutes before.' : 'Reminder removed.');
    RENDER[current]();
  }
  function renderLive() {
    const list = SESSIONS.filter(s => liveFilter === 'all' || (liveFilter === 'upcoming' ? status(s) !== 'ended' : status(s) === 'ended'));
    $('#liveList').innerHTML = list.map(s => {
      const st = status(s), d = new Date(s.startAt);
      const when = d.toLocaleString('en-IN', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
      let acts = '';
      if (st === 'live') acts = '<button class="btn btn-primary btn-sm" data-join="' + s.id + '">Join now</button>';
      else if (st === 'upcoming') acts = '<button class="btn btn-ghost btn-sm" data-remind="' + s.id + '">' + (reminders.includes(s.id) ? 'Reminder set' : 'Remind me') + '</button>';
      else acts = s.video ? '<button class="btn btn-ghost btn-sm" data-watch="' + s.video + '">Watch recording</button>' : '<span class="pill warn">Recording soon</span>';
      return '<article class="item ' + (st === 'live' ? 'is-live' : '') + '">' +
        '<div class="date-box"><b>' + d.getDate() + '</b><span>' + d.toLocaleString('en-IN', { month: 'short' }) + '</span></div>' +
        '<div><h3>' + esc(s.title) + '</h3><div class="meta"><span>' + esc(s.mentor) + '</span><span>' + when + '</span><span>' + s.dur + ' min</span><span class="badge">' + esc(s.module) + '</span>' +
        (st === 'live' ? '<span class="pill live">Live now</span>' : st === 'ended' ? (attended.includes(s.id) ? '<span class="pill ok">Attended</span>' : '<span class="pill">Ended</span>') : '') +
        '</div></div><div class="acts">' + acts + '</div></article>';
    }).join('') || '<p class="muted">Nothing here yet.</p>';
    updateLiveDot();
  }
  bindChips('#liveFilter', f => { liveFilter = f; renderLive(); });
  function updateLiveDot() { $('#liveDot').hidden = !SESSIONS.some(s => status(s) === 'live'); }

  /* ----- live classroom ----- */
  const L = { s: null, clock: null, bot: null, slide: null };
  const SLIDES = ["Slide 1: Today's goal", 'Slide 2: Tables and keys', 'Slide 3: INNER JOIN', 'Slide 4: LEFT JOIN', 'Slide 5: Practice time'];
  const BOT = [
    ['Karan S.', 'Can you repeat the difference between INNER and LEFT?'],
    ['Divya P.', 'Is the dataset link in the notes tab?'],
    ['Ananya Rao (Mentor)', 'Yes, check Notes, Module 2. Try the practice query after this slide.'],
    ['Imran K.', 'My query returns duplicates. Same issue as the forum post?'],
    ['Ananya Rao (Mentor)', 'Good catch. Count the rows per key before you join.'],
    ['Neha R.', 'Thanks, this finally makes sense!']
  ];
  let botIdx = 0;
  function chatAdd(name, text, me) {
    const log = $('#chatLog');
    log.insertAdjacentHTML('beforeend', '<div class="msg-b ' + (me ? 'me' : '') + '"><b>' + esc(name) + '</b>' + esc(text) + '</div>');
    log.scrollTop = log.scrollHeight;
  }
  function openLive(id) {
    const s = SESSIONS.find(x => x.id === id); if (!s) return;
    if (status(s) !== 'live') { toast('This class has not started yet.'); return; }
    L.s = s; botIdx = 0;
    $('#liveTitle').textContent = s.title;
    $('#liveMentor').textContent = 'with ' + s.mentor;
    $('#presenter').textContent = initials(s.mentor);
    $('#chatLog').innerHTML = '';
    chatAdd('Ananya Rao (Mentor)', 'Welcome everyone! Type your doubts here and I will pick them up.');
    ['rcMic', 'rcCam', 'rcHand'].forEach(i => { const b = $('#' + i); b.setAttribute('aria-pressed', 'false'); });
    $('#rcMic').textContent = 'Mic on'; $('#rcCam').textContent = 'Camera on'; $('#rcHand').textContent = 'Raise hand';
    let k = 0; $('#liveSlide').textContent = SLIDES[0];
    if (!attended.includes(s.id)) { attended.push(s.id); store.set('attended', attended); }
    $('#liveDlg').showModal();
    const tick = () => { $('#liveClock').textContent = fmt((Date.now() - s.startAt) / 1000); $('#liveCount').textContent = (38 + (Math.floor(Date.now() / 7000) % 5)) + ' learners here'; };
    tick();
    L.clock = setInterval(tick, 1000);
    L.bot = setInterval(() => { const m = BOT[botIdx++ % BOT.length]; chatAdd(m[0], m[1]); }, 6500);
    L.slide = setInterval(() => { k = (k + 1) % SLIDES.length; $('#liveSlide').textContent = SLIDES[k]; }, 20000);
  }
  $('#liveDlg').addEventListener('close', () => {
    clearInterval(L.clock); clearInterval(L.bot); clearInterval(L.slide);
    RENDER[current]();
  });
  $('#rcLeave').addEventListener('click', () => $('#liveDlg').close());
  function toggleRc(id, onText, offText, toastMsg) {
    $('#' + id).addEventListener('click', e => {
      const b = e.currentTarget, p = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', p); b.textContent = p ? offText : onText;
      if (toastMsg && p) toast(toastMsg);
    });
  }
  toggleRc('rcMic', 'Mic on', 'Mic off');
  toggleRc('rcCam', 'Camera on', 'Camera off');
  toggleRc('rcHand', 'Raise hand', 'Hand raised', 'The mentor can see your raised hand.');
  $('#chatForm').addEventListener('submit', e => {
    e.preventDefault();
    const i = $('#chatInput'), v = i.value.trim(); if (!v) return;
    chatAdd('You', v, true); i.value = '';
  });

  /* =======================================================
     RECORDED CLASSES
     ======================================================= */
  const HUES = [['#1b6fb8', '#4aa8f0'], ['#2b8fe0', '#74c3ff'], ['#0f3a63', '#2b8fe0'], ['#1b8fb8', '#6fd0e8']];
  function renderVideos() {
    const list = VIDEOS.filter(v => {
      if (videoFilter === 'progress' && !(vt(v.id) > 0 && !vdone(v.id))) return false;
      if (videoFilter === 'done' && !vdone(v.id)) return false;
      if (videoFilter.indexOf('Module') === 0 && v.module !== videoFilter) return false;
      return v.title.toLowerCase().includes(videoQuery);
    });
    $('#videoGrid').innerHTML = list.map(v => {
      const i = VIDEOS.indexOf(v), c = HUES[i % HUES.length], pct = Math.round(vt(v.id) / v.dur * 100);
      const st = vdone(v.id) ? '<span class="pill ok">Completed</span>' : vt(v.id) > 0 ? '<span class="pill warn">' + pct + '% watched</span>' : '<span class="pill">New</span>';
      return '<button class="vcard" data-watch="' + v.id + '" aria-label="Play ' + esc(v.title) + '">' +
        '<div class="thumb" style="background:linear-gradient(135deg,' + c[0] + ',' + c[1] + ')"><span class="mod">' + v.module + '</span>' +
        '<span class="play"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span><span class="dur">' + fmt(v.dur) + '</span></div>' +
        '<div class="vbody"><h3>' + esc(v.title) + '</h3><div class="meta"><span>' + esc(v.mentor) + '</span>' + st + '</div>' +
        '<div class="bar"><i style="width:' + (vdone(v.id) ? 100 : pct) + '%"></i></div></div></button>';
    }).join('') || '<p class="muted">No recordings match. Try another filter.</p>';
  }
  bindChips('#videoFilter', f => { videoFilter = f; renderVideos(); });
  $('#videoSearch').addEventListener('input', e => { videoQuery = e.target.value.trim().toLowerCase(); renderVideos(); });

  /* ----- player (simulated; swap for a real <video>) ----- */
  const P = { v: null, t: 0, playing: false, speed: 1, timer: null };
  const CHAPTERS = ['Concept', 'Demo', 'Practice'];
  function openPlayer(id) {
    const v = VIDEOS.find(x => x.id === id); if (!v) return;
    P.v = v; P.t = vt(id) >= v.dur - 1 ? 0 : vt(id); P.playing = false; P.speed = 1;
    $('#pSpeed').value = '1';
    $('#pTitle').textContent = v.title; $('#pMentor').textContent = v.mentor + ', ' + v.module;
    $('#pSeek').max = v.dur; $('#pDur').textContent = fmt(v.dur);
    $('#pDone').textContent = vdone(id) ? 'Completed' : 'Mark as complete';
    updatePlayer(); renderMarks();
    $('#playerDlg').showModal();
  }
  function updatePlayer() {
    $('#pTime').textContent = fmt(P.t);
    $('#pSeek').value = P.t;
    $('#pPlay').textContent = P.playing ? 'Pause' : (P.t > 0 ? 'Resume' : 'Play');
    $('#pPlay').setAttribute('aria-label', P.playing ? 'Pause' : 'Play');
    $('#pChapter').textContent = CHAPTERS[Math.min(2, Math.floor(P.t / P.v.dur * 3))];
  }
  function playerTick() {
    P.t = Math.min(P.v.dur, P.t + 0.25 * P.speed);
    if (P.t >= P.v.dur) { setPlaying(false); finishVideo(); }
    updatePlayer();
  }
  function setPlaying(on) {
    P.playing = on; clearInterval(P.timer);
    if (on) P.timer = setInterval(playerTick, 250);
    updatePlayer();
  }
  function saveProgress() {
    if (!P.v) return;
    const done = vdone(P.v.id) || P.t >= P.v.dur * 0.95;
    prog[P.v.id] = { t: P.t, done: done };
    store.set('prog', prog);
  }
  function finishVideo() {
    prog[P.v.id] = { t: P.v.dur, done: true }; store.set('prog', prog);
    $('#pDone').textContent = 'Completed'; toast('Nice work. Recording marked complete.');
  }
  function renderMarks() {
    const m = marks[P.v.id] || [];
    $('#pMarks').innerHTML = m.length ? m.map(t => '<button class="chip" data-seek="' + t + '">Bookmark at ' + fmt(t) + '</button>').join('') : '<span class="muted small">No bookmarks yet.</span>';
  }
  $('#pPlay').addEventListener('click', () => setPlaying(!P.playing));
  $('#pSeek').addEventListener('input', e => { P.t = +e.target.value; updatePlayer(); });
  $('#pSpeed').addEventListener('change', e => { P.speed = +e.target.value; });
  $('#pMark').addEventListener('click', () => {
    const arr = marks[P.v.id] || (marks[P.v.id] = []);
    const t = Math.floor(P.t); if (!arr.includes(t)) arr.push(t);
    arr.sort((a, b) => a - b); store.set('marks', marks); renderMarks(); toast('Bookmarked at ' + fmt(t));
  });
  $('#pMarks').addEventListener('click', e => { const b = e.target.closest('[data-seek]'); if (b) { P.t = +b.dataset.seek; updatePlayer(); } });
  $('#pDone').addEventListener('click', () => { P.t = P.v.dur; setPlaying(false); finishVideo(); updatePlayer(); });
  $('#pClose').addEventListener('click', () => $('#playerDlg').close());
  $('#pNotes').addEventListener('click', () => {
    const id = P.v.id; $('#playerDlg').close(); show('notes');
    $('#noteVideo').value = id; $('#noteTitle').focus();
  });
  $('#playerDlg').addEventListener('close', () => { setPlaying(false); saveProgress(); RENDER[current](); });

  /* =======================================================
     NOTES
     ======================================================= */
  function renderNotes() {
    const q = noteQuery;
    const keepVideo = $('#noteVideo').value;
    $('#noteVideo').innerHTML = '<option value="">No link</option>' + VIDEOS.map(v => '<option value="' + v.id + '">' + esc(v.title) + '</option>').join('');
    $('#noteVideo').value = keepVideo;
    $('#classNotes').innerHTML = CLASS_NOTES.filter(n => (n.title + ' ' + n.module).toLowerCase().includes(q)).map(n =>
      '<div class="note-item"><div><h4>' + esc(n.title) + '</h4><p>' + n.module + ', ' + n.type + ', ' + n.size + '</p></div>' +
      '<div class="acts"><button class="btn btn-ghost btn-sm" data-dl="' + n.id + '">Download</button></div></div>').join('') || '<p class="muted small">No class notes match.</p>';
    const mine = notes.filter(n => (n.title + ' ' + n.body).toLowerCase().includes(q));
    $('#myNotes').innerHTML = mine.map(n => {
      const v = VIDEOS.find(x => x.id === n.video);
      return '<div class="note-item"><div><h4>' + esc(n.title) + '</h4><p>' + esc(n.body) + '</p>' +
        '<p class="small">' + ago(n.at) + (v ? ', linked to ' + esc(v.title) : '') + '</p></div>' +
        '<div class="acts">' + (v ? '<button class="link-btn" data-watch="' + v.id + '">Watch</button>' : '') +
        '<button class="link-btn danger" data-delnote="' + n.id + '">Delete</button></div></div>';
    }).join('') || '<p class="muted small">Your notes will appear here.</p>';
  }
  $('#noteSearch').addEventListener('input', e => { noteQuery = e.target.value.trim().toLowerCase(); renderNotes(); });
  $('#noteForm').addEventListener('submit', e => {
    e.preventDefault();
    const title = $('#noteTitle').value.trim(), body = $('#noteBody').value.trim();
    if (!title || !body) return;
    const video = $('#noteVideo').value;
    notes.unshift({ id: 'u' + Date.now(), title: title, body: body, video: video, at: Date.now() });
    store.set('notes', notes); e.target.reset(); renderNotes(); toast('Note saved.');
  });
  $('#myNotes').addEventListener('click', e => {
    const b = e.target.closest('[data-delnote]'); if (!b) return;
    notes = notes.filter(n => n.id !== b.dataset.delnote); store.set('notes', notes); renderNotes(); toast('Note deleted.');
  });

  /* =======================================================
     COMMUNITY
     ======================================================= */
  const answered = p => p.solved || p.replies.some(r => r.role === 'Mentor');
  function renderCommunity() {
    const list = posts.filter(p => {
      if (postFilter === 'unanswered' && answered(p)) return false;
      if (postFilter === 'solved' && !p.solved) return false;
      if (postFilter === 'mine' && p.author !== ME) return false;
      return (p.title + ' ' + p.body + ' ' + p.tag).toLowerCase().includes(postQuery);
    }).sort((a, b) => b.at - a.at);

    $('#postList').innerHTML = list.map(p => {
      const open = openPosts.has(p.id);
      const replies = open ? '<div class="replies">' + p.replies.map(r =>
        '<div class="reply ' + (r.role === 'Mentor' ? 'mentor' : '') + '"><b>' + esc(r.by) + (r.role === 'Mentor' ? ' (Mentor)' : '') + '</b> <span class="muted small">' + ago(r.at) + '</span><br>' + esc(r.text) + '</div>').join('') +
        '<form class="reply-form" data-reply="' + p.id + '"><input placeholder="Write a reply" aria-label="Reply" maxlength="300" required><button class="btn btn-primary btn-sm" type="submit">Reply</button></form></div>' : '';
      return '<article class="post">' +
        '<button class="vote" data-vote="' + p.id + '" aria-pressed="' + p.voted + '" aria-label="Upvote, ' + p.votes + ' votes"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg><span>' + p.votes + '</span></button>' +
        '<div><h3>' + esc(p.title) + '</h3>' + (p.body ? '<p class="body">' + esc(p.body) + '</p>' : '') +
        '<div class="meta"><span class="badge">' + esc(p.tag) + '</span><span>' + esc(p.author) + '</span><span>' + ago(p.at) + '</span>' +
        (p.solved ? '<span class="pill ok">Solved</span>' : answered(p) ? '<span class="pill">Mentor replied</span>' : '<span class="pill warn">Needs an answer</span>') +
        '<button class="link-btn" data-toggle="' + p.id + '" aria-expanded="' + open + '">' + (open ? 'Hide replies' : p.replies.length + ' ' + (p.replies.length === 1 ? 'reply' : 'replies')) + '</button>' +
        (p.author === ME ? '<button class="link-btn" data-solve="' + p.id + '">' + (p.solved ? 'Reopen' : 'Mark solved') + '</button>' : '') +
        '</div>' + replies + '</div></article>';
    }).join('') || '<div class="panel muted">No questions match. Be the first to ask one.</div>';

    $('#groups').innerHTML = GROUPS.map(g => {
      const j = joined.includes(g.id);
      return '<div class="group"><div><b>' + esc(g.name) + '</b><small>' + esc(g.info) + ', ' + (g.members + (j ? 1 : 0)) + ' members</small></div>' +
        '<button class="btn ' + (j ? 'btn-primary' : 'btn-ghost') + ' btn-sm" data-group="' + g.id + '">' + (j ? 'Joined' : 'Join') + '</button></div>';
    }).join('');
    $('#hours').innerHTML = HOURS.map((h, i) =>
      '<div class="group"><div><b>' + esc(h.who) + '</b><small>' + esc(h.topic) + ', ' + esc(h.when) + '</small></div>' +
      '<button class="btn btn-ghost btn-sm" data-book="' + i + '">Book</button></div>').join('');
  }
  bindChips('#postFilter', f => { postFilter = f; renderCommunity(); });
  $('#postSearch').addEventListener('input', e => { postQuery = e.target.value.trim().toLowerCase(); renderCommunity(); });
  $('#askForm').addEventListener('submit', e => {
    e.preventDefault();
    const title = $('#askTitle').value.trim(); if (!title) return;
    posts.unshift({ id: 'p' + Date.now(), title: title, body: $('#askBody').value.trim(), tag: $('#askTag').value, author: ME, at: Date.now(), votes: 0, voted: false, solved: false, replies: [] });
    store.set('posts', posts); e.target.reset(); postFilter = 'all';
    $$('#postFilter .chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.f === 'all'));
    renderCommunity(); toast('Question posted. A mentor usually replies within a few hours.');
  });
  $('#view-community').addEventListener('click', e => {
    const t = e.target.closest('[data-vote],[data-toggle],[data-solve],[data-group],[data-book]'); if (!t) return;
    if (t.dataset.vote) {
      const p = posts.find(x => x.id === t.dataset.vote); p.voted = !p.voted; p.votes += p.voted ? 1 : -1;
    } else if (t.dataset.toggle) {
      openPosts.has(t.dataset.toggle) ? openPosts.delete(t.dataset.toggle) : openPosts.add(t.dataset.toggle);
    } else if (t.dataset.solve) {
      const p = posts.find(x => x.id === t.dataset.solve); p.solved = !p.solved;
    } else if (t.dataset.group) {
      const id = t.dataset.group; joined = joined.includes(id) ? joined.filter(x => x !== id) : joined.concat(id);
      store.set('groups', joined); toast(joined.includes(id) ? 'You joined the group.' : 'You left the group.');
    } else if (t.dataset.book) {
      const h = HOURS[+t.dataset.book]; toast('Booked: ' + h.who + ', ' + h.when);
    }
    store.set('posts', posts); renderCommunity();
  });
  $('#postList').addEventListener('submit', e => {
    const f = e.target.closest('[data-reply]'); if (!f) return;
    e.preventDefault();
    const input = $('input', f), v = input.value.trim(); if (!v) return;
    posts.find(x => x.id === f.dataset.reply).replies.push({ by: ME, role: 'Student', text: v, at: Date.now() });
    store.set('posts', posts); renderCommunity(); toast('Reply posted.');
  });

  /* =======================================================
     START
     ======================================================= */
  show(location.hash.slice(1) || 'dashboard', false);
  updateLiveDot();
  let ticks = 0;
  setInterval(() => {
    updateCountdown();
    if (++ticks % 20 === 0) {            // refresh statuses every 20 s
      updateLiveDot();
      if (current === 'dashboard') renderDashboard();
      if (current === 'live') renderLive();
    }
  }, 1000);
})();