# Prompt 1

Let's create a "Repobot" project. 

The idea is to make NPM package that everyone can install to their own project git-repository and have an AI assistant capable to manage almost all the processes, such us task tracking, detailed work reports, planning etc. 

Application should read necessary information from git commits, status and diffs and from the TODO and other *.md documentation files, than process it with AI and make reports and summaries. Application should be able to add records to TODOs and check what is done using commits data.

**Repobot** should send reports to the team group chat or to the team manager directly using Telegram. 

## Main parts:
1. AI connector module: common interface to make AI requests and manage the prompt collection
2. GIT connector module: common interface to get actual information about the repository code and state: last commits, changes, etc.
3. File system module: interface to search TODO and README files to add them into context and extract useful information. And to make changes in that files.
4. Telegram connector module: interface that dedicated to interact with users (direct or in groups)
5. Report Templates: mechanism to set report templates and detalization by team members; time periods etc.

## Requirements:
1. Code should be written in modern JavaScript (ESM) with JSDoc type declarations to control types
2. App should work without any additional build setup, as a raw code
3. App can be started with the CLI command
4. App should have a configuration approach that can utilize different AI models
5. App should be able to wake up on cron task to make reports by schedule
6. Project repository should be well formatted to publish the project to Open Source
7. For the task management purposes, TODO.md files should be created for all the main application parts (modules)

## Dependencies
1. Use `grammy` library to interact with Telegram API
2. Try to use minimal set of external dependencies

## Code Style
1. Single quotes
2. 2 spaces to tab
3. Modern JS and node.js APIs: ESM, arrow functions, classes, node fetch, async/await etc.

## Development Plan

At first, let's create a detailed plan in *.md format and project README to clarify all the other details. After that, let's move step-by-step to implement project.


