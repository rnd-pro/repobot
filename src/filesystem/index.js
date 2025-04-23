/**
 * File System module for Repobot
 * @module repobot/filesystem
 */

import { readFile as fsReadFile, writeFile as fsWriteFile, mkdir } from 'fs/promises';
import { resolve, dirname, relative } from 'path';
import { existsSync } from 'fs';
import { glob } from 'glob';
import ignore from 'ignore';

/**
 * @typedef {import('../index.js').TodoInfo} TodoInfo
 * @typedef {import('../index.js').DocumentationInfo} DocumentationInfo
 * @typedef {import('../config/index.js').Config} Config
 */

/**
 * File System class for Repobot
 */
export class FileSystem {
  /**
   * Create a new FileSystem instance
   * @param {Config} config - Repobot configuration
   */
  constructor(config) {
    this.config = config;
    this.basePath = process.cwd();
    /** @type {Array<String>} */
    this.ignoreRules = [];
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
      
      // Initialize the gitignore filter
      await this.initIgnoreFilter();
      
      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to initialize File System module:', error.message);
      } else {
        console.error('Failed to initialize File System module:', error);
      }
      return false;
    }
  }

  /**
   * Initialize the gitignore filter
   * @returns {Promise<void>}
   */
  async initIgnoreFilter() {
    try {
      const gitignorePath = resolve(this.basePath, '.gitignore');
      const content = await fsReadFile(gitignorePath, 'utf8');
      this.ignoreRules = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
      
      console.log('Gitignore rules loaded successfully');
    } catch (err) {
      if (err instanceof Error) {
        console.warn('No .gitignore file found:', err.message);
      } else {
        console.warn('No .gitignore file found:', err);
      }
      this.ignoreRules = [];
    }
  }

  /**
   * Find files matching multiple patterns
   * @param {Array<String>} patterns - Array of glob patterns to match
   * @returns {Promise<Array<String>>} Array of matched file paths
   */
  async findFiles(patterns) {
    try {
      const matches = new Set();
      for (const pattern of patterns) {
        const files = await glob(pattern);
        for (const file of files) {
          matches.add(file);
        }
      }
      return Array.from(matches);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error finding files: ${error.message}`);
      } else {
        console.error('Unknown error finding files');
      }
      return [];
    }
  }

  /**
   * Check if a file is ignored by gitignore rules
   * @param {string} filePath - The file path to check
   * @returns {boolean} - True if the file is ignored, false otherwise
   */
  isFileIgnored(filePath) {
    const relativePath = this._getRelativePath(filePath);
    const ig = ignore().add(this.ignoreRules);
    return ig.ignores(relativePath);
  }

  /**
   * Get a file path relative to the base path
   * @param {string} filePath - The file path
   * @returns {string} - The relative path
   * @private
   */
  _getRelativePath(filePath) {
    // Handle both absolute and relative paths
    const absolutePath = filePath.startsWith(this.basePath) 
      ? filePath 
      : resolve(this.basePath, filePath);
    
    // Get the path relative to base path
    const relativePath = relative(this.basePath, absolutePath);
    
    // Normalize and handle Windows paths
    return relativePath.replace(/\\/g, '/');
  }

  /**
   * Read a file
   * @param {string} filePath - File path
   * @returns {Promise<string>} - File content
   */
  async readFile(filePath) {
    try {
      const fullPath = resolve(this.basePath, filePath);
      
      // Check if the file is ignored
      if (this.isFileIgnored(fullPath)) {
        throw new Error(`File is ignored by gitignore rules: ${filePath}`);
      }
      
      return await fsReadFile(fullPath, 'utf8');
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to read file ${filePath}:`, error.message);
      } else {
        console.error(`Failed to read file ${filePath}:`, error);
      }
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
      
      // Check if the file is ignored
      if (this.isFileIgnored(fullPath)) {
        throw new Error(`File is ignored by gitignore rules: ${filePath}`);
      }
      
      // Ensure the directory exists
      await mkdir(dirname(fullPath), { recursive: true });
      
      await fsWriteFile(fullPath, content, 'utf8');
      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to write file ${filePath}:`, error.message);
      } else {
        console.error(`Failed to write file ${filePath}:`, error);
      }
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
      
      // Check if the file is ignored
      if (this.isFileIgnored(fullPath)) {
        throw new Error(`File is ignored by gitignore rules: ${filePath}`);
      }
      
      // Ensure the directory exists
      await mkdir(dirname(fullPath), { recursive: true });
      
      const existingContent = await this.readFile(filePath).catch(() => '');
      await fsWriteFile(fullPath, existingContent + '\n' + content, 'utf8');
      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to append to file ${filePath}:`, error.message);
      } else {
        console.error(`Failed to append to file ${filePath}:`, error);
      }
      throw error;
    }
  }

  /**
   * Get TODO information
   * @returns {Promise<Record<String, TodoInfo>>} - TODO information by file
   */
  async getTodoInfo() {
    try {
      const todoPatterns = this.config.get('repository.paths.todos') || ['**/TODO.md', '**/TODO'];
      const todoFiles = await this.findFiles(todoPatterns);
      
      /** @type {Record<String, TodoInfo>} */
      const todoInfo = {};
      for (const file of todoFiles) {
        // Skip ignored files
        if (this.isFileIgnored(file)) {
          continue;
        }
        
        const content = await this.readFile(file);
        const relativePath = file.replace(this.basePath, '').replace(/^\//, '');
        todoInfo[relativePath] = this.parseTodoFile(content);
      }
      
      return todoInfo;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to get TODO information:', error.message);
      } else {
        console.error('Failed to get TODO information:', error);
      }
      throw error;
    }
  }

  /**
   * Get documentation information
   * @returns {Promise<Record<String, DocumentationInfo>>} - Documentation information by file
   */
  async getDocumentationInfo() {
    try {
      const docPatterns = this.config.get('repository.paths.documentation') || ['**/*.md'];
      const docFiles = await this.findFiles(docPatterns);
      
      /** @type {Record<String, DocumentationInfo>} */
      const docInfo = {};
      for (const file of docFiles) {
        // Skip ignored files
        if (this.isFileIgnored(file)) {
          continue;
        }
        
        const content = await this.readFile(file);
        const relativePath = file.replace(this.basePath, '').replace(/^\//, '');
        docInfo[relativePath] = this.parseMarkdownFile(content);
      }
      
      return docInfo;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to get documentation information:', error.message);
      } else {
        console.error('Failed to get documentation information:', error);
      }
      throw error;
    }
  }

  /**
   * Parse a TODO file
   * @param {string} content - File content
   * @returns {TodoInfo} - Parsed TODO information
   */
  parseTodoFile(content) {
    const lines = content.split('\n');
    /** @type {Array<import('../index.js').TodoTask>} */
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
   * @returns {DocumentationInfo} - Parsed Markdown information
   */
  parseMarkdownFile(content) {
    const lines = content.split('\n');
    /** @type {Array<import('../index.js').DocumentationSection>} */
    const sections = [];
    /** @type {import('../index.js').DocumentationSection} */
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
      const fullPath = resolve(this.basePath, filePath);
      
      // Check if the file is ignored
      if (this.isFileIgnored(fullPath)) {
        throw new Error(`File is ignored by gitignore rules: ${filePath}`);
      }
      
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
      if (error instanceof Error) {
        console.error(`Failed to update TODO status in ${filePath}:`, error.message);
      } else {
        console.error(`Failed to update TODO status in ${filePath}:`, error);
      }
      throw error;
    }
  }
} 