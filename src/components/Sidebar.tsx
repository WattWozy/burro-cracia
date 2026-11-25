import type { Tab } from "./types";

const items: [Tab, string][] = [
  ["obras", "▦ Obras"],
  ["datos", "▤ Datos de la obra"],
  ["documentos", "▣ Generar documentos"],
  ["plantillas", "＋ Nuevos impresos"],
  ["ayuda", "ⓘ Ayuda y límites"],
];

export default function Sidebar({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <aside className="nav">
      {items.map(([id, label]) => (
        <button key={id} className={tab === id ? "active" : ""} onClick={() => onChange(id)}>
          {label}
        </button>
      ))}
    </aside>
  );
}
