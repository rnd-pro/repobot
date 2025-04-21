/**
 * File System module for Repobot
 * @module repobot/filesystem
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { resolve, join, dirname } from 'path';
import { existsSync } from 'fs';
import { glob } from 'glob';

/**
 * File System class for Repobot
 */
export class FileSystem {
  /**
   * Create a new FileSystem instance
   * @param {Object} config - Repobot configuration
   */
  constructor(config) {
    this.config = config;
    this.basePath = process.cwd();
  }

  /**
   * Initialize the File System module
   * @returns {Promise<boolean>} - Success status
   */
  async init() {
    try {
      // Check if the base path exists
      if (!existsSync(this.basePath)) {
        throw new Error(`Base path does not exist: ${this.basePath}`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize File System module:', error.message);
      return false;
    }
  }

  /**
   * Find files matching a pattern
   * @param {string|Array<string>} patterns - Glob patterns
   * @param {Object} options - Glob options
   * @returns {Promise<Array<string>>} - Matching file paths
   */
  async findFiles(patterns, options = {}) {
    try {
      const defaultOptions = {
        cwd: this.basePath,
        absolute: true,
        ...options
      };
      
      const files = await glob(patterns, defaultOptions);
      return files;
    } catch (error) {
      console.error('Failed to find files:', error.message);
      throw error;
    }
  }

  /**
   * Read a file
   * @param {string} filePath - File path
   * @returns {Promise<string>} - File content
   */
  async readFile(filePath) {
    try {
      const fullPath = resolve(this.basePath, filePath);
      return await readFile(fullPath, 'utf8');
    } catch (error) {
      console.error(`Failed to read file ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Write a file
   * @param {string} filePath - File path
   * @param {string} content - File content
   * @returns {Promise<boolean>} - Success status
   */
  async writeFile(filePath, content) {
    try {
      const fullPath = resolve(this.basePath, filePath);
      await writeFile(fullPath, content, 'utf8');
      return true;
    } catch (error) {
      console.error(`Failed to write file ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Append content to a file
   * @param {string} filePath - File path
   * @param {string} content - Content to append
   * @returns {Promise<boolean>} - Success status
   */
  async appendToFile(filePath, content) {
    try {
      const fullPath = resolve(this.basePath, filePath);
      const existingContent = await this.readFile(filePath).catch(() => '');
      await writeFile(fullPath, existingContent + '\n' + content, 'utf8');
      return true;
    } catch (error) {
      console.error(`Failed to append to file ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Get TODO information
   * @returns {Promise<Object>} - TODO information
   */
  async getTodoInfo() {
    try {
      const todoPatterns = this.config.get('repository.paths.todos') || ['**/TODO.md', '**/TODO'];
      const todoFiles = await this.findFiles(todoPatterns);
      
      const todoInfo = {};
      for (const file of todoFiles) {
        const content = await this.readFile(file);
        const relativePath = file.replace(this.basePath, '').replace(/^\//, '');
        todoInfo[relativePath] = this.parseTodoFile(content);
      }
      
      return todoInfo;
    } catch (error) {
      console.error('Failed to get TODO information:', error.message);
      throw error;
    }
  }

  /**
   * Get documentation information
   * @returns {Promise<Object>} - Documentation information
   */
  async getDocumentationInfo() {
    try {
      const docPatterns = this.config.get('repository.paths.documentation') || ['**/*.md'];
      const docFiles = await this.findFiles(docPatterns);
      
      const docInfo = {};
      for (const file of docFiles) {
        const content = await this.readFile(file);
        const relativePath = file.replace(this.basePath, '').replace(/^\//, '');
        docInfo[relativePath] = this.parseMarkdownFile(content);
      }
      
      return docInfo;
    } catch (error) {
      console.error('Failed to get documentation information:', error.message);
      throw error;
    }
  }

  /**
   * Parse a TODO file
   * @param {string} content - File content
   * @returns {Object} - Parsed TODO information
   */
  parseTodoFile(content) {
    const lines = content.split('\n');
    const tasks = [];
    let currentSection = '';
    
    for (const line of lines) {
      // Check for section headers
      const sectionMatch = line.match(/^#+\s+(.+)$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1].trim();
        continue;
      }
      
      // Check for tasks
      const taskMatch = line.match(/^[-*]\s+\[([ x])\]\s+(.+)$/);
      if (taskMatch) {
        const isCompleted = taskMatch[1] === 'x';
        const taskDescription = taskMatch[2].trim();
        
        tasks.push({
          description: taskDescription,
          completed: isCompleted,
          section: currentSection || 'Uncategorized'
        });
      }
    }
    
    return {
      tasks,
      sections: [...new Set(tasks.map(task => task.section))]
    };
  }

  /**
   * Parse a Markdown file
   * @param {string} content - File content
   * @returns {Object} - Parsed Markdown information
   */
  parseMarkdownFile(content) {
    const lines = content.split('\n');
    const sections = [];
    let currentSection = {
      title: '',
      level: 0,
      content: []
    };
    
    for (const line of lines) {
      // Check for headers
      const headerMatch = line.match(/^(#+)\s+(.+)$/);
      if (headerMatch) {
        // Save previous section if it has content
        if (currentSection.title && currentSection.content.length > 0) {
          sections.push({ ...currentSection });
        }
        
        // Start new section
        currentSection = {
          title: headerMatch[2].trim(),
          level: headerMatch[1].length,
          content: []
        };
        continue;
      }
      
      // Add non-empty lines to current section
      if (line.trim()) {
        currentSection.content.push(line);
      }
    }
    
    // Add the last section if it has content
    if (currentSection.title && currentSection.content.length > 0) {
      sections.push(currentSection);
    }
    
    return {
      sections,
      title: sections.length > 0 ? sections[0].title : '',
      content: content
    };
  }

  /**
   * Update a TODO file with task completion status
   * @param {string} filePath - TODO file path
   * @param {string} taskDescription - Task description
   * @param {boolean} completed - Completion status
   * @returns {Promise<boolean>} - Success status
   */
  async updateTodoStatus(filePath, taskDescription, completed) {
    try {
      const content = await this.readFile(filePath);
      const lines = content.split('\n');
      const updatedLines = [];
      
      for (const line of lines) {
        const taskMatch = line.match(/^([-*]\s+\[)[ x](\]\s+.+)$/);
        if (taskMatch && line.includes(taskDescription)) {
          const checkbox = completed ? 'x' : ' ';
          updatedLines.push(`${taskMatch[1]}${checkbox}${taskMatch[2]}`);
        } else {
          updatedLines.push(line);
        }
      }
      
      await this.writeFile(filePath, updatedLines.join('\n'));
      return true;
    } catch (error) {
      console.error(`Failed to update TODO status in ${filePath}:`, error.message);
      throw error;
    }
  }
} 