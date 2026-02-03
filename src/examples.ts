// Example usage of jsonpath-rewritten
import { query, value, paths, nodes } from './index.js';

// Sample data structure
const store = {
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

// Example 1: Get all book authors
const authors = query(store, '$.store.book[*].author');
// Result: ['Nigel Rees', 'Evelyn Waugh', 'Herman Melville', 'J. R. R. Tolkien']

// Example 2: Get the first book's title
const firstTitle = value(store, '$.store.book[0].title');
// Result: 'Sayings of the Century'

// Example 3: Get all prices (recursive descent)
const allPrices = query(store, '$..price');
// Result: [8.95, 12.99, 8.99, 22.99, 19.95]

// Example 4: Filter books by price
const cheapBooks = query(store, '$.store.book[?(@.price < 10)]');
// Result: Books with price less than 10

// Example 5: Get paths to all authors
const authorPaths = paths(store, '$.store.book[*].author');
// Result: [['store', 'book', 0, 'author'], ['store', 'book', 1, 'author'], ...]

// Example 6: Get nodes (path + value pairs)
const bookNodes = nodes(store, '$.store.book[*]');
// Result: [{path: ['store', 'book', 0], value: {...}}, ...]

// Example 7: Array slicing
export const firstTwoTitles = query(store, '$.store.book[0:2].title');
// Result: First two book titles

// Example 8: Union (multiple indices)
export const selectedTitles = query(store, '$.store.book[0,2].title');
// Result: Titles at index 0 and 2

// Example 9: Wildcard
export const allStoreItems = query(store, '$.store.*');
// Result: The book array and bicycle object

// Example 10: Recursive descent with property
export const allAuthors = query(store, '$..author');
// Result: All authors in the data structure

export { authors, firstTitle, allPrices, cheapBooks, authorPaths, bookNodes };
