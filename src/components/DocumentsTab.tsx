import type { Project, Template, GeneratedDoc } from "@/lib/types";
import { normalizeDate } from "@/lib/dates";
import { deleteGeneratedDoc } from "@/lib/pdfDb";

type Props = {
  project: Project;
  templates: Template[];
  generated: GeneratedDoc[];
  genMsg: string;
  folderMsg: string;
  onGenerateDoc: (templateId: string) => void;
  onUpdateDate: (key: string, value: string) => void;
  onSaveToFolder: () => void;
  onRefreshGenerated: () => void;
};

type DateFieldSpec = {
  key: string;
  label: string;
};

/**
 * Maps template IDs (or prefixes/slugs depending on your `Template.id` shape)
 * to the specific date fields that belong to that document.
 */
const DATES_BY_TEMPLATE: Record<string, DateFieldSpec[]> = {
  acta: [
    { key: "acta", label: "Fecha de firma" },
  ],
  ordenes: [
    { key: "ordenes", label: "Fecha de solicitud" },
    { key: "expedicionOrdenes", label: "Fecha de expedición (si se conoce)" },
  ],
  incidencias: [
    { key: "incidencias", label: "Fecha de aprobación del Plan" },
    { key: "incidenciasFirma", label: "Fecha de firma" },
    { key: "expedicionIncidencias", label: "Fecha de expedición (si se conoce)" },
  ],
  certificado: [
    { key: "certificado", label: "Fecha de terminación" },
    { key: "certificadoExp", label: "Fecha de expedición" },
  ],
};

function getDatesForTemplate(template: Template): DateFieldSpec[] {
  if (DATES_BY_TEMPLATE[template.id]) {
    return DATES_BY_TEMPLATE[template.id];
  }

  // Fallback for custom or slightly differently named template IDs/names
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
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function DocumentsTab({
  project,
  templates,
  generated,
  genMsg,
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
        Revisa las fechas de cada impreso y genéralo de uno en uno. Las fechas
        específicas de cada documento no se copian entre sí.
      </p>

      <div className="doc-list" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {templates.map((template) => {
          const docDates = getDatesForTemplate(template);

          return (
            <div className="card doc-card" key={template.id}>
              <div className="template-row">
                <div>
                  <strong>{template.name}</strong>
                  <span className="muted">
                    {" "}
                    {template.builtin ? "Impreso inicial" : "Impreso añadido por ti"}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => onGenerateDoc(template.id)}
                >
                  Generar PDF
                </button>
              </div>

              {docDates.length > 0 && (
                <div className="grid" style={{ marginTop: "0.75rem" }}>
                  {docDates.map(({ key, label }) => {
                    const inputId = `date-${template.id}-${key}`;
                    return (
                      <div className="field" key={key}>
                        <label htmlFor={inputId}>{label}</label>
                        <input
                          id={inputId}
                          type="date"
                          value={normalizeDate(project.dates?.[key])}
                          onChange={(e) => onUpdateDate(key, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {genMsg && (
        <div className="muted" style={{ marginTop: "0.75rem" }}>
          {genMsg}
        </div>
      )}

      <h2>PDF generados en esta obra</h2>
      <p className="hint">
        Los documentos quedarán guardados en esta ficha para volver a
        abrirlos o descargarlos cuando quieras.
      </p>

      <div className="actions">
        <button type="button" className="btn secondary" onClick={onSaveToFolder}>
          Guardar PDF de esta obra en una carpeta…
        </button>
      </div>

      {folderMsg && <div className="muted">{folderMsg}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
        {!generated.length ? (
          <div className="empty">Todavía no hay PDF guardados para esta obra.</div>
        ) : (
          generated.map((doc) => (
            <div className="card" key={doc.id}>
              <div className="template-row">
                <div>
                  <strong>{doc.templateName}</strong>
                  <span className="muted">
                    {" "}
                    {new Date(doc.createdAt).toLocaleString("es-ES")} · {doc.filename}
                  </span>
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