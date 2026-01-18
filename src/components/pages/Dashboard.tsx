import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Clock, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LIMITE_FATTURATO, INPS_GESTIONE_SEPARATA, ALIQUOTA_RIDOTTA, ALIQUOTA_STANDARD, MAX_HISTORICAL_YEARS, COEFFICIENTI_ATECO } from '../../lib/constants/fiscali';
import { getWorkLogQuantita } from '../../lib/utils/calculations';

interface DashboardProps {
  annoSelezionato: number;
  setAnnoSelezionato: (anno: number) => void;
}

export function Dashboard({ annoSelezionato, setAnnoSelezionato }: DashboardProps) {
  const { config, clienti, fatture, workLogs } = useApp();

  // Calcoli
  const annoCorrente = new Date().getFullYear();
  const anniAttivita = annoCorrente - config.annoApertura;
  const aliquotaIrpefBase = anniAttivita < 5 ? ALIQUOTA_RIDOTTA : ALIQUOTA_STANDARD;
  const aliquotaIrpef = (config.aliquotaOverride !== null && config.aliquotaOverride >= 0 && config.aliquotaOverride <= 100)
    ? config.aliquotaOverride / 100
    : aliquotaIrpefBase;
  const annoPiuVecchio = annoCorrente - MAX_HISTORICAL_YEARS + 1;

  const fattureAnnoCorrente = fatture.filter(f => {
    const dataRiferimento = f.dataIncasso || f.data;
    return new Date(dataRiferimento).getFullYear() === annoSelezionato;
  });
  const totaleFatturato = fattureAnnoCorrente.reduce((sum, f) => sum + f.importo, 0);
  const percentualeLimite = (totaleFatturato / LIMITE_FATTURATO) * 100;
  const rimanenteLimite = LIMITE_FATTURATO - totaleFatturato;

  const coefficienteMedio = config.codiciAteco.length > 0
    ? config.codiciAteco.reduce((sum, code) => {
        const prefix = code.substring(0, 2);
        return sum + (COEFFICIENTI_ATECO[prefix] || COEFFICIENTI_ATECO.default);
      }, 0) / config.codiciAteco.length
    : 78;

  const redditoImponibile = totaleFatturato * (coefficienteMedio / 100);
  const irpefDovuta = redditoImponibile * aliquotaIrpef;
  const inpsDovuta = redditoImponibile * INPS_GESTIONE_SEPARATA;
  const totaleTasse = irpefDovuta + inpsDovuta;

  const fatturatoPerCliente = clienti.map(cliente => {
    const fattureCliente = fattureAnnoCorrente.filter(f => f.clienteId === cliente.id);
    return { ...cliente, totale: fattureCliente.reduce((sum, f) => sum + f.importo, 0), count: fattureCliente.length };
  }).sort((a, b) => b.totale - a.totale);

  const orePerCliente = clienti.map(cliente => {
    const logs = workLogs.filter(w => w.clienteId === cliente.id);
    return { ...cliente, totaleOre: logs.reduce((sum, w) => sum + getWorkLogQuantita(w), 0) };
  }).filter(c => c.totaleOre > 0).sort((a, b) => b.totaleOre - a.totaleOre);

  // Grafici
  const pieData = fatturatoPerCliente.slice(0, 5).map((c, i) => ({
    name: c.nome, value: c.totale, color: ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7'][i]
  }));

  const mesiData = Array.from({ length: 12 }, (_, i) => ({
    mese: new Date(annoSelezionato, i, 1).toLocaleString('it-IT', { month: 'short' }),
    totale: fatture.filter(f => {
      const dataRiferimento = f.dataIncasso || f.data;
      const d = new Date(dataRiferimento);
      return d.getMonth() === i && d.getFullYear() === annoSelezionato;
    }).reduce((sum, f) => sum + f.importo, 0)
  }));

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Dashboard {annoSelezionato}</h1>
          <p className="page-subtitle">Panoramica della tua attività</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn"
            onClick={() => setAnnoSelezionato(annoSelezionato - 1)}
            disabled={annoSelezionato <= annoPiuVecchio}
            style={{ padding: '8px 12px' }}
            aria-label="Anno precedente"
          >
            ←
          </button>
          <select
            className="input-field"
            value={annoSelezionato}
            onChange={(e) => setAnnoSelezionato(parseInt(e.target.value))}
            style={{ width: 'auto', padding: '8px 12px', fontSize: '1rem', fontWeight: 600 }}
            aria-label="Seleziona anno"
          >
            {Array.from({ length: annoCorrente - annoPiuVecchio + 1 }, (_, i) => {
              const year = annoCorrente - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
          <button
            className="btn"
            onClick={() => setAnnoSelezionato(annoSelezionato + 1)}
            disabled={annoSelezionato >= annoCorrente}
            style={{ padding: '8px 12px' }}
            aria-label="Anno successivo"
          >
            →
          </button>
        </div>
      </div>

      {annoSelezionato < annoCorrente && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#fbbf24'
        }}>
          <Clock size={18} aria-hidden="true" />
          <span style={{ fontWeight: 500 }}>Stai visualizzando dati storici dell'anno {annoSelezionato}</span>
        </div>
      )}

      <div className="grid-4">
        <div className="card">
          <h2 className="card-title">Fatturato Anno</h2>
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>€{totaleFatturato.toLocaleString('it-IT')}</div>
          <div className="stat-label">{fattureAnnoCorrente.length} fatture incassate</div>
        </div>

        <div className="card">
          <h2 className="card-title">Al Limite (85k)</h2>
          <div className="stat-value" style={{ color: percentualeLimite > 90 ? 'var(--accent-red)' : percentualeLimite > 70 ? 'var(--accent-orange)' : 'var(--accent-primary)' }}>
            {percentualeLimite.toFixed(1)}%
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(percentualeLimite, 100)}%`, background: percentualeLimite > 90 ? 'var(--accent-red)' : percentualeLimite > 70 ? 'var(--accent-orange)' : 'var(--accent-green)' }} />
          </div>
          <div className="stat-label">Rimangono €{rimanenteLimite.toLocaleString('it-IT')}</div>
        </div>

        <div className="card">
          <h2 className="card-title">IRPEF da accantonare</h2>
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>€{irpefDovuta.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">
            Aliquota {(aliquotaIrpef * 100).toFixed(2)}%
            {config.aliquotaOverride !== null && ' (custom)'}
            {config.aliquotaOverride === null && anniAttivita < 5 && ' (agevolato)'}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">INPS da accantonare</h2>
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>€{inpsDovuta.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">Gestione Separata 26.07%</div>
        </div>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(4,120,87,0.1) 100%)' }}>
        <div className="grid-3" style={{ alignItems: 'center' }}>
          <div>
            <h2 className="card-title">Totale da Accantonare</h2>
            <div className="stat-value" style={{ fontSize: '2.8rem' }}>€{totaleTasse.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</div>
            <div className="stat-label">Reddito imponibile €{redditoImponibile.toLocaleString('it-IT', { maximumFractionDigits: 0 })} (coeff. {coefficienteMedio}%)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            {percentualeLimite > 90 && (
              <div style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <AlertTriangle size={24} aria-hidden="true" />
                <span style={{ fontWeight: 600 }}>Vicino al limite!</span>
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Netto stimato</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-green)' }}>
              €{(totaleFatturato - totaleTasse).toLocaleString('it-IT', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="card-title">Fatturato per Cliente</h2>
          {pieData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {pieData.filter(d => d.value > 0).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `€${v.toLocaleString('it-IT')}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><Users size={40} aria-hidden="true" /><p>Nessuna fattura</p></div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">Andamento Mensile</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mesiData}>
              <XAxis dataKey="mese" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip formatter={(v) => `€${v.toLocaleString('it-IT')}`} />
              <Bar dataKey="totale" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {orePerCliente.length > 0 && (
        <div className="card">
          <h2 className="card-title">Ore Lavorate per Cliente</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={orePerCliente.slice(0, 5)} layout="vertical">
              <XAxis type="number" stroke="var(--text-muted)" />
              <YAxis type="category" dataKey="nome" stroke="var(--text-muted)" width={100} />
              <Tooltip formatter={(v) => `${v} ore`} />
              <Bar dataKey="totaleOre" fill="var(--accent-secondary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
