// shot.mjs — render a local HTML file to PNG (full page) via Puppeteer.
// Usage: node shot.mjs <input.html> <output.png> [--width 1440] [--scale 2]
import { createRequire } from "node:module";
import { resolve as resolvePath } from "node:path";
const require = createRequire(process.env.HOME + "/lib/browser-drivers/package.json");
process.env.PUPPETEER_CACHE_DIR = process.env.HOME + "/.cache/puppeteer";
const puppeteer = require("puppeteer");

const args = process.argv.slice(2);
const inHtml = args.find((a) => !a.startsWith("--") && a.endsWith(".html"));
const outPng = args.find((a) => !a.startsWith("--") && a.endsWith(".png"));
const num = (flag, d) => { const i = args.indexOf(flag); return i >= 0 ? Number(args[i + 1]) : d; };
const width = num("--width", 1440);
const scale = num("--scale", 2);

import { homedir } from "node:os";
const execPath = process.env.CHROME_BIN ||
  homedir() + "/.cache/puppeteer/chrome/mac-131.0.6778.264/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const browser = await puppeteer.launch({
  headless: "new",
  executablePath: execPath,
  args: ["--no-sandbox", "--disable-gpu", "--lang=en-US", "--allow-file-access-from-files"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, deviceScaleFactor: scale });
  await page.goto("file://" + resolvePath(inHtml), { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: outPng, fullPage: true });
  console.log("OK", outPng);
} finally {
  await browser.close();
}
