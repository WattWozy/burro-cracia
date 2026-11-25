import type { Bureau } from "@/lib/types";

type Props = {
  bureaus: Bureau[];
  currentBureauId: string | null;
  newBureauName: string;
  onSelect: (id: string) => void;
  onNameChange: (name: string) => void;
  onCreate: () => void;
};

export default function BureauSelector({
  bureaus, currentBureauId, newBureauName, onSelect, onNameChange, onCreate,
}: Props) {
  return (
    <div className="bureau-bar">
      <strong>Despacho:</strong>
      <select value={currentBureauId || ""} onChange={(e) => onSelect(e.target.value)}>
        {bureaus.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      <input
        placeholder="Nombre del nuevo despacho"
        value={newBureauName}
        onChange={(e) => onNameChange(e.target.value)}
        style={{ maxWidth: 220 }}
      />
      <button className="btn secondary" onClick={onCreate}>＋ Nuevo despacho</button>
    </div>
  );
}
