/**
 * Type declarations for the repobot module
 */

declare module 'repobot' {
  export type ReportTemplate = 'daily' | 'weekly' | 'monthly' | 'custom';

  export interface ReportOptions {
    format?: String;
    includeGit?: Boolean;
    includeTodos?: Boolean;
    includeDocumentation?: Boolean;
    customFields?: Object<string, String>;
  }

  /**
   * Repository configuration
   */
  export interface Config {
    ai?: {
      provider: string;
      apiKey?: string;
      model?: string;
    };
    telegram?: {
      botToken?: string;
      chatId?: string;
      groupId?: string;
    };
    reporting?: {
      schedule?: string;
      template?: string;
    };
    repository?: {
      paths?: {
        todos?: string[];
        documentation?: string[];
      };
      ignoreFiles?: string[];
    };
  }

  /**
   * Todo item information
   */
  export interface TodoItem {
    description: string;
    completed: boolean;
    section: string;
  }

  /**
   * Todo information
   */
  export interface TodoInfo {
    tasks: TodoItem[];
    sections: string[];
  }

  /**
   * Documentation section
   */
  export interface DocumentationSection {
    title: string;
    level: number;
    content: string[];
  }

  /**
   * Documentation information
   */
  export interface DocumentationInfo {
    sections: DocumentationSection[];
    title: string;
    content: string;
  }

  /**
   * Main Repobot class
   */
  export class Repobot {
    constructor(config?: Config);
    init(): Promise<boolean>;
    run(): Promise<void>;
    stop(): Promise<void>;
    generateReport(template?: ReportTemplate, options?: ReportOptions): Promise<string>;
  }

  /**
   * Configuration manager
   */
  export class Config {
    constructor(config?: Config);
    get(key: string): any;
    set(key: string, value: any): void;
    getAll(): Config;
  }

  export interface GitInfo {
    currentBranch: string;
    status: {
      modified: string[];
      staged: string[];
      untracked: string[];
    };
    recentCommits: Array<{
      hash: string;
      message: string;
      author: string;
      date: string;
    }>;
    remotes: Array<{
      name: string;
      url: string;
    }>;
    branches: string[];
    tags: string[];
  }

  export class GitConnector {
    constructor(config: Config);
    init(): Promise<boolean>;
    getRepositoryInfo(): Promise<GitInfo>;
    getCommitHistory(options?: { maxCount?: number }): Promise<any>;
    getDiff(commit1?: string, commit2?: string): Promise<string>;
    getFileContent(filePath: string, commit?: string): Promise<string>;
    getBranches(): Promise<any>;
    getStatus(): Promise<any>;
  }

  export class FileSystem {
    constructor(config: Config);
    init(): Promise<boolean>;
    findFiles(patterns: string[], options?: any): Promise<string[]>;
    readFile(filePath: string): Promise<string>;
    writeFile(filePath: string, content: string): Promise<boolean>;
    appendToFile(filePath: string, content: string): Promise<boolean>;
    getTodoInfo(): Promise<TodoInfo[]>;
    getDocumentationInfo(): Promise<DocumentationInfo[]>;
    updateTodoStatus(filePath: string, taskDescription: string, completed: boolean): Promise<boolean>;
  }

  export class AIConnector {
    constructor(config: Config);
    processQuery(query: string, context?: any): Promise<string>;
    generateReport(template: string, context: any, options?: any): Promise<string>;
  }

  export class TelegramConnector {
    constructor(config: Config);
    init(): Promise<boolean>;
    start(): Promise<void>;
    stop(): Promise<void>;
    sendMessage(message: string): Promise<boolean>;
  }
}

declare global {
  namespace Repobot {
    interface User {
      id: String;
      name: String;
      age: Number;
      isActive: Boolean;
    }

    interface ProjectConfig {
      name: String;
      version: String;
      dependencies: Array<String>;
      settings: {
        private: String;
        type: String;
      };
    }
  }
}

// This empty export is needed to make this a module
export {}; 