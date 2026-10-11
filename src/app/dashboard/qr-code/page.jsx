"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { QrCode, Download, Link2, ExternalLink, Type, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const CANVAS_W = 900;
const PANEL_X = 90;
const PANEL_SIZE = 720;
const QR_PADDING = 48;
const LOGO_RATIO = 0.22;

const GREEN_DARK = "#0C3027";
const GREEN = "#123D32";
const GREEN_LIGHT = "#1F6B4F";
const GOLD_LIGHT = "#E5C476";
const GOLD = "#C6A15B";
const GOLD_DARK = "#9C7A3C";

const FONT_STACK = '"Poppins", "Segoe UI", Arial, sans-serif';

// border: "hand" = framePath draws its own inset outline, "none" = the frame draws a custom border,
// otherwise the generic inset stroke is used.
const FRAMES = {
  card: { label: "Card", height: 1080, headerY: 88, dividerY: 124, panelY: 160, border: "hand" },
  house: { label: "House", height: 1280, headerY: 292, dividerY: 324, panelY: 352, border: "hand" },
  skyline: { label: "Skyline", height: 1240, headerY: 258, dividerY: 290, panelY: 318, top: 180, border: "hand" },
  arch: { label: "Arch", height: 1170, headerY: 188, dividerY: 220, panelY: 250, border: "hand" },
  keytag: { label: "Key Tag", height: 1280, headerY: 300, dividerY: 332, panelY: 360, top: 110 },
  signboard: { label: "Sign Board", height: 1210, headerY: 232, dividerY: 264, panelY: 294, top: 150 },
  pin: { label: "Location", height: 1200, headerY: 88, dividerY: 124, panelY: 160 },
  crest: { label: "Crest", height: 1250, headerY: 88, dividerY: 124, panelY: 160 },
  tower: { label: "Tower", height: 1320, headerY: 340, dividerY: 372, panelY: 400, top: 120 },
  door: { label: "Door", height: 1190, headerY: 198, dividerY: 230, panelY: 258 },
  ticket: { label: "Ticket", height: 1120, headerY: 88, dividerY: 124, panelY: 160, captionY: 1000 },
  gem: { label: "Gem", height: 1310, headerY: 200, dividerY: 232, panelY: 262 },
  ornate: { label: "Ornate", height: 1090, headerY: 100, dividerY: 136, panelY: 168, border: "none" },
  ribbon: { label: "Ribbon", height: 1110, headerY: 88, dividerY: 124, panelY: 160, captionY: 968, hostY: 1048 },
  phone: { label: "Phone", height: 1150, headerY: 128, dividerY: 162, panelY: 196 },
  pennant: { label: "Pennant", height: 1190, headerY: 128, dividerY: 160, panelY: 190, top: 40 },
  stamp: { label: "Stamp", height: 1090, headerY: 96, dividerY: 132, panelY: 168 },
  blueprint: { label: "Blueprint", height: 1080, headerY: 88, dividerY: 124, panelY: 160 },
};

const TICKET_NOTCH_Y = 930;

const MODULE_STYLES = [
  { id: "dots", label: "Dots" },
  { id: "rounded", label: "Rounded" },
  { id: "classic", label: "Classic" },
  { id: "towers", label: "Towers" },
  { id: "fluid", label: "Fluid" },
  { id: "diamond", label: "Diamond" },
  { id: "leaf", label: "Leaf" },
];

const EYE_STYLES = [
  { id: "rounded", label: "Rounded" },
  { id: "square", label: "Square" },
  { id: "circle", label: "Circle" },
  { id: "leaf", label: "Leaf" },
];

const normalizeUrl = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const getHost = (value) => {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const roundRect = (ctx, x, y, w, h, r) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

// Corner radii are given clockwise from the top-left: [tl, tr, br, bl].
const roundRectCorners = (ctx, x, y, w, h, radii) => {
  const max = Math.min(w, h) / 2;
  const [tl, tr, br, bl] = radii.map((r) => Math.min(r, max));
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.arcTo(x + w, y, x + w, y + h, tr);
  ctx.arcTo(x + w, y + h, x, y + h, br);
  ctx.arcTo(x, y + h, x, y, bl);
  ctx.arcTo(x, y, x + w, y, tl);
  ctx.closePath();
};

const roundedPolygon = (ctx, points, radii) => {
  const n = points.length;
  const [lx, ly] = points[n - 1];
  const [fx, fy] = points[0];
  ctx.beginPath();
  ctx.moveTo((lx + fx) / 2, (ly + fy) / 2);
  points.forEach(([px, py], i) => {
    const [qx, qy] = points[(i + 1) % n];
    ctx.arcTo(px, py, qx, qy, Array.isArray(radii) ? radii[i] : radii);
  });
  ctx.closePath();
};

const goldGradient = (ctx, x0, y0, x1, y1) => {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, GOLD_LIGHT);
  g.addColorStop(0.5, GOLD);
  g.addColorStop(1, GOLD_DARK);
  return g;
};

const greenGradient = (ctx, x0, y0, x1, y1) => {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, GREEN_DARK);
  g.addColorStop(1, GREEN_LIGHT);
  return g;
};

const setLetterSpacing = (ctx, value) => {
  if ("letterSpacing" in ctx) ctx.letterSpacing = value;
};

const fitText = (ctx, text, maxWidth) => {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let trimmed = text;
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return `${trimmed}…`;
};

const isFinderModule = (row, col, count) =>
  (row < 7 && col < 7) || (row < 7 && col >= count - 7) || (row >= count - 7 && col < 7);

// Centres of the 5×5 alignment patterns for a QR version (ISO/IEC 18004 table E.1).
const getAlignmentCenters = (version) => {
  if (version < 2) return [];
  const size = version * 4 + 17;
  const posCount = Math.floor(version / 7) + 2;
  const interval = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
  const positions = [size - 7];
  for (let i = 1; i < posCount - 1; i++) positions.push(positions[i - 1] - interval);
  positions.push(6);
  positions.reverse();

  const last = positions.length - 1;
  const centers = [];
  positions.forEach((row, i) => {
    positions.forEach((col, j) => {
      const overlapsFinder = (i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0);
      if (!overlapsFinder) centers.push([row, col]);
    });
  });
  return centers;
};

