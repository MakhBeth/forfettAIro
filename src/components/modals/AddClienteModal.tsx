import { X, Check } from 'lucide-react';
import type { Cliente } from '../../types';

interface AddClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  newCliente: Partial<Cliente>;
  setNewCliente: (cliente: Partial<Cliente>) => void;
  onAdd: () => void;
}

export function AddClienteModal({ isOpen, onClose, newCliente, setNewCliente, onAdd }: AddClienteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Nuovo Cliente</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="input-group">
          <label className="input-label">Nome *</label>
          <input type="text" className="input-field" value={newCliente.nome || ''} onChange={(e) => setNewCliente({ ...newCliente, nome: e.target.value })} placeholder="Acme S.r.l." />
        </div>
        <div className="input-group">
          <label className="input-label">P.IVA / CF</label>
          <input type="text" className="input-field" value={newCliente.piva || ''} onChange={(e) => setNewCliente({ ...newCliente, piva: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Email</label>
          <input type="email" className="input-field" value={newCliente.email || ''} onChange={(e) => setNewCliente({ ...newCliente, email: e.target.value })} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onAdd}><Check size={18} /> Aggiungi</button>
      </div>
    </div>
  );
}
