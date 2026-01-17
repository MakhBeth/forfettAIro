import { useState, useEffect, useCallback } from 'react';
import type { WorkLog } from '../types';
import type { IndexedDBManager } from '../lib/db/IndexedDBManager';

export function useWorkLogs(dbManager: IndexedDBManager, dbReady: boolean) {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);

  // Load work logs from DB on mount
  useEffect(() => {
    if (!dbReady) return;

    const loadWorkLogs = async () => {
      try {
        const savedWorkLogs = await dbManager.getAll('workLogs');
        setWorkLogs(savedWorkLogs || []);
      } catch (error) {
        console.error('Errore caricamento work logs:', error);
      }
    };
    loadWorkLogs();
  }, [dbManager, dbReady]);

  const addWorkLog = useCallback(async (workLog: WorkLog) => {
    try {
      await dbManager.put('workLogs', workLog);
      setWorkLogs(prev => [...prev, workLog]);
    } catch (error) {
      console.error('Errore aggiunta work log:', error);
      throw error;
    }
  }, [dbManager]);

  const updateWorkLog = useCallback(async (workLog: WorkLog) => {
    try {
      await dbManager.put('workLogs', workLog);
      setWorkLogs(prev => prev.map(w => w.id === workLog.id ? workLog : w));
    } catch (error) {
      console.error('Errore aggiornamento work log:', error);
      throw error;
    }
  }, [dbManager]);

  const removeWorkLog = useCallback(async (id: string) => {
    try {
      await dbManager.delete('workLogs', id);
      setWorkLogs(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error('Errore eliminazione work log:', error);
      throw error;
    }
  }, [dbManager]);

  return { workLogs, setWorkLogs, addWorkLog, updateWorkLog, removeWorkLog };
}
