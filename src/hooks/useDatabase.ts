import { useState, useEffect } from 'react';
import { dbManager } from '../lib/db/IndexedDBManager';

export function useDatabase() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        await dbManager.init();
        setDbReady(true);
      } catch (error) {
        console.error('Errore inizializzazione DB:', error);
        setDbError(error as Error);
      }
    };
    initDB();
  }, []);

  return { dbManager, dbReady, dbError };
}
