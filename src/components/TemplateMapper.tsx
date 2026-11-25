import { useState } from "react";
import type { Template } from "@/lib/types";
import { KEYS } from "@/lib/constants";

export default function TemplateMapper({
  template, onSave, onRemove,
}: {
  template: Template;
  onSave: (mapping: Record<string, string>) => void;
  onRemove: () => void;
}) {
  const [mapping, setMapping] = useState<Record<string, string>>(template.mapping || {});

  return (
    <div>
      <h2>Relacionar campos de este impreso</h2>
      <p className="muted">
        Elige qué dato de la ficha debe escribirse en cada campo. Si no
        corresponde, deja “No rellenar”.
      </p>
      {(template.fields || []).map((f) => (
        <div className="fieldmap" key={f.name}>
          <label>
            {f.name}
            <br />
            <span className="muted">{f.type}</span>
          </label>
          <select
            value={mapping[f.name] || ""}
            onChange={(e) => setMapping((current) => {
              const next = { ...current };
              if (e.target.value) next[f.name] = e.target.value;
              else delete next[f.name];
              return next;
            })}
          >
            <option value="">No rellenar</option>
            {Object.entries(KEYS).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
      ))}
      <div className="actions">
        <button className="btn" onClick={() => onSave(mapping)}>Guardar correspondencias</button>
        <button className="btn danger" onClick={onRemove}>Eliminar plantilla</button>
      </div>
    </div>
  );
}
