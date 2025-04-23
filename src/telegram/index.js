/**
 * Telegram Connector module for Repobot
 * @module repobot/telegram
 */

import { Bot } from 'grammy';

/**
 * @typedef {Object} Config
 * @property {Function} get - Function to get configuration values
 */

/**
 * @typedef {Object} TelegramContext
 * @property {Function} reply - Function to reply to messages
 */

/**
 * Telegram Connector class for Repobot
 */
export class TelegramConnector {
  /**
   * Create a new TelegramConnector instance
   * @param {Config} config - Repobot configuration
   */
  constructor(config) {
    /** @type {Config} */
    this.config = config;
    /** @type {String|undefined} */
    this.botToken = this.config.get('telegram.botToken') || process.env.TELEGRAM_BOT_TOKEN;
    /** @type {String|undefined} */
    this.chatId = this.config.get('telegram.chatId') || process.env.TELEGRAM_CHAT_ID;
    /** @type {String|undefined} */
    this.groupId = this.config.get('telegram.groupId') || process.env.TELEGRAM_GROUP_ID;
    /** @type {Bot|null} */
    this.bot = null;
  }

  /**
   * Initialize the Telegram connector
   * @returns {Promise<boolean>} - Success status
   */
  async init() {
    if (!this.botToken) {
      console.warn('Telegram bot token not provided');
      return false;
    }
    
    try {
      this.bot = new Bot(this.botToken);
      return true;
    } catch (/** @type {unknown} */ error) {
      if (error instanceof Error) {
        console.error('Failed to initialize Telegram connector:', error.message);
      } else {
        console.error('Failed to initialize Telegram connector:', error);
      }
      return false;
    }
  }

  /**
   * Start the Telegram bot
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    if (!this.bot) {
      const success = await this.init();
      if (!success) {
        return false;
      }
    }
    
    try {
      if (!this.bot) {
        throw new Error('Bot is not initialized');
      }

      // Set up command handlers
      this.bot.command('start', this.handleStartCommand.bind(this));
      this.bot.command('help', this.handleHelpCommand.bind(this));
      this.bot.command('status', this.handleStatusCommand.bind(this));
      this.bot.command('report', this.handleReportCommand.bind(this));
      
      // Set up message handler
      this.bot.on('message', this.handleMessage.bind(this));
      
      // Start the bot
      await this.bot.start();
      console.log('Telegram bot started');
      return true;
    } catch (/** @type {unknown} */ error) {
      if (error instanceof Error) {
        console.error('Failed to start Telegram bot:', error.message);
      } else {
        console.error('Failed to start Telegram bot:', error);
      }
      return false;
    }
  }

  /**
   * Stop the Telegram bot
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    if (!this.bot) {
      return true;
    }
    
    try {
      await this.bot.stop();
      console.log('Telegram bot stopped');
      return true;
    } catch (/** @type {unknown} */ error) {
      if (error instanceof Error) {
        console.error('Failed to stop Telegram bot:', error.message);
      } else {
        console.error('Failed to stop Telegram bot:', error);
      }
      return false;
    }
  }

  /**
   * Send a message to the configured chat
   * @param {string} message - Message to send
   * @returns {Promise<boolean>} - Success status
   */
  async sendMessage(message) {
    if (!this.bot) {
      const success = await this.init();
      if (!success) {
        return false;
      }
    }
    
    try {
      if (!this.bot) {
        throw new Error('Bot is not initialized');
      }

      // Determine the chat ID to use
      const chatId = this.groupId || this.chatId;
      
      if (!chatId) {
        throw new Error('No chat ID configured');
      }
      
      // Send the message
      await this.bot.api.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      return true;
    } catch (/** @type {unknown} */ error) {
      if (error instanceof Error) {
        console.error('Failed to send Telegram message:', error.message);
      } else {
        console.error('Failed to send Telegram message:', error);
      }
      return false;
    }
  }

  /**
   * Handle the /start command
   * @param {TelegramContext} ctx - Telegram context
   */
  async handleStartCommand(ctx) {
    await ctx.reply(
      'Hello! I am Repobot, an AI assistant for managing development processes in Git repositories.\n\n' +
      'Use /help to see available commands.'
    );
  }

  /**
   * Handle the /help command
   * @param {TelegramContext} ctx - Telegram context
   */
  async handleHelpCommand(ctx) {
    await ctx.reply(
      'Available commands:\n\n' +
      '/start - Start the bot\n' +
      '/help - Show this help message\n' +
      '/status - Get repository status\n' +
      '/report [template] - Generate a report\n\n' +
      'You can also ask me questions about your repository!'
    );
  }

  /**
   * Handle the /status command
   * @param {TelegramContext} ctx - Telegram context
   */
  async handleStatusCommand(ctx) {
    // This would be implemented to get repository status
    await ctx.reply('Repository status feature not implemented yet.');
  }

  /**
   * Handle the /report command
   * @param {TelegramContext} ctx - Telegram context
   */
  async handleReportCommand(ctx) {
    // This would be implemented to generate reports
    await ctx.reply('Report generation feature not implemented yet.');
  }

  /**
   * Handle incoming messages
   * @param {TelegramContext} ctx - Telegram context
   */
  async handleMessage(ctx) {
    // This would be implemented to process user queries
    await ctx.reply('Message processing feature not implemented yet.');
  }
} 