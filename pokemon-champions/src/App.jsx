import spr_incineroar  from "./assets/sprites/incineroar.png";
import spr_farigiraf   from "./assets/sprites/farigiraf.png";
import spr_torkoal     from "./assets/sprites/torkoal.png";
import spr_ursaluna    from "./assets/sprites/ursaluna.png";
import spr_gardevoir   from "./assets/sprites/gardevoir.png";
import spr_sinistcha   from "./assets/sprites/sinistcha.png";
import spr_gengar      from "./assets/sprites/gengar.png";
import spr_pelipper    from "./assets/sprites/pelipper.png";
import spr_archaludon  from "./assets/sprites/archaludon.png";
import spr_dragonite   from "./assets/sprites/dragonite.png";
import spr_feraligatr  from "./assets/sprites/feraligatr.png";
import spr_arcanine    from "./assets/sprites/arcanine.png";
import spr_meowscarada from "./assets/sprites/meowscarada.png";
import spr_clefable    from "./assets/sprites/clefable.png";
import spr_corviknight from "./assets/sprites/corviknight.png";
import spr_charizard   from "./assets/sprites/charizard.png";
import spr_whimsicott  from "./assets/sprites/whimsicott.png";
import spr_excadrill   from "./assets/sprites/excadrill.png";
import spr_tyranitar   from "./assets/sprites/tyranitar.png";
import spr_primarina   from "./assets/sprites/primarina.png";

import { useState, useEffect } from "react";

const POWER_ITEMS = { HP: "Power Weight", Atk: "Power Bracer", Def: "Power Belt", SpA: "Power Lens", SpD: "Power Band", Spe: "Power Anklet" };
const VITAMINS = { HP: "HP Up", Atk: "Protein", Def: "Iron", SpA: "Calcium", SpD: "Zinc", Spe: "Carbos" };
const JOB_DURATIONS = [24, 12, 8, 6, 4, 3, 2, 1];

function calcPokejobPlan(targetEVs, stat) {
  if (!targetEVs || targetEVs <= 0) return null;
  const powerItem = POWER_ITEMS[stat];
  const vitamin = VITAMINS[stat];
  if (targetEVs <= 2) return { steps: [`Win ${targetEVs} battle(s) vs. a wild Pokémon that gives ${stat} EVs`] };
  if (targetEVs === 252) return { steps: [`24-hr Poké Job holding ${powerItem}`, `Yields 288 EVs — auto-capped at 252 ✓`] };
  function getSessions(remaining) {
    let sessions = [], r = remaining, loops = 0;
    while (r > 0 && loops++ < 25) {
      let done = false;
      for (const d of JOB_DURATIONS) { if (d * 4 === r) { sessions.push({ hours: d, item: null, evs: d * 4 }); r = 0; done = true; break; } }
      if (done) break;
      let used = false;
      for (const d of JOB_DURATIONS) { if (d * 12 <= r) { sessions.push({ hours: d, item: powerItem, evs: d * 12 }); r -= d * 12; used = true; break; } }
      if (!used) { for (const d of JOB_DURATIONS) { if (d * 4 <= r) { sessions.push({ hours: d, item: null, evs: d * 4 }); r -= d * 4; used = true; break; } } }
      if (!used) return null;
    }
    return r === 0 ? sessions : null;
  }
  let best = null;
  for (let v = 10; v >= 0; v--) {
    const after = targetEVs - v * 10; if (after < 0) continue;
    const sessions = getSessions(after); if (!sessions) continue;
    const steps = (v > 0 ? 1 : 0) + sessions.length;
    if (!best || steps < best.steps) best = { v, sessions, steps };
  }
  if (!best) return { steps: ["Use an EV calculator for this spread"] };
  const steps = [];
  if (best.v > 0) steps.push(`${best.v}× ${vitamin} → ${best.v * 10} EVs instantly`);
  for (const s of best.sessions) steps.push(s.item ? `${s.hours}-hr Poké Job holding ${s.item} (+${s.evs} EVs)` : `${s.hours}-hr Poké Job, no item (+${s.evs} EVs)`);
  return { steps };
}

function parseEVs(str) {
  const r = { HP: 0, Atk: 0, Def: 0, SpA: 0, SpD: 0, Spe: 0 };
  if (!str) return r;
  for (const p of str.split("/")) { const m = p.trim().match(/(\d+)\s+(\w+)/); if (m && m[2] in r) r[m[2]] = parseInt(m[1]); }
  return r;
}

const STAT_ORDER = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];
const STAT_LABELS = { HP: "HP", Atk: "Atk", Def: "Def", SpA: "Sp.Atk", SpD: "Sp.Def", Spe: "Speed" };
const BASE_KEYS = ["caught", "item", "nature", "ability", "tera", "move1", "move2", "move3", "move4"];
function getPokemonKeys(p) {
  const evs = parseEVs(p.evs);
  return [...BASE_KEYS, ...STAT_ORDER.filter(s => evs[s] > 0).map(s => `ev_${s}`)];
}

