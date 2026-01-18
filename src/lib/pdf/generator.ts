import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import GeneratePDF from './renderer';
import type { Invoice, Line, PDFOptions } from './types';
import type { CourtesyInvoiceDraft, Config } from '../../types';

/**
 * Transform app's CourtesyInvoiceDraft into PDF Invoice structure
 */
function transformDraftToInvoice(
  draft: CourtesyInvoiceDraft,
  config: Config
): Invoice {
  const courtesyConfig = config.courtesyInvoice;

  // Calculate totals from lines
  const lines: Line[] = draft.lines.map((line) => ({
    number: line.number,
    description: line.description,
    quantity: line.quantity,
    singlePrice: line.unitPrice,
    amount: line.quantity * line.unitPrice,
    tax: line.taxRate,
  }));

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const taxAmount = draft.lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice * (line.taxRate / 100),
    0
  );
  const totalAmount = subtotal + taxAmount;

  // Build invoicer (supplier) from config
  const invoicer = {
    name: courtesyConfig?.companyName || '',
    vat: courtesyConfig?.vatNumber || '',
    office: {
      address: courtesyConfig?.address,
      cap: courtesyConfig?.postalCode,
      city: courtesyConfig?.city,
      district: courtesyConfig?.province,
      country: courtesyConfig?.country || 'IT',
    },
    contacts: {
      tel: courtesyConfig?.phone,
      email: courtesyConfig?.email,
    },
  };

  // Build invoicee (customer) from draft
  const invoicee = {
    name: draft.clientName,
    vat: draft.clientVat || '',
    office: draft.clientAddress
      ? { address: draft.clientAddress }
      : undefined,
  };

  // Build payment info if IBAN is configured
  const payment = courtesyConfig?.iban
    ? {
        amount: totalAmount,
        iban: courtesyConfig.iban,
        bank: courtesyConfig.bankName,
        method: draft.paymentMethod,
        regularPaymentDate: draft.dueDate,
      }
    : undefined;

  // Average tax rate for summary
  const avgTaxRate =
    draft.lines.length > 0
      ? draft.lines.reduce((sum, l) => sum + l.taxRate, 0) / draft.lines.length
      : 0;

  return {
    invoicer,
    invoicee,
    installments: [
      {
        number: draft.number,
        currency: 'EUR',
        totalAmount,
        issueDate: draft.issueDate,
        description: draft.description,
        lines,
        payment,
        taxSummary: {
          taxPercentage: avgTaxRate,
          taxAmount,
          paymentAmount: subtotal,
        },
      },
    ],
  };
}

/**
 * Generate courtesy invoice PDF and return as Blob
 */
export async function generateCourtesyInvoicePDF(
  draft: CourtesyInvoiceDraft,
  config: Config
): Promise<Blob> {
  // Validate inputs
  if (!config.courtesyInvoice) {
    throw new Error('Configurazione fattura di cortesia mancante');
  }
  if (draft.lines.length === 0) {
    throw new Error('Aggiungi almeno una riga alla fattura');
  }
  if (!draft.number) {
    throw new Error('Inserisci il numero fattura');
  }

  // Transform draft to Invoice structure
  const invoice = transformDraftToInvoice(draft, config);

  // Build PDF options from config
  const options: PDFOptions = {
    colors: {
      primary: config.courtesyInvoice.primaryColor,
      text: config.courtesyInvoice.textColor,
    },
    footer: config.courtesyInvoice.includeFooter,
    locale: config.courtesyInvoice.locale,
    logoSrc: config.courtesyInvoice.logoBase64,
  };

  // Generate PDF document
  const pdfDoc = GeneratePDF(invoice, options);
  const blob = await pdf(pdfDoc).toBlob();

  return blob;
}

/**
 * Generate and download courtesy invoice PDF
 */
export async function downloadCourtesyInvoicePDF(
  draft: CourtesyInvoiceDraft,
  config: Config
): Promise<void> {
  const blob = await generateCourtesyInvoicePDF(draft, config);
  const filename = `fattura-cortesia-${draft.number.replace(/\//g, '-')}.pdf`;
  saveAs(blob, filename);
}
