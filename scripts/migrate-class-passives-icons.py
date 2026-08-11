#!/usr/bin/env python3
"""Migrate class-equipment-rules passives: icons + tooltip lines (v1.2.0)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
p = ROOT / "api" / "v1" / "class-equipment-rules.json"
d = json.loads(p.read_text(encoding="utf-8"))

ICONS = {
    "armor": {
        "warrior": "/icons/skills/class/barbarian/barbarian_05.png",
        "mage": "/icons/skills/class/firemage/firemage_05.png",
        "ranger": "/icons/skills/class/hunter/hunter_05.png",
        "worge": "/icons/skills/class/necromancer/necromancer_05.png",
    },
    "weapon": {
        "warrior": "/icons/skills/class/barbarian/barbarian_01.png",
        "mage": "/icons/skills/class/firemage/firemage_01.png",
        "ranger": "/icons/skills/class/hunter/hunter_01.png",
        "worge": "/icons/skills/class/necromancer/necromancer_01.png",
    },
    "dual": {
        "warrior": "/icons/skills/class/barbarian/barbarian_06.png",
        "mage": "/icons/skills/class/firemage/firemage_03.png",
        "ranger": "/icons/skills/class/hunter/hunter_03.png",
        "worge": "/icons/skills/class/necromancer/necromancer_03.png",
    },
}


def pct_line(label: str, m: float) -> str:
    pct = int(round((m - 1) * 100))
    sign = "+" if pct > 0 else ""
    return f"{sign}{pct}% {label}"


for ck, c in d.get("classes", {}).items():
    for psv in c.get("passives", []):
        k = psv.get("kind") or "armor"
        icon = ICONS.get(k, {}).get(ck) or ICONS["armor"]["warrior"]
        psv["icon"] = icon
        psv["iconUrl"] = (
            "https://assets.grudge-studio.com" + icon if icon.startswith("/") else icon
        )
        psv["alwaysOn"] = True
        psv["rank"] = "Passive"
        lines = []
        eff = psv.get("effect") or {}
        if "armor" in eff:
            for t, m in eff["armor"].items():
                lines.append(pct_line(f"armor effectiveness ({t})", float(m)))
        if "weapon" in eff:
            for t, m in eff["weapon"].items():
                lines.append(pct_line(f"weapon effectiveness ({t})", float(m)))
        if "dualWield" in eff:
            lines.append(
                pct_line("dual-wield contribution", float(eff["dualWield"]))
            )
        psv["tooltipLines"] = lines

d["version"] = "1.2.0"
d["migration"] = {
    "from": "1.0.0 hard blocked/allowed lists",
    "to": "1.2.0 soft effectiveness + spellbook passives",
    "breaking": False,
    "steps": [
        "Remove equip bans; canEquip always true",
        "Use weaponEffectiveness/armorEffectiveness mults on combat stats",
        "Render passives with icons + WoW tooltips at top of class skill tab",
        "dualWieldEfficient is efficiency only, not a ban",
        "Tree skills with passive:true also appear in spellbook passive row",
    ],
}

p.write_text(json.dumps(d, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("OK", p, "classes", len(d["classes"]))
