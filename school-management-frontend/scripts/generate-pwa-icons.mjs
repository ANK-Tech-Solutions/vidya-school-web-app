import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const outputDirectory = new URL("../public/icons/", import.meta.url);

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function createIcon(size) {
  const pixels = Buffer.alloc((size * 4 + 1) * size);
  const color = [15, 101, 112, 255];

  for (let row = 0; row < size; row += 1) {
    const offset = row * (size * 4 + 1);
    pixels[offset] = 0;
    for (let column = 0; column < size; column += 1) {
      pixels.set(color, offset + 1 + column * 4);
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(pixels)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(outputDirectory, { recursive: true });
for (const size of [192, 512]) {
  writeFileSync(new URL(`icon-${size}.png`, outputDirectory), createIcon(size));
}
