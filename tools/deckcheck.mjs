import { createRequire } from "node:module";
import { resolve } from "node:path";
const require = createRequire(process.env.HOME + "/lib/browser-drivers/package.json");
process.env.PUPPETEER_CACHE_DIR = process.env.HOME + "/.cache/puppeteer";
const puppeteer = require("puppeteer");
import { homedir } from "node:os";
const file = resolve(process.argv[2]);
const execPath = homedir() + "/.cache/puppeteer/chrome/mac-131.0.6778.264/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const b = await puppeteer.launch({ headless: "new", executablePath: execPath, args: ["--no-sandbox", "--allow-file-access-from-files"] });
const p = await b.newPage();
await p.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
await p.goto("file://" + file, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise(r => setTimeout(r, 800));
const res = await p.evaluate(async () => {
  // force each slide active in turn and measure overflow + broken images
  const slides = [...document.querySelectorAll('.slide')];
  const out = [];
  for (let k = 0; k < slides.length; k++) {
    slides.forEach((s, j) => s.classList.toggle('active', j === k));
    await new Promise(r => setTimeout(r, 30));
    const s = slides[k];
    const overflow = [...s.querySelectorAll('*')].filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && (r.bottom > 721 || r.right > 1281);
    }).map(el => el.tagName + '.' + (el.className?.toString().slice(0, 20) || '')).slice(0, 5);
    const img = s.querySelector('img');
    const imgOk = img ? (img.naturalWidth > 0 ? `img ${img.naturalWidth}x${img.naturalHeight}` : 'IMG BROKEN: ' + img.src) : 'no img';
    out.push({ slide: k + 1, overflow, img: imgOk });
  }
  slides.forEach((s, j) => s.classList.toggle('active', j === 0));
  return out;
});
console.log(JSON.stringify(res, null, 1));
await b.close();
