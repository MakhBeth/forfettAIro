import type { Config } from '../../types';

// Database constants
export const DB_NAME = 'ForfettarioDB';
export const DB_VERSION = 1;
export const STORES = ['config', 'clienti', 'fatture', 'workLogs'] as const;

// Fiscal constants
export const LIMITE_FATTURATO = 85000;
export const INPS_GESTIONE_SEPARATA = 0.2607;
export const ALIQUOTA_RIDOTTA = 0.05;
export const ALIQUOTA_STANDARD = 0.15;
export const MAX_HISTORICAL_YEARS = 10;

// ATECO coefficients
export const COEFFICIENTI_ATECO: Record<string, number> = {
  '62': 67, '63': 67, '70': 78, '71': 78, '72': 67,
  '73': 78, '74': 78, '69': 78, '85': 78, '86': 78,
  'default': 78
};

// Default configuration
export const DEFAULT_CONFIG: Config = {
  id: 'main',
  coefficiente: 0,
  aliquota: 0,
  ateco: [],
  partitaIva: '',
  annoApertura: new Date().getFullYear(),
  codiciAteco: [],
  nomeAttivita: '',
  aliquotaOverride: null
};