const SPRITE_IDS = { incineroar: 727, farigiraf: 981, torkoal: 324, ursaluna: 901, gardevoir: 282, sinistcha: 1012, gengar: 94, pelipper: 279, archaludon: 1018, dragonite: 149, feraligatr: 160, arcanine: 59, meowscarada: 908, clefable: 36, corviknight: 823, charizard: 6, whimsicott: 547, excadrill: 530, tyranitar: 248, primarina: 730 };
const LOCAL_SPRITES = {
  incineroar: spr_incineroar, farigiraf: spr_farigiraf,
  torkoal: spr_torkoal, ursaluna: spr_ursaluna,
  gardevoir: spr_gardevoir, sinistcha: spr_sinistcha,
  gengar: spr_gengar, pelipper: spr_pelipper,
  archaludon: spr_archaludon, dragonite: spr_dragonite,
  feraligatr: spr_feraligatr, arcanine: spr_arcanine,
  meowscarada: spr_meowscarada, clefable: spr_clefable,
  corviknight: spr_corviknight, charizard: spr_charizard,
  whimsicott: spr_whimsicott, excadrill: spr_excadrill,
  tyranitar: spr_tyranitar, primarina: spr_primarina,
};
const spriteUrl = (name) => LOCAL_SPRITES[name.toLowerCase().split("-")[0]] || "";

const TYPE_META = {
  Fire:    { pill: "#fff1f0", pillText: "#b91c1c", dot: "#ef4444" },
  Water:   { pill: "#eff6ff", pillText: "#1d4ed8", dot: "#3b82f6" },
  Grass:   { pill: "#f0fdf4", pillText: "#15803d", dot: "#22c55e" },
  Ghost:   { pill: "#faf5ff", pillText: "#6d28d9", dot: "#8b5cf6" },
  Ground:  { pill: "#fffbeb", pillText: "#b45309", dot: "#f59e0b" },
  Fairy:   { pill: "#fdf2f8", pillText: "#be185d", dot: "#ec4899" },
  Dragon:  { pill: "#eff6ff", pillText: "#1e40af", dot: "#2563eb" },
  Steel:   { pill: "#f8fafc", pillText: "#475569", dot: "#64748b" },
  Rock:    { pill: "#fefce8", pillText: "#92400e", dot: "#a16207" },
  Normal:  { pill: "#f9fafb", pillText: "#374151", dot: "#9ca3af" },
  Flying:  { pill: "#ecfeff", pillText: "#0e7490", dot: "#06b6d4" },
  Psychic: { pill: "#fff1f2", pillText: "#be123c", dot: "#f43f5e" },
};
const tm = (t) => TYPE_META[t] || TYPE_META.Normal;

