/**
 * Warlord Crafting Suite Integration
 * 
 * React/TypeScript integration for Arsenal tab
 * Connects to ObjectStore API and displays items with tier system
 * 
 * Usage in Warlord-Crafting-Suite:
 * 1. Copy this file to src/integrations/
 * 2. Import in Arsenal tab component
 * 3. Use <ArsenalWeapons /> component
 */

import React, { useState, useEffect } from 'react';
import { initGrudgeStudio, type GrudgeStudioAPI } from '@grudge-studio/core';

// Types
interface Weapon {
  id: string;
  uuid?: string;
  name: string;
  category: string;
  primaryStat: string;
  secondaryStat?: string;
  tier?: number;
  emoji: string;
  icon?: string;
}

interface ArsenalFilters {
  category?: string;
  tier?: number;
  search?: string;
}

/**
 * Arsenal Weapons Component
 * Displays all weapons from ObjectStore with filtering
 */
export function ArsenalWeapons() {
  const [api, setApi] = useState<GrudgeStudioAPI | null>(null);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [filters, setFilters] = useState<ArsenalFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Grudge Studio API
  useEffect(() => {
    const init = async () => {
      try {
        const grudgeApi = await initGrudgeStudio({
          arsenalUrl: window.location.origin, // Current Arsenal URL
          debug: process.env.NODE_ENV === 'development'
        });

        setApi(grudgeApi);

        // Load weapons
        const weaponsData = await grudgeApi.objectStore.loadWeapons();
        
        // Flatten weapons from all categories
        const allWeapons: Weapon[] = [];
        for (const [category, data] of Object.entries(weaponsData.categories)) {
          if (data.items) {
            for (const item of data.items) {
              // Generate T1-T8 versions
              for (let tier = 1; tier <= 8; tier++) {
                allWeapons.push({
                  ...item,
                  uuid: grudgeApi.uuid.generate('equipment', `${item.id}-t${tier}`),
                  tier,
                  category
                });
              }
            }
          }
        }

        setWeapons(allWeapons);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load weapons');
        setLoading(false);
      }
    };

    init();
  }, []);

  // Filter weapons
  const filteredWeapons = weapons.filter(weapon => {
    if (filters.category && weapon.category !== filters.category) {
      return false;
    }
    
    if (filters.tier && weapon.tier !== filters.tier) {
      return false;
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return weapon.name.toLowerCase().includes(search) ||
             weapon.id.toLowerCase().includes(search);
    }
    
    return true;
  });

  // Get unique categories
  const categories = Array.from(new Set(weapons.map(w => w.category)));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        <p className="ml-4 text-gold-500">Loading Arsenal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
        <h3 className="text-red-500 font-bold mb-2">Failed to Load Arsenal</h3>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="arsenal-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-cinzel font-bold text-gold-gradient mb-2">
          ⚔️ Arsenal
        </h1>
        <p className="text-gray-400">
          {filteredWeapons.length} weapons • {categories.length} categories • T1-T8 tiers
        </p>
      </div>

      {/* Filters */}
      <div className="filters bg-card rounded-lg p-6 mb-6 flex flex-wrap gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search weapons..."
          className="flex-1 min-w-[200px] px-4 py-2 bg-dark border border-border rounded-lg text-white"
          value={filters.search || ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        {/* Category Filter */}
        <select
          className="px-4 py-2 bg-dark border border-border rounded-lg text-white"
          value={filters.category || 'all'}
          onChange={(e) => setFilters({ ...filters, category: e.target.value === 'all' ? undefined : e.target.value })}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Tier Filter */}
        <div className="flex gap-2 items-center">
          <span className="text-gray-400 text-sm">Tier:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(tier => (
            <button
              key={tier}
              className={`tier-btn tier-${tier} ${filters.tier === tier ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, tier: filters.tier === tier ? undefined : tier })}
            >
              {tier}
            </button>
          ))}
          {filters.tier && (
            <button
              className="text-gray-400 hover:text-white text-sm"
              onClick={() => setFilters({ ...filters, tier: undefined })}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Weapons Grid */}
      <div className="items-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredWeapons.map(weapon => (
          <WeaponCard key={weapon.uuid} weapon={weapon} />
        ))}
      </div>

      {filteredWeapons.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl mb-2">No weapons found</p>
          <p>Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Weapon Card Component
 */
function WeaponCard({ weapon }: { weapon: Weapon }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Get tier color
  const getTierColor = (tier: number) => {
    const colors = [
      '#8b7355', // T1 - Bronze
      '#a8a8a8', // T2 - Silver
      '#4a9eff', // T3 - Blue
      '#9d4dff', // T4 - Purple
      '#ff4d4d', // T5 - Red
      '#ffaa00', // T6 - Orange
      '#d4a84b', // T7 - Gold
      '#f0d890'  // T8 - Legendary
    ];
    return colors[tier - 1];
  };

  return (
    <div 
      className={`item-card tier-${weapon.tier}`}
      data-tier={weapon.tier}
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Tier Badge */}
      <span className={`tier-badge tier-${weapon.tier}`}>
        T{weapon.tier}
      </span>

      {/* Image Container */}
      <div className="item-image-container">
        {imageUrl ? (
          <img src={imageUrl} alt={weapon.name} className="item-image" />
        ) : (
          <div className="item-image-skeleton"></div>
        )}
      </div>

      {/* Weapon Info */}
      <div className="item-name">{weapon.name}</div>
      <div className="item-meta">{weapon.primaryStat}</div>

      {/* Details Modal */}
      {showDetails && (
        <div className="absolute inset-0 bg-black/90 p-4 rounded-lg z-10" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-bold mb-2">{weapon.name}</h3>
          <p className="text-sm text-gray-400 mb-2">UUID: {weapon.uuid}</p>
          <p className="text-sm"><strong>Primary:</strong> {weapon.primaryStat}</p>
          {weapon.secondaryStat && (
            <p className="text-sm"><strong>Secondary:</strong> {weapon.secondaryStat}</p>
          )}
          <p className="text-sm"><strong>Tier:</strong> {weapon.tier}</p>
          <p className="text-sm"><strong>Category:</strong> {weapon.category}</p>
          
          <button
            className="mt-4 px-4 py-2 bg-gold-600 text-black rounded"
            onClick={() => {
              navigator.clipboard.writeText(weapon.uuid || '');
              alert('UUID copied!');
            }}
          >
            Copy UUID
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Arsenal Integration Hook
 * Use this to access Arsenal features from any component
 */
export function useArsenal() {
  const [api, setApi] = useState<GrudgeStudioAPI | null>(null);

  useEffect(() => {
    initGrudgeStudio().then(setApi);
  }, []);

  return {
    api,
    createWeapon: (data: Partial<Weapon>) => api?.createItem({ type: 'equipment', ...data }),
    searchWeapons: (query: string) => api?.search(query, { type: 'weapon' }),
    getStatus: () => api?.getStatus()
  };
}

export default ArsenalWeapons;
