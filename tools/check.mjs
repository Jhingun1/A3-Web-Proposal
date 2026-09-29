// check.mjs — detect annotation overflow/overlap in a board HTML
// Usage: node check.mjs <file.html> [annSelector] [cardSelector]
import { createRequire } from "node:module";
import { resolve as resolvePath } from "node:path";
const require = createRequire(process.env.HOME + "/lib/browser-drivers/package.json");
process.env.PUPPETEER_CACHE_DIR = process.env.HOME + "/.cache/puppeteer";
const puppeteer = require("puppeteer");
import { homedir } from "node:os";
const file = process.argv[2];
const SEL = process.argv[3] || ".ann";
const CARD = process.argv[4] || ".card";
const execPath = process.env.CHROME_BIN ||
  homedir() + "/.cache/puppeteer/chrome/mac-131.0.6778.264/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const b = await puppeteer.launch({ headless: "new", executablePath: execPath, args: ["--no-sandbox", "--allow-file-access-from-files"] });
const p = await b.newPage();
await p.setViewport({ width: 2200, height: 1400, deviceScaleFactor: 1 });
await p.goto("file://" + resolvePath(file), { waitUntil: "networkidle2", timeout: 60000 });
await new Promise(r => setTimeout(r, 1200));
const res = await p.evaluate(({ sel, card }) => {
  const SEL = sel, CARD = card;
  const issues = [];
  document.querySelectorAll(CARD).forEach((card, i) => {
    const cr = card.getBoundingClientRect();
    const anns = [...card.querySelectorAll(SEL)];
    anns.forEach((a) => {
      const ar = a.getBoundingClientRect();
      const label = (a.querySelector("b")?.textContent || a.textContent).slice(0, 40);
      if (ar.right > cr.right - 4) issues.push(`OVERFLOW-R card${i} "${label}" +${(ar.right - cr.right).toFixed(0)}px`);
      if (ar.bottom > cr.bottom - 4) issues.push(`OVERFLOW-B card${i} "${label}" +${(ar.bottom - cr.bottom).toFixed(0)}px`);
    });
    const boxes = anns.map(a => a.getBoundingClientRect());
    for (let x = 0; x < boxes.length; x++) for (let y = x + 1; y < boxes.length; y++) {
      const ox = Math.min(boxes[x].right, boxes[y].right) - Math.max(boxes[x].left, boxes[y].left);
      const oy = Math.min(boxes[x].bottom, boxes[y].bottom) - Math.max(boxes[x].top, boxes[y].top);
      if (ox > 8 && oy > 8) issues.push(`OVERLAP card${i} ${ox.toFixed(0)}x${oy.toFixed(0)}`);
    }
  });
  const board = document.querySelector(".board")?.getBoundingClientRect();
  return { issues, boardW: board?.width, boardH: board?.height };
}, { sel: SEL, card: CARD });
console.log(JSON.stringify(res, null, 1));
await b.close();
