"use client";

import { useState, useEffect, useCallback } from "react";
import type { GeneratedDoc } from "@/lib/types";
import { getGeneratedDocs } from "@/lib/pdfDb";

export function useGeneratedDocs(projectId: string | null) {
  const [generated, setGenerated] = useState<GeneratedDoc[]>([]);

  const refreshGenerated = useCallback(async () => {
    if (!projectId) {
      setGenerated([]);
      return;
    }

    try {
      const docs = await getGeneratedDocs(projectId);
      setGenerated(docs);
    } catch {
      setGenerated([]);
    }
  }, [projectId]);

  // Auto-refresh when the project changes
  useEffect(() => {
    refreshGenerated();
  }, [refreshGenerated]);

  return {
    generated,
    refreshGenerated,
  };
}