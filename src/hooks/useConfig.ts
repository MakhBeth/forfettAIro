import { useState, useEffect, useCallback } from 'react';
import type { Config } from '../types';
import { DEFAULT_CONFIG } from '../lib/constants/fiscali';
import type { IndexedDBManager } from '../lib/db/IndexedDBManager';

export function useConfig(dbManager: IndexedDBManager, dbReady: boolean) {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  // Load config from DB on mount
  useEffect(() => {
    if (!dbReady) return;

    const loadConfig = async () => {
      try {
        const savedConfig = await dbManager.get('config', 'main');
        if (savedConfig) {
          setConfig(savedConfig);
        }
      } catch (error) {
        console.error('Errore caricamento config:', error);
      }
    };
    loadConfig();
  }, [dbManager, dbReady]);

  // Save config to DB whenever it changes
  useEffect(() => {
    if (!dbReady) return;

    const saveConfig = async () => {
      try {
        await dbManager.put('config', config);
      } catch (error) {
        console.error('Errore salvataggio config:', error);
      }
    };
    saveConfig();
  }, [config, dbManager, dbReady]);

  const updateConfig = useCallback((updates: Partial<Config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  return { config, setConfig, updateConfig };
}
