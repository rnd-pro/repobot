#!/usr/bin/env node

/**
 * Repobot CLI - Command-line interface for Repobot
 * @module repobot/cli
 */

import { initCommand } from './commands/init.js';
import { runCommand } from './commands/run.js';
import { configCommand } from './commands/config.js';
import { reportCommand } from './commands/report.js';

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
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  try {
    if (command === 'init') {
      await initCommand();
    } else if (command === 'run') {
      await runCommand();
    } else if (command === 'config') {
      await configCommand(args.slice(1));
    } else if (command === 'report') {
      await reportCommand(args.slice(1));
    } else {
      showHelp();
    }
  } catch (error) {
    console.error('Error:', getErrorMessage(error));
    process.exit(1);
  }
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
Repobot - AI assistant for managing development processes in Git repositories

Usage:
  repobot <command> [options]

Commands:
  init              Initialize Repobot in the current repository
  run               Run Repobot with the current configuration
  config            Manage Repobot configuration
  report            Generate a report
  help              Show this help message

Examples:
  repobot init
  repobot run
  repobot config set ai.provider openai
  repobot report daily
  `);
}

// Run the CLI
main().catch((error) => {
  console.error('Unhandled error:', getErrorMessage(error));
  process.exit(1);
}); 