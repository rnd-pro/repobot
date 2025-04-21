/**
 * Manage Repobot configuration
 * @module repobot/cli/commands/config
 */

import { resolve } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { z } from 'zod';

/**
 * Configuration schema for validation
 */
const ConfigSchema = z.object({
  ai: z.object({
    provider: z.string(),
    apiKey: z.string().optional(),
    model: z.string().optional(),
  }).optional(),
  telegram: z.object({
    botToken: z.string().optional(),
    chatId: z.string().optional(),
    groupId: z.string().optional(),
  }).optional(),
  reporting: z.object({
    schedule: z.string().optional(),
    template: z.string().optional(),
  }).optional(),
  repository: z.object({
    paths: z.object({
      todos: z.array(z.string()).optional(),
      documentation: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
});

/**
 * Manage Repobot configuration
 * @param {string[]} args - Command arguments
 */
export async function configCommand(args) {
  const configPath = resolve(process.cwd(), 'repobot.config.js');
  
  // Check if config file exists
  if (!existsSync(configPath)) {
    console.error('Configuration file not found. Run "repobot init" first.');
    process.exit(1);
  }
  
  // Parse command
  const [action, ...params] = args;
  
  if (!action) {
    showConfig();
    return;
  }
  
  switch (action) {
    case 'get':
      if (params.length === 0) {
        showConfig();
      } else {
        getConfigValue(params[0]);
      }
      break;
    case 'set':
      if (params.length < 2) {
        console.error('Usage: repobot config set <key> <value>');
        process.exit(1);
      }
      setConfigValue(params[0], params.slice(1).join(' '));
      break;
    case 'validate':
      validateConfig();
      break;
    default:
      console.error(`Unknown action: ${action}`);
      console.log('Available actions: get, set, validate');
      process.exit(1);
  }
}

/**
 * Show the current configuration
 */
function showConfig() {
  const configPath = resolve(process.cwd(), 'repobot.config.js');
  const configContent = readFileSync(configPath, 'utf8');
  console.log('Current configuration:');
  console.log(configContent);
}

/**
 * Get a configuration value
 * @param {string} key - Configuration key (dot notation)
 */
function getConfigValue(key) {
  const configPath = resolve(process.cwd(), 'repobot.config.js');
  const configContent = readFileSync(configPath, 'utf8');
  
  // Extract the config object from the file
  const configMatch = configContent.match(/export default\s+({[\s\S]*?});/);
  if (!configMatch) {
    console.error('Invalid configuration file format');
    process.exit(1);
  }
  
  // Parse the config object
  let config;
  try {
    // Use Function constructor to evaluate the object literal
    const configStr = configMatch[1];
    const configFn = new Function(`return ${configStr}`);
    config = configFn();
  } catch (error) {
    console.error('Failed to parse configuration:', error.message);
    process.exit(1);
  }
  
  // Get the value using dot notation
  const keys = key.split('.');
  let value = config;
  for (const k of keys) {
    if (value === undefined || value === null) {
      console.error(`Configuration key not found: ${key}`);
      process.exit(1);
    }
    value = value[k];
  }
  
  console.log(`${key} = ${JSON.stringify(value)}`);
}

/**
 * Set a configuration value
 * @param {string} key - Configuration key (dot notation)
 * @param {string} value - Configuration value
 */
function setConfigValue(key, value) {
  const configPath = resolve(process.cwd(), 'repobot.config.js');
  const configContent = readFileSync(configPath, 'utf8');
  
  // Extract the config object from the file
  const configMatch = configContent.match(/export default\s+({[\s\S]*?});/);
  if (!configMatch) {
    console.error('Invalid configuration file format');
    process.exit(1);
  }
  
  // Parse the config object
  let config;
  try {
    // Use Function constructor to evaluate the object literal
    const configStr = configMatch[1];
    const configFn = new Function(`return ${configStr}`);
    config = configFn();
  } catch (error) {
    console.error('Failed to parse configuration:', error.message);
    process.exit(1);
  }
  
  // Set the value using dot notation
  const keys = key.split('.');
  let current = config;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (current[k] === undefined) {
      current[k] = {};
    }
    current = current[k];
  }
  
  // Parse the value based on its format
  let parsedValue = value;
  if (value === 'true') {
    parsedValue = true;
  } else if (value === 'false') {
    parsedValue = false;
  } else if (!isNaN(value)) {
    parsedValue = Number(value);
  } else if (value.startsWith('[') && value.endsWith(']')) {
    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      // Keep as string if not valid JSON
    }
  } else if (value.startsWith('{') && value.endsWith('}')) {
    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      // Keep as string if not valid JSON
    }
  }
  
  current[keys[keys.length - 1]] = parsedValue;
  
  // Write the updated config back to the file
  const updatedConfig = `export default ${JSON.stringify(config, null, 2)};`;
  writeFileSync(configPath, updatedConfig, 'utf8');
  
  console.log(`Updated ${key} = ${JSON.stringify(parsedValue)}`);
}

/**
 * Validate the configuration
 */
function validateConfig() {
  const configPath = resolve(process.cwd(), 'repobot.config.js');
  const configContent = readFileSync(configPath, 'utf8');
  
  // Extract the config object from the file
  const configMatch = configContent.match(/export default\s+({[\s\S]*?});/);
  if (!configMatch) {
    console.error('Invalid configuration file format');
    process.exit(1);
  }
  
  // Parse the config object
  let config;
  try {
    // Use Function constructor to evaluate the object literal
    const configStr = configMatch[1];
    const configFn = new Function(`return ${configStr}`);
    config = configFn();
  } catch (error) {
    console.error('Failed to parse configuration:', error.message);
    process.exit(1);
  }
  
  // Validate the config
  try {
    ConfigSchema.parse(config);
    console.log('Configuration is valid');
  } catch (error) {
    console.error('Configuration validation failed:');
    console.error(error.errors);
    process.exit(1);
  }
} 