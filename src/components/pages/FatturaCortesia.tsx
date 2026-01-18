import { useState, useRef } from 'react';
import { Upload, Download, FileText, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parseXmlToInvoice } from '../../lib/pdf/xmlParser';
import GeneratePDF from '../../lib/pdf/renderer';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import type { Invoice, PDFOptions } from '../../lib/pdf/types';

export function FatturaCortesia() {
  const { config, setConfig, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF Settings (from config)
  const [primaryColor, setPrimaryColor] = useState(config.courtesyInvoice?.primaryColor || '#6699cc');
  const [showFooter, setShowFooter] = useState(config.courtesyInvoice?.includeFooter !== false);
  const [locale, setLocale] = useState(config.courtesyInvoice?.locale || 'it');

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedInvoice, setParsedInvoice] = useState<Invoice | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSaveSettings = () => {
    setConfig({
      ...config,
      courtesyInvoice: {
        ...config.courtesyInvoice,
        primaryColor,
        includeFooter: showFooter,
        locale,
        // Keep other settings
        textColor: config.courtesyInvoice?.textColor || '#033243',
        companyName: config.courtesyInvoice?.companyName || '',
        vatNumber: config.courtesyInvoice?.vatNumber || '',
        country: config.courtesyInvoice?.country || 'IT',
        defaultServices: config.courtesyInvoice?.defaultServices || [],
      }
    });
    showToast('Impostazioni salvate!', 'success');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    try {
      const text = await file.text();
      const invoice = parseXmlToInvoice(text);
      setParsedInvoice(invoice);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Errore parsing XML';
      showToast(message, 'error');
      setParsedInvoice(null);
    }
  };

  const handleGenerate = async () => {
    if (!parsedInvoice) {
      showToast('Seleziona prima un file XML', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const options: PDFOptions = {
        colors: {
          primary: primaryColor,
          text: config.courtesyInvoice?.textColor || '#033243',
        },
        footer: showFooter,
        locale,
        logoSrc: config.courtesyInvoice?.logoBase64,
      };

      const pdfDoc = GeneratePDF(parsedInvoice, options);
      const blob = await pdf(pdfDoc).toBlob();

      const filename = `fattura-cortesia-${parsedInvoice.installments[0]?.number || 'new'}.pdf`;
      saveAs(blob, filename.replace(/\//g, '-'));

      showToast('PDF generato!', 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Errore generazione PDF';
      showToast(message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Fattura di Cortesia</h1>
        <p className="page-subtitle">Genera PDF da fattura elettronica XML</p>
      </div>

      {/* IMPOSTAZIONI PDF */}
      <div className="card">
        <div className="card-title" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
          IMPOSTAZIONI PDF
        </div>

        <div className="input-group">
          <label className="input-label">Colore Primario</label>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            style={{
              width: '100%',
              height: 50,
              padding: 0,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          />
        </div>

        <div className="input-group" style={{ marginTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showFooter}
              onChange={(e) => setShowFooter(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent-green)' }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>Mostra footer nel PDF</span>
          </label>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSaveSettings}
          style={{ marginTop: 20 }}
        >
          Salva Impostazioni
        </button>
      </div>

      {/* GENERA PDF */}
      <div className="card">
        <div className="card-title" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
          GENERA PDF
        </div>

        <div className="input-group">
          <label className="input-label">Seleziona file XML FatturaPA</label>

          {/* Drop zone */}
          <div
            onClick={handleDropZoneClick}
            style={{
              border: '2px dashed var(--border)',
              borderRadius: 12,
              padding: 30,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <Upload size={32} style={{ color: 'var(--accent-blue)' }} />
            {selectedFile ? (
              <span style={{ fontFamily: 'Space Mono', color: 'var(--text-primary)' }}>
                {selectedFile.name}
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>
                Clicca per selezionare un file XML
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xml"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        <div className="input-group" style={{ marginTop: 16 }}>
          <label className="input-label">Lingua del PDF</label>
          <select
            className="input-field"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
          >
            <option value="it">Italiano</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        <button
          className="btn btn-success"
          onClick={handleGenerate}
          disabled={!parsedInvoice || isGenerating}
          style={{ marginTop: 20, width: '100%' }}
        >
          {isGenerating ? (
            'Generando...'
          ) : (
            <>
              <Download size={18} /> Genera PDF
            </>
          )}
        </button>
      </div>

      {/* File selezionato */}
      {selectedFile && parsedInvoice && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--accent-green)',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <FileText size={24} style={{ color: 'var(--accent-green)' }} />
          <div>
            <div style={{ fontWeight: 600 }}>File selezionato</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>
              {selectedFile.name}
            </div>
            {parsedInvoice.installments[0] && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Fattura n. {parsedInvoice.installments[0].number} - {parsedInvoice.invoicee.name || parsedInvoice.invoicee.vat}
              </div>
            )}
          </div>
          <Check size={20} style={{ marginLeft: 'auto', color: 'var(--accent-green)' }} />
        </div>
      )}
    </>
  );
}
