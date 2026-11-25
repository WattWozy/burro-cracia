import type { Bureau } from "../types";

export interface BureauRepository {
  getAll(): Promise<{ bureaus: Bureau[]; currentId: string | null }>;
  saveAll(bureaus: Bureau[], currentId: string | null): Promise<void>;
}