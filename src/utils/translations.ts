// Translations for PDF invoice generation
export interface Translations {
  invoicerData: string;
  invoiceeData: string;
  invoiceNumber: string;
  invoiceDate: string;
  productsAndServices: string;
  description: string;
  quantity: string;
  unitPrice: string;
  vatRate: string;
  total: string;
  totalBeforeVat: string;
  totalVat: string;
  vatSummary: string;
  paymentDetails: string;
  paymentMethod: string;
  iban: string;
  dueDate: string;
  totalAmount: string;
  stampDuty: string;
  digitalInvoiceGeneratedBy: string;
  forfettarioNote: string;
}

export const translations: Record<'it' | 'de', Translations> = {
  it: {
    invoicerData: 'Dati fornitore',
    invoiceeData: 'Dati cliente',
    invoiceNumber: 'Numero',
    invoiceDate: 'Data',
    productsAndServices: 'Prodotti e servizi',
    description: 'Descrizione',
    quantity: 'Quantità',
    unitPrice: 'Prezzo unitario',
    vatRate: 'IVA',
    total: 'Totale',
    totalBeforeVat: 'Totale imponibile',
    totalVat: 'Totale IVA',
    vatSummary: 'Riepilogo IVA',
    paymentDetails: 'Dettagli pagamento',
    paymentMethod: 'Metodo di pagamento',
    iban: 'IBAN',
    dueDate: 'Scadenza',
    totalAmount: 'Importo',
    stampDuty: 'Imposta di bollo',
    digitalInvoiceGeneratedBy: 'Fattura digitale generata da',
    forfettarioNote: 'Operazione effettuata ai sensi dell\'articolo 1, commi da 54 a 89, della Legge n. 190/2014 - Regime forfettario - Operazione senza applicazione dell\'IVA ai sensi dell\'art. 1, comma 58, Legge n. 190/2014'
  },
  de: {
    invoicerData: 'Lieferantendaten',
    invoiceeData: 'Kundendaten',
    invoiceNumber: 'Nummer',
    invoiceDate: 'Datum',
    productsAndServices: 'Produkte und Dienstleistungen',
    description: 'Beschreibung',
    quantity: 'Menge',
    unitPrice: 'Einzelpreis',
    vatRate: 'MwSt',
    total: 'Gesamt',
    totalBeforeVat: 'Zwischensumme',
    totalVat: 'MwSt Gesamt',
    vatSummary: 'MwSt Zusammenfassung',
    paymentDetails: 'Zahlungsdetails',
    paymentMethod: 'Zahlungsmethode',
    iban: 'IBAN',
    dueDate: 'Fälligkeit',
    totalAmount: 'Betrag',
    stampDuty: 'Stempelsteuer',
    digitalInvoiceGeneratedBy: 'Digitale Rechnung erstellt von',
    forfettarioNote: 'Transaktion gemäß Artikel 1, Absätze 54 bis 89, des Gesetzes Nr. 190/2014 durchgeführt - Pauschalregelung - Transaktion ohne Anwendung der MwSt. gemäß Art. 1, Absatz 58, Gesetz Nr. 190/2014'
  }
};
