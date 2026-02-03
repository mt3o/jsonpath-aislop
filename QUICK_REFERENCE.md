# JSONPath Quick Reference

## Common Patterns

### Access Operators

```typescript
// Root
$

// Child property
$.store
$.store.book

// All children
$.*
$.store.*

// Recursive descent (all descendants)
$..price
$..book
```

### Array Operations

```typescript
// All array elements
$.store.book[*]

// Specific index
$.store.book[0]
$.store.book[1]

// Negative index (from end)
$.store.book[-1]  // last element
$.store.book[-2]  // second to last

// Slice notation [start:end:step]
$.store.book[0:2]    // first two books
$.store.book[::2]    // every other book
$.store.book[1:]     // all but first
$.store.book[:3]     // first three

// Multiple indices (union)
$.store.book[0,2,5]
```

### Filters

```typescript
// Compare property value
$.store.book[?(@.price < 10)]
$.store.book[?(@.category == 'fiction')]

// Check property existence
$.store.book[?(@.isbn)]

// Array length
$.store.book[?(@.length > 0)]
```

## API Quick Reference

```typescript
import { query, value, paths, nodes } from 'jsonpath-rewritten';

// Get all matching values (returns array)
query(obj, '$.store.book[*].title')

// Get first match only (returns single value or undefined)
value(obj, '$.store.book[0].title')

// Get paths to matches (returns array of path arrays)
paths(obj, '$.store.book[*].author')

// Get both paths and values (returns array of {path, value} objects)
nodes(obj, '$.store.book[*]')
```

## Examples by Use Case

### Find All Items

```typescript
// All books
query(data, '$.store.book[*]')

// All authors
query(data, '$.store.book[*].author')

// All prices anywhere in the document
query(data, '$..price')
```

### Filter and Search

```typescript
// Books cheaper than $10
query(data, '$.store.book[?(@.price < 10)]')

// Books with ISBN
query(data, '$.store.book[?(@.isbn)]')

// Fiction books
query(data, '$.store.book[?(@.category == "fiction")]')
```

### Select Specific Items

```typescript
// First book
value(data, '$.store.book[0]')

// Last book
value(data, '$.store.book[-1]')

// First and third book
query(data, '$.store.book[0,2]')

// First two books
query(data, '$.store.book[0:2]')
```

### Get Structure Information

```typescript
// Get paths to all books
paths(data, '$.store.book[*]')
// Result: [['store', 'book', 0], ['store', 'book', 1], ...]

// Get complete information (paths + values)
nodes(data, '$.store.book[*].title')
// Result: [{path: ['store', 'book', 0, 'title'], value: '...'}, ...]
```

## Performance Tips

1. **Prefer specific paths over recursive descent**: `$.store.book` is faster than `$..book`
2. **Use `value()` when you only need the first match**: Stops after finding one result
3. **Limit results with the `count` parameter**: `query(obj, path, 10)` stops after 10 matches
4. **Avoid complex filter expressions**: Simple comparisons are more reliable

## Limitations

- Filter expressions support basic comparisons (property access, numeric/string literals)
- Script expressions in brackets are limited to simple property access
- Regular expression matching in filters is not supported
- Very deep recursion may impact performance on large objects
