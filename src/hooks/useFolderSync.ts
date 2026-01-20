import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isFileSystemAccessSupported,
  getStoredDirectoryHandle,
  verifyPermission,
  writeSyncFile,
  readSyncFile,
  getFolderName
} from '../lib/utils/fileSystemSync';
import type { IndexedDBManager } from '../lib/db/IndexedDBManager';

interface UseFolderSyncOptions {
  dbManager: IndexedDBManager;
  dbReady: boolean;
  onDataLoaded?: (data: Record<string, any[]>) => void;
}

interface UseFolderSyncReturn {
  syncFolderHandle: FileSystemDirectoryHandle | null;
  syncFolderName: string | null;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  isInitialLoadDone: boolean;
  syncToFolder: () => Promise<void>;
  setSyncFolderHandle: (handle: FileSystemDirectoryHandle | null) => void;
  setSyncFolderName: (name: string | null) => void;
  setLastSyncTime: (time: Date | null) => void;
}

export function useFolderSync({
  dbManager,
  dbReady,
  onDataLoaded
}: UseFolderSyncOptions): UseFolderSyncReturn {
  const [syncFolderHandle, setSyncFolderHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [syncFolderName, setSyncFolderName] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);

  // Use ref to prevent sync during initial load
  const isLoadingRef = useRef(false);
  // Debounce ref for auto-sync
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Store handle ref for focus reload
  const syncFolderHandleRef = useRef<FileSystemDirectoryHandle | null>(null);

  // Update ref when handle changes
  useEffect(() => {
    syncFolderHandleRef.current = syncFolderHandle;
  }, [syncFolderHandle]);

  // Load data from sync folder
  const loadFromSyncFolder = useCallback(async (handle?: FileSystemDirectoryHandle | null) => {
    const folderHandle = handle ?? syncFolderHandleRef.current;
    if (!folderHandle || isLoadingRef.current) return;

    isLoadingRef.current = true;
    try {
      const hasPermission = await verifyPermission(folderHandle);
      if (!hasPermission) {
        isLoadingRef.current = false;
        return;
      }

      const remoteData = await readSyncFile(folderHandle);
      if (remoteData && onDataLoaded) {
        await onDataLoaded(remoteData);
      }
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Error loading from sync folder:', err);
    } finally {
      isLoadingRef.current = false;
    }
  }, [onDataLoaded]);

  // Load from sync folder on startup
  useEffect(() => {
    if (!dbReady || !isFileSystemAccessSupported()) {
      setIsInitialLoadDone(true);
      return;
    }

    async function initSyncFolder() {
      isLoadingRef.current = true;

      try {
        const handle = await getStoredDirectoryHandle();
        if (!handle) {
          setIsInitialLoadDone(true);
          isLoadingRef.current = false;
          return;
        }

        const hasPermission = await verifyPermission(handle);
        if (!hasPermission) {
          setIsInitialLoadDone(true);
          isLoadingRef.current = false;
          return;
        }

        setSyncFolderHandle(handle);
        setSyncFolderName(getFolderName(handle));

        // Try to read data from sync folder
        const remoteData = await readSyncFile(handle);
        if (remoteData && onDataLoaded) {
          await onDataLoaded(remoteData);
        }

        setLastSyncTime(new Date());
      } catch (err) {
        console.error('Error loading from sync folder:', err);
      } finally {
        setIsInitialLoadDone(true);
        isLoadingRef.current = false;
      }
    }

    initSyncFolder();
  }, [dbReady, onDataLoaded]);

  // Reload from sync folder when window gains focus
  useEffect(() => {
    if (!isFileSystemAccessSupported()) return;

    const handleFocus = () => {
      if (syncFolderHandleRef.current && isInitialLoadDone) {
        loadFromSyncFolder();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isInitialLoadDone, loadFromSyncFolder]);

  // Sync to folder (debounced)
  const syncToFolder = useCallback(async () => {
    // Don't sync during initial load
    if (isLoadingRef.current || !syncFolderHandle || !dbReady) {
      return;
    }

    // Debounce: cancel previous timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Wait a bit before syncing to batch rapid changes
    syncTimeoutRef.current = setTimeout(async () => {
      setIsSyncing(true);
      try {
        const localData = await dbManager.exportAll();
        await writeSyncFile(syncFolderHandle, localData);
        setLastSyncTime(new Date());
      } catch (err: any) {
        console.error('Error syncing to folder:', err);
        // If permission denied, clear the handle
        if (err.name === 'NotAllowedError') {
          setSyncFolderHandle(null);
          setSyncFolderName(null);
        }
      } finally {
        setIsSyncing(false);
      }
    }, 500); // 500ms debounce
  }, [syncFolderHandle, dbReady, dbManager]);

  return {
    syncFolderHandle,
    syncFolderName,
    isSyncing,
    lastSyncTime,
    isInitialLoadDone,
    syncToFolder,
    setSyncFolderHandle,
    setSyncFolderName,
    setLastSyncTime
  };
}
