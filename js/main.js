/* =========================================================
   urdashboard – landing page behaviour (index.html)
   ========================================================= */
(function () {
  'use strict';

  /* ---------- data (edit these to change content) ---------- */
  var PATHS = {
    data:  { name: 'Data analytics',    stops: ['Excel & SQL', 'Python basics', 'Dashboards', 'Portfolio'],        dur: [20, 14, 10], proj: [8, 6, 4], end: 'Junior Data Analyst' },
    web:   { name: 'Web development',   stops: ['HTML & CSS', 'JavaScript', 'React apps', 'Deploy & hire'],         dur: [22, 15, 10], proj: [9, 7, 5], end: 'Frontend Developer' },
    ai:    { name: 'AI & ML',           stops: ['Python & maths', 'ML models', 'Deep learning', 'Capstone'],        dur: [26, 18, 12], proj: [7, 6, 4], end: 'ML Associate' },
    cyber: { name: 'Cybersecurity',     stops: ['Networking', 'Security tools', 'Threat hunting', 'Incident report'], dur: [22, 16, 11], proj: [6, 5, 4], end: 'SOC Analyst (L1)' },
    mkt:   { name: 'Digital marketing', stops: ['SEO & content', 'Paid ads', 'Analytics', 'Campaign launch'],       dur: [14, 10, 7],  proj: [6, 5, 3], end: 'Marketing Executive' }
  };
  var COURSES = [
    { t: 'Data Analytics Foundations', c: 'data',  d: 'Excel, SQL and Power BI with retail and finance datasets.', w: '12 weeks', a: 55 },
    { t: 'Python for Everyone',        c: 'data',  d: 'Write clean Python and automate real office tasks.',        w: '6 weeks',  a: 30 },
    { t: 'Full-Stack Web Bootcamp',    c: 'web',   d: 'HTML, CSS, JavaScript, Node and a deployed capstone.',      w: '16 weeks', a: 80 },
    { t: 'Frontend with React',        c: 'web',   d: 'Components, state and API calls. Ship three apps.',         w: '8 weeks',  a: 60 },
    { t: 'Machine Learning Essentials',c: 'ai',    d: 'Regression to neural nets with guided notebooks.',          w: '12 weeks', a: 70 },
    { t: 'Generative AI for Work',     c: 'ai',    d: 'Prompting, automation and building small AI tools.',        w: '4 weeks',  a: 35 },
    { t: 'Ethical Hacking Starter',    c: 'cyber', d: 'Lab-based intro to scanning, exploits and defence.',        w: '10 weeks', a: 60 },
    { t: 'SOC Analyst Track',          c: 'cyber', d: 'Logs, alerts and incident response in a mock SOC.',         w: '12 weeks', a: 75 },
    { t: 'Performance Marketing',      c: 'mkt',   d: 'Run budgeted ad campaigns and read the numbers.',           w: '6 weeks',  a: 45 },
    { t: 'SEO & Content Strategy',     c: 'mkt',   d: 'Rank a real blog from zero with weekly targets.',           w: '5 weeks',  a: 40 }
  ];

  var stopX = [30, 170, 300, 410], stopY = [160, 110, 70, 28];
  var goal = 'data', level = 0, filter = 'all', query = '';

  function $(id) { return document.getElementById(id); }

  /* ---------- chip groups ---------- */
  function bindChips(id, cb) {
    var box = $(id);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      box.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', c === b); });
      cb(b.dataset.v !== undefined ? b.dataset.v : b.dataset.f);
    });
  }

  /* ---------- path finder ---------- */
  function renderFlight() {
    var p = PATHS[goal], g = $('stops');
    g.innerHTML = '';
    p.stops.forEach(function (s, i) {
      var x = stopX[i], y = stopY[i];
      var anchor = i === 3 ? 'end' : (i === 0 ? 'start' : 'middle');
      var skipped = i < level; // experienced learners skip early altitudes
      g.insertAdjacentHTML('beforeend',
        '<circle cx="' + x + '" cy="' + y + '" r="' + (skipped ? 5 : 8) + '" fill="' + (skipped ? '#cfe6f7' : '#fff') + '" stroke="' + (skipped ? '#9ec9ea' : '#2b8fe0') + '" stroke-width="3"/>' +
        '<text class="stop-label" x="' + x + '" y="' + (y + 26) + '" text-anchor="' + anchor + '" opacity="' + (skipped ? 0.45 : 1) + '">' + s.replace('&', '&amp;') + '</text>' +
        '<text class="stop-sub" x="' + x + '" y="' + (y + 40) + '" text-anchor="' + anchor + '" opacity="' + (skipped ? 0.45 : 1) + '">' + (skipped ? 'Skip' : 'Altitude ' + (i + 1)) + '</text>');
    });
    var plane = $('plane');
    plane.style.transition = 'transform .8s cubic-bezier(.3,.8,.3,1)';
    plane.setAttribute('transform', 'translate(' + stopX[level] + ',' + stopY[level] + ')');
    $('sDur').textContent = p.dur[level] + ' weeks';
    $('sProj').textContent = p.proj[level];
    $('sEnd').textContent = p.end;
  }
  bindChips('goalChips', function (v) { goal = v; renderFlight(); });
  bindChips('levelChips', function (v) { level = +v; renderFlight(); });
  renderFlight();

  /* ---------- courses ---------- */
  function renderCourses() {
    var list = COURSES.filter(function (c) {
      return (filter === 'all' || c.c === filter) && (c.t + ' ' + c.d).toLowerCase().indexOf(query) !== -1;
    });
    $('courseGrid').innerHTML = list.length ? list.map(function (c) {
      var top = c.a >= 70 ? 'Summit' : c.a >= 50 ? 'Cruise' : 'Lift-off';
      return '<article class="course">' +
        '<div class="top"><span class="badge">' + PATHS[c.c].name + '</span><span>' + c.w + '</span></div>' +
        '<h3>' + c.t.replace('&', '&amp;') + '</h3><p>' + c.d + '</p>' +
        '<div class="alt"><span>Reaches</span><div class="meter"><i style="width:' + c.a + '%"></i></div><span>' + top + '</span></div>' +
        '<div class="foot"><span>Free first module</span><a href="lms.html">Try it</a></div></article>';
    }).join('') : '<div class="empty">No course matches that search. Try a broader word like "web" or "data".</div>';
  }
  bindChips('courseTabs', function (v) { filter = v; renderCourses(); });
  $('q').addEventListener('input', function (e) { query = e.target.value.trim().toLowerCase(); renderCourses(); });
  renderCourses();

  /* ---------- animated counters ---------- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = +el.dataset.count, dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
    var t0 = performance.now(), dur = 1400;
    (function tick(now) {
      var p = Math.min((now - t0) / dur, 1), v = end * (1 - Math.pow(1 - p, 3));
      el.textContent = (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN')) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });

  /* ---------- testimonial slider ---------- */
  (function () {
    var qs = Array.prototype.slice.call(document.querySelectorAll('.quote')), dots = $('dots'), i = 0, timer;
    qs.forEach(function (_, n) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Show story ' + (n + 1));
      b.onclick = function () { show(n); reset(); };
      dots.appendChild(b);
    });
    function show(n) {
      i = n;
      qs.forEach(function (q, k) { q.classList.toggle('on', k === n); });
      Array.prototype.forEach.call(dots.children, function (d, k) { d.setAttribute('aria-current', k === n); });
    }
    function reset() { clearInterval(timer); timer = setInterval(function () { show((i + 1) % qs.length); }, 6000); }
    show(0); reset();
  })();

  /* ---------- mobile menu ---------- */
  var menu = $('menu'), burger = $('burger');
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  });

  /* ---------- email form (prototype only, nothing is sent) ---------- */
  $('joinForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('email').value.trim(), m = $('msg');
    if (!/^\S+@\S+\.\S+$/.test(v)) { m.textContent = 'Enter a valid email, like name@example.com.'; return; }
    m.textContent = 'Route sent to ' + v + '. (Prototype: nothing was actually sent.)';
    e.target.reset();
  });

  /* ---------- project cards: open a detail dialog ---------- */
  var PROJECTS = {
    data:  { tag: 'Data analytics', t: 'Retail demand dashboard', d: 'Clean a messy sales dataset and build a dashboard a store manager can use on Monday morning.',
             build: ['Clean 50,000 rows of sales data with SQL and Excel', 'Find the top and slowest products by week', 'Build a Power BI dashboard with filters', 'Present your findings in a 5-minute demo'],
             skills: ['SQL', 'Excel', 'Power BI', 'Storytelling'], dur: '3 weeks', team: 'Team of 4', mentor: 'Ananya Rao' },
    web:   { tag: 'Web development', t: 'Booking site for a local clinic', d: 'Design, build and deploy a responsive appointment page with form validation.',
             build: ['Design a mobile-first layout in HTML and CSS', 'Add a booking form with clear validation messages', 'Store appointments with a small Node API', 'Deploy it and share the live link'],
             skills: ['HTML & CSS', 'JavaScript', 'Node', 'Deployment'], dur: '4 weeks', team: 'Team of 3', mentor: 'Karthik Menon' },
    cyber: { tag: 'Cybersecurity', t: 'Phishing triage lab', d: 'Investigate sample emails, flag indicators and write an incident report.',
             build: ['Read email headers and trace the sender', 'Check links and attachments in a safe sandbox', 'Rate each email as safe, suspicious or malicious', 'Write a one-page incident report'],
             skills: ['Email analysis', 'Threat intel', 'Reporting'], dur: '2 weeks', team: 'Solo + mentor', mentor: 'Sana Basha' }
  };
  var jd = document.createElement('dialog');
  jd.className = 'jdlg'; jd.id = 'projDlg'; jd.setAttribute('aria-labelledby', 'jTitle');
  document.body.appendChild(jd);
  function openProject(key) {
    var p = PROJECTS[key]; if (!p) return;
    jd.innerHTML =
      '<div class="j-head"><button class="p-x" data-j-close>Close</button><span class="badge">' + p.tag + '</span><h3 id="jTitle">' + p.t + '</h3><p>' + p.d + '</p></div>' +
      '<div class="j-body"><div class="j-meta"><div><b>' + p.dur + '</b><span>Duration</span></div><div><b>' + p.team + '</b><span>Format</span></div><div><b>' + p.mentor.split(' ')[0] + '</b><span>Your mentor</span></div></div>' +
      '<div><h4>What you will build</h4><ul>' + p.build.map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ul></div>' +
      '<div><h4>Skills you prove</h4><div class="chips">' + p.skills.map(function (s) { return '<span class="badge">' + s + '</span>'; }).join('') + '</div></div>' +
      '<div class="j-acts"><a class="btn btn-primary" id="projStart" href="lms.html#community">Start this project</a><button class="btn btn-ghost" data-j-close>Maybe later</button></div></div>';
    jd.showModal();
  }
  jd.addEventListener('click', function (e) { if (e.target === jd || e.target.closest('[data-j-close]')) jd.close(); });
  document.addEventListener('click', function (e) { if (e.target.closest('#projStart')) jd.close(); }, true);
  var projBox = document.querySelector('.projects');
  if (projBox) {
    projBox.addEventListener('click', function (e) { var c = e.target.closest('[data-proj]'); if (c) openProject(c.dataset.proj); });
    projBox.addEventListener('keydown', function (e) {
      var c = e.target.closest('[data-proj]');
      if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openProject(c.dataset.proj); }
    });
  }

  /* ---------- mentor cards: open a full profile ---------- */
  var MENTORS = {
    'Ananya Rao': { role: 'Senior data analyst', exp: '9 yrs', mentees: '620+', rating: '4.9', slot: '6:30 pm',
      bio: 'Ananya turns messy business data into dashboards that managers act on. She has led analytics for retail and finance teams and now coaches learners on cleaning data, writing SQL and telling a clear story with numbers.',
      time: [['2023 – now', 'Senior data analyst', 'Leads demand and pricing dashboards for a retail group'], ['2019 – 2023', 'Data analyst', 'Built weekly sales reporting in SQL and Power BI'], ['2017 – 2019', 'Business analyst', 'Started in operations reporting with Excel']],
      skills: ['SQL', 'Excel', 'Power BI', 'Data cleaning', 'Storytelling'], courses: ['Data Analytics Foundations', 'Python for Everyone'], langs: 'English, Hindi, Telugu' },
    'Karthik Menon': { role: 'Full-stack engineer', exp: '8 yrs', mentees: '540+', rating: '4.8', slot: '7:00 pm',
      bio: 'Karthik ships web products from design to deployment. He reviews learner code line by line and focuses on clean layouts, readable JavaScript and shipping something live every few weeks.',
      time: [['2022 – now', 'Full-stack engineer', 'Builds booking and payments flows for a health-tech startup'], ['2019 – 2022', 'Frontend developer', 'Led a React component library used by four teams'], ['2018 – 2019', 'Junior developer', 'Maintained client websites in HTML, CSS and JavaScript']],
      skills: ['HTML & CSS', 'JavaScript', 'React', 'Node', 'Deployment'], courses: ['Full-Stack Web Bootcamp', 'Frontend with React'], langs: 'English, Malayalam, Tamil' },
    'Sana Basha': { role: 'Security analyst', exp: '7 yrs', mentees: '410+', rating: '4.8', slot: '8:15 pm',
      bio: 'Sana works in a security operations centre, triaging alerts and writing incident reports. She teaches learners to read logs calmly, spot phishing and explain a threat in plain language.',
      time: [['2023 – now', 'Security analyst (L2)', 'Investigates alerts and writes incident reports in a SOC'], ['2020 – 2023', 'Security analyst (L1)', 'Monitored logs and ran phishing triage'], ['2019 – 2020', 'Network support engineer', 'Managed firewalls and access rules']],
      skills: ['Log analysis', 'Phishing triage', 'Incident response', 'Networking', 'Threat intel'], courses: ['Ethical Hacking Starter', 'SOC Analyst Track'], langs: 'English, Hindi, Urdu' },
    'Pranav Nair': { role: 'ML engineer', exp: '6 yrs', mentees: '350+', rating: '4.7', slot: '9:00 pm',
      bio: 'Pranav trains and ships machine learning models. He keeps the maths friendly, insists on a baseline before anything fancy, and helps learners turn a notebook into a small working tool.',
      time: [['2023 – now', 'ML engineer', 'Deploys forecasting and recommendation models'], ['2020 – 2023', 'Data scientist', 'Built churn and demand models in Python'], ['2019 – 2020', 'Research assistant', 'Worked on text classification experiments']],
      skills: ['Python', 'Machine learning', 'Deep learning', 'Model deployment', 'Statistics'], courses: ['Machine Learning Essentials', 'Generative AI for Work'], langs: 'English, Malayalam, Hindi' }
  };
  var md = document.createElement('dialog');
  md.className = 'jdlg'; md.id = 'mentorDlg'; md.setAttribute('aria-labelledby', 'mTitle');
  document.body.appendChild(md);
  function openMentor(card) {
    var name = card.querySelector('h3').textContent, m = MENTORS[name]; if (!m) return;
    var av = card.querySelector('.avatar'), ini = av.textContent, bg = av.style.background || '#2b8fe0';
    md.innerHTML =
      '<div class="j-head m-prof"><button class="p-x" data-m-close>Close</button><div class="m-id"><div class="avatar m-av" style="background:' + bg + '">' + ini + '</div><div><span class="badge">Mentor</span><h3 id="mTitle">' + name + '</h3><p>' + m.role + '</p></div></div></div>' +
      '<div class="j-body"><div class="j-meta"><div><b>' + m.exp + '</b><span>Experience</span></div><div><b>' + m.mentees + '</b><span>Learners mentored</span></div><div><b>' + m.rating + '/5</b><span>Rating</span></div></div>' +
      '<div><h4>About</h4><p class="m-bio">' + m.bio + '</p></div>' +
      '<div><h4>Experience</h4><ol class="tl">' + m.time.map(function (t) { return '<li><b>' + t[1] + '</b><span>' + t[0] + '</span><p>' + t[2] + '</p></li>'; }).join('') + '</ol></div>' +
      '<div><h4>Skills</h4><div class="chips">' + m.skills.map(function (s) { return '<span class="badge">' + s + '</span>'; }).join('') + '</div></div>' +
      '<div><h4>Mentors on</h4><ul>' + m.courses.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul></div>' +
      '<p class="m-bio"><b>Languages:</b> ' + m.langs + '. <span class="muted">Sample profile for this prototype.</span></p>' +
      '<div class="j-acts"><a class="btn btn-primary" href="lms.html#community">Book a 20-min slot (free at ' + m.slot + ')</a><button class="btn btn-ghost" data-m-close>Close</button></div></div>';
    md.showModal();
  }
  md.addEventListener('click', function (e) { if (e.target === md || e.target.closest('[data-m-close]')) md.close(); });
  var mBox = document.querySelector('.mentors');
  if (mBox) {
    Array.prototype.forEach.call(mBox.querySelectorAll('.mentor'), function (c) { c.setAttribute('role', 'button'); c.setAttribute('tabindex', '0'); c.setAttribute('aria-haspopup', 'dialog'); });
    mBox.addEventListener('click', function (e) { if (e.target.closest('.slot')) return; var c = e.target.closest('.mentor'); if (c) openMentor(c); });
    mBox.addEventListener('keydown', function (e) { var c = e.target.closest('.mentor'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openMentor(c); } });
  }
})();