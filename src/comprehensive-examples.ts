/**
 * Comprehensive examples for jsonpath-rewritten
 *
 * This file demonstrates all features of the library.
 * Run with: tsc && node dist/comprehensive-examples.js
 */

import { query, value, paths, nodes, parse, jsonpath } from './index.js';
import type { JSONPathOptions } from './index.js';

// Sample dataset - e-commerce store
const store = {
  store: {
    book: [
      {
        category: 'reference',
        author: 'Nigel Rees',
        title: 'Sayings of the Century',
        price: 8.95
      },
      {
        category: 'fiction',
        author: 'Evelyn Waugh',
        title: 'Sword of Honour',
        price: 12.99
      },
      {
        category: 'fiction',
        author: 'Herman Melville',
        title: 'Moby Dick',
        isbn: '0-553-21311-3',
        price: 8.99
      },
      {
        category: 'fiction',
        author: 'J. R. R. Tolkien',
        title: 'The Lord of the Rings',
        isbn: '0-395-19395-8',
        price: 22.99
      }
    ],
    bicycle: {
      color: 'red',
      price: 19.95
    }
  }
};

// ============================================================================
// BASIC QUERIES
// ============================================================================

// Get all book titles
export const allTitles = query(store, '$.store.book[*].title');
// ['Sayings of the Century', 'Sword of Honour', 'Moby Dick', 'The Lord of the Rings']

// Get first book's author
export const firstAuthor = value(store, '$.store.book[0].author');
// 'Nigel Rees'

// Get bicycle color
export const bikeColor = value(store, '$.store.bicycle.color');
// 'red'

// ============================================================================
// ARRAY OPERATIONS
// ============================================================================

// Get specific book by index
export const thirdBook = value(store, '$.store.book[2]');
// { category: 'fiction', author: 'Herman Melville', ... }

// Get last book (negative index)
export const lastBook = value(store, '$.store.book[-1]');
// { category: 'fiction', author: 'J. R. R. Tolkien', ... }

// Get first two books (slice)
export const firstTwoBooks = query(store, '$.store.book[0:2]');
// Array with first 2 books

// Get books at specific indices (union)
export const selectedBooks = query(store, '$.store.book[0,2]');
// Array with books at index 0 and 2

// ============================================================================
// RECURSIVE DESCENT
// ============================================================================

// Get all prices in the entire store
export const allPrices = query(store, '$..price');
// [8.95, 12.99, 8.99, 22.99, 19.95]

// Get all authors (anywhere in structure)
export const allAuthors = query(store, '$..author');
// ['Nigel Rees', 'Evelyn Waugh', 'Herman Melville', 'J. R. R. Tolkien']

// ============================================================================
// WILDCARDS
// ============================================================================

// Get all direct children of store
export const storeChildren = query(store, '$.store.*');
// [book array, bicycle object]

// Get all properties of all books
export const allBookProps = query(store, '$.store.book[*]');
// Array of all book objects

// ============================================================================
// FILTER EXPRESSIONS
// ============================================================================

// Books cheaper than $10
export const cheapBooks = query(store, '$.store.book[?(@.price < 10)]');
// Books with price < 10

// Fiction books
export const fictionBooks = query(store, '$.store.book[?(@.category == "fiction")]');
// All fiction category books

// Books with ISBN (property exists check)
export const booksWithIsbn = query(store, '$.store.book[?(@.isbn)]');
// Books that have an ISBN field

// ============================================================================
// PATHS AND NODES
// ============================================================================

// Get paths to all book titles
export const titlePaths = paths(store, '$.store.book[*].title');
// [
//   ['store', 'book', 0, 'title'],
//   ['store', 'book', 1, 'title'],
//   ...
// ]

// Get nodes (both path and value) for all authors
export const authorNodes = nodes(store, '$.store.book[*].author');
// [
//   { path: ['store', 'book', 0, 'author'], value: 'Nigel Rees' },
//   { path: ['store', 'book', 1, 'author'], value: 'Evelyn Waugh' },
//   ...
// ]

// ============================================================================
// PARSE FUNCTION (for debugging)
// ============================================================================

// Parse expression to see tokens
export const tokens = parse('$.store.book[*].author');
// Returns array of tokens representing the parsed expression

// ============================================================================
// OPTIONS-BASED API (compatible with original jsonpath library)
// ============================================================================

// Using the jsonpath() function with options
const options1: JSONPathOptions = {
  json: store,
  path: '$.store.book[*].title',
  resultType: 'value'
};
export const titlesViaOptions = jsonpath(options1);
// ['Sayings of the Century', 'Sword of Honour', ...]

// Get paths as strings
const options2: JSONPathOptions = {
  json: store,
  path: '$.store.book[*].author',
  resultType: 'path'
};
export const authorPathStrings = jsonpath(options2);
// ['$.store.book[0].author', '$.store.book[1].author', ...]

// Get both paths and values
const options3: JSONPathOptions = {
  json: store,
  path: '$.store.book[0]',
  resultType: 'all'
};
export const bookWithPath = jsonpath(options3);
// [{ path: '$.store.book[0]', value: {...} }]

// ============================================================================
// ADVANCED EXAMPLES
// ============================================================================

// Combine multiple operations
export const expensiveFictionTitles = query(
  store,
  '$.store.book[?(@.category == "fiction" && @.price > 10)].title'
);
// Note: Complex filter expressions may have limited support

// Get all leaf values (using recursive descent)
export const allLeafValues = query(store, '$..*');
// All values at any depth

// Limit results with count parameter
export const firstThreePrices = query(store, '$..price', 3);
// Only first 3 prices found

// ============================================================================
// USAGE PATTERNS
// ============================================================================

// Pattern 1: Check if a path exists
export function pathExists(obj: unknown, path: string): boolean {
  return value(obj, path) !== undefined;
}

// Pattern 2: Get with default value
export function getWithDefault(obj: unknown, path: string, defaultValue: unknown): unknown {
  const result = value(obj, path);
  return result !== undefined ? result : defaultValue;
}

// Pattern 3: Count matches
export function countMatches(obj: unknown, path: string): number {
  return query(obj, path).length;
}

// Pattern 4: Transform results
export function queryAndTransform<T>(
  obj: unknown,
  path: string,
  transform: (item: unknown) => T
): T[] {
  return query(obj, path).map(transform);
}

// Examples using patterns
export const bookCount = countMatches(store, '$.store.book[*]'); // 4
export const defaultPrice = getWithDefault(store, '$.store.car.price', 0); // 0
export const hasBooks = pathExists(store, '$.store.book'); // true
export const upperAuthors = queryAndTransform(
  store,
  '$.store.book[*].author',
  (author) => String(author).toUpperCase()
);
// ['NIGEL REES', 'EVELYN WAUGH', ...]
