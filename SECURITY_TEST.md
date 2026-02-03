# Prototype Pollution Test - Security

## Test Added: Test 18

A comprehensive prototype pollution test has been added to ensure the JSONPath library doesn't inadvertently pollute JavaScript's Object prototype through malicious property access.

## What is Prototype Pollution?

Prototype pollution is a security vulnerability in JavaScript where attackers can inject properties into Object.prototype, affecting all objects in the application. This typically happens when:

1. User input is used to set object properties without validation
2. Special property names like `__proto__`, `constructor`, or `prototype` are accessed
3. The code doesn't properly sanitize object keys

## Test Coverage

The test checks three attack vectors:

### 1. Direct `__proto__` Access
```typescript
query(maliciousData, '$.__proto__')
```
Ensures that accessing `__proto__` as a regular property doesn't pollute the Object prototype.

### 2. Constructor Access
```typescript
query(maliciousData, '$.constructor')
```
Verifies that accessing `constructor` doesn't allow prototype pollution.

### 3. Bracket Notation with `__proto__`
```typescript
value(maliciousData, "$['__proto__']")
```
Tests bracket notation to ensure it's also safe from pollution attacks.

## Test Validation

After each query operation, the test:
1. Creates a new empty object: `const testObj = {}`
2. Checks that the object doesn't have polluted properties: `testObj.polluted === undefined`
3. Verifies the library can still read these properties as regular data

## Current Implementation Status

The JSONPath library is **safe from prototype pollution** because:

1. **Property Access Pattern**: The evaluator uses `obj[key]` syntax which reads properties without assignment
2. **No Dynamic Property Setting**: The library only reads data, it never writes to objects
3. **Read-Only Operations**: All operations (query, value, paths, nodes) are read-only

## Test Data

```typescript
const maliciousData = {
  normal: 'value',
  '__proto__': { polluted: 'bad' },
  'constructor': { polluted: 'bad' },
  'prototype': { polluted: 'bad' }
};
```

This data structure contains properties with dangerous names, but they're stored as regular string keys in the object, not as actual prototype references.

## Expected Behavior

✅ **Safe**: The library reads these as regular properties  
✅ **No Pollution**: Object.prototype remains unpolluted  
✅ **Normal Operation**: The library can still access and return these values  

## Why This Test Matters

Even though the current implementation is safe (read-only operations), this test:

1. **Documents Security**: Makes security expectations explicit
2. **Prevents Regressions**: Future changes won't accidentally introduce vulnerabilities
3. **Builds Trust**: Shows security was considered in the design
4. **Follows Best Practices**: Security testing is standard for libraries handling user data

## Running the Test

```bash
npm test
```

The test will output:
```
Test 18: Prototype pollution protection
✓ Passed
```

If the test fails, it means the library has a prototype pollution vulnerability that must be fixed before use in production.

## Related Resources

- [OWASP: Prototype Pollution](https://owasp.org/www-community/vulnerabilities/Prototype_Pollution)
- [Prototype Pollution Attack in NodeJS](https://github.com/HoLyVieR/prototype-pollution-nsec18)
- [Snyk: Prototype Pollution Protection](https://snyk.io/blog/after-three-years-of-silence-a-new-jquery-prototype-pollution-vulnerability-emerges-once-again/)
