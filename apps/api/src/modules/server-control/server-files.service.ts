import { HttpError } from "../../lib/http-error.js";
import { createTarFile, readTarFile, type TarFileMeta } from "../../lib/tar.js";

export interface ServerFile {
  text: string;
  /** Owner and mode of the file as it is on the server, kept when writing it back. */
  meta: TarFileMeta;
}

/** Reads and writes `server.properties` inside the Minecraft container. */
export interface ServerFilesService {
  readProperties(): Promise<ServerFile>;
  writeProperties(text: string, meta: TarFileMeta): Promise<void>;
}

interface Options {
  /** Base URL of the Docker Engine API (the socket proxy, which only allows these two paths for this container). */
  apiUrl: string;
  containerName: string;
  fetch?: typeof fetch;
}

const REQUEST_TIMEOUT_MS = 5_000;
const DATA_DIR = "/data";
const FILE_NAME = "server.properties";

/**
 * Goes through Docker's archive endpoint rather than a shared volume, so the API needs no access to the world files
 * and works the same from a laptop through the SSH tunnel. The path is appended unencoded: the proxy matches it literally.
 */
export function createServerFilesService({
  apiUrl,
  containerName,
  fetch: fetchImpl = fetch,
}: Options): ServerFilesService {
  const archiveUrl = (path: string) =>
    `${apiUrl.replace(/\/$/, "")}/containers/${encodeURIComponent(containerName)}/archive?path=${path}`;

  return {
    async readProperties() {
      try {
        const res = await fetchImpl(archiveUrl(`${DATA_DIR}/${FILE_NAME}`), {
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (!res.ok) throw new Error(`Docker answered ${res.status}`);
        const { content, mode, uid, gid } = readTarFile(Buffer.from(await res.arrayBuffer()));
        return { text: content.toString("utf8"), meta: { mode, uid, gid } };
      } catch {
        throw HttpError.unavailable("Could not read server.properties");
      }
    },

    async writeProperties(text, meta) {
      const archive = createTarFile({ name: FILE_NAME, content: Buffer.from(text, "utf8"), ...meta });
      try {
        const res = await fetchImpl(archiveUrl(DATA_DIR), {
          method: "PUT",
          headers: { "Content-Type": "application/x-tar" },
          body: new Uint8Array(archive),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (!res.ok) throw new Error(`Docker answered ${res.status}`);
      } catch {
        throw HttpError.unavailable("Could not write server.properties");
      }
    },
  };
}
