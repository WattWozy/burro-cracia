import type { BureauRepository } from "../../repositories/BureauRepository";
import type { Bureau } from "../../types";
import { bureauKey } from "./keys";

export const localBureauRepository: BureauRepository = {
  async getAll() {
    if (typeof window === "undefined") {
      return { bureaus: [], currentId: null };
    }

    try {
      const raw = localStorage.getItem(bureauKey());
      return raw
        ? JSON.parse(raw)
        : { bureaus: [], currentId: null };
    } catch {
      return { bureaus: [], currentId: null };
    }
  },

  async saveAll(bureaus, currentId) {
    localStorage.setItem(
      bureauKey(),
      JSON.stringify({ bureaus, currentId })
    );
  },
};