import { GAMERULE_NAMES } from "@mcd/shared";

/** One argument slot: a fixed list of values, or `"player"` for a nick (online players are offered). */
type ArgHint = readonly string[] | "player";

export interface McCommand {
  name: string;
  usage: string;
  description: string;
  /** Hints for the arguments in order; commands with free-form arguments simply omit the missing slots. */
  args?: readonly ArgHint[];
}

export interface Suggestion {
  value: string;
  detail?: string;
}

export interface Suggestions {
  /** Index in the input where the token being completed starts. */
  start: number;
  items: Suggestion[];
  /** The command the user has already typed in full, for the usage line. */
  command: McCommand | undefined;
}

const GAMEMODES = ["survival", "creative", "adventure", "spectator"] as const;

/** Java Edition server commands; usage strings follow the in-game `/help` syntax. */
export const MC_COMMANDS: readonly McCommand[] = [
  {
    name: "advancement",
    usage: "advancement <grant|revoke> <gracz> …",
    description: "osiągnięcia gracza",
    args: [["grant", "revoke"], "player"],
  },
  { name: "attribute", usage: "attribute <cel> <atrybut> …", description: "atrybuty bytów" },
  { name: "ban", usage: "ban <gracz> [powód]", description: "banuje gracza", args: ["player"] },
  { name: "ban-ip", usage: "ban-ip <adres|gracz> [powód]", description: "banuje adres IP", args: ["player"] },
  { name: "banlist", usage: "banlist [ips|players]", description: "lista banów", args: [["ips", "players"]] },
  {
    name: "bossbar",
    usage: "bossbar <add|get|list|remove|set> …",
    description: "paski bossów",
    args: [["add", "get", "list", "remove", "set"]],
  },
  { name: "clear", usage: "clear [gracz] [przedmiot]", description: "czyści ekwipunek", args: ["player"] },
  { name: "clone", usage: "clone <od> <do> <cel>", description: "kopiuje bloki" },
  { name: "damage", usage: "damage <cel> <ilość> [typ]", description: "zadaje obrażenia", args: ["player"] },
  {
    name: "data",
    usage: "data <get|merge|modify|remove> …",
    description: "dane NBT",
    args: [["get", "merge", "modify", "remove"]],
  },
  {
    name: "datapack",
    usage: "datapack <enable|disable|list> …",
    description: "paczki danych",
    args: [["enable", "disable", "list"]],
  },
  {
    name: "defaultgamemode",
    usage: "defaultgamemode <tryb>",
    description: "domyślny tryb gry",
    args: [GAMEMODES],
  },
  { name: "deop", usage: "deop <gracz>", description: "odbiera operatora", args: ["player"] },
  {
    name: "difficulty",
    usage: "difficulty [peaceful|easy|normal|hard]",
    description: "poziom trudności",
    args: [["peaceful", "easy", "normal", "hard"]],
  },
  {
    name: "effect",
    usage: "effect <give|clear> <cel> …",
    description: "efekty mikstur",
    args: [["give", "clear"], "player"],
  },
  {
    name: "enchant",
    usage: "enchant <gracz> <zaklęcie> [poziom]",
    description: "zaklina przedmiot",
    args: ["player"],
  },
  { name: "execute", usage: "execute <as|at|if|unless|run> …", description: "wykonuje komendę w kontekście" },
  {
    name: "experience",
    usage: "experience <add|set|query> <gracz> …",
    description: "doświadczenie",
    args: [["add", "set", "query"], "player"],
  },
  { name: "fill", usage: "fill <od> <do> <blok>", description: "wypełnia obszar blokami" },
  {
    name: "forceload",
    usage: "forceload <add|remove|query> …",
    description: "wymusza ładowanie chunków",
    args: [["add", "remove", "query"]],
  },
  { name: "function", usage: "function <nazwa>", description: "uruchamia funkcję" },
  {
    name: "gamemode",
    usage: "gamemode <tryb> [gracz]",
    description: "zmienia tryb gry",
    args: [GAMEMODES, "player"],
  },
  {
    name: "gamerule",
    usage: "gamerule <reguła> [wartość]",
    description: "reguły gry",
    args: [GAMERULE_NAMES, ["true", "false"]],
  },
  {
    name: "give",
    usage: "give <gracz> <przedmiot> [ilość]",
    description: "daje przedmiot",
    args: ["player"],
  },
  { name: "help", usage: "help [komenda]", description: "pomoc do komend" },
  {
    name: "item",
    usage: "item <replace|modify> …",
    description: "zmienia przedmioty w slotach",
    args: [["replace", "modify"]],
  },
  { name: "kick", usage: "kick <gracz> [powód]", description: "wyrzuca gracza", args: ["player"] },
  { name: "kill", usage: "kill [cel]", description: "zabija byty", args: ["player"] },
  { name: "list", usage: "list [uuids]", description: "gracze online", args: [["uuids"]] },
  {
    name: "locate",
    usage: "locate <structure|biome|poi> <nazwa>",
    description: "szuka struktur i biomów",
    args: [["structure", "biome", "poi"]],
  },
  { name: "loot", usage: "loot <cel> <źródło>", description: "generuje łup" },
  { name: "me", usage: "me <akcja>", description: "wiadomość w trzeciej osobie" },
  { name: "msg", usage: "msg <gracz> <wiadomość>", description: "prywatna wiadomość", args: ["player"] },
  { name: "op", usage: "op <gracz>", description: "nadaje operatora", args: ["player"] },
  { name: "pardon", usage: "pardon <gracz>", description: "zdejmuje bana", args: ["player"] },
  { name: "pardon-ip", usage: "pardon-ip <adres>", description: "zdejmuje bana na IP" },
  { name: "particle", usage: "particle <cząsteczka> [pozycja]", description: "tworzy cząsteczki" },
  {
    name: "place",
    usage: "place <feature|jigsaw|structure|template> …",
    description: "generuje struktury",
    args: [["feature", "jigsaw", "structure", "template"]],
  },
  { name: "playsound", usage: "playsound <dźwięk> <źródło> <gracz>", description: "odtwarza dźwięk" },
  {
    name: "random",
    usage: "random <value|roll|reset> …",
    description: "losowe wartości",
    args: [["value", "roll", "reset"]],
  },
  {
    name: "recipe",
    usage: "recipe <give|take> <gracz> <przepis>",
    description: "przepisy gracza",
    args: [["give", "take"], "player"],
  },
  { name: "reload", usage: "reload", description: "przeładowuje paczki danych" },
  { name: "return", usage: "return <wartość>", description: "kończy funkcję" },
  { name: "ride", usage: "ride <cel> <mount|dismount> …", description: "dosiadanie bytów", args: ["player"] },
  { name: "save-all", usage: "save-all [flush]", description: "zapisuje świat", args: [["flush"]] },
  { name: "save-off", usage: "save-off", description: "wyłącza autozapis" },
  { name: "save-on", usage: "save-on", description: "włącza autozapis" },
  { name: "say", usage: "say <wiadomość>", description: "wiadomość do wszystkich" },
  {
    name: "schedule",
    usage: "schedule <function|clear> …",
    description: "planuje funkcje",
    args: [["function", "clear"]],
  },
  {
    name: "scoreboard",
    usage: "scoreboard <objectives|players> …",
    description: "tablice wyników",
    args: [["objectives", "players"]],
  },
  { name: "seed", usage: "seed", description: "ziarno świata" },
  { name: "setblock", usage: "setblock <pozycja> <blok>", description: "ustawia blok" },
  { name: "setidletimeout", usage: "setidletimeout <minuty>", description: "limit bezczynności graczy" },
  { name: "setworldspawn", usage: "setworldspawn [pozycja]", description: "punkt spawnu świata" },
  {
    name: "spawnpoint",
    usage: "spawnpoint [gracz] [pozycja]",
    description: "punkt odrodzenia gracza",
    args: ["player"],
  },
  { name: "spectate", usage: "spectate [cel] [gracz]", description: "obserwowanie bytów", args: ["player"] },
  {
    name: "spreadplayers",
    usage: "spreadplayers <x> <z> <odstęp> <zasięg> …",
    description: "rozrzuca graczy",
  },
  { name: "stop", usage: "stop", description: "zatrzymuje serwer" },
  {
    name: "stopsound",
    usage: "stopsound <gracz> [źródło]",
    description: "zatrzymuje dźwięki",
    args: ["player"],
  },
  { name: "summon", usage: "summon <byt> [pozycja]", description: "przywołuje byt" },
  {
    name: "tag",
    usage: "tag <cel> <add|remove|list> …",
    description: "tagi bytów",
    args: ["player", ["add", "remove", "list"]],
  },
  {
    name: "team",
    usage: "team <add|remove|join|leave|list|modify|empty> …",
    description: "drużyny",
    args: [["add", "empty", "join", "leave", "list", "modify", "remove"]],
  },
  {
    name: "teleport",
    usage: "teleport <cel> <pozycja|cel>",
    description: "teleportuje",
    args: ["player", "player"],
  },
  { name: "tell", usage: "tell <gracz> <wiadomość>", description: "prywatna wiadomość", args: ["player"] },
  { name: "tellraw", usage: "tellraw <gracz> <json>", description: "wiadomość w JSON", args: ["player"] },
  {
    name: "time",
    usage: "time <set|add|query> <wartość>",
    description: "czas w świecie",
    args: [
      ["set", "add", "query"],
      ["day", "noon", "night", "midnight"],
    ],
  },
  {
    name: "title",
    usage: "title <gracz> <title|subtitle|actionbar|clear|reset|times> …",
    description: "napisy na ekranie",
    args: ["player", ["title", "subtitle", "actionbar", "clear", "reset", "times"]],
  },
  { name: "tp", usage: "tp <cel> <pozycja|cel>", description: "teleportuje", args: ["player", "player"] },
  {
    name: "trigger",
    usage: "trigger <cel> [add|set] [wartość]",
    description: "uruchamia trigger scoreboardu",
  },
  { name: "w", usage: "w <gracz> <wiadomość>", description: "prywatna wiadomość", args: ["player"] },
  {
    name: "weather",
    usage: "weather <clear|rain|thunder> [sekundy]",
    description: "pogoda",
    args: [["clear", "rain", "thunder"]],
  },
  {
    name: "whitelist",
    usage: "whitelist <add|remove|list|on|off|reload> [gracz]",
    description: "biała lista",
    args: [["add", "remove", "list", "on", "off", "reload"], "player"],
  },
  {
    name: "worldborder",
    usage: "worldborder <add|center|damage|get|set|warning> …",
    description: "granica świata",
    args: [["add", "center", "damage", "get", "set", "warning"]],
  },
  {
    name: "xp",
    usage: "xp <add|set|query> <gracz> …",
    description: "doświadczenie",
    args: [["add", "set", "query"], "player"],
  },
];

const MAX_SUGGESTIONS = 8;

/** Works out what to offer for the token the cursor is on (the last one of `input`). */
export function getSuggestions(input: string, players: readonly string[]): Suggestions {
  const tokens = input.split(" ");
  const current = tokens[tokens.length - 1];
  const start = input.length - current.length;
  const prefix = current.toLowerCase();
  const matches = (value: string) => value.toLowerCase().startsWith(prefix) && value !== current;

  if (tokens.length === 1) {
    const items = MC_COMMANDS.filter((c) => matches(c.name))
      .slice(0, MAX_SUGGESTIONS)
      .map((c) => ({ value: c.name, detail: c.description }));
    return { start, items, command: MC_COMMANDS.find((c) => c.name === current) };
  }

  const command = MC_COMMANDS.find((c) => c.name === tokens[0].toLowerCase());
  const hint = command?.args?.[tokens.length - 2];
  const options = hint === "player" ? players : (hint ?? []);
  const items = options
    .filter(matches)
    .slice(0, MAX_SUGGESTIONS)
    .map((value) => ({ value }));
  return { start, items, command };
}
