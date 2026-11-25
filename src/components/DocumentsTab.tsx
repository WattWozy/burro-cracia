import type { Project, Template, GeneratedDoc } from "@/lib/types";
import { normalizeDate } from "@/lib/dates";
import { deleteGeneratedDoc } from "@/lib/pdfDb";

type Props = {
  project: Project;
  templates: Template[];
  selectedDocs: Set<string>;
  generated: GeneratedDoc[];
  genMsg: string;
  folderMsg: string;
  onToggleDoc: (id: string) => void;
  onUpdateDate: (key: string, value: string) => void;
  onGenerate: () => void;
  onSaveToFolder: () => void;
  onRefreshGenerated: () => void;
};

export default function DocumentsTab({
  project, templates, selectedDocs, generated, genMsg, folderMsg,
  onToggleDoc, onUpdateDate, onGenerate, onSaveToFolder, onRefreshGenerated,
}: Props) {
  const dates: [string, string][] = [
    ["acta", "Acta de aprobación · fecha de firma"],
    ["ordenes", "Libro de Órdenes · fecha de solicitud"],
    ["incidencias", "Libro de Incidencias · fecha de aprobación del Plan"],
    ["incidenciasFirma", "Libro de Incidencias · fecha de firma"],
    ["certificado", "Certificado final · fecha de terminación"],
    ["certificadoExp", "Certificado final · fecha de expedición"],
    ["expedicionOrdenes", "Libro de Órdenes · fecha de expedición (si se conoce)"],
    ["expedicionIncidencias", "Libro de Incidencias · fecha de expedición (si se conoce)"],
  ];

  return (
    <section className="section active">
      <h1>Generar documentos</h1>
      <p className="hint">
        Marca los impresos que necesitas. Las fechas específicas de cada
        documento no se copian entre sí.
      </p>
      {templates.map((t) => (
        <div className="card" key={t.id}>
          <label className="check">
            <input type="checkbox" checked={selectedDocs.has(t.id)} onChange={() => onToggleDoc(t.id)} />
            <span>
              <strong>{t.name}</strong>
              <span className="muted"> {t.builtin ? "Impreso inicial" : "Impreso añadido por ti"}</span>
            </span>
          </label>
        </div>
      ))}
      <h2>Fechas y datos particulares</h2>
      <div className="grid">
        {dates.map(([key, label]) => (
          <div className="field" key={key}>
            <label>{label}</label>
            <input
              type="date"
              value={normalizeDate(project.dates?.[key])}
              onChange={(e) => onUpdateDate(key, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="actions">
        <button className="btn" onClick={onGenerate}>Generar PDF seleccionados</button>
      </div>
      {genMsg && <div className="muted">{genMsg}</div>}

      <h2>PDF generados en esta obra</h2>
      <p className="hint">
        Los documentos quedarán guardados en esta ficha para volver a
        abrirlos o descargarlos cuando quieras.
      </p>
      <div className="actions">
        <button className="btn secondary" onClick={onSaveToFolder}>
          Guardar PDF de esta obra en una carpeta…
        </button>
      </div>
      {folderMsg && <div className="muted">{folderMsg}</div>}
      <div>
        {!generated.length ? (
          <div className="empty">Todavía no hay PDF guardados para esta obra.</div>
        ) : (
          generated.map((d) => (
            <div className="card" key={d.id}>
              <div className="template-row">
                <div>
                  <strong>{d.templateName}</strong>
                  <span className="muted"> {new Date(d.createdAt).toLocaleString("es-ES")} · {d.filename}</span>
                </div>
                <div className="actions" style={{ margin: 0 }}>
                  <button
                    className="btn secondary"
                    onClick={() => {
                      const blob = new Blob([new Uint8Array(d.bytes)], { type: "application/pdf" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = d.filename;
                      a.click();
                      setTimeout(() => URL.revokeObjectURL(url), 5000);
                    }}
                  >
                    Descargar
                  </button>
                  <button
                    className="btn danger"
                    onClick={async () => {
                      if (!confirm("¿Eliminar este PDF guardado de la obra?")) return;
                      await deleteGeneratedDoc(d.id);
                      onRefreshGenerated();
                    }}
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
