import assert from 'assert';
import { query, value, paths, nodes, parse } from './index.js';

// Test data
const testData = {
  store: {
    book: [
      { category: 'reference', author: 'Nigel Rees', title: 'Sayings of the Century', price: 8.95 },
      { category: 'fiction', author: 'Evelyn Waugh', title: 'Sword of Honour', price: 12.99 },
      { category: 'fiction', author: 'Herman Melville', title: 'Moby Dick', isbn: '0-553-21311-3', price: 8.99 },
      { category: 'fiction', author: 'J. R. R. Tolkien', title: 'The Lord of the Rings', isbn: '0-395-19395-8', price: 22.99 }
    ],
    bicycle: { color: 'red', price: 19.95 }
  }
};

console.log('=== JSONPath Modern Tests ===\n');

// Test 1: Basic property access
console.log('Test 1: $.store.bicycle.color');
const result1 = value(testData, '$.store.bicycle.color');
assert.strictEqual(result1, 'red', 'Should get bicycle color');
console.log('✓ Passed\n');

// Test 2: Array wildcard
console.log('Test 2: $.store.book[*].author');
const result2 = query(testData, '$.store.book[*].author');
assert.deepStrictEqual(result2, [
  'Nigel Rees',
  'Evelyn Waugh',
  'Herman Melville',
  'J. R. R. Tolkien'
], 'Should get all authors');
console.log('✓ Passed\n');

// Test 3: Array index
console.log('Test 3: $.store.book[0].title');
const result3 = value(testData, '$.store.book[0].title');
assert.strictEqual(result3, 'Sayings of the Century', 'Should get first book title');
console.log('✓ Passed\n');

// Test 4: Recursive descent
console.log('Test 4: $..price');
const result4 = query(testData, '$..price');
assert.deepStrictEqual(result4, [8.95, 12.99, 8.99, 22.99, 19.95], 'Should get all prices');
console.log('✓ Passed\n');

// Test 5: Array slice
console.log('Test 5: $.store.book[0:2].title');
const result5 = query(testData, '$.store.book[0:2].title');
assert.deepStrictEqual(result5, ['Sayings of the Century', 'Sword of Honour'], 'Should get first two book titles');
console.log('✓ Passed\n');

// Test 6: Union
console.log('Test 6: $.store.book[0,2].title');
const result6 = query(testData, '$.store.book[0,2].title');
assert.deepStrictEqual(result6, ['Sayings of the Century', 'Moby Dick'], 'Should get first and third book titles');
console.log('✓ Passed\n');

// Test 7: Filter expression
console.log('Test 7: $.store.book[?(@.price < 10)].title');
const result7 = query(testData, '$.store.book[?(@.price < 10)].title');
assert.deepStrictEqual(result7, ['Sayings of the Century', 'Moby Dick'], 'Should get books with price < 10');
console.log('✓ Passed\n');

// Test 8: Paths
console.log('Test 8: paths for $.store.book[*].author');
const result8 = paths(testData, '$.store.book[*].author');
assert.deepStrictEqual(result8, [
  ['store', 'book', 0, 'author'],
  ['store', 'book', 1, 'author'],
  ['store', 'book', 2, 'author'],
  ['store', 'book', 3, 'author']
], 'Should get paths to all authors');
console.log('✓ Passed\n');

// Test 9: Nodes
console.log('Test 9: nodes for $.store.bicycle');
const result9 = nodes(testData, '$.store.bicycle');
assert.strictEqual(result9.length, 1, 'Should have one node');
assert.deepStrictEqual(result9[0].path, ['store', 'bicycle'], 'Should have correct path');
assert.deepStrictEqual(result9[0].value, { color: 'red', price: 19.95 }, 'Should have correct value');
console.log('✓ Passed\n');

// Test 10: Parse
console.log('Test 10: parse("$.store.book[*].author")');
const result10 = parse('$.store.book[*].author');
assert.strictEqual(Array.isArray(result10), true, 'Should return token array');
assert.strictEqual(result10.length, 6, 'Should have 6 tokens');
assert.strictEqual(result10[0].type, 'root', 'First token should be root');
console.log('✓ Passed\n');

// Test 11: Last element
console.log('Test 11: $.store.book[-1].author');
const result11 = value(testData, '$.store.book[-1].author');
assert.strictEqual(result11, 'J. R. R. Tolkien', 'Should get last book author');
console.log('✓ Passed\n');

// Test 12: All elements with wildcard
console.log('Test 12: $.store.*');
const result12 = query(testData, '$.store.*');
assert.strictEqual(result12.length, 2, 'Should get 2 items (book array and bicycle)');
assert.strictEqual(Array.isArray(result12[0]), true, 'First item should be book array');
assert.strictEqual(typeof result12[1], 'object', 'Second item should be bicycle object');
console.log('✓ Passed\n');

// Test 13: Recursive descent with property
console.log('Test 13: $..author');
const result13 = query(testData, '$..author');
assert.deepStrictEqual(result13, [
  'Nigel Rees',
  'Evelyn Waugh',
  'Herman Melville',
  'J. R. R. Tolkien'
], 'Should get all authors recursively');
console.log('✓ Passed\n');

// Test 14: Empty result
console.log('Test 14: $.nonexistent');
const result14 = query(testData, '$.nonexistent');
assert.deepStrictEqual(result14, [], 'Should return empty array for nonexistent path');
console.log('✓ Passed\n');

// Test 15: value() returns undefined for nonexistent
console.log('Test 15: value() for nonexistent path');
const result15 = value(testData, '$.nonexistent');
assert.strictEqual(result15, undefined, 'Should return undefined for nonexistent path');
console.log('✓ Passed\n');

// Test 16: Nested property access
console.log('Test 16: $.store.book[0].category');
const result16 = value(testData, '$.store.book[0].category');
assert.strictEqual(result16, 'reference', 'Should get book category');
console.log('✓ Passed\n');

// Test 17: Filter with equality
console.log('Test 17: $.store.book[?(@.category == "fiction")].author');
const result17 = query(testData, '$.store.book[?(@.category == "fiction")].author');
assert.strictEqual(result17.length, 3, 'Should get 3 fiction authors');
assert.ok(result17.includes('Evelyn Waugh'), 'Should include Evelyn Waugh');
console.log('✓ Passed\n');

// Test 18: Prototype pollution protection
console.log('Test 18: Prototype pollution protection');
const maliciousData = {
  normal: 'value',
  '__proto__': { polluted: 'bad' },
  'constructor': { polluted: 'bad' },
  'prototype': { polluted: 'bad' }
};

// Test that accessing __proto__ doesn't pollute Object prototype
const result18a = query(maliciousData, '$.__proto__');
const testObj18a = {};
assert.strictEqual((testObj18a as any).polluted, undefined, 'Object prototype should not be polluted via __proto__');

// Test that accessing constructor doesn't pollute
const result18b = query(maliciousData, '$.constructor');
const testObj18b = {};
assert.strictEqual((testObj18b as any).polluted, undefined, 'Object prototype should not be polluted via constructor');

// Test with bracket notation
// noinspection JSUnusedLocalSymbols
//@ts-ignore
const result18c = value(maliciousData, "$['__proto__']");
const testObj18c = {};
assert.strictEqual((testObj18c as any).polluted, undefined, 'Object prototype should not be polluted via bracket notation');

// Verify the library can still read these properties as regular data
assert.strictEqual(typeof result18a[0], 'object', 'Should be able to read __proto__ as regular property');
assert.strictEqual(typeof result18b[0], 'object', 'Should be able to read constructor as regular property');

console.log('✓ Passed\n');

console.log('=== All Tests Passed ✓ ===');
