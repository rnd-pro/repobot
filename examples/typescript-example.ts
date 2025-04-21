/**
 * TypeScript example for using Repobot
 */

// Import Node.js types
import { env } from 'node:process';

// Import Repobot directly from source
import { Repobot } from '../src/index.js';

async function main() {
  // Initialize Repobot with configuration
  const repobot = new Repobot({
    ai: {
      provider: 'openai',
      apiKey: env.AI_API_KEY || 'your-api-key',
      model: 'gpt-4',
    },
    telegram: {
      botToken: env.TELEGRAM_BOT_TOKEN || 'your-bot-token',
      chatId: env.TELEGRAM_CHAT_ID || 'your-chat-id',
    },
    reporting: {
      schedule: '0 9 * * 1-5', // Daily at 9 AM on weekdays
      template: 'daily',
    },
  });

  // Initialize Repobot
  const initialized = await repobot.init();
  if (!initialized) {
    console.error('Failed to initialize Repobot');
    return;
  }

  // Generate a report
  try {
    const report = await repobot.generateReport('daily');
    console.log('Generated report:');
    console.log(report);

    // Send the report via Telegram
    const sent = await repobot.sendReport(report);
    if (sent) {
      console.log('Report sent successfully');
    } else {
      console.error('Failed to send report');
    }
  } catch (error) {
    console.error('Error generating or sending report:', error);
  }

  // Process a custom query
  try {
    const query = 'What are the most important tasks that need to be done this week?';
    const response = await repobot.processQuery(query);
    console.log('AI response:');
    console.log(response);
  } catch (error) {
    console.error('Error processing query:', error);
  }
}

// Run the example
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 