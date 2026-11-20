// Neon Palm Cover Studio — canvas cover engine.
// Draws a multi-panel GTA-style poster cover from user photos: panel layouts,
// sunset/neon gradient-map grades, bold poster lettering, seal, heat-meter
// stars, billing block, grain, vignette and halftone. Everything is drawn on
// a 2D canvas so the exported PNG carries the full artwork.

export const COVER_SIZES = [
  { id: 'square', label: '1080 x 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: '1080 x 1350', w: 1080, h: 1350 },
  { id: 'landscape', label: '1920 x 1080', w: 1920, h: 1080 },
  { id: 'story', label: '1080 x 1920', w: 1080, h: 1920 },
];

export const LAYOUTS = [
  { id: 'nine', label: 'Nine-panel grid', panels: 9 },
  { id: 'four', label: 'Four-panel grid', panels: 4 },
  { id: 'hero', label: 'Hero and three', panels: 4 },
  { id: 'full', label: 'Full-bleed single', panels: 1 },
  { id: 'tilted', label: 'Tilted snapshots', panels: 4 },
  { id: 'strips', label: 'Strip collage', panels: 5 },
];

export const GRADES = [
  {
    id: 'vice', label: 'Vice Sunset',
    filter: 'saturate(1.55) contrast(1.16) brightness(1.03)',
    ramp: [[0, 43, 10, 74], [0.42, 176, 32, 120], [0.72, 255, 110, 64], [1, 255, 243, 214]],
    strength: 0.52,
    sky: ['#1b0636', '#7b1e7a', '#ff2e88', '#ff9a3d', '#ffd23f'],
    title: ['#ffffff', '#ffd23f', '#ff2e88'],
    neon: '#7df9ff',
  },
  {
    id: 'neon', label: 'Neon Night',
    filter: 'saturate(1.65) contrast(1.28) brightness(0.96)',
    ramp: [[0, 5, 10, 46], [0.45, 0, 150, 190], [0.75, 255, 46, 166], [1, 255, 255, 255]],
    strength: 0.58,
    sky: ['#02041f', '#0b1e5e', '#7b1e7a', '#ff2ea6', '#00e5ff'],
    title: ['#ffffff', '#7df9ff', '#ff2ea6'],
    neon: '#ff5ec4',
  },
  {
    id: 'gold', label: 'Twilight Gold',
    filter: 'saturate(1.35) contrast(1.12) brightness(1.02)',
    ramp: [[0, 26, 15, 46], [0.45, 179, 71, 0], [0.78, 255, 179, 71], [1, 255, 233, 176]],
    strength: 0.5,
    sky: ['#14092b', '#4a1a5e', '#b34700', '#ff9a3d', '#ffe9b0'],
    title: ['#ffffff', '#ffe9b0', '#ff9a3d'],
    neon: '#ffd23f',
  },
  {
    id: 'teal', label: 'Teal Heat',
    filter: 'saturate(1.45) contrast(1.18) hue-rotate(-8deg)',
    ramp: [[0, 4, 34, 43], [0.45, 10, 166, 166], [0.78, 255, 122, 89], [1, 255, 241, 214]],
    strength: 0.54,
    sky: ['#02141c', '#064e5e', '#0aa6a6', '#ff7a59', '#ffd23f'],
    title: ['#ffffff', '#a7fff2', '#ff7a59'],
    neon: '#ff9a3d',
  },
  {
    id: 'mono', label: 'Mono Ink',
    filter: 'grayscale(1) contrast(1.32) brightness(1.02)',
    ramp: [[0, 10, 10, 18], [0.5, 90, 90, 110], [0.82, 216, 216, 226], [1, 255, 255, 255]],
    strength: 0.85,
    sky: ['#0a0a12', '#2a2a3a', '#5a5a6e', '#b8b8c8', '#ffffff'],
    title: ['#ffffff', '#d8d8e2', '#8a8aa0'],
    neon: '#ffffff',
  },
];

const TITLE_FONT = '"Arial Narrow Bold", Impact, "Arial Black", "Franklin Gothic Heavy", sans-serif';
const SCRIPT_FONT = '"Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive';
const CAPS_FONT = '"Arial Narrow", "Franklin Gothic Medium", Arial, sans-serif';

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

export function sizeById(id) {
  return COVER_SIZES.find((s) => s.id === id) || COVER_SIZES[0];
}

export function makePanel(photo, callout) {
  return { photo: photo || 0, x: 0.5, y: 0.5, zoom: 1, rot: 0, callout: callout || '' };
}

export function createCoverState() {
  const callouts = ['BOULEVARD', 'PIER PRESSURE', 'GOLDEN HOUR', 'NIGHT SHIFT', 'PALM LINE', 'LAST LIGHT', 'LOW RIDER', 'SALT AIR', 'HOME STRETCH'];
  const panels = [];
  for (let i = 0; i < 9; i++) {
    const p = makePanel(i % 2, callouts[i]);
    p.zoom = 1 + (i % 3) * 0.12;
    p.x = 0.35 + (i % 3) * 0.15;
    p.y = 0.18 + (i % 2) * 0.14;
    panels.push(p);
  }
  return {
    layout: 'nine',
    grade: 'vice',
    size: 'landscape',
    title: 'NEON PALM',
    subtitle: 'Vice nights forever',
    tagline: 'ONE CITY - NO BRAKES - ALL SUNSET',
    billing: 'A PALM COAST POSTER - SHOT ON YOUR PHONE - PRINTED IN NEON - EST. 2026',
    stars: 5,
    seal: true,
    grain: true,
    vignette: true,
    halftone: true,
    panels,
  };
}

// Panel rectangles for a layout at cover size W x H, plus the title block.
export function layoutPanels(layoutId, W, H) {
  const m = Math.round(W * 0.028);
  const g = Math.round(W * 0.012);
  const panels = [];
  let title = { x: m, y: H * 0.68, w: W - m * 2, h: H * 0.29, align: 'center' };

  if (layoutId === 'nine') {
    const cw = (W - m * 2 - g * 2) / 3;
    const ch = (H - m * 2 - g * 2) / 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        panels.push({ x: m + c * (cw + g), y: m + r * (ch + g), w: cw, h: ch, rot: 0 });
      }
    }
    title = { x: m, y: H * 0.665, w: W - m * 2, h: H * 0.31, align: 'center' };
  } else if (layoutId === 'four') {
    const cw = (W - m * 2 - g) / 2;
    const ch = (H - m * 2 - g) / 2;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        panels.push({ x: m + c * (cw + g), y: m + r * (ch + g), w: cw, h: ch, rot: 0 });
      }
    }
    title = { x: m, y: H * 0.665, w: W - m * 2, h: H * 0.31, align: 'center' };
  } else if (layoutId === 'hero') {
    if (W >= H) {
      const heroW = (W - m * 2 - g) * 0.62;
      const sideW = W - m * 2 - g - heroW;
      const sideH = (H - m * 2 - g * 2) / 3;
      panels.push({ x: m, y: m, w: heroW, h: H - m * 2, rot: 0 });
      for (let i = 0; i < 3; i++) {
        panels.push({ x: m + heroW + g, y: m + i * (sideH + g), w: sideW, h: sideH, rot: 0 });
      }
      title = { x: m, y: H * 0.6, w: heroW, h: H * 0.37, align: 'left' };
    } else {
      const heroH = (H - m * 2 - g) * 0.56;
      const rowH = H - m * 2 - g - heroH;
      const cw = (W - m * 2 - g * 2) / 3;
      panels.push({ x: m, y: m, w: W - m * 2, h: heroH, rot: 0 });
      for (let i = 0; i < 3; i++) {
        panels.push({ x: m + i * (cw + g), y: m + heroH + g, w: cw, h: rowH, rot: 0 });
      }
      title = { x: m, y: H * 0.34, w: W - m * 2, h: H * 0.2, align: 'center' };
    }
  } else if (layoutId === 'full') {
    panels.push({ x: 0, y: 0, w: W, h: H, rot: 0 });
    title = { x: m, y: H * 0.62, w: W - m * 2, h: H * 0.35, align: 'center' };
  } else if (layoutId === 'tilted') {
    const pw = W * 0.42;
    const ph = H * 0.52;
    panels.push({ x: W * 0.04, y: H * 0.3, w: pw, h: ph, rot: -6 });
    panels.push({ x: W * 0.38, y: H * 0.36, w: pw, h: ph, rot: 3 });
    panels.push({ x: W * 0.58, y: H * 0.24, w: pw * 0.92, h: ph * 0.92, rot: -2 });
    panels.push({ x: W * 0.2, y: H * 0.52, w: pw * 0.85, h: ph * 0.85, rot: 5 });
    title = { x: m, y: H * 0.03, w: W - m * 2, h: H * 0.24, align: 'center' };
  } else {
    // strips: five bands across the long axis
    if (W >= H) {
      const cw = (W - m * 2 - g * 4) / 5;
      for (let i = 0; i < 5; i++) {
        panels.push({ x: m + i * (cw + g), y: m, w: cw, h: H - m * 2, rot: 0 });
      }
    } else {
      const ch = (H - m * 2 - g * 4) / 5;
      for (let i = 0; i < 5; i++) {
        panels.push({ x: m, y: m + i * (ch + g), w: W - m * 2, h: ch, rot: 0 });
      }
    }
    title = { x: m, y: H * 0.665, w: W - m * 2, h: H * 0.31, align: 'center' };
  }
  return { panels, title };
}

