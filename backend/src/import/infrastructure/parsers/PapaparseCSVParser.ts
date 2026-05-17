import { Injectable, BadRequestException } from '@nestjs/common';
import Papa from 'papaparse';
import type { ICsvParserService, ParsedTransaction } from '../../domain/services/ICsvParserService';

const DATE_KEYS = ['date', 'date de valeur', 'date opération', 'date operation', 'transaction date', 'booking date'];
const AMOUNT_KEYS = ['montant', 'amount', 'credit/debit', 'debit/credit', 'solde', 'valeur'];
const LABEL_KEYS = ['libellé', 'libelle', 'label', 'description', 'wording', 'référence', 'reference', 'motif'];

@Injectable()
export class PapaparseCSVParser implements ICsvParserService {
  parse(content: string): ParsedTransaction[] {
    const result = Papa.parse<Record<string, string>>(content, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0 && result.data.length === 0) {
      throw new BadRequestException('CSV parsing failed');
    }

    const headers = result.meta.fields ?? [];
    const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());

    const dateKey = this.findKey(normalizedHeaders, DATE_KEYS, headers);
    const amountKey = this.findKey(normalizedHeaders, AMOUNT_KEYS, headers);
    const labelKey = this.findKey(normalizedHeaders, LABEL_KEYS, headers);

    if (!dateKey || !amountKey || !labelKey) {
      throw new BadRequestException(
        `CSV columns not recognized. Found: ${headers.join(', ')}. Expected columns for date, amount, and label.`,
      );
    }

    const transactions: ParsedTransaction[] = [];

    for (const row of result.data) {
      const rawDate = row[dateKey]?.trim();
      const rawAmount = row[amountKey]?.trim().replace(/\s/g, '').replace(',', '.');
      const rawLabel = row[labelKey]?.trim();

      if (!rawDate || !rawAmount || !rawLabel) continue;

      const date = this.parseDate(rawDate);
      const amount = parseFloat(rawAmount);

      if (!date || isNaN(amount)) continue;

      transactions.push({ date, amount, label: rawLabel });
    }

    return transactions;
  }

  private findKey(normalizedHeaders: string[], candidates: string[], originalHeaders: string[]): string | null {
    for (const candidate of candidates) {
      const idx = normalizedHeaders.findIndex((h) => h.includes(candidate));
      if (idx !== -1) return originalHeaders[idx];
    }
    return null;
  }

  private parseDate(raw: string): Date | null {
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})$/,
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      /^(\d{2})\.(\d{2})\.(\d{4})$/,
      /^(\d{2})-(\d{2})-(\d{4})$/,
    ];

    for (const fmt of formats) {
      const m = raw.match(fmt);
      if (m) {
        const [, a, b, c] = m;
        const iso = fmt === formats[0]
          ? `${a}-${b}-${c}`
          : `${c}-${b}-${a}`;
        const d = new Date(iso);
        if (!isNaN(d.getTime())) return d;
      }
    }
    return null;
  }
}
