const assert = require('assert');
const path = require('path');
const { pathToFileURL } = require('url');

async function run() {
  const mod = await import(pathToFileURL(path.join(__dirname, '..', 'workers', 'src', 'index.js')).href);
  const { paginateGameDataCollection } = mod;

  const source = {
    version: 'test',
    items: [
      { id: 'w_1', name: 'Iron Sword', category: 'weapon' },
      { id: 'w_2', name: 'Steel Axe', category: 'weapon' },
      { id: 'm_1', name: 'Iron Ore', category: 'material' },
      { id: 'w_3', name: 'Legendary Sword', category: 'weapon' },
    ],
  };

  const pageUrl = new URL('https://example.com/v1/game-data/master-items?page=1&pageSize=2');
  const pageRes = paginateGameDataCollection('master-items', source, pageUrl);
  const pageBody = await pageRes.json();
  assert.equal(pageBody.count, 2);
  assert.equal(pageBody.total, 4);
  assert.equal(pageBody.items[0].id, 'm_1');
  assert.equal(pageBody.hasMore, false);

  const filterUrl = new URL('https://example.com/v1/game-data/master-items?page=0&pageSize=10&q=sword');
  const filterRes = paginateGameDataCollection('master-items', source, filterUrl);
  const filterBody = await filterRes.json();
  assert.equal(filterBody.total, 2);
  assert.equal(filterBody.count, 2);
  assert.equal(filterBody.items[0].id, 'w_1');
  assert.equal(filterBody.items[1].id, 'w_3');
}

run()
  .then(() => console.log('game-data-pagination.test.cjs: PASS'))
  .catch((err) => {
    console.error('game-data-pagination.test.cjs: FAIL');
    console.error(err);
    process.exit(1);
  });
