"use client";

import { useState } from "react";
import type { Bureau } from "@/lib/types";
import { v4 as uuid } from "uuid";

interface Props {
  bureau: Bureau;
  onSave: (bureau: Bureau) => void;
}

/**
 * Form for bureau identity, address, contact, and professional list.
 *
 * Local form state is intentional — the user edits freely and saves explicitly.
 * The parent forces a full remount on bureau switch via key={bureauId}, so
 * useState(initialBureau) always initializes with the correct bureau. See ADR-0004.
 */
export default function BureauDataTab({ bureau: initialBureau, onSave }: Props) {
  // Normalize legacy localStorage data that may be missing array/object fields.
  const [bureau, setBureau] = useState({
    ...initialBureau,
    professionals: initialBureau.professionals ?? [],
    address: initialBureau.address ?? { street: "", postalCode: "", municipality: "", province: "" },
    contact: initialBureau.contact ?? { email: "", phone: "", website: "" },
  });
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof Bureau>(key: K, value: Bureau[K]) =>
    setBureau((prev) => ({ ...prev, [key]: value }));

  const updateNested = (section: "address" | "contact", key: string, value: string) =>
    setBureau((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));

  const handleSave = () => {
    onSave(bureau);
    setSaved(true);
    setTimeout(() => setSaved(false), 2_500);
  };

  return (
    <section className="section active">
      <h1>Datos del despacho</h1>
      <p className="hint">
        Gestiona los datos profesionales que se rellenan automáticamente en los impresos.
      </p>

      <h2>Identidad</h2>
      <div className="grid">
        <div className="field wide">
          <label htmlFor="bureau-name">Nombre del despacho</label>
          <input
            id="bureau-name"
            value={bureau.name ?? ""}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="bureau-legal">Razón social</label>
          <input
            id="bureau-legal"
            value={bureau.legalName ?? ""}
            onChange={(e) => update("legalName", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="bureau-cif">CIF</label>
          <input
            id="bureau-cif"
            value={bureau.cif ?? ""}
            onChange={(e) => update("cif", e.target.value)}
          />
        </div>
      </div>

      <h2>Dirección</h2>
      <div className="grid">
        <div className="field wide">
          <label htmlFor="addr-street">Calle y número</label>
          <input
            id="addr-street"
            value={bureau.address?.street ?? ""}
            onChange={(e) => updateNested("address", "street", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="addr-cp">Código postal</label>
          <input
            id="addr-cp"
            value={bureau.address?.postalCode ?? ""}
            onChange={(e) => updateNested("address", "postalCode", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="addr-muni">Municipio</label>
          <input
            id="addr-muni"
            value={bureau.address?.municipality ?? ""}
            onChange={(e) => updateNested("address", "municipality", e.target.value)}
          />
        </div>
        <div className="field wide">
          <label htmlFor="addr-prov">Provincia</label>
          <input
            id="addr-prov"
            value={bureau.address?.province ?? ""}
            onChange={(e) => updateNested("address", "province", e.target.value)}
          />
        </div>
      </div>

      <h2>Contacto</h2>
      <div className="grid">
        <div className="field">
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            type="email"
            value={bureau.contact?.email ?? ""}
            onChange={(e) => updateNested("contact", "email", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="contact-phone">Teléfono</label>
          <input
            id="contact-phone"
            value={bureau.contact?.phone ?? ""}
            onChange={(e) => updateNested("contact", "phone", e.target.value)}
          />
        </div>
        <div className="field wide">
          <label htmlFor="contact-web">Página web</label>
          <input
            id="contact-web"
            value={bureau.contact?.website ?? ""}
            onChange={(e) => updateNested("contact", "website", e.target.value)}
          />
        </div>
      </div>

      <h2>Profesionales</h2>
      {bureau.professionals.length === 0 && (
        <p className="hint">No hay profesionales añadidos todavía.</p>
      )}

      {bureau.professionals.map((pro, idx) => (
        <div key={pro.id} className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <strong>Profesional {idx + 1}</strong>
            <button
              type="button"
              className="btn danger"
              onClick={() =>
                update("professionals", bureau.professionals.filter((p) => p.id !== pro.id))
              }
            >
              Eliminar
            </button>
          </div>
          <div className="grid">
            {(["name", "dni", "colegiado", "colegio", "role"] as const).map((field) => (
              <div key={field} className={field === "role" ? "field wide" : "field"}>
                <label htmlFor={`prof-${pro.id}-${field}`}>
                  {{ name: "Nombre", dni: "DNI", colegiado: "Nº colegiado", colegio: "Colegio", role: "Cargo / especialidad" }[field]}
                </label>
                <input
                  id={`prof-${pro.id}-${field}`}
                  value={pro[field] ?? ""}
                  onChange={(e) =>
                    update("professionals", bureau.professionals.map((p) =>
                      p.id === pro.id ? { ...p, [field]: e.target.value } : p
                    ))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="actions">
        <button
          type="button"
          className="btn secondary"
          onClick={() =>
            update("professionals", [
              ...bureau.professionals,
              { id: uuid(), name: "", dni: "", colegiado: "", colegio: "", role: "" },
            ])
          }
        >
          + Añadir profesional
        </button>
      </div>

      <div className="actions">
        <button type="button" className="btn" onClick={handleSave}>
          Guardar cambios
        </button>
      </div>

      {saved && <div className="notice success">Cambios guardados correctamente.</div>}
    </section>
  );
}
