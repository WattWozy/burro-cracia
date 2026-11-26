"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project, FieldKey } from "@/lib/types";
import { loadProjects, saveProjects, createDefaultProject } from "@/lib/storage";
import {
  createNamedProject,
  updateProjectField,
  updateProjectDate as updateProjectDateUtil,
} from "@/lib/utils/project";

/**
 * Manages projects for the active bureau.
 *
 * All mutations persist to localStorage immediately — there is no separate "save" step.
 * updateProjectData uses a functional state updater so the persisted value is always
 * identical to what React holds. See ADR-0002.
 */
export function useProjects(
  bureauId: string | null,
  defaults?: Partial<Record<FieldKey, string>>
) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");

  // Reload when the active bureau changes.
  useEffect(() => {
    if (!bureauId) {
      setProjects([]);
      setCurrentProjectId(null);
      return;
    }

    let loaded = loadProjects(bureauId);

    if (!loaded.length) {
      loaded = [createDefaultProject(defaults)];
      saveProjects(bureauId, loaded);
    }

    setProjects(loaded);
    setCurrentProjectId(loaded[0].id);
  }, [bureauId]); // defaults intentionally omitted — only run on bureau change

  const currentProject = projects.find((p) => p.id === currentProjectId) ?? null;

  /** Updates React state and persists atomically. */
  const persist = useCallback(
    (next: Project[]) => {
      if (!bureauId) return;
      setProjects(next);
      saveProjects(bureauId, next);
    },
    [bureauId]
  );

  const createProject = useCallback(() => {
    const name = newProjectName.trim();
    if (!name) { alert("Escribe un nombre para la obra."); return; }

    const project = createNamedProject(name, defaults);
    persist([...projects, project]);
    setCurrentProjectId(project.id);
    setNewProjectName("");
  }, [newProjectName, defaults, projects, persist]);

  const deleteProject = useCallback(() => {
    if (projects.length <= 1) { alert("Debe quedar al menos una obra."); return; }
    if (!confirm("¿Eliminar esta obra y sus datos?")) return;

    const next = projects.filter((p) => p.id !== currentProjectId);
    persist(next);
    setCurrentProjectId(next[0].id);
  }, [projects, currentProjectId, persist]);

  /**
   * Persists each field change immediately via functional state update.
   * saveProjects is called with the same next value React will commit — no stale-closure risk.
   */
  const updateProjectData = useCallback(
    (key: FieldKey, value: string) => {
      if (!currentProjectId || !bureauId) return;
      setProjects((prev) => {
        const next = updateProjectField(prev, currentProjectId, key, value);
        saveProjects(bureauId, next);
        return next;
      });
    },
    [currentProjectId, bureauId]
  );

  const updateProjectDate = useCallback(
    (key: string, value: string) => {
      if (!currentProjectId) return;
      persist(updateProjectDateUtil(projects, currentProjectId, key, value));
    },
    [currentProjectId, projects, persist]
  );

  return {
    projects,
    currentProject,
    currentProjectId,
    newProjectName,
    setNewProjectName,
    setCurrentProjectId,
    createProject,
    deleteProject,
    updateProjectData,
    updateProjectDate,
  };
}
