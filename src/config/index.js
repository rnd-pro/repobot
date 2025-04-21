/**
 * Configuration module for Repobot
 * @module repobot/config
 */

import { z } from 'zod';

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
});

/**
 * Default configuration
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
};

/**
 * Configuration class for Repobot
 */
export class Config {
  /**
   * Create a new Config instance
   * @param {Object} userConfig - User configuration
   */
  constructor(userConfig = {}) {
    this.config = this.mergeConfig(DEFAULT_CONFIG, userConfig);
    this.validate();
  }

  /**
   * Merge user configuration with default configuration
   * @param {Object} defaultConfig - Default configuration
   * @param {Object} userConfig - User configuration
   * @returns {Object} - Merged configuration
   */
  mergeConfig(defaultConfig, userConfig) {
    const result = { ...defaultConfig };
    
    for (const key in userConfig) {
      if (userConfig[key] && typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
        result[key] = this.mergeConfig(result[key] || {}, userConfig[key]);
      } else {
        result[key] = userConfig[key];
      }
    }
    
    return result;
  }

  /**
   * Validate the configuration
   * @throws {Error} - If configuration is invalid
   */
  validate() {
    try {
      ConfigSchema.parse(this.config);
    } catch (error) {
      throw new Error(`Invalid configuration: ${error.message}`);
    }
  }

  /**
   * Get a configuration value
   * @param {string} key - Configuration key (dot notation)
   * @returns {*} - Configuration value
   */
  get(key) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value === undefined || value === null) {
        return undefined;
      }
      value = value[k];
    }
    
    return value;
  }

  /**
   * Set a configuration value
   * @param {string} key - Configuration key (dot notation)
   * @param {*} value - Configuration value
   */
  set(key, value) {
    const keys = key.split('.');
    let current = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (current[k] === undefined) {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
    this.validate();
  }

  /**
   * Get the entire configuration
   * @returns {Object} - Configuration object
   */
  getAll() {
    return { ...this.config };
  }
} 