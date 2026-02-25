/**
 * Grudge Warlords Unity Integration
 * 
 * C# integration for Unity WebGL and standalone builds
 * Fetches data from ObjectStore API at runtime
 * 
 * Usage in GrudgeWarlords Unity project:
 * 1. Copy this file to Assets/Scripts/API/
 * 2. Attach GrudgeStudioManager to a GameObject
 * 3. Call await GrudgeStudioAPI.Initialize() on game start
 */

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;
using Newtonsoft.Json;

namespace GrudgeStudio
{
    /// <summary>
    /// Main API manager for Grudge Studio integrations
    /// </summary>
    public class GrudgeStudioAPI : MonoBehaviour
    {
        private static GrudgeStudioAPI instance;
        public static GrudgeStudioAPI Instance => instance;

        [Header("Configuration")]
        [SerializeField] private string objectStoreUrl = "https://molochdagod.github.io/ObjectStore";
        [SerializeField] private string arsenalUrl = "https://warlord-crafting-suite.vercel.app";
        [SerializeField] private bool enableCache = true;
        [SerializeField] private bool debugMode = false;

        // Cached data
        private Dictionary<string, object> cache = new Dictionary<string, object>();
        private WeaponsDatabase weaponsDB;
        private MaterialsDatabase materialsDB;
        private ArmorDatabase armorDB;

        public bool IsInitialized { get; private set; }

        private void Awake()
        {
            if (instance != null && instance != this)
            {
                Destroy(gameObject);
                return;
            }

            instance = this;
            DontDestroyOnLoad(gameObject);
        }

