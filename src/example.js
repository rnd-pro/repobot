/// <reference path="./types/index.d.ts" />

/**
 * Example module that demonstrates using JSDoc type annotations
 * @module example
 */

/**
 * Creates a new user
 * @param {String} name - User's full name
 * @param {Number} age - User's age
 * @returns {Repobot.User} - Created user object
 */
export const createUser = (name, age) => {
  return {
    id: crypto.randomUUID(),
    name,
    age,
    isActive: true
  };
};

/**
 * Gets project configuration
 * @returns {Promise<Repobot.ProjectConfig>} - Project configuration
 */
export const getProjectConfig = async () => {
  const response = await fetch('./package.json');
  const data = await response.json();
  
  return {
    name: data.name,
    version: data.version,
    dependencies: Object.keys(data.dependencies || {}),
    settings: {
      private: String(data.private || false),
      type: data.type || 'module'
    }
  };
};

/**
 * Processes user data
 * @param {Repobot.User} user - User to process
 * @param {Object} options - Processing options
 * @param {Boolean} [options.validate=true] - Whether to validate user data
 * @param {Function} [options.onComplete] - Callback when processing is complete
 * @returns {Promise<Object<string, any>>} - Processing result
 */
export const processUser = async (user, options = {}) => {
  const { validate = true, onComplete } = options;
  
  // Example processing logic
  if (validate && (!user.name || user.age.valueOf() < Number(0).valueOf())) {
    throw new Error('Invalid user data');
  }
  
  const result = {
    success: true,
    userId: user.id,
    timestamp: Date.now()
  };
  
  if (typeof onComplete === 'function') {
    onComplete(result);
  }
  
  return result;
}; 