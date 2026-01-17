import { useState, useEffect, useCallback } from 'react';
import type { Cliente } from '../types';
import type { IndexedDBManager } from '../lib/db/IndexedDBManager';

export function useClienti(dbManager: IndexedDBManager, dbReady: boolean) {
  const [clienti, setClienti] = useState<Cliente[]>([]);

  // Load clienti from DB on mount
  useEffect(() => {
    if (!dbReady) return;

    const loadClienti = async () => {
      try {
        const savedClienti = await dbManager.getAll('clienti');
        setClienti(savedClienti || []);
      } catch (error) {
        console.error('Errore caricamento clienti:', error);
      }
    };
    loadClienti();
  }, [dbManager, dbReady]);

  const addCliente = useCallback(async (cliente: Cliente) => {
    try {
      await dbManager.put('clienti', cliente);
      setClienti(prev => [...prev, cliente]);
    } catch (error) {
      console.error('Errore aggiunta cliente:', error);
      throw error;
    }
  }, [dbManager]);

  const updateCliente = useCallback(async (cliente: Cliente) => {
    try {
      await dbManager.put('clienti', cliente);
      setClienti(prev => prev.map(c => c.id === cliente.id ? cliente : c));
    } catch (error) {
      console.error('Errore aggiornamento cliente:', error);
      throw error;
    }
  }, [dbManager]);

  const removeCliente = useCallback(async (id: string) => {
    try {
      await dbManager.delete('clienti', id);
      setClienti(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Errore eliminazione cliente:', error);
      throw error;
    }
  }, [dbManager]);

  return { clienti, setClienti, addCliente, updateCliente, removeCliente };
}
