import { useState } from 'react';
import { Download, Upload, Database, Plus, X, Edit, Trash2, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Cliente } from '../../types';
import { COEFFICIENTI_ATECO } from '../../lib/constants/fiscali';

interface ImpostazioniProps {
  setShowModal: (modal: string | null) => void;
  setEditingCliente: (cliente: Cliente) => void;
  handleExport: () => void;
}

export function Impostazioni({ setShowModal, setEditingCliente, handleExport }: ImpostazioniProps) {
  const { config, setConfig, clienti, removeCliente } = useApp();
  const [newAteco, setNewAteco] = useState<string>('');

  const annoCorrente = new Date().getFullYear();
  const anniAttivita = annoCorrente - config.annoApertura;

  const addAteco = () => {
    if (!newAteco || config.codiciAteco.includes(newAteco)) return;
    setConfig({ ...config, codiciAteco: [...config.codiciAteco, newAteco] });
    setNewAteco('');
  };

  const coefficienteMedio = config.codiciAteco.length > 0
    ? config.codiciAteco.reduce((sum, code) => {
        const prefix = code.substring(0, 2);
        return sum + (COEFFICIENTI_ATECO[prefix] || COEFFICIENTI_ATECO.default);
      }, 0) / config.codiciAteco.length
    : 78;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Impostazioni</h1>
        <p className="page-subtitle">Configura P.IVA e backup</p>
      </div>

      <div className="card">
        <div className="card-title"><Database size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />Backup & Ripristino</div>
        <div className="backup-section">
          <button className="btn btn-success" onClick={handleExport}><Download size={18} /> Esporta backup</button>
          <button className="btn btn-primary" onClick={() => setShowModal('import')}><Upload size={18} /> Importa backup</button>
        </div>
        <div className="backup-info">
          <h4>ℹ️ Info backup</h4>
          <p>I dati sono in IndexedDB (locale). Esporta regolarmente per sicurezza. Il JSON contiene: config, clienti, fatture e ore.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Dati P.IVA</div>
          <div className="input-group">
            <label className="input-label">Nome Attività</label>
            <input type="text" className="input-field" value={config.nomeAttivita} onChange={(e) => setConfig({ ...config, nomeAttivita: e.target.value })} placeholder="Es: Mario Rossi - Consulente" />
          </div>
          <div className="input-group">
            <label className="input-label">Partita IVA</label>
            <input type="text" className="input-field" value={config.partitaIva} onChange={(e) => setConfig({ ...config, partitaIva: e.target.value })} placeholder="12345678901" maxLength={11} />
          </div>
          <div className="input-group">
            <label className="input-label">Anno Apertura</label>
            <input type="number" className="input-field" value={config.annoApertura} onChange={(e) => setConfig({ ...config, annoApertura: parseInt(e.target.value) })} min={2000} max={annoCorrente} />
            <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {anniAttivita < 5 ? `✓ Aliquota 5% (${5 - anniAttivita} anni rimasti)` : 'Aliquota 15%'}
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Override Aliquota IRPEF (opzionale)</label>
            <input
              type="number"
              className="input-field"
              value={config.aliquotaOverride !== null ? config.aliquotaOverride : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setConfig({ ...config, aliquotaOverride: null });
                } else {
                  const num = parseFloat(val);
                  if (!isNaN(num) && num >= 0 && num <= 100) {
                    setConfig({ ...config, aliquotaOverride: num });
                  }
                }
              }}
              placeholder="Es: 5 o 15"
              min={0}
              max={100}
              step={0.01}
            />
            <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {config.aliquotaOverride !== null
                ? `✓ Usando aliquota custom: ${config.aliquotaOverride}%`
                : 'Lascia vuoto per usare l\'aliquota automatica'}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Codici ATECO</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input type="text" className="input-field" value={newAteco} onChange={(e) => setNewAteco(e.target.value)} placeholder="Es: 62.01.00" style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={addAteco}><Plus size={18} /></button>
          </div>
          {config.codiciAteco.length > 0 ? (
            <div>
              {config.codiciAteco.map((code, i) => (
                <div key={i} className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {code}
                  <X size={14} style={{ cursor: 'pointer' }} onClick={() => setConfig({ ...config, codiciAteco: config.codiciAteco.filter((_, j) => j !== i) })} />
                </div>
              ))}
            </div>
          ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aggiungi ATECO per coefficiente redditività</p>}
          {config.codiciAteco.length > 0 && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Coefficiente</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>{coefficienteMedio}%</div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title" style={{ margin: 0 }}>Clienti ({clienti.length})</div>
          <button className="btn btn-primary" onClick={() => setShowModal('add-cliente')}><Plus size={18} /> Aggiungi</button>
        </div>
        {clienti.length > 0 ? (
          <table className="table" style={{ marginTop: 16 }}>
            <thead><tr><th>Nome</th><th>P.IVA</th><th>Email</th><th>Tariffa</th><th></th></tr></thead>
            <tbody>
              {clienti.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.nome}</td>
                  <td style={{ fontFamily: 'Space Mono' }}>{c.piva || '-'}</td>
                  <td>{c.email || '-'}</td>
                  <td>{c.rate && c.billingUnit ? `€${c.rate}/${c.billingUnit === 'ore' ? 'h' : 'gg'}` : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingCliente({ ...c }); setShowModal('edit-cliente'); }}><Edit size={16} /></button>
                      <button className="btn btn-danger" onClick={() => removeCliente(c.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="empty-state"><Users size={40} /><p>Nessun cliente</p></div>}
      </div>
    </>
  );
}
