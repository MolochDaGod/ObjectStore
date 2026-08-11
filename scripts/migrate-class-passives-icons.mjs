import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, "../api/v1/class-equipment-rules.json");
const d = JSON.parse(fs.readFileSync(p, "utf8"));

const ICONS = {
  armor: {
    warrior: "/icons/skills/class/barbarian/barbarian_05.png",
    mage: "/icons/skills/class/firemage/firemage_05.png",
    ranger: "/icons/skills/class/hunter/hunter_05.png",
    worge: "/icons/skills/class/necromancer/necromancer_05.png",
  },
  weapon: {
    warrior: "/icons/skills/class/barbarian/barbarian_01.png",
    mage: "/icons/skills/class/firemage/firemage_01.png",
    ranger: "/icons/skills/class/hunter/hunter_01.png",
    worge: "/icons/skills/class/necromancer/necromancer_01.png",
  },
  dual: {
    warrior: "/icons/skills/class/barbarian/barbarian_06.png",
    mage: "/icons/skills/class/firemage/firemage_03.png",
    ranger: "/icons/skills/class/hunter/hunter_03.png",
    worge: "/icons/skills/class/necromancer/necromancer_03.png",
  },
};

function pctLine(label, m) {
  const pct = Math.round((m - 1) * 100);
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}% ${label}`;
}

for (const [ck, c] of Object.entries(d.classes || {})) {
  for (const psv of c.passives || []) {
    const k = psv.kind || "armor";
    const icon = (ICONS[k] && ICONS[k][ck]) || ICONS.armor.warrior;
    psv.icon = icon;
    psv.iconUrl = icon.startsWith("http")
      ? icon
      : `https://assets.grudge-studio.com${icon}`;
    psv.alwaysOn = true;
    psv.rank = "Passive";
    const lines = [];
    const eff = psv.effect || {};
    if (eff.armor) {
      for (const [t, m] of Object.entries(eff.armor)) {
        lines.push(pctLine(`armor effectiveness (${t})`, Number(m)));
      }
    }
    if (eff.weapon) {
      for (const [t, m] of Object.entries(eff.weapon)) {
        lines.push(pctLine(`weapon effectiveness (${t})`, Number(m)));
      }
    }
    if (eff.dualWield != null) {
      lines.push(pctLine("dual-wield contribution", Number(eff.dualWield)));
    }
    psv.tooltipLines = lines;
  }
}

d.version = "1.2.0";
d.migration = {
  from: "1.0.0 hard blocked/allowed lists",
  to: "1.2.0 soft effectiveness + spellbook passives",
  breaking: false,
  steps: [
    "Remove equip bans; canEquip always true",
    "Use weaponEffectiveness/armorEffectiveness mults on combat stats",
    "Render passives with icons + WoW tooltips at top of class skill tab",
    "dualWieldEfficient is efficiency only, not a ban",
    "Tree skills with passive:true also appear in spellbook passive row",
  ],
};

fs.writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
console.log("OK", p);
