// Type definitions for ForfettAIro

export type StoreName = 'config' | 'clienti' | 'fatture' | 'workLogs';

export interface Cliente {
  id: string;
  nome: string;
  piva?: string;
  email?: string;
  billingUnit?: 'ore' | 'giornata';
  rate?: number;
  billingStartDate?: string; // YYYY-MM-DD
}

export interface Fattura {
  id: string;
  numero?: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  dataIncasso?: string;
  importo: number;
  duplicateKey?: string;
}

export interface WorkLog {
  id: string;
  clienteId: string;
  data: string;
  ore?: string; // Legacy field, kept for backward compatibility
  tipo: 'ore' | 'giornata';
  quantita?: number; // Fractional quantity (hours or days)
  note?: string;
}

export interface Config {
  id: string;
  coefficiente: number;
  aliquota: number;
  ateco: string[];
  aliquotaOverride: number | null;
  nomeAttivita?: string;
  partitaIva?: string;
  annoApertura: number;
  codiciAteco: string[];
}

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

export interface ImportSummary {
  total: number;
  imported: number;
  duplicates: number;
  failed: number;
  failedFiles: Array<{ filename: string; error: string }>;
}