const drawModule = (ctx, x, y, cell, style, n) => {
  const cx = x + cell / 2;
  const cy = y + cell / 2;

  if (style === "dots") {
    ctx.beginPath();
    ctx.arc(cx, cy, cell * 0.44, 0, Math.PI * 2);
  } else if (style === "rounded") {
    roundRect(ctx, x + cell * 0.06, y + cell * 0.06, cell * 0.88, cell * 0.88, cell * 0.32);
  } else if (style === "towers") {
    const w = cell * 0.76;
    const r = w / 2;
    const top = n.top ? 0 : r;
    const bottom = n.bottom ? 0 : r;
    roundRectCorners(ctx, x + (cell - w) / 2, y, w, cell + 0.6, [top, top, bottom, bottom]);
  } else if (style === "fluid") {
    const r = cell / 2;
    roundRectCorners(ctx, x, y, cell + 0.6, cell + 0.6, [
      !n.top && !n.left ? r : 0,
      !n.top && !n.right ? r : 0,
      !n.bottom && !n.right ? r : 0,
      !n.bottom && !n.left ? r : 0,
    ]);
  } else if (style === "diamond") {
    const h = cell * 0.58;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h);
    ctx.lineTo(cx + h, cy);
    ctx.lineTo(cx, cy + h);
    ctx.lineTo(cx - h, cy);
    ctx.closePath();
  } else if (style === "leaf") {
    const big = cell * 0.45;
    const small = cell * 0.08;
    roundRectCorners(ctx, x + cell * 0.05, y + cell * 0.05, cell * 0.9, cell * 0.9, [big, small, big, small]);
  } else {
    ctx.fillRect(x, y, cell + 0.6, cell + 0.6);
    return;
  }
  ctx.fill();
};

const eyeLayerPath = (ctx, x, y, size, eyeStyle, corner) => {
  if (eyeStyle === "circle") {
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  } else if (eyeStyle === "leaf") {
    const big = size * 0.42;
    const small = size * 0.08;
    roundRectCorners(ctx, x, y, size, size, corner === "tl" ? [big, small, big, small] : [small, big, small, big]);
  } else {
    roundRect(ctx, x, y, size, size, size * (eyeStyle === "square" ? 0.07 : 0.31));
  }
};

const drawEye = (ctx, x, y, cell, eyeStyle, corner) => {
  eyeLayerPath(ctx, x, y, cell * 7, eyeStyle, corner);
  ctx.fillStyle = greenGradient(ctx, x, y, x + cell * 7, y + cell * 7);
  ctx.fill();

  eyeLayerPath(ctx, x + cell, y + cell, cell * 5, eyeStyle, corner);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  // Gold stays dark enough here for scanners to read the eye centre as a dark module.
  const core = ctx.createLinearGradient(x + cell * 2, y + cell * 2, x + cell * 5, y + cell * 5);
  core.addColorStop(0, "#A47D36");
  core.addColorStop(1, "#7A5A22");
  eyeLayerPath(ctx, x + cell * 2, y + cell * 2, cell * 3, eyeStyle, corner);
  ctx.fillStyle = core;
  ctx.fill();
};

const drawAlignment = (ctx, x, y, cell, eyeStyle, fill) => {
  eyeLayerPath(ctx, x, y, cell * 5, eyeStyle, "tl");
  ctx.fillStyle = fill;
  ctx.fill();
  eyeLayerPath(ctx, x + cell, y + cell, cell * 3, eyeStyle, "tl");
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  eyeLayerPath(ctx, x + cell * 2, y + cell * 2, cell, eyeStyle, "tl");
  ctx.fillStyle = fill;
  ctx.fill();
};

const drawDivider = (ctx, cx, y) => {
  ctx.strokeStyle = goldGradient(ctx, cx - 90, y, cx + 90, y);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 90, y);
  ctx.lineTo(cx - 16, y);
  ctx.moveTo(cx + 16, y);
  ctx.lineTo(cx + 90, y);
  ctx.stroke();

  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(cx, y - 7);
  ctx.lineTo(cx + 7, y);
  ctx.lineTo(cx, y + 7);
  ctx.lineTo(cx - 7, y);
  ctx.closePath();
  ctx.fill();
};

const HOUSE = { wallL: 60, wallR: 840, eaveL: 15, eaveR: 885, eaveY: 250, apexY: 25 };
const SKYLINE_BASE = 180;
const ARCH = { centerY: 210, radiusY: 190 };

const framePath = (ctx, frame, H, inset) => {
  const W = CANVAS_W;

  if (frame === "house") {
    const { wallL, wallR, eaveL, eaveR, eaveY, apexY } = HOUSE;
    const apexX = W / 2;
    const bottom = H - 30;
    if (inset === 0) {
      const r = 50;
      ctx.beginPath();
      ctx.moveTo(wallL, bottom - r);
      ctx.lineTo(wallL, eaveY);
      ctx.lineTo(eaveL, eaveY);
      ctx.lineTo(apexX, apexY);
      ctx.lineTo(eaveR, eaveY);
      ctx.lineTo(wallR, eaveY);
      ctx.lineTo(wallR, bottom - r);
      ctx.arcTo(wallR, bottom, wallR - r, bottom, r);
      ctx.lineTo(wallL + r, bottom);
      ctx.arcTo(wallL, bottom, wallL, bottom - r, r);
      ctx.closePath();
      return;
    }
    const slope = (eaveY - apexY) / (eaveR - apexX);
    const innerApexY = apexY + inset / Math.cos(Math.atan(slope));
    const roofAt = (x) => innerApexY + Math.abs(x - apexX) * slope;
    const left = wallL + inset;
    const right = wallR - inset;
    const innerBottom = bottom - inset;
    const r = 34;
    ctx.beginPath();
    ctx.moveTo(left, innerBottom - r);
    ctx.lineTo(left, roofAt(left));
    ctx.lineTo(apexX, innerApexY);
    ctx.lineTo(right, roofAt(right));
    ctx.lineTo(right, innerBottom - r);
    ctx.arcTo(right, innerBottom, right - r, innerBottom, r);
    ctx.lineTo(left + r, innerBottom);
    ctx.arcTo(left, innerBottom, left, innerBottom - r, r);
    ctx.closePath();
    return;
  }

  if (frame === "arch") {
    const r = inset === 0 ? 64 : 48;
    const left = inset;
    const right = W - inset;
    const bottom = H - inset;
    ctx.beginPath();
    ctx.moveTo(left, ARCH.centerY);
    ctx.ellipse(W / 2, ARCH.centerY, W / 2 - inset, ARCH.radiusY - inset, 0, Math.PI, Math.PI * 2);
    ctx.lineTo(right, bottom - r);
    ctx.arcTo(right, bottom, right - r, bottom, r);
    ctx.lineTo(left + r, bottom);
    ctx.arcTo(left, bottom, left, bottom - r, r);
    ctx.closePath();
    return;
  }

  if (frame === "skyline") {
    roundRect(ctx, inset, SKYLINE_BASE + inset, W - inset * 2, H - SKYLINE_BASE - inset * 2, inset === 0 ? 56 : 40);
    return;
  }

  if (frame === "keytag") {
    const top = FRAMES.keytag.top;
    roundedPolygon(
      ctx,
      [
        [290, top],
        [W - 290, top],
        [W, 260],
        [W, H],
        [0, H],
        [0, 260],
      ],
      [40, 40, 40, 64, 64, 40]
    );
    return;
  }

  if (frame === "signboard") {
    const top = FRAMES.signboard.top;
    roundRect(ctx, 0, top, W, H - top, 48);
    return;
  }

  if (frame === "pin") {
    const body = H - 120;
    roundedPolygon(
      ctx,
      [
        [0, 0],
        [W, 0],
        [W, body],
        [W / 2 + 70, body],
        [W / 2, H - 24],
        [W / 2 - 70, body],
        [0, body],
      ],
      [64, 64, 64, 22, 16, 22, 64]
    );
    return;
  }

  if (frame === "crest") {
    const r = 56;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(W - r, 0);
    ctx.arcTo(W, 0, W, r, r);
    ctx.lineTo(W, 880);
    ctx.bezierCurveTo(W, 1060, W - 250, 1160, W / 2, H - 10);
    ctx.bezierCurveTo(250, 1160, 0, 1060, 0, 880);
    ctx.lineTo(0, r);
    ctx.arcTo(0, 0, r, 0, r);
    ctx.closePath();
    return;
  }

  if (frame === "tower") {
    roundedPolygon(
      ctx,
      [
        [0, H],
        [0, 300],
        [110, 300],
        [110, 210],
        [240, 210],
        [240, 120],
        [W - 240, 120],
        [W - 240, 210],
        [W - 110, 210],
        [W - 110, 300],
        [W, 300],
        [W, H],
      ],
      [56, 14, 10, 14, 10, 14, 14, 10, 14, 10, 14, 56]
    );
    return;
  }

  if (frame === "door") {
    roundRect(ctx, 30, 0, W - 60, H - 30, 28);
    return;
  }

  if (frame === "ticket") {
    const r = 48;
    const notch = 34;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(W, 0, W, H, r);
    ctx.lineTo(W, TICKET_NOTCH_Y - notch);
    ctx.arc(W, TICKET_NOTCH_Y, notch, -Math.PI / 2, Math.PI / 2, true);
    ctx.arcTo(W, H, 0, H, r);
    ctx.arcTo(0, H, 0, 0, r);
    ctx.lineTo(0, TICKET_NOTCH_Y + notch);
    ctx.arc(0, TICKET_NOTCH_Y, notch, Math.PI / 2, -Math.PI / 2, true);
    ctx.arcTo(0, 0, W, 0, r);
    ctx.closePath();
    return;
  }

  if (frame === "gem") {
    roundedPolygon(
      ctx,
      [
        [W / 2, 0],
        [W, 170],
        [W, H - 170],
        [W / 2, H],
        [0, H - 170],
        [0, 170],
      ],
      [24, 20, 20, 24, 20, 20]
    );
    return;
  }

  if (frame === "ornate") {
    roundRect(ctx, 0, 0, W, H, 16);
    return;
  }

  if (frame === "ribbon") {
    roundRect(ctx, 40, 0, W - 80, H, 56);
    return;
  }

  if (frame === "phone") {
    roundRect(ctx, 12, 0, W - 24, H, 92);
    return;
  }

  if (frame === "pennant") {
    const top = FRAMES.pennant.top;
    roundedPolygon(
      ctx,
      [
        [40, top],
        [W - 40, top],
        [W - 40, H],
        [W / 2, H - 120],
        [40, H],
      ],
      [6, 6, 14, 18, 14]
    );
    return;
  }

  if (frame === "stamp") {
    roundRect(ctx, 0, 0, W, H, 4);
    return;
  }

  if (frame === "blueprint") {
    roundRect(ctx, 0, 0, W, H, 28);
    return;
  }

  roundRect(ctx, inset, inset, W - inset * 2, H - inset * 2, inset === 0 ? 64 : 48);
};

