// Cash Gap Forecaster launch video: every move is keyed to a spoken word (T = measured voice timings, B = element positions from the live app).
(function () {
  const T = window.T, B = window.B;
  const tl = gsap.timeline({ paused: true });
  window.__timelines = window.__timelines || {};
  window.__timelines['main'] = tl;
  window.__sfx = [];

  // ---------- helpers
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, html, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; (parent || $('#over')).appendChild(e); return e; };
  const sfx = (t, name, g = 1) => window.__sfx.push({ t, name, g });
  const norm = (w) => w.toLowerCase().replace(/[^a-z0-9'\-]/g, '');
  const find = (i, word, n) => { let c = 0; for (const w of T.beats[i - 1].words) if (norm(w.w) === word && ++c === n) return w; throw new Error(`word "${word}" #${n} not in beat ${i}`); };
  const A = (i, word, n = 1) => T.beats[i - 1].start + find(i, word, n).s;   // when a word starts
  const Z = (i, word, n = 1) => T.beats[i - 1].start + find(i, word, n).e;   // when a word ends
  const S = (i) => T.beats[i - 1].start, E = (i) => T.beats[i - 1].end;
  const hid = (e, p = {}) => { tl.set(e, Object.assign({ autoAlpha: 0 }, p), 0); return e; };
  const appear = (e, t, d = 0.7, p = {}) => tl.to(e, Object.assign({ autoAlpha: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)', duration: d }, p), t);
  const vanish = (e, t, d = 0.5, p = {}) => tl.to(e, Object.assign({ autoAlpha: 0, duration: d, ease: 'power2.in' }, p), t);

  // ---------- stage
  const winL = 180, winT = 84, winW = 1560, winH = 877.5, S0 = winW / 1920;
  tl.fromTo('#glow', { opacity: 0 }, { opacity: 1, duration: 1.8, ease: 'power1.out' }, 0);
  tl.fromTo('.hair', { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 1.4, ease: 'power2.out' }, 0.1);
  tl.set('#cam', { x: 0, y: 0, scale: S0, transformOrigin: '0 0', filter: 'blur(0px)' }, 0);
  tl.set('#win', { autoAlpha: 0, scale: 0.97, transformOrigin: '50% 50%' }, 0);
  tl.set('#endcard', { autoAlpha: 0 }, 0);
  tl.set('#cta', { autoAlpha: 0, y: 12 }, 0);
  tl.set('#cursor', { x: 1500, y: 700, autoAlpha: 0, transformOrigin: '3px 2px' }, 0);

  // ---------- camera and app states
  let C = { x: 0, y: 0, s: S0 }, cur = null;
  document.querySelectorAll('#cam img.st').forEach((im) => tl.set(im, { opacity: 0 }, 0));
  window.__dbg = [];
  function state(name, t, d = 0.45, opt = {}) {
    if (cur === name) return;
    window.__dbg.push({ k: 'state', t, d, name });
    if (cur) tl.to('#st-' + cur, { opacity: 0, duration: d, ease: 'sine.inOut' }, t);
    tl.to('#st-' + name, { opacity: 1, duration: d, ease: 'sine.inOut' }, t);
    tl.to('#cam', { filter: 'blur(4px)', duration: d * 0.5, ease: 'sine.inOut' }, t).to('#cam', { filter: 'blur(0px)', duration: d * 0.5, ease: 'sine.inOut' }, t + d * 0.5);
    cur = name;
  }
  function camState(r, o = {}) {
    const px = o.padX ?? 60, py = o.padY ?? 40;
    let z = o.zoom ?? Math.min(1920 / (r.w + px * 2), 1080 / (r.h + py * 2));
    z = Math.max(1, Math.min(z, 3.2));
    const s = S0 * z, cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    let x = winW / 2 - cx * s, y = winH / 2 - cy * s;
    x = Math.min(0, Math.max(winW - 1920 * s, x)); y = Math.min(0, Math.max(winH - 1080 * s, y));
    return { x, y, s };
  }
  function cam(t, d, r, o) {
    const st = r ? camState(r, o) : { x: 0, y: 0, s: S0 };
    window.__dbg.push({ k: 'cam', t, d, zoom: +(st.s / S0).toFixed(2) });
    tl.to('#cam', { x: st.x, y: st.y, scale: st.s, duration: d, ease: (o && o.ease) || 'power2.inOut' }, t);
    C = st;
  }
  const P = (x, y) => ({ x: winL + C.x + x * C.s, y: winT + C.y + y * C.s });
  const mid = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

  // ---------- cursor, clicks, marker highlights, rings
  let curPos = { x: 1500, y: 700 };
  function curShow(t) { tl.to('#cursor', { autoAlpha: 1, duration: 0.35 }, t); }
  function curHide(t) { tl.to('#cursor', { autoAlpha: 0, duration: 0.4 }, t); }
  function curStart(t, px, py) {           // appear at a fresh spot, so the cursor never drifts across cuts
    const p = P(px, py);
    tl.set('#cursor', { x: p.x, y: p.y }, t - 0.02).to('#cursor', { autoAlpha: 1, duration: 0.3 }, t - 0.02);
    curPos = p;
  }
  function curMove(t, d, px, py) {
    const p = P(px, py);
    tl.to('#cursor', { x: p.x, y: p.y, duration: d, ease: 'power2.inOut' }, t);
    curPos = p;
  }
  function click(t) {
    tl.to('#cursor', { scale: 0.82, duration: 0.07, ease: 'power1.in' }, t).to('#cursor', { scale: 1, duration: 0.14, ease: 'power1.out' }, t + 0.07);
    const r = el('div', 'ripple'); r.style.left = curPos.x + 'px'; r.style.top = curPos.y + 'px';
    tl.set(r, { autoAlpha: 0, scale: 0.3 }, 0).to(r, { autoAlpha: 0.7, duration: 0.01 }, t).to(r, { scale: 1.7, autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, t + 0.01);
    sfx(t, 'click', 0.9);
  }
  function mark(t, rects, o = {}) {
    const pad = o.pad ?? 4, dur = o.dur ?? 0.5, out = [];
    [].concat(rects).forEach((r, i) => {
      const m = el('div', 'mk', null, $('#cam'));
      Object.assign(m.style, { left: r.x - pad + 'px', top: r.y - pad * 0.7 + 'px', width: r.w + pad * 2 + 'px', height: r.h + pad * 1.4 + 'px' });
      tl.set(m, { autoAlpha: 0, scaleX: 0, transformOrigin: '0 50%' }, 0);
      tl.to(m, { autoAlpha: 1, scaleX: 1, duration: dur, ease: 'power2.out' }, t + i * 0.14);
      out.push(m);
    });
    return out;
  }
  function veil(tIn, dIn, tOut, dOut, r) {   // paints over part of a screen with the page colour, so only what's being talked about shows
    const v = el('div', null, null, $('#cam'));
    Object.assign(v.style, { position: 'absolute', left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px', background: '#f4f4f2' });
    tl.set(v, { autoAlpha: 0 }, 0).to(v, { autoAlpha: 1, duration: dIn }, tIn).to(v, { autoAlpha: 0, duration: dOut }, tOut);
  }
  const unmark = (els, t, d = 0.4) => tl.to(els, { autoAlpha: 0, duration: d }, t);
  function ring(t, c, r) {
    const g = el('div', 'ring', null, $('#cam'));
    Object.assign(g.style, { left: c.x - r + 'px', top: c.y - r + 'px', width: r * 2 + 'px', height: r * 2 + 'px' });
    tl.set(g, { autoAlpha: 0, scale: 2.2 }, 0).to(g, { autoAlpha: 1, scale: 1, duration: 0.55 }, t);
    return g;
  }
  function tag(t, x, y, html, o = {}) {      // small paper tag that lives inside the app view and zooms with it
    const g = el('div', 'paper', html, $('#cam'));
    Object.assign(g.style, { left: x + 'px', top: y + 'px', padding: '8px 14px', fontSize: '28px', fontWeight: 600, whiteSpace: 'nowrap' }, o.style || {});
    tl.set(g, { autoAlpha: 0, y: 8 }, 0).to(g, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, t);
    return g;
  }

  // ---------- corner labels, name cards, captions
  function lbl(side, text, t0, t1) {
    const l = el('div', 'lbl mono ' + side, text, $('#labels')); hid(l);
    tl.to(l, { autoAlpha: 1, duration: 0.6 }, t0);
    if (t1) tl.to(l, { autoAlpha: 0, duration: 0.4 }, t1);
    return l;
  }
  function ncard(title, desc, x, y, w, small) {
    const c = el('div', 'paper ncard' + (small ? ' s' : ''), `<div class="t">${title}</div><div class="d">${desc}</div>`);
    Object.assign(c.style, { left: x + 'px', top: y + 'px', width: w + 'px' }); hid(c, { y: 20 }); return c;
  }
  T.caps.forEach((c, i) => {
    const d = el('div', null, c.text, $('#cap')); hid(d, { y: 6 });
    const nxt = T.caps[i + 1], off = nxt ? Math.min(c.t1, nxt.t0 - 0.05) : c.t1;
    tl.to(d, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, c.t0).to(d, { autoAlpha: 0, duration: 0.2 }, Math.max(c.t0 + 0.9, off));
  });


  // ================= v2: story first. Drawn scenes tell the company's story; two real app screens prove it.
  const css = (e, o) => { for (const k in o) e.style[k] = typeof o[k] === 'number' ? o[k] + 'px' : o[k]; return e; };
  const box = (parent, o, html, cls) => css(el('div', cls || null, html == null ? null : html, parent), Object.assign({ position: 'absolute' }, o));
  const group = () => box($('#over'), { left: 0, top: 0, width: 1920, height: 1080 });
  const hl = (parent, r, t, d = 0.5) => { const m = box(parent, { left: r.x, top: r.y, width: r.w, height: r.h }, null, 'mk'); tl.set(m, { autoAlpha: 0, scaleX: 0, transformOrigin: '0 50%' }, 0).to(m, { autoAlpha: 1, scaleX: 1, duration: d, ease: 'power2.out' }, t); return m; };
  const GAP = T.gaps, END = T.endStart;
  const gapEnd = (i) => E(i) + GAP[i - 1];         // when the silence after beat i ends (= next beat starts)

  // the product chip (used by beats 4 and 8)
  const chip = el('div', 'chip', `<svg width="40" height="40" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#231f20"/><path d="M6 19 H26" stroke="#fff" stroke-opacity=".45" stroke-width="1.5" stroke-dasharray="2 2"/><path d="M6 12 L11.5 14.5 L16 23 L20.5 15.5 L26 9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="nm">Cash Gap Forecaster</span>`);
  Object.assign(chip.style, { left: '180px', top: '20px' });
  const CX = 960 - (180 + 165), CY = 400 - (20 + 29);

  // =============== BEAT 1: "I run a wholesale bakery. Hotels and cafes order from me, and I send them invoices. They pay later."
  lbl('l', 'Kaimori Bakery', 0.7, gapEnd(1) - 0.4);
  const g1 = group();
  const c1 = ncard('Kaimori', 'A wholesale bakery', 130, 430, 640); c1.classList.add('l'); g1.appendChild(c1);
  const hot = ncard('Hotels', 'Order from me &middot; my clients', 1210, 300, 480, true); g1.appendChild(hot);
  const caf = ncard('Cafes', 'Order from me &middot; my clients', 1210, 560, 480, true); g1.appendChild(caf);
  appear(c1, 0.55, 0.9); sfx(0.6, 'card', 0.7);
  appear(hot, A(1, 'hotels') - 0.1, 0.7); sfx(A(1, 'hotels') - 0.1, 'card', 0.5);
  appear(caf, A(1, 'cafes') - 0.1, 0.7); sfx(A(1, 'cafes') - 0.1, 'card', 0.5);
  [[930, 306], [975, 360], [930, 566], [975, 620]].forEach(([x, y], k) => {
    const v = box(g1, { left: 790, top: 478, width: 200, height: 52 }, 'INVOICE', 'inv'); v.style.font = "500 22px 'Plex',monospace"; v.style.letterSpacing = '.14em';
    tl.set(v, { autoAlpha: 0, x: 0, y: 0 }, 0);
    tl.to(v, { autoAlpha: 1, x: x - 790, y: y - 478, duration: 1.0, ease: 'power2.out' }, A(1, 'send') + 0.05 + k * 0.16);
    sfx(A(1, 'send') + 0.1 + k * 0.16, 'tick', 0.5);
  });
  const l1b = box(g1, { left: 900, top: 720, width: 500 }, 'Not paid yet', 'mono big'); l1b.style.color = '#e8b4a6';
  hid(l1b);
  tl.to(l1b, { autoAlpha: 1, duration: 0.5 }, A(1, 'later'));
  vanish(g1, gapEnd(1) - 0.5, 0.5);

  // =============== BEAT 2: "My spreadsheet assumes everyone pays on the due date. So it says I'm fine. But Aldervane Hotels, which is one of my clients, pays about six weeks late."
  lbl('l', 'What the spreadsheet assumes', S(2) - 0.1, A(2, 'but') - 0.1);
  lbl('l', 'What actually happens', A(2, 'but') + 0.2, gapEnd(2) - 0.4);
  const g2 = group();
  const SX = 110, SY = 300, SW = 780, rowY = (n) => SY + 38 + (n - 1) * 60;
  const sheet = box(g2, { left: SX, top: SY, width: SW }, `
    <div class="hd"><div style="width:40px"></div><div style="flex:1">A</div><div style="width:230px;text-align:right">B</div></div>
    <div class="row"><div class="n">1</div><div class="a">Opening cash</div><div class="b">$42,000</div></div>
    <div class="row"><div class="n">2</div><div class="a">Bills, next 13 weeks</div><div class="b">$602,345</div></div>
    <div class="row"><div class="n">3</div><div class="a">Clients pay on the due date</div><div class="b"></div></div>
    <div class="row"><div class="n">4</div><div class="a">Lowest cash, next 13 weeks</div><div class="b">$138,188</div></div>`, 'paper sheet');
  const sl2 = box(g2, { left: SX, top: SY - 42 }, 'The usual way', 'mono big');
  hid(sheet, { y: 14 }); hid(sl2);
  tl.to(sheet, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, S(2) - 0.1); tl.to(sl2, { autoAlpha: 1, duration: 0.5 }, S(2) - 0.1);
  const mDue = hl(g2, { x: SX + 214, y: rowY(3) + 13, w: 208, h: 34 }, A(2, 'due') - 0.1);
  const mFine = hl(g2, { x: SX + SW - 160, y: rowY(4) + 13, w: 148, h: 34 }, A(2, 'says'));
  const okb = box(g2, { left: SX + SW + 22, top: rowY(4) + 10, background: '#3b8f4a' }, '&#10003;', 'tick'), nob = box(g2, { left: SX + SW + 22, top: rowY(4) + 10, background: '#d03b3b' }, '&#10005;', 'tick');
  hid(okb, { scale: 0.4 }); hid(nob, { scale: 0.4 });
  tl.to(okb, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, A(2, 'fine') + 0.1);
  tl.to(okb, { autoAlpha: 0, duration: 0.15 }, A(2, 'but') - 0.05);
  const strike = box(g2, { left: SX + SW - 18 - 148, top: rowY(4) + 30 - 1.5, width: 150, height: 3, background: '#d03b3b', borderRadius: 2 });
  tl.set(strike, { scaleX: 0, transformOrigin: '0 50%' }, 0).to(strike, { scaleX: 1, duration: 0.35, ease: 'power2.out' }, A(2, 'but') + 0.05);
  tl.to(nob, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, A(2, 'but') + 0.1);
  // the timeline on the right: the invoice lands on its due date, then the real payment comes 42 days later
  const X0 = 1130, DAY = 9, IY = 520;
  const dueLine = box(g2, { left: X0, top: 410, width: 0, height: 320, borderLeft: '1.5px dashed rgba(236,231,220,.4)' });
  const dueLbl = box(g2, { left: X0 - 46, top: 372 }, 'Due date', 'mono big');
  const ghost = box(g2, { left: X0 - 100, top: IY - 26, width: 200, height: 52 }, null, 'ghost');
  const inv = box(g2, { left: X0 - 100, top: IY - 26, width: 200, height: 52 }, 'INVOICE', 'inv'); inv.style.font = "500 22px 'Plex',monospace"; inv.style.letterSpacing = '.14em';
  const paid = box(g2, { left: X0 + 112, top: IY - 22 }, 'Paid on the due date', 'mono big'); paid.style.color = '#b5d6b9';
  const trail = box(g2, { left: X0 + 100, top: IY, width: 42 * DAY, height: 0, borderTop: '2px dotted rgba(236,231,220,.55)' });
  const days = box(g2, { left: X0 + 100 + 42 * DAY + 18, top: IY - 14 }, '+42 days', 'mono'); days.style.fontSize = '28px'; days.style.color = '#e8b4a6';
  const gm = ncard('Aldervane Hotels', 'Hotel group &middot; my client', 1040, 226, 560, true); g2.appendChild(gm);
  const q = box(g2, { left: X0 - 100, top: 620, width: 780 }, `<div class="q">From the app</div>52 settled invoices, <span id="hl-gm">on average 42 days after due date.</span>`, 'quote'); hid(q, { y: 14 });
  hid(dueLine); hid(dueLbl); hid(ghost); hid(inv, { y: -30 }); hid(paid); hid(days); tl.set(trail, { scaleX: 0, transformOrigin: '0 50%' }, 0);
  tl.to([dueLine, dueLbl, ghost], { autoAlpha: 1, duration: 0.6 }, A(2, 'everyone'));
  tl.to(inv, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'bounce.out' }, A(2, 'due') - 0.1); sfx(A(2, 'due') + 0.15, 'tick', 0.6);
  tl.to(paid, { autoAlpha: 1, duration: 0.5 }, A(2, 'date') + 0.15);
  tl.to(paid, { autoAlpha: 0, duration: 0.3 }, A(2, 'but') + 0.05);
  appear(gm, A(2, 'aldervane') - 0.1, 0.7); sfx(A(2, 'aldervane') - 0.1, 'card', 0.6);
  tl.to(inv, { x: 42 * DAY, duration: 1.6, ease: 'power2.inOut' }, A(2, 'pays', 2) - 0.05);
  tl.to(trail, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, A(2, 'pays', 2) - 0.05);
  tl.to(days, { autoAlpha: 1, duration: 0.5 }, A(2, 'pays', 2) + 1.4);
  appear(q, A(2, 'pays', 2) - 0.2, 0.6);
  tl.set('#hl-gm', { backgroundImage: 'linear-gradient(rgba(255,200,60,.65),rgba(255,200,60,.65))', backgroundRepeat: 'no-repeat', backgroundSize: '0% 100%' }, 0);
  tl.to('#hl-gm', { backgroundSize: '100% 100%', duration: 0.8, ease: 'power2.out' }, A(2, 'six') + 0.3);
  vanish(g2, gapEnd(2) - 0.3, 0.3);

  // =============== BEAT 3: "In week six, my staff bonus, payroll and insurance all come due: ... The hotel's money won't have arrived. The spreadsheet thinks it has."
  lbl('l', 'Next 13 weeks &middot; from 19 Oct 2026', S(3) - 0.2, gapEnd(3) - 0.4);
  lbl('r', 'Week 6 &middot; 23 Nov 2026', A(3, 'week'), gapEnd(3) - 0.4);
  const g3 = group();
  const wk = ['19 Oct', '26 Oct', '2 Nov', '9 Nov', '16 Nov', '23 Nov', '30 Nov', '7 Dec', '14 Dec', '21 Dec', '28 Dec', '4 Jan', '11 Jan'];
  const STEP = 127.7, CY0 = 520, W6X = 130 + 5 * STEP + 60;
  const cells = wk.map((d, k) => { const c = box(g3, { left: 130 + k * STEP, top: CY0 }, `<div class="w">W${k + 1}</div><div class="dt">${d}</div>`, 'cell'); hid(c, { y: 10 }); tl.to(c, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, S(3) - 0.2 + k * 0.05); return c; });
  tl.to(cells[5], { backgroundColor: 'rgba(194,178,131,.30)', borderColor: '#c2b283', duration: 0.5 }, A(3, 'week') + 0.05); sfx(A(3, 'week') + 0.05, 'tick', 0.7);
  [['Staff bonus', '$83,000', 'bonus', 290], ['Payroll', '$64,200', 'payroll', 366], ['Insurance', '$41,700', 'insurance', 442]].forEach(([nm, am, w, y]) => {
    const b = box(g3, { left: W6X - 210, top: y }, `<span class="nm">${nm}</span><span class="am">${am}</span>`, 'bill'); hid(b, { y: -70 });
    tl.to(b, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'bounce.out' }, A(3, w) - 0.15); sfx(A(3, w) - 0.05, 'tick', 0.7);
  });
  const brk = box(g3, { left: W6X + 232, top: 290, width: 3, height: 220, background: '#c2b283' }); tl.set(brk, { scaleY: 0, transformOrigin: '50% 0' }, 0).to(brk, { scaleY: 1, duration: 0.6, ease: 'power2.out' }, A(3, 'one'));
  const tot = box(g3, { left: W6X + 262, top: 345, width: 430 }, `<div class="k">Bills due in week 6</div><div class="v">$188,900</div>`, 'paper res'); hid(tot, { y: 14 });
  appear(tot, A(3, 'eighty-nine') - 0.1, 0.6); sfx(A(3, 'eighty-nine') - 0.1, 'card', 0.6);
  const conn = box(g3, { left: W6X - 1, top: CY0 + 130, width: 0, height: 44, borderLeft: '2px dotted rgba(236,231,220,.5)' }); hid(conn);
  const slot = box(g3, { left: W6X - 230, top: 700, width: 460, height: 84 }, 'The hotel&rsquo;s payment<br>is not here yet', 'slot'); hid(slot, { y: 10 });
  tl.to([conn, slot], { autoAlpha: 1, y: 0, duration: 0.6 }, A(3, "hotel's") - 0.05);
  const asm = box(g3, { left: W6X + 262, top: 700, width: 460, height: 84 }, 'The spreadsheet counts it<br>as already paid', 'assumed'); hid(asm, { y: 10 });
  const okc = box(g3, { left: W6X + 262 + 460 - 22, top: 700 - 18, background: '#3b8f4a' }, '&#10003;', 'tick'); hid(okc, { scale: 0.4 });
  tl.to(asm, { autoAlpha: 1, y: 0, duration: 0.6 }, A(3, 'thinks') - 0.05); sfx(A(3, 'thinks') - 0.05, 'card', 0.6);
  tl.to(okc, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, A(3, 'has') + 0.05);
  vanish(g3, gapEnd(3) - 0.5, 0.5);

  // =============== BEAT 4: "So I use Cash Gap Forecaster. It reads three years of my invoices and payments, and learns how each client really pays."
  hid(chip, { x: CX, y: CY, scale: 2.2, filter: 'blur(16px)' });
  appear(chip, A(4, 'use') - 0.1, 1.0, { x: CX, y: CY, scale: 2.2, ease: 'power2.out' }); sfx(A(4, 'use') - 0.1, 'reveal', 0.8);
  const g4 = group();
  for (let k = 0; k < 8; k++) {
    const fromLeft = k % 2 === 0, x0 = fromLeft ? 120 : 1600, y0 = 620 + (k >> 1) * 36;
    const v = box(g4, { left: x0, top: y0, width: 200, height: 52 }, k % 4 < 2 ? 'INVOICE' : 'PAYMENT', 'inv'); v.style.font = "500 22px 'Plex',monospace"; v.style.letterSpacing = '.14em';
    const t0 = A(4, 'reads') + k * 0.22;
    tl.set(v, { autoAlpha: 0, x: 0, y: 0, scale: 1 }, 0);
    tl.to(v, { autoAlpha: 1, duration: 0.25 }, t0).to(v, { x: 960 - 100 - x0, y: 400 - 26 - y0, scale: 0.4, duration: 0.9, ease: 'power2.in' }, t0).to(v, { autoAlpha: 0, duration: 0.2 }, t0 + 0.75);
    sfx(t0 + 0.85, 'tick', 0.35);
  }
  const l4 = box(g4, { left: 0, top: 560, width: 1920, textAlign: 'center' }, 'Invoices and payments &middot; 16 Oct 2023 to 18 Oct 2026', 'mono big'); hid(l4);
  tl.to(l4, { autoAlpha: 1, duration: 0.6 }, A(4, 'three') - 0.1);
  const r4 = ncard('Aldervane Hotels', 'Pays about 42 days after the due date, on average', 540, 650, 840, true); g4.appendChild(r4);
  appear(r4, A(4, 'learns') + 0.05, 0.7); sfx(A(4, 'learns') + 0.05, 'card', 0.6);
  vanish([g4], gapEnd(4) - 1.2, 0.6);
  tl.to(chip, { x: 0, y: 0, scale: 1, duration: 1.0, ease: 'power3.inOut' }, gapEnd(4) - 1.1);

  // =============== BEAT 5 (app screen 1): "It draws the next thirteen weeks. There's the gap: ten thousand dollars under my minimum, and over a month away."
  const F = B.forecast;
  const w0 = S(5) - 1.0;
  state('forecast', w0, 0.01);
  tl.to('#win', { autoAlpha: 1, scale: 1, duration: 0.9 }, w0);
  cam(w0, 1.0, F.chart, { zoom: 1.3 });
  // page colour hides the banner and numbers until we pull back; a white sheet over the plot is wiped away as the forecast "draws"
  const hideTop = box($('#cam'), { left: 264, top: 250, width: 1330, height: 245, background: '#f4f4f2' });
  const wipe = box($('#cam'), { left: F.plot.x - 6, top: F.plot.y - 12, width: F.plot.w + 20, height: 314, background: '#fff' });
  tl.set(wipe, { transformOrigin: '100% 50%' }, 0);
  tl.to(wipe, { scaleX: 0, duration: 1.6, ease: 'power1.inOut' }, A(5, 'draws') - 0.05); sfx(A(5, 'draws') - 0.05, 'reveal', 0.6);
  lbl('r', '13-week forecast &middot; from 19 Oct 2026', w0 + 0.3, A(5, 'gap') - 0.1);
  const d6 = mid(F.dot6);
  const r6 = ring(A(5, 'gap') - 0.05, d6, 26); sfx(A(5, 'gap') - 0.05, 'thump', 0.8);
  lbl('r', 'Week 6 &middot; 23 Nov 2026', A(5, 'gap') - 0.05, A(5, 'over') - 0.1);
  lbl('r', '35 days after the forecast date', A(5, 'over') - 0.05, gapEnd(5) - 0.9);
  const minTag = tag(A(5, 'minimum') - 0.45, F.thr.x + 110, F.thr.y + 26, 'Minimum cash &middot; $30,000');
  const res5 = el('div', 'paper res', `<div class="k">Week 6 closing cash</div><div class="v">$19,934</div><div class="s">$10,066 under the minimum</div>`);
  css(res5, { left: 1240, top: 150 }); hid(res5, { y: 18 }); appear(res5, A(5, 'ten') - 0.05, 0.6); sfx(A(5, 'ten') - 0.05, 'card', 0.6);
  // the quiet part: hold on the chart so it can be read, then show what the old spreadsheet line looked like on the same chart
  const cmpAt = E(5) + 1.8;
  vanish([r6, minTag, res5], cmpAt - 0.1, 0.4);
  state('forecast-compare', cmpAt, 0.6);
  const usual = tag(cmpAt + 0.4, 780, 622, 'The usual way &middot; no shortfall', { style: { borderLeft: '4px solid #eb6834' } });
  tl.to(usual, { autoAlpha: 0, duration: 0.3 }, gapEnd(5) - 0.95);

  // =============== BEAT 6 (app screen 2): "I try a fix. Move the staff bonus back two weeks," (silence: click) "and week six goes from nineteen thousand dollars to over a hundred thousand."
  const SP = B['scenario-pre'], SQ = B['scenario-post'];
  const p0 = S(6) - 0.8;
  tl.to(hideTop, { autoAlpha: 0, duration: 0.6 }, p0 - 0.1);
  state('scenario-pre', p0, 0.7);
  cam(p0, 1.0, { x: 276, y: 403.8, w: 700, h: 324.8 }, { zoom: 2.4 });
  lbl('r', 'What-if &middot; the real forecast doesn&rsquo;t change', A(6, 'try') - 0.2, S(9) - 0.5);
  const m6a = mark(A(6, 'staff') - 0.05, SP.select, { pad: 5 });
  const m6b = mark(A(6, 'two') - 0.1, { x: SP.slider.x, y: SP.slider.y - 42, w: SP.slider.w, h: 30 }, { pad: 5 });
  const apm = mid(SP.apply);
  const cl = E(6) + 1.05;
  curStart(E(6) + 0.15, apm.x + 280, apm.y + 130); curMove(E(6) + 0.2, cl - 0.05 - (E(6) + 0.2), apm.x, apm.y);
  click(cl);
  state('scenario-post', cl + 0.12, 0.5);
  unmark([...m6a, ...m6b], cl + 0.1, 0.3);
  curHide(cl + 0.6);
  cam(cl + 0.15, 1.15, { x: 276, y: 255, w: 1304, h: 340 }, {});
  // beat 7: the numbers
  const m7 = mark(A(7, 'week') - 0.05, SQ.row6, { pad: 3 });
  const res6 = el('div', 'paper res', `<div class="k">Week 6 closing cash</div><div class="v" id="rv1">$19,934</div><div class="v" id="rv2" style="position:absolute;left:30px;top:56px">$102,934</div><div class="s" id="rs1">before</div><div class="s" id="rs2" style="position:absolute;left:30px;top:142px;color:#2c6b3a;font-weight:600">+$83,000 after the move</div>`);
  css(res6, { left: 215, top: 300, height: 200, width: 450 }); hid(res6, { y: 18 }); tl.set('#rv2', { autoAlpha: 0 }, 0); tl.set('#rs2', { autoAlpha: 0 }, 0);
  appear(res6, A(7, 'nineteen') - 0.15, 0.6); sfx(A(7, 'nineteen') - 0.15, 'card', 0.6);
  tl.to(['#rv1', '#rs1'], { autoAlpha: 0, duration: 0.25 }, A(7, 'hundred') - 0.1);
  tl.to(['#rv2', '#rs2'], { autoAlpha: 1, duration: 0.35 }, A(7, 'hundred') - 0.05); sfx(A(7, 'hundred') - 0.05, 'thump', 0.7);
  // the honest part
  const m7b = mark(E(7) + 0.5, [SQ.row12, SQ.row13], { pad: 3 });
  const note7 = el('div', 'paper note', `Weeks 12 and 13 still dip. Now there&rsquo;s time to plan.`);
  css(note7, { left: 215, top: 560, width: 450 }); note7.style.fontSize = '30px'; hid(note7, { y: 16 }); appear(note7, E(7) + 0.6, 0.7); sfx(E(7) + 0.6, 'card', 0.6);
  vanish([res6, note7], S(9) - 0.45, 0.4);

  // =============== BEAT 8: the conclusion ("I saw it over a month early, so I have time to fix it. I'm in control..."): the result stays on screen
  // =============== BEAT 9: "Cash Gap Forecaster, by EXERGY."
  const outAt = S(9) - 0.35;
  tl.to('#win', { autoAlpha: 0, scale: 0.96, duration: 0.8, ease: 'power2.in' }, outAt);
  tl.to(chip, { x: CX, y: CY - 70, scale: 2.2, duration: 1.0, ease: 'power3.inOut' }, A(9, 'cash') - 0.45);
  const by = el('div', 'mono', 'by EXERGY'); Object.assign(by.style, { position: 'absolute', left: '0', width: '1920px', textAlign: 'center', top: '478px', fontSize: '26px' }); hid(by, { y: 10 });
  appear(by, A(9, 'by') - 0.05, 0.7);
  vanish([by, chip], END - 0.05, 0.05);

  // =============== END CARD: the EXERGY animation, then the call to action
  tl.set('#endcard', { autoAlpha: 1 }, END);
  sfx(END + 0.15, 'end', 0.8);
  tl.to('#cta', { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, END + T.ctaAt);
  sfx(END + T.ctaAt, 'card', 0.5);

  document.querySelectorAll('.lbl,.inv,.quote .q,.res .k,.note small,.sheet .hd,.sheet .row .n,.ghost').forEach((e) => e.setAttribute('data-layout-ignore', ''));
  tl.to({}, { duration: 0.01 }, T.dur - 0.01);
  tl.seek(0);
})();
