import type { Project, Template, GeneratedDoc } from "@/lib/types";
import { fillTemplate, safeFilename } from "@/lib/pdf";
import { upsertGeneratedDoc } from "@/lib/pdfDb";
import { validateProject } from "@/lib/validation";

/**
 * Generates one PDF for a single template, upserts it in IndexedDB, and triggers a download.
 *
 * Called from a button click handler (user gesture) so anchor.click() is never blocked.
 * See ADR-0001 for why we generate one-at-a-time instead of batching.
 *
 * Throws on validation errors or PDF generation failures — caller is responsible for catch.
 */
export async function generateOnePdf(
  template: Template,
  project: Project
): Promise<GeneratedDoc> {
  const errors = validateProject(project);
  if (errors.length) throw new Error(errors.join("\n"));

  const bytes = await fillTemplate(template, project);
  const filename = `${safeFilename(project.name)} - ${safeFilename(template.name)}.pdf`;

  const doc = await upsertGeneratedDoc(project.id, template.name, filename, bytes);

  // Single anchor.click() — always a direct response to a user gesture.
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(anchor.href), 5_000);

  return doc;
}

/**
 * Writes all previously generated docs for a project into a user-chosen folder.
 * Uses the File System Access API — the right tool for batch folder writes.
 * Throws if the API is unavailable or the user cancels.
 */
export async function saveGeneratedToFolder(
  generated: GeneratedDoc[]
): Promise<number> {
  if (!("showDirectoryPicker" in window)) {
    throw new Error(
      "Tu navegador no permite elegir una carpeta directamente. Usa los botones «Descargar» de cada PDF."
    );
  }
  if (!generated.length) {
    throw new Error("Esta obra todavía no tiene PDF generados.");
  }

  // @ts-expect-error File System Access API not in TS lib
  const dir = await window.showDirectoryPicker({
    id: "rellenador-pdf-destination",
    mode: "readwrite",
  });

  let saved = 0;
  for (const doc of generated) {
    const handle = await dir.getFileHandle(doc.filename, { create: true });
    const writable = await handle.createWritable();
    await writable.write(new Blob([new Uint8Array(doc.bytes)], { type: "application/pdf" }));
    await writable.close();
    saved++;
  }
  return saved;
}