const drawChimney = (ctx) => {
  ctx.fillStyle = greenGradient(ctx, 630, 70, 690, 170);
  ctx.fillRect(630, 76, 60, 100);
  ctx.lineWidth = 4;
  ctx.strokeStyle = goldGradient(ctx, 630, 70, 690, 170);
  ctx.strokeRect(630, 76, 60, 100);
  roundRect(ctx, 618, 62, 84, 16, 5);
  ctx.fillStyle = goldGradient(ctx, 618, 62, 702, 78);
  ctx.fill();
};

const drawSkyline = (ctx) => {
  const base = SKYLINE_BASE;
  const side = [
    [340, 62, 128],
    [282, 50, 96],
    [208, 66, 146],
    [154, 46, 82],
    [84, 62, 112],
  ];
  const towers = [
    [405, 90, 160],
    ...side,
    ...side.map(([x, w, h]) => [CANVAS_W - x - w, w, h]),
  ];

  ctx.fillStyle = goldGradient(ctx, 0, base - 170, 0, base);
  towers.forEach(([x, w, h]) => {
    roundRectCorners(ctx, x, base - h, w, h + 20, [4, 4, 0, 0]);
    ctx.fill();
  });

  ctx.fillStyle = "rgba(12, 48, 39, 0.45)";
  towers.forEach(([x, w, h]) => {
    let row = 0;
    for (let wy = base - h + 14; wy < base - 12; wy += 18, row++) {
      let col = 0;
      for (let wx = x + 10; wx + 6 <= x + w - 8; wx += 14, col++) {
        if ((row + col) % 3 !== 0) ctx.fillRect(wx, wy, 6, 9);
      }
    }
  });

  ctx.strokeStyle = GOLD_LIGHT;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(CANVAS_W / 2, base - 160);
  ctx.lineTo(CANVAS_W / 2, base - 176);
  ctx.stroke();
  ctx.fillStyle = GOLD_LIGHT;
  ctx.beginPath();
  ctx.arc(CANVAS_W / 2, base - 177, 4, 0, Math.PI * 2);
  ctx.fill();
};

const drawSignChains = (ctx) => {
  const barY = 34;
  roundRect(ctx, 30, barY, CANVAS_W - 60, 16, 8);
  ctx.fillStyle = goldGradient(ctx, 0, barY, 0, barY + 16);
  ctx.fill();
  [30, CANVAS_W - 30].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, barY + 8, 15, 0, Math.PI * 2);
    ctx.fillStyle = goldGradient(ctx, x - 15, barY - 7, x + 15, barY + 23);
    ctx.fill();
  });

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  [210, CANVAS_W - 210].forEach((x) => {
    for (let y = barY + 18, i = 0; y < FRAMES.signboard.top + 10; y += 20, i++) {
      ctx.beginPath();
      if (i % 2 === 0) {
        ctx.ellipse(x, y + 10, 7, 12, 0, 0, Math.PI * 2);
      } else {
        ctx.moveTo(x, y + 2);
        ctx.lineTo(x, y + 18);
      }
      ctx.stroke();
    }
  });
};

