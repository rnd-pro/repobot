/**
 * Git connector module for Repobot
 * @module repobot/git
 */

import { simpleGit } from 'simple-git';
import { resolve } from 'path';

/**
 * @typedef {import('../index.js').GitInfo} GitInfo
 * @typedef {import('../index.js').GitCommit} GitCommit
 * @typedef {import('../index.js').GitBranches} GitBranches
 * @typedef {import('../index.js').GitRemote} GitRemote
 */

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
    /** @type {import('simple-git').SimpleGit | null} */
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
      if (error instanceof Error) {
        console.error('Failed to initialize Git connector:', error.message);
      } else {
        console.error('Failed to initialize Git connector:', String(error));
      }
      return false;
    }
  }

  /**
   * Get repository information
   * @returns {Promise<GitInfo>} - Repository information
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
      
      /** @type {GitInfo} */
      const info = {
        currentBranch: status.current || 'HEAD',
        isClean: status.isClean(),
        modifiedFiles: status.modified,
        stagedFiles: status.staged,
        untrackedFiles: status.not_added,
        recentCommits: log.all.map(commit => ({
          hash: commit.hash,
          message: commit.message,
          author: commit.author_name,
          date: commit.date
        })),
        remotes: remotes.map(remote => ({
          name: remote.name,
          refs: remote.refs.fetch
        })),
        branches: {
          current: branches.current,
          all: branches.all,
          remotes: branches.all.filter(b => b.startsWith('remotes/'))
        },
        tags: tags.all,
        path: this.repoPath
      };
      
      return info;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to get repository information:', error.message);
      } else {
        console.error('Failed to get repository information:', String(error));
      }
      throw error;
    }
  }

  /**
   * Get commit history
   * @param {Object} options - Options for log
   * @returns {Promise<Array<GitCommit>>} - Commit history
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
      return log.all.map(commit => ({
        hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        date: commit.date
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to get commit history:', error.message);
      } else {
        console.error('Failed to get commit history:', String(error));
      }
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
      if (error instanceof Error) {
        console.error('Failed to get diff:', error.message);
      } else {
        console.error('Failed to get diff:', String(error));
      }
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
      if (error instanceof Error) {
        console.error(`Failed to get file content for ${filePath}:`, error.message);
      } else {
        console.error(`Failed to get file content for ${filePath}:`, String(error));
      }
      throw error;
    }
  }

  /**
   * Get branch information
   * @returns {Promise<GitBranches>} - Branch information
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
        remotes: branches.all.filter(b => b.startsWith('remotes/'))
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to get branch information:', error.message);
      } else {
        console.error('Failed to get branch information:', String(error));
      }
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
      if (error instanceof Error) {
        console.error('Failed to get status information:', error.message);
      } else {
        console.error('Failed to get status information:', String(error));
      }
      throw error;
    }
  }
} 