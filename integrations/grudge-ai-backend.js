/**
 * Grudge Studio AI Backend Integration
 * 
 * Connects to Grudge Studio's specialized AI agents:
 * - Code Agent: Code generation and refactoring
 * - Art Agent: Asset generation and style guidance
 * - Lore Agent: World building and narrative consistency
 * - Balance Agent: Game balance analysis and tuning
 * - QA Agent: Testing strategies and bug detection
 * - Mission Agent: Quest and mission design
 * 
 * Also integrates with GAME_API_GRUDA for local IDE connection
 * and Puter for AI research capabilities.
 * 
 * @package @grudgstudio/core
 * @version 2.1.0
 */

import puter from 'https://js.puter.com/v2/';

/**
 * AI Agent definitions
 */
const AI_AGENTS = {
  code: {
    name: 'Code Agent',
    description: 'Generates and refactors game code, implements features',
    capabilities: ['code-generation', 'refactoring', 'bug-fixing', 'optimization'],
    model: 'gpt-4',
    systemPrompt: 'You are a senior game developer specializing in Grudge Warlords MMO development.'
  },
  art: {
    name: 'Art Agent',
    description: 'Generates game assets, provides style guidance',
    capabilities: ['asset-generation', 'style-guide', 'icon-design', 'sprite-optimization'],
    model: 'gpt-4',
    systemPrompt: 'You are a game artist specializing in dark fantasy MMO aesthetics.'
  },
  lore: {
    name: 'Lore Agent',
    description: 'Creates world lore, maintains narrative consistency',
    capabilities: ['world-building', 'character-backstory', 'quest-narrative', 'faction-lore'],
    model: 'gpt-4',
    systemPrompt: 'You are a fantasy world builder for Grudge Warlords MMO, maintaining consistency across all game lore.'
  },
  balance: {
    name: 'Balance Agent',
    description: 'Analyzes and tunes game balance',
    capabilities: ['stat-analysis', 'progression-tuning', 'economy-balance', 'pvp-balance'],
    model: 'gpt-4',
    systemPrompt: 'You are a game balance specialist for MMOs with deep understanding of progression systems.'
  },
  qa: {
    name: 'QA Agent',
    description: 'Creates test strategies, detects potential bugs',
    capabilities: ['test-planning', 'bug-detection', 'edge-case-analysis', 'performance-testing'],
    model: 'gpt-4',
    systemPrompt: 'You are a QA engineer specializing in MMO testing and quality assurance.'
  },
  mission: {
    name: 'Mission Agent',
    description: 'Designs quests and missions',
    capabilities: ['quest-design', 'mission-flow', 'reward-structure', 'difficulty-scaling'],
    model: 'gpt-4',
    systemPrompt: 'You are a mission designer for MMOs, creating engaging quest content and progression.'
  }
};

/**
 * AI Backend Client
 * Manages connection to Grudge Studio AI systems
 */
export class AIBackendClient {
  constructor(config = {}) {
    this.config = {
      aiBackendUrl: config.aiBackendUrl || 'http://localhost:3000/api/ai',
      gameApiUrl: config.gameApiUrl || 'http://localhost:4000/api/gruda',
      puterEnabled: config.puterEnabled !== false,
      debug: config.debug || false,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000
    };

    this.initialized = false;
    this.requestQueue = [];
    this.activeRequests = 0;
    this.maxConcurrent = 3;
    this.puter = null;

    if (this.config.debug) {
      console.log('🤖 AI Backend Client initialized', this.config);
    }
  }

