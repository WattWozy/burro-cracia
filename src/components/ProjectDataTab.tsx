"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { Bureau, Project, FieldKey } from "@/lib/types";
import { KEYS } from "@/lib/constants";
import { normalizeDate } from "@/lib/dates";
import { getBureauFieldDefaults } from "@/lib/bureau-defaults";

const DATE_FIELDS = new Set<FieldKey>([
  "fecha_visado",
  "fecha_inicio_obra",
  "fecha_aprobacion_plan",
  "fecha_fin",
]);

const WIDE_FIELDS = new Set<FieldKey>([
  "obra_emplazamiento",
  "arquitectos",
]);

type FieldGroup = { title: string; fields: FieldKey[] };

const GROUPS: FieldGroup[] = [
  {
    title: "La obra",
    fields: [
      "obra", "emplazamiento", "municipio", "obra_emplazamiento",
      "promotor", "constructor", "representante",
    ],
  },
  {
    title: "Equipo facultativo",
    fields: [
      "arquitectos",
      "arquitecto1", "colegiado1",
      "arquitecto2", "colegiado2",
      "arquitecto3", "colegiado3",
      "arquitecto4", "colegiado4",
      "arquitecto_tecnico",
    ],
  },
  {
    title: "Expediente y visado",
    fields: [
      "expediente", "licencia",
      "numero_visado", "fecha_visado",
      "provincia", "delegacion", "lugar",
    ],
  },
  {
    title: "Fechas de la obra",
    fields: ["fecha_inicio_obra", "fecha_aprobacion_plan", "fecha_fin"],
  },
];

type Props = {
  project: Project;
  bureau?: Bureau | null;
  onUpdate: (key: FieldKey, value: string) => void;
};

/**
 * Form for all project fields that appear across multiple documents.
 *
 * Fields are grouped by domain (obra, equipo, expediente, fechas) with subtle dividers.
 * Data persists on every field change via useProjects.updateProjectData — no Save button needed.
 * Bureau defaults are applied once on mount (when fields are empty) and can be re-applied manually.
 */
export default function ProjectDataTab({ project, bureau, onUpdate }: Props) {
  const bureauDefaults = useMemo(() => getBureauFieldDefaults(bureau), [bureau]);
  const preloadedKeyRef = useRef<string | null>(null);

  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!bureau) return;
    const signature = `${project.id}:${bureau.id}`;
    if (preloadedKeyRef.current === signature) return;
    preloadedKeyRef.current = signature;

    (Object.keys(bureauDefaults) as FieldKey[]).forEach((key) => {
      const existing = project.data?.[key];
      const fallback = bureauDefaults[key];
      if ((!existing || existing.trim() === "") && fallback) onUpdate(key, fallback);
    });
  }, [project.id, project.data, bureau, bureauDefaults, onUpdate]);

  const handleUpdate = useCallback(
    (key: FieldKey, value: string) => {
      onUpdate(key, value);
      setLastSaved(Date.now());
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      fadeTimer.current = setTimeout(() => setLastSaved(null), 2_500);
    },
    [onUpdate]
  );

  const handleReapply = (overwrite: boolean) => {
    (Object.keys(bureauDefaults) as FieldKey[]).forEach((key) => {
      const fallback = typeof bureauDefaults[key] === "string" ? bureauDefaults[key] : undefined;
      if (!fallback) return;
      const existing = project.data?.[key];
      if (overwrite || !existing || existing.trim() === "") handleUpdate(key, fallback);
    });
  };

  function getSafeValue(key: FieldKey): string {
    const raw = project.data?.[key];
    if (typeof raw !== "string") return "";
    if (!DATE_FIELDS.has(key)) return raw;
    const normalized = normalizeDate(raw);
    return typeof normalized === "string" ? normalized : "";
  }

  const hasBureauDefaults = bureau && Object.keys(bureauDefaults).length > 0;

  return (
    <section className="section active">
      <div className="tab-header">
        <div>
          <h1>Datos — {project.name}</h1>
          <p className="hint" style={{ marginBottom: 0 }}>
            Campos comunes a varios impresos. Se guardan al escribir.
          </p>
        </div>
        <div className={`save-badge ${lastSaved ? "save-badge--visible" : ""}`}>
          ✓ Guardado
        </div>
      </div>

      {hasBureauDefaults && (
        <div className="bureau-fill-strip">
          <span className="bureau-fill-label">Despacho «{bureau!.name}»:</span>
          <button type="button" className="btn secondary btn--sm" onClick={() => handleReapply(false)}>
            Completar vacíos
          </button>
          <button type="button" className="btn secondary btn--sm" onClick={() => handleReapply(true)}>
            Sobrescribir todo
          </button>
        </div>
      )}

      {GROUPS.map((group, gi) => (
        <div key={group.title}>
          {gi > 0 && <div className="field-group-divider" />}
          <p className="field-group-title">{group.title}</p>
          <div className="grid">
            {group.fields.map((k) => {
              const isDate = DATE_FIELDS.has(k);
              const value = getSafeValue(k);
              const rawValue = project.data?.[k] ?? "";
              const studioValue = typeof bureauDefaults[k] === "string" ? bureauDefaults[k] : undefined;
              const isModified = Boolean(studioValue) && rawValue !== "" && rawValue !== studioValue;

              return (
                <div key={k} className={`field ${WIDE_FIELDS.has(k) ? "wide" : ""}`}>
                  <label>{KEYS[k]}</label>
                  <input
                    type={isDate ? "date" : "text"}
                    value={value}
                    onChange={(e) => handleUpdate(k, e.target.value)}
                    placeholder={KEYS[k]}
                  />
                  {isModified && (
                    <small className="field-hint">
                      Despacho: {studioValue}{" "}
                      <button type="button" className="btn-link" onClick={() => handleUpdate(k, studioValue!)}>
                        Restaurar
                      </button>
                    </small>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
