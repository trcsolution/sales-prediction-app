'use server'

import { parse } from 'csv-parse/sync'

export interface SalesData {
  date: string;
  article: string;
  sales: number;
}

// Define an interface for the parsed CSV record
interface ParsedRecord {
  date: string;
  article: string;
  sales: string; // sales comes as a string from CSV, so we specify it as string
}

export async function processSalesData(csvContent: string): Promise<SalesData[]> {
  const records: ParsedRecord[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });

  return records.map((record) => ({
    date: record.date,
    article: record.article,
    sales: parseInt(record.sales, 10)
  }));
}