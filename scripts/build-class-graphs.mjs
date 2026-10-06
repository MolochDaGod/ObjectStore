/**
 * Add profession-style graph nodes onto master-skillTrees.json.
 * L0 is spec identity. Path nodes sit between pick tiers.
 */
import fs from 'node:fs';

const PATH = 'F:/GitHub/ObjectStore/api/v1/master-skillTrees.json';
const j = JSON.parse(fs.readFileSync(PATH, 'utf8'));

const BRANCH = {
  Core: { stroke: '#fbbf24', fill: 'rgba(251,191,36,0.25)' },
  Path: { stroke: '#64748b', fill: 'rgba(100,116,139,0.2)' },
  Left: { stroke: '#f97316', fill: 'rgba(249,115,22,0.2)' },
  Right: { stroke: '#6366f1', fill: 'rgba(99,102,241,0.2)' },
  Center: { stroke: '#22c55e', fill: 'rgba(34,197,94,0.2)' },
};

function graphFromTiers(tree) {
  const color = tree.color || '#d4a84b';
  const nodes = [];
  let id = 1;
  // Profession coords: high y = top of screen. Grow downward (lower y).
  const yTier = [92, 76, 60, 44, 28, 12];
  const yPath = [84, 68, 52, 36, 20];
  let hubId = null;

  (tree.tiers || []).forEach((tier, ti) => {
    const req = tier.requiredLevel | 0;
    if (ti > 0) {
      const path = {
        uuid: `NODE-CLASS-${tree.className || 'c'}-P${ti}`,
        id,
        name: `${tier.name || 'Path'}`,
        x: 50,
        y: yPath[ti - 1],
        reqLevel: Math.max(0, req - 1),
        parent: hubId,
        branch: 'Path',
        nodeType: 'stat',
        description: `Path node — spend to open ${tier.name || 'next picks'}.`,
        skillId: null,
        path: true,
        bonuses: [],
        unlocks: [],
        branchColor: BRANCH.Path,
      };
      nodes.push(path);
      hubId = id;
      id += 1;
    }

    const skills = tier.skills || [];
    const xs =
      skills.length <= 1
        ? [50]
        : skills.length === 2
          ? [32, 68]
          : skills.length === 3
            ? [22, 50, 78]
            : skills.map((_, i) => 18 + (i * 64) / (skills.length - 1));

    const skillIds = [];
    skills.forEach((sk, si) => {
      const branch = ti === 0 ? 'Core' : si === 0 ? 'Left' : si === 1 ? 'Right' : 'Center';
      nodes.push({
        uuid: `NODE-CLASS-${sk.id || id}`,
        id,
        name: sk.name,
        x: xs[si],
        y: yTier[ti] ?? 8,
        reqLevel: req,
        parent: hubId,
        branch,
        nodeType: sk.passive ? 'effect' : 'combat',
        description: sk.description || sk.effect || '',
        skillId: sk.id,
        l0: ti === 0,
        bonuses: [],
        unlocks: [],
        branchColor: BRANCH[branch] || { stroke: color, fill: 'rgba(212,168,75,0.2)' },
      });
      skillIds.push(id);
      id += 1;
    });
    if (ti === 0 && skillIds.length) hubId = skillIds[0];
  });

  const branches = [
    { name: 'Core', color: BRANCH.Core, nodeCount: nodes.filter((n) => n.branch === 'Core').length },
    { name: 'Path', color: BRANCH.Path, nodeCount: nodes.filter((n) => n.branch === 'Path').length },
    { name: 'Left', color: BRANCH.Left, nodeCount: nodes.filter((n) => n.branch === 'Left').length },
    { name: 'Right', color: BRANCH.Right, nodeCount: nodes.filter((n) => n.branch === 'Right').length },
    { name: 'Center', color: BRANCH.Center, nodeCount: nodes.filter((n) => n.branch === 'Center').length },
  ].filter((b) => b.nodeCount);

  return { totalNodes: nodes.length, branches, nodes };
}

for (const [key, tree] of Object.entries(j.skillTrees || {})) {
  const g = graphFromTiers(tree);
  tree.family = tree.family || ({
    priest: 'mage', raider: 'warrior', thief: 'ranger', verduror: 'worge',
    mage: 'mage', warrior: 'warrior', ranger: 'ranger', worge: 'worge',
  }[key] || key);
  tree.graph = g;
  const l0 = (tree.tiers?.[0]?.skills || [])[0];
  tree.specIdentity = l0
    ? { skillId: l0.id, name: l0.name, description: l0.description || l0.effect }
    : null;
}

j.graphNote =
  'Each class.graph uses the same node schema as master-professionTrees (x/y 0–100, parent, branch, nodeType). Path nodes sit between pick tiers. L0 skill is spec identity — swap family spec by reset + different L0, or rewrite with the same L0.';
j.generated = new Date().toISOString();
fs.writeFileSync(PATH, JSON.stringify(j, null, 2) + '\n');
console.log('graphs', Object.fromEntries(Object.entries(j.skillTrees).map(([k, t]) => [k, t.graph.totalNodes])));
