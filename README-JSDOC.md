# Using JSDoc with TypeScript Declarations in Repobot

This document explains how we use JSDoc annotations with TypeScript declarations in Repobot to provide type checking without writing TypeScript code directly.

## Overview

Repobot uses JavaScript with JSDoc annotations for type checking, leveraging TypeScript's type system. This approach gives us:

- **Pure JavaScript Code**: We write only JavaScript, maintaining maximum compatibility and avoiding a build step
- **Type Safety**: We get TypeScript's type checking benefits without writing TypeScript
- **IDE Support**: Modern editors provide autocomplete and type checking for JSDoc annotations
- **Documentation**: JSDoc comments serve as both types and documentation

## TypeScript Configuration

Our `tsconfig.json` is configured to check JavaScript files with JDDoc annotations:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    // Other options...
  }
}
```

## Declaration Files (.d.ts)

We use `.d.ts` files for type definitions that:
- Define interfaces and types for our codebase
- Provide type declarations for third-party libraries without types
- Declare global types

### Module-Specific Declarations

Module-specific types are defined in `src/types/`.

```typescript
// src/types/config.d.ts
export interface ConfigOptions {
  // Properties...
}

export declare class Config {
  // Methods...
}
```

### Global Declarations

Global types are defined in a root `types.d.ts` file:

```typescript
// types.d.ts
declare global {
  interface User {
    // Properties...
  }
}
```

## JSDoc Type Annotations

In our JavaScript files, we use JSDoc annotations to reference these types:

```javascript
/**
 * Process user data
 * @param {User} user - User object
 * @returns {Promise<Object<string, any>>} - Processing result
 */
export async function processUser(user) {
  // Implementation...
}
```

For more complex types, we can import types from declaration files:

```javascript
/**
 * Configure application
 * @param {import('./types/config').ConfigOptions} options - Configuration options
 * @returns {import('./types/config').Config} - Configuration instance
 */
export function configure(options) {
  // Implementation...
}
```

## Running Type Checks

Type checking is run with:

```bash
npm run typecheck
```

This runs TypeScript's compiler in "check only" mode without generating any output files.

## Best Practices

1. Use JavaScript runtime types in JSDoc annotations:
   - `{String}` instead of `{string}`
   - `{Number}` instead of `{number}`
   - `{Boolean}` instead of `{boolean}`

2. Use detailed object declarations:
   - `{Object<string, String>}` instead of `{Object}`

3. For complex types, use declaration files or `@typedef`

4. Keep TypeScript-specific syntax in `.d.ts` files only 