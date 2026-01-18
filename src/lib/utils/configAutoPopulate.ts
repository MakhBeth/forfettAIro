import type { Config, EmittenteConfig } from '../../types';

/**
 * Dati emittente estratti dalla fattura XML
 */
interface ExtractedEmittenteData {
  partitaIva?: string;
  codiceFiscale?: string;
  nome?: string;
  cognome?: string;
  indirizzo?: string;
  numeroCivico?: string;
  cap?: string;
  comune?: string;
  provincia?: string;
  nazione?: string;
  iban?: string;
}

/**
 * Estrae i dati dell'emittente (CedentePrestatore) da una fattura XML FatturaPA
 */
export function extractEmittenteFromXml(xmlContent: string): ExtractedEmittenteData | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');

    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return null;
    }

    const cedente = doc.querySelector('CedentePrestatore');
    if (!cedente) {
      return null;
    }

    const getText = (selector: string): string | undefined => {
      const el = cedente.querySelector(selector);
      return el?.textContent?.trim() || undefined;
    };

    // Estrai Partita IVA e Codice Fiscale separatamente
    const partitaIva = getText('IdFiscaleIVA IdCodice');
    const codiceFiscale = getText('CodiceFiscale');

    // Estrai Nome e Cognome (per persone fisiche)
    const nome = getText('Nome');
    const cognome = getText('Cognome');

    // Se non ci sono nome/cognome, potrebbe essere una ditta con Denominazione
    // In quel caso lasciamo vuoti e l'utente compilerà manualmente

    // Estrai sede
    const indirizzo = getText('Sede Indirizzo');
    const numeroCivico = getText('Sede NumeroCivico');
    const cap = getText('Sede CAP');
    const comune = getText('Sede Comune');
    const provincia = getText('Sede Provincia');
    const nazione = getText('Sede Nazione');

    // Estrai IBAN dal pagamento
    const iban = doc.querySelector('DettaglioPagamento IBAN')?.textContent?.trim();

    return {
      partitaIva,
      codiceFiscale,
      nome,
      cognome,
      indirizzo,
      numeroCivico,
      cap,
      comune,
      provincia,
      nazione,
      iban: iban || undefined
    };
  } catch {
    return null;
  }
}

/**
 * Verifica se un campo è vuoto (undefined, null, o stringa vuota)
 */
function isEmpty(value: string | undefined | null): boolean {
  return !value || value.trim() === '';
}

/**
 * Auto-popola i campi vuoti della config con i dati estratti dalla fattura XML.
 * Restituisce un oggetto Partial<Config> con i campi da aggiornare, o null se non ci sono aggiornamenti.
 */
export function autoPopulateConfig(
  extractedData: ExtractedEmittenteData,
  currentConfig: Config
): Partial<Config> | null {
  const updates: Partial<Config> = {};
  let hasUpdates = false;

  // Auto-popola Partita IVA
  if (isEmpty(currentConfig.partitaIva) && extractedData.partitaIva) {
    updates.partitaIva = extractedData.partitaIva;
    hasUpdates = true;
  }

  // Auto-popola IBAN
  if (isEmpty(currentConfig.iban) && extractedData.iban) {
    updates.iban = extractedData.iban.toUpperCase();
    hasUpdates = true;
  }

  // Auto-popola dati emittente
  const currentEmittente = currentConfig.emittente || {} as EmittenteConfig;
  const emittenteUpdates: Partial<EmittenteConfig> = {};
  let hasEmittenteUpdates = false;

  if (isEmpty(currentEmittente.codiceFiscale) && extractedData.codiceFiscale) {
    emittenteUpdates.codiceFiscale = extractedData.codiceFiscale.toUpperCase();
    hasEmittenteUpdates = true;
  }

  if (isEmpty(currentEmittente.nome) && extractedData.nome) {
    emittenteUpdates.nome = extractedData.nome;
    hasEmittenteUpdates = true;
  }

  if (isEmpty(currentEmittente.cognome) && extractedData.cognome) {
    emittenteUpdates.cognome = extractedData.cognome;
    hasEmittenteUpdates = true;
  }

  if (isEmpty(currentEmittente.indirizzo) && extractedData.indirizzo) {
    emittenteUpdates.indirizzo = extractedData.indirizzo;
    hasEmittenteUpdates = true;
  }

  if (isEmpty(currentEmittente.numeroCivico) && extractedData.numeroCivico) {
    emittenteUpdates.numeroCivico = extractedData.numeroCivico;
    hasEmittenteUpdates = true;
  }

  if (isEmpty(currentEmittente.cap) && extractedData.cap) {
    emittenteUpdates.cap = extractedData.cap;
    hasEmittenteUpdates = true;
  }

  if (isEmpty(currentEmittente.comune) && extractedData.comune) {
    emittenteUpdates.comune = extractedData.comune;
    hasEmittenteUpdates = true;
  }

  if (isEmpty(currentEmittente.provincia) && extractedData.provincia) {
    emittenteUpdates.provincia = extractedData.provincia.toUpperCase();
    hasEmittenteUpdates = true;
  }

  if (isEmpty(currentEmittente.nazione) && extractedData.nazione) {
    emittenteUpdates.nazione = extractedData.nazione.toUpperCase();
    hasEmittenteUpdates = true;
  }

  if (hasEmittenteUpdates) {
    updates.emittente = {
      ...currentEmittente,
      ...emittenteUpdates
    } as EmittenteConfig;
    hasUpdates = true;
  }

  return hasUpdates ? updates : null;
}
