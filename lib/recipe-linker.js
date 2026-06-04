/**
 * Grudge Game Data Hub — Recipe Linker
 * Links items → recipes → materials → skill tree unlocks.
 */

export class RecipeLinker {
  constructor(items, recipes, materials) {
    this.itemMap = new Map();
    this.recipeMap = new Map();
    this.materialMap = new Map();
    this.itemToRecipe = new Map();

    if (items?.items) items.items.forEach(i => this.itemMap.set(i.uuid, i));
    if (recipes?.recipes) recipes.recipes.forEach(r => {
      this.recipeMap.set(r.uuid, r);
      this.itemToRecipe.set(r.resultItemId, r);
    });
    if (materials?.materials) materials.materials.forEach(m => this.materialMap.set(m.uuid, m));
  }

  getItem(uuid) { return this.itemMap.get(uuid); }
  getRecipe(uuid) { return this.recipeMap.get(uuid); }
  getMaterial(uuid) { return this.materialMap.get(uuid); }
  getRecipeForItem(itemUuid) { return this.itemToRecipe.get(itemUuid); }

  getFullCraftingChain(itemUuid) {
    const item = this.getItem(itemUuid);
    if (!item) return null;
    const recipe = this.getRecipeForItem(item.baseUuid || itemUuid);
    if (!recipe) return { item, recipe: null, materials: [] };
    const materials = recipe.materials.map(m => ({
      ...m, detail: this.getMaterial(m.uuid),
    }));
    return { item, recipe, materials };
  }

  searchItems(query, filters = {}) {
    const q = (query || '').toLowerCase();
    let results = Array.from(this.itemMap.values());
    if (q) results = results.filter(i =>
      i.name.toLowerCase().includes(q) || (i.description||'').toLowerCase().includes(q));
    if (filters.type) results = results.filter(i => i.type === filters.type);
    if (filters.category) results = results.filter(i => i.category === filters.category);
    if (filters.tier !== undefined) results = results.filter(i => i.tier === parseInt(filters.tier));
    if (filters.craftedBy) results = results.filter(i => i.craftedBy === filters.craftedBy);
    return results;
  }

  getCategories() { return [...new Set(Array.from(this.itemMap.values()).map(i => i.category))]; }
  getStats() {
    const items = Array.from(this.itemMap.values());
    return {
      totalItems: items.length, totalRecipes: this.recipeMap.size,
      totalMaterials: this.materialMap.size,
      byType: items.reduce((acc, i) => { acc[i.type] = (acc[i.type]||0)+1; return acc; }, {}),
      byCategory: items.reduce((acc, i) => { acc[i.category] = (acc[i.category]||0)+1; return acc; }, {}),
    };
  }
}
