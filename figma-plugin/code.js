// Harbourline — A3 Web Proposal · Figma builder plugin
// Builds: cover, design system, 3 mobile screens (375x812), 3 desktop screens (1440x900)
// Run via: Figma → Plugins → Development → Import plugin from manifest → run.

// ---------- palette (from slides/deck.html design system) ----------
var INK = { r: 0x0B / 255, g: 0x1F / 255, b: 0x3A / 255 };
var HARB = { r: 0x1B / 255, g: 0x5F / 255, b: 0xA8 / 255 };
var CORAL = { r: 0xFF / 255, g: 0x6B / 255, b: 0x4A / 255 };
var TEAL = { r: 0x2E / 255, g: 0x8C / 255, b: 0x8C / 255 };
var SAND = { r: 0xF4 / 255, g: 0xED / 255, b: 0xE3 / 255 };
var PAPER = { r: 1, g: 1, b: 1 };
var PAGE = { r: 0xF7 / 255, g: 0xF5 / 255, b: 0xF0 / 255 };
var MUTED = { r: 0x5A / 255, g: 0x6B / 255, b: 0x82 / 255 };
var LINE = { r: 0xE3 / 255, g: 0xE0 / 255, b: 0xD8 / 255 };
var INKSOFT = { r: 0xE8 / 255, g: 0xEE / 255, b: 0xF5 / 255 };

// ---------- fonts (with fallback) ----------
var FONT = {
  regular: { family: "Inter", style: "Regular" },
  medium: { family: "Inter", style: "Medium" },
  semibold: { family: "Inter", style: "Semi Bold" },
  bold: { family: "Inter", style: "Bold" },
  display: { family: "Inter", style: "Bold" },
  displayMed: { family: "Inter", style: "Semi Bold" }
};
var DISPLAY_TRIED = false;
async function loadFonts() {
  var list = [FONT.regular, FONT.medium, FONT.semibold, FONT.bold, FONT.displayMed];
  for (var i = 0; i < list.length; i++) await figma.loadFontAsync(list[i]);
  if (!DISPLAY_TRIED) {
    try {
      await figma.loadFontAsync({ family: "Playfair Display", style: "Bold" });
      FONT.display = { family: "Playfair Display", style: "Bold" };
      await figma.loadFontAsync({ family: "Playfair Display", style: "SemiBold" });
      FONT.displayMed = { family: "Playfair Display", style: "SemiBold" };
    } catch (e) { /* stay on Inter */ }
    DISPLAY_TRIED = true;
  }
}

