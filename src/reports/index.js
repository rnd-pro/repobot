/**
 * Report Generator module for Repobot
 * @module repobot/reports
 */

import { AIConnector } from '../ai/index.js';

/**
 * Report Generator class for Repobot
 */
export class ReportGenerator {
  /**
   * Create a new ReportGenerator instance
   * @param {Object} config - Repobot configuration
   */
  constructor(config) {
    this.config = config;
    this.ai = new AIConnector(config);
    this.templates = {
      daily: this.generateDailyReport.bind(this),
      weekly: this.generateWeeklyReport.bind(this),
      monthly: this.generateMonthlyReport.bind(this),
      custom: this.generateCustomReport.bind(this)
    };
  }

  /**
   * Generate a report
   * @param {string} template - Report template
   * @param {Object} context - Context information
   * @param {Object} options - Report options
   * @returns {Promise<string>} - Generated report
   */
  async generate(template, context, options = {}) {
    try {
      // Check if the template exists
      if (!this.templates[template]) {
        throw new Error(`Unknown report template: ${template}`);
      }
      
      // Generate the report using the template
      const report = await this.templates[template](context, options);
      
      return report;
    } catch (error) {
      console.error('Failed to generate report:', error.message);
      throw error;
    }
  }

  /**
   * Generate a daily report
   * @param {Object} context - Context information
   * @param {Object} options - Report options
   * @returns {Promise<string>} - Generated report
   */
  async generateDailyReport(context, options = {}) {
    try {
      // Use AI to generate the report
      const report = await this.ai.generateReport('daily', context, options);
      
      return report;
    } catch (error) {
      console.error('Failed to generate daily report:', error.message);
      throw error;
    }
  }

  /**
   * Generate a weekly report
   * @param {Object} context - Context information
   * @param {Object} options - Report options
   * @returns {Promise<string>} - Generated report
   */
  async generateWeeklyReport(context, options = {}) {
    try {
      // Use AI to generate the report
      const report = await this.ai.generateReport('weekly', context, options);
      
      return report;
    } catch (error) {
      console.error('Failed to generate weekly report:', error.message);
      throw error;
    }
  }

  /**
   * Generate a monthly report
   * @param {Object} context - Context information
   * @param {Object} options - Report options
   * @returns {Promise<string>} - Generated report
   */
  async generateMonthlyReport(context, options = {}) {
    try {
      // Use AI to generate the report
      const report = await this.ai.generateReport('monthly', context, options);
      
      return report;
    } catch (error) {
      console.error('Failed to generate monthly report:', error.message);
      throw error;
    }
  }

  /**
   * Generate a custom report
   * @param {Object} context - Context information
   * @param {Object} options - Report options
   * @returns {Promise<string>} - Generated report
   */
  async generateCustomReport(context, options = {}) {
    try {
      // Check if a custom template is provided
      if (!options.template) {
        throw new Error('Custom template not provided');
      }
      
      // Use AI to generate the report
      const report = await this.ai.generateReport(options.template, context, options);
      
      return report;
    } catch (error) {
      console.error('Failed to generate custom report:', error.message);
      throw error;
    }
  }

  /**
   * Register a custom report template
   * @param {string} name - Template name
   * @param {Function} generator - Template generator function
   */
  registerTemplate(name, generator) {
    if (this.templates[name]) {
      console.warn(`Overwriting existing template: ${name}`);
    }
    
    this.templates[name] = generator;
  }
} 