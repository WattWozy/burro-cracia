import type { Project, Template } from "@/lib/types";
import { normalizeDate } from "@/lib/dates";

type Props = {
  project: Project;
  templates: Template[];
  generatingId: string | null;
  genErrors: string[];
  onGenerateDoc: (templateId: string) => void;
  onUpdateDate: (key: string, value: string) => void;
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

export default function DocumentsTab({
  project,
  templates,
  generatingId,
  genErrors,
  onGenerateDoc,
  onUpdateDate,
}: Props) {
  return (
    <section className="section active">
      <h1>Generar documentos</h1>
      <p className="hint">
        Revisa las fechas de cada impreso y pulsa «Generar PDF» para descargarlo.
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
                  {/* <span className="muted">
                    {" · "}{template.builtin ? "Impreso inicial" : "Impreso personalizado"}
                  </span> */}
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
    </section>
  );
}
