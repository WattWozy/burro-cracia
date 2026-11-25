import type { TemplateRepository } from "../../repositories/TemplateRepository";
import type { Template } from "../../types";
import { entityKey } from "./keys";

export const localTemplateRepository: TemplateRepository = {
  async getAll(bureauId) {
    try {
      const raw = localStorage.getItem(entityKey(bureauId, "templates"));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async saveAll(bureauId, templates) {
    localStorage.setItem(
      entityKey(bureauId, "templates"),
      JSON.stringify(templates)
    );
  },
};