const drawPinShadow = (ctx, H) => {
  ctx.beginPath();
  ctx.ellipse(CANVAS_W / 2, H - 24, 84, 14, 0, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = goldGradient(ctx, CANVAS_W / 2 - 84, 0, CANVAS_W / 2 + 84, 0);
  ctx.stroke();
};

const drawKeyRing = (ctx) => {
  const holeY = 180;
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(CANVAS_W / 2, holeY, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(CANVAS_W / 2, holeY, 29, 0, Math.PI * 2);
  ctx.lineWidth = 12;
  ctx.strokeStyle = goldGradient(ctx, CANVAS_W / 2 - 35, holeY - 35, CANVAS_W / 2 + 35, holeY + 35);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(CANVAS_W / 2, holeY - 75, 75, 0, Math.PI * 2);
  ctx.lineWidth = 9;
  ctx.strokeStyle = goldGradient(ctx, CANVAS_W / 2 - 75, holeY - 150, CANVAS_W / 2 + 75, holeY);
  ctx.stroke();
};

const drawLogoMedallion = (ctx, logo, cx, cy, radius) => {
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
  ctx.fillStyle = goldGradient(ctx, cx - radius, cy - radius, cx + radius, cy + radius);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = greenGradient(ctx, cx - radius, cy - radius, cx + radius, cy + radius);
  ctx.fill();

  if (logo) {
    const box = radius * 1.3;
    const scale = Math.min(box / logo.width, box / logo.height);
    const lw = logo.width * scale;
    const lh = logo.height * scale;
    ctx.drawImage(logo, cx - lw / 2, cy - lh / 2, lw, lh);
  }
};

const drawTowerSpire = (ctx) => {
  ctx.strokeStyle = goldGradient(ctx, 0, 40, 0, 130);
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(CANVAS_W / 2, 130);
  ctx.lineTo(CANVAS_W / 2, 52);
  ctx.stroke();
  ctx.fillStyle = GOLD_LIGHT;
  ctx.beginPath();
  ctx.arc(CANVAS_W / 2, 46, 7, 0, Math.PI * 2);
  ctx.fill();
};

const drawTowerWindows = (ctx) => {
  const rows = [
    { y: 148, from: 272, to: CANVAS_W - 272 },
    { y: 176, from: 272, to: CANVAS_W - 272 },
    { y: 238, from: 146, to: CANVAS_W - 146 },
    { y: 266, from: 146, to: CANVAS_W - 146 },
  ];
  rows.forEach(({ y, from, to }, r) => {
    for (let x = from, c = 0; x + 12 <= to; x += 30, c++) {
      ctx.fillStyle = (r * 3 + c) % 5 === 0 ? "rgba(229, 196, 118, 0.85)" : "rgba(229, 196, 118, 0.28)";
      ctx.fillRect(x, y, 12, 16);
    }
  });
};

const drawDoorDetails = (ctx, H) => {
  const cx = CANVAS_W / 2;
  const cy = 150;
  const r = 104;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = "rgba(229, 196, 118, 0.1)";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = goldGradient(ctx, cx - r, cy - r, cx + r, cy);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(229, 196, 118, 0.75)";
  for (let k = 1; k < 8; k++) {
    const angle = Math.PI + (k * Math.PI) / 8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, 24, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = goldGradient(ctx, cx - 24, cy - 24, cx + 24, cy);
  ctx.fill();

  roundRect(ctx, 836, 560, 22, 92, 11);
  ctx.fillStyle = goldGradient(ctx, 836, 560, 858, 652);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(847, 592, 13, 0, Math.PI * 2);
  ctx.fillStyle = GOLD_LIGHT;
  ctx.fill();

  roundRect(ctx, 0, H - 34, CANVAS_W, 26, 8);
  ctx.fillStyle = goldGradient(ctx, 0, H - 34, 0, H - 8);
  ctx.fill();
};

const drawTicketPerforation = (ctx) => {
  ctx.save();
  ctx.setLineDash([14, 10]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(229, 196, 118, 0.6)";
  ctx.beginPath();
  ctx.moveTo(56, TICKET_NOTCH_Y);
  ctx.lineTo(CANVAS_W - 56, TICKET_NOTCH_Y);
  ctx.stroke();
  ctx.restore();
};

const drawOrnateBorder = (ctx, H) => {
  const W = CANVAS_W;
  roundRect(ctx, 13, 13, W - 26, H - 26, 10);
  ctx.lineWidth = 26;
  ctx.strokeStyle = goldGradient(ctx, 0, 0, W, H);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.strokeStyle = GOLD_DARK;
  roundRect(ctx, 3, 3, W - 6, H - 6, 14);
  ctx.stroke();
  roundRect(ctx, 26, 26, W - 52, H - 52, 4);
  ctx.stroke();
  ctx.strokeStyle = "rgba(229, 196, 118, 0.6)";
  roundRect(ctx, 40, 40, W - 80, H - 80, 4);
  ctx.stroke();

  [
    [0, 0, 1, 1],
    [W, 0, -1, 1],
    [0, H, 1, -1],
    [W, H, -1, -1],
  ].forEach(([x, y, sx, sy]) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(54, 120);
    ctx.lineTo(54, 54);
    ctx.lineTo(120, 54);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(54, 54, 26, 0, Math.PI / 2);
    ctx.stroke();
    ctx.fillStyle = GOLD_LIGHT;
    ctx.beginPath();
    ctx.moveTo(54, 44);
    ctx.lineTo(64, 54);
    ctx.lineTo(54, 64);
    ctx.lineTo(44, 54);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
};

const drawRibbon = (ctx, cy) => {
  const W = CANVAS_W;
  const half = 44;
  [
    [0, 1],
    [W, -1],
  ].forEach(([x, s]) => {
    ctx.beginPath();
    ctx.moveTo(x, cy - 20);
    ctx.lineTo(x + s * 64, cy - 20);
    ctx.lineTo(x + s * 64, cy + 66);
    ctx.lineTo(x, cy + 66);
    ctx.lineTo(x + s * 20, cy + 23);
    ctx.closePath();
    ctx.fillStyle = GOLD_DARK;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + s * 26, cy + half);
    ctx.lineTo(x + s * 64, cy + half);
    ctx.lineTo(x + s * 64, cy + 66);
    ctx.closePath();
    ctx.fillStyle = "#6E5427";
    ctx.fill();
  });

  ctx.fillStyle = goldGradient(ctx, 26, 0, W - 26, 0);
  ctx.fillRect(26, cy - half, W - 52, half * 2);

  ctx.save();
  ctx.setLineDash([10, 7]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(12, 48, 39, 0.35)";
  ctx.beginPath();
  ctx.moveTo(40, cy - half + 9);
  ctx.lineTo(W - 40, cy - half + 9);
  ctx.moveTo(40, cy + half - 9);
  ctx.lineTo(W - 40, cy + half - 9);
  ctx.stroke();
  ctx.restore();
};

const drawPhoneButtons = (ctx) => {
  ctx.fillStyle = goldGradient(ctx, 0, 220, 0, 400);
  roundRect(ctx, 3, 230, 16, 70, 5);
  ctx.fill();
  roundRect(ctx, 3, 318, 16, 70, 5);
  ctx.fill();
  roundRect(ctx, CANVAS_W - 19, 270, 16, 110, 5);
  ctx.fill();
};

const drawPhoneDetails = (ctx, H) => {
  roundRect(ctx, 350, 34, 200, 38, 19);
  ctx.fillStyle = "#0A221C";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(229, 196, 118, 0.5)";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(520, 53, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#1F3D35";
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.stroke();

  roundRect(ctx, 360, H - 44, 180, 8, 4);
  ctx.fillStyle = "rgba(229, 196, 118, 0.7)";
  ctx.fill();
};

const drawPennantRod = (ctx) => {
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(70, 32);
  ctx.lineTo(CANVAS_W / 2, 6);
  ctx.lineTo(CANVAS_W - 70, 32);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(CANVAS_W / 2, 7, 6, 0, Math.PI * 2);
  ctx.fillStyle = GOLD_LIGHT;
  ctx.fill();

  roundRect(ctx, 10, 30, CANVAS_W - 20, 16, 8);
  ctx.fillStyle = goldGradient(ctx, 0, 30, 0, 46);
  ctx.fill();
  [15, CANVAS_W - 15].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, 38, 14, 0, Math.PI * 2);
    ctx.fillStyle = goldGradient(ctx, x - 14, 24, x + 14, 52);
    ctx.fill();
  });
};

const drawStampDetails = (ctx, H) => {
  const W = CANVAS_W;
  roundRect(ctx, 32, 32, W - 64, H - 64, 2);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(229, 196, 118, 0.5)";
  ctx.stroke();

  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  const punch = (x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();
  };
  const across = Math.round(W / 40);
  for (let i = 0; i <= across; i++) {
    punch((i * W) / across, 0);
    punch((i * W) / across, H);
  }
  const down = Math.round(H / 40);
  for (let i = 1; i < down; i++) {
    punch(0, (i * H) / down);
    punch(W, (i * H) / down);
  }
  ctx.restore();
};

const drawBlueprintGrid = (ctx, H) => {
  ctx.lineWidth = 1;
  for (let x = 30, i = 1; x < CANVAS_W; x += 30, i++) {
    ctx.strokeStyle = i % 5 === 0 ? "rgba(229, 196, 118, 0.16)" : "rgba(229, 196, 118, 0.07)";
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 30, i = 1; y < H; y += 30, i++) {
    ctx.strokeStyle = i % 5 === 0 ? "rgba(229, 196, 118, 0.16)" : "rgba(229, 196, 118, 0.07)";
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
    ctx.stroke();
  }
};

const drawBlueprintMarks = (ctx, H, panelY) => {
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  [
    [60, 60],
    [CANVAS_W - 60, 60],
    [60, H - 60],
    [CANVAS_W - 60, H - 60],
  ].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.moveTo(x - 18, y);
    ctx.lineTo(x + 18, y);
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x, y + 18);
    ctx.stroke();
  });

  const top = panelY;
  const bottom = panelY + PANEL_SIZE;
  const mid = (top + bottom) / 2;
  [
    [55, "PRIME LOCATION", -Math.PI / 2],
    [CANVAS_W - 55, "PREMIUM LIVING", Math.PI / 2],
  ].forEach(([x, text, rotation]) => {
    ctx.strokeStyle = "rgba(229, 196, 118, 0.7)";
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, mid - 130);
    ctx.moveTo(x, mid + 130);
    ctx.lineTo(x, bottom);
    ctx.moveTo(x - 9, top);
    ctx.lineTo(x + 9, top);
    ctx.moveTo(x - 9, bottom);
    ctx.lineTo(x + 9, bottom);
    ctx.stroke();

    ctx.fillStyle = GOLD;
    [
      [top, 1],
      [bottom, -1],
    ].forEach(([y, s]) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 6, y + s * 12);
      ctx.lineTo(x + 6, y + s * 12);
      ctx.closePath();
      ctx.fill();
    });

    ctx.save();
    ctx.translate(x, mid);
    ctx.rotate(rotation);
    ctx.font = `600 17px ${FONT_STACK}`;
    setLetterSpacing(ctx, "6px");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 0, 0);
    setLetterSpacing(ctx, "0px");
    ctx.restore();
  });
};

