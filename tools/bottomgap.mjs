import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(process.env.HOME + '/lib/browser-drivers/package.json');
const puppeteer = require('puppeteer');
const exe = process.env.HOME + '/.cache/puppeteer/chrome/mac-131.0.6778.264/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browser = await puppeteer.launch({ executablePath: exe, args: ['--no-sandbox'], headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
await page.goto('file://' + path.resolve('slides/deck.html'));
await new Promise(r => setTimeout(r, 2500));
const res = await page.evaluate(() => {
  const out = [];
  const slides = [...document.querySelectorAll('.slide')];
  slides.forEach((s, k) => {
    window.go(k);
    const r = s.getBoundingClientRect();
    let maxBottom = 0, minTop = 720;
    for (const el of s.querySelectorAll('h1,h2,h3,h4,p,div,span,table,ul,li,section,img')) {
      const b = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      if (b.width > 0 && b.height > 0 && st.display !== 'none' && st.visibility !== 'hidden') { maxBottom = Math.max(maxBottom, b.bottom - r.top); minTop = Math.min(minTop, b.top - r.top); }
    }
    const broken = [...s.querySelectorAll('img')].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src.split('/').slice(-2).join('/'));
    out.push({ k, bottom: Math.round(maxBottom), top: Math.round(minTop), gap: Math.round(720 - maxBottom), broken });
  });
  window.go(0);
  return out;
});
console.log(JSON.stringify(res));
await browser.close();
