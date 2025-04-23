/**
 * Global project type definitions
 */

declare global {
  /**
   * User data structure
   */
  interface User {
    id: string;
    name: string;
    age: number;
    isActive: boolean;
  }

  /**
   * Project configuration
   */
  interface ProjectConfig {
    name: string;
    version: string;
    dependencies: string[];
    settings: Record<string, string>;
  }
}

export {}; 