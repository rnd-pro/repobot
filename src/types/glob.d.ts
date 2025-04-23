/**
 * Declaration file for glob module
 */
declare module 'glob' {
  /**
   * Glob options interface
   */
  interface GlobOptions {
    cwd?: string;
    absolute?: boolean;
    dot?: boolean;
    ignore?: string[];
    nodir?: boolean;
    mark?: boolean;
    noglobstar?: boolean;
    nomount?: boolean;
    [key: string]: any;
  }

  /**
   * Find files matching a pattern
   * @param {string|Array<string>} pattern - Glob pattern
   * @param {GlobOptions} options - Glob options
   * @returns {Promise<Array<string>>} - Matching file paths
   */
  export function glob(pattern: string | string[], options?: GlobOptions): Promise<string[]>;
} 