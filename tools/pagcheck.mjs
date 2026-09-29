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
await p.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
await p.goto("file://" + file, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise(r => setTimeout(r, 500));
const res = await p.evaluate(() => {
  // A4 at 96dpi = 794x1123; margins 11mm=41.7px top, 13mm=49.1px bottom, 12mm=45.4px sides
  const contentH = 1123 - 41.7 - 49.1;
  return [...document.querySelectorAll(".pg")].map((el, i) => {
    const h = el.scrollHeight;
    const imgs = [...el.querySelectorAll("img")].filter(im => im.naturalWidth === 0).length;
    return { page: i + 1, height: Math.round(h), fits: h <= contentH + 2, contentH: Math.round(contentH), brokenImgs: imgs,
      head: (el.querySelector(".sechead h2, h1")?.textContent || "").slice(0, 40) };
  });
});
console.log(JSON.stringify(res, null, 1));
await b.close();
