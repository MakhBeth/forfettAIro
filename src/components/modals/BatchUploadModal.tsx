import { useState } from 'react';
import { X, FileText, Loader } from 'lucide-react';

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList) => Promise<void> | void;
}

export function BatchUploadModal({ isOpen, onClose, onUpload }: BatchUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        await onUpload(e.target.files);
      } finally {
        setIsUploading(false);
        e.target.value = ''; // Clear input to allow re-upload
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="batch-upload-title" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="batch-upload-title" className="modal-title">Importa File XML Multipli</h3>
          <button className="close-btn" onClick={onClose} aria-label="Chiudi"><X size={20} aria-hidden="true" /></button>
        </div>
        {isUploading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Loader size={40} style={{ marginBottom: 16, color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontWeight: 500 }}>Importazione in corso...</p>
          </div>
        ) : (
          <label className="upload-zone">
            <input
              type="file"
              accept=".xml"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <FileText size={40} style={{ marginBottom: 16, color: 'var(--accent-primary)' }} />
            <p style={{ fontWeight: 500 }}>Clicca per selezionare file XML multipli</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
              Puoi selezionare più file XML contemporaneamente
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
              I duplicati (stesso numero, data e importo) saranno saltati
            </p>
          </label>
        )}
      </div>
    </div>
  );
}
