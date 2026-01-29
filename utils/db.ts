import { openDB, DBSchema } from 'idb';

interface SyncDB extends DBSchema {
  'sync-queue': {
    key: number;
    value: {
      action: string;
      payload: any;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

const dbPromise = openDB<SyncDB>('stocklink-db', 1, {
  upgrade(db) {
    const store = db.createObjectStore('sync-queue', {
      keyPath: 'id',
      autoIncrement: true,
    });
    store.createIndex('by-timestamp', 'timestamp');
  },
}).catch(err => {
    console.warn("Grid Storage Link (IndexedDB) Restricted. Offline protocol isolated.", err);
    return null;
});

export const addToSyncQueue = async (action: string, payload: any) => {
  const db = await dbPromise;
  if (!db) return;
  await db.add('sync-queue', {
    action,
    payload,
    timestamp: Date.now(),
  });
};

export const getAllFromSyncQueue = async () => {
    const db = await dbPromise;
    if (!db) return [];
    return await db.getAllFromIndex('sync-queue', 'by-timestamp');
};

export const deleteFromSyncQueue = async (id: number) => {
    const db = await dbPromise;
    if (!db) return;
    await db.delete('sync-queue', id);
};