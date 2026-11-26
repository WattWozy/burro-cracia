import { PDFDocument, PDFTextField, PDFCheckBox } from "pdf-lib";
import type { Project, Template, FieldKey } from "./types";
import { MAPS } from "./constants";
import { formatSpanishDate, normalizeDate } from "./dates";


function splitDate(value?: string): [string, string, string] {
  const normalized = normalizeDate(value);
  if (!normalized) return ["", "", ""];

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);

  if (match) {
    return [match[3], match[2], match[1]];
  }

  return ["", "", ""];
}

function mapFor(t: Template): Record<string, unknown> {
  if (t.builtin) return MAPS[t.id] || {};
  return t.mapping || {};
}

function fieldValue(project: Project, t: Template, fieldName: string): string {
  const key = mapFor(t)[fieldName];
  if (typeof key !== "string" || !key) return "";
  if (!key) return "";

  const data = project.data || {};
  const dates = project.dates || {};

  const dateParts = (dateKey: string) => splitDate(dates[dateKey]);

  if (key === "fecha_visado") {
    return formatSpanishDate(data.fecha_visado);
  }

  if (key === "fecha_aprobacion_plan") {
    return formatSpanishDate(
      dates.incidencias || data.fecha_aprobacion_plan
    );
  }

  if (key === "fecha_inicio_obra") {
    return formatSpanishDate(
      dates.inicio || data.fecha_inicio_obra
    );
  }

  if (key === "fecha_fin") {
    return formatSpanishDate(
      dates.certificado || data.fecha_fin
    );
  }
  if (["acta_dia", "acta_mes", "acta_anio"].includes(key)) {
    const a = dateParts("acta");
    return a[["acta_dia", "acta_mes", "acta_anio"].indexOf(key)] || "";
  }
  const pairs: Record<string, [string, number]> = {
    orden_dia: ["ordenes", 0],
    orden_mes: ["ordenes", 1],
    orden_anio: ["ordenes", 2],
    incid_dia: ["incidencias", 0],
    incid_mes: ["incidencias", 1],
    incid_anio: ["incidencias", 2],
    incid_lugar: ["incidenciasFirma", -1],
    incid_dia_firma: ["incidenciasFirma", 0],
    incid_mes_firma: ["incidenciasFirma", 1],
    incid_anio_firma: ["incidenciasFirma", 2],
    cert_dia: ["certificadoExp", 0],
    cert_mes: ["certificadoExp", 1],
    cert_anio: ["certificadoExp", 2],
    expedicion_dia: ["expedicionIncidencias", 0],
    expedicion_mes: ["expedicionIncidencias", 1],
    expedicion_anio: ["expedicionIncidencias", 2],
  };

  if (Object.hasOwn(pairs, key)) {
  const pair = pairs[key];

  if (!Array.isArray(pair) || pair.length !== 2) {
    console.error("Invalid date pair:", { key, pair, pairs });
    return "";
  }

  const [d, i] = pair;
  if (i === -1) return data.lugar || "";
  const a = dateParts(d);
  return a[i] || "";
}

  return Object.hasOwn(data, key) ? (data[key as FieldKey] ?? "") : "";
}

async function loadPdfBytes(t: Template): Promise<Uint8Array> {
  if (t.data) {
    // custom base64
    const binary = atob(t.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  if (t.pdfPath) {
    const res = await fetch(t.pdfPath);
    if (!res.ok) throw new Error(`No se pudo cargar la plantilla ${t.name}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  throw new Error("Plantilla sin datos PDF");
}

export async function fillTemplate(
  t: Template,
  project: Project
): Promise<Uint8Array> {
  const bytes = await loadPdfBytes(t);
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: false });
  const form = pdf.getForm();
  const fields = form.getFields();

  for (const f of fields) {
    const name = f.getName();
    const v = fieldValue(project, t, name);
    if (!v) continue;
    try {
      if (f instanceof PDFTextField) {
        f.setText(String(v));
      }
    } catch (e) {
      console.warn("No se pudo rellenar", name, e);
    }
  }

  // Default checkbox for incidencias (coordinador)
  if (t.id === "incidencias") {
    try {
      const cb = form.getCheckBox(
        "topmostSubform[0].Page1[0].Casilla_de_verificación19[0]"
      );
      cb.check();
    } catch {
      /* ignore */
    }
  }

  return await pdf.save();
}

export function safeFilename(s: string): string {
  return String(s).replace(/[\\/:*?"<>|]/g, "-");
}
