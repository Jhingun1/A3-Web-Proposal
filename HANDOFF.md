# A3 Web Proposal — Final Handoff & Submission Checklist

Everything needed to record the video and submit on Canvas. The PDF and slide deck are already built — only recording + uploading + verifying remain.

## 0. Fill in the [brackets] — DONE (filled 28 Sept 2026)

Name (Nuo Yan Li), student ID (560879285), unit (DECO1016 Introduction to Web Design), date, model name (Qwen 3.8 27B), and APA7 access dates (28 Sept. 2026) are all filled in the deck, PDF HTML, transcript, AI declaration, and bibliography. If you edit anything in `pdf/`, regenerate the PDF:

```bash
cd /Users/chingun/Downloads/A3-Web-Proposal
node tools/pdf.mjs .
node tools/pagcheck.mjs pdf/A3-Web-Proposal.html   # confirm 13 pages, all fit, 0 broken imgs
```

## 1. Record the proposal video (~20 min)

**Hard constraints (markers stop at 5:00):**
- Length: **under 5:00** — the transcript is 648 words ≈ **4:28** at a normal pace. It is the safest script you have.
- **Face AND voice required** — no slideshow-only screen share, no voiceover without face.
- File size **≤ 100 MB**.

**Recommended capture method — deck + picture-in-picture:**
1. Open `slides/deck.html` in Chrome. Press **F** (fullscreen). The deck auto-scales to 16:9, ←/→ advance slides, **N** toggles the speaker-notes bar (keep it hidden while recording).
2. Use macOS **QuickTime → New Film Recording → options ▾ → select "Screen with FaceTime Camera"** (green screen-share icon + camera toggle). This gives screen + face in one take.
   - Alternative: Zoom → start solo meeting → "Share screen" → pick the Chrome window → turn on video. Easiest for PIP placement.
3. **Rehearse the full run-through once** before recording. 19 slides, ~14 s each. Don't narrate the notes bar or the keyboard hints.
4. Record. Keep eye contact with the camera when possible, not the deck.
5. Check: total runtime < 5:00 and file ≤ 100 MB (Zoom exports are typically fine at 1080p for 4.5 min ≈ 80–120 MB; if over 100 MB, re-encode below).

**If the file is over 100 MB:**
```bash
# HandBrake CLI (brew install handbrake) — Fast 1080p30 preset, typically 3–4x smaller
HandBrakeCLI -i recording.mov -o video/harbourline-proposal.mp4 -p Fast\ 1080p30
```
Or in the HandBrake GUI: source → preset **Fast 1080p30** → Start Queue.

**Naming:** `video/Harbourline-A3-proposal-560879285.mp4` (keep in the `video/` folder).

## 2. Upload to Canvas (assignment 699073, unlimited attempts)

1. Go to https://canvas.sydney.edu.au/courses/74574/assignments/699073
2. **Submit A3 — PDF:** upload `pdf/A3-Web-Proposal.pdf` (single PDF: cover, transcript, AI declaration, APA7 bibliography, appendices A–G).
3. **Submit A3 — Video:** upload `video/Harbourline-A3-proposal-560879285.mp4`.
4. Click **Submit Assignment** and wait for the "Your submission has been received" banner.

## 3. Verify by re-download (required step — do not skip)

1. On the assignment page, open **Submit Assignment → attempt list** (or "View submission").
2. **Re-download the PDF**, open it: confirm it is the *final* version (filled name/ID/date on the cover, 13 pages, appendix images render).
3. **Re-download the video**: confirm length < 5:00, plays with **face + voice**, and file size ≤ 100 MB.
4. If the wrong file downloaded, replace it via **Edit Submission** (attempts are unlimited — a replacement is free).

## 4. What was built (file map)

```
A3-Web-Proposal/
├── pdf/A3-Web-Proposal.pdf        ← SUBMIT THIS (13 pages: cover, transcript, AI decl, APA7 bib, appendix A–G)
├── pdf/A3-Web-Proposal.html       ← PDF source (edit brackets here, re-run node tools/pdf.mjs .)
├── pdf/transcript.md              ← 648 words ≈ 4:28, [S#] markers in 19-slide deck order
├── pdf/ai-declaration.md          ← DSH v0.10.0, model: Qwen 3.8 27B (filled)
├── pdf/bibliography.md            ← APA7, access dates filled (28 Sept. 2026)
├── slides/deck.html               ← SUBMIT-READY deck (19 slides, 1280×720, keyboard nav, speaker notes)
├── sitemap/sitemap.html + .png    ← appendix A
├── personas/overview.md           ← appendix B
├── moodboard/moodboard.html + .png← appendix C (1720×1327)
├── sketches/sketches.html + .png  ← appendix D (2100×1367)
├── wireframes/wireframes-*.html + .png  ← appendix E/F (2560×3647 desktop, 1760×1619 mobile)
├── research/notes.md              ← appendix G
├── figma-plugin/  manifest.json + code.js + README.md  ← Figma builder (8 frames: cover, design system, 3 mobile, 3 desktop)
└── tools/  shot.mjs · check.mjs · pagcheck.mjs · deckcheck.mjs · pdf.mjs · tops.mjs
```

**QA state:** all boards pass `tools/check.mjs` (`{"issues":[]}`); deck passes `tools/deckcheck.mjs` (no overflow, all 4 images load); PDF passes `tools/pagcheck.mjs` (13 pages fit, 0 broken images).

## 5. Talking-point cheatsheet for the "zoom one wireframe" depth question (slide 14)

> "Jenna plans on her phone, mid-decision, budget-minded. So the pivotal decision is the **+ Add to plan** action on every card, backed by a persistent plan strip — she commits without leaving the screen. On mobile that strip is a sticky bar above the bottom nav, so the plan is always one tap away."
