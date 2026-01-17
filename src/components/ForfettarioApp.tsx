import { useState } from 'react';
import { Settings, FileText, LayoutDashboard, Calendar, Download, Upload, Github } from 'lucide-react';
import { AppProvider, useApp } from '../context/AppContext';
import { Dashboard } from './pages/Dashboard';
import { FatturePage } from './pages/Fatture';
import { Calendario } from './pages/Calendario';
import { Impostazioni } from './pages/Impostazioni';
import { UploadFatturaModal } from './modals/UploadFatturaModal';
import { BatchUploadModal } from './modals/BatchUploadModal';
import { UploadZipModal } from './modals/UploadZipModal';
import { ImportSummaryModal } from './modals/ImportSummaryModal';
import { AddClienteModal } from './modals/AddClienteModal';
import { EditClienteModal } from './modals/EditClienteModal';
import { AddWorkLogModal } from './modals/AddWorkLogModal';
import { ImportBackupModal } from './modals/ImportBackupModal';
import { EditDataIncassoModal } from './modals/EditDataIncassoModal';
import { Toast } from './shared/Toast';
import { parseFatturaXML, extractXmlFromZip } from '../lib/utils/xmlParsing';
import { processBatchXmlFiles } from '../lib/utils/batchImport';
import type { Cliente, Fattura, ImportSummary, WorkLog } from '../types';
import '../styles/theme.css';

