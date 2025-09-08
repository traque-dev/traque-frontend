import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  const result = base.slice(0, 50);
  return result;
}

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.trim();
  const short = /^#([\da-f]{3})$/i;
  const long = /^#([\da-f]{6})$/i;

  if (short.test(normalized)) {
    const [, s] = normalized.match(short)!;
    const r = parseInt(s[0] + s[0], 16);
    const g = parseInt(s[1] + s[1], 16);
    const b = parseInt(s[2] + s[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (long.test(normalized)) {
    const [, l] = normalized.match(long)!;
    const r = parseInt(l.slice(0, 2), 16);
    const g = parseInt(l.slice(2, 4), 16);
    const b = parseInt(l.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return normalized;
}
