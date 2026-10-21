/** Just enough of the tar format to move one file through Docker's `/containers/{id}/archive` endpoint. */

const BLOCK = 512;

export interface TarFileMeta {
  mode: number;
  uid: number;
  gid: number;
}

export interface TarFile extends TarFileMeta {
  name: string;
  content: Buffer;
}

const readString = (header: Buffer, start: number, length: number) =>
  header.toString("latin1", start, start + length).replace(/\0.*$/s, "");

const readOctal = (header: Buffer, start: number, length: number) =>
  parseInt(readString(header, start, length).trim() || "0", 8);

/** Returns the first regular file of the archive (extended PAX headers are skipped). */
export function readTarFile(archive: Buffer): TarFile {
  let offset = 0;
  while (offset + BLOCK <= archive.length) {
    const header = archive.subarray(offset, offset + BLOCK);
    if (header.every((byte) => byte === 0)) break;

    const size = readOctal(header, 124, 12);
    const type = String.fromCharCode(header[156] ?? 0);
    const body = offset + BLOCK;
    if (type === "0" || type === "\0") {
      return {
        name: readString(header, 0, 100),
        mode: readOctal(header, 100, 8),
        uid: readOctal(header, 108, 8),
        gid: readOctal(header, 116, 8),
        content: Buffer.from(archive.subarray(body, body + size)),
      };
    }
    offset = body + Math.ceil(size / BLOCK) * BLOCK;
  }
  throw new Error("No file in the archive");
}

export function createTarFile({ name, content, mode, uid, gid }: TarFile): Buffer {
  const header = Buffer.alloc(BLOCK);
  const writeOctal = (value: number, start: number, length: number) =>
    header.write(`${value.toString(8).padStart(length - 1, "0")}\0`, start, "latin1");

  header.write(name, 0, 100, "utf8");
  writeOctal(mode, 100, 8);
  writeOctal(uid, 108, 8);
  writeOctal(gid, 116, 8);
  writeOctal(content.length, 124, 12);
  writeOctal(Math.floor(Date.now() / 1000), 136, 12);
  header.fill(" ", 148, 156); // the checksum is computed with this field read as spaces
  header.write("0", 156, "latin1");
  header.write("ustar\0" + "00", 257, "latin1");

  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  header.write(`${checksum.toString(8).padStart(6, "0")}\0 `, 148, "latin1");

  const padding = Buffer.alloc((BLOCK - (content.length % BLOCK)) % BLOCK);
  return Buffer.concat([header, content, padding, Buffer.alloc(BLOCK * 2)]);
}
