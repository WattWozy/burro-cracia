import type { Bureau, Project, Template } from "@/lib/types";
import { safeFilename } from "@/lib/pdf";

export function downloadBackup(
  bureau: Bureau | null,
  projects: Project[],
  templates: Template[]
) {
  const payload = { bureau, projects, templates };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `copia-seguridad-${safeFilename(bureau?.name || "despacho")}.json`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

export async function parseBackup(file: File) {
  const text = await file.text();
  const backup = JSON.parse(text);

  if (!Array.isArray(backup.projects) || !Array.isArray(backup.templates)) {
    throw new Error("Formato no válido");
  }

  return backup as {
    bureau?: Bureau;
    projects: Project[];
    templates: Template[];
  };
}