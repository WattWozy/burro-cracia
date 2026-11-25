import type { Template } from "../types";

export interface TemplateRepository {
  getAll(bureauId: string): Promise<Template[]>;
  saveAll(bureauId: string, templates: Template[]): Promise<void>;
}