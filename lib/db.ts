import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface DownloadedResource {
  id: string;
  title: string;
  creator: string;
  type: string;
  downloadedAt: number;
  size: number;
  url: string;
  cacheKey: string;
  metadata: any;
}

interface DownloadProgress {
  id: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  error?: string;
}

interface LibraryDB extends DBSchema {
  downloads: {
    key: string;
    value: DownloadedResource;
    indexes: { 'by-type': string };
  };
  downloadProgress: {
    key: string;
    value: DownloadProgress;
  };
}

let dbPromise: Promise<IDBPDatabase<LibraryDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<LibraryDB>('library-offline', 1, {
      upgrade(db) {
        // Downloads store
        const downloadStore = db.createObjectStore('downloads', {
          keyPath: 'id',
        });
        downloadStore.createIndex('by-type', 'type');

        // Progress store
        db.createObjectStore('downloadProgress', {
          keyPath: 'id',
        });
      },
    });
  }
  return dbPromise;
}

export async function addDownload(resource: DownloadedResource) {
  const db = await getDB();
  return db.put('downloads', resource);
}

export async function getDownload(id: string) {
  const db = await getDB();
  return db.get('downloads', id);
}

export async function getAllDownloads() {
  const db = await getDB();
  return db.getAll('downloads');
}

export async function deleteDownload(id: string) {
  const db = await getDB();
  return db.delete('downloads', id);
}

export async function updateProgress(id: string, progress: DownloadProgress) {
  const db = await getDB();
  return db.put('downloadProgress', progress);
}

export async function getProgress(id: string) {
  const db = await getDB();
  return db.get('downloadProgress', id);
}

export async function deleteProgress(id: string) {
  const db = await getDB();
  return db.delete('downloadProgress', id);
}