// ---------- primitives ----------
function rect(w, h, fill, radius) {
  var r = figma.createRectangle();
  r.resize(w, h);
  r.fills = fill ? [fill] : [];
  if (radius) r.cornerRadius = radius;
  return r;
}
function T(str, size, key, color, opts) {
  opts = opts || {};
  var t = figma.createText();
  t.fontName = FONT[key] || FONT.regular;
  t.characters = str;
  t.fontSize = size;
  t.fills = [color || INK];
  t.letterSpacing = opts.ls ? { value: opts.ls, unit: "PIXELS" } : undefined;
  t.lineHeight = opts.lh ? { value: opts.lh, unit: "PIXELS" } : undefined;
  return t;
}
function Twrap(str, size, key, color, width, opts) {
  var t = T(str, size, key, color, opts);
  t.textAutoResize = "HEIGHT";
  t.resize(width, t.height);
  return t;
}
function F(opts) {
  var f = figma.createFrame();
  f.name = opts.name || "frame";
  f.fills = opts.fill ? [opts.fill] : [];
  if (opts.radius) f.cornerRadius = opts.radius;
  if (opts.stroke) { f.strokes = [opts.stroke]; f.strokeWeight = opts.sw || 1; }
  f.resize(opts.w || 100, opts.h || 100);
  if (opts.layout === "H") f.layoutMode = "HORIZONTAL";
  if (opts.layout === "V") f.layoutMode = "VERTICAL";
  if (opts.gap !== undefined) f.itemSpacing = opts.gap;
  if (opts.pad !== undefined) { f.paddingLeft = opts.pad; f.paddingRight = opts.pad; f.paddingTop = opts.pad; f.paddingBottom = opts.pad; }
  if (opts.padX !== undefined) { f.paddingLeft = opts.padX; f.paddingRight = opts.padX; }
  if (opts.padY !== undefined) { f.paddingTop = opts.padY; f.paddingBottom = opts.padY; }
  if (opts.align) f.primaryAxisAlignItems = opts.align;
  if (opts.calign) f.counterAxisAlignItems = opts.calign;
  f.clipsContent = true;
  return f;
}
function chip(label, active) {
  var c = F({ name: "chip", w: 999, h: 999, layout: "H", calign: "CENTER" });
  c.cornerRadius = 999;
  c.paddingLeft = 14; c.paddingRight = 14; c.paddingTop = 8; c.paddingBottom = 8;
  c.fills = active ? [CORAL] : [PAPER];
  if (!active) { c.strokes = [LINE]; c.strokeWeight = 1; }
  c.appendChild(T(label, 12, "semibold", active ? PAPER : INK));
  c.layoutSizingHorizontal = "HUG";
  c.layoutSizingVertical = "HUG";
  return c;
}
function avatar(d, letter) {
  var a = F({ name: "avatar", w: d, h: d, fill: HARB, radius: d / 2, calign: "CENTER", align: "CENTER" });
  a.layoutMode = "NONE";
  a.appendChild(T(letter, Math.round(d * 0.42), "bold", PAPER));
  return a;
}
function imgph(w, h, label, tint) {
  var p = F({ name: "image:" + label, w: w, h: h, fill: tint || INKSOFT, radius: 12, layout: "V", align: "CENTER", calign: "CENTER", gap: 6 });
  var dot = F({ name: "icon", w: 26, h: 20, layout: "H", gap: 0, align: "CENTER", calign: "MAX" });
  var m1 = rect(10, 12, HARB); m1.opacity = 0.55; m1.rotation = -14;
  var m2 = rect(10, 12, HARB); m2.opacity = 0.35; m2.rotation = -14; m2.x = 8;
  dot.appendChild(m1); dot.appendChild(m2);
  p.appendChild(dot);
  p.appendChild(T(label, 11, "medium", MUTED));
  return p;
}
function expCard(w, title, meta, imgLabel, tint) {
  var c = F({ name: "card:" + title, w: w, layout: "V", fill: PAPER, radius: 16, stroke: LINE, sw: 1 });
  c.appendChild(imgph(w, 96, imgLabel, tint));
  var body = F({ name: "body", w: w, layout: "V", gap: 6 });
  body.paddingLeft = 14; body.paddingRight = 14; body.paddingTop = 12; body.paddingBottom = 12;
  body.appendChild(T(title, 14, "semibold", INK));
  body.appendChild(T(meta, 11, "regular", MUTED));
  var row = F({ name: "row", w: w - 28, h: 24, layout: "H", gap: 8, align: "MAX", calign: "CENTER" });
  row.appendChild(chip("Free", false));
  var add = T("+ Add to plan", 12, "bold", CORAL);
  row.appendChild(add);
  body.appendChild(row);
  c.appendChild(body);
  return c;
}
function bottomNav(activeIdx) {
  var items = ["Plan", "Experiences", "Ferry", "Events", "Profile"];
  var bar = F({ name: "bottom nav", w: 375, h: 64, fill: PAPER, layout: "H", align: "SPACE_BETWEEN" });
  bar.paddingLeft = 18; bar.paddingRight = 18; bar.paddingTop = 8;
  for (var i = 0; i < items.length; i++) {
    var it = F({ name: items[i], w: 52, h: 48, layout: "V", gap: 4, align: "CENTER" });
    var dot = rect(14, 14, i === activeIdx ? CORAL : LINE, 7);
    it.appendChild(dot);
    it.appendChild(T(items[i], 9, i === activeIdx ? "bold" : "regular", i === activeIdx ? CORAL : MUTED));
    bar.appendChild(it);
  }
  return bar;
}
function statusBar() {
  var s = F({ name: "status bar", w: 375, h: 32, layout: "H", align: "SPACE_BETWEEN", calign: "CENTER" });
  s.paddingLeft = 20; s.paddingRight = 20;
  s.appendChild(T("9:41", 13, "semibold", INK));
  var right = F({ name: "sys icons", w: 70, h: 14, layout: "H", gap: 5, align: "MAX", calign: "CENTER" });
  right.appendChild(rect(14, 10, INK, 2));
  right.appendChild(rect(10, 10, INK, 2));
  right.appendChild(rect(30, 12, INK, 3));
  s.appendChild(right);
  return s;
}
function mobileTopbar(title, withBack) {
  var t = F({ name: "topbar", w: 375, h: 48, layout: "H", calign: "CENTER", gap: 8 });
  t.paddingLeft = 20; t.paddingRight = 20;
  if (withBack) { var b = T("‹", 22, "bold", INK); t.appendChild(b); }
  var ttl = T(title, 16, "bold", INK);
  t.appendChild(ttl);
  var spacer = rect(10, 10, PAPER); spacer.fills = [];
  t.appendChild(F({ name: "spacer", w: 200, h: 10 }));
  t.appendChild(avatar(28, "N"));
  return t;
}
function mobileShell(name, children) {
  var shell = F({ name: name, w: 375, h: 812, fill: PAPER, radius: 24, stroke: LINE, sw: 1, layout: "V" });
  for (var i = 0; i < children.length; i++) shell.appendChild(children[i]);
  return shell;
}
function canvasPage(name) {
  var p = F({ name: name, w: 1440, h: 900, fill: PAGE, layout: "V" });
  p.paddingLeft = 64; p.paddingRight = 64; p.paddingTop = 48; p.paddingBottom = 48;
  return p;
}
function pageHeader(kicker, title) {
  var h = F({ name: "header", w: 1312, layout: "V", gap: 6 });
  h.appendChild(T(kicker.toUpperCase(), 12, "bold", HARB, { ls: 2 }));
  h.appendChild(T(title, 40, "display", INK));
  return h;
}

