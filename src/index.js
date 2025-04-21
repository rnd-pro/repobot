/**
 * Repobot - AI assistant for managing development processes in Git repositories
 * @module repobot
 */

import { Config } from './config/index.js';
import { AIConnector } from './ai/index.js';
import { GitConnector } from './git/index.js';
import { FileSystem } from './filesystem/index.js';
import { TelegramConnector } from './telegram/index.js';
import { ReportGenerator } from './reports/index.js';

/**
 * Repobot class - Main class for the Repobot package
 */
export class Repobot {
  /**
   * Create a new Repobot instance
   * @param {Object} config - Configuration object
   */
  constructor(config = {}) {
    this.config = new Config(config);
    this.ai = new AIConnector(this.config);
    this.git = new GitConnector(this.config);
    this.filesystem = new FileSystem(this.config);
    this.telegram = new TelegramConnector(this.config);
    this.reports = new ReportGenerator(this.config);
  }

  /**
   * Initialize Repobot with the current repository
   * @returns {Promise<boolean>} - Success status
   */
  async init() {
    try {
      await this.git.init();
      await this.filesystem.init();
      return true;
    } catch (error) {
      console.error('Failed to initialize Repobot:', error);
      return false;
    }
  }

  /**
   * Generate a report based on the configured template
   * @param {string} template - Report template name
   * @param {Object} options - Report options
   * @returns {Promise<string>} - Generated report
   */
  async generateReport(template = 'daily', options = {}) {
    try {
      const context = await this.gatherContext();
      return await this.reports.generate(template, context, options);
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  /**
   * Send a report to the configured Telegram chat
   * @param {string} report - Report content
   * @returns {Promise<boolean>} - Success status
   */
  async sendReport(report) {
    try {
      await this.telegram.sendMessage(report);
      return true;
    } catch (error) {
      console.error('Failed to send report:', error);
      return false;
    }
  }

  /**
   * Gather context from Git and filesystem for AI processing
   * @returns {Promise<Object>} - Context object
   */
  async gatherContext() {
    const gitInfo = await this.git.getRepositoryInfo();
    const todoInfo = await this.filesystem.getTodoInfo();
    const documentationInfo = await this.filesystem.getDocumentationInfo();
    
    return {
      git: gitInfo,
      todos: todoInfo,
      documentation: documentationInfo,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Process a user query using AI
   * @param {string} query - User query
   * @returns {Promise<string>} - AI response
   */
  async processQuery(query) {
    try {
      const context = await this.gatherContext();
      return await this.ai.processQuery(query, context);
    } catch (error) {
      console.error('Failed to process query:', error);
      throw error;
    }
  }
}

// Export individual modules for direct access
export {
  Config,
  AIConnector,
  GitConnector,
  FileSystem,
  TelegramConnector,
  ReportGenerator
}; 