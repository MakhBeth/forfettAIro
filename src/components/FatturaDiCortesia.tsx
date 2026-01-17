import React, { useState, useEffect } from 'react';
import { Upload, Check, X, Trash2 } from 'lucide-react';
import { generatePDFFromXML, downloadPDF, generateFilename } from '../utils/pdfGenerator';
import { xmlToJson } from '../utils/xmlParser';
import dataExtractor from '../utils/dataExtractor';
import type { FatturaSettings } from '../types/FatturaSettings';
import { DEFAULT_FATTURA_SETTINGS } from '../types/FatturaSettings';

interface FatturaDiCortesiaProps {
  dbManager: any;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function FatturaDiCortesia({ dbManager, showToast }: FatturaDiCortesiaProps) {
  const [settings, setSettings] = useState<FatturaSettings>(DEFAULT_FATTURA_SETTINGS);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [uploadedXmlFile, setUploadedXmlFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'it' | 'de' | 'en' | 'es'>('it');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

  // Load settings from IndexedDB
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await dbManager.get('fatturaSettings', 'main');
        if (savedSettings) {
          setSettings(savedSettings);
          setImagePreview(savedSettings.headingImage);
          setSelectedLanguage(savedSettings.defaultLocale);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    loadSettings();
  }, [dbManager]);

  const handleSaveSettings = async () => {
    try {
      await dbManager.put('fatturaSettings', settings);
      showToast('Impostazioni salvate con successo!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Errore nel salvataggio delle impostazioni', 'error');
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, primaryColor: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Per favore carica un file immagine', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSettings({ ...settings, headingImage: base64 });
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSettings({ ...settings, headingImage: undefined });
    setImagePreview(undefined);
  };

  const handleXmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xml')) {
      showToast('Per favore carica un file XML', 'error');
      return;
    }

    setUploadedXmlFile(file);
  };

  const handleGeneratePDF = async () => {
    if (!uploadedXmlFile) {
      showToast('Per favore carica un file XML prima', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      // Read file content
      const xmlContent = await uploadedXmlFile.text();
      
      // Validate XML format
      try {
        const json = await xmlToJson(xmlContent);
        const invoice = dataExtractor(json);
        
        if (!invoice.number && !invoice.date) {
          showToast('Il file XML non sembra essere una fattura valida', 'error');
          setIsGenerating(false);
          return;
        }
      } catch (error) {
        showToast('Errore nella lettura del file XML', 'error');
        setIsGenerating(false);
        return;
      }

      // Generate PDF
      const pdfBlob = await generatePDFFromXML(xmlContent, settings, selectedLanguage);
      
      // Extract invoice details for filename
      const json = await xmlToJson(xmlContent);
      const invoice = dataExtractor(json);
      const filename = generateFilename(invoice.number, invoice.date);
      
      // Download PDF
      downloadPDF(pdfBlob, filename);
      
      showToast('PDF generato con successo!', 'success');
      setUploadedXmlFile(null);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Errore nella generazione del PDF', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoadingSettings) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Fattura di Cortesia</h1>
        <p className="page-subtitle">Genera PDF da fatture elettroniche XML</p>
      </div>

      {/* Settings Section */}
      <div className="card">
        <h3 className="card-title">Impostazioni Fattura di Cortesia</h3>
        
        {/* Primary Color */}
        <div className="input-group" style={{ marginBottom: '20px' }}>
          <label className="input-label">Colore Primario</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="color"
              value={settings.primaryColor}
              onChange={handleColorChange}
              style={{
                width: '60px',
                height: '40px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            />
            <input
              type="text"
              value={settings.primaryColor}
              onChange={handleColorChange}
              className="input-field"
              style={{ maxWidth: '150px' }}
              placeholder="#6699cc"
            />
          </div>
        </div>

        {/* Logo/Image Upload */}
        <div className="input-group" style={{ marginBottom: '20px' }}>
          <label className="input-label">Logo/Immagine (opzionale)</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={16} /> Carica File
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            {imagePreview && (
              <>
                <div style={{
                  width: '80px',
                  height: '80px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
                <button className="btn btn-danger" onClick={handleRemoveImage}>
                  <Trash2 size={16} /> Rimuovi
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer Settings */}
        <div className="input-group" style={{ marginBottom: '20px' }}>
          <label className="input-label">Piè di pagina</label>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.footerEnabled}
                onChange={(e) => setSettings({ ...settings, footerEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>Mostra piè di pagina</span>
            </label>
          </div>
          {settings.footerEnabled && (
            <>
              <div style={{ marginBottom: '12px' }}>
                <label className="input-label" style={{ fontSize: '0.85rem' }}>Creato da</label>
                <input
                  type="text"
                  value={settings.createdByText}
                  onChange={(e) => setSettings({ ...settings, createdByText: e.target.value })}
                  className="input-field"
                  placeholder="Nome o azienda"
                />
              </div>
              <div>
                <label className="input-label" style={{ fontSize: '0.85rem' }}>Link</label>
                <input
                  type="text"
                  value={settings.createdByLink}
                  onChange={(e) => setSettings({ ...settings, createdByLink: e.target.value })}
                  className="input-field"
                  placeholder="mailto:email@example.com o https://..."
                />
              </div>
            </>
          )}
        </div>

        {/* Default Language */}
        <div className="input-group" style={{ marginBottom: '20px' }}>
          <label className="input-label">Lingua predefinita</label>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {(['it', 'de', 'en', 'es'] as const).map((lang) => (
              <label key={lang} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="defaultLocale"
                  value={lang}
                  checked={settings.defaultLocale === lang}
                  onChange={(e) => setSettings({ ...settings, defaultLocale: e.target.value as 'it' | 'de' | 'en' | 'es' })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>{lang === 'it' ? 'Italiano' : lang === 'de' ? 'Deutsch' : lang === 'en' ? 'English' : 'Español'}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSaveSettings}>
          <Check size={18} /> Salva Impostazioni
        </button>
      </div>

      {/* PDF Generation Section */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 className="card-title">Genera Fattura di Cortesia</h3>
        
        {/* XML File Upload */}
        <div className="input-group" style={{ marginBottom: '20px' }}>
          <label className="input-label">File XML Fattura Elettronica</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={16} /> Carica XML
              <input
                type="file"
                accept=".xml"
                onChange={handleXmlUpload}
                style={{ display: 'none' }}
              />
            </label>
            {uploadedXmlFile && (
              <div style={{
                padding: '8px 12px',
                backgroundColor: 'var(--bg-hover)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>✓ {uploadedXmlFile.name}</span>
                <button
                  onClick={() => setUploadedXmlFile(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Language Selection */}
        <div className="input-group" style={{ marginBottom: '20px' }}>
          <label className="input-label">Lingua per questa fattura</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as 'it' | 'de' | 'en' | 'es')}
            className="input-field"
            style={{ maxWidth: '250px' }}
          >
            <option value="it">Italiano</option>
            <option value="de">Deutsch</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleGeneratePDF}
          disabled={!uploadedXmlFile || isGenerating}
          style={{ opacity: !uploadedXmlFile || isGenerating ? 0.5 : 1 }}
        >
          {isGenerating ? 'Generazione in corso...' : 'Genera e Scarica PDF'}
        </button>
      </div>
    </div>
  );
}
