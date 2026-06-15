/*
 * Self-contained QR Code generator — pure TypeScript, no third-party deps.
 *
 * Implements ISO/IEC 18004 QR Code encoding: numeric / alphanumeric / byte
 * segments with automatic mode selection, Reed–Solomon error correction,
 * automatic version (size) selection and optimal data-mask selection.
 *
 * The algorithm follows the public reference described by Project Nayuki,
 * reimplemented here from scratch in TypeScript.
 */

export type EccLevel = 'LOW' | 'MEDIUM' | 'QUARTILE' | 'HIGH';

/** Error-correction level metadata. `formatBits` is used when drawing format info. */
const ECC: Record<EccLevel, { ordinal: number; formatBits: number }> = {
  LOW: { ordinal: 0, formatBits: 1 },
  MEDIUM: { ordinal: 1, formatBits: 0 },
  QUARTILE: { ordinal: 2, formatBits: 3 },
  HIGH: { ordinal: 3, formatBits: 2 },
};

const MIN_VERSION = 1;
const MAX_VERSION = 40;

const PENALTY_N1 = 3;
const PENALTY_N2 = 3;
const PENALTY_N3 = 40;
const PENALTY_N4 = 10;

// Number of error-correction codewords per block, indexed by [eccOrdinal][version].
const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  // Version: 0 is unused padding so version maps directly to index.
  // 1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40
  [
    -1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30,
    28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ], // LOW
  [
    -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26,
    26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28,
  ], // MEDIUM
  [
    -1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28,
    26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ], // QUARTILE
  [
    -1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28,
    26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ], // HIGH
];

const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
  // 1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40
  [
    -1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10,
    12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
  ], // LOW
  [
    -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17,
    17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
  ], // MEDIUM
  [
    -1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23,
    23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68,
  ], // QUARTILE
  [
    -1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25,
    25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77,
    81,
  ], // HIGH
];

class BitBuffer {
  public readonly bits: number[] = [];

  public appendBits(value: number, len: number): void {
    if (len < 0 || len > 31 || value >>> len !== 0) {
      throw new RangeError('Value out of range');
    }
    for (let i = len - 1; i >= 0; i--) {
      this.bits.push((value >>> i) & 1);
    }
  }
}

type SegmentMode = {
  modeBits: number;
  numBitsCharCount: [number, number, number];
};

const MODE = {
  NUMERIC: { modeBits: 0x1, numBitsCharCount: [10, 12, 14] },
  ALPHANUMERIC: { modeBits: 0x2, numBitsCharCount: [9, 11, 13] },
  BYTE: { modeBits: 0x4, numBitsCharCount: [8, 16, 16] },
} as const satisfies Record<string, SegmentMode>;

const ALPHANUMERIC_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

type Segment = {
  mode: SegmentMode;
  numChars: number;
  bits: number[];
};

function numCharCountBits(mode: SegmentMode, version: number): number {
  return mode.numBitsCharCount[Math.floor((version + 7) / 17)];
}

function toUtf8(text: string): number[] {
  // Encode the JS string as UTF-8 bytes without relying on TextEncoder typing quirks.
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(text));
}

function makeBytesSegment(data: number[]): Segment {
  const bb = new BitBuffer();
  for (const b of data) {
    bb.appendBits(b, 8);
  }
  return { mode: MODE.BYTE, numChars: data.length, bits: bb.bits };
}

function makeNumericSegment(digits: string): Segment {
  const bb = new BitBuffer();
  for (let i = 0; i < digits.length; ) {
    const n = Math.min(digits.length - i, 3);
    bb.appendBits(parseInt(digits.substring(i, i + n), 10), n * 3 + 1);
    i += n;
  }
  return { mode: MODE.NUMERIC, numChars: digits.length, bits: bb.bits };
}

function makeAlphanumericSegment(text: string): Segment {
  const bb = new BitBuffer();
  let i = 0;
  for (; i + 2 <= text.length; i += 2) {
    let temp = ALPHANUMERIC_CHARSET.indexOf(text[i]) * 45;
    temp += ALPHANUMERIC_CHARSET.indexOf(text[i + 1]);
    bb.appendBits(temp, 11);
  }
  if (i < text.length) {
    bb.appendBits(ALPHANUMERIC_CHARSET.indexOf(text[i]), 6);
  }
  return { mode: MODE.ALPHANUMERIC, numChars: text.length, bits: bb.bits };
}

function isNumeric(text: string): boolean {
  return /^[0-9]*$/.test(text);
}

function isAlphanumeric(text: string): boolean {
  return /^[0-9A-Z $%*+./:-]*$/.test(text);
}

