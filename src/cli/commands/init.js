/**
 * Initialize Repobot in the current repository
 * @module repobot/cli/commands/init
 */

import { resolve } from 'path';
import { writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { Repobot } from '../../index.js';

/**
 * Default configuration template
 */
const DEFAULT_CONFIG = `export default {
  ai: {
    provider: 'openai',
    apiKey: process.env.AI_API_KEY,
    model: 'gpt-4',
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
    groupId: process.env.TELEGRAM_GROUP_ID,
  },
  reporting: {
    schedule: '0 9 * * 1-5',
    template: 'daily',
  },
  repository: {
    paths: {
      todos: ['**/TODO.md', '**/TODO'],
      documentation: ['**/*.md'],
    },
  },
};
`;

/**
 * Get error message safely from unknown error
 * @param {unknown} error - The caught error
 * @returns {String} Error message
 */
const getErrorMessage = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

/**
 * Initialize Repobot in the current repository
 */
export async function initCommand() {
  console.log('Initializing Repobot...');
  
  // Check if config file already exists
  const configPath = resolve(process.cwd(), 'repobot.config.js');
  if (existsSync(configPath)) {
    console.log('Configuration file already exists. Use "repobot config" to modify it.');
    return;
  }
  
  // Create default config file
  try {
    await writeFile(configPath, DEFAULT_CONFIG, 'utf8');
    console.log('Created default configuration file: repobot.config.js');
  } catch (error) {
    console.error('Failed to create configuration file:', getErrorMessage(error));
    process.exit(1);
  }
  
  // Create TODO files for each module
  const modules = ['ai', 'git', 'filesystem', 'telegram', 'reports', 'config', 'cli'];
  for (const module of modules) {
    const todoPath = resolve(process.cwd(), `TODO.${module}.md`);
    if (!existsSync(todoPath)) {
      const todoContent = `# TODO for ${module.toUpperCase()} module

## Tasks
- [ ] Implement core functionality
- [ ] Add tests
- [ ] Document API

## Notes
- Add specific tasks as needed
`;
      await writeFile(todoPath, todoContent, 'utf8');
      console.log(`Created TODO file for ${module} module`);
    }
  }
  
  // Initialize Repobot
  try {
    const repobot = new Repobot();
    const success = await repobot.init();
    if (success) {
      console.log('Repobot initialized successfully!');
      console.log('\nNext steps:');
      console.log('1. Edit repobot.config.js to set your AI API key and Telegram bot token');
      console.log('2. Run "repobot run" to start Repobot');
    } else {
      console.error('Failed to initialize Repobot');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error initializing Repobot:', getErrorMessage(error));
    process.exit(1);
  }
} 