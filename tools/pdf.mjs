// pdf.mjs — render the A3 single-PDF (transcript + AI declaration + bibliography + appendix)
// Usage: node pdf.mjs  (writes pdf/A3-Web-Proposal.pdf)
import { createRequire } from "node:module";
import { resolve as resolvePath, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(process.env.HOME + "/lib/browser-drivers/package.json");
process.env.PUPPETEER_CACHE_DIR = process.env.HOME + "/.cache/puppeteer";
const puppeteer = require("puppeteer");
import { homedir } from "node:os";

const root = resolvePath(process.argv[2] || ".");
const src = resolvePath(root, "pdf/A3-Web-Proposal.html");
const out = resolvePath(root, "pdf/A3-Web-Proposal.pdf");
const execPath = process.env.CHROME_BIN ||
  homedir() + "/.cache/puppeteer/chrome/mac-131.0.6778.264/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const b = await puppeteer.launch({ headless: "new", executablePath: execPath, args: ["--no-sandbox", "--allow-file-access-from-files"] });
const p = await b.newPage();
await p.goto("file://" + src, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise(r => setTimeout(r, 800));
await p.pdf({
  path: out,
  format: "A4",
  printBackground: true,
  margin: { top: "0", bottom: "0", left: "0", right: "0" },
  preferCSSPageSize: false,
});
console.log("OK", out);
await b.close();
