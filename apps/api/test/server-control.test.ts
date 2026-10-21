import { describe, expect, it, vi } from "vitest";
import { createDockerService, parseLogStream } from "../src/modules/server-control/docker.service.js";

function serviceWith(respond: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) =>
    respond(String(url), init),
  );
  const service = createDockerService({
    apiUrl: "http://docker-proxy:2375/",
    containerName: "minecraft",
    stopTimeoutSeconds: 30,
    fetch: fetchMock as unknown as typeof fetch,
  });
  return { service, fetchMock };
}

const inspect = (Status: string, ExitCode = 0, OOMKilled = false) =>
  Response.json({ State: { Status, ExitCode, OOMKilled } });

describe("docker server control: state", () => {
  it.each([
    ["running", 0, "active"],
    ["exited", 0, "inactive"],
    ["exited", 143, "inactive"],
    ["exited", 137, "inactive"],
    ["exited", 1, "failed"],
    ["restarting", 1, "failed"],
    ["created", 0, "inactive"],
  ])("maps %s (exit %i) to %s", async (status, exitCode, expected) => {
    const { service, fetchMock } = serviceWith(() => inspect(status, exitCode));
    expect(await service.getState()).toBe(expected);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://docker-proxy:2375/containers/minecraft/json");
  });

  it("reports an out-of-memory kill as failed", async () => {
    const { service } = serviceWith(() => inspect("exited", 137, true));
    expect(await service.getState()).toBe("failed");
  });

  it("reports unknown when Docker is unreachable or the container is missing", async () => {
    expect(await serviceWith(() => new Response(null, { status: 404 })).service.getState()).toBe("unknown");
    expect(
      await serviceWith(() => {
        throw new Error("connect ECONNREFUSED");
      }).service.getState(),
    ).toBe("unknown");
  });
});

describe("docker server control: actions", () => {
  it("starts without a timeout and stops/restarts with one", async () => {
    const { service, fetchMock } = serviceWith(() => new Response(null, { status: 204 }));
    await service.control("start");
    await service.control("stop");
    await service.control("restart");

    const calls = fetchMock.mock.calls.map(([url, init]) => [String(url), init?.method]);
    expect(calls).toEqual([
      ["http://docker-proxy:2375/containers/minecraft/start", "POST"],
      ["http://docker-proxy:2375/containers/minecraft/stop?t=30", "POST"],
      ["http://docker-proxy:2375/containers/minecraft/restart?t=30", "POST"],
    ]);
  });

  it("treats 'already in that state' (304) as success", async () => {
    const { service } = serviceWith(() => new Response(null, { status: 304 }));
    await expect(service.control("start")).resolves.toBeUndefined();
  });

  it("turns Docker errors and network failures into 503", async () => {
    const failed = serviceWith(() => new Response("boom", { status: 500 })).service;
    await expect(failed.control("restart")).rejects.toMatchObject({ status: 503 });

    const down = serviceWith(() => {
      throw new Error("connect ECONNREFUSED");
    }).service;
    await expect(down.control("stop")).rejects.toMatchObject({ status: 503 });
  });
});

/** Builds one Docker multiplexed frame (stream type 1 = stdout). */
const frame = (payload: string) => {
  const body = Buffer.from(payload);
  const header = Buffer.alloc(8);
  header[0] = 1;
  header.writeUInt32BE(body.length, 4);
  return Buffer.concat([header, body]);
};

describe("docker server control: logs", () => {
  it("demultiplexes frames into timestamped lines and strips colour codes", () => {
    const stream = Buffer.concat([
      frame("2026-10-21T10:00:00.123456789Z [Server thread/INFO]: Done\n"),
      frame("2026-10-21T10:00:01.5Z \x1b[31m[Server thread/WARN]: Careful\x1b[0m\n"),
    ]);
    expect(parseLogStream(stream)).toEqual([
      { time: "2026-10-21T10:00:00.123456789Z", text: "[Server thread/INFO]: Done" },
      { time: "2026-10-21T10:00:01.5Z", text: "[Server thread/WARN]: Careful" },
    ]);
  });

  it("reads plain text from a container with a TTY", () => {
    expect(parseLogStream(Buffer.from("2026-10-21T10:00:00Z hello\n"))).toEqual([
      { time: "2026-10-21T10:00:00Z", text: "hello" },
    ]);
  });

  it("asks for the tail first, then only for lines after the cursor", async () => {
    const stream = Buffer.concat([
      frame("2026-10-21T10:00:00.5Z old\n"),
      frame("2026-10-21T10:00:00.75Z new\n"),
    ]);
    const { service, fetchMock } = serviceWith(() => new Response(stream));

    expect((await service.getLogs()).map((l) => l.text)).toEqual(["old", "new"]);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("tail=300");

    const next = await service.getLogs("2026-10-21T10:00:00.5Z");
    expect(next.map((l) => l.text)).toEqual(["new"]);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("since=1792576800");
  });

  it("turns Docker failures into 503", async () => {
    const { service } = serviceWith(() => new Response("no", { status: 403 }));
    await expect(service.getLogs()).rejects.toMatchObject({ status: 503 });
  });
});
