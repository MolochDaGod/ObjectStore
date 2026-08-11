import fs from 'node:fs';
const s = fs.readFileSync(new URL('../main-panel.html', import.meta.url), 'utf8');
const c = {
  mainScroll: s.includes('id="mainScroll"'),
  noContentScroll: !s.includes('id="contentScroll"'),
  noInvScroll: !s.includes('id="invScroll"'),
  singleInit: s.includes('_mainScrollApi'),
  tabInd: s.includes('updateTabIndicator'),
  switchAnim: s.includes('is-tab-enter') && s.includes('_mainScrollApi?.snapOpen'),
  bagQty: s.includes('function bagQty('),
  pushBag: s.includes('function pushBag'),
  demoMats: s.includes('demo-mat'),
  chip: s.includes('inv-uuid-chip'),
  noFrame: !s.includes('craft-suite-frame'),
  roleTab: s.includes('role="tab"'),
  bagQtyWired: s.includes('typeof bagQty ===') || s.includes('bagQty(idOrName)'),
};
console.log(c);
const fail = Object.entries(c).filter(([, v]) => !v).map(([k]) => k);
if (fail.length) {
  console.error('FAIL', fail);
  process.exit(1);
}
console.log('OK main-panel canvas contract');
