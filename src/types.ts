/**
 * JSONPath query options
 */
export interface JSONPathOptions {
  /** The JSON object to query */
  json?: unknown;
  /** The JSONPath expression */
  path?: string;
  /** Maximum number of results to return (default: unlimited) */
  resultType?: 'value' | 'path' | 'all';
  /** Wrap results in an array (default: true) */
  wrap?: boolean;
  /** Custom callback for filtering/transforming results */
  callback?: (value: unknown, type: string, payload: unknown) => unknown;
  /** User data passed to callback */
  otherTypeCallback?: (value: unknown, path: string, parent: unknown, parentProperty: string | number) => boolean;
}

/**
 * Result of a JSONPath query with both path and value
 */
export interface JSONPathResult {
  path: (string | number)[];
  value: unknown;
}
