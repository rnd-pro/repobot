/**
 * Generate a report
 * @module repobot/cli/commands/report
 */

import { resolve } from 'path';
import { existsSync } from 'fs';
import { Repobot } from '../../index.js';

/**
 * Generate a report
 * @param {string[]} args - Command arguments
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
  let config;
  try {
    const configModule = await import(configPath);
    config = configModule.default;
  } catch (error) {
    console.error('Failed to load configuration:', error.message);
    process.exit(1);
  }
  
  // Parse command arguments
  const [template = 'daily', ...options] = args;
  
  // Initialize Repobot
  const repobot = new Repobot(config);
  try {
    const success = await repobot.init();
    if (!success) {
      console.error('Failed to initialize Repobot');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error initializing Repobot:', error.message);
    process.exit(1);
  }
  
  // Generate report
  try {
    console.log(`Generating ${template} report...`);
    const report = await repobot.generateReport(template, { options });
    
    // Print report to console
    console.log('\nReport:');
    console.log('----------------------------------------');
    console.log(report);
    console.log('----------------------------------------');
    
    // Ask if user wants to send the report
    if (config.telegram && config.telegram.botToken) {
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
          } catch (error) {
            console.error('Failed to send report:', error.message);
          }
        }
      });
    } else {
      console.log('Telegram not configured. Report not sent.');
    }
  } catch (error) {
    console.error('Failed to generate report:', error.message);
    process.exit(1);
  }
} 