const drawFrameBehind = (ctx, frame, H) => {
  if (frame === "house") drawChimney(ctx);
  if (frame === "skyline") drawSkyline(ctx);
  if (frame === "signboard") drawSignChains(ctx);
  if (frame === "pin") drawPinShadow(ctx, H);
  if (frame === "tower") drawTowerSpire(ctx);
  if (frame === "phone") drawPhoneButtons(ctx);
};

const drawFrameDecor = (ctx, frame, H, logo, panelY) => {
  if (frame === "house") drawLogoMedallion(ctx, logo, CANVAS_W / 2, 168, 62);
  if (frame === "arch") drawLogoMedallion(ctx, logo, CANVAS_W / 2, 108, 46);
  if (frame === "crest") drawLogoMedallion(ctx, logo, CANVAS_W / 2, 1128, 40);
  if (frame === "keytag") drawKeyRing(ctx);
  if (frame === "tower") drawTowerWindows(ctx);
  if (frame === "door") drawDoorDetails(ctx, H);
  if (frame === "ticket") drawTicketPerforation(ctx);
  if (frame === "gem") {
    drawLogoMedallion(ctx, logo, CANVAS_W / 2, 100, 40);
    drawDivider(ctx, CANVAS_W / 2, H - 110);
  }
  if (frame === "ornate") drawOrnateBorder(ctx, H);
  if (frame === "phone") drawPhoneDetails(ctx, H);
  if (frame === "pennant") drawPennantRod(ctx);
  if (frame === "stamp") drawStampDetails(ctx, H);
  if (frame === "blueprint") drawBlueprintMarks(ctx, H, panelY);
};

