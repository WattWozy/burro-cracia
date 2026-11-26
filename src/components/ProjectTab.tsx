import type { Project } from "@/lib/types";

type Props = {
  projects: Project[];
  currentProject: Project | null;
  currentProjectId: string | null;
  newProjectName: string;
  onSelect: (id: string) => void;
  onNameChange: (name: string) => void;
  onCreate: () => void;
  onDelete: () => void;
  onContinue: () => void;
};

export default function ProjectTab({
  projects, currentProject, currentProjectId, newProjectName,
  onSelect, onNameChange, onCreate, onDelete, onContinue,
}: Props) {
  return (
    <section className="section active">
      <h1>Obras</h1>
      <p className="hint">
        Crea una ficha por obra. Los datos quedan guardados en este
        navegador, separados por despacho.
      </p>
      <div className="grid">
        <div className="field wide">
          <label>Obra seleccionada</label>
          <select value={currentProjectId || ""} onChange={(e) => onSelect(e.target.value)}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Nombre corto de la obra</label>
          <input
            value={newProjectName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ej. Reforma vivienda Pamplona"
          />
        </div>
        <div className="field" style={{ alignSelf: "end" }}>
          <button className="btn" onClick={onCreate}>＋ Crear obra</button>
        </div>
      </div>
      {currentProject && (
        <div className="card">
          <div className="row">
            <strong>{currentProject.name}</strong>
            <span className="pill">Ficha guardada</span>
          </div>
          <p className="muted">
            {currentProject.data?.emplazamiento || "Sin emplazamiento"} ·{" "}
            {currentProject.data?.municipio || "Sin municipio"}
          </p>
          <div className="actions" style={{ marginTop: 12 }}>
            <button className="btn" onClick={onContinue}>Continuar con los datos →</button>
            <button className="btn danger" onClick={onDelete}>Eliminar esta obra</button>
          </div>
        </div>
      )}
      <div className="notice">
        Consejo: crea una obra y completa su ficha. Podrás volver a
        seleccionarla más adelante. Cada despacho tiene sus propias
        obras y plantillas.
      </div>
    </section>
  );
}
