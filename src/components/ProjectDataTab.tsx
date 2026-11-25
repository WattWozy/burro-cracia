import type { Project, FieldKey } from "@/lib/types";
import { FIELDS, KEYS } from "@/lib/constants";
import { normalizeDate } from "@/lib/dates";

type Props = {
  project: Project;
  message: string;
  onUpdate: (key: FieldKey, value: string) => void;
  onSave: () => void;
};

export default function ProjectDataTab({ project, message, onUpdate, onSave }: Props) {
  return (
    <section className="section active">
      <h1>Datos generales de la obra</h1>
      <p className="hint">
        Introduce una vez los datos que pueden repetirse en varios
        impresos. Los campos particulares se completan por separado.
      </p>
      <div className="grid">
        {FIELDS.map((k) => (
          <div
            key={k}
            className={`field ${["obra_emplazamiento", "arquitectos"].includes(k) ? "wide" : ""}`}
          >
            <label>{KEYS[k]}</label>
            <input
              type={["fecha_visado", "fecha_inicio_obra", "fecha_aprobacion_plan", "fecha_fin"].includes(k) ? "date" : "text"}
              value={normalizeDate(project.data?.[k])}
              onChange={(e) => onUpdate(k, e.target.value)}
              placeholder={KEYS[k]}
            />
          </div>
        ))}
      </div>
      <div className="actions">
        <button className="btn" onClick={onSave}>Guardar datos de la obra</button>
      </div>
      {message && <div className="muted">{message}</div>}
    </section>
  );
}
