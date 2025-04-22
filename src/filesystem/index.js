/**
 * File System module for Repobot
 * @module repobot/filesystem
 */

import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import { resolve, join, dirname, relative } from 'path';
import { existsSync } from 'fs';
import { glob } from 'glob';
import ignore from 'ignore';

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
    this.ignoreFilter = null;
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
      console.error('Failed to initialize File System module:', error.message);
      return false;
    }
  }

  /**
   * Initialize the gitignore filter
   * @returns {Promise<void>}
   */
  async initIgnoreFilter() {
    try {
      // Create a new ignore instance
      this.ignoreFilter = ignore();
      this.ignoreRules = [];
      
      // Check if .gitignore exists in the base path
      const gitignorePath = resolve(this.basePath, '.gitignore');
      if (existsSync(gitignorePath)) {
        // Read the .gitignore file
        const gitignoreContent = await readFile(gitignorePath, 'utf8');
        
        // Add the gitignore rules to the filter
        this.ignoreFilter.add(gitignoreContent);
        this.ignoreRules.push(...gitignoreContent.split('\n').filter(rule => 
          rule.trim() && !rule.startsWith('#')
        ));
        
        console.log('Gitignore rules loaded successfully');
      } else {
        console.log('No .gitignore file found, proceeding without ignore rules');
      }
      
      // Check for additional ignore files (e.g. .npmignore, .dockerignore)
      const additionalIgnoreFiles = this.config.get('repository.ignoreFiles') || [];
      for (const ignoreFile of additionalIgnoreFiles) {
        const ignoreFilePath = resolve(this.basePath, ignoreFile);
        if (existsSync(ignoreFilePath)) {
          try {
            const ignoreContent = await readFile(ignoreFilePath, 'utf8');
            this.ignoreFilter.add(ignoreContent);
            this.ignoreRules.push(...ignoreContent.split('\n').filter(rule => 
              rule.trim() && !rule.startsWith('#')
            ));
            console.log(`Loaded ignore rules from ${ignoreFile}`);
          } catch (err) {
            console.warn(`Failed to load ignore rules from ${ignoreFile}:`, err.message);
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize gitignore filter:', error.message);
      // Create a default ignore filter if the gitignore file doesn't exist or can't be read
      this.ignoreFilter = ignore();
      this.ignoreRules = [];
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
        ignore: this.ignoreRules,
        ...options
      };
      
      // Find files using glob
      const files = await glob(patterns, defaultOptions);
      
      // If no ignore filter is initialized, return all files
      if (!this.ignoreFilter) {
        return files;
      }
      
      // Filter out files that match gitignore patterns
      const filteredFiles = files.filter(file => {
        return !this.isFileIgnored(file);
      });
      
      return filteredFiles;
    } catch (error) {
      console.error('Failed to find files:', error.message);
      throw error;
    }
  }

  /**
   * Check if a file is ignored by gitignore rules
   * @param {string} filePath - The file path to check
   * @returns {boolean} - True if the file is ignored, false otherwise
   */
  isFileIgnored(filePath) {
    if (!this.ignoreFilter) {
      return false;
    }
    
    // Convert absolute paths to relative paths for ignore filtering
    const relativePath = this._getRelativePath(filePath);
    
    // Return true if the file is ignored
    return this.ignoreFilter.ignores(relativePath);
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
      
      // Check if the file is ignored
      if (this.isFileIgnored(fullPath)) {
        throw new Error(`File is ignored by gitignore rules: ${filePath}`);
      }
      
      // Ensure the directory exists
      await mkdir(dirname(fullPath), { recursive: true });
      
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
      
      // Check if the file is ignored
      if (this.isFileIgnored(fullPath)) {
        throw new Error(`File is ignored by gitignore rules: ${filePath}`);
      }
      
      // Ensure the directory exists
      await mkdir(dirname(fullPath), { recursive: true });
      
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
      console.error(`Failed to update TODO status in ${filePath}:`, error.message);
      throw error;
    }
  }
} 