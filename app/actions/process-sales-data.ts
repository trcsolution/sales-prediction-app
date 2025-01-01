'use server'

import { parse } from 'csv-parse/sync'

export interface SalesData {
  date: string;
  article: string;
  sales: number;
}

export async function processSalesData(csvContent: string): Promise<SalesData[]> {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });

  return records.map((record: any) => ({
    date: record.date,
    article: record.article,
    sales: parseInt(record.sales, 10)
  }));
}

