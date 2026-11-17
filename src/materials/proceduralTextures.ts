import * as THREE from 'three';

const textureCache = new Map<string, THREE.CanvasTexture>();

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function finalizeTexture(
  key: string,
  canvas: HTMLCanvasElement,
  repeatX = 1,
  repeatY = 1,
  isColor = true
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 8;
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  textureCache.set(key, tex);
  return tex;
}

export function getStonePavingTexture(repeatX = 16, repeatY = 16): THREE.CanvasTexture {
  const key = `stone-${repeatX}-${repeatY}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#c8c2b8';
  ctx.fillRect(0, 0, 512, 512);

  const cols = 8;
  const rows = 8;
  const cw = 512 / cols;
  const ch = 512 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const shade = 192 + ((r * 7 + c * 13) % 18) - 9;
      ctx.fillStyle = `rgb(${shade}, ${shade - 4}, ${shade - 10})`;
      ctx.fillRect(c * cw + 2, r * ch + 2, cw - 4, ch - 4);
    }
  }
  return finalizeTexture(key, canvas, repeatX, repeatY, true);
}

export function getBrickWalkwayTexture(repeatX = 8, repeatY = 8): THREE.CanvasTexture {
  const key = `brick-${repeatX}-${repeatY}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = '#9c523b';
  ctx.fillRect(0, 0, 256, 256);

  const rows = 8;
  const cols = 4;
  const bh = 256 / rows;
  const bw = 256 / cols;

  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : bw / 2;
    for (let c = -1; c <= cols; c++) {
      const v = ((r * 11 + c * 17) % 20) - 10;
      ctx.fillStyle = `rgb(${172 + v}, ${96 + Math.floor(v * 0.6)}, ${72 + Math.floor(v * 0.5)})`;
      ctx.fillRect(c * bw + offset + 2, r * bh + 2, bw - 4, bh - 4);
    }
  }
  return finalizeTexture(key, canvas, repeatX, repeatY, true);
}

export function getGrassTexture(repeatX = 24, repeatY = 24): THREE.CanvasTexture {
  const key = `grass-${repeatX}-${repeatY}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = '#4c8c3a';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 2400; i++) {
    const x = (i * 73) % 256;
    const y = (i * 137) % 256;
    const g = 115 + ((i * 29) % 42);
    ctx.fillStyle = `rgba(${Math.floor(g * 0.48)}, ${g}, ${Math.floor(g * 0.36)}, 0.45)`;
    ctx.fillRect(x, y, 3, 3);
  }
  return finalizeTexture(key, canvas, repeatX, repeatY, true);
}

export function getAsphaltTexture(repeatX = 12, repeatY = 12): THREE.CanvasTexture {
  const key = `asphalt-${repeatX}-${repeatY}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = '#3b4048';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 3000; i++) {
    const x = (i * 53) % 256;
    const y = (i * 97) % 256;
    const v = 50 + ((i * 19) % 24);
    ctx.fillStyle = `rgb(${v}, ${v + 2}, ${v + 5})`;
    ctx.fillRect(x, y, 2, 2);
  }
  return finalizeTexture(key, canvas, repeatX, repeatY, true);
}

