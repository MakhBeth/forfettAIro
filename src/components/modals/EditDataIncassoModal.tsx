import { X, Check } from 'lucide-react';
import type { Fattura } from '../../types';

interface EditDataIncassoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fattura: Fattura | null;
  setFattura: (fattura: Fattura) => void;
  onUpdate: () => void;
}

export function EditDataIncassoModal({ isOpen, onClose, fattura, setFattura, onUpdate }: EditDataIncassoModalProps) {
  if (!isOpen || !fattura) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-incasso-title" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="edit-incasso-title" className="modal-title">Modifica Data Incasso</h3>
          <button className="close-btn" onClick={onClose} aria-label="Chiudi"><X size={20} aria-hidden="true" /></button>
        </div>
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, marginBottom: 20 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>Fattura</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{fattura.numero || 'N/A'} - {fattura.clienteNome}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Data emissione: {new Date(fattura.data).toLocaleDateString('it-IT')}
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Data Incasso (Principio di Cassa)</label>
          <input
            type="date"
            className="input-field"
            value={fattura.dataIncasso || fattura.data}
            onChange={(e) => setFattura({ ...fattura, dataIncasso: e.target.value })}
          />
          <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            💡 Per il regime forfettario, il fatturato si conta quando viene effettivamente incassato (principio di cassa).
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onUpdate}>
          <Check size={18} /> Salva
        </button>
      </div>
    </div>
  );
}
