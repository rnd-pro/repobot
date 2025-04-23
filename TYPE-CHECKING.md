# Type Checking in Repobot

Repobot uses a JavaScript-first approach with TypeScript type checking. This document explains how types are used and checked in this project.

## Type Definition Approach

We follow these principles for type definitions:

1. **JavaScript files with JSDoc annotations** - All source code is written in JavaScript with JSDoc comments for type definitions
2. **TypeScript declaration files** - We use `.d.ts` files for specialized type definitions
3. **Global type declarations** - Global types are defined in a root-level `types.d.ts` file
4. **Module-specific declarations** - Module-specific types are defined in `src/types/index.d.ts`

## JavaScript Runtime Types

We use JavaScript runtime types in our JSDoc declarations instead of TypeScript primitives:

| JavaScript Runtime Type | TypeScript Primitive | Example Usage |
|------------------------|----------------------|---------------|
| `String` | `string` | `@param {String} name` |
| `Number` | `number` | `@param {Number} count` |
| `Boolean` | `boolean` | `@param {Boolean} isActive` |
| `Object` | `object` | `@param {Object} data` |
| `Array` | `array` | `@param {Array} items` |
| `Function` | `function` | `@param {Function} callback` |

## Object Type Definitions

We use detailed object declarations instead of just `Object` or `any`:

```javascript
/**
 * @param {Object<string, String>} settings - User settings
 */
function updateSettings(settings) {
  // Implementation
}
```

## Complex Type Definitions

For complex types, we use `@typedef` declarations or external `.d.ts` files:

```javascript
/**
 * @typedef {Object} User
 * @property {String} id - User ID
 * @property {String} name - User name
 * @property {Number} age - User age
 * @property {Boolean} isActive - Whether user is active
 */

/**
 * @param {User} user - User object
 */
function processUser(user) {
  // Implementation
}
```

## TypeScript Configuration

Our `tsconfig.json` is configured to check JavaScript files with these key settings:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "noEmit": true,
    "checkJs": true
  }
}
```

## Running Type Checks

You can run type checking with:

```bash
npx tsc --noEmit
```

This will check all your JavaScript files for type errors without generating any output files. 