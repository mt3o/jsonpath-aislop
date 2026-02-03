# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-03

### Added
- Initial release of jsonpath-rewritten
- Full TypeScript rewrite of the jsonpath library
- Support for standard JSONPath syntax:
  - Root operator (`$`)
  - Dot notation (`.property`)
  - Bracket notation (`['property']`)
  - Wildcard (`*`)
  - Recursive descent (`..`)
  - Array indices (`[0]`, `[-1]`)
  - Array slices (`[start:end:step]`)
  - Union operator (`[0,1,2]`)
  - Filter expressions (`[?(@.price < 10)]`)
- Multiple query methods:
  - `query()` - Get matching values
  - `value()` - Get first matching value
  - `paths()` - Get paths to matches
  - `nodes()` - Get both paths and values
  - `parse()` - Parse expressions into tokens
- Zero dependencies
- Full type safety with TypeScript
- Comprehensive documentation and examples
