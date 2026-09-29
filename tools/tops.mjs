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
await p.setViewport({ width: 2560, height: 1000, deviceScaleFactor: 1 });
await p.goto("file://" + file, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise(r => setTimeout(r, 500));
const res = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll(".wlabel, .page, .legend").forEach(el => {
    const r = el.getBoundingClientRect();
    const label = el.classList.contains("wlabel") ? el.textContent.trim().slice(0,45) : (el.className);
    out.push({ top: Math.round(r.top), bottom: Math.round(r.bottom), label });
  });
  return out.sort((a,b)=>a.top-b.top);
});
console.log(JSON.stringify(res, null, 1));
await b.close();
