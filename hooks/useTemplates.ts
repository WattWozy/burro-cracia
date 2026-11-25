"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Template } from "@/lib/types";
import { BUILTIN_TEMPLATES } from "@/lib/constants";
import { loadTemplates, saveTemplates } from "@/lib/storage";
import { createCustomTemplate } from "@/lib/utils/template";

export function useTemplates(bureauId: string | null) {
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [configTemplateId, setConfigTemplateId] = useState<string | null>(null);

  // Load templates whenever the bureau changes
  useEffect(() => {
    if (!bureauId) {
      setCustomTemplates([]);
      return;
    }
    setCustomTemplates(loadTemplates(bureauId));
  }, [bureauId]);

  const allTemplates = useMemo(
    () => [...BUILTIN_TEMPLATES, ...customTemplates],
    [customTemplates]
  );

  const persist = useCallback(
    (next: Template[]) => {
      if (!bureauId) return;
      setCustomTemplates(next);
      saveTemplates(bureauId, next);
    },
    [bureauId]
  );

  const addCustomTemplate = useCallback(
    async (file: File | null, nameInput: string) => {
      if (!file) {
        alert("Selecciona un PDF.");
        return;
      }

      try {
        const template = await createCustomTemplate(file, nameInput);
        persist([...customTemplates, template]);
        setConfigTemplateId(template.id);
        alert(
          "PDF incorporado. Ahora relaciona sus campos con los datos de la obra."
        );
      } catch (error: unknown) {
        const err = error as Error;
        alert(
          err.message.includes("campos de formulario")
            ? err.message
            : "No se pudo leer el PDF. Puede estar protegido o dañado. " +
                err.message
        );
      }
    },
    [customTemplates, persist]
  );

  const saveMapping = useCallback(
    (templateId: string, mapping: Record<string, string>) => {
      persist(
        customTemplates.map((t) =>
          t.id === templateId ? { ...t, mapping } : t
        )
      );
      alert("Correspondencias guardadas.");
    },
    [customTemplates, persist]
  );

  const removeTemplate = useCallback(
    (id: string) => {
      if (!confirm("¿Eliminar esta plantilla?")) return;

      persist(customTemplates.filter((t) => t.id !== id));
      if (configTemplateId === id) setConfigTemplateId(null);
    },
    [customTemplates, configTemplateId, persist]
  );

  return {
    customTemplates,
    allTemplates,
    configTemplateId,
    setConfigTemplateId,
    addCustomTemplate,
    saveMapping,
    removeTemplate,
  };
}