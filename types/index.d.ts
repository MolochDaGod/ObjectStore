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

export interface Weapon extends GrudgeItem {
  type: 'weapon';
  weaponCategory: 'swords' | 'axes1h' | 'daggers' | 'bows' | 'crossbows' | 
                   'hammers1h' | 'spears' | 'fireStaves' | 'frostStaves' | 'holyStaves';
  damage?: number;
  attackSpeed?: number;
  range?: number;
}

export interface Armor extends GrudgeItem {
  type: 'armor';
  slot: 'helm' | 'chest' | 'boots' | 'gloves' | 'pants' | 'belt' | 
        'shoulder' | 'bracer' | 'ring' | 'necklace' | 'back';
  armorValue?: number;
  armorType?: 'cloth' | 'leather' | 'metal';
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
  chest?: Armor;
  boots?: Armor;
  gloves?: Armor;
  pants?: Armor;
  ring1?: Armor;
  ring2?: Armor;
  necklace?: Armor;
  back?: Armor;
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
  
  getWeapons(): Promise<any>;
  getWeaponsByCategory(category: string): Promise<any>;
  getMaterials(): Promise<any>;
  getMaterialsByTier(tier: number): Promise<Material[]>;
  getRaces(): Promise<any>;
  getClasses(): Promise<any>;
  getFactions(): Promise<any>;
  search(query: string): Promise<any>;
  
  static generateGrudgeUuid(entityType: string, metadata?: string): string;
  static parseGrudgeUuid(uuid: string): ParsedUUID | null;
  static isValidGrudgeUuid(uuid: string): boolean;
  static PREFIX_MAP: Record<string, string>;
}

// ==========================================
// EXPORTS
// ==========================================

export default GrudgeStudioAPI;
