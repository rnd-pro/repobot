#!/usr/bin/env node

/**
 * Repobot CLI - Command-line interface for Repobot
 * @module repobot/cli
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { Repobot } from '../index.js';
import { initCommand } from './commands/init.js';
import { runCommand } from './commands/run.js';
import { configCommand } from './commands/config.js';
import { reportCommand } from './commands/report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  try {
    switch (command) {
      case 'init':
        await initCommand(args.slice(1));
        break;
      case 'run':
        await runCommand(args.slice(1));
        break;
      case 'config':
        await configCommand(args.slice(1));
        break;
      case 'report':
        await reportCommand(args.slice(1));
        break;
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
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
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 