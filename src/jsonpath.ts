import { tokenize } from './parser.js';
import { evaluate } from './evaluator.js';
import type { JSONPathOptions, JSONPathResult } from './types.js';

/**
 * Parse a JSONPath expression into tokens (for debugging/inspection)
 */
export function parse(path: string) {
  return tokenize(path);
}

/**
 * Query a JSON object using JSONPath
 * Returns an array of matching values
 */
export function query(obj: unknown, path: string, count?: number): unknown[] {
  const tokens = tokenize(path);
  const results = evaluate(tokens, obj);

  let values = results.map(r => r.value);

  if (count !== undefined && count > 0) {
    values = values.slice(0, count);
  }

  return values;
}

/**
 * Get the first matching value from a JSONPath query
 * Returns undefined if no match found
 */
export function value(obj: unknown, path: string): unknown {
  const results = query(obj, path, 1);
  return results.length > 0 ? results[0] : undefined;
}

/**
 * Query a JSON object and return paths to matching values
 * Returns an array of paths (each path is an array of keys/indices)
 */
export function paths(obj: unknown, path: string, count?: number): (string | number)[][] {
  const tokens = tokenize(path);
  const results = evaluate(tokens, obj);

  let resultPaths = results.map(r => r.path);

  if (count !== undefined && count > 0) {
    resultPaths = resultPaths.slice(0, count);
  }

  return resultPaths;
}

/**
 * Query a JSON object and return both paths and values
 * Returns an array of {path, value} objects
 */
export function nodes(obj: unknown, path: string, count?: number): JSONPathResult[] {
  const tokens = tokenize(path);
  const results = evaluate(tokens, obj);

  if (count !== undefined && count > 0) {
    return results.slice(0, count);
  }

  return results;
}

/**
 * Main JSONPath query function with options (compatible with original library)
 */
export function jsonpath(options: JSONPathOptions): unknown[] | undefined {
  if (!options.path || options.json === undefined) {
    return undefined;
  }

  const obj = options.json;
  const path = options.path;
  const resultType = options.resultType || 'value';
  const wrap = options.wrap !== false;

  const tokens = tokenize(path);
  const results = evaluate(tokens, obj);

  let output: unknown[] | undefined;

  switch (resultType) {
    case 'value':
      output = results.map(r => r.value);
      break;
    case 'path':
      output = results.map(r => toPathString(r.path));
      break;
    case 'all':
      output = results.map(r => ({ path: toPathString(r.path), value: r.value }));
      break;
    default:
      output = results.map(r => r.value);
  }

  // Apply callback if provided
  if (options.callback) {
    output = output.map(val => options.callback!(val, resultType, options.json));
  }

  if (!wrap && output.length === 1) {
    return output[0] as unknown[];
  }

  return output;
}

function toPathString(path: (string | number)[]): string {
  let result = '$';
  for (const segment of path) {
    if (typeof segment === 'number') {
      result += `[${segment}]`;
    } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(segment)) {
      result += `.${segment}`;
    } else {
      result += `['${segment}']`;
    }
  }
  return result;
}