// ---------- frame 0: cover ----------
function buildCover() {
  var p = F({ name: "00 · Cover", w: 1440, h: 900, fill: INK, layout: "V" });
  p.paddingLeft = 96; p.paddingRight = 96; p.paddingTop = 88;
  p.appendChild(T("ASSESSMENT A3 · WEB PROPOSAL · DECO1016", 13, "bold", CORAL, { ls: 3 }));
  p.appendChild(F({ name: "sp", w: 10, h: 24 }));
  p.appendChild(T("Harbourline", 96, "display", PAPER));
  p.appendChild(F({ name: "sp2", w: 10, h: 16 }));
  p.appendChild(Twrap("A Sydney tourism website that plans your visit by activity, time of day and budget — not by suburb. Mobile-first, with a login-free shareable plan.", 640, 20, "regular", INKSOFT, 640));
  p.appendChild(F({ name: "sp3", w: 10, h: 40 }));
  var meta = F({ name: "meta", w: 700, h: 48, layout: "H", gap: 24, calign: "CENTER" });
  meta.appendChild(T("Nuo Yan Li", 15, "semibold", PAPER));
  meta.appendChild(T("Student ID 560879285", 15, "regular", INKSOFT));
  meta.appendChild(T("28 September 2026", 15, "regular", INKSOFT));
  p.appendChild(meta);
  var strip = F({ name: "palette strip", w: 240, h: 8, layout: "H" });
  strip.appendChild(rect(60, 8, HARB)); strip.appendChild(rect(60, 8, CORAL)); strip.appendChild(rect(60, 8, TEAL)); strip.appendChild(rect(60, 8, SAND));
  p.appendChild(F({ name: "sp4", w: 10, h: 48 }));
  p.appendChild(strip);
  return p;
}

// ---------- frame 1: design system ----------
function buildDesignSystem() {
  var p = canvasPage("01 · Design system");
  p.appendChild(pageHeader("Design system", "Harbourline tokens"));
  p.appendChild(F({ name: "sp", w: 10, h: 24 }));

  // colors
  var colors = F({ name: "colors", w: 1312, layout: "V", gap: 12 });
  colors.appendChild(T("Colour · coral ≤10% of pixels, committed actions only", 13, "bold", MUTED, { ls: 1 }));
  var row = F({ name: "swatches", w: 1312, h: 170, layout: "H", gap: 16 });
  var sw = [
    ["Ink", INK, "#0B1F3A"], ["Harbour", HARB, "#1B5FA8"], ["Coral", CORAL, "#FF6B4A"],
    ["Teal", TEAL, "#2E8C8C"], ["Sand", SAND, "#F4EDE3"], ["Paper", PAPER, "#FFFFFF"]
  ];
  for (var i = 0; i < sw.length; i++) {
    var c = F({ name: sw[i][0], w: 208, layout: "V", gap: 8 });
    c.appendChild(rect(208, 120, sw[i][1], 16));
    var lab = F({ name: "label", w: 208, h: 30, layout: "H", gap: 8 });
    lab.appendChild(T(sw[i][0], 13, "semibold", INK));
    lab.appendChild(T(sw[i][2], 12, "regular", MUTED));
    c.appendChild(lab);
    row.appendChild(c);
  }
  colors.appendChild(row);
  p.appendChild(colors);
  p.appendChild(F({ name: "sp2", w: 10, h: 24 }));

  // type + spacing + controls in three columns
  var cols = F({ name: "cols", w: 1312, h: 420, layout: "H", gap: 24 });

  var typeCol = F({ name: "type", w: 560, h: 420, layout: "V", gap: 18, fill: PAPER, radius: 16, stroke: LINE, sw: 1, pad: 24 });
  typeCol.appendChild(T("Typography", 13, "bold", MUTED, { ls: 1 }));
  var typeRows = [
    ["Display", "The harbour, in one line.", 32, "display", "Fraunces (deck) / display serif"],
    ["Heading", "Section titles", 22, "displayMed", "serif semi-bold"],
    ["Body", "Card and page copy, 15/22.", 15, "regular", "Inter 15/22"],
    ["Caption", "Meta, prices, timestamps.", 11, "medium", "Inter 11, tracked"]
  ];
  for (var t = 0; t < typeRows.length; t++) {
    var tr = F({ name: typeRows[t][0], w: 512, layout: "V", gap: 4 });
    tr.appendChild(T(typeRows[t][4], 10, "regular", MUTED, { ls: 1 }));
    tr.appendChild(T(typeRows[t][2], typeRows[t][3] === "display" ? 28 : typeRows[t][3] === "displayMed" ? 22 : typeRows[t][3], typeRows[t][3], INK));
    typeCol.appendChild(tr);
  }
  cols.appendChild(typeCol);

  var spaceCol = F({ name: "spacing", w: 340, h: 420, layout: "V", gap: 14, fill: PAPER, radius: 16, stroke: LINE, sw: 1, pad: 24 });
  spaceCol.appendChild(T("Spacing · 8px rhythm", 13, "bold", MUTED, { ls: 1 }));
  var sp = [[8, 32], [16, 64], [24, 96], [32, 128], [48, 160]];
  for (var s = 0; s < sp.length; s++) {
    var sr = F({ name: "s" + sp[s][0], w: 292, h: 24, layout: "H", gap: 12, calign: "CENTER" });
    sr.appendChild(rect(sp[s][0], 16, HARB, 4));
    sr.appendChild(T(sp[s][0] + "px", 12, "semibold", INK));
    spaceCol.appendChild(sr);
  }
  cols.appendChild(spaceCol);

  var ctrlCol = F({ name: "controls", w: 388, h: 420, layout: "V", gap: 16, fill: PAPER, radius: 16, stroke: LINE, sw: 1, pad: 24 });
  ctrlCol.appendChild(T("Controls", 13, "bold", MUTED, { ls: 1 }));
  var btn = F({ name: "Primary", w: 200, h: 44, layout: "H", align: "CENTER", calign: "CENTER", fill: CORAL, radius: 999 });
  btn.appendChild(T("Add to plan", 14, "bold", PAPER));
  ctrlCol.appendChild(btn);
  var btn2 = F({ name: "Secondary", w: 200, h: 44, layout: "H", align: "CENTER", calign: "CENTER", fill: PAPER, radius: 999, stroke: INK, sw: 1.5 });
  btn2.appendChild(T("Save for later", 14, "semibold", INK));
  ctrlCol.appendChild(btn2);
  ctrlCol.appendChild(chip("Beach day"));
  ctrlCol.appendChild(chip("Budget under $50", true));
  var avRow = F({ name: "avatars", w: 260, h: 40, layout: "H", gap: 8 });
  avRow.appendChild(avatar(40, "J")); avRow.appendChild(avatar(40, "D")); avRow.appendChild(avatar(40, "A"));
  ctrlCol.appendChild(avRow);
  cols.appendChild(ctrlCol);

  p.appendChild(cols);
  return p;
}

