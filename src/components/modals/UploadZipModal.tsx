import { useState } from 'react';
import { X, FileArchive, Loader } from 'lucide-react';

interface UploadZipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void;
}

export function UploadZipModal({ isOpen, onClose, onUpload }: UploadZipModalProps) {
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        await onUpload(e);
      } finally {
        setIsUploading(false);
        e.target.value = ''; // Clear input to allow re-upload
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Carica File ZIP</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
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
              accept=".zip"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <FileArchive size={40} style={{ marginBottom: 16, color: 'var(--accent-primary)' }} />
            <p style={{ fontWeight: 500 }}>Clicca per caricare un file ZIP</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
              Il file ZIP verrà estratto e tutti gli XML saranno importati
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
