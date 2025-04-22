# Contributing to Repobot

We love your input! We want to make contributing to Repobot as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Submit your pull request!

### JavaScript Styleguide

All JavaScript code is linted with ESLint and formatted with Prettier.

```bash
# Check linting
npm run lint

# Format code
npm run format

# Run type checking
npm run typecheck
```

### Testing

We use Node.js built-in test runner for testing. Run tests with:

```bash
npm test
```

### License

By contributing, you agree that your contributions will be licensed under the project's MIT License. 