// ---------- frame 2: mobile home ----------
function buildMobileHome() {
  var p = canvasPage("02 · Mobile — Home (375×812)");
  var head = F({ name: "cap", w: 1312, h: 20, layout: "H", align: "MAX" });
  head.appendChild(T("Primary screen · 375 × 812 · first-timer landing", 12, "medium", MUTED));
  p.appendChild(head);

  var search = F({ name: "search", w: 335, h: 44, layout: "H", gap: 8, calign: "CENTER", fill: SAND, radius: 999, pad: 14 });
  search.appendChild(T("Plan your Sydney visit…", 13, "regular", MUTED));
  var chipRow = F({ name: "chips", w: 335, h: 32, layout: "H", gap: 8 });
  chipRow.appendChild(chip("Beach day"));
  chipRow.appendChild(chip("Night views"));
  chipRow.appendChild(chip("Under $50"));
  var cards = F({ name: "exp cards", w: 335, layout: "V", gap: 12 });
  cards.appendChild(expCard(335, "Opera House at sunrise", "1.5 hrs · $42 · Harbourfront", "image:opera-house", INKSOFT));
  cards.appendChild(expCard(335, "Manly ferry round trip", "25 min · $11 · Ferry", "image:ferry-boat", INKSOFT));
  cards.appendChild(expCard(335, "Bondi to Coogee walk", "2 hrs · Free · Beach", "image:bondi-beach", INKSOFT));
  var planStrip = F({ name: "plan strip", w: 335, h: 44, layout: "H", gap: 10, calign: "CENTER", fill: INK, radius: 12, pad: 14 });
  var dot = rect(8, 8, CORAL, 4);
  planStrip.appendChild(dot);
  planStrip.appendChild(T("2 items in your plan", 12, "semibold", PAPER));
  planStrip.appendChild(F({ name: "sp", w: 10, h: 10, fills: [] }));
  planStrip.appendChild(T("View →", 12, "bold", CORAL));

  var content = F({ name: "content", w: 375, layout: "V", gap: 16 });
  content.paddingTop = 12; content.paddingBottom = 8;
  content.appendChild(search);
  var sec = F({ name: "sec", w: 335, layout: "V", gap: 10 });
  sec.appendChild(T("Plan by feel, not by suburb", 16, "bold", INK));
  sec.appendChild(T("Activity · time of day · budget", 11, "regular", MUTED));
  sec.appendChild(chipRow);
  content.appendChild(sec);
  var sec2 = F({ name: "sec2", w: 335, layout: "H", align: "SPACE_BETWEEN", calign: "MAX" });
  sec2.appendChild(T("Today in the harbour", 15, "bold", INK));
  sec2.appendChild(T("See all", 12, "medium", HARB));
  content.appendChild(sec2);
  content.appendChild(cards);
  content.appendChild(F({ name: "grow", w: 10, h: 100, fills: [] }));
  content.appendChild(planStrip);

  p.appendChild(F({ name: "sp", w: 10, h: 24 }));
  p.appendChild(mobileShell("Mobile · Home", [statusBar(), mobileTopbar("Harbourline", false), content, bottomNav(0)]));
  return p;
}