export function getWaterNormalTexture(): THREE.CanvasTexture {
  const key = 'water-normal';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y += 2) {
    for (let x = 0; x < 256; x += 2) {
      const nx = Math.sin(x * 0.12 + y * 0.05) * 18 + Math.cos(x * 0.07 - y * 0.11) * 12;
      const ny = Math.cos(y * 0.14 + x * 0.04) * 18 + Math.sin(y * 0.08 - x * 0.09) * 12;
      ctx.fillStyle = `rgb(${Math.floor(128 + nx)}, ${Math.floor(128 + ny)}, 245)`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  return finalizeTexture(key, canvas, 18, 18, false);
}

export function getVerticalPlaqueTexture(text: string): THREE.CanvasTexture {
  const key = `plaque-${text}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const [canvas, ctx] = makeCanvas(128, 512);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 128, 512);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 112, 496);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 34px "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const chars = Array.from(text);
  const step = 440 / Math.max(chars.length, 1);
  chars.forEach((ch, idx) => {
    ctx.fillText(ch, 64, 48 + idx * step);
  });

  return finalizeTexture(key, canvas, 1, 1, true);
}

export function getFacadeWindowTexture(
  wallHex = '#eef2f6',
  stories = 4,
  cols = 12,
  archedTop = false
): THREE.CanvasTexture {
  const key = `facade-${wallHex}-${stories}-${cols}-${archedTop}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const w = 512;
  const h = 512;
  const [canvas, ctx] = makeCanvas(w, h);

  ctx.fillStyle = wallHex;
  ctx.fillRect(0, 0, w, h);

  const storyH = h / stories;
  const colW = w / cols;

  for (let s = 0; s < stories; s++) {
    const y0 = s * storyH;
    // Subtle floor slab shadow line
    ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
    ctx.fillRect(0, y0, w, 4);

    // Spandrel band
    ctx.fillStyle = 'rgba(203, 213, 225, 0.55)';
    ctx.fillRect(0, y0 + storyH - 10, w, 10);

    for (let c = 0; c < cols; c++) {
      const x0 = c * colW;
      const padX = colW * 0.16;
      const padTop = storyH * 0.18;
      const winW = colW - padX * 2;
      const winH = storyH * 0.6;
      const wx = x0 + padX;
      const wy = y0 + padTop;

      // Window recess frame
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(wx - 2, wy - 2, winW + 4, winH + 4);

      // Dark reflective glass gradient
      const grad = ctx.createLinearGradient(wx, wy, wx, wy + winH);
      grad.addColorStop(0, '#1e3a5f');
      grad.addColorStop(0.55, '#0f253d');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;

      if (archedTop && s === 0) {
        ctx.beginPath();
        ctx.arc(wx + winW / 2, wy + winW / 2, winW / 2, Math.PI, 0);
        ctx.lineTo(wx + winW, wy + winH);
        ctx.lineTo(wx, wy + winH);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(wx, wy, winW, winH);
      }

      // Mullion divider
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(wx + winW / 2 - 1, wy, 2, winH);
    }
  }

  return finalizeTexture(key, canvas, 1, 1, true);
}

export function getRoofRibTexture(baseHex = '#2f3947'): THREE.CanvasTexture {
  const key = `roof-${baseHex}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  for (let x = 0; x < 256; x += 16) {
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(x, 0, 2, 256);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x + 2, 0, 2, 256);
  }
  return finalizeTexture(key, canvas, 6, 3, true);
}

export function getFlagWallTexture(): THREE.CanvasTexture {
  const key = 'flag-wall-motto';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const w = 1024;
  const h = 512;
  const [canvas, ctx] = makeCanvas(w, h);

  // Cream stone cladding base
  ctx.fillStyle = '#dfd3be';
  ctx.fillRect(0, 0, w, h);

  // Subtle stone panel grid
  ctx.strokeStyle = 'rgba(120, 100, 75, 0.25)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= w; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // School emblem medallion near top center
  ctx.fillStyle = '#c8b89a';
  ctx.beginPath();
  ctx.arc(w / 2, 105, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8b6f47';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#735a38';
  ctx.font = 'bold 26px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WFLS', w / 2, 106);

  // Chinese & English Motto
  ctx.fillStyle = '#6e5636';
  ctx.font = 'bold 54px "Microsoft YaHei", serif';
  ctx.fillText('从这里走向世界和未来', w / 2, 235);

  ctx.fillStyle = '#7c6240';
  ctx.font = '600 34px Georgia, serif';
  ctx.fillText('An Access to the World and the Future', w / 2, 310);

  return finalizeTexture(key, canvas, 1, 1, true);
}

export function getFootballPitchTexture(): THREE.CanvasTexture {
  const key = 'football-pitch';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const w = 1024;
  const h = 680;
  const [canvas, ctx] = makeCanvas(w, h);

  // Alternating mowed grass stripes
  const stripes = 14;
  const sw = w / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#3f8c36' : '#4a9e40';
    ctx.fillRect(i * sw, 0, sw + 1, h);
  }

  // Crisp white FIFA pitch markings
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 4;
  const pad = 24;
  const pw = w - pad * 2;
  const ph = h - pad * 2;
  ctx.strokeRect(pad, pad, pw, ph);

  // Halfway line & center circle
  ctx.beginPath();
  ctx.moveTo(w / 2, pad);
  ctx.lineTo(w / 2, h - pad);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 72, 0, Math.PI * 2);
  ctx.stroke();

  // Penalty boxes
  ctx.strokeRect(pad, h / 2 - 145, 130, 290);
  ctx.strokeRect(w - pad - 130, h / 2 - 145, 130, 290);

  // Goal areas
  ctx.strokeRect(pad, h / 2 - 70, 50, 140);
  ctx.strokeRect(w - pad - 50, h / 2 - 70, 50, 140);

  return finalizeTexture(key, canvas, 1, 1, true);
}

export function getCourtTexture(surfaceHex = '#b94a3e', lineHex = '#f8fafc'): THREE.CanvasTexture {
  const key = `court-${surfaceHex}-${lineHex}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const w = 256;
  const h = 512;
  const [canvas, ctx] = makeCanvas(w, h);

  ctx.fillStyle = surfaceHex;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = lineHex;
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 22, w - 36, h - 44);

  // Center line & circle
  ctx.beginPath();
  ctx.moveTo(18, h / 2);
  ctx.lineTo(w - 18, h / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 30, 0, Math.PI * 2);
  ctx.stroke();

  // Three-point arcs
  ctx.beginPath();
  ctx.arc(w / 2, 42, 56, 0.2, Math.PI - 0.2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(w / 2, h - 42, 56, Math.PI + 0.2, Math.PI * 2 - 0.2);
  ctx.stroke();

  return finalizeTexture(key, canvas, 1, 1, true);
}

export function getStadiumTrackTexture(): THREE.CanvasTexture {
  const key = 'stadium-track';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const w = 1024;
  const h = 512;
  const [canvas, ctx] = makeCanvas(w, h);

  ctx.fillStyle = '#b9483b';
  ctx.fillRect(0, 0, w, h);

  // Subtle EPDM grain
  for (let i = 0; i < 4000; i++) {
    const x = (i * 67) % w;
    const y = (i * 113) % h;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(x, y, 2, 2);
  }

  return finalizeTexture(key, canvas, 4, 4, true);
}
