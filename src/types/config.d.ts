/**
 * Declaration file for Config class
 */

/**
 * Configuration options
 */
interface ConfigOptions {
  ai?: {
    provider?: string;
    apiKey?: string;
    model?: string;
  };
  telegram?: {
    botToken?: string;
    chatId?: string;
    groupId?: string;
  };
  reporting?: {
    schedule?: string;
    template?: string;
  };
  repository?: {
    paths?: {
      todos?: string[];
      documentation?: string[];
    };
    ignoreFiles?: string[];
  };
  [key: string]: any;
}

/**
 * Configuration class
 */
declare class Config {
  /**
   * Create a new Config instance
   * @param {ConfigOptions} options - Configuration options
   */
  constructor(options?: ConfigOptions);

  /**
   * Logger instance
   */
  logger: {
    error: (message: string) => void;
    warn: (message: string) => void;
    info: (message: string) => void;
    debug: (message: string) => void;
  };

  /**
   * Get a configuration value
   * @param {string} key - Configuration key path (dot notation)
   * @param {any} [defaultValue] - Default value if key is not found
   * @returns {any} Configuration value
   */
  get(key: string, defaultValue?: any): any;

  /**
   * Set a configuration value
   * @param {string} key - Configuration key path (dot notation)
   * @param {any} value - Value to set
   */
  set(key: string, value: any): void;

  /**
   * Get all configuration values
   * @returns {ConfigOptions} All configuration values
   */
  getAll(): ConfigOptions;

  /**
   * Validate configuration
   * @returns {boolean} True if configuration is valid
   */
  validate(): boolean;

  /**
   * Reset configuration to defaults
   */
  reset(): void;
}

export { Config, ConfigOptions }; 