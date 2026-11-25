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

export async function saveGeneratedDoc(
  projectId: string,
  templateName: string,
  filename: string,
  bytes: Uint8Array
): Promise<void> {
  const d = await openPdfDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(PDF_STORE, "readwrite");
    tx.objectStore(PDF_STORE).put({
      id: uuid(),
      projectId,
      templateName,
      filename,
      bytes: Array.from(bytes),
      createdAt: new Date().toISOString(),
    } as GeneratedDoc);
    tx.oncomplete = () => {
      d.close();
      resolve();
    };
    tx.onerror = () => {
      d.close();
      reject(tx.error);
    };
  });
}

export async function getGeneratedDocs(
  projectId: string
): Promise<GeneratedDoc[]> {
  const d = await openPdfDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(PDF_STORE, "readonly");
    const req = tx.objectStore(PDF_STORE).getAll();
    req.onsuccess = () => {
      d.close();
      const list = (req.result as GeneratedDoc[])
        .filter((x) => x.projectId === projectId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      resolve(list);
    };
    req.onerror = () => {
      d.close();
      reject(req.error);
    };
  });
}

export async function deleteGeneratedDoc(id: string): Promise<void> {
  const d = await openPdfDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(PDF_STORE, "readwrite");
    tx.objectStore(PDF_STORE).delete(id);
    tx.oncomplete = () => {
      d.close();
      resolve();
    };
    tx.onerror = () => {
      d.close();
      reject(tx.error);
    };
  });
}
