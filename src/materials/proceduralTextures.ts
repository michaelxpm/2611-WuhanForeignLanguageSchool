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
