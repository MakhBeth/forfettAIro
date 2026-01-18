import { useState } from 'react';
import { Download, Upload, Database, Plus, X, Edit, Trash2, Users, FileText, Palette } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Cliente, CourtesyInvoiceConfig } from '../../types';
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

      <CourtesyInvoiceSettings
        config={config}
        setConfig={setConfig}
        setShowModal={setShowModal}
      />
    </>
  );
}

// Courtesy Invoice Settings Component
function CourtesyInvoiceSettings({
  config,
  setConfig,
  setShowModal
}: Pick<ImpostazioniProps, 'setShowModal'> & {
  config: ReturnType<typeof useApp>['config'];
  setConfig: ReturnType<typeof useApp>['setConfig'];
}) {
  const courtesyConfig = config.courtesyInvoice || {
    primaryColor: '#6699cc',
    textColor: '#033243',
    companyName: '',
    vatNumber: '',
    country: 'IT',
    defaultServices: [],
    includeFooter: true,
    locale: 'it'
  };

  const updateCourtesyConfig = (updates: Partial<CourtesyInvoiceConfig>) => {
    setConfig({
      ...config,
      courtesyInvoice: {
        ...courtesyConfig,
        ...updates
      }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      alert('Immagine troppo grande (max 500KB)');
      return;
    }

    // Validate file type
    if (!file.type.match(/^image\/(png|jpeg)$/)) {
      alert('Formato non supportato (solo PNG/JPG)');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      updateCourtesyConfig({
        logoBase64: event.target?.result as string,
        logoMimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    updateCourtesyConfig({
      logoBase64: undefined,
      logoMimeType: undefined
    });
  };

  return (
    <div className="card">
      <div className="card-title">
        <FileText size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
        Fatture di Cortesia
      </div>

      <div className="grid-2">
        <div className="input-group">
          <label className="input-label">Ragione Sociale *</label>
          <input
            type="text"
            className="input-field"
            value={courtesyConfig.companyName || ''}
            onChange={(e) => updateCourtesyConfig({ companyName: e.target.value })}
            placeholder="Es: Mario Rossi - Consulente IT"
          />
        </div>
        <div className="input-group">
          <label className="input-label">Partita IVA *</label>
          <input
            type="text"
            className="input-field"
            value={courtesyConfig.vatNumber || ''}
            onChange={(e) => updateCourtesyConfig({ vatNumber: e.target.value })}
            placeholder="12345678901"
            maxLength={11}
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="input-group">
          <label className="input-label">Indirizzo</label>
          <input
            type="text"
            className="input-field"
            value={courtesyConfig.address || ''}
            onChange={(e) => updateCourtesyConfig({ address: e.target.value })}
            placeholder="Via Roma 123"
          />
        </div>
        <div className="input-group">
          <label className="input-label">CAP</label>
          <input
            type="text"
            className="input-field"
            value={courtesyConfig.postalCode || ''}
            onChange={(e) => updateCourtesyConfig({ postalCode: e.target.value })}
            placeholder="00100"
            maxLength={5}
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="input-group">
          <label className="input-label">Città</label>
          <input
            type="text"
            className="input-field"
            value={courtesyConfig.city || ''}
            onChange={(e) => updateCourtesyConfig({ city: e.target.value })}
            placeholder="Roma"
          />
        </div>
        <div className="input-group">
          <label className="input-label">Provincia</label>
          <input
            type="text"
            className="input-field"
            value={courtesyConfig.province || ''}
            onChange={(e) => updateCourtesyConfig({ province: e.target.value })}
            placeholder="RM"
            maxLength={2}
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="input-group">
          <label className="input-label">Telefono</label>
          <input
            type="text"
            className="input-field"
            value={courtesyConfig.phone || ''}
            onChange={(e) => updateCourtesyConfig({ phone: e.target.value })}
            placeholder="+39 06 1234567"
          />
        </div>
        <div className="input-group">
          <label className="input-label">Email</label>
          <input
            type="email"
            className="input-field"
            value={courtesyConfig.email || ''}
            onChange={(e) => updateCourtesyConfig({ email: e.target.value })}
            placeholder="mario@esempio.it"
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="input-group">
          <label className="input-label">IBAN</label>
          <input
            type="text"
            className="input-field"
            value={courtesyConfig.iban || ''}
            onChange={(e) => updateCourtesyConfig({ iban: e.target.value })}
            placeholder="IT60X0542811101000000123456"
          />
        </div>
        <div className="input-group">
          <label className="input-label">Banca</label>
          <input
            type="text"
            className="input-field"
            value={courtesyConfig.bankName || ''}
            onChange={(e) => updateCourtesyConfig({ bankName: e.target.value })}
            placeholder="Nome della banca"
          />
        </div>
      </div>

      <div style={{ marginTop: 24, marginBottom: 16 }}>
        <div className="card-title" style={{ fontSize: '0.95rem' }}>
          <Palette size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
          Personalizzazione
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Logo Aziendale (PNG/JPG, max 500KB)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleLogoUpload}
            style={{ flex: 1 }}
          />
          {courtesyConfig.logoBase64 && (
            <button className="btn btn-danger btn-sm" onClick={removeLogo}>
              <X size={14} /> Rimuovi
            </button>
          )}
        </div>
        {courtesyConfig.logoBase64 && (
          <img
            src={courtesyConfig.logoBase64}
            style={{ width: 80, height: 80, marginTop: 12, borderRadius: 8, objectFit: 'contain', background: '#f0f0f0' }}
            alt="Logo preview"
          />
        )}
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="input-group">
          <label className="input-label">Colore Primario</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="color"
              value={courtesyConfig.primaryColor || '#6699cc'}
              onChange={(e) => updateCourtesyConfig({ primaryColor: e.target.value })}
              style={{ width: 50, height: 40, padding: 0, border: 'none', cursor: 'pointer' }}
            />
            <input
              type="text"
              className="input-field"
              value={courtesyConfig.primaryColor || '#6699cc'}
              onChange={(e) => updateCourtesyConfig({ primaryColor: e.target.value })}
              style={{ flex: 1 }}
            />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Colore Testo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="color"
              value={courtesyConfig.textColor || '#033243'}
              onChange={(e) => updateCourtesyConfig({ textColor: e.target.value })}
              style={{ width: 50, height: 40, padding: 0, border: 'none', cursor: 'pointer' }}
            />
            <input
              type="text"
              className="input-field"
              value={courtesyConfig.textColor || '#033243'}
              onChange={(e) => updateCourtesyConfig({ textColor: e.target.value })}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="input-group">
          <label className="input-label">Lingua</label>
          <select
            className="input-field"
            value={courtesyConfig.locale || 'it'}
            onChange={(e) => updateCourtesyConfig({ locale: e.target.value })}
          >
            <option value="it">Italiano</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Mostra Footer</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <input
              type="checkbox"
              checked={courtesyConfig.includeFooter !== false}
              onChange={(e) => updateCourtesyConfig({ includeFooter: e.target.checked })}
              style={{ width: 20, height: 20 }}
            />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              "Generato con ForfettAIro"
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          className="btn btn-secondary"
          onClick={() => setShowModal('manage-services')}
        >
          <Edit size={18} /> Gestisci Servizi Predefiniti ({courtesyConfig.defaultServices?.length || 0})
        </button>
      </div>
    </div>
  );
}
