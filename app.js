// DRAXIS landing — live mock data, tabs, demo loop, scroll reveal, demo form.
(() => {
  const CONTACT_EMAIL = ""; // <-- put your email here, e.g. "hello@draxis.io"

  const $ = (s) => document.querySelector(s);
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- hero live numbers + activity feed
  const AV = ['#FFB224', '#6E9BFF', '#3DD68C', '#F2615C', '#C58CFF', '#5ED3E6'];
  const EVENTS = [
    ['SL', 'Sarah L. hired a CDL-A driver · Atlas', 'Hire', 'pg'],
    ['KM', 'Kevin M. checked in 07:58 · Keystone', 'On time', 'pg'],
    ['MG', 'Missed call returned in 4 min · Redline', 'Call', 'pb'],
    ['AK', 'Aziz K. flagged for a knowledge gap', 'Coaching', 'pa'],
    ['DR', 'Lead verified on WhatsApp · Atlas', 'Verified', 'pg'],
    ['JW', 'Jamal W. no-show · Keystone dispatch', 'No-show', 'pr'],
    ['OP', 'Olivia P. booked 3 orientations · Redline', 'Leads', 'pb'],
    ['BT', 'Attendance correction approved · Atlas', 'Fixed', 'pa'],
  ];
  const feed = $('#feed');
  function renderFeed(off, animate) {
    feed.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const e = EVENTS[(off + i) % EVENTS.length];
      const row = document.createElement('div');
      row.className = 'row';
      if (animate && i === 0) row.style.animation = 'up .6s cubic-bezier(.2,.7,.2,1) both';
      row.innerHTML = `<span class="av" style="background:${AV[(off + i) % AV.length]}">${e[0]}</span>` +
        `<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e[1]}</span>` +
        `<span class="pill ${e[3]}">${e[2]}</span>`;
      feed.appendChild(row);
    }
  }
  let sec = 0, off = 0;
  renderFeed(0, false);
  setInterval(() => {
    sec++;
    $('#kCalls').textContent = fmt(1284 + sec * 0.9);
    $('#kIn').textContent = Math.min(136, 131 + Math.floor(sec / 9));
    $('#kLeads').textContent = fmt(742 + Math.floor(sec / 6));
    if (sec % 3 === 0) { off = (off + EVENTS.length - 1) % EVENTS.length; renderFeed(off, !reduce); }
  }, 1000);

  // ---- HR workspace tabs with animated counters
  const CO = [
    { calls: 3412, talk: 186, hires: 38, trucks: 31, f: [742, 518, 214, 61, 38] },
    { calls: 2876, talk: 151, hires: 29, trucks: 24, f: [615, 431, 177, 49, 29] },
    { calls: 1954, talk: 97, hires: 17, trucks: 15, f: [408, 276, 109, 30, 17] },
  ];
  const FL = ['Leads', 'Contacted', 'Qualified', 'Orientation', 'Hired'];
  const fun = $('#funnel');
  fun.style.display = 'flex'; fun.style.flexDirection = 'column'; fun.style.gap = '14px';
  FL.forEach((l, i) => {
    fun.insertAdjacentHTML('beforeend', `<div><div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px"><span style="color:#A5B1C9">${l}</span><b class="mono" style="font-size:14px" id="fv${i}">0</b></div><div class="meter"><i id="fb${i}" style="width:0;background:${i === 4 ? '#3DD68C' : '#FFB224'};opacity:${1 - i * 0.12}"></i></div></div>`);
  });
  let cur = { calls: 0, talk: 0, hires: 0, trucks: 0, f: [0, 0, 0, 0, 0] }, anim;
  function showCompany(i) {
    document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(+t.dataset.co === i)));
    const from = JSON.parse(JSON.stringify(cur)), to = CO[i], t0 = performance.now(), D = reduce ? 1 : 700;
    cancelAnimationFrame(anim);
    const step = (now) => {
      const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
      const lerp = (a, b) => a + (b - a) * e;
      cur = { calls: lerp(from.calls, to.calls), talk: lerp(from.talk, to.talk), hires: lerp(from.hires, to.hires),
              trucks: lerp(from.trucks, to.trucks), f: to.f.map((v, j) => lerp(from.f[j], v)) };
      $('#cCalls').textContent = fmt(cur.calls); $('#cTalk').textContent = fmt(cur.talk) + 'h';
      $('#cHires').textContent = fmt(cur.hires); $('#cTrucks').textContent = fmt(cur.trucks);
      cur.f.forEach((v, j) => { $('#fv' + j).textContent = fmt(v); $('#fb' + j).style.width = (v / 742 * 100) + '%'; });
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }
  document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => { userPicked = true; showCompany(+t.dataset.co); }));
  let userPicked = false, coIdx = 0;
  // cycle companies on its own until the visitor clicks a tab
  setInterval(() => { if (!userPicked && !reduce) { coIdx = (coIdx + 1) % 3; showCompany(coIdx); } }, 5000);

  // ---- lead verification loop
  const NUM = '+1 (312) 555-0148';
  let vt = 0;
  const vBtn = $('#vBtn'), vDone = $('#vDone'), vChk = $('#vChecking'), vTyped = $('#vTyped'), vPh = $('#vPh');
  function verifyFrame() {
    const p = vt % 40, n = Math.max(0, Math.min(NUM.length, p - 3));
    vTyped.textContent = NUM.slice(0, n); vPh.hidden = n > 0;
    const checking = p >= 21 && p < 27, done = p >= 27;
    vChk.hidden = !checking; vDone.hidden = !done;
    if (done && p === 27) vDone.querySelectorAll('.row').forEach((r) => { r.classList.remove('rise'); void r.offsetWidth; r.classList.add('rise'); });
    vBtn.textContent = done ? '✓ Verified' : checking ? 'Checking…' : 'Verify number';
    vBtn.style.cssText = done ? 'background:#3DD68C;border-color:#3DD68C;color:#03150C;min-height:40px'
                              : 'background:#FFB224;border-color:#FFB224;color:#1B1300;min-height:40px';
    vt++;
  }
  if (reduce) { vt = 30; verifyFrame(); } else { verifyFrame(); setInterval(verifyFrame, 250); }

  // ---- scroll reveal (+ start HR counters when visible)
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  const hrIO = new IntersectionObserver((en) => { if (en[0].isIntersecting) { showCompany(0); hrIO.disconnect(); } }, { threshold: 0.3 });
  hrIO.observe(document.querySelector('[data-co="0"]').closest('.card'));

  // ---- contact
  const mailLink = $('#mailLink'), note = $('#formNote');
  if (CONTACT_EMAIL) { mailLink.textContent = CONTACT_EMAIL; mailLink.href = 'mailto:' + CONTACT_EMAIL; }
  else { $('#mailLine').hidden = true; }
  $('#demoForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const v = (id) => document.getElementById(id).value.trim();
    if (!v('d-name') || !v('d-email')) { note.textContent = 'Please add your name and work email.'; return; }
    if (!CONTACT_EMAIL) { note.textContent = 'Demo requests open soon.'; return; }
    const body = `Name: ${v('d-name')}\nCompany: ${v('d-company')}\nEmail: ${v('d-email')}\nTeam size: ${v('d-size')}`;
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('DRAXIS demo request — ' + (v('d-company') || v('d-name')))}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Your email app is opening with the request filled in. Just press send.';
  });
})();
