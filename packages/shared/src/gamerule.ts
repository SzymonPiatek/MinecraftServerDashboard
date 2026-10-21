import { z } from "zod";

/**
 * Gamerules known to the Java server this dashboard manages (snake_case names, Minecraft 1.21.11+).
 * `help gamerule` over RCON is cut off at 4096 bytes and lists only part of them, so the API merges this list
 * with whatever the server reports; names a server does not know are simply skipped.
 */
export const GAMERULE_NAMES = [
  "advance_time",
  "advance_weather",
  "allow_entering_nether_using_portals",
  "block_drops",
  "block_explosion_drop_decay",
  "command_block_output",
  "command_blocks_work",
  "drowning_damage",
  "elytra_movement_check",
  "ender_pearls_vanish_on_death",
  "entity_drops",
  "fall_damage",
  "fire_damage",
  "fire_spread_radius_around_player",
  "forgive_dead_players",
  "freeze_damage",
  "global_sound_events",
  "immediate_respawn",
  "keep_inventory",
  "lava_source_conversion",
  "limited_crafting",
  "locator_bar",
  "log_admin_commands",
  "max_block_modifications",
  "max_command_forks",
  "max_command_sequence_length",
  "max_entity_cramming",
  "max_snow_accumulation_height",
  "mob_drops",
  "mob_explosion_drop_decay",
  "mob_griefing",
  "natural_health_regeneration",
  "player_movement_check",
  "players_nether_portal_creative_delay",
  "players_nether_portal_default_delay",
  "players_sleeping_percentage",
  "projectiles_can_break_blocks",
  "pvp",
  "raids",
  "random_tick_speed",
  "reduced_debug_info",
  "respawn_radius",
  "send_command_feedback",
  "show_advancement_messages",
  "show_death_messages",
  "spawn_mobs",
  "spawn_monsters",
  "spawn_patrols",
  "spawn_phantoms",
  "spawn_wandering_traders",
  "spawn_wardens",
  "spawner_blocks_work",
  "spectators_generate_chunks",
  "spread_vines",
  "tnt_explodes",
  "tnt_explosion_drop_decay",
  "universal_anger",
  "water_source_conversion",
] as const;

export const gameruleSchema = z.object({
  name: z.string(),
  /** Booleans for on/off rules, integers for numeric ones. */
  value: z.union([z.boolean(), z.number()]),
});
export type Gamerule = z.infer<typeof gameruleSchema>;

export const gameruleNameSchema = z.string().regex(/^[a-z_]{1,64}$/, "Invalid gamerule name");

export const gameruleBodySchema = z.object({
  value: z.union([z.boolean(), z.number().int()]),
});
export type GameruleBody = z.infer<typeof gameruleBodySchema>;
