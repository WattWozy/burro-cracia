"use client";

import { useState, useEffect, useCallback } from "react";
import type { Bureau, Project } from "@/lib/types";
import {
  loadBureaus,
  saveBureaus,
  createDefaultBureau,
} from "@/lib/storage";
import { createNamedBureau, buildBureauDefaults } from "@/lib/utils/bureau";

export function useBureaus() {
  const [ready, setReady] = useState(false);
  const [bureaus, setBureaus] = useState<Bureau[]>([]);
  const [currentBureauId, setCurrentBureauId] = useState<string | null>(null);
  const [newBureauName, setNewBureauName] = useState("");

  // Initial load
  useEffect(() => {
    const { bureaus: loaded, currentId } = loadBureaus();
    let list = loaded;
    let id = currentId;

    if (!list.length) {
      const bureau = createDefaultBureau();
      list = [bureau];
      id = bureau.id;
      saveBureaus(list, id);
    }

    setBureaus(list);
    setCurrentBureauId(id);
    setReady(true);
  }, []);

  const currentBureau =
    bureaus.find((b) => b.id === currentBureauId) ?? null;

  const createBureau = useCallback(() => {
    const name = newBureauName.trim();
    if (!name) {
      alert("Escribe un nombre para el despacho.");
      return;
    }

    const bureau = createNamedBureau(name);
    const next = [...bureaus, bureau];

    setBureaus(next);
    setCurrentBureauId(bureau.id);
    saveBureaus(next, bureau.id);
    setNewBureauName("");
  }, [bureaus, newBureauName]);

  const updateBureau = useCallback(
    (updated: Bureau) => {
      const next = bureaus.map((b) =>
        b.id === updated.id ? updated : b
      );
      setBureaus(next);
      saveBureaus(next, currentBureauId);
    },
    [bureaus, currentBureauId]
  );

  const saveBureauDefaults = useCallback(
    (project: Project | null) => {
      if (!currentBureau || !project || !currentBureauId) return;

      if (
        !confirm(
          "¿Guardar los datos profesionales actuales como valores predeterminados del despacho?"
        )
      ) {
        return;
      }

      const defaults = buildBureauDefaults(project);
      const next = bureaus.map((b) =>
        b.id === currentBureauId ? { ...b, defaults } : b
      );

      setBureaus(next);
      saveBureaus(next, currentBureauId);
    },
    [bureaus, currentBureau, currentBureauId]
  );

  const selectBureau = useCallback(
    (id: string) => {
      setCurrentBureauId(id);
      saveBureaus(bureaus, id);
    },
    [bureaus]
  );

  return {
    ready,
    bureaus,
    currentBureau,
    currentBureauId,
    newBureauName,
    setNewBureauName,
    setCurrentBureauId: selectBureau,
    createBureau,
    updateBureau,
    saveBureauDefaults,
  };
}