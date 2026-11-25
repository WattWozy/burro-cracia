import type { Project } from "../types";

export interface ProjectRepository {
  getAll(bureauId: string): Promise<Project[]>;
  saveAll(bureauId: string, projects: Project[]): Promise<void>;
}