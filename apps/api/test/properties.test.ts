import { describe, expect, it, vi } from "vitest";
import { createTarFile, readTarFile } from "../src/lib/tar.js";
import { applyChanges, parseProperties } from "../src/modules/admin/properties.service.js";
import { createServerFilesService } from "../src/modules/server-control/server-files.service.js";

const FILE = [
  "#Minecraft server properties",
  "#Wed Oct 21 10:00:00 UTC 2026",
  "motd=A \\u00A7aserver",
  "max-players=20",
  "pvp=true",
  "rcon.password=hunter2",
  "server-port=25565",
  "",
].join("\n");

describe("tar", () => {
  it("round-trips a file with its owner and mode", () => {
    const archive = createTarFile({
      name: "server.properties",
      content: Buffer.from("a=b\n"),
      mode: 0o644,
      uid: 1000,
      gid: 1000,
    });
    expect(archive.length % 512).toBe(0);
    expect(readTarFile(archive)).toMatchObject({
      name: "server.properties",
      mode: 0o644,
      uid: 1000,
      gid: 1000,
    });
    expect(readTarFile(archive).content.toString()).toBe("a=b\n");
  });

  it("skips PAX headers and rejects an empty archive", () => {
    expect(() => readTarFile(Buffer.alloc(1024))).toThrow();
  });
});

describe("parseProperties", () => {
  it("lists properties, decodes escapes, flags locked ones and never exposes the RCON password", () => {
    const props = parseProperties(FILE);
    expect(props).toEqual([
      { key: "motd", value: "A §aserver", locked: false },
      { key: "max-players", value: "20", locked: false },
      { key: "pvp", value: "true", locked: false },
      { key: "server-port", value: "25565", locked: true },
    ]);
  });
});

describe("applyChanges", () => {
  it("rewrites only the changed lines and escapes non-ASCII characters", () => {
    const { text, changed } = applyChanges(FILE, { "max-players": "30", motd: "Cześć" });
    expect(changed).toEqual(["motd", "max-players"]);
    expect(text).toBe(
      FILE.replace("max-players=20", "max-players=30").replace("A \\u00A7aserver", "Cze\\u015b\\u0107"),
    );
  });

  it("keeps CRLF line endings", () => {
    expect(applyChanges("pvp=true\r\nmax-players=20\r\n", { pvp: "false" }).text).toBe(
      "pvp=false\r\nmax-players=20\r\n",
    );
  });

  it("refuses unknown, locked and hidden keys and type changes", () => {
    expect(() => applyChanges(FILE, { nope: "1" })).toThrow(/Unknown property/);
    expect(() => applyChanges(FILE, { "server-port": "1" })).toThrow(/managed/);
    expect(() => applyChanges(FILE, { "rcon.password": "x" })).toThrow(/managed/);
    expect(() => applyChanges(FILE, { "max-players": "many" })).toThrow(/whole number/);
    expect(() => applyChanges(FILE, { pvp: "maybe" })).toThrow(/true or false/);
    expect(() => applyChanges(FILE, { motd: "a\nb" })).toThrow(/single line/);
  });
});

describe("server files via the Docker archive endpoint", () => {
  const service = (respond: (url: string, init?: RequestInit) => Response) => {
    const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) =>
      respond(String(url), init),
    );
    return {
      files: createServerFilesService({
        apiUrl: "http://docker-proxy:2375/",
        containerName: "minecraft",
        fetch: fetchMock as unknown as typeof fetch,
      }),
      fetchMock,
    };
  };

  it("reads the file and keeps its owner", async () => {
    const tar = createTarFile({
      name: "server.properties",
      content: Buffer.from(FILE),
      mode: 0o600,
      uid: 1000,
      gid: 1000,
    });
    const { files, fetchMock } = service(() => new Response(new Uint8Array(tar)));
    expect(await files.readProperties()).toEqual({ text: FILE, meta: { mode: 0o600, uid: 1000, gid: 1000 } });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "http://docker-proxy:2375/containers/minecraft/archive?path=/data/server.properties",
    );
  });

  it("writes a tar into /data", async () => {
    const { files, fetchMock } = service(() => new Response(null, { status: 200 }));
    await files.writeProperties("pvp=false\n", { mode: 0o644, uid: 1000, gid: 1000 });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe("http://docker-proxy:2375/containers/minecraft/archive?path=/data");
    expect(init?.method).toBe("PUT");
    expect(readTarFile(Buffer.from(init?.body as Uint8Array)).content.toString()).toBe("pvp=false\n");
  });

  it("turns Docker failures into 503", async () => {
    const { files } = service(() => new Response("no", { status: 403 }));
    await expect(files.readProperties()).rejects.toMatchObject({ status: 503 });
    await expect(files.writeProperties("x", { mode: 0, uid: 0, gid: 0 })).rejects.toMatchObject({
      status: 503,
    });
  });
});
