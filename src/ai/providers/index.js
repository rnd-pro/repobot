/**
 * AI Provider factory module
 * @module repobot/ai/providers
 */

import { BaseAIProvider } from './base.js';

/**
 * @typedef {Object} ProviderConfig
 * @property {String} [provider] - Provider name (for backwards compatibility)
 * @property {String} [apiKey] - Provider API key
 * @property {String} [model] - Provider model name
 * @property {String} [endpoint] - Provider API endpoint
 */

/**
 * Get an AI provider instance
 * @param {ProviderConfig} config - Provider configuration
 * @returns {BaseAIProvider} - AI provider instance
 */
export function getProvider(config) {
  return new BaseAIProvider(config);
}

export { BaseAIProvider } from './base.js'; 