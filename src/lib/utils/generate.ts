import type { Project, Template } from "@/lib/types";
import { fillTemplate, safeFilename } from "@/lib/pdf";
import { validateProject } from "@/lib/validation";

/**
 * Generates one PDF for a single template and triggers a browser download.
 *
 * Called from a button click handler (user gesture) so anchor.click() is never blocked.
 * No history is persisted — re-generating is instant. See ADR-0001.
 *
 * Throws on validation errors or PDF generation failures — caller is responsible for catch.
 */
export async function generateOnePdf(
  template: Template,
  project: Project
): Promise<void> {
  const errors = validateProject(project);
  if (errors.length) throw new Error(errors.join("\n"));

  const bytes = await fillTemplate(template, project);
  const filename = `${safeFilename(project.name)} - ${safeFilename(template.name)}.pdf`;

  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(anchor.href), 5_000);
}