const TEAMS = [
  { id: 1, name: "Sun Trick Room", short: "Sun TR", pokemon: [
    { name: "Incineroar",     sprite: "incineroar",  item: "Figy Berry",     ability: "Intimidate",              tera: "Fire",   nature: "Careful", moves: ["Fake Out","Flare Blitz","Darkest Lariat","Parting Shot"], evs: "252 HP / 4 Atk / 4 Def / 252 SpD",           location: "SV: Poco Path — catch Litten, evolve Lv.17 → Lv.34",                              swsh: { ok: true,  how: "Isle of Armor DLC: Catch Litten in Training Lowlands or Fields of Honor. Evolve Lv.17 (Torracat) → Lv.34 (Incineroar)." } },
    { name: "Farigiraf",      sprite: "farigiraf",   item: "Throat Spray",   ability: "Armor Tail",              tera: "Normal", nature: "Quiet",   moves: ["Psychic","Hyper Voice","Trick Room","Protect"],          evs: "100 HP / 92 Def / 156 SpA / 156 SpD",         location: "SV: West Province Area One — catch Girafarig, evolve with Long Neck Oil",         swsh: { ok: false, how: "Not available — Farigiraf is Gen 9 only. Must obtain in Scarlet/Violet." } },
    { name: "Torkoal",        sprite: "torkoal",     item: "Charcoal",       ability: "Drought",                 tera: "Fire",   nature: "Quiet",   moves: ["Eruption","Heat Wave","Earth Power","Protect"],          evs: "252 HP / 4 Def / 252 SpA / 4 SpD",            location: "SV: Asado Desert / West Province Area Three",                                      swsh: { ok: true,  how: "Wild Area: Hammerlocke Hills or Giant's Cap (intense sun weather). Also found in Stony Wilderness." } },
    { name: "Ursaluna",       sprite: "ursaluna",    item: "Flame Orb",      ability: "Guts",                    tera: "Ground", nature: "Adamant", moves: ["Facade","Headlong Rush","Earthquake","Protect"],         evs: "140 HP / 252 Atk / 4 Def / 116 SpD",          location: "SV: Evolve Ursaring with Peat Block during a full moon",                          swsh: { ok: false, how: "Not available — Ursaluna is a Hisui regional evolution. Obtain via Legends: Arceus or SV." } },
    { name: "Gardevoir-Mega", sprite: "gardevoir",   item: "Gardevoirite",   ability: "Pixilate",                tera: "Psychic",nature: "Quiet",   moves: ["Hyper Voice","Psychic","Trick Room","Protect"],          evs: "252 HP / 140 Def / 116 SpA / 4 SpD",          location: "ORAS: Evolve Ralts → Gardevoir. Gardevoirite in Mossdeep City",                    swsh: { ok: true,  how: "Wild Area: Catch Ralts in Rolling Fields (fog) or Giant's Mirror. Evolve Lv.20 (Kirlia) → Lv.30+ (Gardevoir). EV train in SwSh, then transfer to ORAS for Gardevoirite." } },
    { name: "Sinistcha",      sprite: "sinistcha",   item: "Sitrus Berry",   ability: "Hospitality",             tera: "Grass",  nature: "Quiet",   moves: ["Matcha Gotcha","Shadow Ball","Life Dew","Rage Powder"],  evs: "252 HP / 12 Def / 148 SpA / 92 SpD",          location: "SV Teal Mask DLC: Mossfell Confluence — catch Sinistea, evolve with Masterpiece Teacup", swsh: { ok: false, how: "Not available — Sinistcha is Gen 9 Teal Mask DLC exclusive." } },
  ]},
  { id: 2, name: "Rain Trick Room", short: "Rain TR", pokemon: [
    { name: "Gengar",         sprite: "gengar",      item: "Gengarite",      ability: "Cursed Body",             tera: "Ghost",  nature: "Timid",   moves: ["Protect","Icy Wind","Sludge Bomb","Shadow Ball"],        evs: "220 HP / 4 Def / 12 SpA / 24 SpD / 252 Spe",  location: "ORAS: Trade Haunter to evolve → Gengar. Gengarite in Laverre City",               swsh: { ok: true,  how: "Glimwood Tangle: Catch Gastly. Evolve Lv.25 (Haunter) → trade for Gengar. EV train in SwSh, then transfer to ORAS for the Gengarite." } },
    { name: "Ursaluna",       sprite: "ursaluna",    item: "Flame Orb",      ability: "Guts",                    tera: "Ground", nature: "Adamant", moves: ["Protect","Facade","Headlong Rush","Earthquake"],         evs: "8 HP / 252 Atk / 252 Spe",                    location: "SV: Evolve Ursaring with Peat Block during a full moon",                          swsh: { ok: false, how: "Not available — obtain in Legends: Arceus or Scarlet/Violet." } },
    { name: "Incineroar",     sprite: "incineroar",  item: "Covert Cloak",   ability: "Intimidate",              tera: "Fire",   nature: "Careful", moves: ["Fake Out","Parting Shot","Taunt","Throat Chop"],         evs: "236 HP / 4 Atk / 84 Def / 156 SpD / 32 Spe",  location: "SV: Poco Path — catch Litten and evolve",                                         swsh: { ok: true,  how: "Isle of Armor DLC: Catch Litten in Training Lowlands or Fields of Honor. Evolve Lv.17 → Lv.34." } },
    { name: "Pelipper",       sprite: "pelipper",    item: "Focus Sash",     ability: "Drizzle",                 tera: "Water",  nature: "Modest",  moves: ["Tailwind","Weather Ball","Hurricane","Wide Guard"],       evs: "8 HP / 252 SpA / 252 Spe",                    location: "SV: Casseroya Lake — catch Wingull Lv.18+, evolve at Lv.25",                      swsh: { ok: true,  how: "Wild Area: Catch Wingull at South Lake Milch, Giant's Cap, or Motostoke Riverbank. Evolve at Lv.25." } },
    { name: "Archaludon",     sprite: "archaludon",  item: "Assault Vest",   ability: "Stamina",                 tera: "Steel",  nature: "Modest",  moves: ["Electro Shot","Flash Cannon","Draco Meteor","Body Press"],evs: "252 HP / 8 Def / 116 SpA / 28 SpD / 108 Spe", location: "SV Teal Mask DLC: Loyalty Plaza — catch Duraludon, evolve with Syrupy Apple",     swsh: { ok: false, how: "Not available — Archaludon's evolution is Gen 9 only. Duraludon exists in SwSh but cannot evolve there." } },
    { name: "Dragonite",      sprite: "dragonite",   item: "Dragoninite",    ability: "Inner Focus",             tera: "Dragon", nature: "Modest",  moves: ["Tailwind","Protect","Hurricane","Draco Meteor"],          evs: "252 HP / 252 SpA / 8 Spe",                    location: "SV: Catch Dratini at Casseroya Lake, evolve Lv.30 then Lv.55",                    swsh: { ok: true,  how: "Crown Tundra DLC: Dratini at Icemount Lake (fishing). IoA: Loop Lagoon. Evolve Lv.30 (Dragonair) → Lv.55 (Dragonite)." } },
  ]},
  { id: 3, name: "Physical Offense", short: "Offense", pokemon: [
    { name: "Feraligatr",     sprite: "feraligatr",  item: "Feraligite",     ability: "Sheer Force",             tera: "Water",  nature: "Adamant", moves: ["Double-Edge","Liquidation","Roar","Protect"],            evs: "180 HP / 76 Atk / 1 SpD / 252 Spe",           location: "ORAS: Johto Starter — Totodile → Feraligatr. Feraligite in Sea Mauville",         swsh: { ok: false, how: "Not in the Galar dex. Obtain from HGSS, ORAS, or BDSP and transfer via Pokémon HOME." } },
    { name: "Arcanine-Hisui", sprite: "arcanine",    item: "Clear Amulet",   ability: "Intimidate",              tera: "Fire",   nature: "Adamant", moves: ["Flare Blitz","Rock Slide","Howl","Protect"],             evs: "92 HP / 252 Atk / 1 Def / 164 Spe",           location: "Legends: Arceus — catch Hisuian Growlithe in Cobalt Coastlands, evolve with Fire Stone", swsh: { ok: false, how: "Not available — Hisuian Arcanine is exclusive to Legends: Arceus." } },
    { name: "Meowscarada",    sprite: "meowscarada", item: "Focus Sash",     ability: "Overgrow",                tera: "Grass",  nature: "Jolly",   moves: ["Flower Trick","Sucker Punch","Toxic Spikes","Protect"],  evs: "4 HP / 252 Atk / 1 Def / 252 Spe",            location: "SV: Starter — Sprigatito → Floragato → Meowscarada at Lv.36",                     swsh: { ok: false, how: "Not available — Meowscarada is Gen 9 only." } },
    { name: "Clefable",       sprite: "clefable",    item: "Sitrus Berry",   ability: "Unaware",                 tera: "Fairy",  nature: "Bold",    moves: ["Moonblast","Thunder Wave","Follow Me","Protect"],         evs: "252 HP / 156 Def / 1 SpA / 100 SpD",          location: "SV: Catch Clefairy on Poco Path (night), evolve with Moon Stone",                 swsh: { ok: true,  how: "Wild Area: Clefairy at Motostoke Riverbank, Giant's Seat, or Stony Wilderness. Evolve with Moon Stone. Use Ability Capsule to switch to Unaware." } },
    { name: "Corviknight",    sprite: "corviknight", item: "Leftovers",      ability: "Mirror Armor",            tera: "Flying", nature: "Impish",  moves: ["Brave Bird","Roost","Tailwind","Protect"],               evs: "228 HP / 4 Atk / 252 Def / 5 SpD / 20 Spe",  location: "SV: Catch Rookidee on Route 1, evolve Lv.18 → Lv.38",                             swsh: { ok: true,  how: "Routes 1, 2, 7, 8 or Wild Area — Rookidee is very common from game start. Evolve Lv.18 → Lv.38. Mirror Armor is its HA; use Ability Patch." } },
    { name: "Dragonite",      sprite: "dragonite",   item: "Loaded Dice",    ability: "Multiscale",              tera: "Dragon", nature: "Adamant", moves: ["Scale Shot","Extreme Speed","Iron Head","Protect"],      evs: "4 HP / 252 Atk / 1 Def / 252 Spe",            location: "SV: Catch Dratini at Casseroya Lake, evolve Lv.30 then Lv.55",                    swsh: { ok: true,  how: "Crown Tundra DLC: Dratini at Icemount Lake. Evolve Lv.30 → Lv.55. Multiscale is HA — use Ability Patch." } },
  ]},
  { id: 4, name: "Sun Offense", short: "Sun Off", pokemon: [
    { name: "Charizard",      sprite: "charizard",   item: "Charizardite Y", ability: "Solar Power → Drought",   tera: "Fire",   nature: "Timid",   moves: ["Weather Ball","Protect","Heat Wave","Overheat"],          evs: "4 HP / 252 SpA / 252 Spe",                    location: "ORAS: Kanto Starter Charmander → Lv.36. Charizardite Y on Mt. Chimney",           swsh: { ok: true,  how: "After beating Leon: collect Charmander from his bedroom in Postwick. Evolve Lv.16 (Charmeleon) → Lv.36 (Charizard)." } },
    { name: "Torkoal",        sprite: "torkoal",     item: "Eject Pack",     ability: "Drought",                 tera: "Fire",   nature: "Modest",  moves: ["Eruption","Protect"],                                    evs: "252 HP / 4 Def / 252 SpA",                    location: "SV: Asado Desert / West Province Area Three",                                      swsh: { ok: true,  how: "Wild Area: Hammerlocke Hills or Giant's Cap (intense sun weather). Also found in Stony Wilderness." } },
    { name: "Incineroar",     sprite: "incineroar",  item: "Sitrus Berry",   ability: "Intimidate",              tera: "Fire",   nature: "Adamant", moves: ["Fake Out","Darkest Lariat","Parting Shot"],               evs: "252 HP / 36 Atk / 220 Spe",                   location: "SV: Poco Path — catch Litten and evolve",                                         swsh: { ok: true,  how: "Isle of Armor DLC: Training Lowlands or Fields of Honor. Evolve Lv.17 → Lv.34." } },
    { name: "Whimsicott",     sprite: "whimsicott",  item: "Covert Cloak",   ability: "Prankster",               tera: "Fairy",  nature: "Timid",   moves: ["Light Screen","Encore","Tailwind"],                      evs: "236 HP / 164 SpD / 108 Spe",                  location: "SV: Catch Cottonee in South Province Area Five, evolve with Sun Stone",            swsh: { ok: true,  how: "Wild Area: Catch Whimsicott in Stony Wilderness (sandstorm) or evolve Cottonee with Sun Stone. Prankster is its regular ability." } },
    { name: "Ursaluna",       sprite: "ursaluna",    item: "Flame Orb",      ability: "Guts",                    tera: "Ground", nature: "Adamant", moves: ["Facade","Earthquake","Headlong Rush"],                   evs: "140 HP / 236 Atk / 132 Spe",                  location: "SV: Evolve Ursaring with Peat Block during a full moon",                          swsh: { ok: false, how: "Not available — Ursaluna needs Legends: Arceus or SV." } },
    { name: "Sinistcha",      sprite: "sinistcha",   item: "Rocky Helmet",   ability: "Hospitality",             tera: "Grass",  nature: "Quiet",   moves: ["Shadow Ball","Life Dew","Matcha Gotcha","Rage Powder"],  evs: "252 HP / 12 Def / 148 SpA / 92 SpD",          location: "SV Teal Mask DLC: Mossfell Confluence — catch Sinistea, evolve with Masterpiece Teacup", swsh: { ok: false, how: "Not available — Gen 9 Teal Mask DLC only." } },
  ]},
  { id: 5, name: "Sand Team", short: "Sand", pokemon: [
    { name: "Excadrill",      sprite: "excadrill",   item: "Focus Sash",     ability: "Sand Rush",               tera: "Ground", nature: "Adamant", moves: ["Iron Head","High Horsepower","Earthquake","Protect"],    evs: "4 HP / 252 Atk / 1 SpA / 252 Spe",            location: "SV: Catch Drilbur in Asado Desert or Area Zero, evolve at Lv.31",                 swsh: { ok: true,  how: "Wild Area: Drilbur/Excadrill in Dusty Bowl, Hammerlocke Hills, or Stony Wilderness. Evolve Drilbur Lv.31. Sand Rush is its regular ability." } },
    { name: "Tyranitar-Mega", sprite: "tyranitar",   item: "Tyranitarite",   ability: "Sand Stream",             tera: "Rock",   nature: "Adamant", moves: ["Rock Slide","Low Kick","Crunch","Protect"],              evs: "244 HP / 124 Atk / 4 Def / 1 SpA / 4 SpD / 132 Spe", location: "ORAS: Catch Larvitar in Safari Zone. Tyranitarite in Battle Resort",           swsh: { ok: true,  how: "Crown Tundra DLC: Catch Larvitar in Roaring-Sea Caves. Evolve Lv.30 (Pupitar) → Lv.55 (Tyranitar). EV train in SwSh, transfer to ORAS for Tyranitarite." } },
    { name: "Corviknight",    sprite: "corviknight", item: "Leftovers",      ability: "Mirror Armor",            tera: "Flying", nature: "Adamant", moves: ["Brave Bird","Bulk Up","Roost","Tailwind"],               evs: "244 HP / 100 Atk / 4 Def / 1 SpA / 4 SpD / 124 Spe", location: "SV: Catch Rookidee on Route 1, evolve Lv.18 → Lv.38",                         swsh: { ok: true,  how: "Routes 1, 2, 7, 8 or Wild Area — Rookidee is very common. Evolve Lv.18 → Lv.38. Mirror Armor = HA, use Ability Patch." } },
    { name: "Primarina",      sprite: "primarina",   item: "Safety Goggles", ability: "Liquid Voice",            tera: "Water",  nature: "Modest",  moves: ["Moonblast","Hyper Voice","Haze","Protect"],              evs: "140 HP / 1 Atk / 68 Def / 108 SpA / 4 SpD / 188 Spe", location: "SM/USUM: Starter — Popplio → Brionne Lv.17 → Primarina Lv.34",                swsh: { ok: true,  how: "Isle of Armor DLC: Receive Popplio from Master Dojo or bring via HOME from Sun/Moon. Evolve Lv.17 → Lv.34." } },
    { name: "Incineroar",     sprite: "incineroar",  item: "Assault Vest",   ability: "Intimidate",              tera: "Fire",   nature: "Adamant", moves: ["Flare Blitz","Darkest Lariat","U-Turn","Fake Out"],       evs: "252 HP / 116 Atk / 4 Def / 1 SpA / 4 SpD / 132 Spe", location: "SV: Poco Path — catch Litten and evolve",                                     swsh: { ok: true,  how: "Isle of Armor DLC: Training Lowlands or Fields of Honor. Evolve Lv.17 → Lv.34." } },
    { name: "Sinistcha",      sprite: "sinistcha",   item: "Sitrus Berry",   ability: "Hospitality",             tera: "Grass",  nature: "Bold",    moves: ["Matcha Gotcha","Rage Powder","Strength Sap","Trick Room"],evs: "236 HP / 1 Atk / 188 Def / 4 SpA / 76 SpD / 4 Spe", location: "SV Teal Mask DLC: Mossfell Confluence — catch Sinistea, evolve with Masterpiece Teacup", swsh: { ok: false, how: "Not available — Gen 9 Teal Mask DLC only." } },
  ]},
];

