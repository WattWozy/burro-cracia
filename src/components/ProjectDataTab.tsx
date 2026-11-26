"use client";

import { useEffect, useMemo, useRef } from "react";
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
 */
export default function ProjectDataTab({ project, bureau, onUpdate }: Props) {
  const bureauDefaults = useMemo(() => getBureauFieldDefaults(bureau), [bureau]);
  // Tracks the last project+bureau combo we applied defaults for — avoids re-applying on re-render.
  const preloadedKeyRef = useRef<string | null>(null);

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

  const handleReapplyFromBureau = (overwrite: boolean) => {
    (Object.keys(bureauDefaults) as FieldKey[]).forEach((key) => {
      const fallback = bureauDefaults[key];
      if (!fallback) return;
      const existing = project.data?.[key];
      if (overwrite || !existing || existing.trim() === "") {
        onUpdate(key, fallback);
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

  return (
    <section className="section active">
      <h1>Datos generales de la obra</h1>
      <p className="hint">
        Introduce una vez los datos que se repiten en varios impresos.
        Cada campo se guarda automáticamente al escribir.
      </p>

      <div className="grid">
        {FIELDS.map((k) => {
          const isDate = DATE_FIELDS.includes(k);
          const value = getSafeValue(k, isDate);
          const rawValue = project.data?.[k] ?? "";
          const studioValue = bureauDefaults[k];
          const isModified = Boolean(studioValue) && rawValue !== "" && rawValue !== studioValue;

          return (
            <div key={k} className={`field ${WIDE_FIELDS.includes(k) ? "wide" : ""}`}>
              <label>{KEYS[k]}</label>
              <input
                type={isDate ? "date" : "text"}
                value={value}
                onChange={(e) => onUpdate(k, e.target.value)}
                placeholder={KEYS[k]}
              />
              {isModified && (
                <small className="field-hint">
                  Despacho: {studioValue}{" "}
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => onUpdate(k, studioValue!)}
                  >
                    Restaurar
                  </button>
                </small>
              )}
            </div>
          );
        })}
      </div>

      {bureau && Object.keys(bureauDefaults).length > 0 && (
        <div className="actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => handleReapplyFromBureau(false)}
          >
            Completar vacíos desde despacho
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => handleReapplyFromBureau(true)}
          >
            Sobrescribir todo desde despacho
          </button>
        </div>
      )}

      <p className="hint" style={{ marginTop: 14 }}>
        Los datos se guardan automáticamente en este navegador.
      </p>
    </section>
  );
}
