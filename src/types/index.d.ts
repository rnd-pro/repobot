/**
 * TypeScript declarations for Repobot
 */

declare module 'repobot' {
  export interface Config {
    ai?: {
      provider: 'openai';
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
    repositoryPath?: string;
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

  export interface TodoInfo {
    file: string;
    tasks: Array<{
      description: string;
      completed: boolean;
    }>;
  }

  export interface DocumentationInfo {
    file: string;
    sections: Array<{
      title: string;
      content: string;
    }>;
  }

  export class Repobot {
    constructor(config?: Config);
    init(): Promise<boolean>;
    run(): Promise<void>;
    stop(): Promise<void>;
  }

  export class Config {
    constructor(config?: Config);
    get(key: string): any;
    set(key: string, value: any): void;
    getAll(): Config;
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