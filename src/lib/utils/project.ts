import { v4 as uuid } from "uuid";
import type { Bureau, Project, FieldKey } from "@/lib/types";

export function createNamedProject(name: string, defaults?: Bureau["defaults"]): Project {
  return {
    id: uuid(),
    name: name.trim(),
    data: { ...(defaults || {}) },
    dates: {},
  };
}

export function updateProjectField(
  projects: Project[],
  projectId: string,
  key: FieldKey,
  value: string
): Project[] {
  return projects.map((p) =>
    p.id === projectId
      ? { ...p, data: { ...(p.data ?? {}), [key]: value } }
      : p
  );
}

export function updateProjectDate(
  projects: Project[],
  projectId: string,
  key: string,
  value: string
): Project[] {
  return projects.map((p) =>
    p.id === projectId
      ? { ...p, dates: { ...p.dates, [key]: value } }
      : p
  );
}