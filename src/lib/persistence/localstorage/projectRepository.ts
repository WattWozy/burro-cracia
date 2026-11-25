import type { ProjectRepository } from "../../repositories/ProjectRepository";
import type { Project, FieldKey } from "../../types";
import { normalizeDate } from "../../dates";
import { entityKey } from "./keys";

const DATA_DATE_FIELDS = [
  "fecha_visado",
  "fecha_inicio_obra",
  "fecha_aprobacion_plan",
  "fecha_fin",
] as const;

export const localProjectRepository: ProjectRepository = {
  async getAll(bureauId) {
    try {
      const raw = localStorage.getItem(entityKey(bureauId, "projects"));
      if (!raw) return [];

      const projects = JSON.parse(raw) as Project[];

      return projects.map((project): Project => ({
        ...project,
        data: Object.fromEntries(
          Object.entries(project.data || {}).map(([field, value]) => [
            field,
            DATA_DATE_FIELDS.includes(
              field as typeof DATA_DATE_FIELDS[number]
            )
              ? normalizeDate(value)
              : value,
          ])
        ) as Partial<Record<FieldKey, string>>,

        dates: Object.fromEntries(
          Object.entries(project.dates || {}).map(([field, value]) => [
            field,
            normalizeDate(value),
          ])
        ),
      }));
    } catch {
      return [];
    }
  },

  async saveAll(bureauId, projects) {
    localStorage.setItem(
      entityKey(bureauId, "projects"),
      JSON.stringify(projects)
    );
  },
};