import type { GeneratedDoc } from "./types";
import { PDF_DB_NAME, PDF_STORE } from "./constants";
import { v4 as uuid } from "uuid";

function openPdfDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PDF_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains(PDF_STORE)) {
        d.createObjectStore(PDF_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Replaces any existing entry for (projectId, templateName), then inserts the new doc.
 * All ops run in one readwrite transaction — no async yield between delete and put.
 * See ADR-0003.
 */
export async function upsertGeneratedDoc(
  projectId: string,
  templateName: string,
  filename: string,
  bytes: Uint8Array
): Promise<GeneratedDoc> {
  const doc: GeneratedDoc = {
    id: uuid(),
    projectId,
    templateName,
    filename,
    bytes: Array.from(bytes),
    createdAt: new Date().toISOString(),
  };

  const db = await openPdfDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_STORE, "readwrite");
    const store = tx.objectStore(PDF_STORE);

    // Chain delete + put synchronously within the same transaction.
    const getAllReq = store.getAll();
    getAllReq.onsuccess = () => {
      const stale = (getAllReq.result as GeneratedDoc[]).filter(
        (d) => d.projectId === projectId && d.templateName === templateName
      );
      for (const old of stale) store.delete(old.id);
      store.put(doc);
    };

    tx.oncomplete = () => { db.close(); resolve(doc); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function getGeneratedDocs(
  projectId: string
): Promise<GeneratedDoc[]> {
  const db = await openPdfDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_STORE, "readonly");
    const req = tx.objectStore(PDF_STORE).getAll();
    req.onsuccess = () => {
      db.close();
      const list = (req.result as GeneratedDoc[])
        .filter((x) => x.projectId === projectId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      resolve(list);
    };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

export async function deleteGeneratedDoc(id: string): Promise<void> {
  const db = await openPdfDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_STORE, "readwrite");
    tx.objectStore(PDF_STORE).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