function ForfettarioAppInner() {
  const { toast, exportData, importData, clienti, fatture, showToast, addCliente, addFattura, setClienti, setFatture } = useApp();

  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [annoSelezionato, setAnnoSelezionato] = useState<number>(new Date().getFullYear());

  const [newCliente, setNewCliente] = useState<Partial<Cliente>>({ nome: '', piva: '', email: '' });
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [editingFattura, setEditingFattura] = useState<Fattura | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [newWorkLog, setNewWorkLog] = useState<Partial<WorkLog>>({ clienteId: '', quantita: undefined, tipo: 'ore', note: '' });

  // Upload handlers
  const handleFatturaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parseFatturaXML(text);
    if (parsed) {
      let clienteId = clienti.find(c => c.piva === parsed.clientePiva)?.id;
      if (!clienteId && parsed.clienteNome) {
        const nuovoCliente = { id: Date.now().toString(), nome: parsed.clienteNome, piva: parsed.clientePiva || '', email: '' };
        await addCliente(nuovoCliente);
        clienteId = nuovoCliente.id;
      }

      const nuovaFattura = {
        id: Date.now().toString(),
        numero: parsed.numero,
        importo: parsed.importo,
        data: parsed.data,
        dataIncasso: parsed.dataIncasso,
        clienteId: clienteId || '',
        clienteNome: parsed.clienteNome,
        duplicateKey: `${parsed.numero}-${parsed.data}-${parsed.importo}`
      };
      await addFattura(nuovaFattura);
      setShowModal(null);
      showToast('Fattura caricata!');
    } else {
      showToast('Errore parsing XML', 'error');
    }
  };

  const handleBatchUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const xmlFiles: Array<{ name: string; content: string }> = [];
    for (let i = 0; i < files.length; i++) {
      const content = await files[i].text();
      xmlFiles.push({ name: files[i].name, content });
    }

    const { summary, newFatture, newClienti } = await processBatchXmlFiles(
      xmlFiles,
      fatture,
      clienti,
      parseFatturaXML,
      null as any
    );

    if (newClienti.length > 0) setClienti([...clienti, ...newClienti]);
    if (newFatture.length > 0) setFatture([...fatture, ...newFatture]);

    setShowModal('import-summary');
    setImportSummary(summary);
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const xmlFiles = await extractXmlFromZip(file);
      if (xmlFiles.length === 0) {
        showToast('Nessun file XML trovato nel ZIP', 'error');
        return;
      }

      const { summary, newFatture, newClienti } = await processBatchXmlFiles(
        xmlFiles,
        fatture,
        clienti,
        parseFatturaXML,
        null as any
      );

      if (newClienti.length > 0) setClienti([...clienti, ...newClienti]);
      if (newFatture.length > 0) setFatture([...fatture, ...newFatture]);

      setShowModal('import-summary');
      setImportSummary(summary);
    } catch (error: any) {
      showToast('Errore caricamento ZIP: ' + (error?.message || 'errore sconosciuto'), 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importData(data);
      setShowModal(null);
    } catch (error) {
      showToast('Errore import', 'error');
    }
  };

  return (
    <>
      <div className="app-container">
        <nav className="sidebar">
          <div className="logo">ForfettAIro</div>
          <div className="logo-sub">Vibecoded Gestione P.IVA Semplificata</div>

          <div className="nav-items">
            <div className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
              <LayoutDashboard size={20} /> Dashboard
            </div>
            <div className={`nav-item ${currentPage === 'fatture' ? 'active' : ''}`} onClick={() => setCurrentPage('fatture')}>
              <FileText size={20} /> Fatture
            </div>
            <div className={`nav-item ${currentPage === 'calendario' ? 'active' : ''}`} onClick={() => setCurrentPage('calendario')}>
              <Calendar size={20} /> Calendario
            </div>
            <div className={`nav-item ${currentPage === 'impostazioni' ? 'active' : ''}`} onClick={() => setCurrentPage('impostazioni')}>
              <Settings size={20} /> Impostazioni
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={exportData}>
              <Download size={16} /> Export
            </button>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setShowModal('import')}>
              <Upload size={16} /> Import
            </button>
          </div>

          <div className="footer">
            <div className="footer-credits">
              Made by <a href="https://github.com/MakhBeth" target="_blank" rel="noopener noreferrer">MakhBeth</a> with AI
            </div>
            <div className="footer-privacy">
              🔒 All data stays local
            </div>
            <div className="footer-link">
              <a href="https://github.com/MakhBeth/forfettAIro" target="_blank" rel="noopener noreferrer">
                <Github size={16} /> View on GitHub
              </a>
            </div>
          </div>
        </nav>

        <main className="main-content">
          {currentPage === 'dashboard' && (
            <Dashboard
              annoSelezionato={annoSelezionato}
              setAnnoSelezionato={setAnnoSelezionato}
            />
          )}

          {currentPage === 'fatture' && (
            <FatturePage
              setShowModal={setShowModal}
              setEditingFattura={setEditingFattura}
            />
          )}

          {currentPage === 'calendario' && (
            <Calendario
              setShowModal={setShowModal}
              setSelectedDate={setSelectedDate}
            />
          )}

          {currentPage === 'impostazioni' && (
            <Impostazioni
              setShowModal={setShowModal}
              setEditingCliente={setEditingCliente}
              handleExport={exportData}
            />
          )}
        </main>

        {/* MODALS */}
        <UploadFatturaModal
          isOpen={showModal === 'upload-fattura'}
          onClose={() => setShowModal(null)}
          onUpload={handleFatturaUpload}
        />

        <BatchUploadModal
          isOpen={showModal === 'batch-upload-fattura'}
          onClose={() => setShowModal(null)}
          onUpload={handleBatchUpload}
        />

        <UploadZipModal
          isOpen={showModal === 'upload-zip'}
          onClose={() => setShowModal(null)}
          onUpload={handleZipUpload}
        />

        <ImportSummaryModal
          isOpen={showModal === 'import-summary'}
          onClose={() => setShowModal(null)}
          summary={importSummary}
        />

        <AddClienteModal
          isOpen={showModal === 'add-cliente'}
          onClose={() => setShowModal(null)}
          newCliente={newCliente}
          setNewCliente={setNewCliente}
          onAdd={() => setNewCliente({ nome: '', piva: '', email: '' })}
        />

        <EditClienteModal
          isOpen={showModal === 'edit-cliente'}
          onClose={() => setShowModal(null)}
          cliente={editingCliente}
          setCliente={setEditingCliente}
          onUpdate={() => setShowModal(null)}
        />

        <AddWorkLogModal
          isOpen={showModal === 'add-work'}
          onClose={() => setShowModal(null)}
          selectedDate={selectedDate}
          newWorkLog={newWorkLog}
          setNewWorkLog={setNewWorkLog}
          clienti={clienti}
          onAdd={() => {
            setNewWorkLog({ clienteId: '', quantita: undefined, tipo: 'ore', note: '' });
            setShowModal(null);
          }}
        />

        <ImportBackupModal
          isOpen={showModal === 'import'}
          onClose={() => setShowModal(null)}
          onImport={handleImport}
        />

        <EditDataIncassoModal
          isOpen={showModal === 'edit-data-incasso'}
          onClose={() => setShowModal(null)}
          fattura={editingFattura}
          setFattura={setEditingFattura}
          onUpdate={() => setShowModal(null)}
        />

        {toast && <Toast toast={toast} />}
      </div>
    </>
  );
}

export default function ForfettarioApp() {
  return (
    <AppProvider>
      <ForfettarioAppInner />
    </AppProvider>
  );
}
