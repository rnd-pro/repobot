/**
 * Declaration file for node-cron module
 */
declare module 'node-cron' {
  /**
   * Schedule a task to run on a specific schedule
   * @param {string} expression - Cron expression
   * @param {Function} func - Function to execute
   * @returns {Object} - ScheduledTask object
   */
  export function scheduleJob(expression: string, func: Function): {
    stop: () => void;
    start: () => void;
    getStatus: () => string;
  };

  /**
   * Validate a cron expression
   * @param {string} expression - Cron expression
   * @returns {boolean} - Whether expression is valid
   */
  export function validate(expression: string): boolean;
} 