const drawQrCard = (ctx, { url, style, eyeStyle, frame, label, logo }) => {
  const layout = FRAMES[frame] || FRAMES.card;
  const H = layout.height;
  if (ctx.canvas.width !== CANVAS_W) ctx.canvas.width = CANVAS_W;
  if (ctx.canvas.height !== H) ctx.canvas.height = H;
  ctx.clearRect(0, 0, CANVAS_W, H);
  ctx.lineJoin = "round";

  drawFrameBehind(ctx, frame, H);

  // Frame background with a soft gold glow at the top
  framePath(ctx, frame, H, 0);
  const bg = ctx.createLinearGradient(0, 0, CANVAS_W, H);
  bg.addColorStop(0, "#164A3C");
  bg.addColorStop(1, GREEN_DARK);
  ctx.fillStyle = bg;
  ctx.fill();

  ctx.save();
  framePath(ctx, frame, H, 0);
  ctx.clip();
  const glowY = layout.top || 0;
  const glow = ctx.createRadialGradient(CANVAS_W / 2, glowY, 0, CANVAS_W / 2, glowY, CANVAS_W * 0.8);
  glow.addColorStop(0, "rgba(229, 196, 118, 0.22)");
  glow.addColorStop(1, "rgba(229, 196, 118, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_W, H);
  if (frame === "blueprint") drawBlueprintGrid(ctx, H);

  // Inset border for any outline: a wide gold stroke clipped to the shape, then
  // re-covered by a narrower background stroke, leaves a 4px line 20px inside.
  if (!layout.border) {
    framePath(ctx, frame, H, 0);
    ctx.lineWidth = 44;
    ctx.strokeStyle = goldGradient(ctx, 0, 0, CANVAS_W, H);
    ctx.stroke();
    ctx.lineWidth = 36;
    ctx.strokeStyle = bg;
    ctx.stroke();
    ctx.strokeStyle = glow;
    ctx.stroke();
  }
  ctx.restore();

  if (layout.border === "hand") {
    framePath(ctx, frame, H, 20);
    ctx.lineWidth = 4;
    ctx.strokeStyle = goldGradient(ctx, 0, 0, CANVAS_W, H);
    ctx.stroke();
  }

  drawFrameDecor(ctx, frame, H, logo, layout.panelY);

  // Header
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 30px ${FONT_STACK}`;
  setLetterSpacing(ctx, "10px");
  ctx.fillStyle = goldGradient(ctx, CANVAS_W * 0.2, 0, CANVAS_W * 0.8, 0);
  ctx.fillText("ISLAMABAD PRIME BUILDERS", CANVAS_W / 2, layout.headerY);
  setLetterSpacing(ctx, "0px");
  drawDivider(ctx, CANVAS_W / 2, layout.dividerY);

  // White QR panel
  const panelY = layout.panelY;
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  roundRect(ctx, PANEL_X, panelY, PANEL_SIZE, PANEL_SIZE, 44);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();

  // QR modules — high error correction keeps the code readable under the centre logo.
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const count = qr.modules.size;
  const area = PANEL_SIZE - QR_PADDING * 2;
  const cell = area / count;
  const ox = PANEL_X + QR_PADDING;
  const oy = panelY + QR_PADDING;
  const cx = ox + area / 2;
  const cy = oy + area / 2;
  const badge = area * LOGO_RATIO;
  const clearZone = badge / 2 + cell * 1.2;

  const inLogoZone = (row, col) =>
    Math.abs(ox + col * cell + cell / 2 - cx) < clearZone && Math.abs(oy + row * cell + cell / 2 - cy) < clearZone;
  const alignments = getAlignmentCenters(qr.version).filter(([row, col]) => !inLogoZone(row, col));
  const inAlignment = (row, col) => alignments.some(([ar, ac]) => Math.abs(row - ar) <= 2 && Math.abs(col - ac) <= 2);
  const isDark = (row, col) =>
    row >= 0 &&
    col >= 0 &&
    row < count &&
    col < count &&
    !!qr.modules.get(row, col) &&
    !isFinderModule(row, col, count) &&
    !inLogoZone(row, col) &&
    !inAlignment(row, col);

  const moduleFill = greenGradient(ctx, ox, oy, ox + area, oy + area);
  alignments.forEach(([row, col]) => {
    drawAlignment(ctx, ox + (col - 2) * cell, oy + (row - 2) * cell, cell, eyeStyle, moduleFill);
  });

  ctx.fillStyle = moduleFill;
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!isDark(row, col)) continue;
      drawModule(ctx, ox + col * cell, oy + row * cell, cell, style, {
        top: isDark(row - 1, col),
        right: isDark(row, col + 1),
        bottom: isDark(row + 1, col),
        left: isDark(row, col - 1),
      });
    }
  }

  drawEye(ctx, ox, oy, cell, eyeStyle, "tl");
  drawEye(ctx, ox + (count - 7) * cell, oy, cell, eyeStyle, "tr");
  drawEye(ctx, ox, oy + (count - 7) * cell, cell, eyeStyle, "bl");

  // Logo badge with gold ring
  const bx = cx - badge / 2;
  const by = cy - badge / 2;
  roundRect(ctx, bx - 7, by - 7, badge + 14, badge + 14, badge * 0.28);
  ctx.fillStyle = goldGradient(ctx, bx, by, bx + badge, by + badge);
  ctx.fill();
  roundRect(ctx, bx, by, badge, badge, badge * 0.24);
  ctx.fillStyle = greenGradient(ctx, bx, by, bx + badge, by + badge);
  ctx.fill();

  if (logo) {
    const pad = badge * 0.13;
    const scale = Math.min((badge - pad * 2) / logo.width, (badge - pad * 2) / logo.height);
    const lw = logo.width * scale;
    const lh = logo.height * scale;
    ctx.drawImage(logo, cx - lw / 2, cy - lh / 2, lw, lh);
  }

  // Caption
  const captionY = layout.captionY ?? panelY + PANEL_SIZE + 82;
  const hostY = layout.hostY ?? captionY + 52;
  if (frame === "ribbon") drawRibbon(ctx, captionY);
  if (label.trim()) {
    ctx.font = `800 40px ${FONT_STACK}`;
    setLetterSpacing(ctx, "12px");
    ctx.fillStyle = frame === "ribbon" ? GREEN_DARK : goldGradient(ctx, CANVAS_W * 0.25, 0, CANVAS_W * 0.75, 0);
    ctx.fillText(fitText(ctx, label.trim().toUpperCase(), CANVAS_W - 200), CANVAS_W / 2, captionY);
    setLetterSpacing(ctx, "0px");
  }

  ctx.font = `500 26px ${FONT_STACK}`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  ctx.fillText(fitText(ctx, getHost(url), CANVAS_W - 200), CANVAS_W / 2, hostY);
};

const leafPath = (x, y, w, h, r) =>
  `M${x + r} ${y} H${x + w} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;

const PATTERN_CELLS = [
  [0, 0],
  [1, 0],
  [1, 1],
  [2, 1],
  [0, 2],
  [2, 2],
];

const PatternIcon = ({ id }) => {
  let shapes;
  if (id === "towers") {
    shapes = (
      <>
        <rect x="1.5" y="9" width="7" height="20" rx="3.5" />
        <rect x="11.5" y="1" width="7" height="28" rx="3.5" />
        <rect x="21.5" y="13" width="7" height="16" rx="3.5" />
      </>
    );
  } else if (id === "fluid") {
    shapes = (
      <>
        <rect x="0.5" y="0.5" width="19" height="9" rx="4.5" />
        <rect x="10.5" y="0.5" width="9" height="19" rx="4.5" />
        <rect x="10.5" y="10.5" width="19" height="9" rx="4.5" />
        <circle cx="5" cy="25" r="4.5" />
        <circle cx="25" cy="25" r="4.5" />
      </>
    );
  } else {
    shapes = PATTERN_CELLS.map(([c, r]) => {
      const x = c * 10;
      const y = r * 10;
      const key = `${c}-${r}`;
      if (id === "dots") return <circle key={key} cx={x + 5} cy={y + 5} r="4" />;
      if (id === "rounded") return <rect key={key} x={x + 1} y={y + 1} width="8" height="8" rx="2.5" />;
      if (id === "diamond")
        return <polygon key={key} points={`${x + 5},${y - 0.5} ${x + 10.5},${y + 5} ${x + 5},${y + 10.5} ${x - 0.5},${y + 5}`} />;
      if (id === "leaf") return <path key={key} d={leafPath(x + 1, y + 1, 8, 8, 4)} />;
      return <rect key={key} x={x + 0.5} y={y + 0.5} width="9" height="9" />;
    });
  }
  return (
    <svg viewBox="-1 -1 32 32" className="h-7 w-7" fill="currentColor">
      {shapes}
    </svg>
  );
};

const EyeIcon = ({ id }) => {
  const ring = { fill: "none", stroke: "currentColor", strokeWidth: 3 };
  let outer;
  let inner;
  if (id === "circle") {
    outer = <circle cx="12" cy="12" r="10" {...ring} />;
    inner = <circle cx="12" cy="12" r="4.5" />;
  } else if (id === "leaf") {
    outer = <path d={leafPath(2, 2, 20, 20, 8)} {...ring} />;
    inner = <path d={leafPath(7.5, 7.5, 9, 9, 3.5)} />;
  } else {
    const square = id === "square";
    outer = <rect x="2" y="2" width="20" height="20" rx={square ? 1.5 : 6} {...ring} />;
    inner = <rect x="7.5" y="7.5" width="9" height="9" rx={square ? 1 : 3} />;
  }
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      {outer}
      {inner}
    </svg>
  );
};

const FRAME_ICON_QR = {
  card: [11, 14, 18, 18],
  keytag: [11, 21, 18, 16],
  signboard: [11, 19, 18, 17],
  pin: [11, 9, 18, 18],
  crest: [11, 9, 18, 17],
  tower: [11, 26, 18, 16],
  door: [11, 16, 18, 17],
  ticket: [11, 9, 18, 18],
  gem: [11, 16, 18, 17],
  ornate: [11, 13, 18, 18],
  ribbon: [11, 9, 18, 18],
  phone: [11, 12, 18, 18],
  pennant: [11, 11, 18, 17],
  stamp: [11, 13, 18, 18],
  blueprint: [11, 14, 18, 18],
};

const ICON_HIGHLIGHT = { fill: "#FFFFFF", fillOpacity: 0.9 };

const STAMP_HOLES = [
  ...Array.from({ length: 9 }, (_, i) => [4 + i * 4, 4]),
  ...Array.from({ length: 9 }, (_, i) => [4 + i * 4, 44]),
  ...Array.from({ length: 9 }, (_, i) => [4, 8 + i * 4]),
  ...Array.from({ length: 9 }, (_, i) => [36, 8 + i * 4]),
];

const FrameIcon = ({ id }) => {
  const [qx, qy, qw, qh] = FRAME_ICON_QR[id] || [11, 22, 18, 16];
  let body;
  if (id === "tower") {
    body = (
      <>
        <path d="M4 45 V22 H9 V15 H14 V9 H26 V15 H31 V22 H36 V45 Z" />
        <rect x="19.2" y="2" width="1.6" height="8" />
      </>
    );
  } else if (id === "door") {
    body = (
      <>
        <rect x="6" y="3" width="28" height="40" rx="3" />
        <rect x="3" y="43" width="34" height="3" rx="1" />
        <path d="M14 13 A6 6 0 0 1 26 13 Z" {...ICON_HIGHLIGHT} />
        <circle cx="31.5" cy="30" r="1.3" {...ICON_HIGHLIGHT} />
      </>
    );
  } else if (id === "ticket") {
    body = (
      <path d="M8 3 H32 Q36 3 36 7 V32 A3.5 3.5 0 0 0 36 39 V41 Q36 45 32 45 H8 Q4 45 4 41 V39 A3.5 3.5 0 0 0 4 32 V7 Q4 3 8 3 Z" />
    );
  } else if (id === "gem") {
    body = <polygon points="20,2 37,9 37,39 20,46 3,39 3,9" />;
  } else if (id === "ornate") {
    body = (
      <>
        <rect x="4" y="4" width="32" height="40" rx="2" />
        <rect x="7.5" y="7.5" width="25" height="33" fill="none" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1" />
      </>
    );
  } else if (id === "ribbon") {
    body = (
      <>
        <rect x="7" y="3" width="26" height="42" rx="5" />
        <rect x="2" y="32" width="36" height="7" rx="1" fill="#FFFFFF" fillOpacity="0.55" />
      </>
    );
  } else if (id === "phone") {
    body = (
      <>
        <rect x="6" y="2" width="28" height="44" rx="6" />
        <rect x="16" y="4.5" width="8" height="2.2" rx="1.1" {...ICON_HIGHLIGHT} />
        <rect x="15" y="41.5" width="10" height="1.3" rx="0.6" {...ICON_HIGHLIGHT} />
      </>
    );
  } else if (id === "pennant") {
    body = (
      <>
        <path d="M5 5 H35 V46 L20 39 L5 46 Z" />
        <rect x="2" y="3" width="36" height="2.6" rx="1.3" />
      </>
    );
  } else if (id === "stamp") {
    body = (
      <>
        <mask id="qr-stamp-icon-mask">
          <rect x="0" y="0" width="40" height="48" fill="#FFFFFF" />
          {STAMP_HOLES.map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.5" fill="#000000" />
          ))}
        </mask>
        <rect x="4" y="4" width="32" height="40" mask="url(#qr-stamp-icon-mask)" />
      </>
    );
  } else if (id === "blueprint") {
    body = (
      <>
        <rect x="4" y="4" width="32" height="40" rx="3" />
        <path
          d="M12 4 V44 M20 4 V44 M28 4 V44 M4 12 H36 M4 20 H36 M4 28 H36 M4 36 H36"
          stroke="#FFFFFF"
          strokeOpacity="0.35"
          strokeWidth="0.6"
        />
      </>
    );
  } else if (id === "keytag") {
    body = (
      <>
        <path d="M14 6 H26 L36 15 V42 Q36 45 33 45 H7 Q4 45 4 42 V15 Z" />
        <circle cx="20" cy="11.5" r="2.5" fill="#FFFFFF" fillOpacity="0.9" />
        <circle cx="20" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </>
    );
  } else if (id === "signboard") {
    body = (
      <>
        <rect x="2" y="2" width="36" height="3" rx="1.5" />
        <rect x="10" y="4" width="1.6" height="9" />
        <rect x="28.4" y="4" width="1.6" height="9" />
        <rect x="4" y="12" width="32" height="33" rx="4" />
      </>
    );
  } else if (id === "pin") {
    body = <path d="M10 3 H30 Q36 3 36 9 V31 Q36 36 30 36 H25 L20 45 L15 36 H10 Q4 36 4 31 V9 Q4 3 10 3 Z" />;
  } else if (id === "crest") {
    body = <path d="M8 3 H32 Q36 3 36 7 V28 C36 36 28 42 20 46 C12 42 4 36 4 28 V7 Q4 3 8 3 Z" />;
  } else if (id === "house") {
    body = <path d="M20 3 L37 17 H33 V44 H7 V17 H3 Z" />;
  } else if (id === "skyline") {
    body = (
      <>
        <rect x="8" y="9" width="5" height="10" />
        <rect x="17.5" y="3" width="5" height="16" />
        <rect x="27" y="10" width="5" height="9" />
        <rect x="4" y="16" width="32" height="29" rx="5" />
      </>
    );
  } else if (id === "arch") {
    body = <path d="M4 18 A16 14 0 0 1 36 18 V40 Q36 44 32 44 H8 Q4 44 4 40 Z" />;
  } else {
    body = <rect x="4" y="4" width="32" height="40" rx="6" />;
  }
  return (
    <svg viewBox="0 0 40 48" className="h-10 w-9" fill="currentColor">
      {body}
      <rect x={qx} y={qy} width={qw} height={qh} rx="2" fill="#FFFFFF" fillOpacity="0.9" />
    </svg>
  );
};

