/**
 * Base class for AI providers
 * @module repobot/ai/providers/base
 */

/**
 * @typedef {Object} AIRequestOptions
 * @property {String} [model] - Model name to use
 * @property {Number} [temperature] - Temperature for response generation
 * @property {Number} [maxTokens] - Maximum tokens in response
 */

/**
 * @typedef {Object} AIMessage
 * @property {String} role - Message role (system, user, assistant)
 * @property {String} content - Message content
 */

/**
 * Base class for AI providers
 */
export class BaseAIProvider {
  /**
   * Create a new AI provider instance
   * @param {Object} config - Provider configuration
   * @param {String} [config.apiKey] - API key for the provider
   * @param {String} [config.model] - Default model to use
   * @param {String} [config.endpoint] - API endpoint URL
   */
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.endpoint = config.endpoint;
  }

  /**
   * Process messages with the AI provider
   * @param {Array<AIMessage>} messages - Messages to process
   * @param {AIRequestOptions} [options] - Request options
   * @returns {Promise<String>} - AI response
   */
  async processMessages(messages, options = {}) {
    if (!this.validateConfig()) {
      throw new Error('API key and endpoint are required');
    }

    try {
      const response = await fetch(/** @type {String} */ (this.endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: options.model || this.model || 'gpt-4',
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      const error = /** @type {Error} */ (err);
      console.error('API request failed:', error.message);
      throw error;
    }
  }

  /**
   * Validate provider configuration
   * @returns {Boolean} - Whether the configuration is valid
   */
  validateConfig() {
    return Boolean(this.apiKey && this.endpoint);
  }
} 