// ---------- frame 3: mobile my plan ----------
function buildMobilePlan() {
  var p = canvasPage("03 · Mobile — My Plan (375×812)");
  var head = F({ name: "cap", w: 1312, h: 20, layout: "H", align: "MAX" });
  head.appendChild(T("The core loop · itinerary + login-free share link", 12, "medium", MUTED));
  p.appendChild(head);

  function stop(time, title, meta, accent) {
    var row = F({ name: time, w: 335, h: 68, layout: "H", gap: 12, calign: "CENTER" });
    var timeCol = F({ name: "time", w: 44, h: 68, layout: "V", gap: 4, align: "CENTER" });
    timeCol.appendChild(T(time, 12, "bold", INK));
    row.appendChild(timeCol);
    var rail = F({ name: "rail", w: 20, h: 68, layout: "V", calign: "CENTER" });
    rail.appendChild(rect(10, 10, accent, 5));
    rail.appendChild(rect(2, 40, LINE));
    row.appendChild(rail);
    var card = F({ name: "stop", w: 265, h: 68, layout: "V", gap: 4, fill: PAPER, radius: 12, stroke: LINE, sw: 1, pad: 12 });
    card.appendChild(T(title, 13, "semibold", INK));
    card.appendChild(T(meta, 11, "regular", MUTED));
    row.appendChild(card);
    return row;
  }

  var summary = F({ name: "summary", w: 335, h: 72, layout: "V", gap: 6, fill: SAND, radius: 12, pad: 16 });
  summary.appendChild(T("Saturday · 3 stops", 13, "bold", INK));
  summary.appendChild(T("Manly ferry → Opera House → Botanic Garden · ≈ $53 · 6 hrs", 11, "regular", MUTED));

  var stops = F({ name: "stops", w: 335, layout: "V", gap: 0 });
  stops.appendChild(stop("8:30", "Manly ferry round trip", "Ferry · 25 min · $11", CORAL));
  stops.appendChild(stop("11:00", "Opera House at sunrise slot", "1.5 hrs · $42 · Harbourfront", HARB));
  stops.appendChild(stop("13:30", "Royal Botanic Garden", "Free · 1 hr · Park", TEAL));

  var share = F({ name: "share", w: 335, h: 48, layout: "H", align: "CENTER", calign: "CENTER", gap: 8, fill: HARB, radius: 12 });
  share.appendChild(T("Share plan — no login needed", 13, "bold", PAPER));

  var content = F({ name: "content", w: 375, layout: "V", gap: 14 });
  content.paddingTop = 8; content.paddingBottom = 8;
  content.appendChild(summary);
  content.appendChild(stops);
  content.appendChild(F({ name: "grow", w: 10, h: 80, fills: [] }));
  content.appendChild(share);

  p.appendChild(F({ name: "sp", w: 10, h: 24 }));
  p.appendChild(mobileShell("Mobile · My Plan", [statusBar(), mobileTopbar("My plan", true), content, bottomNav(0)]));
  return p;
}

// ---------- frame 4: mobile experience ----------
function buildMobileExp() {
  var p = canvasPage("04 · Mobile — Experience (375×812)");
  var head = F({ name: "cap", w: 1312, h: 20, layout: "H", align: "MAX" });
  head.appendChild(T("Detail + commitment · every card ends in + Add to plan", 12, "medium", MUTED));
  p.appendChild(head);

  var hero = F({ name: "hero", w: 375, h: 210, fill: INK, layout: "V", align: "MAX" });
  hero.paddingLeft = 20; hero.paddingBottom = 14;
  var heroLabel = T("image:opera-house — sunrise", 12, "regular", INKSOFT);
  hero.appendChild(heroLabel);

  var title = F({ name: "title", w: 335, layout: "V", gap: 6 });
  title.appendChild(T("Opera House — at sunrise", 20, "bold", INK));
  title.appendChild(T("1.5 hrs · $42 · Harbourfront · best 7–9 am", 12, "regular", MUTED));
  var tags = F({ name: "tags", w: 335, h: 30, layout: "H", gap: 8 });
  tags.appendChild(chip("Iconic"));
  tags.appendChild(chip("Photo spot", true));

  var cta = F({ name: "cta", w: 335, h: 52, layout: "H", align: "CENTER", calign: "CENTER", fill: CORAL, radius: 12 });
  cta.appendChild(T("+ Add to plan", 15, "bold", PAPER));

  var pairs = F({ name: "pairs", w: 375, h: 170, layout: "H", gap: 12 });
  pairs.paddingLeft = 20; pairs.paddingRight = 20;
  pairs.appendChild(expCard(165, "Ferry to Manly", "25 min · $11", "image:ferry-boat", INKSOFT));
  pairs.appendChild(expCard(165, "Harbour Bridge walk", "20 min · Free", "image:bridge-walk", INKSOFT));

  var secTitle = F({ name: "secT", w: 335, h: 20, layout: "H" });
  secTitle.paddingLeft = 0;
  secTitle.appendChild(T("Pairs well with", 14, "bold", INK));

  var content = F({ name: "content", w: 375, layout: "V", gap: 14 });
  content.paddingTop = 8;
  content.appendChild(title);
  content.appendChild(tags);
  content.appendChild(cta);
  content.appendChild(secTitle);
  content.appendChild(F({ name: "grow", w: 10, h: 40, fills: [] }));

  p.appendChild(F({ name: "sp", w: 10, h: 24 }));
  p.appendChild(mobileShell("Mobile · Experience", [statusBar(), mobileTopbar("Harbourline", true), hero, content, bottomNav(1)]));
  return p;
}

