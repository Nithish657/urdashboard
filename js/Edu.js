/* =========================================================
   urdashboard – edtech features (loaded on index.html and lms.html)
   Landing: why-us, pricing + enrol, demo booking, course syllabus, policies
   LMS: quizzes, certificate, leaderboard, daily goal + streak, planner,
        notifications, mentor dashboard. Data lives in localStorage (ud_*).
   ========================================================= */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var LMS = document.body.classList.contains('lms');
  var ST = {
    get: function (k, d) { try { var v = localStorage.getItem('ud_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('ud_' + k, JSON.stringify(v)); } catch (e) {} }
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function say(m) { var t = document.createElement('div'); t.className = 'ed-toast'; t.textContent = m; document.body.appendChild(t); setTimeout(function () { t.classList.add('show'); }, 20); setTimeout(function () { t.remove(); }, 3200); }
  function dlg(title, html, wide) {
    var d = document.createElement('dialog');
    d.className = 'edu-dlg' + (wide ? ' wide' : '');
    d.innerHTML = '<div class="ed-head"><h3>' + title + '</h3><button class="ed-x" type="button" aria-label="Close">&#10005;</button></div><div class="ed-body">' + html + '</div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('.ed-x')) d.close(); });
    d.addEventListener('close', function () { d.remove(); });
    d.showModal(); return d;
  }
  function nm() { var e = $('[data-user-name]'); return (e && e.textContent.trim()) || 'Learner'; }

  /* ================= LANDING PAGE ================= */
  if (!LMS) {
    var PLANS = [
      { n: 'Free', m: 0, y: 0, f: ['First module of every course', 'Community access', '1 quiz every week'] },
      { n: 'Pro', m: 999, y: 800, hot: 1, f: ['All courses and recordings', 'Unlimited quizzes', 'Verified certificates', 'Weekly mentor feedback'] },
      { n: 'Mentor-led', m: 2499, y: 2000, f: ['Everything in Pro', '1:1 mentor slots', 'Live team projects', 'Mock interviews and placement help'] }
    ];
    var WHY = [['Live mentors', 'Daily classes with people who work in the field.'], ['Project first', 'Build real work instead of only watching videos.'], ['Quizzes and scores', 'Test yourself after every topic and see progress.'], ['Verified certificate', 'Pass the quizzes and download a certificate.'], ['Streaks and goals', 'A daily study goal keeps you on track.'], ['Placement help', 'Mock interviews, resume review and openings.']];
    var html =
      '<section class="why" id="why"><div class="wrap"><div class="sec-head"><h2>Why learners pick urdashboard</h2><p>Simple, practical and built around real projects.</p></div><div class="why-grid">' +
      WHY.map(function (w, i) { return '<div class="why-card"><span class="why-n">' + (i + 1) + '</span><h3>' + w[0] + '</h3><p>' + w[1] + '</p></div>'; }).join('') + '</div></div></section>' +
      '<section id="pricing"><div class="wrap"><div class="sec-head"><h2>Simple pricing</h2><div class="chips" id="billChips" role="group" aria-label="Billing period"><button class="chip" aria-pressed="true" data-b="m">Monthly</button><button class="chip" aria-pressed="false" data-b="y">Yearly (save 20%)</button></div></div><div class="price-grid" id="priceGrid"></div><p class="muted small" style="margin-top:14px">Demo prices for this prototype. No payment is taken.</p></div></section>' +
      '<section id="demo"><div class="wrap"><div class="demo-box"><div><h2>Book a free demo class</h2><p class="lead">Pick a time and a mentor will walk you through a live class and your learning path.</p></div>' +
      '<form id="demoForm" class="demo-form" novalidate><label class="label" for="dN">Name</label><input id="dN" required placeholder="Your name"><label class="label" for="dP">Phone</label><input id="dP" inputmode="tel" required placeholder="10-digit mobile number">' +
      '<label class="label" for="dG">I want to learn</label><select id="dG"><option>Data analytics</option><option>Web development</option><option>AI &amp; ML</option><option>Cybersecurity</option><option>Digital marketing</option></select>' +
      '<label class="label" for="dS">Time slot</label><select id="dS"><option>Today 6:30 pm</option><option>Tomorrow 10:00 am</option><option>Tomorrow 7:00 pm</option><option>Weekend 11:00 am</option></select>' +
      '<button class="btn btn-primary" type="submit">Book my demo</button><p class="msg" id="demoMsg" role="status"></p></form></div></div></section>';
    var faq = document.getElementById('faq'), anchor = faq ? (faq.closest('section') || faq) : $('footer');
    if (anchor) anchor.insertAdjacentHTML('beforebegin', html);

    /* nav + footer links */
    var fl = $('a[href="#faq"]');
    if (fl && fl.parentNode.tagName === 'LI') fl.parentNode.insertAdjacentHTML('beforebegin', '<li><a href="#pricing">Pricing</a></li><li><a href="#demo">Book demo</a></li>');
    var foot = $('footer .fl');
    if (foot) foot.insertAdjacentHTML('beforeend', '<a href="#pricing">Pricing</a><a href="#" data-pol="Terms of use">Terms</a><a href="#" data-pol="Privacy policy">Privacy</a><a href="#" data-pol="Refund policy">Refunds</a>');

    /* pricing */
    var bill = 'm';
    function renderPlans() {
      $('#priceGrid').innerHTML = PLANS.map(function (p) {
        var v = bill === 'y' ? p.y : p.m;
        return '<div class="plan' + (p.hot ? ' hot' : '') + '">' + (p.hot ? '<span class="plan-tag">Most popular</span>' : '') + '<h3>' + p.n + '</h3>' +
          '<div class="plan-price"><b>' + (v ? '&#8377;' + v.toLocaleString('en-IN') : 'Free') + '</b>' + (v ? '<span>/month' + (bill === 'y' ? ', billed yearly' : '') + '</span>' : '') + '</div>' +
          '<ul>' + p.f.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul><button class="btn ' + (p.hot ? 'btn-primary' : 'btn-ghost') + '" data-plan="' + p.n + '">' + (v ? 'Enrol now' : 'Start free') + '</button></div>';
      }).join('');
    }
    renderPlans();
    $('#billChips').addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (!b) return; bill = b.dataset.b; this.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', c === b); }); renderPlans(); });
    $('#priceGrid').addEventListener('click', function (e) {
      var b = e.target.closest('[data-plan]'); if (!b) return;
      var d = dlg('Enrol in ' + b.dataset.plan, '<form class="demo-form" id="enF" novalidate><label class="label" for="eN">Name</label><input id="eN" required placeholder="Your name"><label class="label" for="eE">Email</label><input id="eE" type="email" required placeholder="name@example.com"><button class="btn btn-primary" type="submit">Confirm enrolment</button><p class="msg" role="status"></p></form>');
      $('#enF', d).addEventListener('submit', function (ev) {
        ev.preventDefault(); var n = $('#eN', d).value.trim(), m = $('#eE', d).value.trim(), out = $('.msg', d);
        if (!n || !/^\S+@\S+\.\S+$/.test(m)) { out.textContent = 'Enter your name and a valid email.'; return; }
        ST.set('enrol', { plan: b.dataset.plan, name: n, email: m });
        $('.ed-body', d).innerHTML = '<div class="ok-box"><h4>You are in, ' + esc(n.split(' ')[0]) + '!</h4><p>' + esc(b.dataset.plan) + ' plan selected. Open the LMS to start your first module.</p><a class="btn btn-primary" href="lms.html">Open LMS</a><p class="muted small">Prototype: nothing was sent or charged.</p></div>';
      });
    });

    /* demo booking */
    $('#demoForm').addEventListener('submit', function (e) {
      e.preventDefault(); var n = $('#dN').value.trim(), p = $('#dP').value.replace(/\D/g, ''), out = $('#demoMsg');
      if (!n || p.length < 10) { out.textContent = 'Enter your name and a 10-digit phone number.'; return; }
      var bk = ST.get('demos', []); bk.push({ n: n, g: $('#dG').value, s: $('#dS').value }); ST.set('demos', bk);
      out.textContent = 'Booked, ' + n.split(' ')[0] + '! ' + $('#dG').value + ' demo on ' + $('#dS').value + '. (Prototype: nothing was sent.)'; e.target.reset();
    });

    /* course syllabus */
    var SYL = { 'Data analytics': ['Excel and spreadsheets', 'SQL queries and joins', 'Python basics', 'Dashboards with Power BI', 'Capstone project'], 'Web development': ['HTML and CSS', 'JavaScript essentials', 'React components', 'APIs and Node', 'Deploy your project'], 'AI & ML': ['Python and maths', 'Regression and classification', 'Neural networks', 'Model evaluation', 'Capstone model'], 'Cybersecurity': ['Networking basics', 'Scanning and tools', 'Threat hunting', 'Log analysis', 'Incident report'], 'Digital marketing': ['SEO basics', 'Content strategy', 'Paid ads', 'Analytics', 'Campaign launch'] };
    var grid = document.getElementById('courseGrid');
    if (grid) grid.addEventListener('click', function (e) {
      if (e.target.closest('a')) return; var c = e.target.closest('.course'); if (!c) return;
      var tag = c.querySelector('.badge').textContent, t = c.querySelector('h3').textContent, wk = c.querySelector('.top span:last-child').textContent, ds = c.querySelector('p').textContent;
      var mods = SYL[tag] || SYL['Data analytics'];
      dlg(esc(t), '<p class="muted">' + esc(ds) + '</p><div class="j-meta"><div><b>' + esc(wk) + '</b><span>Duration</span></div><div><b>' + mods.length + '</b><span>Modules</span></div><div><b>Free</b><span>First module</span></div></div>' +
        '<h4>Syllabus</h4><ol class="syl">' + mods.map(function (m, i) { return '<li><span>' + (i + 1) + '</span>' + m + (i ? '' : ' <em>Free</em>') + '</li>'; }).join('') + '</ol>' +
        '<h4>Included</h4><div class="chips"><span class="badge">Live classes</span><span class="badge">Recordings</span><span class="badge">Quizzes</span><span class="badge">Certificate</span><span class="badge">Mentor feedback</span></div>' +
        '<p style="margin-top:16px"><a class="btn btn-primary" href="lms.html">Start free module</a></p>');
    });

    /* policies */
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-pol]'); if (!a) return; e.preventDefault();
      dlg(a.dataset.pol, '<p>This is sample text for a prototype. A real policy would explain how learner data, payments and refunds are handled.</p><ul><li>Your notes and quiz scores stay in your own browser.</li><li>Refunds can be asked for within 7 days of enrolment.</li><li>Contact: support@urdashboard.example</li></ul>');
    });
    return;
  }

  /* ================= LMS ================= */
  function today() { return new Date().toISOString().slice(0, 10); }
  function addPts(n) { ST.set('pts', ST.get('pts', 0) + n); }
  var DEF = [{ t: 'Live class: SQL Joins starts at 6:30 pm', m: 'Reminder', r: 0 }, { t: 'A mentor replied to your community question', m: 'Community', r: 0 }, { t: 'New notes added: Excel cheat sheet', m: 'Notes', r: 0 }];
  function notes() { return ST.get('notes', DEF); }
  function addNote(t, m) { var n = notes(); n.unshift({ t: t, m: m, r: 0 }); ST.set('notes', n.slice(0, 20)); badge(); }
  function badge() { var b = $('#bellN'); if (!b) return; var c = notes().filter(function (x) { return !x.r; }).length; b.textContent = c; b.hidden = !c; }

  var bell = document.createElement('button');
  bell.className = 'icon-btn bell'; bell.id = 'bell'; bell.type = 'button'; bell.setAttribute('aria-label', 'Notifications');
  bell.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0"/></svg><i id="bellN"></i>';
  var who = $('#whoBtn'); if (who) who.parentNode.insertBefore(bell, who);
  bell.onclick = function () {
    var n = notes();
    dlg('Notifications', n.length ? '<ul class="nlist">' + n.map(function (x) { return '<li class="' + (x.r ? '' : 'new') + '"><b>' + esc(x.m) + '</b><span>' + esc(x.t) + '</span></li>'; }).join('') + '</ul>' : '<p>No notifications yet.</p>');
    ST.set('notes', n.map(function (x) { x.r = 1; return x; })); badge();
  };
  badge();

  /* quizzes */
  var Q = {
    SQL: [['Which clause filters rows before grouping?', ['WHERE', 'HAVING', 'ORDER BY'], 0], ['Which JOIN keeps all rows from the left table?', ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN'], 1], ['Which function counts rows?', ['SUM()', 'COUNT()', 'AVG()'], 1], ['What does GROUP BY do?', ['Sorts rows', 'Combines rows with the same value', 'Deletes duplicates'], 1], ['Which keyword removes duplicate results?', ['UNIQUE ROWS', 'DISTINCT', 'ONLY'], 1]],
    Excel: [['Which function looks up a value in a column?', ['VLOOKUP', 'COUNTIF', 'CONCAT'], 0], ['What does $A$1 mean?', ['Relative cell', 'Absolute cell reference', 'Named range'], 1], ['Which tool summarises data quickly?', ['Pivot table', 'Spell check', 'Freeze panes'], 0], ['What does AutoSum do?', ['Adds a range', 'Sorts a range', 'Colours a range'], 0], ['Which chart shows a trend over time?', ['Pie', 'Line', 'Radar'], 1]],
    Python: [['Which creates a list?', ['{1, 2}', '[1, 2]', '(1, 2)'], 1], ['Which function prints text?', ['echo()', 'print()', 'out()'], 1], ['Which keyword starts a function?', ['func', 'def', 'fn'], 1], ['What is len([1, 2, 3])?', ['2', '3', '4'], 1], ['Which loop goes over items?', ['for', 'repeat', 'each'], 0]]
  };
  function pass() { var s = ST.get('scores', {}); return Object.keys(Q).every(function (t) { return (s[t] || 0) >= 60; }); }
  function quizMenu() {
    var s = ST.get('scores', {});
    var d = dlg('Choose a quiz', '<p class="muted">5 questions each. Score 60% or more to pass. Every correct answer earns 10 points.</p><div class="qmenu">' + Object.keys(Q).map(function (t) {
      return '<button class="qbtn" data-q="' + t + '"><b>' + t + '</b><span>' + (s[t] != null ? 'Best: ' + s[t] + '%' + (s[t] >= 60 ? ' (passed)' : '') : 'Not tried yet') + '</span></button>';
    }).join('') + '</div>');
    d.addEventListener('click', function (e) { var b = e.target.closest('[data-q]'); if (b) { d.close(); startQuiz(b.dataset.q); } });
  }
  function startQuiz(topic) {
    var qs = Q[topic], i = 0, sc = 0, d = dlg('Quiz: ' + topic, ''), b = $('.ed-body', d);
    function show() {
      var q = qs[i];
      b.innerHTML = '<p class="muted small">Question ' + (i + 1) + ' of ' + qs.length + '</p><div class="bar"><i style="width:' + (i / qs.length * 100) + '%"></i></div><h4 class="q">' + esc(q[0]) + '</h4><div class="opts">' + q[1].map(function (o, k) { return '<button class="opt" data-k="' + k + '">' + esc(o) + '</button>'; }).join('') + '</div>';
    }
    function done() {
      var pct = Math.round(sc / qs.length * 100), ok = pct >= 60, s = ST.get('scores', {});
      if (pct > (s[topic] || 0)) s[topic] = pct; ST.set('scores', s); addPts(sc * 10); addNote('Quiz ' + topic + ': ' + sc + '/' + qs.length + (ok ? ' - passed' : ' - try again'), 'Quiz');
      b.innerHTML = '<div class="ok-box"><h4>' + (ok ? 'Well done!' : 'Keep practising') + '</h4><p class="score">' + sc + '/' + qs.length + ' (' + pct + '%)</p><p>' + (ok ? 'You passed and earned ' + sc * 10 + ' points.' : 'You need 60% to pass. Review the recording and try again.') + '</p>' + (pass() ? '<p><b>All quizzes passed. Your certificate is ready.</b></p>' : '') + '<div class="row"><button class="btn btn-primary btn-sm" data-a="again">Try again</button><button class="btn btn-ghost btn-sm" data-a="cert">Certificate</button></div></div>';
      render();
    }
    b.addEventListener('click', function (e) {
      var a = e.target.closest('[data-a]'); if (a) { d.close(); a.dataset.a === 'again' ? startQuiz(topic) : cert(); return; }
      var o = e.target.closest('.opt'); if (!o || o.disabled) return; var k = +o.dataset.k, q = qs[i];
      [].forEach.call(b.querySelectorAll('.opt'), function (x) { x.disabled = true; if (+x.dataset.k === q[2]) x.classList.add('right'); });
      if (k === q[2]) sc++; else o.classList.add('wrong');
      setTimeout(function () { i++; i < qs.length ? show() : done(); }, 900);
    });
    show();
  }

  /* certificate */
  function cert() {
    var s = ST.get('scores', {});
    if (!pass()) {
      dlg('Certificate', '<p>Pass all three quizzes with 60% or more to unlock your certificate.</p><ul class="nlist">' + Object.keys(Q).map(function (t) { return '<li class="' + ((s[t] || 0) >= 60 ? '' : 'new') + '"><b>' + t + '</b><span>' + ((s[t] || 0) >= 60 ? 'Passed (' + s[t] + '%)' : 'Not passed yet') + '</span></li>'; }).join('') + '</ul><button class="btn btn-primary" data-go="quiz">Take a quiz</button>')
        .addEventListener('click', function (e) { if (e.target.closest('[data-go]')) { this.close(); quizMenu(); } });
      return;
    }
    var name = nm(), date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), h = 0;
    (name + 'DAF').split('').forEach(function (ch) { h = (h * 31 + ch.charCodeAt(0)) >>> 0; });
    var id = 'UD-' + h.toString(36).toUpperCase().padStart(7, '0');
    var d = dlg('Your certificate', '<canvas id="certC" width="1200" height="850" class="certc"></canvas><p class="muted small">Verification ID: ' + id + '</p><button class="btn btn-primary" id="certDl">Download certificate</button>', 1);
    var c = $('#certC', d), x = c.getContext('2d'), F = '"Bricolage Grotesque","Trebuchet MS",sans-serif';
    x.fillStyle = '#fff'; x.fillRect(0, 0, 1200, 850);
    x.strokeStyle = '#2b8fe0'; x.lineWidth = 14; x.strokeRect(30, 30, 1140, 790); x.strokeStyle = '#ffb84d'; x.lineWidth = 4; x.strokeRect(54, 54, 1092, 742);
    x.textAlign = 'center'; x.fillStyle = '#1b6fb8'; x.font = '800 40px ' + F; x.fillText('urdashboard', 600, 140);
    x.fillStyle = '#0f2a43'; x.font = '800 62px ' + F; x.fillText('Certificate of Completion', 600, 260);
    x.fillStyle = '#47627c'; x.font = '28px ' + F; x.fillText('This is to certify that', 600, 340);
    x.fillStyle = '#2b8fe0'; x.font = '800 76px ' + F; x.fillText(name, 600, 440);
    x.fillStyle = '#47627c'; x.font = '28px ' + F; x.fillText('has completed the course', 600, 510);
    x.fillStyle = '#0f2a43'; x.font = '700 44px ' + F; x.fillText('Data Analytics Foundations', 600, 580);
    x.fillStyle = '#47627c'; x.font = '24px ' + F; x.fillText('Quizzes passed: SQL ' + s.SQL + '%, Excel ' + s.Excel + '%, Python ' + s.Python + '%', 600, 640);
    x.font = '22px ' + F; x.fillText('Issued ' + date + '   |   ID ' + id, 600, 740);
    $('#certDl', d).onclick = function () { c.toBlob(function (bl) { var a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = 'urdashboard-certificate.png'; a.click(); }); };
  }

  /* leaderboard */
  function board() {
    var rows = [['Meera K.', 420], ['Rohit S.', 385], ['Farah A.', 350], ['Aditya P.', 310], ['Neha R.', 270], ['You', ST.get('pts', 0)]].sort(function (a, b) { return b[1] - a[1]; }), mx = rows[0][1] || 1;
    dlg('Weekly leaderboard', '<p class="muted">Earn points from quizzes and daily goals.</p><ol class="lb">' + rows.map(function (r, i) {
      return '<li class="' + (r[0] === 'You' ? 'me' : '') + '"><span class="rk">' + (i + 1) + '</span><b>' + r[0] + '</b><div class="bar"><i style="width:' + Math.round(r[1] / mx * 100) + '%"></i></div><em>' + r[1] + ' pts</em></li>';
    }).join('') + '</ol>');
  }

  /* planner */
  function planner() {
    var d = dlg('Study planner', '<form class="row" id="plF"><input id="plI" placeholder="Add a task, e.g. Finish SQL notes" maxlength="80" required><button class="btn btn-primary btn-sm" type="submit">Add</button></form><ul class="tasks" id="plL"></ul>');
    function paint() {
      var t = ST.get('tasks', [{ t: 'Watch the SQL joins recording', d: 0 }, { t: 'Take the Excel quiz', d: 0 }]);
      $('#plL', d).innerHTML = t.length ? t.map(function (x, i) { return '<li class="' + (x.d ? 'done' : '') + '"><label><input type="checkbox" data-i="' + i + '"' + (x.d ? ' checked' : '') + '> ' + esc(x.t) + '</label><button class="link-btn danger" data-del="' + i + '">Delete</button></li>'; }).join('') : '<li class="muted">No tasks. Add one above.</li>';
      ST.set('tasks', t);
    }
    $('#plF', d).onsubmit = function (e) { e.preventDefault(); var t = ST.get('tasks', []); t.push({ t: $('#plI', d).value.trim(), d: 0 }); ST.set('tasks', t); this.reset(); paint(); };
    d.addEventListener('click', function (e) {
      var t = ST.get('tasks', []), c = e.target.closest('[data-i]'), x = e.target.closest('[data-del]');
      if (c) { t[+c.dataset.i].d = c.checked ? 1 : 0; ST.set('tasks', t); paint(); } if (x) { t.splice(+x.dataset.del, 1); ST.set('tasks', t); paint(); }
    });
    paint();
  }

  /* mentor dashboard (demo view) */
  function mentorDash() {
    var up = ST.get('uploads', []);
    var d = dlg('Mentor dashboard (demo)', '<div class="j-meta"><div><b>128</b><span>Learners</span></div><div><b>4</b><span>Classes this week</span></div><div><b>6</b><span>Open doubts</span></div></div>' +
      '<h4>Upcoming classes</h4><ul class="nlist"><li><b>Today 6:30 pm</b><span>SQL Joins, 42 registered</span></li><li><b>Tomorrow 7:00 pm</b><span>Excel pivot tables, 35 registered</span></li></ul>' +
      '<h4>Upload a recording or notes</h4><form class="row" id="upF"><input id="upT" placeholder="Title" required maxlength="60"><select id="upK" aria-label="Type"><option>Recording</option><option>Notes</option></select><button class="btn btn-primary btn-sm" type="submit">Add</button></form><ul class="nlist" id="upL"></ul>', 1);
    function paint() { $('#upL', d).innerHTML = ST.get('uploads', []).map(function (u) { return '<li><b>' + esc(u.k) + '</b><span>' + esc(u.t) + '</span></li>'; }).join(''); }
    $('#upF', d).onsubmit = function (e) { e.preventDefault(); var u = ST.get('uploads', []); u.unshift({ t: $('#upT', d).value.trim(), k: $('#upK', d).value }); ST.set('uploads', u); addNote('New ' + $('#upK', d).value.toLowerCase() + ' added: ' + $('#upT', d).value.trim(), 'Mentor'); this.reset(); paint(); };
    paint();
  }

  /* dashboard panel: tools + daily goal */
  var host = $('#view-dashboard .welcome');
  if (host) {
    host.insertAdjacentHTML('afterend', '<div class="tools" id="tools"><div class="panel goal" id="goalCard"></div><div class="tool-grid">' +
      [['quiz', 'Take a quiz', 'Test a topic and earn points'], ['cert', 'Certificate', 'Unlocks when all quizzes pass'], ['board', 'Leaderboard', 'See where you rank'], ['plan', 'Study planner', 'Plan your week'], ['mentor', 'Mentor view', 'Demo dashboard for mentors']].map(function (t) {
        return '<button class="tool" data-t="' + t[0] + '"><b>' + t[1] + '</b><span>' + t[2] + '</span></button>';
      }).join('') + '</div></div>');
    $('#tools').addEventListener('click', function (e) {
      var t = e.target.closest('[data-t]'), g = e.target.closest('[data-m]');
      if (g) addMin(+g.dataset.m);
      if (t) ({ quiz: quizMenu, cert: cert, board: board, plan: planner, mentor: mentorDash })[t.dataset.t]();
    });
  }
  function goal() { var g = ST.get('goal', { d: today(), m: 0, s: 0, l: '' }); if (g.d !== today()) { g.d = today(); g.m = 0; } return g; }
  function addMin(n) {
    var g = goal(), was = g.m >= 30; g.m = Math.min(g.m + n, 120);
    if (!was && g.m >= 30) { var y = new Date(Date.now() - 864e5).toISOString().slice(0, 10); g.s = g.l === y ? g.s + 1 : (g.l === today() ? g.s : 1); g.l = today(); addNote('Daily goal done. Streak: ' + g.s + ' day(s)', 'Goal'); addPts(5); say('Daily goal reached! +5 points'); }
    ST.set('goal', g); render();
  }
  function render() {
    var c = $('#goalCard'); if (!c) return; var g = goal(), p = Math.min(100, Math.round(g.m / 30 * 100));
    c.innerHTML = '<h2 class="h-sm">Daily goal</h2><p class="streak"><b>' + g.s + '</b> day streak &middot; <b>' + ST.get('pts', 0) + '</b> points</p><div class="bar"><i style="width:' + p + '%"></i></div><p class="muted small">' + g.m + ' of 30 minutes studied today' + (g.m >= 30 ? ' - goal done!' : '') + '</p><div class="row"><button class="btn btn-ghost btn-sm" data-m="10">+10 min</button><button class="btn btn-ghost btn-sm" data-m="30">+30 min</button></div>';
  }
  render();
})();