function makeSegments(text: string): Segment[] {
  if (text === '') return [];
  if (isNumeric(text)) return [makeNumericSegment(text)];
  if (isAlphanumeric(text)) return [makeAlphanumericSegment(text)];
  return [makeBytesSegment(toUtf8(text))];
}

function getTotalBits(segs: Segment[], version: number): number {
  let result = 0;
  for (const seg of segs) {
    const ccbits = numCharCountBits(seg.mode, version);
    if (seg.numChars >= 1 << ccbits) return Infinity;
    result += 4 + ccbits + seg.bits.length;
  }
  return result;
}

// ---- Reed–Solomon over GF(2^8) with primitive polynomial 0x11D ----

function reedSolomonMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function reedSolomonComputeDivisor(degree: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < degree - 1; i++) result.push(0);
  result.push(1);
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = reedSolomonMultiply(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = reedSolomonMultiply(root, 0x02);
  }
  return result;
}

function reedSolomonComputeRemainder(
  data: number[],
  divisor: number[],
): number[] {
  const result = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coef, i) => {
      result[i] ^= reedSolomonMultiply(coef, factor);
    });
  }
  return result;
}

function getNumRawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (version >= 7) result -= 36;
  }
  return result;
}

function getNumDataCodewords(version: number, ecc: EccLevel): number {
  const ord = ECC[ecc].ordinal;
  return (
    Math.floor(getNumRawDataModules(version) / 8) -
    ECC_CODEWORDS_PER_BLOCK[ord][version] *
      NUM_ERROR_CORRECTION_BLOCKS[ord][version]
  );
}

export class QrCode {
  /** The side length of the QR symbol in modules (21..177). */
  public readonly size: number;
  /** The data-mask pattern (0..7) actually used for this symbol. */
  public readonly mask: number;
  private readonly modules: boolean[][];
  private readonly isFunction: boolean[][];

  public constructor(
    public readonly version: number,
    public readonly errorCorrectionLevel: EccLevel,
    dataCodewords: number[],
    requestedMask: number,
  ) {
    this.size = version * 4 + 17;
    const row: boolean[] = Array(this.size).fill(false);
    this.modules = row.map(() => Array<boolean>(this.size).fill(false));
    this.isFunction = row.map(() => Array<boolean>(this.size).fill(false));

    this.drawFunctionPatterns();
    const allCodewords = this.addEccAndInterleave(dataCodewords);
    this.drawCodewords(allCodewords);

    const chosenMask =
      requestedMask >= 0 ? requestedMask : this.selectBestMask();
    this.applyMask(chosenMask);
    this.drawFormatBits(chosenMask);
    this.mask = chosenMask;
  }

  public getModule(x: number, y: number): boolean {
    return (
      x >= 0 && x < this.size && y >= 0 && y < this.size && this.modules[y][x]
    );
  }

  /** Returns the QR matrix as rows of booleans (true = dark module). */
  public getMatrix(): boolean[][] {
    return this.modules.map((r) => r.slice());
  }

  /** Encodes the given text into the smallest QR Code at the given ECC level. */
  public static encodeText(text: string, ecc: EccLevel): QrCode {
    const segs = makeSegments(text);
    return QrCode.encodeSegments(segs, ecc);
  }

  private static encodeSegments(
    segs: Segment[],
    ecc: EccLevel,
    minVersion = MIN_VERSION,
    maxVersion = MAX_VERSION,
  ): QrCode {
    let version: number;
    for (version = minVersion; ; version++) {
      const dataCapacityBits = getNumDataCodewords(version, ecc) * 8;
      const usedBits = getTotalBits(segs, version);
      if (usedBits <= dataCapacityBits) break;
      if (version >= maxVersion) {
        throw new RangeError('Data too long for a QR Code');
      }
    }

    const bb = new BitBuffer();
    for (const seg of segs) {
      bb.appendBits(seg.mode.modeBits, 4);
      bb.appendBits(seg.numChars, numCharCountBits(seg.mode, version));
      for (const bit of seg.bits) bb.bits.push(bit);
    }

    const dataCapacityBits = getNumDataCodewords(version, ecc) * 8;
    bb.appendBits(0, Math.min(4, dataCapacityBits - bb.bits.length));
    bb.appendBits(0, (8 - (bb.bits.length % 8)) % 8);

    for (
      let pad = 0xec;
      bb.bits.length < dataCapacityBits;
      pad ^= 0xec ^ 0x11
    ) {
      bb.appendBits(pad, 8);
    }

    const dataCodewords: number[] = Array(bb.bits.length >> 3).fill(0);
    bb.bits.forEach((bit, i) => {
      dataCodewords[i >>> 3] |= bit << (7 - (i & 7));
    });

    return new QrCode(version, ecc, dataCodewords, -1);
  }

