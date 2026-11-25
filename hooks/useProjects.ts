"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project, FieldKey } from "@/lib/types";
import {
  loadProjects,
  saveProjects,
  createDefaultProject,
} from "@/lib/storage";
import {
  createNamedProject,
  updateProjectField,
  updateProjectDate as updateProjectDateUtil,
} from "@/lib/utils/project";

export function useProjects(
  bureauId: string | null,
  defaults?: Partial<Record<FieldKey, string>>
) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");

  // Load projects when bureau changes
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
  }, [bureauId]); // defaults intentionally omitted – only run on bureau change

  const currentProject =
    projects.find((p) => p.id === currentProjectId) ?? null;

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
    if (!name) {
      alert("Escribe un nombre para la obra.");
      return;
    }

    const project = createNamedProject(name, defaults);
    persist([...projects, project]);
    setCurrentProjectId(project.id);
    setNewProjectName("");
  }, [newProjectName, defaults, projects, persist]);

  const deleteProject = useCallback(() => {
    if (projects.length <= 1) {
      alert("Debe quedar al menos una obra.");
      return;
    }
    if (!confirm("¿Eliminar esta obra y sus datos?")) return;

    const next = projects.filter((p) => p.id !== currentProjectId);
    persist(next);
    setCurrentProjectId(next[0].id);
  }, [projects, currentProjectId, persist]);

  const updateProjectData = useCallback(
    (key: FieldKey, value: string) => {
      if (!currentProjectId) return;
      // Optimistic update – we don't persist on every keystroke
      setProjects((prev) =>
        updateProjectField(prev, currentProjectId, key, value)
      );
    },
    [currentProjectId]
  );

  // Call this when you want to actually save the current project data
  const persistCurrentProject = useCallback(() => {
    if (!bureauId) return;
    saveProjects(bureauId, projects);
  }, [bureauId, projects]);

  const updateProjectDate = useCallback(
    (key: string, value: string) => {
      if (!currentProjectId) return;
      persist(
        updateProjectDateUtil(projects, currentProjectId, key, value)
      );
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
    persistCurrentProject, // optional – useful if you want an explicit "Save" button
  };
}