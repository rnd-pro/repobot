/**
 * Run Repobot with the current configuration
 * @module repobot/cli/commands/run
 */

import { resolve } from 'path';
import { existsSync } from 'fs';
import { Repobot } from '../../index.js';
import { scheduleJob } from 'node-cron';

/**
 * Run Repobot with the current configuration
 */
export async function runCommand() {
  console.log('Starting Repobot...');
  
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Failed to load configuration:', errorMessage);
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error initializing Repobot:', errorMessage);
    process.exit(1);
  }
  
  // Set up scheduled reports if configured
  if (config.reporting && config.reporting.schedule) {
    console.log(`Scheduling reports with cron: ${config.reporting.schedule}`);
    scheduleJob(config.reporting.schedule, async () => {
      try {
        console.log('Generating scheduled report...');
        const report = await repobot.generateReport(config.reporting.template || 'daily');
        await repobot.sendReport(report);
        console.log('Report sent successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Failed to generate or send scheduled report:', errorMessage);
      }
    });
  }
  
  // Start Telegram bot if configured
  if (config.telegram && config.telegram.botToken) {
    try {
      await repobot.telegram.start();
      console.log('Telegram bot started');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to start Telegram bot:', errorMessage);
    }
  }
  
  console.log('Repobot is running. Press Ctrl+C to stop.');
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down Repobot...');
    if (repobot.telegram) {
      await repobot.telegram.stop();
    }
    process.exit(0);
  });
} 