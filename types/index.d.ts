/**
 * Grudge Studio Core - TypeScript Definitions
 * @package @grudgstudio/core
 * @version 2.1.0
 */

// ==========================================
// CONFIGURATION
// ==========================================

export interface GrudgeStudioConfig {
  objectStoreUrl?: string;
  arsenalUrl?: string;
  aiBackendUrl?: string;
  gameApiUrl?: string;
  puterEnabled?: boolean;
  puterApiKey?: string;
  cacheEnabled?: boolean;
  debug?: boolean;
  environment?: 'development' | 'production' | 'test';
}

export interface AIAgentConfig {
  agentType: 'code' | 'art' | 'lore' | 'balance' | 'qa' | 'mission';
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// ==========================================
// ITEMS & ENTITIES
// ==========================================

export interface GrudgeItem {
  id: string;
  uuid?: string;
  name: string;
  type: 'weapon' | 'armor' | 'material' | 'consumable' | 'skill';
  category: string;
  tier?: number;
  primaryStat?: string;
  secondaryStat?: string;
  emoji?: string;
  description?: string;
  iconUrl?: string;
  createdAt?: string;
  source?: string;
}

export interface WeaponStats {
  damageBase: number;
  damagePerTier: number;
  speedBase: number;
  speedPerTier: number;
  comboBase: number;
  comboPerTier: number;
  critBase: number;
  critPerTier: number;
  blockBase: number;
  blockPerTier: number;
  defenseBase: number;
  defensePerTier: number;
}

export interface Weapon extends GrudgeItem {
  type: 'weapon';
  weaponCategory: 'swords' | 'axes1h' | 'daggers' | 'bows' | 'crossbows' | 'guns' |
                   'hammers1h' | 'hammers2h' | 'greatswords' | 'greataxes' |
                   'fireStaves' | 'frostStaves' | 'natureStaves' | 'holyStaves' | 'arcaneStaves' | 'lightningStaves' |
                   'fireTomes' | 'frostTomes' | 'natureTomes' | 'holyTomes' | 'arcaneTomes' | 'lightningTomes';
  stats?: WeaponStats;
  lore?: string;
  basicAbility?: string;
  abilities?: string[];
  signatureAbility?: string;
  passives?: string[];
  craftedBy?: 'Miner' | 'Forester' | 'Engineer' | 'Mystic';
  spritePath?: string | null;
}

export type ArmorSlot = 'Helm' | 'Shoulder' | 'Chest' | 'Hands' | 'Feet' | 'Ring' | 'Necklace' | 'Relic';
export type ArmorMaterial = 'Cloth' | 'Leather' | 'Metal' | 'Gem';

export interface ArmorStats {
  hpBase: number;
  hpPerTier: number;
  manaBase: number;
  manaPerTier: number;
  critBase: number;
  critPerTier: number;
  blockBase: number;
  blockPerTier: number;
  defenseBase: number;
  defensePerTier: number;
}

export interface Armor extends GrudgeItem {
  type: 'armor';
  slot: ArmorSlot;
  material: ArmorMaterial;
  stats?: ArmorStats;
  passive?: string;
  attribute?: string;
  effect?: string;
  proc?: string;
  setBonus?: string;
  spritePath?: string | null;
}

export interface Material extends GrudgeItem {
  type: 'material';
  materialCategory: 'ore' | 'wood' | 'cloth' | 'leather' | 'gem' | 'essence';
  tier: number;
  gatheredBy?: string;
  stackSize?: number;
}

export interface Hero {
  uuid: string;
  name: string;
  race: string;
  class: string;
  level: number;
  stats: HeroStats;
  inventory: GrudgeItem[];
  equipment: Equipment;
}

export interface HeroStats {
  strength: number;
  intellect: number;
  vitality: number;
  dexterity: number;
  endurance: number;
  wisdom: number;
  agility: number;
  tactics: number;
}

export interface Equipment {
  weapon?: Weapon;
  helm?: Armor;
  shoulder?: Armor;
  chest?: Armor;
  hands?: Armor;
  feet?: Armor;
  ring1?: Armor;
  ring2?: Armor;
  necklace?: Armor;
  relic?: Armor;
}

// ==========================================
// UUID SYSTEM
// ==========================================

export type EntityType = 
  | 'hero' | 'item' | 'equipment' | 'ability' | 'material' 
  | 'recipe' | 'node' | 'mob' | 'boss' | 'mission' 
  | 'infusion' | 'loot' | 'consumable' | 'quest' | 'zone' | 'save';

export type UUIDPrefix = 
  | 'HERO' | 'ITEM' | 'EQIP' | 'ABIL' | 'MATL' 
  | 'RECP' | 'NODE' | 'MOBS' | 'BOSS' | 'MISS' 
  | 'INFU' | 'LOOT' | 'CONS' | 'QUST' | 'ZONE' | 'SAVE';

export interface ParsedUUID {
  prefix: string;
  timestamp: string;
  sequence: string;
  hash: string;
  entityType: EntityType;
  createdAt: Date;
}

// ==========================================
// API RESPONSES
// ==========================================

export interface SearchResults {
  objectStore: GrudgeItem[];
  arsenal: any[];
  total: number;
}

export interface StatusResponse {
  objectStore: ServiceStatus;
  arsenal: ServiceStatus;
  puter: ServiceStatus;
  ai?: ServiceStatus;
  timestamp: string;
}

export interface ServiceStatus {
  available: boolean;
  url?: string;
  error?: string;
}

export interface InitializeResponse {
  success: boolean;
  duration?: number;
  error?: any;
}

// ==========================================
// AI BACKEND
// ==========================================

export interface AIAgent {
  type: 'code' | 'art' | 'lore' | 'balance' | 'qa' | 'mission';
  name: string;
  description: string;
  capabilities: string[];
}

export interface AIRequest {
  agentType: AIAgent['type'];
  prompt: string;
  context?: Record<string, any>;
  options?: AIRequestOptions;
}

export interface AIRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  streamResponse?: boolean;
}

