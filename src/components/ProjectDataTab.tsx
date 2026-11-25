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
  message: string;
  onUpdate: (key: FieldKey, value: string) => void;
  onSave: () => void;
};

export default function ProjectDataTab({
  project,
  bureau,
  message,
  onUpdate,
  onSave,
}: Props) {
  const bureauDefaults = useMemo(() => getBureauFieldDefaults(bureau), [bureau]);
  const preloadedKeyRef = useRef<string | null>(null);

  // 1. Preload empty fields once when project/bureau loads
  useEffect(() => {
    if (!bureau) return;

    const loadSignature = `${project.id}:${bureau.id}`;
    if (preloadedKeyRef.current === loadSignature) return;
    preloadedKeyRef.current = loadSignature;

    (Object.keys(bureauDefaults) as FieldKey[]).forEach((key) => {
      const existing = project.data?.[key];
      const fallback = bureauDefaults[key];
      if ((!existing || existing.trim() === "") && fallback) {
        onUpdate(key, fallback);
      }
    });
  }, [project.id, project.data, bureau, bureauDefaults, onUpdate]);

  // 2. Manual action if the user changed values and wants to pull studio data again
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

  function getSafeFieldValue(
  data: Partial<Record<FieldKey, string>> | undefined,
  key: FieldKey,
  isDate: boolean
): string {
  if (!data || !Object.prototype.hasOwnProperty.call(data, key)) {
    return "";
  }

  const raw = data[key];
  if (typeof raw !== "string") {
    return "";
  }

  if (!isDate) {
    return raw;
  }

  const normalized = normalizeDate(raw);
  return typeof normalized === "string" ? normalized : "";
}

  return (
    <section className="section active">
      <h1>Datos generales de la obra</h1>
      <p className="hint">
        Introduce una vez los datos que pueden repetirse en varios
        impresos. Los campos particulares se completan por separado.
      </p>

      <div className="grid">
        {FIELDS.map((k) => {
          const isDate = DATE_FIELDS.includes(k);
          const rawValue = project.data?.[k] ?? "";
          const value = getSafeFieldValue(project.data, k, isDate);
          const studioValue =
            bureauDefaults && Object.prototype.hasOwnProperty.call(bureauDefaults, k) && typeof bureauDefaults[k] === "string"
              ? bureauDefaults[k]
              : undefined;          
          const isModifiedFromStudio =
            Boolean(studioValue) && rawValue !== "" && rawValue !== studioValue;

          return (
            <div
              key={k}
              className={`field ${WIDE_FIELDS.includes(k) ? "wide" : ""}`}
            >
              <label>{KEYS[k]}</label>
              <input
                type={isDate ? "date" : "text"}
                value={value}
                onChange={(e) => onUpdate(k, e.target.value)}
                placeholder={KEYS[k]}
              />
              {isModifiedFromStudio && (
                <small className="muted" style={{ display: "block", marginTop: 4 }}>
                  Valor del despacho: {studioValue}{" "}
                  <button
                    type="button"
                    onClick={() => onUpdate(k, studioValue!)}
                    style={{
                      background: "none",
                      border: 0,
                      padding: 0,
                      color: "var(--blue)",
                      cursor: "pointer",
                      font: "inherit",
                      textDecoration: "underline",
                    }}
                  >
                    Restaurar
                  </button>
                </small>
              )}
            </div>
          );
        })}
      </div>

      <div className="actions">
        <button className="btn" onClick={onSave}>
          Guardar datos de la obra
        </button>

        {bureau && Object.keys(bureauDefaults).length > 0 && (
          <button
            type="button"
            className="btn secondary"
            onClick={() => handleReapplyFromBureau(false)}
          >
            Completar vacíos desde despacho
          </button>
        )}
      </div>

      {message && <div className="notice success">{message}</div>}
    </section>
  );
}