// ---------- desktop header ----------
function desktopHeader(active) {
  var h = F({ name: "header", w: 1440, h: 72, layout: "H", gap: 32, calign: "CENTER", fill: PAPER });
  h.paddingLeft = 48; h.paddingRight = 48;
  var logo = F({ name: "logo", w: 150, h: 40, layout: "H", gap: 8, calign: "CENTER" });
  logo.appendChild(rect(20, 20, CORAL, 6));
  logo.appendChild(T("Harbourline", 18, "bold", INK));
  h.appendChild(logo);
  var nav = F({ name: "nav", w: 500, h: 40, layout: "H", gap: 24, calign: "CENTER" });
  var items = [["Experiences", 0], ["My Plan", 1], ["Events", 2], ["Go Deeper", 3]];
  for (var i = 0; i < items.length; i++) {
    var it = T(items[i][0], 14, items[i][1] === active ? "bold" : "medium", items[i][1] === active ? CORAL : INK);
    nav.appendChild(it);
  }
  h.appendChild(nav);
  h.appendChild(F({ name: "grow", w: 200, h: 10, fills: [] }));
  var search = F({ name: "search", w: 280, h: 40, layout: "H", gap: 8, calign: "CENTER", fill: SAND, radius: 999, pad: 14 });
  search.appendChild(T("Search Sydney…", 13, "regular", MUTED));
  h.appendChild(search);
  h.appendChild(avatar(36, "N"));
  return h;
}