export interface AIResponse {
  success: boolean;
  agentType: AIAgent['type'];
  result: string;
  metadata?: Record<string, any>;
  timestamp: string;
  tokensUsed?: number;
}

export interface ResearchQuery {
  topic: string;
  category: 'balance' | 'lore' | 'stats' | 'mission' | 'general';
  context?: Record<string, any>;
}

export interface ResearchResult {
  query: string;
  findings: string;
  confidence: number;
  sources: string[];
  suggestions?: string[];
}

// ==========================================
// ERROR HANDLING
// ==========================================

export class GrudgeAPIError extends Error {
  constructor(message: string, public code?: string, public details?: any);
}

export class NetworkError extends GrudgeAPIError {}
export class ValidationError extends GrudgeAPIError {}
export class AuthenticationError extends GrudgeAPIError {}
export class RateLimitError extends GrudgeAPIError {}

// ==========================================
// MAIN API CLASS
// ==========================================

export class GrudgeStudioAPI {
  constructor(config?: GrudgeStudioConfig);
  
  config: Required<GrudgeStudioConfig>;
  objectStore: ObjectStoreClient;
  arsenal: ArsenalClient;
  puter: PuterClient;
  ai: AIBackendClient;
  uuid: UUIDManager;
  
  initialize(): Promise<InitializeResponse>;
  getItem(identifier: string): Promise<GrudgeItem | null>;
  search(query: string, options?: SearchOptions): Promise<SearchResults>;
  createItem(data: Partial<GrudgeItem>): GrudgeItem;
  getStatus(): Promise<StatusResponse>;
}

export interface SearchOptions {
  tier?: number;
  type?: string;
  category?: string;
  source?: 'objectStore' | 'arsenal';
}

// ==========================================
// CLIENT CLASSES
// ==========================================

export class ObjectStoreClient {
  constructor(config: GrudgeStudioConfig);
  
  loadWeapons(): Promise<any>;
  loadMaterials(): Promise<any>;
  loadArmor(): Promise<any>;
  loadConsumables(): Promise<any>;
  loadSprites(): Promise<any>;
  findItem(id: string): Promise<GrudgeItem | null>;
  findMaterial(id: string): Promise<Material | null>;
  search(query: string, options?: SearchOptions): Promise<GrudgeItem[]>;
  getStatus(): Promise<ServiceStatus>;
}

export class ArsenalClient {
  constructor(config: GrudgeStudioConfig);
  
