"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { Bureau, Project, FieldKey } from "@/lib/types";
import { FIELDS, KEYS } from "@/lib/constants";
import { normalizeDate } from "@/lib/dates";
import { getBureauFieldDefaults } from "@/lib/bureau-defaults";

const DATE_FIELDS: FieldKey[] = [
  "fecha_visado",
  "fecha_inicio_obra",
  "fecha_aprobacion_plan",
  "fecha_fin",
];

const WIDE_FIELDS: FieldKey[] = ["obra_emplazamiento", "arquitectos"];

type Props = {
  project: Project;
  bureau?: Bureau | null;
  onUpdate: (key: FieldKey, value: string) => void;
};

/**
 * Form for all project fields that appear across multiple documents.
 *
 * Data persists on every field change via useProjects.updateProjectData — no Save button needed.
 * Bureau defaults are applied once on mount (when fields are empty) and can be re-applied manually.
 * A "✓ Guardado" indicator confirms each save without requiring user action.
 */
export default function ProjectDataTab({ project, bureau, onUpdate }: Props) {
  const bureauDefaults = useMemo(() => getBureauFieldDefaults(bureau), [bureau]);
  const preloadedKeyRef = useRef<string | null>(null);

  // Tracks last save timestamp to drive the "Guardado" indicator.
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Apply bureau defaults to empty fields once per (project, bureau) pair.
  useEffect(() => {
    if (!bureau) return;
    const signature = `${project.id}:${bureau.id}`;
    if (preloadedKeyRef.current === signature) return;
    preloadedKeyRef.current = signature;

    (Object.keys(bureauDefaults) as FieldKey[]).forEach((key) => {
      const existing = project.data?.[key];
      const fallback = bureauDefaults[key];
      if ((!existing || existing.trim() === "") && fallback) {
        onUpdate(key, fallback);
      }
    });
  }, [project.id, project.data, bureau, bureauDefaults, onUpdate]);

  // Wraps onUpdate to also trigger the save indicator.
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
      if (overwrite || !existing || existing.trim() === "") {
        handleUpdate(key, fallback);
      }
    });
  };

  function getSafeValue(key: FieldKey, isDate: boolean): string {
    const raw = project.data?.[key];
    if (typeof raw !== "string") return "";
    if (!isDate) return raw;
    const normalized = normalizeDate(raw);
    return typeof normalized === "string" ? normalized : "";
  }

  const hasBureauDefaults = bureau && Object.keys(bureauDefaults).length > 0;

  return (
    <section className="section active">
      <div className="tab-header">
        <div>
          <h1>Datos generales de la obra</h1>
          <p className="hint" style={{ marginBottom: 0 }}>
            Campos que se repiten en varios impresos. Se guardan al escribir.
          </p>
        </div>
        <div className={`save-badge ${lastSaved ? "save-badge--visible" : ""}`}>
          ✓ Guardado
        </div>
      </div>

      {hasBureauDefaults && (
        <div className="bureau-fill-strip">
          <span className="bureau-fill-label">
            Datos del despacho «{bureau!.name}»:
          </span>
          <button
            type="button"
            className="btn secondary btn--sm"
            onClick={() => handleReapply(false)}
          >
            Completar vacíos
          </button>
          <button
            type="button"
            className="btn secondary btn--sm"
            onClick={() => handleReapply(true)}
          >
            Sobrescribir todo
          </button>
        </div>
      )}

      <div className="grid" style={{ marginTop: 16 }}>
        {FIELDS.map((k) => {
          const isDate = DATE_FIELDS.includes(k);
          const value = getSafeValue(k, isDate);
          const rawValue = project.data?.[k] ?? "";
          const studioValue = typeof bureauDefaults[k] === "string" ? bureauDefaults[k] : undefined;
          const isModified = Boolean(studioValue) && rawValue !== "" && rawValue !== studioValue;

          return (
            <div key={k} className={`field ${WIDE_FIELDS.includes(k) ? "wide" : ""}`}>
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
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => handleUpdate(k, studioValue!)}
                  >
                    Restaurar
                  </button>
                </small>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
