/**
 * AI Connector module for Repobot
 * @module repobot/ai
 */

import { getProvider } from './providers/index.js';

/**
 * @typedef {Object} GitContext
 * @property {String} currentBranch - Current git branch
 * @property {Array<String>} [modifiedFiles] - List of modified files
 * @property {Array<String>} [stagedFiles] - List of staged files
 * @property {Array<String>} [untrackedFiles] - List of untracked files
 * @property {Array<GitCommit>} [recentCommits] - List of recent commits
 */

/**
 * @typedef {Object} GitCommit
 * @property {String} hash - Commit hash
 * @property {String} message - Commit message
 * @property {String} author - Author name
 * @property {String} date - Commit date
 */

/**
 * @typedef {Object} TodoTask
 * @property {String} description - Task description
 * @property {Boolean} completed - Task completion status
 * @property {String} [section] - Task section
 */

/**
 * @typedef {Object} TodoInfo
 * @property {Array<TodoTask>} tasks - List of tasks
 * @property {Array<String>} [sections] - List of sections
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
 * @typedef {Object} RepobotConfig
 * @property {function(String): *} get - Get configuration value by key
 */

/**
 * @typedef {Object} RepobotContext
 * @property {GitContext} [git] - Git context information
 * @property {Object<String, TodoInfo>} [todos] - TODO information by file
 * @property {Object<String, DocumentationInfo>} [documentation] - Documentation information by file
 * @property {String} [timestamp] - Context timestamp
 */

/**
 * AI Connector class for Repobot
 */
export class AIConnector {
  /**
   * Create a new AIConnector instance
   * @param {RepobotConfig} config - Repobot configuration
   */
  constructor(config) {
    this.config = config;
    this.provider = getProvider({
      provider: this.config.get('ai.provider') || 'openai',
      apiKey: this.config.get('ai.apiKey') || process.env.AI_API_KEY,
      model: this.config.get('ai.model') || 'gpt-4'
    });
  }

  /**
   * Process a query using AI
   * @param {String} query - User query
   * @param {RepobotContext} context - Context information
   * @returns {Promise<String>} - AI response
   */
  async processQuery(query, context) {
    try {
      // Prepare the prompt
      const prompt = this.buildPrompt(query, context);
      
      // Process the query with the provider
      return await this.provider.processMessages([
        {
          role: 'system',
          content: 'You are Repobot, an AI assistant for managing development processes in Git repositories.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);
    } catch (err) {
      const error = /** @type {Error} */ (err);
      console.error('Failed to process query with AI:', error.message);
      throw error;
    }
  }

  /**
   * Build a prompt for the AI
   * @param {String} query - User query
   * @param {RepobotContext} context - Context information
   * @returns {String} - Built prompt
   */
  buildPrompt(query, context) {
    // Start with the query
    let prompt = `Current query: ${query}\n\nContext information:\n`;

    // Add Git information
    if (context.git) {
      prompt += `
Git Repository:
- Current branch: ${context.git.currentBranch}
- Modified files: ${context.git.modifiedFiles?.length || 0}
- Staged files: ${context.git.stagedFiles?.length || 0}
- Untracked files: ${context.git.untrackedFiles?.length || 0}
- Recent commits: ${context.git.recentCommits?.length || 0}
`;
    }

    // Add TODO information
    if (context.todos) {
      prompt += `
TODO Files:
`;
      for (const [file, info] of Object.entries(context.todos)) {
        prompt += `- ${file}: ${info.tasks?.length || 0} tasks (${info.tasks?.filter(/** @param {TodoTask} t */ (t) => t.completed).length || 0} completed)\n`;
      }
    }

    // Add documentation information
    if (context.documentation) {
      prompt += `
Documentation Files:
`;
      for (const [file, info] of Object.entries(context.documentation)) {
        prompt += `- ${file}: ${info.sections?.length || 0} sections\n`;
      }
    }

    // Add timestamp
    prompt += `\nTimestamp: ${context.timestamp || new Date().toISOString()}\n`;

    return prompt;
  }

  /**
   * Generate a report using AI
   * @param {String} template - Report template
   * @param {RepobotContext} context - Context information
   * @returns {Promise<String>} - Generated report
   */
  async generateReport(template, context) {
    try {
      // Build the report prompt
      const prompt = this.buildReportPrompt(template, context);
      
      // Generate the report using the provider
      return await this.provider.processMessages([
        {
          role: 'system',
          content: 'You are Repobot, an AI assistant for managing development processes in Git repositories.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);
    } catch (err) {
      const error = /** @type {Error} */ (err);
      console.error('Failed to generate report:', error.message);
      throw error;
    }
  }

  /**
   * Build a prompt for report generation
   * @param {String} template - Report template
   * @param {RepobotContext} context - Context information
   * @returns {String} - Built prompt
   */
  buildReportPrompt(template, context) {
    let prompt = `Please generate a ${template} report based on the following information:\n\n`;

    // Add Git information
    if (context.git) {
      prompt += `
Git Repository Status:
- Current branch: ${context.git.currentBranch}
- Modified files: ${context.git.modifiedFiles?.join(', ') || 'None'}
- Staged files: ${context.git.stagedFiles?.join(', ') || 'None'}
- Untracked files: ${context.git.untrackedFiles?.join(', ') || 'None'}

Recent Commits:
`;
      
      if (context.git.recentCommits && context.git.recentCommits.length > 0) {
        for (const commit of context.git.recentCommits) {
          prompt += `- ${commit.hash.substring(0, 7)}: ${commit.message} (${commit.author}, ${new Date(commit.date).toLocaleDateString()})\n`;
        }
      } else {
        prompt += '- No recent commits\n';
      }
    }

    // Add TODO information
    if (context.todos) {
      prompt += `
TODO Status:
`;
      
      for (const [file, info] of Object.entries(context.todos)) {
        prompt += `\n${file}:\n`;
        
        if (info.sections && info.sections.length > 0) {
          for (const section of info.sections) {
            const sectionTasks = info.tasks.filter(/** @param {TodoTask} task */ (task) => task.section === section);
            const completedTasks = sectionTasks.filter(/** @param {TodoTask} task */ (task) => task.completed);
            
            prompt += `\n${section}:\n`;
            prompt += `- Total tasks: ${sectionTasks.length}\n`;
            prompt += `- Completed: ${completedTasks.length}\n`;
            prompt += `- Pending: ${sectionTasks.length - completedTasks.length}\n`;
            
            if (completedTasks.length > 0) {
              prompt += `\nCompleted tasks:\n`;
              for (const task of completedTasks) {
                prompt += `- [x] ${task.description}\n`;
              }
            }
            
            if (sectionTasks.length - completedTasks.length > 0) {
              prompt += `\nPending tasks:\n`;
              for (const task of sectionTasks.filter(/** @param {TodoTask} task */ (task) => !task.completed)) {
                prompt += `- [ ] ${task.description}\n`;
              }
            }
          }
        } else {
          prompt += '- No sections found\n';
        }
      }
    }

    // Add documentation information
    if (context.documentation) {
      prompt += `
Documentation Updates:
`;
      
      for (const [file, info] of Object.entries(context.documentation)) {
        prompt += `\n${file}:\n`;
        prompt += `- Title: ${info.title || 'Untitled'}\n`;
        prompt += `- Sections: ${info.sections?.length || 0}\n`;
      }
    }

    // Add timestamp
    prompt += `\nTimestamp: ${context.timestamp || new Date().toISOString()}\n`;
    prompt += `\nPlease generate a comprehensive ${template} report based on this information.\n`;

    return prompt;
  }
} 