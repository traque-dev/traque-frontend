import type { QrCode } from '@/lib/qrcode';

export type QrModuleStyle = 'square' | 'rounded' | 'dots';

export type QrLogo = {
  /** Loaded image element (canvas) or data URL string (SVG). */
  image: CanvasImageSource | null;
  dataUrl: string | null;
  /** Logo width as a fraction of the QR width (0.1–0.3). */
  ratio: number;
};

export type QrRenderOptions = {
  /** Full output size in pixels, including the quiet-zone margin. */
  size: number;
  /** Quiet-zone width measured in modules. */
  margin: number;
  foreground: string;
  /** Background color, or 'transparent' for none. */
  background: string;
  /** Finder-pattern ("eyes") color. Defaults to `foreground` when omitted. */
  eyeColor?: string;
  moduleStyle: QrModuleStyle;
};

/** True when module (x, y) belongs to one of the three 7×7 finder patterns. */
export function isEyeModule(x: number, y: number, count: number): boolean {
  const inTopLeft = x < 7 && y < 7;
  const inTopRight = x >= count - 7 && y < 7;
  const inBottomLeft = x < 7 && y >= count - 7;
  return inTopLeft || inTopRight || inBottomLeft;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Draws the QR symbol onto a canvas using the supplied style options. */
export function drawQrToCanvas(
  canvas: HTMLCanvasElement,
  qr: QrCode,
  opts: QrRenderOptions,
  logo?: QrLogo | null,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const matrix = qr.getMatrix();
  const moduleCount = qr.size;
  const count = moduleCount + opts.margin * 2;
  const cell = opts.size / count;

  // The backing store uses the full resolution; CSS controls the display size.
  canvas.width = opts.size;
  canvas.height = opts.size;
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  ctx.clearRect(0, 0, opts.size, opts.size);
  if (opts.background !== 'transparent') {
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, opts.size, opts.size);
  }

  const eyeColor = opts.eyeColor ?? opts.foreground;

  for (let y = 0; y < moduleCount; y++) {
    for (let x = 0; x < moduleCount; x++) {
      if (!matrix[y][x]) continue;
      const px = (x + opts.margin) * cell;
      const py = (y + opts.margin) * cell;
      ctx.fillStyle = isEyeModule(x, y, moduleCount)
        ? eyeColor
        : opts.foreground;

      if (opts.moduleStyle === 'dots') {
        const r = cell / 2;
        ctx.beginPath();
        ctx.arc(px + r, py + r, r * 0.9, 0, Math.PI * 2);
        ctx.fill();
      } else if (opts.moduleStyle === 'rounded') {
        roundRectPath(ctx, px, py, cell, cell, cell * 0.35);
        ctx.fill();
      } else {
        // Slight overlap avoids hairline gaps between square modules.
        ctx.fillRect(px, py, cell + 0.5, cell + 0.5);
      }
    }
  }

  if (logo?.image) {
    const logoSize = opts.size * Math.min(Math.max(logo.ratio, 0.1), 0.32);
    const pos = (opts.size - logoSize) / 2;
    const pad = logoSize * 0.12;
    ctx.fillStyle =
      opts.background === 'transparent' ? '#ffffff' : opts.background;
    roundRectPath(
      ctx,
      pos - pad,
      pos - pad,
      logoSize + pad * 2,
      logoSize + pad * 2,
      logoSize * 0.18,
    );
    ctx.fill();
    ctx.save();
    roundRectPath(ctx, pos, pos, logoSize, logoSize, logoSize * 0.12);
    ctx.clip();
    ctx.drawImage(logo.image, pos, pos, logoSize, logoSize);
    ctx.restore();
  }
}

/** Builds a standalone SVG string for the QR symbol with the given styles. */
export function qrToSvgString(
  qr: QrCode,
  opts: QrRenderOptions,
  logo?: QrLogo | null,
): string {
  const matrix = qr.getMatrix();
  const moduleCount = qr.size;
  const count = moduleCount + opts.margin * 2;
  const eyeColor = opts.eyeColor ?? opts.foreground;

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${opts.size}" height="${opts.size}" viewBox="0 0 ${count} ${count}" shape-rendering="crispEdges">`,
  );
  if (opts.background !== 'transparent') {
    parts.push(
      `<rect width="${count}" height="${count}" fill="${opts.background}"/>`,
    );
  }

  for (let y = 0; y < moduleCount; y++) {
    for (let x = 0; x < moduleCount; x++) {
      if (!matrix[y][x]) continue;
      const cx = x + opts.margin;
      const cy = y + opts.margin;
      const fill = isEyeModule(x, y, moduleCount) ? eyeColor : opts.foreground;

      if (opts.moduleStyle === 'dots') {
        parts.push(
          `<circle cx="${cx + 0.5}" cy="${cy + 0.5}" r="0.45" fill="${fill}"/>`,
        );
      } else if (opts.moduleStyle === 'rounded') {
        parts.push(
          `<rect x="${cx}" y="${cy}" width="1" height="1" rx="0.35" ry="0.35" fill="${fill}"/>`,
        );
      } else {
        parts.push(
          `<rect x="${cx}" y="${cy}" width="1.02" height="1.02" fill="${fill}"/>`,
        );
      }
    }
  }

  if (logo?.dataUrl) {
    const ratio = Math.min(Math.max(logo.ratio, 0.1), 0.32);
    const logoSize = count * ratio;
    const pos = (count - logoSize) / 2;
    const pad = logoSize * 0.12;
    const bg = opts.background === 'transparent' ? '#ffffff' : opts.background;
    parts.push(
      `<rect x="${pos - pad}" y="${pos - pad}" width="${logoSize + pad * 2}" height="${logoSize + pad * 2}" rx="${logoSize * 0.18}" fill="${bg}"/>`,
    );
    parts.push(
      `<image href="${logo.dataUrl}" x="${pos}" y="${pos}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid slice"/>`,
    );
  }

  parts.push('</svg>');
  return parts.join('');
}
