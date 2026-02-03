/**
 * Token types for JSONPath expressions
 */
export type Token =
  | { type: 'root' }
  | { type: 'dot' }
  | { type: 'dotdot' }
  | { type: 'star' }
  | { type: 'identifier'; value: string }
  | { type: 'bracket'; value: string }
  | { type: 'filter'; value: string }
  | { type: 'script'; value: string }
  | { type: 'union'; values: string[] }
  | { type: 'slice'; start?: number; end?: number; step?: number }
  | { type: 'index'; value: number };

/**
 * Parse a JSONPath expression into tokens
 */
export function tokenize(path: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < path.length) {
    const char = path[i];

    // Root $
    if (char === '$') {
      tokens.push({ type: 'root' });
      i++;
      continue;
    }

    // Current node @
    if (char === '@') {
      i++;
      continue;
    }

    // Dot notation
    if (char === '.') {
      if (path[i + 1] === '.') {
        tokens.push({ type: 'dotdot' });
        i += 2;
      } else {
        tokens.push({ type: 'dot' });
        i++;
      }
      continue;
    }

    // Bracket notation
    if (char === '[') {
      const end = findClosingBracket(path, i);
      const content = path.slice(i + 1, end);

      // Parse bracket content
      const bracketToken = parseBracketContent(content);
      tokens.push(bracketToken);

      i = end + 1;
      continue;
    }

    // Identifier (after dot or at start after $)
    if (/[a-zA-Z_$]/.test(char)) {
      let identifier = '';
      while (i < path.length && /[a-zA-Z0-9_$]/.test(path[i])) {
        identifier += path[i];
        i++;
      }
      tokens.push({ type: 'identifier', value: identifier });
      continue;
    }

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Unknown character - skip
    i++;
  }

  return tokens;
}

function findClosingBracket(str: string, start: number): number {
  let depth = 1;
  let inString = false;
  let stringChar = '';

  for (let i = start + 1; i < str.length; i++) {
    const char = str[i];

    if (inString) {
      if (char === stringChar && str[i - 1] !== '\\') {
        inString = false;
      }
    } else {
      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
      } else if (char === '[') {
        depth++;
      } else if (char === ']') {
        depth--;
        if (depth === 0) {
          return i;
        }
      }
    }
  }

  return str.length;
}

function parseBracketContent(content: string): Token {
  const trimmed = content.trim();

  // Empty brackets or wildcard
  if (trimmed === '' || trimmed === '*') {
    return { type: 'star' };
  }

  // Filter expression: ?(@.price < 10)
  if (trimmed.startsWith('?(')) {
    return { type: 'filter', value: trimmed.slice(2, -1) };
  }

  // Script expression: (@.length - 1)
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return { type: 'script', value: trimmed.slice(1, -1) };
  }

  // Union: [0,2,5] or ['name','age']
  if (trimmed.includes(',')) {
    const values = trimmed.split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
    return { type: 'union', values };
  }

  // Slice: [start:end:step]
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    const start = parts[0] ? parseInt(parts[0], 10) : undefined;
    const end = parts[1] ? parseInt(parts[1], 10) : undefined;
    const step = parts[2] ? parseInt(parts[2], 10) : undefined;
    const sliceToken: Token = { type: 'slice' };
    if (start !== undefined) sliceToken.start = start;
    if (end !== undefined) sliceToken.end = end;
    if (step !== undefined) sliceToken.step = step;
    return sliceToken;
  }

  // String key
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return { type: 'identifier', value: trimmed.slice(1, -1) };
  }

  // Numeric index
  const num = parseInt(trimmed, 10);
  if (!isNaN(num)) {
    return { type: 'index', value: num };
  }

  // Default to identifier
  return { type: 'identifier', value: trimmed };
}
