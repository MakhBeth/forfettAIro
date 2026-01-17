import { useState, useEffect, useCallback } from 'react';
import type { Fattura } from '../types';
import type { IndexedDBManager } from '../lib/db/IndexedDBManager';

export function useFatture(dbManager: IndexedDBManager, dbReady: boolean) {
  const [fatture, setFatture] = useState<Fattura[]>([]);

  // Load fatture from DB on mount
  useEffect(() => {
    if (!dbReady) return;

    const loadFatture = async () => {
      try {
        const savedFatture = await dbManager.getAll('fatture');
        setFatture(savedFatture || []);
      } catch (error) {
        console.error('Errore caricamento fatture:', error);
      }
    };
    loadFatture();
  }, [dbManager, dbReady]);

  const addFattura = useCallback(async (fattura: Fattura) => {
    try {
      await dbManager.put('fatture', fattura);
      setFatture(prev => [...prev, fattura]);
    } catch (error) {
      console.error('Errore aggiunta fattura:', error);
      throw error;
    }
  }, [dbManager]);

  const updateFattura = useCallback(async (fattura: Fattura) => {
    try {
      await dbManager.put('fatture', fattura);
      setFatture(prev => prev.map(f => f.id === fattura.id ? fattura : f));
    } catch (error) {
      console.error('Errore aggiornamento fattura:', error);
      throw error;
    }
  }, [dbManager]);

  const removeFattura = useCallback(async (id: string) => {
    try {
      await dbManager.delete('fatture', id);
      setFatture(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Errore eliminazione fattura:', error);
      throw error;
    }
  }, [dbManager]);

  return { fatture, setFatture, addFattura, updateFattura, removeFattura };
}
