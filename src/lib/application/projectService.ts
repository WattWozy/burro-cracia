import type { Project, FieldKey } from "../types";
import { v4 as uuid } from "uuid";

export function createDefaultProject(
  defaults: Partial<Record<FieldKey, string>> = {}
): Project {
  return {
    id: uuid(),
    name: "Obra de prueba",
    data: {
      ...defaults,
      arquitectos: defaults.arquitectos || "",
      delegacion: defaults.delegacion || "",
      provincia: defaults.provincia || "",
      lugar: defaults.lugar || "",
    },
    dates: {},
  };
}