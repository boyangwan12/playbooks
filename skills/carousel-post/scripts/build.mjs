// Builds LinkedIn carousel slides (PNG + one PDF) from a slides.json and background images.
// Usage (run from a project that has `playwright` installed, e.g. the repo root):
//   node <skill>/scripts/build.mjs <carousel-dir>
// <carousel-dir>/slides.json describes the slides (see assets/slides.example.json).
// Output: <carousel-dir>/out/slide-1.png ... slide-N.png (2160x2700) and carousel.pdf (vector text, 1080x1350 pages).
// Also warns when a slide's text runs into the artwork (textMax) so you fix copy instead of shipping overlap.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dir = resolve(process.argv[2] ?? '.');
const cfg = JSON.parse(readFileSync(join(dir, 'slides.json'), 'utf8'));
const out = join(dir, 'out'); mkdirSync(out, { recursive: true });

const first = (list) => list.find((p) => p && existsSync(p));
const font = first([cfg.font, ...['node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2', 'video/tools/node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2'].map((p) => resolve(p)), '/Users/wanby/my_files/exergy/EXERGY-Brand/assets/fonts/DMSans-variable-latin.woff2']);
const logo = first([cfg.logo && resolve(dir, cfg.logo), '/Users/wanby/my_files/exergy/EXERGY-Brand/assets/exergy-logo-corrected.svg']);
if (!font) throw new Error('DM Sans font not found: set "font" in slides.json');
if (!logo) throw new Error('logo not found: set "logo" in slides.json');
copyFileSync(font, join(out, 'font.woff2')); copyFileSync(logo, join(out, 'logo.svg'));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/(\w)'(\w)/g, '$1\u2019$2').replace(/'s\b/g, '\u2019s');   // typographic apostrophes
const n = cfg.slides.length, pad = (i) => String(i + 1).padStart(2, '0');
const block = (b) => {
  if (b.p) return `<p>${esc(b.p)}</p>`;
  if (b.b) return `<p class="b">${esc(b.b)}</p>`;
  if (b.item) return `<p class="item"><b>${esc(b.item)}</b> ${esc(b.text ?? '')}</p>`;
  if (b.note) return `<p class="note">${esc(b.note)}</p>`;
  if (b.email) return `<p class="email">${esc(b.email)}</p>`;
  throw new Error('unknown block ' + JSON.stringify(b));
};
const slides = cfg.slides.map((s, i) => {
  const img = resolve(dir, s.image); if (!existsSync(img)) throw new Error('missing image ' + img);
  copyFileSync(img, join(out, `bg-${i + 1}${img.slice(img.lastIndexOf('.'))}`));
  return `<section class="slide" id="s${i + 1}"><img class="bg" src="bg-${i + 1}${img.slice(img.lastIndexOf('.'))}" alt=""><div class="content"><h1>${esc(s.title)}</h1>${s.blocks.map(block).join('')}</div><div class="foot"><img src="logo.svg" alt="EXERGY"><span>${pad(i)} / ${pad(n - 1)}</span></div></section>`;
});
const html = readFileSync(join(here, 'template.html'), 'utf8').replace('__FONT__', 'font.woff2').replace('__SLIDES__', slides.join('\n'));
writeFileSync(join(out, 'carousel.html'), html);

const req = createRequire(join(process.cwd(), 'package.json'));
const { chromium } = req('playwright');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(join(out, 'carousel.html')).href);
await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
let warned = 0;
for (let i = 0; i < n; i++) {
  const sel = `#s${i + 1}`;
  const bottom = await page.$eval(`${sel} .content`, (e) => { const kids = [...e.children]; return kids[kids.length - 1].getBoundingClientRect().bottom - e.closest('.slide').getBoundingClientRect().top; });
  const max = cfg.slides[i].textMax ?? 780;
  if (bottom > max) { warned++; console.warn(`slide ${i + 1}: text ends at ${Math.round(bottom)}px, past textMax ${max}px (it will run into the artwork): shorten the copy or raise textMax`); }
  await (await page.$(sel)).screenshot({ path: join(out, `slide-${i + 1}.png`) });
  console.log(`slide ${i + 1}: text ends at ${Math.round(bottom)}px (max ${max})`);
}
await page.pdf({ path: join(out, 'carousel.pdf'), width: '1080px', height: '1350px', printBackground: true });
await browser.close();
console.log(`done: ${n} slides + carousel.pdf in ${out}` + (warned ? `  (${warned} overflow warning${warned > 1 ? 's' : ''})` : ''));
