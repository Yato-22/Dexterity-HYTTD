// ============================================================================
// JUDGE OUTPUT COMPARISON UTILITIES
// ============================================================================

/**
 * Normalizes output string by trimming trailing line whitespace and CRLF/LF line endings.
 */
export function normalizeOutput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Compares actual output with expected output after normalization.
 */
export function compareOutputs(actual, expected) {
  return normalizeOutput(actual) === normalizeOutput(expected);
}
