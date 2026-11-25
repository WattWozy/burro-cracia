import { v4 as uuid } from "uuid";
import type { Template } from "@/lib/types";

export async function createCustomTemplate(
  file: File,
  nameInput: string
): Promise<Template> {
  const name = nameInput.trim() || file.name;
  const buffer = await file.arrayBuffer();
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.load(buffer);
  const fields = pdf.getForm().getFields();

  if (!fields.length) {
    throw new Error(
      "Este PDF no contiene campos de formulario detectables. En esta versión no se puede rellenar automáticamente."
    );
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);

  return {
    id: "custom_" + uuid(),
    name,
    filename: file.name,
    data: btoa(binary),
    builtin: false,
    fields: fields.map((field) => ({
      name: field.getName(),
      type: field.constructor.name,
    })),
    mapping: {},
  };
}