# Harbourline — Figma assets (A3 / A4 ready)

Figma assets for the Harbourline proposal. Two ways to use them:

## A. No setup — run the builder plugin (2 minutes)

Builds **8 frames** on a new page named `Harbourline A3`:

| # | Frame | Size |
|---|-------|------|
| 00 | Cover | 1440×900 |
| 01 | Design system (colours, type, spacing, controls) | 1440×900 |
| 02 | Mobile — Home (primary screen, 375×812) | canvas |
| 03 | Mobile — My Plan (itinerary + share loop) | canvas |
| 04 | Mobile — Experience (detail + Add to plan) | canvas |
| 05 | Desktop — Home (1440) | 1440×900 |
| 06 | Desktop — My Plan (1440) | 1440×900 |
| 07 | Desktop — Experience (1440) | 1440×900 |

Steps:
1. Go to https://www.figma.com and sign in (free account is fine — student email).
2. **New design file** → menu (☰ top-left) → **Plugins → Development → Import plugin from manifest…**
3. Select `figma-plugin/manifest.json` from this folder.
4. Menu → **Plugins → Development → Harbourline A3 — build Harbourline** → run.
5. The plugin creates the page, builds all frames, and zooms to fit.

Notes:
- Colours/spacing come from the approved design system (Harbourline: `#0B1F3A / #1B5FA8 / #FF6B4A / #2E8C8C / #F4EDE3`, 8px rhythm, coral ≤10%).
- Photos show as labelled placeholder blocks (`image:…`) — drop the real files from `slides/photos/` onto them, or use Figma's stock images.
- Fonts: tries Playfair Display for display text, falls back to Inter automatically.
- This Figma file is also a solid **A4 prototype starting point**: the frames are already structured (cards, nav, buttons) so A4 can start here instead of from scratch.

## B. Later — connect Figma to this DSH session (optional)

If you want the agent to read designs *from* Figma (or push code back), connect the official Figma MCP server:

1. Figma → avatar → **Settings → Security → Personal access tokens** → generate a token (scopes: `file_content:read`).
2. Tell me the token (or paste it into the shell that starts DSH as `FIGMA_OAUTH_TOKEN`).
3. I'll register `https://mcp.figma.com/mcp` as an MCP server for this profile — after that I can run `get_design_context` / `get_screenshot` against any frame link you paste.

Not required for A3 submission; only needed if you want Figma-driven implementation for A4.
