// Draws a seamless panoramic LINE CHART that runs across ALL carousel slides (one wide SVG, flat background colour).
// Usage: node chart-panorama.mjs <spec.json> <out.svg>
// spec.json:
// { "slides": 5, "bg": "#f4f1e9", "ink": "#232323", "font": "DM Sans, sans-serif",
//   "y0": 1190, "scale": 2.4,                              // value v maps to y = y0 - v*scale  (so 150 -> 830)
//   "threshold": { "value": 30, "label": "MINIMUM CASH · $30,000", "color": "#9a958a", "x1": 88, "x2": 5312 },
//   "series": [ { "name": "forecast", "color": "#232323", "width": 4, "dash": null, "dots": true,
//                 "points": [[130, 83.2], [630, 68.0], ...] } ],        // [x in px across the strip, value]
//   "fills": [ { "series": "forecast", "below": "threshold", "color": "#b5533c", "opacity": 0.18 } ],   // shade where the line is below the threshold
//   "markers": [ { "x": 2700, "value": 19.9, "label": "WEEK 6 · $19,934", "color": "#b5533c", "dy": 62 } ],
//   "tail": { "series": "forecast", "to": 5312 } }          // dotted fade-out continuation after the last point
// Series are drawn in order; use smooth monotone curves (no overshoot). Keep text away from slide seams (multiples of 1080).
import { readFileSync, writeFileSync } from 'node:fs';
const [specFile, out] = process.argv.slice(2);
const S = JSON.parse(readFileSync(specFile, 'utf8'));
const N = S.slides ?? 5, W = N * 1080, H = 1350, Y0 = S.y0 ?? 1190, K = S.scale ?? 2.4, font = S.font ?? 'DM Sans, sans-serif';
const Y = (v) => Y0 - v * K;
const curve = (pts) => {                                // monotone cubic Hermite -> cubic Bezier segments (no overshoot)
  const n = pts.length, dx = [], m = [], t = new Array(n);
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) { if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; } const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b; if (s > 9) { const r = 3 / Math.sqrt(s); t[i] = r * a * m[i]; t[i + 1] = r * b * m[i]; } }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) { const h = dx[i] / 3; d += ` C${(pts[i][0] + h).toFixed(1)} ${(pts[i][1] + h * t[i]).toFixed(1)} ${(pts[i + 1][0] - h).toFixed(1)} ${(pts[i + 1][1] - h * t[i + 1]).toFixed(1)} ${pts[i + 1][0].toFixed(1)} ${pts[i + 1][1].toFixed(1)}`; }
  return d;
};
const px = (s) => s.points.map(([x, v]) => [x, Y(v)]);
let g = '';
const th = S.threshold;
if (th) g += `<line x1="${th.x1 ?? 88}" y1="${Y(th.value)}" x2="${th.x2 ?? W - 88}" y2="${Y(th.value)}" stroke="${th.color ?? '#9a958a'}" stroke-width="2" stroke-dasharray="10 9"/><text x="${(th.x1 ?? 88)}" y="${Y(th.value) + 38}" font-family="${font}" font-size="24" font-weight="500" letter-spacing="3" fill="${th.color ?? '#7d786d'}">${th.label}</text>`;
for (const f of S.fills ?? []) {                         // shade between the line and the threshold where the line is below it
  const s = S.series.find((q) => q.name === f.series), ty = Y(th.value), pts = px(s);
  // sample the monotone curve finely to find where it dips below the threshold
  const fine = []; const n = pts.length; const dx = [], m = [], t = new Array(n);
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2]; for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) { if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; } const a = t[i] / m[i], b = t[i + 1] / m[i], q = a * a + b * b; if (q > 9) { const r = 3 / Math.sqrt(q); t[i] = r * a * m[i]; t[i + 1] = r * b * m[i]; } }
  for (let i = 0; i < n - 1; i++) for (let k = 0; k <= 60; k++) { const u = k / 60, h = dx[i], a = 2 * u ** 3 - 3 * u ** 2 + 1, b = u ** 3 - 2 * u ** 2 + u, c = -2 * u ** 3 + 3 * u ** 2, d2 = u ** 3 - u ** 2; fine.push([pts[i][0] + u * h, a * pts[i][1] + b * h * t[i] + c * pts[i + 1][1] + d2 * h * t[i + 1]]); }
  let cur = []; const shapes = [];
  for (const [x, y] of fine) { if (y > ty) cur.push([x, y]); else if (cur.length) { shapes.push(cur); cur = []; } } if (cur.length) shapes.push(cur);
  for (const sh of shapes) g += `<path d="M${sh[0][0].toFixed(1)} ${ty} ${sh.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')} L${sh[sh.length - 1][0].toFixed(1)} ${ty} Z" fill="${f.color}" opacity="${f.opacity ?? 0.2}"/>`;
}
for (const s of S.series) {
  g += `<path d="${curve(px(s))}" fill="none" stroke="${s.color}" stroke-width="${s.width ?? 4}" stroke-linecap="round" stroke-linejoin="round"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''}/>`;
  if (s.dots !== false) for (const [x, y] of px(s)) g += `<circle cx="${x}" cy="${y.toFixed(1)}" r="7" fill="${S.bg ?? '#f4f1e9'}" stroke="${s.color}" stroke-width="3"/>`;
}
if (S.tail) {                                            // dotted continuation after the last point, fading out
  const s = S.series.find((q) => q.name === S.tail.series), [lx, ly] = px(s).at(-1), to = S.tail.to ?? W - 88;
  g += `<defs><linearGradient id="tailfade" gradientUnits="userSpaceOnUse" x1="${lx}" y1="0" x2="${to}" y2="0"><stop offset="0" stop-color="${s.color}" stop-opacity=".8"/><stop offset="1" stop-color="${s.color}" stop-opacity="0"/></linearGradient></defs><line x1="${lx + 14}" y1="${ly.toFixed(1)}" x2="${to}" y2="${ly.toFixed(1)}" stroke="url(#tailfade)" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 14"/>`;
}
for (const mk of S.markers ?? []) {
  const y = Y(mk.value), dy = mk.dy ?? 62, up = dy < 0;
  g += `<circle cx="${mk.x}" cy="${y.toFixed(1)}" r="15" fill="none" stroke="${mk.color}" stroke-width="3"/><circle cx="${mk.x}" cy="${y.toFixed(1)}" r="7" fill="${mk.color}"/>`
     + `<line x1="${mk.x}" y1="${(y + (up ? -20 : 20)).toFixed(1)}" x2="${mk.x}" y2="${(y + dy - (up ? -26 : 26)).toFixed(1)}" stroke="${mk.color}" stroke-width="2" opacity=".7"/>`
     + `<text x="${mk.x}" y="${(y + dy + (up ? 0 : 8)).toFixed(1)}" text-anchor="middle" font-family="${font}" font-size="27" font-weight="600" letter-spacing="3" fill="${mk.color}">${mk.label.replace(/&/g, '&amp;')}</text>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="none"><rect width="${W}" height="${H}" fill="${S.bg ?? '#f4f1e9'}"/>${g}</svg>`;
writeFileSync(out, svg);
const seams = Array.from({ length: N - 1 }, (_, i) => (i + 1) * 1080);
const near = (S.markers ?? []).filter((m) => seams.some((s) => Math.abs(m.x - s) < 160)).map((m) => m.label);
console.log(`wrote ${out} (${W}x${H})` + (near.length ? `  WARNING: marker label(s) near a slide seam: ${near.join(', ')}` : ''));