// ---------- frame 5: desktop home ----------
function buildDesktopHome() {
  var p = F({ name: "05 · Desktop — Home (1440×900)", w: 1440, h: 900, fill: PAGE, layout: "V" });
  p.appendChild(desktopHeader(0));

  var hero = F({ name: "hero", w: 1440, h: 300, fill: INK, layout: "H" });
  hero.paddingLeft = 48; hero.paddingRight = 48;
  var heroL = F({ name: "left", w: 700, layout: "V", gap: 12 });
  heroL.appendChild(T("EXPERIENCE-FIRST TOURISM", 12, "bold", CORAL, { ls: 3 }));
  heroL.appendChild(T("Plan Sydney by activity, time and budget.", 36, "display", PAPER));
  heroL.appendChild(Twrap("Not by suburb. Build a day from how you want to spend it — the map comes after the plan.", 520, 14, "regular", INKSOFT, 520));
  var hsearch = F({ name: "search", w: 520, h: 48, layout: "H", gap: 8, calign: "CENTER", fill: PAPER, radius: 999, pad: 16 });
  hsearch.appendChild(T("What kind of day do you want?", 14, "regular", MUTED));
  heroL.appendChild(hsearch);
  var hchips = F({ name: "chips", w: 520, h: 32, layout: "H", gap: 8 });
  hchips.appendChild(chip("Beach day")); hchips.appendChild(chip("Night views")); hchips.appendChild(chip("Free"));
  heroL.appendChild(hchips);
  hero.appendChild(F({ name: "grow", w: 10, h: 10, fills: [] }));
  hero.appendChild(imgph(460, 300, "image:golden-hour-skyline", HARB));
  p.appendChild(hero);

  var body = F({ name: "body", w: 1440, layout: "H", gap: 24 });
  body.paddingLeft = 48; body.paddingRight = 48; body.paddingTop = 28;
  var grid = F({ name: "grid", w: 960, h: 380, layout: "V", gap: 16 });
  var secT = F({ name: "secT", w: 960, h: 20, layout: "H", align: "SPACE_BETWEEN" });
  secT.appendChild(T("Start your day", 18, "bold", INK));
  secT.appendChild(T("See all experiences", 13, "medium", HARB));
  grid.appendChild(secT);
  var row1 = F({ name: "row1", w: 960, layout: "H", gap: 16 });
  row1.appendChild(expCard(309, "Opera House at sunrise", "1.5 hrs · $42 · Harbourfront", "image:opera-house", INKSOFT));
  row1.appendChild(expCard(309, "Manly ferry round trip", "25 min · $11 · Ferry", "image:ferry-boat", INKSOFT));
  row1.appendChild(expCard(309, "Bondi to Coogee walk", "2 hrs · Free · Beach", "image:bondi-beach", INKSOFT));
  grid.appendChild(row1);
  var row2 = F({ name: "row2", w: 960, layout: "H", gap: 16 });
  row2.appendChild(expCard(309, "Harbour Bridge climb", "3.5 hrs · $339 · Iconic", "image:bridge-climb", INKSOFT));
  row2.appendChild(expCard(309, "Royal Botanic Garden", "Free · 1 hr · Park", "image:botanic-garden", INKSOFT));
  row2.appendChild(expCard(309, "Night markets, Chinatown", "2 hrs · Free · Evening", "image:night-market", INKSOFT));
  grid.appendChild(row2);
  body.appendChild(grid);

  var plan = F({ name: "plan rail", w: 280, h: 380, layout: "V", gap: 12, fill: PAPER, radius: 16, stroke: LINE, sw: 1, pad: 20 });
  plan.appendChild(T("Your plan · Saturday", 15, "bold", INK));
  plan.appendChild(stop("8:30", "Manly ferry round trip", "Ferry · $11", CORAL, 240));
  plan.appendChild(stop("11:00", "Opera House", "1.5 hrs · $42", HARB, 240));
  var share = F({ name: "share", w: 240, h: 44, layout: "H", align: "CENTER", calign: "CENTER", fill: HARB, radius: 999 });
  share.appendChild(T("Share — no login", 13, "bold", PAPER));
  plan.appendChild(share);
  body.appendChild(plan);
  p.appendChild(body);
  return p;
}
function stop(time, title, meta, accent, w) {
  var row = F({ name: time, w: w, h: 60, layout: "H", gap: 10, calign: "CENTER" });
  var tc = F({ name: "t", w: 40, h: 60, layout: "V", gap: 4, align: "CENTER" });
  tc.appendChild(T(time, 12, "bold", INK));
  row.appendChild(tc);
  var dot = rect(8, 8, accent, 4);
  row.appendChild(dot);
  var card = F({ name: title, w: w - 60, h: 60, layout: "V", gap: 4, fill: SAND, radius: 10, pad: 10 });
  card.appendChild(T(title, 12, "semibold", INK));
  card.appendChild(T(meta, 10, "regular", MUTED));
  row.appendChild(card);
  return row;
}

// ---------- frame 6: desktop my plan ----------
function buildDesktopPlan() {
  var p = F({ name: "06 · Desktop — My Plan (1440×900)", w: 1440, h: 900, fill: PAGE, layout: "V" });
  p.appendChild(desktopHeader(1));

  var body = F({ name: "body", w: 1440, layout: "H", gap: 24 });
  body.paddingLeft = 48; body.paddingRight = 48; body.paddingTop = 28;

  var left = F({ name: "itinerary", w: 880, h: 560, layout: "V", gap: 14, fill: PAPER, radius: 16, stroke: LINE, sw: 1, pad: 28 });
  left.appendChild(T("My plan · Saturday", 20, "bold", INK));
  left.appendChild(T("4 stops · 6.5 hrs · ≈ $64", 12, "regular", MUTED));
  left.appendChild(stop("8:30", "Manly ferry round trip", "Ferry · 25 min · $11", CORAL, 824));
  left.appendChild(stop("11:00", "Opera House at sunrise slot", "1.5 hrs · $42 · Harbourfront", HARB, 824));
  left.appendChild(stop("13:30", "Royal Botanic Garden", "Free · 1 hr · Park", TEAL, 824));
  left.appendChild(stop("15:00", "The Rocks heritage walk", "45 min · Free · Heritage", INK, 824));
  left.appendChild(F({ name: "grow", w: 10, h: 60, fills: [] }));
  var note = T("Every stop is one tap from any experience card — the plan is always visible on mobile.", 12, "regular", MUTED);
  left.appendChild(note);
  body.appendChild(left);

  var right = F({ name: "summary rail", w: 400, h: 560, layout: "V", gap: 16 });
  var sum = F({ name: "summary", w: 400, h: 200, layout: "V", gap: 10, fill: INK, radius: 16, pad: 24 });
  sum.appendChild(T("Day summary", 15, "bold", PAPER));
  sum.appendChild(T("Total spend ≈ $64 · travel 40 min · 4 stops", 13, "regular", INKSOFT));
  var money = F({ name: "money", w: 352, h: 12, layout: "H", fill: PAPER, radius: 6 });
  var seg1 = rect(206, 12, CORAL); var seg2 = rect(88, 12, HARB); var seg3 = rect(58, 12, TEAL);
  money.appendChild(seg1); money.appendChild(seg2); money.appendChild(seg3);
  sum.appendChild(money);
  sum.appendChild(T("$42 Opera House · $11 ferry · $11 food · $0 free stops", 10, "regular", INKSOFT));
  right.appendChild(sum);
  var shareCard = F({ name: "share", w: 400, h: 220, layout: "V", gap: 12, fill: PAPER, radius: 16, stroke: LINE, sw: 1, pad: 24 });
  shareCard.appendChild(T("Share this plan", 15, "bold", INK));
  shareCard.appendChild(T("Anyone with the link can open it — no login, no app:", 12, "regular", MUTED));
  var link = F({ name: "link", w: 352, h: 40, layout: "H", calign: "CENTER", fill: SAND, radius: 10, pad: 14 });
  link.appendChild(T("harbourline.app/p/8k2mQv", 13, "semibold", INK));
  shareCard.appendChild(link);
  var btn = F({ name: "cta", w: 352, h: 44, layout: "H", align: "CENTER", calign: "CENTER", fill: CORAL, radius: 999 });
  btn.appendChild(T("Copy link", 13, "bold", PAPER));
  shareCard.appendChild(btn);
  right.appendChild(shareCard);
  body.appendChild(right);
  p.appendChild(body);
  return p;
}

