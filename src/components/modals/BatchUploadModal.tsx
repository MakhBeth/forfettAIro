import { X, FileText } from 'lucide-react';

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList) => void;
}

export function BatchUploadModal({ isOpen, onClose, onUpload }: BatchUploadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Importa File XML Multipli</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <label className="upload-zone">
          <input
            type="file"
            accept=".xml"
            multiple
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onUpload(e.target.files);
                e.target.value = ''; // Clear input to allow re-upload
              }
            }}
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
      </div>
    </div>
  );
}
