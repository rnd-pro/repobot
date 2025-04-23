/**
 * Declaration file for error handling
 */

/**
 * Error with message
 */
interface ErrorWithMessage {
  message: string;
  [key: string]: any;
}

/**
 * Check if error has message property
 * @param {unknown} error - Error to check
 * @returns {boolean} - True if error has message property
 */
function hasMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Get error message
 * @param {unknown} error - Error to get message from
 * @returns {string} - Error message
 */
function getErrorMessage(error: unknown): string {
  if (hasMessage(error)) return error.message;
  return String(error);
}

export { ErrorWithMessage, hasMessage, getErrorMessage }; 