const BLOCK_SIZE = 8;
const MAX_BLOCKS = 8192;
const COEFFICIENT_MARGIN = 18;
const MAGIC = [0x49, 0x41];
const VERSION = 1;
const PAYLOAD_BYTES = 17;
const PAYLOAD_BITS = PAYLOAD_BYTES * 8;

const coefficientA = 2 * BLOCK_SIZE + 3;
const coefficientB = 3 * BLOCK_SIZE + 2;

type AssetMarkPayload = {
  assetId: string;
  bits: number[];
  ownerHash: number;
};

const dctBasis = Array.from({ length: BLOCK_SIZE }, (_, frequency) => {
  const scale = frequency === 0 ? Math.sqrt(1 / BLOCK_SIZE) : Math.sqrt(2 / BLOCK_SIZE);
  return Array.from({ length: BLOCK_SIZE }, (_, sample) =>
    scale * Math.cos(((2 * sample + 1) * frequency * Math.PI) / (2 * BLOCK_SIZE)));
});

function getOwnerHash(ownerId?: string): number {
  const normalized = ownerId?.trim().toLowerCase() ?? '';
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function crc16(bytes: Uint8Array): number {
  let crc = 0xffff;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000) !== 0
        ? ((crc << 1) ^ 0x1021) & 0xffff
        : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

function bytesToBits(bytes: Uint8Array): number[] {
  const bits: number[] = [];
  for (const byte of bytes) {
    for (let bit = 7; bit >= 0; bit--) {
      bits.push((byte >> bit) & 1);
    }
  }
  return bits;
}

function bitsToBytes(bits: number[]): Uint8Array {
  const bytes = new Uint8Array(Math.ceil(bits.length / 8));
  for (let i = 0; i < bits.length; i++) {
    bytes[Math.floor(i / 8)] |= bits[i] << (7 - (i % 8));
  }
  return bytes;
}

function assetIdToHex(bytes: Uint8Array): string {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function createAssetBytes(): Uint8Array {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return bytes;
}

function writeUint32(bytes: Uint8Array, offset: number, value: number) {
  bytes[offset] = (value >>> 24) & 0xff;
  bytes[offset + 1] = (value >>> 16) & 0xff;
  bytes[offset + 2] = (value >>> 8) & 0xff;
  bytes[offset + 3] = value & 0xff;
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] * 0x1000000
    + (bytes[offset + 1] << 16)
    + (bytes[offset + 2] << 8)
    + bytes[offset + 3]
  ) >>> 0;
}

function createPayload(ownerId?: string): AssetMarkPayload {
  const ownerHash = getOwnerHash(ownerId);
  const assetBytes = createAssetBytes();
  const payload = new Uint8Array(PAYLOAD_BYTES);

  payload.set(MAGIC, 0);
  payload[2] = VERSION;
  writeUint32(payload, 3, ownerHash);
  payload.set(assetBytes, 7);

  const checksum = crc16(payload.subarray(0, PAYLOAD_BYTES - 2));
  payload[PAYLOAD_BYTES - 2] = checksum >>> 8;
  payload[PAYLOAD_BYTES - 1] = checksum & 0xff;

  return {
    assetId: assetIdToHex(assetBytes),
    bits: bytesToBits(payload),
    ownerHash,
  };
}

