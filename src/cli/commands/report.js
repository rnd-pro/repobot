/**
 * Generate a report
 * @module repobot/cli/commands/report
 */

import { resolve } from 'path';
import { existsSync } from 'fs';
import { Repobot } from '../../index.js';

/**
 * @typedef {import('../../config/index.js').ConfigOptions} Config
 */

/**
 * Valid report template types
 * @typedef {'daily' | 'weekly' | 'monthly' | 'custom'} ReportTemplate
 */

/**
 * Generate a report
 * @param {string[]} args - Command arguments
 * @returns {Promise<void>}
 */
export async function reportCommand(args) {
  console.log('Generating report...');
  
  // Check if config file exists
  const configPath = resolve(process.cwd(), 'repobot.config.js');
  if (!existsSync(configPath)) {
    console.error('Configuration file not found. Run "repobot init" first.');
    process.exit(1);
  }
  
  // Import configuration
  /** @type {Config} */
  let config;
  try {
    const configModule = await import(configPath);
    config = configModule.default;
  } catch (/** @type {unknown} */ error) {
    console.error('Failed to load configuration:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
  
  // Parse command arguments
  /** @type {ReportTemplate} */
  const template = /** @type {ReportTemplate} */ (args[0] || 'daily');
  const reportOptions = args.slice(1);

  // Validate template
  if (!['daily', 'weekly', 'monthly', 'custom'].includes(template)) {
    console.error('Invalid report template. Must be one of: daily, weekly, monthly, custom');
    process.exit(1);
  }
  
  // Initialize Repobot
  const repobot = new Repobot(config);
  try {
    const success = await repobot.init();
    if (!success) {
      console.error('Failed to initialize Repobot');
      process.exit(1);
    }
  } catch (/** @type {unknown} */ error) {
    console.error('Error initializing Repobot:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
  
  // Generate report
  try {
    console.log(`Generating ${template} report...`);
    const report = await repobot.generateReport(template, {
      format: reportOptions[0],
      includeGit: true,
      includeTodos: true,
      includeDocumentation: true
    });
    
    // Print report to console
    console.log('\nReport:');
    console.log('----------------------------------------');
    console.log(report);
    console.log('----------------------------------------');
    
    // Ask if user wants to send the report
    if (config.telegram?.botToken) {
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('Do you want to send this report via Telegram? (y/n) ', async (answer) => {
        rl.close();
        
        if (answer.toLowerCase() === 'y') {
          try {
            await repobot.sendReport(report);
            console.log('Report sent successfully');
          } catch (/** @type {unknown} */ error) {
            console.error('Failed to send report:', error instanceof Error ? error.message : 'Unknown error');
          }
        }
      });
    } else {
      console.log('Telegram not configured. Report not sent.');
    }
  } catch (/** @type {unknown} */ error) {
    console.error('Failed to generate report:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
} 