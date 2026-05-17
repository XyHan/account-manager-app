import { PapaparseCSVParser } from './PapaparseCSVParser';

const parser = new PapaparseCSVParser();

describe('PapaparseCSVParser', () => {
  it('parses a semicolon-separated CSV with French column names', () => {
    const csv = `Date;Libellé;Montant
2024-01-15;Loyer janvier;-800.00
2024-01-20;Salaire;2500.50`;

    const result = parser.parse(csv);

    expect(result).toHaveLength(2);
    expect(result[0].date.toISOString().slice(0, 10)).toBe('2024-01-15');
    expect(result[0].amount).toBe(-800);
    expect(result[0].label).toBe('Loyer janvier');
    expect(result[1].amount).toBe(2500.5);
  });

  it('parses a comma-separated CSV with English column names', () => {
    const csv = `Date,Description,Amount
2024-02-01,Supermarket,-45.30
2024-02-05,Salary,3000.00`;

    const result = parser.parse(csv);

    expect(result).toHaveLength(2);
    expect(result[0].label).toBe('Supermarket');
    expect(result[0].amount).toBe(-45.3);
  });

  it('parses dates in dd/mm/yyyy format', () => {
    const csv = `Date;Libellé;Montant
15/01/2024;Courses;-50.00`;

    const result = parser.parse(csv);

    expect(result[0].date.toISOString().slice(0, 10)).toBe('2024-01-15');
  });

  it('skips rows with missing required fields', () => {
    const csv = `Date;Libellé;Montant
2024-01-15;;-800.00
2024-01-20;Salaire;2500.50`;

    const result = parser.parse(csv);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Salaire');
  });

  it('handles comma as decimal separator', () => {
    const csv = `Date;Libellé;Montant
2024-01-15;Loyer;-800,00`;

    const result = parser.parse(csv);

    expect(result[0].amount).toBe(-800);
  });

  it('throws BadRequestException when required columns are not found', () => {
    const csv = `foo;bar;baz
val1;val2;val3`;

    expect(() => parser.parse(csv)).toThrow('CSV columns not recognized');
  });
});
