import { useState } from "react";

export default function TemplateUploader({
  onAdd,
}: {
  onAdd: (file: File | null, name: string) => void;
}) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  return (
    <>
      <div className="field">
        <label>Nombre de la plantilla</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Solicitud de licencia" />
      </div>
      <div className="field" style={{ marginTop: 10 }}>
        <label>Archivo PDF</label>
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>
      <div className="actions">
        <button className="btn" onClick={() => onAdd(file, name)}>Analizar e incorporar PDF</button>
      </div>
    </>
  );
}
