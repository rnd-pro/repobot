/**
 * Configuration module for Repobot
 * @module repobot/config
 */

import { z } from 'zod';

/**
 * @typedef {Object} ConfigOptions
 * @property {Object} [ai] - AI configuration
 * @property {String} [ai.provider] - AI provider name
 * @property {String} [ai.apiKey] - AI API key
 * @property {String} [ai.model] - AI model name
 * @property {Object} [telegram] - Telegram configuration
 * @property {String} [telegram.botToken] - Telegram bot token
 * @property {String} [telegram.chatId] - Telegram chat ID
 * @property {String} [telegram.groupId] - Telegram group ID
 * @property {Object} [reporting] - Reporting configuration
 * @property {String} [reporting.schedule] - Report schedule (cron format)
 * @property {String} [reporting.template] - Report template name
 * @property {Object} [repository] - Repository configuration
 * @property {Object} [repository.paths] - Repository paths
 * @property {Array<String>} [repository.paths.todos] - Todo file patterns
 * @property {Array<String>} [repository.paths.documentation] - Documentation file patterns
 * @property {Object<string, any>} [options] - Additional configuration options
 */

/**
 * Configuration schema for validation
 */
const ConfigSchema = z.object({
  ai: z.object({
    provider: z.string(),
    apiKey: z.string().optional(),
    model: z.string().optional(),
  }).optional(),
  telegram: z.object({
    botToken: z.string().optional(),
    chatId: z.string().optional(),
    groupId: z.string().optional(),
  }).optional(),
  reporting: z.object({
    schedule: z.string().optional(),
    template: z.string().optional(),
  }).optional(),
  repository: z.object({
    paths: z.object({
      todos: z.array(z.string()).optional(),
      documentation: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
  options: z.record(z.string(), z.any()).optional(),
});

/**
 * Default configuration
 * @type {ConfigOptions}
 */
const DEFAULT_CONFIG = {
  ai: {
    provider: 'openai',
    model: 'gpt-4',
  },
  telegram: {},
  reporting: {
    schedule: '0 9 * * 1-5', // Daily at 9 AM on weekdays
    template: 'daily',
  },
  repository: {
    paths: {
      todos: ['**/TODO.md', '**/TODO'],
      documentation: ['**/*.md'],
    },
  },
  options: {},
};

/**
 * Configuration class for Repobot
 */
export class Config {
  /**
   * Create a new Config instance
   * @param {ConfigOptions} [options={}] - Configuration options
   */
  constructor(options = {}) {
    /** @type {ConfigOptions} */
    this.config = {
      ...DEFAULT_CONFIG,
      ...options,
    };
    
    // Validate configuration
    ConfigSchema.parse(this.config);
  }

  /**
   * Get a configuration value by path
   * @param {String} path - Configuration path (e.g. 'ai.provider')
   * @returns {any} - Configuration value
   */
  get(path) {
    /** @type {any} */
    let current = this.config;
    const keys = path.split('.');
    
    for (const key of keys) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  /**
   * Set a configuration value by path
   * @param {String} path - Configuration path (e.g. 'ai.provider')
   * @param {any} value - Configuration value
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    if (!lastKey) {
      return;
    }
    
    /** @type {any} */
    let current = this.config;
    
    for (const key of keys) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
    
    // Validate configuration after update
    ConfigSchema.parse(this.config);
  }

  /**
   * Get the entire configuration object
   * @returns {ConfigOptions} - Configuration object
   */
  getAll() {
    return this.config;
  }
} 