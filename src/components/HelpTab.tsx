type Props = {
  onExport: () => void;
  onImport: (file: File | null) => void;
};

export default function HelpTab({ onExport, onImport }: Props) {
  return (
    <section className="section active">
      <h1>Ayuda y alcance de esta versión</h1>
      <div className="card">
        <strong>Qué hace esta versión (Next.js multi-despacho)</strong>
        <ul>
          <li>Varios despachos / bureaus independientes en el mismo navegador.</li>
          <li>Varias fichas de obra por despacho.</li>
          <li>Reutiliza datos comunes en los cuatro impresos iniciales.</li>
          <li>Permite introducir fechas distintas por documento.</li>
          <li>Genera PDF rellenados conservando la plantilla original.</li>
          <li>Permite añadir PDF con campos de formulario y asignar sus campos.</li>
        </ul>
      </div>
      <div className="notice">
        <strong>Importante sobre almacenamiento:</strong> esta versión
        guarda los datos y plantillas en el navegador de este ordenador,
        separados por despacho. Todavía no sincroniza en la nube ni
        comparte datos entre ordenadores. Haz copias de seguridad con
        frecuencia.
      </div>
      <div className="card">
        <strong>Firmas y visados</strong>
        <p className="muted">
          La aplicación no firma, visa ni presenta documentos. Los
          espacios de firma permanecen para su firma posterior. Revisa
          siempre los PDF antes de utilizarlos.
        </p>
      </div>
      <div className="actions">
        <button className="btn secondary" onClick={onExport}>
          Descargar copia de seguridad de este despacho
        </button>
        <label className="btn secondary" style={{ cursor: "pointer" }}>
          Restaurar copia de seguridad
          <input type="file" accept="application/json" hidden onChange={(e) => onImport(e.target.files?.[0] || null)} />
        </label>
      </div>
    </section>
  );
}