function rampColor(ramp, t) {
  if (t <= ramp[0][0]) return [ramp[0][1], ramp[0][2], ramp[0][3]];
  for (let i = 1; i < ramp.length; i++) {
    if (t <= ramp[i][0]) {
      const a = ramp[i - 1];
      const b = ramp[i];
      const f = (t - a[0]) / Math.max(0.0001, b[0] - a[0]);
      return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f, a[3] + (b[3] - a[3]) * f];
    }
  }
  const last = ramp[ramp.length - 1];
  return [last[1], last[2], last[3]];
}

export function applyGradeToImageData(imageData, grade) {
  const d = imageData.data;
  const s = grade.strength;
  for (let i = 0; i < d.length; i += 4) {
    const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
    const c = rampColor(grade.ramp, lum);
    d[i] = d[i] * (1 - s) + c[0] * s;
    d[i + 1] = d[i + 1] * (1 - s) + c[1] * s;
    d[i + 2] = d[i + 2] * (1 - s) + c[2] * s;
  }
  return imageData;
}

function drawPhotoCoverFit(ctx, img, panel, rect) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(rect.w / iw, rect.h / ih) * (panel.zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = rect.x + (rect.w - dw) * (panel.x == null ? 0.5 : panel.x);
  const dy = rect.y + (rect.h - dh) * (panel.y == null ? 0.5 : panel.y);
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPanelPhoto(ctx, photo, panel, rect, grade, snapshot) {
  const off = document.createElement('canvas');
  off.width = Math.max(2, Math.round(rect.w));
  off.height = Math.max(2, Math.round(rect.h));
  const octx = off.getContext('2d');
  octx.filter = grade.filter;
  drawPhotoCoverFit(octx, photo.img, panel, { x: 0, y: 0, w: off.width, h: off.height });
  octx.filter = 'none';
  try {
    const data = octx.getImageData(0, 0, off.width, off.height);
    applyGradeToImageData(data, grade);
    octx.putImageData(data, 0, 0);
  } catch (err) {
    // A tainted or oversized panel keeps the filtered photo; the wash below still grades it.
  }
  const wash = octx.createLinearGradient(0, 0, 0, off.height);
  wash.addColorStop(0, 'rgba(255,46,136,0.10)');
  wash.addColorStop(0.55, 'rgba(0,0,0,0)');
  wash.addColorStop(1, 'rgba(10,0,40,0.22)');
  octx.globalCompositeOperation = 'overlay';
  octx.fillStyle = wash;
  octx.fillRect(0, 0, off.width, off.height);
  octx.globalCompositeOperation = 'source-over';

  ctx.save();
  if (snapshot) {
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = rect.w * 0.06;
    ctx.shadowOffsetY = rect.h * 0.03;
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(rect.x - rect.w * 0.045, rect.y - rect.h * 0.045, rect.w * 1.09, rect.h * 1.16);
    ctx.shadowColor = 'transparent';
  }
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(off, rect.x, rect.y, rect.w, rect.h);
  ctx.restore();

  // Ink border: thick dark keyline with a thin light inner line.
  ctx.save();
  ctx.strokeStyle = '#12041f';
  ctx.lineWidth = Math.max(3, rect.w * 0.012);
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.5;
  const inset = Math.max(3, rect.w * 0.012);
  ctx.strokeRect(rect.x + inset, rect.y + inset, rect.w - inset * 2, rect.h - inset * 2);
  ctx.restore();
}

function drawCallout(ctx, text, rect) {
  if (!text) return;
  const size = Math.max(11, Math.min(30, rect.w * 0.052));
  ctx.save();
  ctx.font = '700 ' + size + 'px ' + CAPS_FONT;
  const label = String(text).toUpperCase();
  const tw = ctx.measureText(label).width;
  const padX = size * 0.55;
  const bw = tw + padX * 2;
  const bh = size * 1.55;
  const bx = rect.x + rect.w * 0.035;
  const by = rect.y + rect.h - bh - rect.h * 0.04;
  ctx.fillStyle = 'rgba(10,2,24,0.82)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, bh * 0.28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,63,0.9)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + padX, by + bh / 2 + 1);
  ctx.restore();
}

function drawBackground(ctx, W, H, grade) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  grade.sky.forEach((c, i) => sky.addColorStop(i / (grade.sky.length - 1), c));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // Low sun disc with banded rings, the poster skyline glow.
  const sx = W * 0.5;
  const sy = H * 0.42;
  const sr = Math.min(W, H) * 0.34;
  const sun = ctx.createRadialGradient(sx, sy, sr * 0.1, sx, sy, sr);
  sun.addColorStop(0, 'rgba(255,240,190,0.95)');
  sun.addColorStop(0.55, 'rgba(255,154,61,0.55)');
  sun.addColorStop(1, 'rgba(255,46,136,0)');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 2;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr * (0.55 + i * 0.16), Math.PI * 0.08, Math.PI * 0.92);
    ctx.stroke();
  }
  // Diagonal speed lines in the corners.
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = Math.max(2, W * 0.002);
  for (let i = 0; i < 5; i++) {
    const off = i * W * 0.03;
    ctx.beginPath();
    ctx.moveTo(W * 0.62 + off, 0);
    ctx.lineTo(W * 0.42 + off, H * 0.3);
    ctx.stroke();
  }
}

