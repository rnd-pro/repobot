#!/bin/bash

# Exit on error
set -e

echo "Setting up Repobot project..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Run type checking
echo "Running type checking..."
npm run typecheck

echo "Setup complete! You can now run the project with 'npm start'" 