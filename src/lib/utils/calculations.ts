import type { WorkLog } from '../../types';
import { LIMITE_FATTURATO, INPS_GESTIONE_SEPARATA, COEFFICIENTI_ATECO } from '../constants/fiscali';

// Get work log quantity (handles legacy ore field)
export const getWorkLogQuantita = (log: WorkLog): number => {
  // If quantita is defined, use it
  if (log.quantita !== undefined && log.quantita !== null) {
    return log.quantita;
  }
  // Backward compatibility: derive from ore or tipo
  if (log.tipo === 'giornata') {
    return 1;
  }
  if (log.tipo === 'ore' && log.ore) {
    return parseFloat(log.ore) || 0;
  }
  return 0;
};

// Calculate average ATECO coefficient
export const calcolaCoefficientiMedio = (codiciAteco: Record<string, number>): number => {
  const valori = Object.values(codiciAteco);
  if (valori.length === 0) return COEFFICIENTI_ATECO.default;
  const somma = valori.reduce((acc, val) => acc + val, 0);
  return somma / valori.length;
};

// Calculate imponibile from fatturato
export const calcolaImponibile = (fatturato: number, coefficiente: number): number => {
  return fatturato * (coefficiente / 100);
};

// Calculate IRPEF
export const calcolaIRPEF = (imponibile: number, aliquota: number): number => {
  return imponibile * aliquota;
};

// Calculate INPS
export const calcolaINPS = (imponibile: number): number => {
  return imponibile * INPS_GESTIONE_SEPARATA;
};

// Calculate net income
export const calcolaReddito = (fatturato: number, coefficiente: number, aliquota: number): number => {
  const imponibile = calcolaImponibile(fatturato, coefficiente);
  const irpef = calcolaIRPEF(imponibile, aliquota);
  const inps = calcolaINPS(imponibile);
  return fatturato - irpef - inps;
};

// Calculate progress percentage towards limit
export const calcolaProgressoLimite = (fatturato: number): number => {
  return (fatturato / LIMITE_FATTURATO) * 100;
};

// Check if approaching limit
export const isApproachingLimit = (fatturato: number): boolean => {
  return fatturato >= LIMITE_FATTURATO * 0.8; // 80% threshold
};

// Check if over limit
export const isOverLimit = (fatturato: number): boolean => {
  return fatturato > LIMITE_FATTURATO;
};
