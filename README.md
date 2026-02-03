# jsonpath-rewritten

AI slop rewrite of the [jsonpath](https://www.npmjs.com/package/jsonpath) library. I don't know why its features are not built-in into JavaScript. Or they are and I never checked? Regardless, this is ai-rewrite from scratch, so that we address the cve-2025-61140 prototype pollution vulnerability. 

## Features

- 📦 Zero dependencies
- 🎯 Simple and naive approach - easy to understand and maintain
- ✅ Supports standard JSONPath syntax
- 🔍 Multiple query methods for different use cases

## Installation

```bash
npm install jsonpath-rewritten
```

### Info

If you want only to query object by path, try this:

```
function query(obj, path) {
    parts = path.split(".");
    if (parts.length==1){
        return obj[parts[0]];
    }
    return query(obj[parts[0]], parts.slice(1).join("."));
}
```
So you won't have to use the full library or anything!

## Usage

### Basic Query

```typescript
import { query, value, paths, nodes } from 'jsonpath-rewritten';

const data = {
  store: {
    book: [
      { category: 'reference', author: 'Nigel Rees', title: 'Sayings of the Century', price: 8.95 },
      { category: 'fiction', author: 'Evelyn Waugh', title: 'Sword of Honour', price: 12.99 },
      { category: 'fiction', author: 'Herman Melville', title: 'Moby Dick', price: 8.99 },
      { category: 'fiction', author: 'J. R. R. Tolkien', title: 'The Lord of the Rings', price: 22.99 }
    ],
    bicycle: { color: 'red', price: 19.95 }
  }
};

// Get all book authors
const authors = query(data, '$.store.book[*].author');
// ['Nigel Rees', 'Evelyn Waugh', 'Herman Melville', 'J. R. R. Tolkien']

// Get the first book author
const firstAuthor = value(data, '$.store.book[0].author');
// 'Nigel Rees'

// Get all prices in the store
const prices = query(data, '$.store..price');
// [8.95, 12.99, 8.99, 22.99, 19.95]

// Get books cheaper than $10
const cheapBooks = query(data, '$.store.book[?(@.price < 10)]');
```

## API

### `query(obj, path, count?)`

Query a JSON object and return all matching values.

- **obj**: The JSON object to query
- **path**: The JSONPath expression
- **count**: Optional maximum number of results to return
- **Returns**: Array of matching values

```typescript
const values = query(data, '$.store.book[*].title');
```

### `value(obj, path)`

Get the first matching value from a JSONPath query.

- **obj**: The JSON object to query
- **path**: The JSONPath expression
- **Returns**: The first matching value, or `undefined` if no match

```typescript
const title = value(data, '$.store.book[0].title');
```

### `paths(obj, path, count?)`

Query a JSON object and return paths to matching values.

- **obj**: The JSON object to query
- **path**: The JSONPath expression
- **count**: Optional maximum number of results to return
- **Returns**: Array of paths (each path is an array of keys/indices)

```typescript
const bookPaths = paths(data, '$.store.book[*]');
// [['store', 'book', 0], ['store', 'book', 1], ...]
```

### `nodes(obj, path, count?)`

Query a JSON object and return both paths and values.

- **obj**: The JSON object to query
- **path**: The JSONPath expression
- **count**: Optional maximum number of results to return
- **Returns**: Array of `{path, value}` objects

```typescript
const bookNodes = nodes(data, '$.store.book[*]');
// [{ path: ['store', 'book', 0], value: {...} }, ...]
```

### `parse(path)`

Parse a JSONPath expression into tokens (for debugging/inspection).

- **path**: The JSONPath expression
- **Returns**: Array of tokens

```typescript
const tokens = parse('$.store.book[*].author');
```

## JSONPath Syntax

### Basic Operators

- `$` - Root object
- `@` - Current object (in filters)
- `.` - Child operator
- `..` - Recursive descent (search all descendants)
- `*` - Wildcard (all elements)
- `[]` - Subscript operator
- `[,]` - Union operator (combine multiple results)
- `[start:end:step]` - Array slice operator
- `?()` - Filter expression

### Examples

| JSONPath | Description |
|----------|-------------|
| `$.store.book[*].author` | All book authors |
| `$..author` | All authors (recursive) |
| `$.store.*` | All things in store |
| `$.store..price` | All prices in store |
| `$..book[2]` | Third book |
| `$..book[-1]` | Last book |
| `$..book[0,1]` | First two books |
| `$..book[:2]` | First two books (slice) |
| `$..book[?(@.price < 10)]` | Books cheaper than $10 |
| `$..book[?(@.category == 'fiction')]` | Fiction books |

## Implementation Details

This library uses a simple, naive approach:

1. **Parser** (`parser.ts`) - Tokenizes JSONPath expressions into a sequence of operations
2. **Evaluator** (`evaluator.ts`) - Applies each token/operation to the JSON object
3. **JSONPath** (`jsonpath.ts`) - Main API that combines parsing and evaluation

The implementation prioritizes:
- **Simplicity** - Easy to understand and maintain
- **Type safety** - Full TypeScript support
- **Zero dependencies** - No external packages needed
- **Correctness** - Handles standard JSONPath syntax

## Development

### Building

```bash
npm install
npm run build
```

### Testing

The library includes comprehensive tests using Node.js's built-in `assert` module:

```bash
npm test
```

This will compile the TypeScript code and run the test suite, which includes tests for:
- Basic property access
- Array operations (indexing, slicing, wildcards)
- Recursive descent
- Filter expressions
- Path and node queries
- Edge cases and error conditions

### Project Structure

```
src/
├── index.ts          # Main exports
├── types.ts          # TypeScript type definitions
├── parser.ts         # JSONPath expression tokenizer
├── evaluator.ts      # Token evaluation logic
├── jsonpath.ts       # Main API functions
└── test.ts           # Test suite
```

## Limitations

This is a naive implementation focused on simplicity. Some advanced features may not be fully supported:
- Complex filter expressions with multiple conditions
- Script expressions beyond basic property access
- Custom operators or extensions

For most common use cases, this implementation should work well.

## License

Unlicense
