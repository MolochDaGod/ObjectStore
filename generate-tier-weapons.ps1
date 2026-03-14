# Tier Weapon Generator for GRUDGE Item Database
# Generates 17 weapon types x 6 named sets x 8 tiers = 816 items

$ICO = "https://molochdagod.github.io/ObjectStore/icons/pack/weapons"

$weaponTypes = @(
  @{ Name="Sword";      Icons=@("Sword_01","Sword_06","Sword_11","Sword_16","Sword_21","Sword_26"); BaseDmg=35; Class="Warrior" },
  @{ Name="Greatsword";  Icons=@("Sword_31","Sword_36","Sword_41","Sword_46","Sword_51","Sword_56"); BaseDmg=52; Class="Warrior/Ranger" },
  @{ Name="Dagger";      Icons=@("Dagger_01","Dagger_06","Dagger_11","Dagger_16","Dagger_21","Dagger_26"); BaseDmg=22; Class="Ranger/Worge" },
  @{ Name="Bow";         Icons=@("Bow_01","Bow_06","Bow_11","Bow_16","Bow_21","Bow_26"); BaseDmg=30; Class="Ranger/Worge" },
  @{ Name="Crossbow";    Icons=@("Crossbow_01","Crossbow_02","Crossbow_03","Crossbow_04","Crossbow_05","Crossbow_06"); BaseDmg=38; Class="Ranger" },
  @{ Name="Gun";         Icons=@("Crossbow_07","Crossbow_08","Crossbow_09","Crossbow_10","Crossbow_01","Crossbow_03"); BaseDmg=42; Class="Ranger" },
  @{ Name="Staff";       Icons=@("staff_1","staff_6","staff_11","staff_16","staff_21","staff_26"); BaseDmg=28; Class="Mage/Worge" },
  @{ Name="Tome";        Icons=@("Book_1","Book_5","Book_9","Book_13","Book_17","Book_21"); BaseDmg=32; Class="Mage" },
  @{ Name="Mace";        Icons=@("Hammer_01","Hammer_06","Hammer_11","Hammer_16","Hammer_21","Hammer_26"); BaseDmg=33; Class="Mage/Worge" },
  @{ Name="Wand";        Icons=@("staff_31","staff_36","staff_41","staff_46","Staff_51","Staff_53"); BaseDmg=25; Class="Mage" },
  @{ Name="Spear";       Icons=@("Spear_01","Spear_06","Spear_11","Spear_16","Spear_21","Spear_26"); BaseDmg=36; Class="Ranger/Worge" },
  @{ Name="Hammer";      Icons=@("Hammer_31","Hammer_36","Hammer_41","Hammer_46","hammer_51","hammer_53"); BaseDmg=45; Class="Warrior/Worge" },
  @{ Name="Axe";         Icons=@("Axe_01","Axe_06","Axe_11","Axe_16","Axe_21","Axe_26"); BaseDmg=40; Class="Warrior" },
  @{ Name="Maul";        Icons=@("Hammer_02","Hammer_08","Hammer_14","Hammer_20","Hammer_28","Hammer_34"); BaseDmg=55; Class="Warrior" },
  @{ Name="Scythe";      Icons=@("Scythe_01","Scythe_02","Scythe_03","Scythe_04","Scythe_05","Scythe_06"); BaseDmg=48; Class="Worge" },
  @{ Name="Polearm";     Icons=@("Spear_31","Spear_32","Spear_33","Spear_34","Spear_35","Spear_36"); BaseDmg=44; Class="Warrior/Ranger" },
  @{ Name="Flail";       Icons=@("Hammer_03","Hammer_09","Hammer_15","Hammer_22","Hammer_29","Hammer_35"); BaseDmg=38; Class="Warrior" }
)

$setNames = @("Ironbound","Bloodforged","Stormborn","Emberforged","Frostbound","Voidtouched")