function Ring({ pct, size = 36, stroke = 3, color = "#0f172a", bg = "#f1f5f9" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fontSize={size === 36 ? 9 : 8}
        fontWeight="700" fill={color} fontFamily="system-ui">{pct}%</text>
    </svg>
  );
}

function EVRow({ stat, amount, checked, onToggle, showPlan }) {
  const [open, setOpen] = useState(false);
  const plan = showPlan ? calcPokejobPlan(amount, stat) : null;
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${checked ? "rgba(22,163,74,0.2)" : "#f0f0f0"}`, marginBottom: 3 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", cursor: "pointer", background: checked ? "rgba(22,163,74,0.04)" : "white" }}>
        <input type="checkbox" checked={checked} onChange={onToggle} style={{ display: "none" }} />
        <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `2px solid ${checked ? "#16a34a" : "#d1d5db"}`, background: checked ? "#16a34a" : "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", transition: "all 0.15s" }}>
          {checked && "✓"}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", minWidth: 52 }}>{STAT_LABELS[stat]}</span>
        <span style={{ fontSize: 14, fontFamily: "monospace", fontWeight: 700, color: checked ? "#16a34a" : "#111827", flex: 1 }}>{amount}</span>
        {showPlan && plan && (
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
            style={{ background: open ? "#111827" : "#f3f4f6", border: "none", borderRadius: 6, padding: "3px 10px", color: open ? "white" : "#6b7280", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>
            {open ? "HIDE" : "JOBS ▾"}
          </button>
        )}
      </label>
      {open && plan && (
        <div style={{ borderTop: "1px solid #f3f4f6", padding: "12px 14px", background: "#f9fafb" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", letterSpacing: "0.08em", marginBottom: 8 }}>⚙ POKÉ JOB PLAN — {STAT_LABELS[stat]} ({amount} EVs)</div>
          {plan.steps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, minWidth: 14 }}>{i + 1}.</span>
              <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.55 }}>{step}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: 10, color: "#9ca3af" }}>Open Rotomi Board → select the {STAT_LABELS[stat]} stat job.</div>
        </div>
      )}
    </div>
  );
}

function PokemonCard({ pokemon, progress, onToggle, idx }) {
  const [open, setOpen] = useState(false);
  const [showJobPlans, setShowJobPlans] = useState(false);
  const evs = parseEVs(pokemon.evs);
  const evStats = STAT_ORDER.filter(s => evs[s] > 0);
  const allKeys = getPokemonKeys(pokemon);
  const done = allKeys.filter(k => progress[k]).length;
  const pct = Math.round((done / allKeys.length) * 100);
  const complete = done === allKeys.length;
  const caught = !!progress.caught;
  const { ok: swshOk, how: swshHow } = pokemon.swsh;
  const { pill, pillText, dot } = tm(pokemon.tera);
  const moves = pokemon.moves.filter(Boolean);

  return (
    <div style={{
      background: "white", borderRadius: 16,
      border: `1px solid ${complete ? "rgba(22,163,74,0.3)" : "#e5e7eb"}`,
      overflow: "hidden",
      opacity: caught ? 1 : 0.48,
      filter: caught ? "none" : "grayscale(0.5)",
      transition: "opacity 0.25s, filter 0.25s, border-color 0.25s",
      boxShadow: open ? "0 4px 24px rgba(0,0,0,0.07)" : "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      {/* Accent strip */}
      <div style={{ height: 3, background: complete ? "#16a34a" : dot, opacity: caught ? 1 : 0.4 }} />

      {/* Header */}
      <div onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", userSelect: "none" }}>
        {/* Sprite */}
        <div style={{ width: 60, height: 56, borderRadius: 12, background: pill, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
          <img src={spriteUrl(pokemon.sprite)} alt={pokemon.name}
            style={{ width: 52, height: 48, imageRendering: "pixelated", objectFit: "contain" }}
            onError={e => e.target.style.display = "none"} />
        </div>

        {/* Name + badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: complete ? "#16a34a" : "#0f172a", fontFamily: "system-ui", letterSpacing: "-0.01em" }}>{pokemon.name}</span>
            {!caught && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 5, background: "#f3f4f6", color: "#9ca3af", fontWeight: 700, letterSpacing: "0.06em" }}>NOT CAUGHT</span>}
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: pill, color: pillText, fontWeight: 700, border: `1px solid ${dot}33` }}>{pokemon.tera} Tera</span>
            {swshOk && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#eff6ff", color: "#1d4ed8", fontWeight: 700, border: "1px solid #bfdbfe" }}>SwSh ⚔</span>}
          </div>
        </div>

        {/* Progress ring + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Ring pct={pct} color={complete ? "#16a34a" : dot} />
          <span style={{ fontSize: 18, color: "#d1d5db", display: "block", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>⌄</span>
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div style={{ borderTop: "1px solid #f3f4f6", padding: "14px 14px 16px" }}>

          {/* SwSh block */}
          <div style={{ padding: "10px 12px", borderRadius: 12, marginBottom: 10, background: swshOk ? "#eff6ff" : "#f9fafb", border: swshOk ? "1px solid #bfdbfe" : "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", color: swshOk ? "#1d4ed8" : "#9ca3af", marginBottom: 4 }}>
              ⚔ SWORD & SHIELD — {swshOk ? "Trainable here" : "Not available"}
            </div>
            <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>{swshHow}</div>
          </div>

          {/* Location */}
          <div style={{ padding: "8px 12px", borderRadius: 12, marginBottom: 10, background: "#fffbeb", border: "1px solid #fde68a", fontSize: 12, color: "#78350f", lineHeight: 1.55 }}>
            <span style={{ fontWeight: 700 }}>📍 </span>{pokemon.location}
          </div>

          {/* Base checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 12 }}>
            {[
              { key: "caught",  label: "Caught / Obtained" },
              { key: "item",    label: `Item: ${pokemon.item}` },
              { key: "nature",  label: `Nature: ${pokemon.nature}` },
              { key: "ability", label: `Ability: ${pokemon.ability}` },
              { key: "tera",    label: `Tera Type: ${pokemon.tera}` },
              ...moves.map((m, i) => ({ key: `move${i + 1}`, label: m })),
            ].map(({ key, label }) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, cursor: "pointer", background: progress[key] ? "rgba(22,163,74,0.05)" : "#fafafa", border: `1px solid ${progress[key] ? "rgba(22,163,74,0.18)" : "#f0f0f0"}`, transition: "all 0.15s" }}>
                <input type="checkbox" checked={!!progress[key]} onChange={() => onToggle(key)} style={{ display: "none" }} />
                <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `2px solid ${progress[key] ? "#16a34a" : "#d1d5db"}`, background: progress[key] ? "#16a34a" : "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", transition: "all 0.15s" }}>
                  {progress[key] && "✓"}
                </span>
                <span style={{ fontSize: 13, fontWeight: progress[key] ? 600 : 400, color: progress[key] ? "#15803d" : "#374151" }}>{label}</span>
              </label>
            ))}
          </div>

          {/* EV section */}
          {evStats.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.1em" }}>EV SPREAD</span>
                {swshOk && (
                  <button onClick={() => setShowJobPlans(v => !v)}
                    style={{ background: showJobPlans ? "#111827" : "#f3f4f6", border: "none", borderRadius: 7, padding: "4px 11px", color: showJobPlans ? "white" : "#6b7280", cursor: "pointer", fontSize: 10, fontWeight: 700, transition: "all 0.15s" }}>
                    {showJobPlans ? "Hide plans" : "Poké Job plans ▾"}
                  </button>
                )}
              </div>
              {evStats.map(stat => (
                <EVRow key={stat} stat={stat} amount={evs[stat]}
                  checked={!!progress[`ev_${stat}`]}
                  onToggle={() => onToggle(`ev_${stat}`)}
                  showPlan={swshOk && showJobPlans} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniRoster({ team, teamIdx, progress }) {
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
      {team.pokemon.map((p, pi) => {
        const caught = !!progress[`${teamIdx}-${pi}-caught`];
        const keys = getPokemonKeys(p);
        const complete = keys.every(k => progress[`${teamIdx}-${pi}-${k}`]);
        return (
          <div key={pi} style={{ width: 30, height: 28, borderRadius: 8, background: complete ? "rgba(22,163,74,0.1)" : caught ? "#f9fafb" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", opacity: caught ? 1 : 0.3, filter: caught ? "none" : "grayscale(1)", transition: "all 0.2s", border: complete ? "1px solid rgba(22,163,74,0.2)" : "1px solid transparent" }}>
            <img src={spriteUrl(p.sprite)} alt={p.name} style={{ width: 24, height: 22, imageRendering: "pixelated", objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [activeTeam, setActiveTeam] = useState(0);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const saved = localStorage.getItem("pkmn-v4"); if (saved) setProgress(JSON.parse(saved)); } catch {}
      setLoading(false);
    })();
  }, []);

const save = (p) => { localStorage.setItem("pkmn-v4", JSON.stringify(p)); };

  const toggle = (ti, pi, key) => {
    const sk = `${ti}-${pi}-${key}`;
    const next = { ...progress, [sk]: !progress[sk] };
    setProgress(next); save(next);
  };

  const getPokeProgress = (ti, pi) => {
    const p = {};
    getPokemonKeys(TEAMS[ti].pokemon[pi]).forEach(k => { p[k] = !!progress[`${ti}-${pi}-${k}`]; });
    return p;
  };

  const teamStats = (ti) => {
    let done = 0, total = 0;
    TEAMS[ti].pokemon.forEach((p, pi) => {
      const keys = getPokemonKeys(p); total += keys.length;
      keys.forEach(k => { if (progress[`${ti}-${pi}-${k}`]) done++; });
    });
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  };

  const global = (() => {
    let done = 0, total = 0;
    TEAMS.forEach((t, ti) => t.pokemon.forEach((p, pi) => {
      const keys = getPokemonKeys(p); total += keys.length;
      keys.forEach(k => { if (progress[`${ti}-${pi}-${k}`]) done++; });
    }));
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  })();

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f8fafc", color: "#9ca3af", fontFamily: "system-ui", fontSize: 14 }}>Loading...</div>;

  const ts = teamStats(activeTeam);
  const team = TEAMS[activeTeam];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Sticky header */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>Pokémon Champions</div>
            <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.06em", marginTop: 1 }}>TEAM BUILD TRACKER</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: global.pct === 100 ? "#16a34a" : "#0f172a", lineHeight: 1, letterSpacing: "-0.02em" }}>
                {global.pct}<span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>%</span>
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>{global.done}/{global.total}</div>
            </div>
            <Ring pct={global.pct} size={40} stroke={3.5} color={global.pct === 100 ? "#16a34a" : "#0f172a"} bg="#f1f5f9" />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 48px" }}>

        {/* Team selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {TEAMS.map((t, idx) => {
            const s = teamStats(idx);
            const isActive = idx === activeTeam;
            return (
              <button key={idx} onClick={() => setActiveTeam(idx)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, border: isActive ? "2px solid #0f172a" : "1px solid #e5e7eb", background: isActive ? "white" : "rgba(255,255,255,0.6)", cursor: "pointer", textAlign: "left", transition: "all 0.18s", boxShadow: isActive ? "0 2px 12px rgba(0,0,0,0.08)" : "none" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#0f172a" : "#374151", marginBottom: 2 }}>{t.name}</div>
                  <MiniRoster team={t} teamIdx={idx} progress={progress} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.pct === 100 ? "#16a34a" : "#9ca3af" }}>{s.pct}%</span>
                  <Ring pct={s.pct} size={34} stroke={3} color={s.pct === 100 ? "#16a34a" : isActive ? "#0f172a" : "#cbd5e1"} bg="#f1f5f9" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Active team label */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{team.name}</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{ts.done} / {ts.total} complete</span>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {team.pokemon.map((p, pi) => (
            <PokemonCard key={`${activeTeam}-${pi}`} pokemon={p} idx={pi}
              progress={getPokeProgress(activeTeam, pi)}
              onToggle={key => toggle(activeTeam, pi, key)} />
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 20, padding: "0 2px" }}>
          {[["#1d4ed8", "SwSh trainable"], ["#16a34a", "Complete"], ["#d1d5db", "Faded = not caught"]].map(([c, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />{label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