const OptionTile = ({ active, onClick, label, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3.5 text-[11px] font-bold transition-all ${
      active
        ? "border-[#C6A15B] bg-[#123D32] text-[#E5C476] shadow-[0_8px_20px_rgba(18,61,50,0.25)]"
        : "border-[#123D32]/15 bg-white text-[#123D32]/70 hover:border-[#C6A15B]/60 hover:bg-[#C6A15B]/5"
    }`}
  >
    {children}
    {label}
  </button>
);

const SectionLabel = ({ children }) => (
  <label className="block text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#123D32]/65">{children}</label>
);

export default function QrCodePage() {
  const canvasRef = useRef(null);
  const logoRef = useRef(null);
  const [link, setLink] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [label, setLabel] = useState("Scan to Visit");
  const [style, setStyle] = useState("dots");
  const [eyeStyle, setEyeStyle] = useState("rounded");
  const [frame, setFrame] = useState("card");

  useEffect(() => {
    const timer = setTimeout(() => {
      const url = normalizeUrl(link);
      setQrUrl(isValidUrl(url) ? url : "");
    }, 300);
    return () => clearTimeout(timer);
  }, [link]);

  useEffect(() => {
    if (!qrUrl || !canvasRef.current) return;
    let cancelled = false;

    const render = async () => {
      try {
        if (!logoRef.current) logoRef.current = await loadImage("/images/logo.png");
        if (cancelled || !canvasRef.current) return;
        drawQrCard(canvasRef.current.getContext("2d"), {
          url: qrUrl,
          style,
          eyeStyle,
          frame,
          label,
          logo: logoRef.current,
        });
      } catch {
        if (!cancelled) toast.error("Failed to generate QR code");
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [qrUrl, style, eyeStyle, frame, label]);

  const handleDownload = () => {
    if (!qrUrl || !canvasRef.current) return;
    const anchor = document.createElement("a");
    anchor.href = canvasRef.current.toDataURL("image/png");
    anchor.download = `${getHost(qrUrl) || "islamabad-prime-builders"}-qr.png`;
    anchor.click();
    toast.success("QR code downloaded");
  };

  const showInvalid = link.trim() !== "" && !qrUrl;
  const frameHeight = FRAMES[frame].height;

  return (
    <div className="container mx-auto mt-8 px-4 pb-10">
      <div className="rounded-[26px] border border-[#C6A15B]/25 bg-white shadow-[0_12px_35px_rgba(18,61,50,0.08)]">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-[26px] bg-gradient-to-br from-[#164A3C] to-[#0C3027] px-6 py-7 sm:px-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E5C476]/15 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E5C476] via-[#C6A15B] to-[#9C7A3C] text-[#123D32] shadow-lg">
              <QrCode size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                QR Code <span className="text-[#E5C476]">Studio</span>
              </h1>
              <p className="mt-0.5 text-xs font-medium text-white/60">
                Create a branded QR code that opens your link when scanned.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 px-6 py-10 sm:px-10 lg:grid-cols-2">
          {/* Controls */}
          <div className="space-y-7">
            <div className="space-y-2">
              <SectionLabel>Website Link</SectionLabel>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C6A15B]" />
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://islamabadprimebuilders.com"
                  className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm text-[#123D32] outline-none transition-all placeholder:text-[#71829D]/60 focus:ring-4 focus:ring-[#C6A15B]/15 ${
                    showInvalid ? "border-rose-300 focus:border-rose-400" : "border-[#123D32]/15 focus:border-[#C6A15B]"
                  }`}
                />
              </div>
              {showInvalid ? (
                <p className="text-xs font-medium text-rose-500">Enter a valid website link.</p>
              ) : qrUrl ? (
                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-1.5 truncate text-xs font-semibold text-[#1F6B4F] hover:underline"
                >
                  <span className="truncate">{qrUrl}</span>
                  <ExternalLink size={12} className="shrink-0" />
                </a>
              ) : null}
            </div>

            <div className="space-y-2">
              <SectionLabel>Caption</SectionLabel>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C6A15B]" />
                <input
                  type="text"
                  value={label}
                  maxLength={24}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Scan to Visit"
                  className="w-full rounded-xl border border-[#123D32]/15 bg-white py-3.5 pl-11 pr-4 text-sm text-[#123D32] outline-none transition-all placeholder:text-[#71829D]/60 focus:border-[#C6A15B] focus:ring-4 focus:ring-[#C6A15B]/15"
                />
              </div>
            </div>

            <div className="space-y-2">
              <SectionLabel>Frame Design</SectionLabel>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {Object.entries(FRAMES).map(([id, option]) => (
                  <OptionTile key={id} active={frame === id} onClick={() => setFrame(id)} label={option.label}>
                    <FrameIcon id={id} />
                  </OptionTile>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <SectionLabel>Pattern Style</SectionLabel>
              <div className="grid grid-cols-4 gap-3">
                {MODULE_STYLES.map((option) => (
                  <OptionTile
                    key={option.id}
                    active={style === option.id}
                    onClick={() => setStyle(option.id)}
                    label={option.label}
                  >
                    <PatternIcon id={option.id} />
                  </OptionTile>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <SectionLabel>Corner Style</SectionLabel>
              <div className="grid grid-cols-4 gap-3">
                {EYE_STYLES.map((option) => (
                  <OptionTile
                    key={option.id}
                    active={eyeStyle === option.id}
                    onClick={() => setEyeStyle(option.id)}
                    label={option.label}
                  >
                    <EyeIcon id={option.id} />
                  </OptionTile>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!qrUrl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E5C476] via-[#C6A15B] to-[#9C7A3C] px-7 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#123D32] shadow-[0_10px_24px_rgba(198,161,91,0.35)] transition-all hover:-translate-y-[1px] hover:shadow-[0_14px_30px_rgba(198,161,91,0.45)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              <Download size={15} />
              Download QR Code
            </button>

            <p className="flex items-start gap-2 text-xs text-[#71829D]">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-[#C6A15B]" />
              Test the code with your phone camera before printing or sharing it.
            </p>
          </div>

          {/* Preview — sticky so it stays in view while scrolling the options */}
          <div className="relative flex items-center justify-center overflow-hidden rounded-[28px] border border-[#C6A15B]/20 bg-gradient-to-br from-[#FBF7EE] via-white to-[#F3EEE2] p-8 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C6A15B]/20 blur-3xl" />
            {qrUrl ? (
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={frameHeight}
                className="relative w-full max-w-[340px] drop-shadow-[0_20px_35px_rgba(18,61,50,0.35)]"
              />
            ) : (
              <div
                style={{ aspectRatio: `${CANVAS_W} / ${frameHeight}` }}
                className="relative flex w-full max-w-[340px] flex-col items-center justify-center gap-4 rounded-[28px] border-2 border-dashed border-[#C6A15B]/40 bg-white/70 px-8 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#123D32] text-[#E5C476]">
                  <QrCode size={32} />
                </div>
                <p className="text-sm font-semibold text-[#123D32]">Your QR code preview</p>
                <p className="text-xs text-[#71829D]">Enter a website link to generate your branded QR code.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
