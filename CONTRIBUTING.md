# Contributing to jsonpath-rewritten

Thank you for your interest in contributing!

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`

## Project Structure

```
src/
├── index.ts          # Main exports    
├── types.ts          # TypeScript type definitions
├── parser.ts         # JSONPath expression tokenizer
├── evaluator.ts      # Token evaluation logic
├── jsonpath.ts       # Main API functions
└── examples.ts       # Usage examples
```

## Architecture

The library follows a simple pipeline:

1. **Parse**: JSONPath string → Tokens (parser.ts)
2. **Evaluate**: Tokens + JSON object → Results (evaluator.ts)
3. **Format**: Results → User-requested format (jsonpath.ts)

## Code Style

- Use simple, naive implementations
- Avoid overly complicated TypeScript constructs
- Prefer clarity over cleverness
- Add comments for non-obvious logic
- Follow the existing code style

## Building

```bash
npm run build
```

This compiles TypeScript to JavaScript and generates type definitions in the `dist/` folder.

## Testing

The project uses Node.js's built-in `assert` module for testing:

```bash
npm test
```

Tests are located in `src/test.ts` and use `assert.strictEqual()` and `assert.deepStrictEqual()` for validations. When adding new features:

1. Add corresponding tests to `src/test.ts`
2. Use descriptive assertion messages
3. Test both success and edge cases
4. Run `npm test` to ensure all tests pass

## Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure the code builds without errors
5. Submit a pull request with a clear description

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
