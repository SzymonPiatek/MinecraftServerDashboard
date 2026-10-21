import { HIDDEN_PROPERTIES, LOCKED_PROPERTIES, type ServerProperty } from "@mcd/shared";
import { HttpError } from "../../lib/http-error.js";
import type { ServerFilesService } from "../server-control/server-files.service.js";

export interface PropertiesService {
  list(): Promise<ServerProperty[]>;
  /** Applies the changes to the existing keys and returns the keys that were rewritten. */
  update(changes: Record<string, string>): Promise<string[]>;
}

const LOCKED = new Set<string>(LOCKED_PROPERTIES);
const HIDDEN = new Set<string>(HIDDEN_PROPERTIES);

/** `key=value` lines; comments (`#`, `!`) and blank lines are not properties. */
const PROPERTY_LINE = /^([^#!=\s][^=]*?)\s*=(.*)$/;

const decode = (value: string) =>
  value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));

/** Java reads the file as Latin-1 on older versions, so anything outside ASCII is written as a \uXXXX escape. */
const encode = (value: string) =>
  [...value]
    .map((char) =>
      char.charCodeAt(0) > 126 ? `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}` : char,
    )
    .join("");

export function parseProperties(text: string): ServerProperty[] {
  return text.split(/\r?\n/).flatMap((line) => {
    const match = PROPERTY_LINE.exec(line);
    const key = match?.[1];
    if (key === undefined || HIDDEN.has(key)) return [];
    return [{ key, value: decode(match![2]!), locked: LOCKED.has(key) }];
  });
}

/** The new value must keep the type of the old one, so a typo can't turn `max-players` into text and stop the server. */
function checkValue(key: string, current: string, next: string) {
  // eslint-disable-next-line no-control-regex -- rejecting control characters is the point
  if (/[\x00-\x1f]/.test(next)) throw HttpError.badRequest(`${key}: the value must be a single line`);
  if (/^(true|false)$/.test(current) && !/^(true|false)$/.test(next)) {
    throw HttpError.badRequest(`${key}: expected true or false`);
  }
  if (/^-?\d+$/.test(current) && !/^-?\d+$/.test(next))
    throw HttpError.badRequest(`${key}: expected a whole number`);
}

export function applyChanges(
  text: string,
  changes: Record<string, string>,
): { text: string; changed: string[] } {
  const pending = new Map(Object.entries(changes));
  const changed: string[] = [];

  const lines = text.split(/(\r?\n)/).map((part) => {
    const match = PROPERTY_LINE.exec(part);
    const key = match?.[1];
    if (key === undefined || !pending.has(key)) return part;

    const next = pending.get(key)!;
    pending.delete(key);
    if (LOCKED.has(key) || HIDDEN.has(key))
      throw HttpError.badRequest(`${key} is managed by the server stack`);
    checkValue(key, decode(match![2]!), next);
    changed.push(key);
    return `${key}=${encode(next)}`;
  });

  const [unknown] = pending.keys();
  if (unknown !== undefined) throw HttpError.badRequest(`Unknown property: ${unknown}`);
  return { text: lines.join(""), changed };
}

export function createPropertiesService(files: ServerFilesService): PropertiesService {
  return {
    async list() {
      return parseProperties((await files.readProperties()).text);
    },

    async update(changes) {
      const { text, meta } = await files.readProperties();
      const result = applyChanges(text, changes);
      if (result.changed.length > 0) await files.writeProperties(result.text, meta);
      return result.changed;
    },
  };
}
