import type { Token } from './parser.js';
import type { JSONPathResult } from './types.js';

/**
 * Evaluate JSONPath tokens against a JSON object
 */
export function evaluate(tokens: Token[], obj: unknown): JSONPathResult[] {
  let results: JSONPathResult[] = [{ path: [], value: obj }];

  for (const token of tokens) {
    results = processToken(token, results);
  }

  return results;
}

function processToken(token: Token, currentResults: JSONPathResult[]): JSONPathResult[] {
  const nextResults: JSONPathResult[] = [];

  for (const result of currentResults) {
    const newResults = applyToken(token, result);
    nextResults.push(...newResults);
  }

  return nextResults;
}

function applyToken(token: Token, result: JSONPathResult): JSONPathResult[] {
  const { value, path } = result;

  switch (token.type) {
    case 'root':
      return [result];

    case 'dot':
      return [result];

    case 'dotdot':
      // Recursive descent - get all descendants
      return getAllDescendants(value, path);

    case 'star':
      // Wildcard - all children
      return getAllChildren(value, path);

    case 'identifier':
      // Property access
      if (value !== null && typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        if (token.value in obj) {
          return [{ path: [...path, token.value], value: obj[token.value] }];
        }
      }
      return [];

    case 'index':
      // Array index
      if (Array.isArray(value)) {
        const index = token.value < 0 ? value.length + token.value : token.value;
        if (index >= 0 && index < value.length) {
          return [{ path: [...path, index], value: value[index] }];
        }
      }
      return [];

    case 'slice':
      // Array slice
      if (Array.isArray(value)) {
        return applySlice(value, path, token.start, token.end, token.step);
      }
      return [];

    case 'union':
      // Multiple properties or indices
      const unionResults: JSONPathResult[] = [];
      for (const val of token.values) {
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
          // Numeric index
          if (Array.isArray(value)) {
            const index = num < 0 ? value.length + num : num;
            if (index >= 0 && index < value.length) {
              unionResults.push({ path: [...path, index], value: value[index] });
            }
          }
        } else {
          // Property name
          if (value !== null && typeof value === 'object') {
            const obj = value as Record<string, unknown>;
            if (val in obj) {
              unionResults.push({ path: [...path, val], value: obj[val] });
            }
          }
        }
      }
      return unionResults;

    case 'filter':
      // Filter expression
      return applyFilter(value, path, token.value);

    case 'script':
      // Script expression - simplified evaluation
      return [result];

    default:
      return [result];
  }
}

function getAllChildren(value: unknown, basePath: (string | number)[]): JSONPathResult[] {
  const results: JSONPathResult[] = [];

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      results.push({ path: [...basePath, i], value: value[i] });
    }
  } else if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        results.push({ path: [...basePath, key], value: obj[key] });
      }
    }
  }

  return results;
}

function getAllDescendants(value: unknown, basePath: (string | number)[]): JSONPathResult[] {
  const results: JSONPathResult[] = [];
  const queue: JSONPathResult[] = [{ path: basePath, value }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    results.push(current);

    const children = getAllChildren(current.value, current.path);
    queue.push(...children);
  }

  return results;
}

function applySlice(
  arr: unknown[],
  basePath: (string | number)[],
  start?: number,
  end?: number,
  step?: number
): JSONPathResult[] {
  const length = arr.length;
  const actualStep = step ?? 1;

  if (actualStep === 0) {
    return [];
  }

  let actualStart = start ?? (actualStep > 0 ? 0 : length - 1);
  let actualEnd = end ?? (actualStep > 0 ? length : -length - 1);

  // Handle negative indices
  if (actualStart < 0) actualStart = Math.max(0, length + actualStart);
  if (actualEnd < 0) actualEnd = length + actualEnd;

  // Clamp to array bounds
  actualStart = Math.max(0, Math.min(actualStart, length));
  actualEnd = Math.max(-1, Math.min(actualEnd, length));

  const results: JSONPathResult[] = [];

  if (actualStep > 0) {
    for (let i = actualStart; i < actualEnd; i += actualStep) {
      results.push({ path: [...basePath, i], value: arr[i] });
    }
  } else {
    for (let i = actualStart; i > actualEnd; i += actualStep) {
      results.push({ path: [...basePath, i], value: arr[i] });
    }
  }

  return results;
}

function applyFilter(value: unknown, basePath: (string | number)[], filterExpr: string): JSONPathResult[] {
  const results: JSONPathResult[] = [];

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      if (evaluateFilterExpression(filterExpr, item)) {
        results.push({ path: [...basePath, i], value: item });
      }
    }
  } else if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (evaluateFilterExpression(filterExpr, obj[key])) {
          results.push({ path: [...basePath, key], value: obj[key] });
        }
      }
    }
  }

  return results;
}

function evaluateFilterExpression(expr: string, item: unknown): boolean {
  try {
    // Simple filter expression evaluation
    // Replace @ with the current item

    // Handle common patterns like @.property, @['property'], @.length
    let jsExpr = expr.trim();

    // Simple property access: @.price < 10
    const propertyMatch = jsExpr.match(/@\.(\w+)/g);
    if (propertyMatch && item !== null && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      for (const match of propertyMatch) {
        const prop = match.slice(2); // Remove @.
        const val = obj[prop];
        jsExpr = jsExpr.replace(match, JSON.stringify(val));
      }
    }

    // Handle @.length for arrays
    if (jsExpr.includes('@.length') && Array.isArray(item)) {
      jsExpr = jsExpr.replace(/@\.length/g, String(item.length));
    }

    // Handle @ by itself (reference to current item)
    if (jsExpr === '@') {
      return Boolean(item);
    }

    // Evaluate the expression safely
    // This is a naive approach - in production, use a proper expression parser
    // eslint-disable-next-line no-new-func
    const fn = new Function('return ' + jsExpr);
    return Boolean(fn());
  } catch {
    return false;
  }
}
