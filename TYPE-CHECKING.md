# Type Checking in Repobot

Repobot uses a JavaScript-first approach with TypeScript type checking through JSDoc annotations. This document explains how types are used and checked in this project.

## Benefits of JavaScript-First Approach

Using JavaScript with JSDoc type annotations instead of pure TypeScript offers several advantages:

1. **Runtime Type Accuracy** - JavaScript runtime types (`String`, `Number`, `Boolean`) directly match the actual types used during execution, reducing type-related bugs that can occur with TypeScript primitives
2. **Simplified Tooling** - No need for transpilation or build steps, resulting in:
   - Faster development cycles
   - Direct debugging without source maps
   - Smaller project setup
3. **Better IDE Integration** - Modern IDEs fully support JSDoc type checking while maintaining pure JavaScript:
   - Full IntelliSense support
   - Type checking without compilation
   - Native code navigation
4. **Gradual Type Adoption** - Teams can:
   - Add types progressively
   - Choose type granularity per module
   - Maintain JavaScript flexibility where needed
5. **Clean Runtime Code** - Type information stays in comments:
   - No type syntax in runtime code
   - Smaller bundle sizes
   - No risk of type definitions affecting runtime behavior
6. **Standards Compliance** - Follows JavaScript standards:
   - ECMAScript compatibility
   - No proprietary syntax
   - Future-proof code base
7. **Universal Module Compatibility** - Source code can be used in various project types:
   - Direct import in JavaScript projects
   - Type-safe usage in TypeScript projects
   - No transpilation needed for either case
   - Seamless integration with both ecosystems
   - Perfect for creating shared libraries and modules

## Core Principles

1. **JavaScript with JSDoc** - All source code is written in JavaScript with JSDoc comments for type definitions
2. **TypeScript Declaration Files** - Complex types are declared in separate `.d.ts` files
3. **Global Types** - Global project types are defined in `.d.ts` files with proper namespaces
4. **No External Library Types** - We do not create type definitions for external libraries

## JavaScript Runtime Types

We exclusively use JavaScript runtime types in our JSDoc declarations instead of TypeScript primitives:

| JavaScript Runtime Type | Instead of TS Primitive | Example Usage |
|------------------------|-------------------------|---------------|
| `String` | `string` | `@param {String} name` |
| `Number` | `number` | `@param {Number} count` |
| `Boolean` | `boolean` | `@param {Boolean} isActive` |
| `Object<string, String>` | `object` | `@param {Object<string, String>} data` |
| `Array` | `array` | `@param {Array<String>} items` |
| `Function` | `function` | `@param {Function} callback` |

## Object Type Definitions

Always use detailed object declarations with specific key-value type pairs:

```javascript
/**
 * @param {Object<string, String>} settings - User settings object
 */
function updateSettings(settings) {
  // Implementation
}
```

## Complex Type Definitions

For complex types, use either `@typedef` in JSDoc or separate `.d.ts` files:

### In JavaScript Files (JSDoc):
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

### In .d.ts Files:
```typescript
declare namespace App {
  interface User {
    id: String;
    name: String;
    age: Number;
    isActive: Boolean;
  }
}
```

## TypeScript Configuration

The `tsconfig.json` is configured to check JavaScript files without emitting:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "noEmit": true,
    "checkJs": true
  }
}
```

## Type Organization Guidelines

1. Use standard TypeScript utility types when needed (e.g., `Partial<>`, `Record<>`)
2. Place complex type structures in dedicated `.d.ts` files
3. Use proper namespacing for global types
4. Keep module-specific types in their respective directories
5. Maintain clear separation between runtime code and type declarations

## Running Type Checks

Run type checking with:

```bash
npx tsc --noEmit
```

This will validate all type definitions without generating output files. 