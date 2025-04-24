# Repobot

Repobot is an NPM package that provides an AI assistant for managing development processes in Git repositories. It helps with task tracking, detailed work reports, planning, and more.

## Features

- **AI-Powered Insights**: Analyzes Git commits, status, and diffs to provide meaningful insights
- **Documentation Management**: Reads and updates TODO and other markdown documentation files
- **Task Tracking**: Automatically tracks completed tasks based on commit data
- **Reporting**: Generates and sends reports to team group chats or managers via Telegram
- **Scheduled Reports**: Can be configured to run on a schedule via cron tasks
- **Multiple AI Models**: Configurable to use different AI models for processing
- **TypeScript Support**: Full TypeScript type checking with JSDoc declarations

## Installation

```bash
npm install @rnd-pro/repobot
```

## Quick Start

1. Configure Repobot in your project:

```bash
npx @rnd-pro/repobot init
```

2. Set up your AI API key and Telegram bot token in the configuration file

3. Run Repobot:

```bash
npx @rnd-pro/repobot run
```

## CLI Usage

After installation, the `repobot` command becomes available in your terminal:

```bash
# Show all available commands and options
repobot --help

# Initialize a new configuration file
repobot init

# Generate reports
repobot report daily    # Generate daily report
repobot report weekly   # Generate weekly report
repobot report monthly  # Generate monthly report

# Monitor repository and generate reports automatically
repobot watch

# Manage tasks
repobot tasks list            # List all tasks
repobot tasks complete <id>   # Mark task as completed

# Send reports via Telegram
repobot send daily    # Send daily report
repobot send weekly   # Send weekly report

# Show repository insights
repobot insights
```

## Configuration

Repobot can be configured through a `repobot.config.js` file in your project root:

```javascript
export default {
  ai: {
    apiKey: process.env.AI_API_KEY,
    model: 'gpt-4', // or other models
    endpoint: 'https://api.openai.com/v1/chat/completions', // or other AI provider endpoints
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID, // for direct messages
    groupId: process.env.TELEGRAM_GROUP_ID, // for group messages
  },
  reporting: {
    schedule: '0 9 * * 1-5', // daily at 9 AM on weekdays
    template: 'daily', // or 'weekly', 'monthly', 'custom'
  },
  repository: {
    paths: {
      todos: ['**/TODO.md', '**/TODO'],
      documentation: ['**/*.md'],
    },
  },
};
```

## Modules

Repobot consists of several core modules:

1. **AI Connector**: Interface for making AI requests and managing prompts
2. **Git Connector**: Interface for accessing repository information
3. **File System Module**: Interface for searching and modifying documentation files
4. **Telegram Connector**: Interface for user interaction via Telegram
5. **Report Templates**: Mechanism for customizable report generation

## Development

Repobot is written in modern JavaScript (ESM) with JSDoc type declarations and TypeScript support for static code analysis. It requires Node.js 18+.

### TypeScript Support

Repobot is built with TypeScript support for static code analysis, allowing you to use it in both JavaScript and TypeScript projects:

```typescript
import { Repobot } from '@rnd-pro/repobot';

// Initialize Repobot with configuration
const repobot = new Repobot({
  ai: {
    apiKey: process.env.AI_API_KEY,
    endpoint: 'https://api.openai.com/v1/chat/completions',
  },
});

// Use Repobot with full TypeScript type checking
async function generateReport() {
  const report = await repobot.generateReport('daily');
  console.log(report);
}
```

### Project Structure

```
repobot/
├── src/
│   ├── ai/           # AI connector module
│   ├── git/          # Git connector module
│   ├── filesystem/   # File system module
│   ├── telegram/     # Telegram connector module
│   ├── reports/      # Report templates and generation
│   ├── config/       # Configuration handling
│   └── cli/          # Command-line interface
├── tests/            # Test files
├── examples/         # Example usage
├── repobot.config.js # Default configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Package definition
```

### Development Scripts

```bash
# Run type checking
npm run typecheck

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 