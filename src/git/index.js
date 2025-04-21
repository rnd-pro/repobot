/**
 * Git connector module for Repobot
 * @module repobot/git
 */

import { simpleGit } from 'simple-git';
import { resolve } from 'path';

/**
 * Git connector class for Repobot
 */
export class GitConnector {
  /**
   * Create a new GitConnector instance
   * @param {Object} config - Repobot configuration
   */
  constructor(config) {
    this.config = config;
    this.git = null;
    this.repoPath = process.cwd();
  }

  /**
   * Initialize the Git connector
   * @returns {Promise<boolean>} - Success status
   */
  async init() {
    try {
      this.git = simpleGit(this.repoPath);
      
      // Check if the directory is a Git repository
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        throw new Error('Not a Git repository');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Git connector:', error.message);
      return false;
    }
  }

  /**
   * Get repository information
   * @returns {Promise<Object>} - Repository information
   */
  async getRepositoryInfo() {
    if (!this.git) {
      throw new Error('Git connector not initialized');
    }
    
    try {
      const [
        status,
        log,
        remotes,
        branches,
        tags
      ] = await Promise.all([
        this.git.status(),
        this.git.log({ maxCount: 10 }),
        this.git.getRemotes(true),
        this.git.branch(),
        this.git.tags()
      ]);
      
      return {
        currentBranch: status.current,
        isClean: status.isClean(),
        modifiedFiles: status.modified,
        stagedFiles: status.staged,
        untrackedFiles: status.not_added,
        recentCommits: log.all,
        remotes: remotes,
        branches: branches,
        tags: tags.all,
        path: this.repoPath
      };
    } catch (error) {
      console.error('Failed to get repository information:', error.message);
      throw error;
    }
  }

  /**
   * Get commit history
   * @param {Object} options - Options for log
   * @returns {Promise<Array>} - Commit history
   */
  async getCommitHistory(options = {}) {
    if (!this.git) {
      throw new Error('Git connector not initialized');
    }
    
    try {
      const defaultOptions = {
        maxCount: 50,
        ...options
      };
      
      const log = await this.git.log(defaultOptions);
      return log.all;
    } catch (error) {
      console.error('Failed to get commit history:', error.message);
      throw error;
    }
  }

  /**
   * Get diff for a specific commit or between commits
   * @param {string} [commit1] - First commit hash
   * @param {string} [commit2] - Second commit hash
   * @returns {Promise<string>} - Diff output
   */
  async getDiff(commit1, commit2) {
    if (!this.git) {
      throw new Error('Git connector not initialized');
    }
    
    try {
      if (commit1 && commit2) {
        return await this.git.diff([commit1, commit2]);
      } else if (commit1) {
        return await this.git.diff([commit1]);
      } else {
        return await this.git.diff();
      }
    } catch (error) {
      console.error('Failed to get diff:', error.message);
      throw error;
    }
  }

  /**
   * Get file content at a specific commit
   * @param {string} filePath - File path
   * @param {string} [commit] - Commit hash
   * @returns {Promise<string>} - File content
   */
  async getFileContent(filePath, commit) {
    if (!this.git) {
      throw new Error('Git connector not initialized');
    }
    
    try {
      if (commit) {
        return await this.git.show([`${commit}:${filePath}`]);
      } else {
        const fullPath = resolve(this.repoPath, filePath);
        return await this.git.catFile(['-p', fullPath]);
      }
    } catch (error) {
      console.error(`Failed to get file content for ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Get branch information
   * @returns {Promise<Object>} - Branch information
   */
  async getBranches() {
    if (!this.git) {
      throw new Error('Git connector not initialized');
    }
    
    try {
      const branches = await this.git.branch();
      return {
        current: branches.current,
        all: branches.all,
        remote: branches.remotes
      };
    } catch (error) {
      console.error('Failed to get branch information:', error.message);
      throw error;
    }
  }

  /**
   * Get status information
   * @returns {Promise<Object>} - Status information
   */
  async getStatus() {
    if (!this.git) {
      throw new Error('Git connector not initialized');
    }
    
    try {
      const status = await this.git.status();
      return {
        current: status.current,
        isClean: status.isClean(),
        modified: status.modified,
        staged: status.staged,
        created: status.created,
        deleted: status.deleted,
        notAdded: status.not_added,
        conflicted: status.conflicted,
        ignored: status.ignored
      };
    } catch (error) {
      console.error('Failed to get status information:', error.message);
      throw error;
    }
  }
} 