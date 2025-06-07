import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'strategium-db';
const STORE_NAME = 'datasource';
const DB_VERSION = 1;

// Ouvre la base et crée le store si besoin
async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db: IDBPDatabase) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

// Stocke un bloc (clé = nom du bloc, ex: 'SM_translated')
export async function saveDatasourceBloc(key: string, data: any) {
  const db = await getDb();
  await db.put(STORE_NAME, data, key);
}

// Charge un bloc
export async function loadDatasourceBloc(key: string) {
  const db = await getDb();
  return db.get(STORE_NAME, key);
}

// Charge tout le datasource (toutes les clés)
export async function loadDatasourceAll() {
  const db = await getDb();
  const all: Record<string, any> = {};
  let cursor = await db.transaction(STORE_NAME).store.openCursor();
  while (cursor) {
    all[cursor.key as string] = cursor.value;
    cursor = await cursor.continue();
  }
  return all;
}

// Pour compatibilité : reconstitue tout le datasource
export async function loadDatasource() {
  return loadDatasourceAll();
}

// Vide tout le store
export async function clearDatasource() {
  const db = await getDb();
  await db.clear(STORE_NAME);
} 