function gcd(left: number, right: number): number {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

function getBlockSequence(totalBlocks: number, ownerHash: number): { start: number; step: number } {
  const start = totalBlocks === 0 ? 0 : ownerHash % totalBlocks;
  let step = totalBlocks <= 1 ? 1 : ((ownerHash >>> 1) % (totalBlocks - 1)) + 1;
  while (gcd(step, totalBlocks) !== 1) {
    step++;
    if (step >= totalBlocks) {
      step = 1;
    }
  }
  return { start, step };
}

function getBlockCount(width: number, height: number): { columns: number; rows: number; total: number } {
  const columns = Math.floor(width / BLOCK_SIZE);
  const rows = Math.floor(height / BLOCK_SIZE);
  return { columns, rows, total: columns * rows };
}

function getBlocksToUse(totalBlocks: number): number {
  return Math.min(totalBlocks, Math.max(PAYLOAD_BITS * 8, Math.min(MAX_BLOCKS, totalBlocks)));
}

function getLuma(data: Uint8ClampedArray, pixelOffset: number): number {
  return (
    data[pixelOffset] * 0.299
    + data[pixelOffset + 1] * 0.587
    + data[pixelOffset + 2] * 0.114
  ) - 128;
}

function readLumaBlock(data: Uint8ClampedArray, imageWidth: number, x: number, y: number): Float64Array {
  const block = new Float64Array(BLOCK_SIZE * BLOCK_SIZE);
  for (let blockY = 0; blockY < BLOCK_SIZE; blockY++) {
    for (let blockX = 0; blockX < BLOCK_SIZE; blockX++) {
      const pixelOffset = ((y + blockY) * imageWidth + x + blockX) * 4;
      block[blockY * BLOCK_SIZE + blockX] = getLuma(data, pixelOffset);
    }
  }
  return block;
}

function transformBlock(block: Float64Array): Float64Array {
  const transformed = new Float64Array(BLOCK_SIZE * BLOCK_SIZE);
  for (let v = 0; v < BLOCK_SIZE; v++) {
    for (let u = 0; u < BLOCK_SIZE; u++) {
      let sum = 0;
      for (let y = 0; y < BLOCK_SIZE; y++) {
        for (let x = 0; x < BLOCK_SIZE; x++) {
          sum += block[y * BLOCK_SIZE + x] * dctBasis[u][x] * dctBasis[v][y];
        }
      }
      transformed[v * BLOCK_SIZE + u] = sum;
    }
  }
  return transformed;
}

function inverseTransformBlock(transformed: Float64Array): Float64Array {
  const block = new Float64Array(BLOCK_SIZE * BLOCK_SIZE);
  for (let y = 0; y < BLOCK_SIZE; y++) {
    for (let x = 0; x < BLOCK_SIZE; x++) {
      let sum = 0;
      for (let v = 0; v < BLOCK_SIZE; v++) {
        for (let u = 0; u < BLOCK_SIZE; u++) {
          sum += transformed[v * BLOCK_SIZE + u] * dctBasis[u][x] * dctBasis[v][y];
        }
      }
      block[y * BLOCK_SIZE + x] = sum;
    }
  }
  return block;
}

function clampChannel(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function writeLumaBlock(
  data: Uint8ClampedArray,
  imageWidth: number,
  x: number,
  y: number,
  source: Float64Array,
  marked: Float64Array,
) {
  for (let blockY = 0; blockY < BLOCK_SIZE; blockY++) {
    for (let blockX = 0; blockX < BLOCK_SIZE; blockX++) {
      const blockOffset = blockY * BLOCK_SIZE + blockX;
      const delta = marked[blockOffset] - source[blockOffset];
      const pixelOffset = ((y + blockY) * imageWidth + x + blockX) * 4;
      data[pixelOffset] = clampChannel(data[pixelOffset] + delta);
      data[pixelOffset + 1] = clampChannel(data[pixelOffset + 1] + delta);
      data[pixelOffset + 2] = clampChannel(data[pixelOffset + 2] + delta);
    }
  }
}

function embedBit(transformed: Float64Array, bit: number) {
  const average = (transformed[coefficientA] + transformed[coefficientB]) / 2;
  const direction = bit === 1 ? 1 : -1;
  transformed[coefficientA] = average + direction * COEFFICIENT_MARGIN / 2;
  transformed[coefficientB] = average - direction * COEFFICIENT_MARGIN / 2;
}

function readBit(transformed: Float64Array): number {
  return transformed[coefficientA] >= transformed[coefficientB] ? 1 : 0;
}

function visitBlocks(
  imageWidth: number,
  columns: number,
  totalBlocks: number,
  ownerHash: number,
  callback: (x: number, y: number, index: number) => void,
) {
  const blocksToUse = getBlocksToUse(totalBlocks);
  const { start, step } = getBlockSequence(totalBlocks, ownerHash);
  for (let i = 0; i < blocksToUse; i++) {
    const blockIndex = (start + i * step) % totalBlocks;
    const x = (blockIndex % columns) * BLOCK_SIZE;
    const y = Math.floor(blockIndex / columns) * BLOCK_SIZE;
    if (x + BLOCK_SIZE <= imageWidth) {
      callback(x, y, i);
    }
  }
}

export function embedInvisibleAssetMark(canvas: HTMLCanvasElement, ownerId?: string): string | undefined {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return undefined;
  }

  const blocks = getBlockCount(canvas.width, canvas.height);
  if (blocks.total === 0) {
    return undefined;
  }

  const payload = createPayload(ownerId);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);

  visitBlocks(canvas.width, blocks.columns, blocks.total, payload.ownerHash, (x, y, index) => {
    const source = readLumaBlock(image.data, canvas.width, x, y);
    const transformed = transformBlock(source);
    embedBit(transformed, payload.bits[index % payload.bits.length]);
    const marked = inverseTransformBlock(transformed);
    writeLumaBlock(image.data, canvas.width, x, y, source, marked);
  });

  context.putImageData(image, 0, 0);
  return payload.assetId;
}

export function extractInvisibleAssetMark(canvas: HTMLCanvasElement, ownerId?: string): string | undefined {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return undefined;
  }

  const blocks = getBlockCount(canvas.width, canvas.height);
  if (blocks.total === 0) {
    return undefined;
  }

  const ownerHash = getOwnerHash(ownerId);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const votes = Array.from({ length: PAYLOAD_BITS }, () => 0);
  const totals = Array.from({ length: PAYLOAD_BITS }, () => 0);

  visitBlocks(canvas.width, blocks.columns, blocks.total, ownerHash, (x, y, index) => {
    const transformed = transformBlock(readLumaBlock(image.data, canvas.width, x, y));
    const payloadIndex = index % PAYLOAD_BITS;
    votes[payloadIndex] += readBit(transformed);
    totals[payloadIndex]++;
  });

  const payload = bitsToBytes(votes.map((vote, index) => vote * 2 >= totals[index] ? 1 : 0));
  if (
    payload[0] !== MAGIC[0]
    || payload[1] !== MAGIC[1]
    || payload[2] !== VERSION
    || readUint32(payload, 3) !== ownerHash
  ) {
    return undefined;
  }

  const checksum = (payload[PAYLOAD_BYTES - 2] << 8) | payload[PAYLOAD_BYTES - 1];
  if (crc16(payload.subarray(0, PAYLOAD_BYTES - 2)) !== checksum) {
    return undefined;
  }

  return assetIdToHex(payload.subarray(7, 15));
}