function fitFontSize(ctx, text, maxWidth, startSize, fontFamily, weight) {
  let size = startSize;
  ctx.font = weight + ' ' + size + 'px ' + fontFamily;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= Math.max(2, size * 0.05);
    ctx.font = weight + ' ' + size + 'px ' + fontFamily;
  }
  return size;
}

function drawStar(ctx, cx, cy, r, filled) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = '#ffd23f';
    ctx.fill();
    ctx.strokeStyle = '#12041f';
    ctx.lineWidth = r * 0.12;
    ctx.stroke();
  } else {
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = r * 0.1;
    ctx.stroke();
  }
}

function drawHeatStars(ctx, count, x, y, r, alignRight) {
  const gap = r * 2.35;
  let startX = x;
  if (alignRight) startX = x - gap * 4;
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, startX + i * gap, y, r, i < count);
  }
}

function drawSeal(ctx, W, H, grade) {
  const r = Math.min(W, H) * 0.085;
  const cx = W - r * 1.5;
  const cy = r * 1.5;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.22);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10,2,24,0.78)';
  ctx.fill();
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = r * 0.07;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.strokeStyle = grade.neon;
  ctx.lineWidth = r * 0.045;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 ' + r * 0.34 + 'px ' + TITLE_FONT;
  ctx.fillText('PALM', 0, -r * 0.28);
  ctx.fillText('COAST', 0, r * 0.08);
  ctx.font = '700 ' + r * 0.2 + 'px ' + CAPS_FONT;
  ctx.fillStyle = '#ffd23f';
  ctx.fillText('EST. 2026', 0, r * 0.42);
  ctx.restore();
}

