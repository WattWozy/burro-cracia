import type { Project, Template, GeneratedDoc } from "@/lib/types";
import { fillTemplate, safeFilename } from "@/lib/pdf";
import { saveGeneratedDoc } from "@/lib/pdfDb";
import { validateProject } from "@/lib/validation";

export async function generateAndDownloadPdfs(
  project: Project,
  templates: Template[],
  onProgress: (msg: string) => void
): Promise<{ count: number; errors: string[] }> {
  const errors = validateProject(project);
  if (errors.length) {
    return { count: 0, errors };
  }

  for (const template of templates) {
    onProgress(`Generando: ${template.name}…`);
    const bytes = await fillTemplate(template, project);
    const filename = `${safeFilename(project.name)} - ${safeFilename(template.name)}.pdf`;

    await saveGeneratedDoc(project.id, template.name, filename, bytes);

    const blob = new Blob([Uint8Array.from(bytes).buffer], {
      type: "application/pdf",
    });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(anchor.href), 5000);
  }

  return { count: templates.length, errors: [] };
}

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

  // @ts-expect-error File System Access API
  const directory = await window.showDirectoryPicker({
    id: "coavn-pdf-destination",
    mode: "readwrite",
  });

  let saved = 0;
  for (const doc of generated) {
    const handle = await directory.getFileHandle(doc.filename, { create: true });
    const writable = await handle.createWritable();
    await writable.write(
      new Blob([new Uint8Array(doc.bytes)], { type: "application/pdf" })
    );
    await writable.close();
    saved++;
  }
  return saved;
}