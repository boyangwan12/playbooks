// Drives the running app and saves crisp 3x stills of each state plus element positions (for highlights/cursor).
import { chromium } from '../../../node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = 'video/v2/work/shots'; mkdirSync(OUT, { recursive: true });
const URL = process.env.APP_URL ?? 'http://localhost:5173/';
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
const boxes = {};
const wait = (ms) => p.waitForTimeout(ms);
// Take the shot, and record where named elements sit in the 1920x1080 frame.
async function shot(name, targets = {}) {
  await scrub(); await wait(500);
  boxes[name] = {};
  for (const [k, loc] of Object.entries(targets)) {
    try {
      if (Array.isArray(loc)) { const r = await phrase(loc[0], loc[1]); if (r) boxes[name][k] = r; continue; }
      const b = await loc.first().boundingBox({ timeout: 2000 }); if (b) boxes[name][k] = { x: b.x, y: b.y, w: b.width, h: b.height };
    } catch {}
  }
  await p.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot', name, Object.keys(boxes[name]).join(','));
}
// Tight per-line rectangles around a phrase inside an element (for marker highlights).
const phrase = (loc, text) => loc.first().evaluate((root, text) => {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const nodes = []; let all = '';
  while (w.nextNode()) { nodes.push({ n: w.currentNode, s: all.length }); all += w.currentNode.nodeValue; }
  const i = all.indexOf(text); if (i < 0) return null;
  const at = (pos) => { for (let k = nodes.length - 1; k >= 0; k--) if (nodes[k].s <= pos) return [nodes[k].n, pos - nodes[k].s]; };
  const [sn, so] = at(i), [en, eo] = at(i + text.length - 1);
  const r = document.createRange(); r.setStart(sn, so); r.setEnd(en, eo + 1);
  return Array.from(r.getClientRects()).map((q) => ({ x: q.x, y: q.y, w: q.width, h: q.height }));
}, text);
// Bill ids are internal noise; strip them from visible text before any shot.
const scrub = () => p.evaluate(() => {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const ns = [];
  while (w.nextNode()) ns.push(w.currentNode);
  ns.forEach((n) => { n.nodeValue = n.nodeValue.replace(/BILL-\d+\s*[·,]\s*/g, '').replace(/\(BILL-\d+,\s*/g, '(').replace(/BILL-\d+/g, '').replace(/\bkaimori · accepted/g, 'Kaimori export · accepted'); });
  let prev = null; ns.forEach((n) => { if (!n.nodeValue.trim()) return; if (prev && /·\s*$/.test(prev.nodeValue) && /^\s*·/.test(n.nodeValue)) prev.nodeValue = prev.nodeValue.replace(/\s*·\s*$/, ''); prev = n; });
});
const nav = (re) => p.getByRole('button', { name: re }).first().click();

await p.goto(URL); await wait(900);
await p.getByRole('button', { name: /Owner/ }).first().click(); await wait(500);
await nav(/Import \+ reconcile/); await p.getByRole('button', { name: /Kaimori export/ }).click(); await wait(1800);
await p.getByRole('button', { name: /Quarantine invoice/ }).first().click(); await wait(400);
await p.getByRole('button', { name: /Accept dataset/ }).click(); await wait(1500);
await nav(/Cash position/); await wait(500);
await p.getByRole('button', { name: /Generate 13-week forecast/ }).first().click(); await wait(4500); await p.evaluate(() => window.scrollTo(0, 0));
const cc = p.locator('.card', { has: p.getByText('Closing cash by week') }).first();
const T = { chart: cc, plot: p.locator('.recharts-cartesian-grid').first(), dot6: p.locator('.recharts-line-dots').first().locator('circle').nth(5), thr: p.locator('.recharts-reference-line').first(), legend: p.getByText('Cash threshold $30,000').first(), banner: p.locator('.callout.critical'), kpis: p.locator('.kpi'), lowest: p.locator('.kpi.alert'), bannerLine: [p.locator('.callout.critical'), 'A due-date spreadsheet shows no shortfall at all for this period.'], w13: p.locator('text=W13').first() };
await shot('forecast', T);
await p.getByText('Compare with due-date spreadsheet').click(); await wait(1200); await p.evaluate(() => window.scrollTo(0, 0)); await wait(400);
await shot('forecast-compare', { ...T, legend: p.getByText('Due-date spreadsheet').first(), plot: p.locator('.recharts-cartesian-grid').first() });
writeFileSync(`${OUT}/boxes2.json`, JSON.stringify(boxes, null, 1));
await browser.close();
