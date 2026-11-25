import type { Template } from "@/lib/types";
import TemplateUploader from "./TemplateUploader";
import TemplateMapper from "./TemplateMapper";

type Props = {
  templates: Template[];
  configTemplateId: string | null;
  onAdd: (file: File | null, name: string) => void;
  onToggleConfig: (id: string) => void;
  onSaveMapping: (id: string, mapping: Record<string, string>) => void;
  onRemove: (id: string) => void;
};

export default function TemplatesTab({
  templates, configTemplateId, onAdd, onToggleConfig, onSaveMapping, onRemove,
}: Props) {
  return (
    <section className="section active">
      <h1>Incorporar nuevos impresos</h1>
      <p className="hint">
        Sube un PDF rellenable. La aplicación leerá sus campos de
        formulario y te permitirá relacionarlos con los datos de la obra.
      </p>
      <TemplateUploader onAdd={onAdd} />
      {templates.map((t) => (
        <div className="card" key={t.id}>
          <div className="template-row">
            <div>
              <strong>{t.name}</strong>
              <span className="muted"> {(t.fields || []).length} campos detectados</span>
            </div>
            <button className="btn secondary" onClick={() => onToggleConfig(t.id)}>
              Configurar campos
            </button>
          </div>
          {configTemplateId === t.id && (
            <TemplateMapper
              template={t}
              onSave={(mapping) => onSaveMapping(t.id, mapping)}
              onRemove={() => onRemove(t.id)}
            />
          )}
        </div>
      ))}
      <div className="notice">
        En esta versión, los nuevos impresos deben contener campos de
        formulario PDF (AcroForm). Si el PDF es una imagen escaneada o
        tiene casillas dibujadas sin campos, habrá que configurar esos
        campos manualmente en una mejora posterior.
      </div>
    </section>
  );
}
