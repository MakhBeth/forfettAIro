import { useState } from 'react';
import { Download, Upload, Database, Plus, X, Edit, Trash2, Users, Palette, Building } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Cliente, EmittenteConfig } from '../../types';
import { COEFFICIENTI_ATECO } from '../../lib/constants/fiscali';
import { ThemeSwitch } from '../shared/ThemeSwitch';
import { getClientColor } from '../../lib/utils/colorUtils';

const getClientDisplayColor = (cliente: Cliente): string => {
  return cliente.color || getClientColor(cliente.id);
};

interface ImpostazioniProps {
  setShowModal: (modal: string | null) => void;
  setEditingCliente: (cliente: Cliente) => void;
  handleExport: () => void;
}

export function Impostazioni({ setShowModal, setEditingCliente, handleExport }: ImpostazioniProps) {
  const { config, clienti, removeCliente, setConfig } = useApp();
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
        <h2 className="card-title"><Database size={16} aria-hidden="true" style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />Backup & Ripristino</h2>
        <div className="backup-section">
          <button className="btn btn-success" onClick={handleExport}><Download size={18} aria-hidden="true" /> Esporta backup</button>
          <button className="btn btn-primary" onClick={() => setShowModal('import')}><Upload size={18} aria-hidden="true" /> Importa backup</button>
        </div>
        <div className="backup-info">
          <h2>ℹ️ Info backup</h2>
          <p>I dati sono in IndexedDB (locale). Esporta regolarmente per sicurezza. Il JSON contiene: config, clienti, fatture e ore.</p>
        </div>
      </div>

      {/* Dati P.IVA */}
      <div className="card">
        <h2 className="card-title"><Building size={16} aria-hidden="true" style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />Dati P.IVA</h2>

        <div className="grid-2">
          <div className="input-group">
            <label className="input-label" htmlFor="partita-iva">Partita IVA</label>
            <input type="text" id="partita-iva" className="input-field" value={config.partitaIva} onChange={(e) => setConfig({ ...config, partitaIva: e.target.value })} placeholder="12345678901" maxLength={11} style={{ fontFamily: 'Space Mono' }} />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="iban">IBAN</label>
            <input
              type="text"
              id="iban"
              className="input-field"
              value={config.iban || ''}
              onChange={(e) => setConfig({ ...config, iban: e.target.value.replace(/\s/g, '').toUpperCase() })}
              placeholder="IT60X0542811101000000123456"
              style={{ fontFamily: 'Space Mono' }}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="input-group">
            <label className="input-label" htmlFor="anno-apertura">Anno Apertura</label>
            <input type="number" id="anno-apertura" className="input-field" value={config.annoApertura} onChange={(e) => setConfig({ ...config, annoApertura: parseInt(e.target.value) })} min={2000} max={annoCorrente} />
            <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {anniAttivita < 5 ? `✓ Aliquota 5% (${5 - anniAttivita} anni rimasti)` : 'Aliquota 15%'}
            </div>
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="aliquota-override">Override Aliquota IRPEF</label>
            <input
              type="number"
              id="aliquota-override"
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
              placeholder="Automatico"
              min={0}
              max={100}
              step={0.01}
            />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="input-label">Codici ATECO</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input type="text" className="input-field" value={newAteco} onChange={(e) => setNewAteco(e.target.value)} placeholder="Es: 62.01.00" style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={addAteco} aria-label="Aggiungi codice ATECO"><Plus size={18} aria-hidden="true" /></button>
          </div>
          {config.codiciAteco.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {config.codiciAteco.map((code, i) => (
                <div key={i} className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {code}
                  <button
                    type="button"
                    aria-label={`Rimuovi codice ${code}`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', borderRadius: 4 }}
                    onClick={() => setConfig({ ...config, codiciAteco: config.codiciAteco.filter((_, j) => j !== i) })}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Coefficiente: <strong style={{ color: 'var(--accent-green)' }}>{coefficienteMedio}%</strong>
              </span>
            </div>
          ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aggiungi ATECO per coefficiente redditività</p>}
        </div>
      </div>

      {/* Dati Emittente per fatture XML */}
      <div className="card">
        <h2 className="card-title">Dati Emittente (per fatture XML)</h2>

        <div className="input-group">
          <label className="input-label" htmlFor="emittente-cf">Codice Fiscale</label>
          <input
            type="text"
            id="emittente-cf"
            className="input-field"
            value={config.emittente?.codiceFiscale || ''}
            onChange={(e) => setConfig({
              ...config,
              emittente: { ...config.emittente, codiceFiscale: e.target.value.toUpperCase() } as EmittenteConfig
            })}
            placeholder="RSSMRA85M01H501Z"
            maxLength={16}
            style={{ fontFamily: 'Space Mono' }}
          />
        </div>

        <div className="grid-2">
          <div className="input-group">
            <label className="input-label" htmlFor="emittente-nome">Nome</label>
            <input
              type="text"
              id="emittente-nome"
              className="input-field"
              value={config.emittente?.nome || ''}
              onChange={(e) => setConfig({
                ...config,
                emittente: { ...config.emittente, nome: e.target.value.toUpperCase() } as EmittenteConfig
              })}
              placeholder="MARIO"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="emittente-cognome">Cognome</label>
            <input
              type="text"
              id="emittente-cognome"
              className="input-field"
              value={config.emittente?.cognome || ''}
              onChange={(e) => setConfig({
                ...config,
                emittente: { ...config.emittente, cognome: e.target.value.toUpperCase() } as EmittenteConfig
              })}
              placeholder="ROSSI"
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="input-group">
            <label className="input-label" htmlFor="emittente-indirizzo">Indirizzo</label>
            <input
              type="text"
              id="emittente-indirizzo"
              className="input-field"
              value={config.emittente?.indirizzo || ''}
              onChange={(e) => setConfig({
                ...config,
                emittente: { ...config.emittente, indirizzo: e.target.value.toUpperCase() } as EmittenteConfig
              })}
              placeholder="VIA ROMA"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="emittente-civico">N. Civico</label>
            <input
              type="text"
              id="emittente-civico"
              className="input-field"
              value={config.emittente?.numeroCivico || ''}
              onChange={(e) => setConfig({
                ...config,
                emittente: { ...config.emittente, numeroCivico: e.target.value } as EmittenteConfig
              })}
              placeholder="1"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px', gap: 12 }}>
          <div className="input-group">
            <label className="input-label" htmlFor="emittente-cap">CAP</label>
            <input
              type="text"
              id="emittente-cap"
              className="input-field"
              value={config.emittente?.cap || ''}
              onChange={(e) => setConfig({
                ...config,
                emittente: { ...config.emittente, cap: e.target.value } as EmittenteConfig
              })}
              placeholder="00100"
              maxLength={5}
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="emittente-comune">Comune</label>
            <input
              type="text"
              id="emittente-comune"
              className="input-field"
              value={config.emittente?.comune || ''}
              onChange={(e) => setConfig({
                ...config,
                emittente: { ...config.emittente, comune: e.target.value.toUpperCase() } as EmittenteConfig
              })}
              placeholder="ROMA"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="emittente-provincia">Prov.</label>
            <input
              type="text"
              id="emittente-provincia"
              className="input-field"
              value={config.emittente?.provincia || ''}
              onChange={(e) => setConfig({
                ...config,
                emittente: { ...config.emittente, provincia: e.target.value.toUpperCase() } as EmittenteConfig
              })}
              placeholder="RM"
              maxLength={2}
            />
          </div>
        </div>
      </div>

      {/* Clienti */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title" style={{ margin: 0 }}>Clienti ({clienti.length})</h2>
          <button className="btn btn-primary" onClick={() => setShowModal('add-cliente')}><Plus size={18} aria-hidden="true" /> Aggiungi</button>
        </div>
        {clienti.length > 0 ? (
          <div className="table-wrapper" style={{ marginTop: 16 }}>
          <table className="table">
            <thead><tr><th scope="col">Nome</th><th scope="col">P.IVA</th><th scope="col">Email</th><th scope="col">Tariffa</th><th scope="col"></th></tr></thead>
            <tbody>
              {clienti.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: getClientDisplayColor(c), flexShrink: 0, display: 'inline-block' }} />
                      {c.nome}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'Space Mono' }}>{c.piva || '-'}</td>
                  <td>{c.email || '-'}</td>
                  <td>{c.rate && c.billingUnit ? `€${c.rate}/${c.billingUnit === 'ore' ? 'h' : 'gg'}` : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditingCliente({ ...c }); setShowModal('edit-cliente'); }} aria-label={`Modifica ${c.nome}`}><Edit size={16} aria-hidden="true" /></button>
                      <button className="btn btn-danger" onClick={() => removeCliente(c.id)} aria-label={`Elimina ${c.nome}`}><Trash2 size={16} aria-hidden="true" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : <div className="empty-state"><Users size={40} aria-hidden="true" /><p>Nessun cliente</p></div>}
      </div>

      {/* Aspetto */}
      <div className="card">
        <h2 className="card-title"><Palette size={16} aria-hidden="true" style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />Aspetto</h2>
        <ThemeSwitch />
      </div>
    </>
  );
}