  getHero(uuid: string): Promise<Hero | null>;
  search(query: string, options?: SearchOptions): Promise<any[]>;
  getStatus(): Promise<ServiceStatus>;
}

export class PuterClient {
  constructor(config: GrudgeStudioConfig);
  
  initialize(): Promise<void>;
  generateImage(prompt: string, options?: ImageGenerationOptions): Promise<Blob>;
  storeFile(path: string, data: any): Promise<any>;
  getStatus(): ServiceStatus;
}

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  format?: 'png' | 'jpg' | 'webp';
  style?: string;
}

export class AIBackendClient {
  constructor(config: GrudgeStudioConfig);
  
  initialize(): Promise<void>;
  queryAgent(request: AIRequest): Promise<AIResponse>;
  research(query: ResearchQuery): Promise<ResearchResult>;
  generateLore(context: any): Promise<string>;
  balanceItem(item: GrudgeItem): Promise<GrudgeItem>;
  designMission(parameters: any): Promise<any>;
  getAvailableAgents(): AIAgent[];
  getStatus(): ServiceStatus;
}

export class UUIDManager {
  constructor(config: GrudgeStudioConfig);
  
  generate(entityType: EntityType, metadata?: string): string;
  parse(uuid: string): ParsedUUID | null;
  isValid(uuid: string): boolean;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export function initGrudgeStudio(config?: GrudgeStudioConfig): Promise<GrudgeStudioAPI>;
export function generateGrudgeUuid(entityType: EntityType, metadata?: string): string;
export function parseGrudgeUuid(uuid: string): ParsedUUID | null;
export function isValidGrudgeUuid(uuid: string): boolean;

// ==========================================
// LEGACY SDK
// ==========================================

export class GrudgeSDK {
  constructor(baseUrl?: string);
  
  // Weapons
  getWeapons(): Promise<any>;
  getWeaponsByCategory(category: string): Promise<any>;
  getWeapon(weaponId: string): Promise<Weapon | null>;
  getWeaponCategories(): Promise<string[]>;

  // Materials
  getMaterials(): Promise<any>;
  getMaterialsByCategory(category: string): Promise<any>;
  getMaterialsByTier(tier: number): Promise<Material[]>;
  getMaterialsByProfession(profession: string): Promise<Material[]>;

  // Armor
  getArmor(): Promise<any>;
  getArmorByMaterial(material: string): Promise<any>;
  getArmorBySlot(slot: ArmorSlot): Promise<Armor[] | null>;
  getArmorBySet(setName: string): Promise<Armor[] | null>;
  getArmorItem(armorId: string): Promise<Armor | null>;

  // Consumables
  getConsumables(): Promise<any>;
  getConsumablesByCategory(category: string): Promise<any>;
  getConsumablesByProfession(profession: string): Promise<any>;

  // Skills, Professions, Races, Classes, Factions, Attributes
  getSkills(): Promise<any>;
  getSkillsByWeapon(weaponType: string): Promise<any>;
  getSkill(skillId: string): Promise<any>;
  getProfessions(): Promise<any>;
  getProfession(professionId: string): Promise<any>;
  getRaces(): Promise<any>;
  getRace(raceId: string): Promise<any>;
  getRacesByFaction(factionId: string): Promise<any[]>;
  getClasses(): Promise<any>;
  getClass(classId: string): Promise<any>;
  getFactions(): Promise<any>;
  getFaction(factionId: string): Promise<any>;
  getAttributes(): Promise<any>;
  getAttribute(attributeId: string): Promise<any>;

  // Search & Icons
  search(query: string): Promise<SearchResults & { armor: Armor[] }>;
  getWeaponIconUrl(category: string, index: number, tier?: number): string | null;
  getArmorIconUrl(slot: string, tier?: number): string | null;
  getMaterialIconUrl(category: string, tier?: number): string | null;
  
  // UUID utilities
  static generateGrudgeUuid(entityType: string, metadata?: string): string;
  static parseGrudgeUuid(uuid: string): ParsedUUID | null;
  static isValidGrudgeUuid(uuid: string): boolean;
  static PREFIX_MAP: Record<string, string>;
}

// ==========================================
// EXPORTS
// ==========================================

export default GrudgeStudioAPI;
