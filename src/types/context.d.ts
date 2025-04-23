/**
 * Declaration file for context object used across modules
 */

/**
 * Git context information
 */
interface GitContext {
  currentBranch: string;
  modifiedFiles: string[];
  stagedFiles: string[];
  untrackedFiles: string[];
  recentCommits: Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>;
}

/**
 * TODO task information
 */
interface TodoTask {
  description: string;
  completed: boolean;
  section: string;
}

/**
 * TODO file information
 */
interface TodoInfo {
  tasks: TodoTask[];
  sections: string[];
}

/**
 * Documentation section information
 */
interface DocumentationSection {
  title: string;
  level: number;
  content: string[];
}

/**
 * Documentation file information
 */
interface DocumentationInfo {
  sections: DocumentationSection[];
  title: string;
  content: string;
}

/**
 * Repository context information for AI processing
 */
interface RepositoryContext {
  git?: GitContext;
  todos?: Record<string, TodoInfo>;
  documentation?: Record<string, DocumentationInfo>;
  timestamp?: string;
  [key: string]: any;
}

export {
  GitContext,
  TodoTask,
  TodoInfo,
  DocumentationSection,
  DocumentationInfo,
  RepositoryContext
}; 