// ---------- frame 7: desktop experience ----------
function buildDesktopExp() {
  var p = F({ name: "07 · Desktop — Experience (1440×900)", w: 1440, h: 900, fill: PAGE, layout: "V" });
  p.appendChild(desktopHeader(0));

  var crumb = F({ name: "crumb", w: 1440, h: 24, layout: "H" });
  crumb.paddingLeft = 48; crumb.paddingTop = 16;
  crumb.appendChild(T("Experiences / Harbourfront / ", 12, "regular", MUTED));
  crumb.appendChild(T("Opera House at sunrise", 12, "semibold", INK));
  p.appendChild(crumb);

  var body = F({ name: "body", w: 1440, layout: "H", gap: 24 });
  body.paddingLeft = 48; body.paddingRight = 48; body.paddingTop = 16;
  body.appendChild(imgph(760, 560, "image:opera-house — hero", HARB));

  var info = F({ name: "info", w: 540, h: 560, layout: "V", gap: 14, fill: PAPER, radius: 16, stroke: LINE, sw: 1, pad: 28 });
  info.appendChild(T("Opera House — at sunrise", 24, "display", INK));
  info.appendChild(T("1.5 hrs · $42 pp · Harbourfront · best 7–9 am", 13, "regular", MUTED));
  var tags = F({ name: "tags", w: 484, h: 32, layout: "H", gap: 8 });
  tags.appendChild(chip("Iconic")); tags.appendChild(chip("Photo spot")); tags.appendChild(chip("Family"));
  info.appendChild(tags);
  info.appendChild(Twrap("Catch the first light on the sails with the harbour empty — a first-timer's signature photo, no queues. Slot-based booking keeps the experience calm.", 484, 13, "regular", INK, 484));
  var cta = F({ name: "cta", w: 484, h: 52, layout: "H", align: "CENTER", calign: "CENTER", fill: CORAL, radius: 12 });
  cta.appendChild(T("+ Add to plan", 15, "bold", PAPER));
  info.appendChild(cta);
  info.appendChild(T("Pairs well with: Manly ferry · Harbour Bridge walk", 12, "medium", HARB));
  info.appendChild(F({ name: "grow", w: 10, h: 40, fills: [] }));
  var facts = F({ name: "facts", w: 484, layout: "H", gap: 12 });
  var fact = function (label, val) {
    var fc = F({ name: label, w: 154, h: 76, layout: "V", gap: 4, fill: SAND, radius: 12, pad: 12 });
    fc.appendChild(T(label, 10, "medium", MUTED, { ls: 1 }));
    fc.appendChild(T(val, 18, "bold", INK));
    return fc;
  };
  facts.appendChild(fact("DURATION", "1.5 hrs"));
  facts.appendChild(fact("COST", "$42"));
  facts.appendChild(fact("WALKING", "Low"));
  info.appendChild(facts);
  body.appendChild(info);
  p.appendChild(body);
  return p;
}

// ---------- main ----------
async function main() {
  await loadFonts();
  var page = figma.createPage();
  page.name = "Harbourline A3";
  var frames = [
    buildCover(),
    buildDesignSystem(),
    buildMobileHome(),
    buildMobilePlan(),
    buildMobileExp(),
    buildDesktopHome(),
    buildDesktopPlan(),
    buildDesktopExp()
  ];
  var x = 0;
  for (var i = 0; i < frames.length; i++) {
    frames[i].x = x;
    frames[i].y = 0;
    page.appendChild(frames[i]);
    x += frames[i].width + 80;
  }
  figma.currentPage = page;
  figma.viewport.scrollAndZoomIntoView(frames);
  figma.notify("Harbourline built: 8 frames (cover, design system, 3 mobile, 3 desktop)");
}
main();
