"use client";

import { useState, useCallback } from "react";
import type { Project, Template } from "@/lib/types";
import { generateOnePdf } from "@/lib/utils/generate";

interface UseDocumentGenerationProps {
  currentProject: Project | null;
  allTemplates: Template[];
}

/**
 * Owns document generation state.
 *
 * generateOne(templateId) — fills a PDF and downloads it immediately.
 *   Tracks which template is in-flight via generatingId so the UI can disable buttons.
 *
 * No history is kept — generation is fast enough that re-generating on demand is the workflow.
 */
export function useDocumentGeneration({
  currentProject,
  allTemplates,
}: UseDocumentGenerationProps) {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [genErrors, setGenErrors] = useState<string[]>([]);

  const generateOne = useCallback(
    async (templateId: string) => {
      if (!currentProject || generatingId) return;

      const template = allTemplates.find((t) => t.id === templateId);
      if (!template) return;

      setGeneratingId(templateId);
      setGenErrors([]);

      try {
        await generateOnePdf(template, currentProject);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        setGenErrors(msg.split("\n"));
      } finally {
        setGeneratingId(null);
      }
    },
    [currentProject, allTemplates, generatingId]
  );

  return { generatingId, genErrors, generateOne };
}
