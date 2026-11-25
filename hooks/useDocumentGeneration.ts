"use client";

import { useState, useCallback } from "react";
import type { Project, Template, GeneratedDoc } from "@/lib/types";
import { BUILTIN_TEMPLATES } from "@/lib/constants";
import {
  generateAndDownloadPdfs,
  saveGeneratedToFolder,
} from "@/lib/utils/generate";

interface UseDocumentGenerationProps {
  currentProject: Project | null;
  allTemplates: Template[];
  generated: GeneratedDoc[];
  refreshGenerated: () => Promise<void>;
}

export function useDocumentGeneration({
  currentProject,
  allTemplates,
  generated,
  refreshGenerated,
}: UseDocumentGenerationProps) {
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(
    new Set(BUILTIN_TEMPLATES.map((t) => t.id))
  );
  const [genMsg, setGenMsg] = useState("");
  const [folderMsg, setFolderMsg] = useState("");

  const toggleDoc = useCallback((id: string) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const generate = useCallback(async () => {
    if (!currentProject) return;

    const chosen = allTemplates.filter((t) => selectedDocs.has(t.id));
    if (!chosen.length) {
      alert("Selecciona al menos un impreso.");
      return;
    }

    setGenMsg("Generando PDF…");

    try {
      const { count, errors } = await generateAndDownloadPdfs(
        currentProject,
        chosen,
        (msg) => setGenMsg(msg)
      );

      if (errors.length) {
        setGenMsg(
          "Corrige los siguientes errores antes de generar:\n" +
            errors.map((e) => `• ${e}`).join("\n")
        );
        return;
      }

      await refreshGenerated();
      setGenMsg(
        `Se han generado y guardado ${count} PDF en esta obra. También se han descargado.`
      );
    } catch (error: unknown) {
      const err = error as Error;
      console.error(error);
      setGenMsg("No se pudo generar el PDF: " + (err.message || String(error)));
      alert("Error al generar PDF: " + (err.message || String(error)));
    }
  }, [currentProject, allTemplates, selectedDocs, refreshGenerated]);

  const saveToFolder = useCallback(async () => {
    try {
      const saved = await saveGeneratedToFolder(generated);
      setFolderMsg(
        `Se han guardado ${saved} PDF en la carpeta que has elegido.`
      );
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };

      if (err?.name === "AbortError") {
        setFolderMsg("Selección de carpeta cancelada.");
        return;
      }

      setFolderMsg(
        "No se pudieron guardar: " + (err.message || String(error))
      );
    }
  }, [generated]);

  return {
    selectedDocs,
    genMsg,
    folderMsg,
    toggleDoc,
    generate,
    saveToFolder,
  };
}