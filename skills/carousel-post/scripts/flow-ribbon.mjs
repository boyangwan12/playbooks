// Draws a seamless panoramic background for a LinkedIn carousel: one ribbon of light that flows across ALL slides.
// It starts thin and tangled on a dark background, pinches almost shut at one point (the problem), then opens into a calm,
// wide ribbon while the background turns from dark to cream. Because it is ONE picture, the slides connect when swiped.
// Usage: node flow-ribbon.mjs <out.svg> [--slides 5] [--pinch 0.31] [--turn 0.6] [--label "WEEK 6 · $19,934"]
//   --pinch  where the ribbon pinches, as a fraction of the total width (0.31 = inside slide 2 of 5)
//   --turn   where the background turns from dark to light (0.6 = at the slide 3 / slide 4 seam, so text colours flip there)
// Pair it with slides.json: { "panorama": { "svg": "art.svg" }, "slides": [ { "theme": "dark", ... }, ... ] }
import { writeFileSync } from 'node:fs';
const args = process.argv.slice(2); const out = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
const N = +opt('slides', 5), PINCH = +opt('pinch', 0.31), TURN = +opt('turn', 0.6), LABEL = opt('label', '');
const W = N * 1080, H = 1350, px = PINCH * W;
const ss = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
const cy = (x) => 1005 + 44 * Math.sin(x / 390 + 0.7) * (1 - 0.55 * x / W);
const hw = (x) => x < px ? 3 + 66 * ss(Math.pow((px - x) / px, 0.85)) : 3 + 185 * ss(Math.pow((x - px) / (W - px), 0.8));
const tangle = (x) => Math.max(0, 1 - x / (W * 0.46));
const pts = (f) => { const a = []; for (let x = 0; x <= W; x += 18) a.push([x, f(x)]); a.push([W, f(W)]); return a; };
const path = (p) => p.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
const top = pts((x) => cy(x) - hw(x)), bot = pts((x) => cy(x) + hw(x)).reverse();
const ribbon = path(top) + ' ' + path(bot).replace(/^M/, 'L') + ' Z';
const strands = [-3, -2, -1, 0, 1, 2, 3].map((k, i) => path(pts((x) => cy(x) + k * hw(x) * 0.5 + tangle(x) * Math.sin(x / (150 + 34 * i) + i * 1.7) * (26 + 5 * Math.abs(k)))));
const pinchY = cy(px), tx = (f) => (f * W).toFixed(0);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="none">
<defs>
  <linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0">
    <stop offset="0" stop-color="#0e1117"/><stop offset="${(TURN - 0.07).toFixed(3)}" stop-color="#1c232d"/>
    <stop offset="${(TURN - 0.035).toFixed(3)}" stop-color="#2a323c"/><stop offset="${(TURN + 0.008).toFixed(3)}" stop-color="#e3dccd"/>
    <stop offset="1" stop-color="#f4f1e9"/>
  </linearGradient>
  <radialGradient id="glow" gradientUnits="userSpaceOnUse" cx="${(TURN * W).toFixed(0)}" cy="${(pinchY + 40).toFixed(0)}" r="1500">
    <stop offset="0" stop-color="#f0d9a0" stop-opacity=".34"/><stop offset="1" stop-color="#f0d9a0" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="rib" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0">
    <stop offset="0" stop-color="#8a7a55" stop-opacity=".75"/><stop offset="${PINCH.toFixed(3)}" stop-color="#e5d19a"/>
    <stop offset="${TURN.toFixed(3)}" stop-color="#f3e2b0"/><stop offset="${(TURN + 0.07).toFixed(3)}" stop-color="#e0c88a"/>
    <stop offset="1" stop-color="#d3b36f"/>
  </linearGradient>
  <linearGradient id="str" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0">
    <stop offset="0" stop-color="#f6e9c3" stop-opacity=".8"/><stop offset="${TURN.toFixed(3)}" stop-color="#f6e9c3" stop-opacity=".9"/>
    <stop offset="${(TURN + 0.06).toFixed(3)}" stop-color="#a98a48" stop-opacity=".8"/><stop offset="1" stop-color="#9c7c3a" stop-opacity=".8"/>
  </linearGradient>
  <filter id="blur" x="-5%" y="-40%" width="110%" height="180%"><feGaussianBlur stdDeviation="26"/></filter>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .09 0"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<path d="${ribbon}" fill="url(#rib)" opacity=".55" filter="url(#blur)"/>
<path d="${ribbon}" fill="url(#rib)" opacity=".92"/>
<g fill="none" stroke="url(#str)" stroke-width="2.2" stroke-linecap="round">${strands.map((d) => `<path d="${d}"/>`).join('')}</g>
<circle cx="${px.toFixed(0)}" cy="${pinchY.toFixed(1)}" r="9" fill="#fff6dc"/><circle cx="${px.toFixed(0)}" cy="${pinchY.toFixed(1)}" r="26" fill="none" stroke="#f3e2b0" stroke-opacity=".7" stroke-width="2"/>
${LABEL ? `<line x1="${px.toFixed(0)}" y1="${(pinchY + 36).toFixed(0)}" x2="${px.toFixed(0)}" y2="${(pinchY + 92).toFixed(0)}" stroke="#f3e2b0" stroke-opacity=".6" stroke-width="2"/><text x="${px.toFixed(0)}" y="${(pinchY + 134).toFixed(0)}" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="28" font-weight="500" letter-spacing="3.4" fill="#f3e2b0">${LABEL.replace(/&/g, '&amp;')}</text>` : ''}
<rect width="${W}" height="${H}" filter="url(#grain)"/>
</svg>`;
writeFileSync(out, svg);
console.log(`wrote ${out}: ${W}x${H}, pinch at x=${px.toFixed(0)} (slide ${Math.floor(px / 1080) + 1}), light turns at x=${(TURN * W).toFixed(0)}`);
