export type FieldKey =
  | "obra"
  | "emplazamiento"
  | "municipio"
  | "obra_emplazamiento"
  | "promotor"
  | "constructor"
  | "arquitectos"
  | "arquitecto1"
  | "arquitecto2"
  | "colegiado1"
  | "colegiado2"
  | "colegiado3"
  | "colegiado4"
  | "arquitecto_tecnico"
  | "representante"
  | "expediente"
  | "licencia"
  | "numero_visado"
  | "fecha_visado"
  | "provincia"
  | "delegacion"
  | "lugar"
  | "fecha_inicio_obra"
  | "fecha_aprobacion_plan"
  | "fecha_fin"
  | "acta_dia"
  | "acta_mes"
  | "acta_anio"
  | "orden_dia"
  | "orden_mes"
  | "orden_anio"
  | "incid_dia"
  | "incid_mes"
  | "incid_anio"
  | "incid_lugar"
  | "incid_dia_firma"
  | "incid_mes_firma"
  | "incid_anio_firma"
  | "expedicion_numero"
  | "expedicion_dia"
  | "expedicion_mes"
  | "expedicion_anio"
  | "cert_dia"
  | "cert_mes"
  | "cert_anio";

export interface Project {
  id: string;
  name: string;
  data: Partial<Record<FieldKey, string>>;
  dates: Record<string, string>;
}

export interface TemplateField {
  name: string;
  type: string;
}

export interface Template {
  id: string;
  name: string;
  filename: string;
  /** Relative path under /templates/ for built-in, or base64 for custom */
  pdfPath?: string;
  data?: string; // base64 for custom
  builtin: boolean;
  fields?: TemplateField[];
  mapping?: Record<string, FieldKey | string>;
}

export interface Professional {
  id: string;
  name: string;
  dni: string;
  colegiado: string;
  colegio: string;
  role: string;
}


export interface Address {
  street: string;
  postalCode: string;
  municipality: string;
  province: string;
}

export interface Contact {
  email: string;
  phone: string;
  website?: string;
}

export interface Bureau {
  id: string;
  name: string;
  legalName: string;
  cif: string;
  createdAt: string;

  professionals: Professional[];
  address: Address;
  contact: Contact;

  defaults?: Partial<Record<FieldKey, string>>;
}

export interface AppDB {
  bureaus: Bureau[];
  currentBureauId: string | null;
  // projects & templates are stored per bureau in separate keys
}

export interface GeneratedDoc {
  id: string;
  projectId: string;
  templateName: string;
  filename: string;
  bytes: number[];
  createdAt: string;
}
