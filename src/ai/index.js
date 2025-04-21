/**
 * AI Connector module for Repobot
 * @module repobot/ai
 */

/**
 * AI Connector class for Repobot
 */
export class AIConnector {
  /**
   * Create a new AIConnector instance
   * @param {Object} config - Repobot configuration
   */
  constructor(config) {
    this.config = config;
    this.provider = this.config.get('ai.provider') || 'openai';
    this.apiKey = this.config.get('ai.apiKey') || process.env.AI_API_KEY;
    this.model = this.config.get('ai.model') || 'gpt-4';
    
    if (!this.apiKey) {
      console.warn('No API key provided for AI provider');
    }
  }

  /**
   * Process a query using AI
   * @param {string} query - User query
   * @param {Object} context - Context information
   * @returns {Promise<string>} - AI response
   */
  async processQuery(query, context) {
    try {
      // Prepare the prompt
      const prompt = this.buildPrompt(query, context);
      
      // Process the query based on the provider
      switch (this.provider.toLowerCase()) {
        case 'openai':
          return await this.processWithOpenAI(prompt);
        default:
          throw new Error(`Unsupported AI provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to process query with AI:', error.message);
      throw error;
    }
  }

  /**
   * Build a prompt for the AI
   * @param {string} query - User query
   * @param {Object} context - Context information
   * @returns {string} - Built prompt
   */
  buildPrompt(query, context) {
    // Start with a system message
    let prompt = `You are Repobot, an AI assistant for managing development processes in Git repositories.
You help with task tracking, detailed work reports, planning, and more.

Current query: ${query}

Context information:
`;

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
        prompt += `- ${file}: ${info.tasks?.length || 0} tasks (${info.tasks?.filter(t => t.completed).length || 0} completed)\n`;
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
    prompt += `
Timestamp: ${context.timestamp || new Date().toISOString()}

Please provide a helpful response to the query.
`;

    return prompt;
  }

  /**
   * Process a query with OpenAI
   * @param {string} prompt - Prompt for OpenAI
   * @returns {Promise<string>} - OpenAI response
   */
  async processWithOpenAI(prompt) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are Repobot, an AI assistant for managing development processes in Git repositories.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API request failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate a report using AI
   * @param {string} template - Report template
   * @param {Object} context - Context information
   * @param {Object} options - Report options
   * @returns {Promise<string>} - Generated report
   */
  async generateReport(template, context, options = {}) {
    try {
      // Build the report prompt
      const prompt = this.buildReportPrompt(template, context, options);
      
      // Generate the report using the AI
      const report = await this.processQuery(prompt, context);
      
      return report;
    } catch (error) {
      console.error('Failed to generate report:', error.message);
      throw error;
    }
  }

  /**
   * Build a prompt for report generation
   * @param {string} template - Report template
   * @param {Object} context - Context information
   * @param {Object} options - Report options
   * @returns {string} - Built prompt
   */
  buildReportPrompt(template, context, options) {
    let prompt = `You are Repobot, an AI assistant for managing development processes in Git repositories.
Please generate a ${template} report based on the following information:

`;

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
          prompt += `- ${commit.hash.substring(0, 7)}: ${commit.message} (${commit.author_name}, ${new Date(commit.date).toLocaleDateString()})\n`;
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
            const sectionTasks = info.tasks.filter(task => task.section === section);
            const completedTasks = sectionTasks.filter(task => task.completed);
            
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
              for (const task of sectionTasks.filter(task => !task.completed)) {
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
    prompt += `
Timestamp: ${context.timestamp || new Date().toISOString()}

Please generate a comprehensive ${template} report based on this information.
`;

    return prompt;
  }
} 