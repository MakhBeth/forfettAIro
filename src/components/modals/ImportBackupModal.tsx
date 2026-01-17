import { X, Upload, AlertTriangle } from 'lucide-react';

interface ImportBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImportBackupModal({ isOpen, onClose, onImport }: ImportBackupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Importa Backup</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div style={{ padding: 16, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, marginBottom: 20, border: '1px solid var(--accent-red)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--accent-red)' }}>
            <AlertTriangle size={20} /><strong>Attenzione</strong>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>L'import sovrascrive tutti i dati esistenti!</p>
        </div>
        <label className="upload-zone">
          <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }} />
          <Upload size={40} style={{ marginBottom: 16, color: 'var(--accent-primary)' }} />
          <p style={{ fontWeight: 500 }}>Seleziona JSON</p>
        </label>
      </div>
    </div>
  );
}
