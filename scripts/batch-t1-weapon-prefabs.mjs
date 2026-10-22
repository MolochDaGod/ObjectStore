/**
 * Extract author FBX (AXES / AXESAND2H / HAMMERS2H / BOW / CROSSSBOW),
 * convert via Blender, bind onto existing T1 prefab rows. Does not invent items.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// unzip via powershell if needed

const BLENDER = process.env.BLENDER_PATH || 'C:/Users/nugye/tools/Blender/blender.exe';
const ROOT = 'C:/Users/nugye/Desktop/grudgeproduction';
const CAST = 'C:/Users/nugye/Documents/CastingAbilitiesThreeJS';
const OS = 'F:/GitHub/ObjectStore';
const WORK = 'C:/Users/nugye/Documents/weapons-t1-inbox';
const T1_OUT = path.join(CAST, 'public/models/weapons/t1');
const PY = path.join(WORK, '_fbx2glb.py');

const BATCH = [
  { zip: 'AXES.zip', glob: /^fbx\/_axe_([1-6])\.fbx$/i, type: 'AXE', prefix: 'axe' },
  { zip: 'AXESAND2H.zip', glob: /^fbx\/_axe_(2[0-5])\.fbx$/i, type: 'GREATAXE', prefix: 'greataxe' },
  { zip: 'HAMMERS2H.zip', glob: /^fbx\/_hammer_([1-7])\.fbx$/i, type: 'HAMMER', prefix: 'hammer' },
  { zip: 'BOW.zip', glob: /^fbx\/bow_full\/_bow_([1-6])\.fbx$/i, type: 'BOW', prefix: 'bow' },
  { zip: 'CROSSSBOW.zip', glob: /^fbx\/fbx_full\/_crossbow_([1-6])\.fbx$/i, type: 'CROSSBOW', prefix: 'crossbow' },
];

function ps(cmd) {
  execFileSync('powershell.exe', ['-NoProfile', '-Command', cmd], { stdio: 'inherit' });
}

fs.mkdirSync(WORK, { recursive: true });
fs.mkdirSync(T1_OUT, { recursive: true });

fs.writeFileSync(
  PY,
  `
import bpy, sys
argv = sys.argv[sys.argv.index("--")+1:]
src, dst = argv[0], argv[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=src)
# drop to SI-ish weapon size: author packs are often cm
for o in list(bpy.data.objects):
    if o.type == 'MESH':
        o.scale = (0.01, 0.01, 0.01)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_apply=True, export_animations=False)
`,
);

const inventory = { generated: new Date().toISOString(), items: [] };

for (const job of BATCH) {
  const zipPath = path.join(ROOT, job.zip);
  if (!fs.existsSync(zipPath)) {
    console.warn('missing zip', job.zip);
    continue;
  }
  const destDir = path.join(WORK, job.prefix);
  fs.mkdirSync(destDir, { recursive: true });
  const tmpZipList = path.join(WORK, `${job.prefix}-list.txt`);
  ps(`Add-Type -AssemblyName System.IO.Compression.FileSystem; $z=[IO.Compression.ZipFile]::OpenRead('${zipPath.replace(/'/g, "''")}'); $z.Entries | ForEach-Object { $_.FullName } | Set-Content '${tmpZipList}' ; $z.Dispose()`);
  const names = fs.readFileSync(tmpZipList, 'utf8').split(/\r?\n/).filter(Boolean);
  const picks = names.filter((n) => job.glob.test(n.replace(/\\/g, '/')));
  console.log(job.zip, 'picks', picks.length, picks);
  for (const entry of picks) {
    const m = entry.replace(/\\/g, '/').match(job.glob);
    const n = m ? m[1] : path.basename(entry, '.fbx');
    const fbx = path.join(destDir, `${job.prefix}_${n}.fbx`);
    const glbName = `${job.prefix}_${n}.glb`;
    const glb = path.join(WORK, glbName);
    ps(`Add-Type -AssemblyName System.IO.Compression.FileSystem; $z=[IO.Compression.ZipFile]::OpenRead('${zipPath.replace(/'/g, "''")}'); $e=$z.GetEntry('${entry.replace(/\\/g, '/')}'); if(-not $e){ $e=$z.Entries | Where-Object { $_.FullName -eq '${entry}' } | Select-Object -First 1 }; [IO.Compression.ZipFileExtensions]::ExtractToFile($e, '${fbx.replace(/'/g, "''")}', $true); $z.Dispose()`);
    if (!fs.existsSync(fbx)) {
      inventory.items.push({ srcName: glbName, file: glbName, guess: job.type, error: 'extract failed', pack: job.zip });
      continue;
    }
    try {
      execFileSync(BLENDER, ['-b', '-P', PY, '--', fbx, glb], { stdio: 'inherit' });
      fs.copyFileSync(glb, path.join(T1_OUT, glbName));
      inventory.items.push({
        srcName: `${job.prefix}_${n}`,
        file: glbName,
        guess: job.type,
        pack: job.zip,
        license: 'author-pack / Toon RTS kit',
        si: { note: '0.01 scale apply in blender' },
      });
    } catch (e) {
      inventory.items.push({ srcName: glbName, file: glbName, guess: job.type, error: String(e.message || e), pack: job.zip });
    }
  }
}

fs.writeFileSync(path.join(CAST, 'tmp/t1-inbox-inventory.json'), JSON.stringify(inventory, null, 2));
fs.writeFileSync(path.join(WORK, 'inventory.json'), JSON.stringify(inventory, null, 2));
console.log('inventory', inventory.items.length, 'ok', inventory.items.filter((i) => !i.error).length);
