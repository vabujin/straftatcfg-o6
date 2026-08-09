export type CfgConfig = {
  id: string
  name: string
  author: string
  dateAdded: string // ISO date
  description: string
  content: string // the raw .cfg body used for copy-to-clipboard
  downloadUrl?: string
}

// Seed configs shown in the hub. New submissions are added in-memory at runtime.
export const seedConfigs: CfgConfig[] = [
  {
    id: "essential",
    name: "essential.cfg",
    author: "straftat",
    dateAdded: "2026-07-28",
    description: "Clean baseline lobby settings everyone should start from.",
    content: [
      "// essential.cfg",
      'sv_lobby_name "the concrete slab"',
      "sv_max_players 12",
      "sv_gravity 800",
      'sv_welcome_msg "gm gamers"',
      "sv_friendly_fire 0",
    ].join("\n"),
  },
  {
    id: "troll_mod",
    name: "troll_mod.cfg",
    author: "goober",
    dateAdded: "2026-07-30",
    description: "Low gravity, giant heads, and chaos on spawn. Use responsibly.",
    content: [
      "// troll_mod.cfg",
      "sv_gravity 120",
      "sv_headscale 4.0",
      "sv_speed_mult 2.5",
      'bind mouse3 "play chaos.wav"',
      "sv_bunnyhop 1",
    ].join("\n"),
  },
  {
    id: "sniper_only",
    name: "sniper_only.cfg",
    author: "coldscope",
    dateAdded: "2026-08-02",
    description: "One shot, one kill. Every player forced to snipers only.",
    content: [
      "// sniper_only.cfg",
      "sv_force_weapon awp",
      "sv_infinite_ammo 0",
      "sv_movement_accuracy 1",
      "sv_max_players 8",
    ].join("\n"),
  },
  {
    id: "disco_lobby",
    name: "disco_lobby.cfg",
    author: "nightbulb",
    dateAdded: "2026-08-05",
    description: "Strobing lights and a looping track. Seizure warning, genuinely.",
    content: [
      "// disco_lobby.cfg",
      "sv_light_strobe 1",
      "sv_strobe_hz 8",
      'sv_music_loop "disco_inferno.mp3"',
      "sv_fog 0",
    ].join("\n"),
  },
  {
    id: "speedrun",
    name: "speedrun.cfg",
    author: "frametime",
    dateAdded: "2026-08-07",
    description: "Tuned for movement tech and fast rounds. Timer on screen.",
    content: [
      "// speedrun.cfg",
      "sv_bunnyhop 1",
      "sv_air_accelerate 12",
      "cl_showtimer 1",
      "sv_round_time 90",
    ].join("\n"),
  },
  {
    id: "silent_night",
    name: "silent_night.cfg",
    author: "straftat",
    dateAdded: "2026-08-08",
    description: "Footsteps off, ambient only. Great for hide and seek lobbies.",
    content: [
      "// silent_night.cfg",
      "sv_footsteps 0",
      "sv_voice_enable 0",
      'sv_ambient "wind_loop.mp3"',
      "sv_max_players 16",
    ].join("\n"),
  },
]
