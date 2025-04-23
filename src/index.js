/// <reference path="./types/index.d.ts" />

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
 * @typedef {Object} RepobotConfig
 * @property {String} [apiKey] - AI service API key
 * @property {String} [telegramToken] - Telegram bot token
 * @property {String} [repoPath] - Git repository path
 * @property {Object<string, String>} [options] - Additional configuration options
 */

/**
 * @typedef {Object} GitCommit
 * @property {String} hash - Commit hash
 * @property {String} message - Commit message
 * @property {String} author - Author name
 * @property {String} date - Commit date
 */

/**
 * @typedef {Object} GitBranches
 * @property {String} current - Current branch name
 * @property {Array<String>} all - All branches
 * @property {Array<String>} remotes - Remote branches
 */

/**
 * @typedef {Object} GitRemote
 * @property {String} name - Remote name
 * @property {String} refs - Remote references
 */

/**
 * @typedef {Object} GitInfo
 * @property {String} currentBranch - Current branch name
 * @property {Boolean} isClean - Whether the repository is clean
 * @property {Array<String>} modifiedFiles - List of modified files
 * @property {Array<String>} stagedFiles - List of staged files
 * @property {Array<String>} untrackedFiles - List of untracked files
 * @property {Array<GitCommit>} recentCommits - List of recent commits
 * @property {Array<GitRemote>} remotes - List of remotes
 * @property {GitBranches} branches - Branch information
 * @property {Array<String>} tags - List of tags
 * @property {String} path - Repository path
 */

/**
 * @typedef {Object} TodoTask
 * @property {String} description - Task description
 * @property {Boolean} completed - Whether the task is completed
 * @property {String} section - Section the task belongs to
 */

/**
 * @typedef {Object} TodoInfo
 * @property {Array<TodoTask>} tasks - List of tasks
 * @property {Array<String>} sections - List of sections
 */

/**
 * @typedef {Object} DocumentationSection
 * @property {String} title - Section title
 * @property {Number} level - Section level
 * @property {Array<String>} content - Section content lines
 */

/**
 * @typedef {Object} DocumentationInfo
 * @property {Array<DocumentationSection>} sections - List of sections
 * @property {String} title - Document title
 * @property {String} content - Raw document content
 */

/**
 * @typedef {Object} TodoItem
 * @property {String} text - Todo text content
 * @property {String} file - File path where todo was found
 * @property {Number} line - Line number where todo was found
 * @property {String} [author] - Author of the todo comment
 */

/**
 * @typedef {Object} ContextData
 * @property {GitInfo} git - Git repository information
 * @property {Record<String, TodoInfo>} todos - Todo information by file
 * @property {Record<String, DocumentationInfo>} documentation - Documentation information by file
 * @property {String} timestamp - Context generation timestamp
 */

/**
 * Repobot class - Main class for the Repobot package
 */
export class Repobot {
  /**
   * Create a new Repobot instance
   * @param {RepobotConfig} [config={}] - Configuration object
   */
  constructor(config = {}) {
    /** @type {Config} */
    this.config = new Config(config);
    /** @type {AIConnector} */
    this.ai = new AIConnector(this.config);
    /** @type {GitConnector} */
    this.git = new GitConnector(this.config);
    /** @type {FileSystem} */
    this.filesystem = new FileSystem(this.config);
    /** @type {TelegramConnector} */
    this.telegram = new TelegramConnector(this.config);
    /** @type {ReportGenerator} */
    this.reports = new ReportGenerator(this.config);
  }

  /**
   * Initialize Repobot with the current repository
   * @returns {Promise<Boolean>} - Success status
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
   * @param {'daily' | 'weekly' | 'monthly' | 'custom'} [template='daily'] - Report template name
   * @param {{
   *   format?: String,
   *   includeGit?: Boolean,
   *   includeTodos?: Boolean,
   *   includeDocumentation?: Boolean,
   *   customFields?: Object<string, String>
   * }} [options={}] - Report options
   * @returns {Promise<String>} - Generated report
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
   * @param {String} report - Report content
   * @returns {Promise<Boolean>} - Success status
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
   * @returns {Promise<ContextData>} - Context object
   */
  async gatherContext() {
    const [gitInfo, todoInfo, documentationInfo] = await Promise.all([
      /** @type {Promise<GitInfo>} */ (this.git.getRepositoryInfo()),
      /** @type {Promise<Record<String, TodoInfo>>} */ (this.filesystem.getTodoInfo()),
      /** @type {Promise<Record<String, DocumentationInfo>>} */ (this.filesystem.getDocumentationInfo())
    ]);
    
    return {
      git: gitInfo,
      todos: todoInfo,
      documentation: documentationInfo,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Process a user query using AI
   * @param {String} query - User query
   * @returns {Promise<String>} - AI response
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