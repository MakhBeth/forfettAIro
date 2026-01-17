import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import type { Config, Cliente, Fattura, WorkLog, Toast } from '../types';
import { useDatabase } from '../hooks/useDatabase';
import { useToast } from '../hooks/useToast';
import { useConfig } from '../hooks/useConfig';
import { useClienti } from '../hooks/useClienti';
import { useFatture } from '../hooks/useFatture';
import { useWorkLogs } from '../hooks/useWorkLogs';

// Define the context value interface
interface AppContextValue {
  // Database
  dbReady: boolean;
  dbError: Error | null;

  // Toast
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error') => void;

  // Config
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  updateConfig: (updates: Partial<Config>) => void;

  // Clienti
  clienti: Cliente[];
  setClienti: React.Dispatch<React.SetStateAction<Cliente[]>>;
  addCliente: (cliente: Cliente) => Promise<void>;
  updateCliente: (cliente: Cliente) => Promise<void>;
  removeCliente: (id: string) => Promise<void>;

  // Fatture
  fatture: Fattura[];
  setFatture: React.Dispatch<React.SetStateAction<Fattura[]>>;
  addFattura: (fattura: Fattura) => Promise<void>;
  updateFattura: (fattura: Fattura) => Promise<void>;
  removeFattura: (id: string) => Promise<void>;

  // Work Logs
  workLogs: WorkLog[];
  setWorkLogs: React.Dispatch<React.SetStateAction<WorkLog[]>>;
  addWorkLog: (workLog: WorkLog) => Promise<void>;
  updateWorkLog: (workLog: WorkLog) => Promise<void>;
  removeWorkLog: (id: string) => Promise<void>;

  // Import/Export
  exportData: () => Promise<void>;
  importData: (data: Record<string, any[]>) => Promise<void>;
}

// Create the context
const AppContext = createContext<AppContextValue | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize hooks
  const { dbManager, dbReady, dbError } = useDatabase();
  const { toast, showToast } = useToast();
  const { config, setConfig, updateConfig } = useConfig(dbManager, dbReady);
  const { clienti, setClienti, addCliente, updateCliente, removeCliente } = useClienti(dbManager, dbReady);
  const { fatture, setFatture, addFattura, updateFattura, removeFattura } = useFatture(dbManager, dbReady);
  const { workLogs, setWorkLogs, addWorkLog, updateWorkLog, removeWorkLog } = useWorkLogs(dbManager, dbReady);

  // Export/Import handlers
  const exportData = useCallback(async () => {
    try {
      const data = await dbManager.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forfettario-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup esportato!');
    } catch (error) {
      showToast('Errore export', 'error');
      throw error;
    }
  }, [dbManager, showToast]);

  const importData = useCallback(async (data: Record<string, any[]>) => {
    try {
      await dbManager.importAll(data);

      // Reload all data from DB
      const [savedConfig, savedClienti, savedFatture, savedWorkLogs] = await Promise.all([
        dbManager.get('config', 'main'),
        dbManager.getAll('clienti'),
        dbManager.getAll('fatture'),
        dbManager.getAll('workLogs')
      ]);

      if (savedConfig) setConfig(savedConfig);
      setClienti(savedClienti || []);
      setFatture(savedFatture || []);
      setWorkLogs(savedWorkLogs || []);

      showToast('Dati importati!');
    } catch (error) {
      showToast('Errore import', 'error');
      throw error;
    }
  }, [dbManager, setConfig, setClienti, setFatture, setWorkLogs, showToast]);

  // Show error toast if database fails
  React.useEffect(() => {
    if (dbError) {
      showToast('Errore caricamento database', 'error');
    }
  }, [dbError, showToast]);

  const value: AppContextValue = {
    dbReady,
    dbError,
    toast,
    showToast,
    config,
    setConfig,
    updateConfig,
    clienti,
    setClienti,
    addCliente,
    updateCliente,
    removeCliente,
    fatture,
    setFatture,
    addFattura,
    updateFattura,
    removeFattura,
    workLogs,
    setWorkLogs,
    addWorkLog,
    updateWorkLog,
    removeWorkLog,
    exportData,
    importData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