$tiers = @(
  @{ T=1; Lv=5;  Mult=1.0;  Def=5;  Slots=1; Buy=150;   Sell=60;    Cls="tier-1" },
  @{ T=2; Lv=10; Mult=1.4;  Def=8;  Slots=1; Buy=300;   Sell=120;   Cls="tier-2" },
  @{ T=3; Lv=15; Mult=1.9;  Def=12; Slots=2; Buy=600;   Sell=240;   Cls="tier-2" },
  @{ T=4; Lv=20; Mult=2.5;  Def=17; Slots=2; Buy=1200;  Sell=480;   Cls="tier-3" },
  @{ T=5; Lv=25; Mult=3.2;  Def=23; Slots=3; Buy=2500;  Sell=1000;  Cls="tier-3" },
  @{ T=6; Lv=30; Mult=4.2;  Def=30; Slots=3; Buy=5000;  Sell=2000;  Cls="tier-4" },
  @{ T=7; Lv=35; Mult=5.5;  Def=40; Slots=4; Buy=10000; Sell=4000;  Cls="tier-4" },
  @{ T=8; Lv=40; Mult=7.0;  Def=52; Slots=4; Buy=25000; Sell=10000; Cls="tier-5" }
)

$sb = [System.Text.StringBuilder]::new(1200000)
$count = 0

foreach ($wt in $weaponTypes) {
  for ($s = 0; $s -lt 6; $s++) {
    $setName = $setNames[$s]
    $icon = $wt.Icons[$s]
    foreach ($tier in $tiers) {
      $t = $tier.T
      $itemName = "$setName $($wt.Name) T$t"
      $dmg = [math]::Round($wt.BaseDmg * $tier.Mult)
      $def = $tier.Def
      $lv = $tier.Lv
      $slots = $tier.Slots
      $buy = $tier.Buy
      $sell = $tier.Sell
      $cls = $tier.Cls
      $classInfo = $wt.Class

      [void]$sb.AppendLine(" <div class=`"item-card`" data-name=`"$itemName`" data-category=`"weapon`">")
      [void]$sb.AppendLine("  <div class=`"item-icon`">")
      [void]$sb.AppendLine("   <img src=`"$ICO/$icon.png`" alt=`"$itemName`" loading=`"lazy`">")
      [void]$sb.AppendLine("  </div>")
      [void]$sb.AppendLine("  <span class=`"tier-badge $cls`">T$t</span>")
      [void]$sb.AppendLine("  <div class=`"item-name`">$itemName</div>")
      [void]$sb.AppendLine("  <div class=`"item-category`">`u{2694}`u{FE0F} Weapon `u{2014} $($wt.Name)</div>")
      [void]$sb.AppendLine("  <div class=`"item-stats`">")
      [void]$sb.AppendLine("   <div>`u{1F4CA} Required Level: $lv</div>")
      [void]$sb.AppendLine("   <div class=`"stat-positive`">`u{2694}`u{FE0F} +$dmg Damage</div>")
      [void]$sb.AppendLine("   <div class=`"stat-positive`">`u{1F6E1}`u{FE0F} +$def Defense</div>")
      [void]$sb.AppendLine("   <div>`u{1F3AF} Tier: T$t</div>")
      [void]$sb.AppendLine("   <div>`u{1F513} Skill Slots: $slots</div>")
      [void]$sb.AppendLine("   <div>`u{2699}`u{FE0F} Class: $classInfo</div>")
      [void]$sb.AppendLine("   <div>`u{1F4B0} Sell Price: $sell gold</div>")
      [void]$sb.AppendLine("   <div>`u{1F4B0} Buy Price: $buy gold</div>")
      [void]$sb.AppendLine("  </div>")
      [void]$sb.AppendLine("  <div class=`"tooltip`"><b>$itemName</b> `u{2014} $setName $($wt.Name) | $dmg Damage | $def Defense | T$t | Class: $classInfo | <i>Sells for: $sell Gold</i></div>")
      [void]$sb.AppendLine(" </div>")
      $count++
    }
  }
}

$html = $sb.ToString()
Write-Host "Generated $count tier weapon cards ($($html.Length) bytes)"

$filePath = "C:\Users\nugye\Documents\GitHub\ObjectStore\GRUDGE_Item_Database.html"
$content = [System.IO.File]::ReadAllText($filePath)

$footerMarker = '<div class="footer">'
$injection = "`n<!-- TIER WEAPONS (17 types x 6 sets x 8 tiers = $count items) -->`n$html"
$idx = $content.IndexOf($footerMarker)
if ($idx -lt 0) { Write-Error "Footer not found!"; exit 1 }

$newContent = $content.Substring(0, $idx) + $injection + $content.Substring($idx)

$oldTotal = 2614
$newTotal = $oldTotal + $count
$newContent = $newContent.Replace("Total Items: $oldTotal", "Total Items: $newTotal")

[System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
Write-Host "Done! Injected $count weapons. New total: $newTotal items."
