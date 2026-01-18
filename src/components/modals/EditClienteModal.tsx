import { X, Check } from 'lucide-react';
import type { Cliente } from '../../types';

interface EditClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
  setCliente: (cliente: Cliente) => void;
  onUpdate: () => void;
}

export function EditClienteModal({ isOpen, onClose, cliente, setCliente, onUpdate }: EditClienteModalProps) {
  if (!isOpen || !cliente) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-cliente-title" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="edit-cliente-title" className="modal-title">Modifica Cliente</h3>
          <button className="close-btn" onClick={onClose} aria-label="Chiudi"><X size={20} aria-hidden="true" /></button>
        </div>
        <div className="input-group">
          <label className="input-label">Nome *</label>
          <input type="text" className="input-field" value={cliente.nome} onChange={(e) => setCliente({ ...cliente, nome: e.target.value })} placeholder="Acme S.r.l." />
        </div>
        <div className="input-group">
          <label className="input-label">P.IVA / CF</label>
          <input type="text" className="input-field" value={cliente.piva || ''} onChange={(e) => setCliente({ ...cliente, piva: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Email</label>
          <input type="email" className="input-field" value={cliente.email || ''} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Unità di Fatturazione</label>
          <select className="input-field" value={cliente.billingUnit || ''} onChange={(e) => setCliente({ ...cliente, billingUnit: e.target.value as 'ore' | 'giornata' })}>
            <option value="">Non specificato</option>
            <option value="ore">Ore</option>
            <option value="giornata">Giornata</option>
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Tariffa (€)</label>
          <input type="number" className="input-field" value={cliente.rate || ''} onChange={(e) => setCliente({ ...cliente, rate: parseFloat(e.target.value) || undefined })} placeholder="Es: 50" min="0" step="0.01" />
        </div>
        <div className="input-group">
          <label className="input-label">Data Inizio Fatturazione</label>
          <input type="date" className="input-field" value={cliente.billingStartDate || ''} onChange={(e) => setCliente({ ...cliente, billingStartDate: e.target.value })} />
          <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            💡 Il riepilogo mensile includerà solo le attività da questa data in poi
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onUpdate}><Check size={18} /> Salva</button>
      </div>
    </div>
  );
}
