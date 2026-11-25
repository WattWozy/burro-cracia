import type { FieldKey, Template } from "./types";
import keysJson from "./keys.json";
import fieldsJson from "./fields.json";
import mapsJson from "./maps.json";

export const KEYS = keysJson as Record<FieldKey, string>;
export const FIELDS = fieldsJson as FieldKey[];
export const MAPS = mapsJson as Record<string, Record<string, FieldKey>>;

export const BUILTIN_TEMPLATES: Template[] = [
  {
    id: "acta",
    name: "Acta de aprobación del Plan de Seguridad y Salud",
    filename: "ActaAprobacionPlanSyS.pdf",
    pdfPath: "/templates/ActaAprobacionPlanSyS.pdf",
    builtin: true,
  },
  {
    id: "certificado",
    name: "Certificado final de dirección de obra",
    filename: "CertificadoFinalDireccionObraCarenteDireccionEjecucion.pdf",
    pdfPath: "/templates/CertificadoFinalDireccionObraCarenteDireccionEjecucion.pdf",
    builtin: true,
  },
  {
    id: "ordenes",
    name: "Comunicación de inicio y Libro de Órdenes",
    filename: "Com_libro_de_ordenes.pdf",
    pdfPath: "/templates/Com_libro_de_ordenes.pdf",
    builtin: true,
  },
  {
    id: "incidencias",
    name: "Petición de Libro de Incidencias",
    filename: "LibroIncidencias.pdf",
    pdfPath: "/templates/LibroIncidencias.pdf",
    builtin: true,
  },
];

export const STORAGE_PREFIX = "rellenador_v2";
export const PDF_DB_NAME = "rellenador_pdf_v2";
export const PDF_STORE = "documentos";
