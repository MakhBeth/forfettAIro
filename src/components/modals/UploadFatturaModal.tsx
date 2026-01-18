import { X, Upload } from 'lucide-react';

interface UploadFatturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadFatturaModal({ isOpen, onClose, onUpload }: UploadFatturaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="upload-fattura-title" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="upload-fattura-title" className="modal-title">Carica Fattura XML</h3>
          <button className="close-btn" onClick={onClose} aria-label="Chiudi"><X size={20} aria-hidden="true" /></button>
        </div>
        <label className="upload-zone">
          <input type="file" accept=".xml" onChange={onUpload} style={{ display: 'none' }} />
          <Upload size={40} style={{ marginBottom: 16, color: 'var(--accent-primary)' }} />
          <p style={{ fontWeight: 500 }}>Clicca per caricare</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>Formato: FatturaPA XML</p>
        </label>
      </div>
    </div>
  );
}