  /**
   * Initialize AI backend connections
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize Puter for AI research
      if (this.config.puterEnabled) {
        try {
          if (typeof puter !== 'undefined') {
            this.puter = puter;
            if (this.config.debug) {
              console.log('✅ Puter AI initialized');
            }
          }
        } catch (e) {
          console.warn('⚠️ Puter initialization failed:', e.message);
        }
      }

      // Test connection to AI backend
      await this._testConnection();

      this.initialized = true;
      
      if (this.config.debug) {
        console.log('✅ AI Backend fully initialized');
      }
    } catch (error) {
      console.error('❌ AI Backend initialization failed:', error);
      throw error;
    }
  }

  /**
   * Test connection to AI backend
   */
  async _testConnection() {
    try {
      const response = await fetch(`${this.config.aiBackendUrl}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`AI Backend not available: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (this.config.debug) {
        console.warn('⚠️ AI Backend not reachable, continuing in offline mode');
      }
      // Don't throw - allow offline operation
      return { available: false };
    }
  }

  /**
   * Query a specific AI agent
   */
  async queryAgent(request) {
    if (!request.agentType || !request.prompt) {
      throw new Error('AI request must include agentType and prompt');
    }

    const agent = AI_AGENTS[request.agentType];
    if (!agent) {
      throw new Error(`Unknown agent type: ${request.agentType}`);
    }

    if (this.config.debug) {
      console.log(`🤖 Querying ${agent.name}:`, request.prompt);
    }

    try {
      // Try AI backend first
      const response = await this._makeRequest('/query', {
        method: 'POST',
        body: JSON.stringify({
          agentType: request.agentType,
          prompt: request.prompt,
          context: request.context || {},
          options: {
            model: request.options?.model || agent.model,
            temperature: request.options?.temperature || 0.7,
            maxTokens: request.options?.maxTokens || 2000,
            systemPrompt: agent.systemPrompt
          }
        })
      });

      return {
        success: true,
        agentType: request.agentType,
        result: response.result,
        metadata: response.metadata || {},
        timestamp: new Date().toISOString(),
        tokensUsed: response.tokensUsed
      };
    } catch (error) {
      // Fallback to Puter if backend unavailable
      if (this.puter) {
        return await this._fallbackToPuter(request, agent);
      }
      
      throw error;
    }
  }

  /**
   * Fallback to Puter AI when backend unavailable
   */
  async _fallbackToPuter(request, agent) {
    try {
      const prompt = `${agent.systemPrompt}\n\nTask: ${request.prompt}\n\nContext: ${JSON.stringify(request.context || {})}`;
      
      const result = await this.puter.ai.chat(prompt, {
        model: 'gpt-4o-mini',
        temperature: request.options?.temperature || 0.7
      });

      return {
        success: true,
        agentType: request.agentType,
        result: result.message.content,
        metadata: { source: 'puter-fallback' },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`AI request failed: ${error.message}`);
    }
  }

  /**
   * Perform AI-powered research
   */
  async research(query) {
    if (!query.topic) {
      throw new Error('Research query must include topic');
    }

    if (this.config.debug) {
      console.log(`🔍 Researching: ${query.topic} (${query.category})`);
    }

    try {
      const response = await this._makeRequest('/research', {
        method: 'POST',
        body: JSON.stringify(query)
      });

      return {
        query: query.topic,
        findings: response.findings,
        confidence: response.confidence || 0.8,
        sources: response.sources || [],
        suggestions: response.suggestions || []
      };
    } catch (error) {
      // Fallback to Puter research
      if (this.puter) {
        return await this._puterResearch(query);
      }
      
      throw error;
    }
  }

  /**
   * Puter-powered research
   */
  async _puterResearch(query) {
    const prompt = `Research the following topic for the Grudge Warlords MMO:\n\nTopic: ${query.topic}\nCategory: ${query.category}\nContext: ${JSON.stringify(query.context || {})}\n\nProvide detailed findings, confidence level, and actionable suggestions.`;

    const result = await this.puter.ai.chat(prompt);
    
    return {
      query: query.topic,
      findings: result.message.content,
      confidence: 0.7,
      sources: ['puter-ai'],
      suggestions: []
    };
  }

  /**
   * Generate lore content
   */
  async generateLore(context) {
    const response = await this.queryAgent({
      agentType: 'lore',
      prompt: 'Generate lore content based on the provided context',
      context,
      options: { temperature: 0.8 }
    });

    return response.result;
  }

  /**
   * Balance an item
   */
  async balanceItem(item) {
    const response = await this.queryAgent({
      agentType: 'balance',
      prompt: `Analyze and suggest balance adjustments for this item: ${JSON.stringify(item)}`,
      context: { item },
      options: { temperature: 0.3 }
    });

    try {
      // Try to parse balanced item from response
      const balancedItem = JSON.parse(response.result);
      return { ...item, ...balancedItem };
    } catch {
      // Return original with suggestions in metadata
      return {
        ...item,
        _balanceSuggestions: response.result
      };
    }
  }

  /**
   * Design a mission
   */
  async designMission(parameters) {
    const response = await this.queryAgent({
      agentType: 'mission',
      prompt: `Design a mission with these parameters: ${JSON.stringify(parameters)}`,
      context: { parameters },
      options: { temperature: 0.7 }
    });

    try {
      return JSON.parse(response.result);
    } catch {
      return {
        title: 'Generated Mission',
        description: response.result,
        parameters
      };
    }
  }

  /**
   * Connect to GAME_API_GRUDA for local IDE integration
   */
  async connectToGameAPI(action, data) {
    try {
      const response = await fetch(`${this.config.gameApiUrl}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Source': 'grudge-studio-core'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`GAME_API_GRUDA error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (this.config.debug) {
        console.warn('⚠️ GAME_API_GRUDA not available:', error.message);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Get available AI agents
   */
  getAvailableAgents() {
    return Object.entries(AI_AGENTS).map(([type, agent]) => ({
      type,
      name: agent.name,
      description: agent.description,
      capabilities: agent.capabilities
    }));
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      available: this.initialized,
      puterEnabled: this.puter !== null,
      backendUrl: this.config.aiBackendUrl,
      gameApiUrl: this.config.gameApiUrl,
      agents: Object.keys(AI_AGENTS)
    };
  }

  /**
   * Make HTTP request with retry logic
   */
  async _makeRequest(endpoint, options) {
    const url = `${this.config.aiBackendUrl}${endpoint}`;
    let lastError;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        
        if (attempt < this.config.retryAttempts) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          if (this.config.debug) {
            console.log(`⏱️ Retry attempt ${attempt} after ${delay}ms`);
          }
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Queue request for rate limiting
   */
  async _queueRequest(requestFn) {
    if (this.activeRequests >= this.maxConcurrent) {
      await new Promise(resolve => {
        this.requestQueue.push(resolve);
      });
    }

    this.activeRequests++;
    
    try {
      return await requestFn();
    } finally {
      this.activeRequests--;
      
      if (this.requestQueue.length > 0) {
        const next = this.requestQueue.shift();
        next();
      }
    }
  }
}

// Export singleton instance
export const aiBackend = new AIBackendClient();
export default AIBackendClient;
