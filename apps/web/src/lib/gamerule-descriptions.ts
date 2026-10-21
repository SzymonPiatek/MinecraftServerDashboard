import type { GAMERULE_NAMES } from "@mcd/shared";

/** Polish explanations shown in the gamerule list; keyed by the full known set, so a new rule fails the type check. */
export const GAMERULE_DESCRIPTIONS: Record<(typeof GAMERULE_NAMES)[number], string> = {
  advance_time: "Czy czas w świecie płynie, czyli czy zmieniają się dzień i noc.",
  advance_weather: "Czy pogoda zmienia się samoczynnie (deszcz, burze).",
  allow_entering_nether_using_portals: "Czy gracze mogą wchodzić do Netheru przez portale.",
  block_drops: "Czy zniszczone bloki wyrzucają przedmioty.",
  block_explosion_drop_decay:
    "Czy w eksplozjach bloków (np. łóżka w Netherze) część zniszczonych bloków nie wyrzuca przedmiotów.",
  command_block_output: "Czy bloki komend pokazują wynik swoich komend na czacie administratorów.",
  command_blocks_work: "Czy bloki komend w ogóle działają.",
  drowning_damage: "Czy gracze otrzymują obrażenia od utonięcia.",
  elytra_movement_check:
    "Czy serwer sprawdza prędkość lotu na elytrach; wyłączenie ogranicza fałszywe cofnięcia gracza.",
  ender_pearls_vanish_on_death: "Czy rzucone perły Endu znikają, gdy zginie ich właściciel.",
  entity_drops:
    "Czy byty niebędące mobami (wagoniki, łódki, stojaki na zbroję) wyrzucają przedmioty po zniszczeniu.",
  fall_damage: "Czy gracze i moby otrzymują obrażenia od upadku.",
  fire_damage: "Czy byty otrzymują obrażenia od ognia i lawy.",
  fire_spread_radius_around_player:
    "Promień wokół gracza, w którym ogień może się rozprzestrzeniać; dalej ogień nie przechodzi na kolejne bloki.",
  forgive_dead_players: "Czy rozzłoszczone neutralne moby uspokajają się, gdy ich cel (gracz) zginie.",
  freeze_damage: "Czy byty otrzymują obrażenia od zamarzania, np. w zaspie śniegu.",
  global_sound_events: "Czy niektóre dźwięki (np. pojawienie się bossa) słychać w całym świecie.",
  immediate_respawn: "Czy gracze odradzają się od razu, bez ekranu śmierci.",
  keep_inventory: "Czy gracz zachowuje ekwipunek i doświadczenie po śmierci.",
  lava_source_conversion: "Czy lawa zamienia się w źródło, gdy z dwóch stron sąsiaduje ze źródłami lawy.",
  limited_crafting: "Czy gracze mogą wytwarzać tylko te przedmioty, których przepisy odblokowali.",
  locator_bar: "Czy na ekranie widać pasek lokalizatora z pozycjami innych graczy.",
  log_admin_commands: "Czy komendy administratorów trafiają do logów serwera.",
  max_block_modifications:
    "Maksymalna liczba bloków, które jedna komenda (np. fill, clone) może zmienić naraz.",
  max_command_forks: "Maksymalna liczba rozgałęzień jednej komendy, np. execute.",
  max_command_sequence_length:
    "Maksymalna długość łańcucha komend wykonywanych naraz (bloki komend, funkcje).",
  max_entity_cramming:
    "Maksymalna liczba bytów w jednym miejscu; po jej przekroczeniu zaczynają dostawać obrażenia (0 = wyłączone).",
  max_snow_accumulation_height: "Maksymalna liczba warstw śniegu, które gromadzą się podczas opadów.",
  mob_drops: "Czy moby wyrzucają przedmioty po śmierci.",
  mob_explosion_drop_decay:
    "Czy w eksplozjach mobów (np. creeperów) część zniszczonych bloków nie wyrzuca przedmiotów.",
  mob_griefing: "Czy moby mogą niszczyć bloki i zmieniać świat (creepery, endermani, zombie łamiące drzwi).",
  natural_health_regeneration: "Czy gracze regenerują zdrowie naturalnie, gdy mają pełny pasek głodu.",
  player_movement_check:
    "Czy serwer sprawdza, czy gracze nie poruszają się zbyt szybko; wyłączenie ogranicza fałszywe cofnięcia.",
  players_nether_portal_creative_delay:
    "Czas (w tikach) stania w portalu do Netheru, zanim w trybie kreatywnym nastąpi teleportacja.",
  players_nether_portal_default_delay:
    "Czas (w tikach) stania w portalu do Netheru w pozostałych trybach; 20 tików to sekunda.",
  players_sleeping_percentage: "Jaki procent graczy musi spać, by pominąć noc (100 = wszyscy).",
  projectiles_can_break_blocks: "Czy pociski (strzały, trójzęby, kule ognia) mogą niszczyć niektóre bloki.",
  pvp: "Czy gracze mogą się nawzajem atakować.",
  raids: "Czy napady na wioski mogą się rozpoczynać.",
  random_tick_speed: "Jak szybko rosną rośliny i zachodzą losowe zmiany bloków (domyślnie 3).",
  reduced_debug_info:
    "Czy ekran debugowania (F3) pokazuje tylko ograniczone informacje, np. bez współrzędnych.",
  respawn_radius: "Promień (w blokach) wokół punktu odrodzenia, w którym pojawia się gracz.",
  send_command_feedback: "Czy gracze widzą na czacie wynik wykonanych komend.",
  show_advancement_messages: "Czy na czacie pojawiają się komunikaty o zdobytych osiągnięciach.",
  show_death_messages: "Czy na czacie pojawiają się komunikaty o śmierci graczy.",
  spawn_mobs: "Czy moby pojawiają się naturalnie w świecie.",
  spawn_monsters: "Czy pojawiają się wrogie moby (potwory).",
  spawn_patrols: "Czy pojawiają się patrole rabusiów.",
  spawn_phantoms: "Czy w nocy pojawiają się fantomy przy graczach, którzy długo nie spali.",
  spawn_wandering_traders: "Czy pojawiają się wędrowni handlarze.",
  spawn_wardens: "Czy sculk shrieker może przywołać strażnika (warden).",
  spawner_blocks_work: "Czy spawnery przywołują moby.",
  spectators_generate_chunks: "Czy gracze w trybie obserwatora generują nowe fragmenty świata.",
  spread_vines: "Czy pnącza rozrastają się.",
  tnt_explodes: "Czy dynamit (TNT) może wybuchać.",
  tnt_explosion_drop_decay: "Czy w eksplozjach TNT część zniszczonych bloków nie wyrzuca przedmiotów.",
  universal_anger:
    "Czy rozzłoszczone neutralne moby atakują każdego pobliskiego gracza, a nie tylko tego, który je rozzłościł.",
  water_source_conversion: "Czy woda zamienia się w źródło, gdy z dwóch stron sąsiaduje ze źródłami wody.",
};

/** Rules the server reports that are not in the known list get no description. */
export const describeGamerule = (name: string): string | undefined =>
  (GAMERULE_DESCRIPTIONS as Record<string, string | undefined>)[name];
