import { describe, it, expect } from 'vitest';
import { sanitizeCsvCell, generateCsvString } from './csvExport';

describe('CSV Sanitization & RFC 4180 Formula Injection Mitigation', () => {
  it('escapes standard values without formulas or delimiters', () => {
    expect(sanitizeCsvCell('John Doe')).toBe('John Doe');
    expect(sanitizeCsvCell(123)).toBe('123');
    expect(sanitizeCsvCell(true)).toBe('true');
    expect(sanitizeCsvCell(null)).toBe('');
    expect(sanitizeCsvCell(undefined)).toBe('');
  });

  it('escapes cells containing commas, quotes, and newlines according to RFC 4180', () => {
    expect(sanitizeCsvCell('Hello, World')).toBe('"Hello, World"');
    expect(sanitizeCsvCell('Say "Hello"')).toBe('"Say ""Hello"""');
    expect(sanitizeCsvCell('Line1\nLine2')).toBe('"Line1\nLine2"');
  });

  it('neutralizes CSV formula injection starting with =, +, -, @, tab, or carriage return', () => {
    expect(sanitizeCsvCell('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
    expect(sanitizeCsvCell('+cmd|"/C calc"!A0')).toBe('"\'+\\cmd|""/C calc""!A0"'.replace('\\', ''));
    expect(sanitizeCsvCell('+cmd|calc!A0')).toBe("'+cmd|calc!A0");
    expect(sanitizeCsvCell('-12+34')).toBe("'-12+34");
    expect(sanitizeCsvCell('@IMPORTXML("url")')).toBe('"\'@IMPORTXML(""url"")"');
    expect(sanitizeCsvCell('\tmalicious')).toBe("'\tmalicious");
    expect(sanitizeCsvCell('\rmalicious')).toBe('"\'\rmalicious"');
  });

  it('generates multi-row CSV with CRLF delimiters and sanitized headers & content', () => {
    const headers = ['Name', 'FormulaPayload', 'City'];
    const rows = [
      ['Alice', '=1+1', 'Hyderabad, India'],
      ['Bob', '@alert', 'Bengaluru'],
    ];

    const result = generateCsvString(headers, rows);
    const lines = result.split('\r\n');

    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('Name,FormulaPayload,City');
    expect(lines[1]).toBe('Alice,\'=1+1,"Hyderabad, India"');
    expect(lines[2]).toBe('Bob,\'@alert,Bengaluru');
  });
});
