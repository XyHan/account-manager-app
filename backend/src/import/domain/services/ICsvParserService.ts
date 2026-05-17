export interface ParsedTransaction {
  date: Date;
  amount: number;
  label: string;
}

export const CSV_PARSER_SERVICE = 'ICsvParserService';

export interface ICsvParserService {
  parse(content: string): ParsedTransaction[];
}
