import type { Project, Template, GeneratedDoc } from "@/lib/types";
import { normalizeDate } from "@/lib/dates";
import { deleteGeneratedDoc } from "@/lib/pdfDb";

type Props = {
  project: Project;
  templates: Template[];
  generated: GeneratedDoc[];
  /** ID of the template currently generating, null when idle. */
  generatingId: string | null;
  /** Validation/generation errors from the most recent attempt. */
  genErrors: string[];
  folderMsg: string;
  onGenerateDoc: (templateId: string) => void;
  onUpdateDate: (key: string, value: string) => void;
  onSaveToFolder: () => void;
  onRefreshGenerated: () => void;
};

type DateFieldSpec = { key: string; label: string };

/**
 * Maps template IDs to the date fields that belong to that document.
 * Dates are per-document (not shared between templates) so they live here, not in project data.
 */
const DATES_BY_TEMPLATE: Record<string, DateFieldSpec[]> = {
  acta: [
    { key: "acta", label: "Fecha de firma" },
  ],
  ordenes: [
    { key: "ordenes", label: "Fecha de solicitud" },
    { key: "expedicionOrdenes", label: "Fecha de expedición" },
  ],
  incidencias: [
    { key: "incidencias", label: "Fecha de aprobación del Plan" },
    { key: "incidenciasFirma", label: "Fecha de firma" },
    { key: "expedicionIncidencias", label: "Fecha de expedición" },
  ],
  certificado: [
    { key: "certificado", label: "Fecha de terminación" },
    { key: "certificadoExp", label: "Fecha de expedición" },
  ],
};

function getDatesForTemplate(template: Template): DateFieldSpec[] {
  if (DATES_BY_TEMPLATE[template.id]) return DATES_BY_TEMPLATE[template.id];

  const haystack = `${template.id} ${template.name}`.toLowerCase();
  if (haystack.includes("acta")) return DATES_BY_TEMPLATE.acta;
  if (haystack.includes("orden")) return DATES_BY_TEMPLATE.ordenes;
  if (haystack.includes("incidencia")) return DATES_BY_TEMPLATE.incidencias;
  if (haystack.includes("certificado")) return DATES_BY_TEMPLATE.certificado;
  return [];
}

function downloadDoc(doc: GeneratedDoc) {
  const blob = new Blob([new Uint8Array(doc.bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = doc.filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}

export default function DocumentsTab({
  project,
  templates,
  generated,
  generatingId,
  genErrors,
  folderMsg,
  onGenerateDoc,
  onUpdateDate,
  onSaveToFolder,
  onRefreshGenerated,
}: Props) {
  const handleDeleteDoc = async (id: string) => {
    if (!confirm("¿Eliminar este PDF guardado de la obra?")) return;
    await deleteGeneratedDoc(id);
    onRefreshGenerated();
  };

  return (
    <section className="section active">
      <h1>Generar documentos</h1>
      <p className="hint">
        Revisa las fechas de cada impreso y pulsa «Generar PDF». El archivo
        se descarga y queda guardado en esta ficha.
      </p>

      {genErrors.length > 0 && (
        <div className="error-block">
          <strong>Corrige estos datos antes de generar:</strong>
          <ul className="error-list">
            {genErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <div className="doc-list">
        {templates.map((template) => {
          const docDates = getDatesForTemplate(template);
          const isGenerating = generatingId === template.id;
          const isBlocked = generatingId !== null && !isGenerating;

          return (
            <div className="card doc-card" key={template.id}>
              <div className="template-row">
                <div>
                  <strong>{template.name}</strong>
                  <span className="muted">
                    {" · "}{template.builtin ? "Impreso inicial" : "Impreso personalizado"}
                  </span>
                </div>
                <button
                  type="button"
                  className={`btn${isGenerating ? " loading" : ""}`}
                  disabled={isGenerating || isBlocked}
                  onClick={() => onGenerateDoc(template.id)}
                >
                  {isGenerating ? "Generando…" : "Generar PDF"}
                </button>
              </div>

              {docDates.length > 0 && (
                <div className="grid doc-dates">
                  {docDates.map(({ key, label }) => (
                    <div className="field" key={key}>
                      <label htmlFor={`date-${template.id}-${key}`}>{label}</label>
                      <input
                        id={`date-${template.id}-${key}`}
                        type="date"
                        value={normalizeDate(project.dates?.[key])}
                        onChange={(e) => onUpdateDate(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="section-divider" />

      <h2>PDF generados en esta obra</h2>
      <p className="hint">
        Los documentos quedan guardados en este navegador para volver a
        descargarlos cuando quieras, o guardarlos todos en una carpeta.
      </p>

      <div className="actions">
        <button type="button" className="btn secondary" onClick={onSaveToFolder}>
          Guardar todos en una carpeta…
        </button>
      </div>
      {folderMsg && <p className="hint" style={{ marginTop: 8 }}>{folderMsg}</p>}

      <div className="generated-list">
        {!generated.length ? (
          <div className="empty">Todavía no hay PDF guardados para esta obra.</div>
        ) : (
          generated.map((doc) => (
            <div className="card" key={doc.id}>
              <div className="template-row">
                <div>
                  <strong>{doc.templateName}</strong>
                  <span className="muted">
                    {" · "}{new Date(doc.createdAt).toLocaleString("es-ES")}
                  </span>
                  <span className="muted doc-filename">{doc.filename}</span>
                </div>
                <div className="actions" style={{ margin: 0 }}>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => downloadDoc(doc)}
                  >
                    Descargar
                  </button>
                  <button
                    type="button"
                    className="btn danger"
                    onClick={() => handleDeleteDoc(doc.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
