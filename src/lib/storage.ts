import type { Bureau, Project, Template, AppDB, FieldKey } from "./types";import { STORAGE_PREFIX } from "./constants";
import { v4 as uuid } from "uuid";
import { normalizeDate } from "./dates";

const DATA_DATE_FIELDS = [
  "fecha_visado",
  "fecha_inicio_obra",
  "fecha_aprobacion_plan",
  "fecha_fin",
] as const;

function key(bureauId: string, type: "projects" | "templates") {
  return `${STORAGE_PREFIX}_${bureauId}_${type}`;
}

function bureauKey() {
  return `${STORAGE_PREFIX}_bureaus`;
}

/** Normalizes a bureau loaded from localStorage to fill in fields added after the initial save. */
function normalizeBureau(b: Bureau): Bureau {
  return {
    ...b,
    professionals: b.professionals ?? [],
    address: b.address ?? { street: "", postalCode: "", municipality: "", province: "" },
    contact: b.contact ?? { email: "", phone: "", website: "" },
    defaults: b.defaults ?? {},
  };
}

export function loadBureaus(): { bureaus: Bureau[]; currentId: string | null } {
  if (typeof window === "undefined") return { bureaus: [], currentId: null };
  try {
    const raw = localStorage.getItem(bureauKey());
    if (!raw) return { bureaus: [], currentId: null };
    const parsed = JSON.parse(raw) as { bureaus: Bureau[]; currentId: string | null };
    return { ...parsed, bureaus: parsed.bureaus.map(normalizeBureau) };
  } catch {
    return { bureaus: [], currentId: null };
  }
}

export function saveBureaus(bureaus: Bureau[], currentId: string | null) {
  localStorage.setItem(bureauKey(), JSON.stringify({ bureaus, currentId }));
}


export function loadProjects(bureauId: string): Project[] {
  try {
    const raw = localStorage.getItem(key(bureauId, "projects"));
    if (!raw) return [];

    const projects = JSON.parse(raw) as Project[];

    return projects.map((project): Project => {
      const data: Partial<Record<FieldKey, string>> = Object.fromEntries(
        Object.entries(project.data || {}).map(([field, value]) => [
          field,
          DATA_DATE_FIELDS.includes(field as typeof DATA_DATE_FIELDS[number])
            ? normalizeDate(value)
            : value,
        ])
      ) as Partial<Record<FieldKey, string>>;

      const dates: Record<string, string> = Object.fromEntries(
        Object.entries(project.dates || {}).map(([field, value]) => [
          field,
          normalizeDate(value),
        ])
      );

      return {
        ...project,
        data,
        dates,
      };
    });
  } catch {
    return [];
  }
}


export function saveProjects(bureauId: string, projects: Project[]) {
  localStorage.setItem(key(bureauId, "projects"), JSON.stringify(projects));
}

export function loadTemplates(bureauId: string): Template[] {
  try {
    const raw = localStorage.getItem(key(bureauId, "templates"));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTemplates(bureauId: string, templates: Template[]) {
  localStorage.setItem(key(bureauId, "templates"), JSON.stringify(templates));
}

export function createDefaultBureau(): Bureau {
  return {
    id: uuid(),
    name: "Mi despacho",
    legalName: "",
    cif: "",
    createdAt: new Date().toISOString(),
    professionals: [],
    address: {
      street: "",
      postalCode: "",
      municipality: "",
      province: "",
    },
    contact: {
      email: "",
      phone: "",
      website: "",
    },
    defaults: {},
  };
}

export function createDefaultProject(
  defaults: Partial<Record<FieldKey, string>> = {}
): Project {
  const data = {
    ...defaults,
    arquitectos: defaults.arquitectos || "",
    delegacion: defaults.delegacion || "",
    provincia: defaults.provincia || "",
    lugar: defaults.lugar || "",
  } as Partial<Record<FieldKey, string>>;

  return {
    id: uuid(),
    name: "Obra de prueba",
    data,
    dates: {},
  };
}