        /// <summary>
        /// Initialize all Grudge Studio systems
        /// </summary>
        public async Task<bool> Initialize()
        {
            if (IsInitialized)
            {
                Debug.Log("[GrudgeStudio] Already initialized");
                return true;
            }

            Debug.Log("[GrudgeStudio] Initializing...");
            float startTime = Time.realtimeSinceStartup;

            try
            {
                // Load core data in parallel
                await Task.WhenAll(
                    LoadWeapons(),
                    LoadMaterials(),
                    LoadArmor()
                );

                float duration = Time.realtimeSinceStartup - startTime;
                Debug.Log($"[GrudgeStudio] ✅ Initialized in {duration:F2}s");

                IsInitialized = true;
                return true;
            }
            catch (Exception ex)
            {
                Debug.LogError($"[GrudgeStudio] ❌ Initialization failed: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Load weapons database
        /// </summary>
        public async Task LoadWeapons()
        {
            string cacheKey = "weapons";
            
            if (enableCache && cache.ContainsKey(cacheKey))
            {
                weaponsDB = cache[cacheKey] as WeaponsDatabase;
                return;
            }

            string json = await FetchJSON($"{objectStoreUrl}/api/v1/weapons.json");
            weaponsDB = JsonConvert.DeserializeObject<WeaponsDatabase>(json);

            if (enableCache)
            {
                cache[cacheKey] = weaponsDB;
            }

            Debug.Log($"[GrudgeStudio] Loaded {weaponsDB.total} weapons");
        }

        /// <summary>
        /// Load materials database
        /// </summary>
        public async Task LoadMaterials()
        {
            string cacheKey = "materials";
            
            if (enableCache && cache.ContainsKey(cacheKey))
            {
                materialsDB = cache[cacheKey] as MaterialsDatabase;
                return;
            }

            string json = await FetchJSON($"{objectStoreUrl}/api/v1/materials.json");
            materialsDB = JsonConvert.DeserializeObject<MaterialsDatabase>(json);

            if (enableCache)
            {
                cache[cacheKey] = materialsDB;
            }

            Debug.Log($"[GrudgeStudio] Loaded materials database");
        }

        /// <summary>
        /// Load armor database
        /// </summary>
        public async Task LoadArmor()
        {
            string cacheKey = "armor";
            
            if (enableCache && cache.ContainsKey(cacheKey))
            {
                armorDB = cache[cacheKey] as ArmorDatabase;
                return;
            }

            string json = await FetchJSON($"{objectStoreUrl}/api/v1/armor.json");
            armorDB = JsonConvert.DeserializeObject<ArmorDatabase>(json);

            if (enableCache)
            {
                cache[cacheKey] = armorDB;
            }

            Debug.Log($"[GrudgeStudio] Loaded armor database");
        }

        /// <summary>
        /// Get weapon by ID
        /// </summary>
        public Weapon GetWeapon(string weaponId)
        {
            if (weaponsDB == null)
            {
                Debug.LogWarning("[GrudgeStudio] Weapons not loaded yet");
                return null;
            }

            foreach (var category in weaponsDB.categories.Values)
            {
                var weapon = category.items.Find(w => w.id == weaponId);
                if (weapon != null) return weapon;
            }

            return null;
        }

        /// <summary>
        /// Get all weapons in a category
        /// </summary>
        public List<Weapon> GetWeaponsByCategory(string category)
        {
            if (weaponsDB == null || !weaponsDB.categories.ContainsKey(category))
            {
                return new List<Weapon>();
            }

            return weaponsDB.categories[category].items;
        }

        /// <summary>
        /// Create item instance with GRUDGE UUID
        /// </summary>
        public GameItem CreateItem(string itemId, int tier = 1)
        {
            var weapon = GetWeapon(itemId);
            if (weapon == null)
            {
                Debug.LogError($"[GrudgeStudio] Weapon not found: {itemId}");
                return null;
            }

            return new GameItem
            {
                uuid = GenerateUUID("item", $"{itemId}-t{tier}"),
                itemId = itemId,
                name = weapon.name,
                tier = tier,
                primaryStat = weapon.primaryStat,
                secondaryStat = weapon.secondaryStat,
                category = weapon.category,
                createdAt = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Generate GRUDGE UUID
        /// </summary>
        public string GenerateUUID(string entityType, string metadata = "")
        {
            string prefix = GetPrefix(entityType);
            string timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            string sequence = UnityEngine.Random.Range(0, 16777215).ToString("X6");
            string hash = GenerateHash($"{prefix}-{timestamp}-{sequence}-{metadata}");

            return $"{prefix}-{timestamp}-{sequence}-{hash}";
        }

        private string GetPrefix(string entityType)
        {
            return entityType.ToUpper() switch
            {
                "HERO" => "HERO",
                "ITEM" => "ITEM",
                "EQUIPMENT" => "EQIP",
                "MATERIAL" => "MATL",
                "WEAPON" => "ITEM",
                _ => entityType.Substring(0, Math.Min(4, entityType.Length)).ToUpper()
            };
        }

        private string GenerateHash(string input)
        {
            uint hash = 0x811c9dc5;
            foreach (char c in input)
            {
                hash ^= c;
                hash *= 0x01000193;
            }
            return hash.ToString("X8").Substring(0, 8);
        }

        /// <summary>
        /// Fetch JSON from URL
        /// </summary>
        private async Task<string> FetchJSON(string url)
        {
            using (UnityWebRequest request = UnityWebRequest.Get(url))
            {
                var operation = request.SendWebRequest();

                while (!operation.isDone)
                {
                    await Task.Yield();
                }

                if (request.result != UnityWebRequest.Result.Success)
                {
                    throw new Exception($"Failed to fetch {url}: {request.error}");
                }

                return request.downloadHandler.text;
            }
        }

        /// <summary>
        /// Clear all cached data
        /// </summary>
        public void ClearCache()
        {
            cache.Clear();
            weaponsDB = null;
            materialsDB = null;
            armorDB = null;
            IsInitialized = false;
            Debug.Log("[GrudgeStudio] Cache cleared");
        }
    }

    // Data Models

    [Serializable]
    public class WeaponsDatabase
    {
        public string version;
        public int total;
        public int tiers;
        public Dictionary<string, WeaponCategory> categories;
    }

    [Serializable]
    public class WeaponCategory
    {
        public string iconBase;
        public int iconMax;
        public List<Weapon> items;
    }

    [Serializable]
    public class Weapon
    {
        public string id;
        public string name;
        public string primaryStat;
        public string secondaryStat;
        public string emoji;
        public string grudgeType;
        [NonSerialized] public string category;
    }

    [Serializable]
    public class MaterialsDatabase
    {
        public Dictionary<string, MaterialCategory> categories;
    }

    [Serializable]
    public class MaterialCategory
    {
        public List<Material> items;
    }

    [Serializable]
    public class Material
    {
        public string id;
        public string name;
        public int tier;
        public string gatheredBy;
        public string emoji;
    }

    [Serializable]
    public class ArmorDatabase
    {
        public Dictionary<string, ArmorSlot> slots;
    }

    [Serializable]
    public class ArmorSlot
    {
        public string name;
        public string iconBase;
        public string iconFolder;
        public int maxIcons;
    }

    [Serializable]
    public class GameItem
    {
        public string uuid;
        public string itemId;
        public string name;
        public int tier;
        public string primaryStat;
        public string secondaryStat;
        public string category;
        public DateTime createdAt;
    }
}
