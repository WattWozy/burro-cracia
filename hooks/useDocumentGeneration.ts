"use client";

import { useState, useCallback } from "react";
import type { Project, Template, GeneratedDoc } from "@/lib/types";
import { generateOnePdf, saveGeneratedToFolder } from "@/lib/utils/generate";

interface UseDocumentGenerationProps {
  currentProject: Project | null;
  allTemplates: Template[];
  generated: GeneratedDoc[];
  refreshGenerated: () => Promise<void>;
}

/**
 * Owns document generation state.
 *
 * generateOne(templateId) — generates a single PDF, persists it, downloads it.
 *   Tracks which template is in-flight via generatingId so the UI can disable buttons.
 *
 * saveToFolder() — writes all existing generated docs to a user-chosen folder.
 *
 * See ADR-0001 for the per-template design rationale.
 */
export function useDocumentGeneration({
  currentProject,
  allTemplates,
  generated,
  refreshGenerated,
}: UseDocumentGenerationProps) {
  // ID of the template currently generating, null when idle.
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  // Validation/generation errors from the most recent attempt.
  const [genErrors, setGenErrors] = useState<string[]>([]);
  const [folderMsg, setFolderMsg] = useState("");

  const generateOne = useCallback(
    async (templateId: string) => {
      if (!currentProject || generatingId) return;

      const template = allTemplates.find((t) => t.id === templateId);
      if (!template) return;

      setGeneratingId(templateId);
      setGenErrors([]);

      try {
        await generateOnePdf(template, currentProject);
        await refreshGenerated();
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        setGenErrors(msg.split("\n"));
      } finally {
        setGeneratingId(null);
      }
    },
    [currentProject, allTemplates, generatingId, refreshGenerated]
  );

  const saveToFolder = useCallback(async () => {
    setFolderMsg("");
    try {
      const saved = await saveGeneratedToFolder(generated);
      setFolderMsg(`${saved} PDF guardados en la carpeta elegida.`);
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (err?.name === "AbortError") {
        setFolderMsg("Selección de carpeta cancelada.");
        return;
      }
      setFolderMsg("No se pudieron guardar: " + (err.message ?? String(error)));
    }
  }, [generated]);

  return {
    generatingId,
    genErrors,
    folderMsg,
    generateOne,
    saveToFolder,
  };
}