function drawHalftoneBand(ctx, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const step = Math.max(10, w * 0.016);
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  for (let ry = y + step * 0.5; ry < y + h; ry += step) {
    const fade = 1 - (ry - y) / h;
    const rr = step * 0.16 * (0.4 + fade * 0.6);
    for (let rx = x + step * 0.5; rx < x + w; rx += step) {
      ctx.beginPath();
      ctx.arc(rx, ry, rr, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawLettering(ctx, state, grade, titleBlock, W, H) {
  const tb = titleBlock;
  const sealShift = state.seal && tb.align !== 'left' ? tb.w * 0.055 : 0;
  const cx = tb.align === 'left' ? tb.x + tb.w * 0.04 : tb.x + tb.w / 2 - sealShift;
  const align = tb.align === 'left' ? 'left' : 'center';

  // Scrim so lettering reads over any photo.
  const scrim = ctx.createLinearGradient(0, tb.y - tb.h * 0.25, 0, tb.y + tb.h);
  scrim.addColorStop(0, 'rgba(8,0,20,0)');
  scrim.addColorStop(0.45, 'rgba(8,0,20,0.55)');
  scrim.addColorStop(1, 'rgba(8,0,20,0.88)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, tb.y - tb.h * 0.25, W, tb.h * 1.25 + H * 0.04);
  if (state.halftone) drawHalftoneBand(ctx, 0, tb.y, W, tb.h * 0.5);

  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';

  // Heat-meter stars above the title.
  const starR = Math.min(W, H) * 0.016;
  const starY = tb.y + tb.h * 0.16;
  if (align === 'center') {
    drawHeatStars(ctx, state.stars, cx - starR * 2.35 * 2, starY, starR, false);
  } else {
    drawHeatStars(ctx, state.stars, cx + starR, starY, starR, false);
  }

  // Big condensed title with sunset gradient, ink stroke and hard shadow.
  const titleText = String(state.title || 'NEON PALM').toUpperCase();
  const titleMaxW = tb.w * (state.seal ? 0.78 : 0.96);
  const titleSize = fitFontSize(ctx, titleText, titleMaxW, tb.h * 0.52, TITLE_FONT, '900');
  const titleY = tb.y + tb.h * 0.62;
  const grad = ctx.createLinearGradient(0, titleY - titleSize, 0, titleY);
  grad.addColorStop(0, grade.title[0]);
  grad.addColorStop(0.55, grade.title[1]);
  grad.addColorStop(1, grade.title[2]);
  ctx.font = '900 ' + titleSize + 'px ' + TITLE_FONT;
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowOffsetX = titleSize * 0.045;
  ctx.shadowOffsetY = titleSize * 0.055;
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#12041f';
  ctx.lineWidth = titleSize * 0.14;
  ctx.strokeText(titleText, cx, titleY);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = grad;
  ctx.fillText(titleText, cx, titleY);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(1, titleSize * 0.012);
  ctx.strokeText(titleText, cx, titleY);

  // Neon script subtitle: colored glow passes under a bright core.
  if (state.subtitle) {
    const subSize = Math.max(16, titleSize * 0.34);
    const subY = titleY + subSize * 1.18;
    ctx.font = 'italic 700 ' + subSize + 'px ' + SCRIPT_FONT;
    ctx.shadowColor = grade.neon;
    ctx.shadowBlur = subSize * 0.6;
    ctx.fillStyle = grade.neon;
    ctx.fillText(String(state.subtitle), cx, subY);
    ctx.fillText(String(state.subtitle), cx, subY);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(state.subtitle), cx, subY);
  }

  // Tagline in spaced caps.
  if (state.tagline) {
    const tagSize = Math.max(12, Math.min(W, H) * 0.02);
    ctx.font = '700 ' + tagSize + 'px ' + CAPS_FONT;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    const spaced = String(state.tagline).toUpperCase().split('').join(' ');
    ctx.fillText(spaced, cx, tb.y + tb.h * 0.97);
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

let grainTile = null;
function makeGrainTile() {
  if (grainTile) return grainTile;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d');
  const img = g.createImageData(256, 256);
  let seed = 1234567;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rnd() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  grainTile = c;
  return c;
}

function drawGrain(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.globalCompositeOperation = 'overlay';
  const pattern = ctx.createPattern(makeGrainTile(), 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawVignette(ctx, W, H) {
  const r = Math.max(W, H) * 0.72;
  const v = ctx.createRadialGradient(W / 2, H / 2, r * 0.45, W / 2, H / 2, r);
  v.addColorStop(0, 'rgba(8,0,20,0)');
  v.addColorStop(1, 'rgba(8,0,20,0.5)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

function drawBilling(ctx, state, W, H) {
  if (!state.billing) return;
  const size = Math.max(10, Math.min(W, H) * 0.014);
  ctx.save();
  ctx.font = '600 ' + size + 'px ' + CAPS_FONT;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 4;
  const spaced = String(state.billing).toUpperCase().split('').join(' ');
  ctx.fillText(spaced, W / 2, H - size * 0.9);
  ctx.restore();
}

function drawOuterFrame(ctx, W, H) {
  ctx.save();
  ctx.strokeStyle = '#12041f';
  ctx.lineWidth = Math.max(6, W * 0.006);
  ctx.strokeRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,210,63,0.85)';
  ctx.lineWidth = 2;
  const inset = Math.max(8, W * 0.009);
  ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  ctx.restore();
}

// Render the full cover. photos: [{img, name}]. opts: {selected} panel index or -1.
export function renderCover(ctx, state, photos, W, H, opts) {
  const options = opts || {};
  const grade = gradeById(state.grade);
  const geo = layoutPanels(state.layout, W, H);
  const snapshot = state.layout === 'tilted';

  ctx.clearRect(0, 0, W, H);
  drawBackground(ctx, W, H, grade);

  geo.panels.forEach((rect, i) => {
    const panel = state.panels[i] || makePanel(0, '');
    const photo = photos.length ? photos[((panel.photo % photos.length) + photos.length) % photos.length] : null;
    const rot = ((rect.rot || 0) + (panel.rot || 0)) * Math.PI / 180;
    ctx.save();
    if (rot) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate(rot);
      ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
    }
    if (photo && photo.img) {
      drawPanelPhoto(ctx, photo, panel, rect, grade, snapshot);
    } else {
      ctx.fillStyle = 'rgba(10,2,24,0.6)';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = '#12041f';
      ctx.lineWidth = 4;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
    drawCallout(ctx, panel.callout, rect);
    ctx.restore();

    if (options.selected === i) {
      ctx.save();
      ctx.strokeStyle = '#ffd23f';
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 10]);
      ctx.strokeRect(rect.x - 3, rect.y - 3, rect.w + 6, rect.h + 6);
      ctx.restore();
    }
  });

  drawLettering(ctx, state, grade, geo.title, W, H);
  if (state.seal) drawSeal(ctx, W, H, grade);
  drawBilling(ctx, state, W, H);
  if (state.grain) drawGrain(ctx, W, H);
  if (state.vignette) drawVignette(ctx, W, H);
  drawOuterFrame(ctx, W, H);
  return geo;
}

export function panelAtPoint(geo, x, y) {
  for (let i = geo.panels.length - 1; i >= 0; i--) {
    const r = geo.panels[i];
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}
