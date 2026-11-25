import { STORAGE_PREFIX } from "../../constants";

export const bureauKey = () => `${STORAGE_PREFIX}_bureaus`;

export const entityKey = (
  bureauId: string,
  type: "projects" | "templates"
) => `${STORAGE_PREFIX}_${bureauId}_${type}`;