  private addEccAndInterleave(data: number[]): number[] {
    const ver = this.version;
    const ord = ECC[this.errorCorrectionLevel].ordinal;
    const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ord][ver];
    const blockEccLen = ECC_CODEWORDS_PER_BLOCK[ord][ver];
    const rawCodewords = Math.floor(getNumRawDataModules(ver) / 8);
    const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
    const shortBlockLen = Math.floor(rawCodewords / numBlocks);

    const blocks: number[][] = [];
    const rsDiv = reedSolomonComputeDivisor(blockEccLen);
    for (let i = 0, k = 0; i < numBlocks; i++) {
      const datLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
      const dat = data.slice(k, k + datLen);
      k += datLen;
      const ecc = reedSolomonComputeRemainder(dat.slice(), rsDiv);
      if (i < numShortBlocks) dat.push(0);
      blocks.push(dat.concat(ecc));
    }

    const result: number[] = [];
    for (let i = 0; i < blocks[0].length; i++) {
      blocks.forEach((block, j) => {
        if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) {
          result.push(block[i]);
        }
      });
    }
    return result;
  }

  private drawFunctionPatterns(): void {
    for (let i = 0; i < this.size; i++) {
      this.setFunctionModule(6, i, i % 2 === 0);
      this.setFunctionModule(i, 6, i % 2 === 0);
    }

    this.drawFinderPattern(3, 3);
    this.drawFinderPattern(this.size - 4, 3);
    this.drawFinderPattern(3, this.size - 4);

    const alignPatPos = this.getAlignmentPatternPositions();
    const numAlign = alignPatPos.length;
    for (let i = 0; i < numAlign; i++) {
      for (let j = 0; j < numAlign; j++) {
        if (
          !(
            (i === 0 && j === 0) ||
            (i === 0 && j === numAlign - 1) ||
            (i === numAlign - 1 && j === 0)
          )
        ) {
          this.drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
        }
      }
    }

    this.drawFormatBits(0);
    this.drawVersion();
  }

  private drawFormatBits(mask: number): void {
    const data = (ECC[this.errorCorrectionLevel].formatBits << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;

    for (let i = 0; i <= 5; i++) this.setFunctionModule(8, i, getBit(bits, i));
    this.setFunctionModule(8, 7, getBit(bits, 6));
    this.setFunctionModule(8, 8, getBit(bits, 7));
    this.setFunctionModule(7, 8, getBit(bits, 8));
    for (let i = 9; i < 15; i++)
      this.setFunctionModule(14 - i, 8, getBit(bits, i));

    for (let i = 0; i < 8; i++)
      this.setFunctionModule(this.size - 1 - i, 8, getBit(bits, i));
    for (let i = 8; i < 15; i++)
      this.setFunctionModule(8, this.size - 15 + i, getBit(bits, i));
    this.setFunctionModule(8, this.size - 8, true);
  }

  private drawVersion(): void {
    if (this.version < 7) return;
    let rem = this.version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (this.version << 12) | rem;

    for (let i = 0; i < 18; i++) {
      const color = getBit(bits, i);
      const a = this.size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      this.setFunctionModule(a, b, color);
      this.setFunctionModule(b, a, color);
    }
  }

  private drawFinderPattern(x: number, y: number): void {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const xx = x + dx;
        const yy = y + dy;
        if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size) {
          this.setFunctionModule(xx, yy, dist !== 2 && dist !== 4);
        }
      }
    }
  }

  private drawAlignmentPattern(x: number, y: number): void {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        this.setFunctionModule(
          x + dx,
          y + dy,
          Math.max(Math.abs(dx), Math.abs(dy)) !== 1,
        );
      }
    }
  }

  private setFunctionModule(x: number, y: number, isDark: boolean): void {
    this.modules[y][x] = isDark;
    this.isFunction[y][x] = true;
  }

  private getAlignmentPatternPositions(): number[] {
    if (this.version === 1) return [];
    const numAlign = Math.floor(this.version / 7) + 2;
    const step =
      this.version === 32
        ? 26
        : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
    const result: number[] = [6];
    for (let pos = this.size - 7; result.length < numAlign; pos -= step) {
      result.splice(1, 0, pos);
    }
    return result;
  }

  private drawCodewords(data: number[]): void {
    let i = 0;
    for (let right = this.size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < this.size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? this.size - 1 - vert : vert;
          if (!this.isFunction[y][x] && i < data.length * 8) {
            this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
            i++;
          }
        }
      }
    }
  }

  private applyMask(mask: number): void {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        let invert: boolean;
        switch (mask) {
          case 0:
            invert = (x + y) % 2 === 0;
            break;
          case 1:
            invert = y % 2 === 0;
            break;
          case 2:
            invert = x % 3 === 0;
            break;
          case 3:
            invert = (x + y) % 3 === 0;
            break;
          case 4:
            invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
            break;
          case 5:
            invert = ((x * y) % 2) + ((x * y) % 3) === 0;
            break;
          case 6:
            invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
            break;
          case 7:
            invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
            break;
          default:
            throw new Error('Unreachable');
        }
        if (!this.isFunction[y][x] && invert) {
          this.modules[y][x] = !this.modules[y][x];
        }
      }
    }
  }

  private selectBestMask(): number {
    let minPenalty = Infinity;
    let bestMask = 0;
    for (let m = 0; m < 8; m++) {
      this.applyMask(m);
      this.drawFormatBits(m);
      const penalty = this.getPenaltyScore();
      if (penalty < minPenalty) {
        minPenalty = penalty;
        bestMask = m;
      }
      this.applyMask(m); // Undo (XOR is its own inverse).
    }
    return bestMask;
  }

  private getPenaltyScore(): number {
    let result = 0;
    const size = this.size;
    const modules = this.modules;

    for (let y = 0; y < size; y++) {
      let runColor = false;
      let runX = 0;
      const runHistory = [0, 0, 0, 0, 0, 0, 0];
      for (let x = 0; x < size; x++) {
        if (modules[y][x] === runColor) {
          runX++;
          if (runX === 5) result += PENALTY_N1;
          else if (runX > 5) result++;
        } else {
          this.finderPenaltyAddHistory(runX, runHistory);
          if (!runColor)
            result += this.finderPenaltyCountPatterns(runHistory) * PENALTY_N3;
          runColor = modules[y][x];
          runX = 1;
        }
      }
      result +=
        this.finderPenaltyTerminateAndCount(runColor, runX, runHistory) *
        PENALTY_N3;
    }

    for (let x = 0; x < size; x++) {
      let runColor = false;
      let runY = 0;
      const runHistory = [0, 0, 0, 0, 0, 0, 0];
      for (let y = 0; y < size; y++) {
        if (modules[y][x] === runColor) {
          runY++;
          if (runY === 5) result += PENALTY_N1;
          else if (runY > 5) result++;
        } else {
          this.finderPenaltyAddHistory(runY, runHistory);
          if (!runColor)
            result += this.finderPenaltyCountPatterns(runHistory) * PENALTY_N3;
          runColor = modules[y][x];
          runY = 1;
        }
      }
      result +=
        this.finderPenaltyTerminateAndCount(runColor, runY, runHistory) *
        PENALTY_N3;
    }

    for (let y = 0; y < size - 1; y++) {
      for (let x = 0; x < size - 1; x++) {
        const color = modules[y][x];
        if (
          color === modules[y][x + 1] &&
          color === modules[y + 1][x] &&
          color === modules[y + 1][x + 1]
        ) {
          result += PENALTY_N2;
        }
      }
    }

    let dark = 0;
    for (const rowArr of modules) {
      for (const cell of rowArr) if (cell) dark++;
    }
    const total = size * size;
    const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    result += k * PENALTY_N4;
    return result;
  }

  private finderPenaltyCountPatterns(runHistory: number[]): number {
    const n = runHistory[1];
    const core =
      n > 0 &&
      runHistory[2] === n &&
      runHistory[3] === n * 3 &&
      runHistory[4] === n &&
      runHistory[5] === n;
    return (
      (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0) +
      (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0)
    );
  }

  private finderPenaltyTerminateAndCount(
    currentRunColor: boolean,
    currentRunLength: number,
    runHistory: number[],
  ): number {
    let runLength = currentRunLength;
    if (currentRunColor) {
      this.finderPenaltyAddHistory(runLength, runHistory);
      runLength = 0;
    }
    runLength += this.size;
    this.finderPenaltyAddHistory(runLength, runHistory);
    return this.finderPenaltyCountPatterns(runHistory);
  }

  private finderPenaltyAddHistory(
    currentRunLength: number,
    runHistory: number[],
  ): void {
    if (runHistory[0] === 0) currentRunLength += this.size;
    runHistory.pop();
    runHistory.unshift(currentRunLength);
  }
}

function getBit(x: number, i: number): boolean {
  return ((x >>> i) & 1) !== 0;
}
