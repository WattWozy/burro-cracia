
import type { Project } from "./types";
import { isValidDateOnly, normalizeDate } from "./dates";

const DATA_DATE_FIELDS = [
  "fecha_visado",
  "fecha_inicio_obra",
  "fecha_aprobacion_plan",
  "fecha_fin",
];

export function validateProject(project: Project): string[] {
  const errors: string[] = [];

  for (const field of DATA_DATE_FIELDS) {
    const value = project.data?.[field as keyof typeof project.data];

    if (value && !isValidDateOnly(normalizeDate(value))) {
      errors.push(`La fecha "${field}" no es válida.`);
    }
  }

  for (const [field, value] of Object.entries(project.dates || {})) {
    if (value && !isValidDateOnly(normalizeDate(value))) {
      errors.push(`La fecha "${field}" no es válida.`);
    }
  }

  const approval = normalizeDate(
    project.dates?.incidencias ||
      project.data?.fecha_aprobacion_plan
  );

  const start = normalizeDate(
    project.dates?.inicio ||
      project.data?.fecha_inicio_obra
  );

  const finish = normalizeDate(
    project.dates?.certificado ||
      project.data?.fecha_fin
  );

  const certificateIssue = normalizeDate(
    project.dates?.certificadoExp
  );

  if (
    isValidDateOnly(approval) &&
    isValidDateOnly(start) &&
    approval > start
  ) {
    errors.push(
      "La fecha de aprobación del Plan no puede ser posterior al inicio de obra."
    );
  }

  if (
    isValidDateOnly(start) &&
    isValidDateOnly(finish) &&
    start > finish
  ) {
    errors.push(
      "La fecha de inicio de obra no puede ser posterior a la fecha de finalización."
    );
  }

  if (
    isValidDateOnly(finish) &&
    isValidDateOnly(certificateIssue) &&
    certificateIssue < finish
  ) {
    errors.push(
      "La expedición del certificado final no puede ser anterior a la finalización de obra."
    );
  }

  return errors;
}
