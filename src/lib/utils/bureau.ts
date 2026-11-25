import type { Bureau, FieldKey, Project } from "@/lib/types";
import { createDefaultBureau } from "@/lib/storage";

export function buildBureauDefaults(project: Project): Partial<Record<FieldKey, string>> {
  const defaultFields: FieldKey[] = [
    "arquitectos", "arquitecto1", "arquitecto2", "colegiado1", "colegiado2",
    "colegiado3", "colegiado4", "arquitecto_tecnico", "delegacion",
    "provincia", "lugar",
  ];

  return Object.fromEntries(
    defaultFields.map((field) => [field, project.data[field] || ""])
  ) as Partial<Record<FieldKey, string>>;
}

export function createNamedBureau(name: string): Bureau {
  return {
    ...createDefaultBureau(),
    name: name.trim(),
  };
}