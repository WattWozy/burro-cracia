"use client";

import { useState } from "react";
import type { Bureau } from "@/lib/types";
import {  saveBureaus } from "@/lib/storage";
import { v4 as uuid } from "uuid";

interface Props {
  bureau: Bureau;
  onSave: (bureau: Bureau) => void;
}

export default function BureauDataTab({ bureau: initialBureau, onSave }: Props) {
  const [bureau, setBureau] = useState(initialBureau);
  const [message, setMessage] = useState("");

  const update = <K extends keyof Bureau>(
    key: K,
    value: Bureau[K]
  ) => {
    setBureau((previous) =>
      previous ? { ...previous, [key]: value } : previous
    );
  };

  const updateNested = (
    section: "address" | "contact",
    key: string,
    value: string
  ) => {
    setBureau((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        [section]: {
          ...previous[section],
          [key]: value,
        },
      };
    });
  };

  const save = () => {
    onSave(bureau);
    setMessage("Cambios guardados correctamente.");
  };

  if (!bureau) {
    return (
      <div className="wrap">
        <p className="muted">No hay ningún despacho seleccionado.</p>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="top">
        <div>
          <a href="/" className="muted">
            ← Volver
          </a>
          <h1 style={{ marginTop: 6 }}>Configuración del despacho</h1>
          <p className="hint" style={{ marginBottom: 0 }}>
            Gestiona los datos profesionales utilizados en tus documentos.
          </p>
        </div>
        {bureau.cif && <span className="pill">CIF: {bureau.cif}</span>}
      </div>

      <main className="panel">
        <h2 style={{ marginTop: 0 }}>Identidad profesional</h2>
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
            <label htmlFor="bureau-legal-name">Razón social</label>
            <input
              id="bureau-legal-name"
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
            <label htmlFor="address-street">Calle y número</label>
            <input
              id="address-street"
              value={bureau.address?.street ?? ""}
              onChange={(e) => updateNested("address", "street", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="address-postal-code">Código postal</label>
            <input
              id="address-postal-code"
              value={bureau.address?.postalCode ?? ""}
              onChange={(e) =>
                updateNested("address", "postalCode", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label htmlFor="address-municipality">Municipio</label>
            <input
              id="address-municipality"
              value={bureau.address?.municipality ?? ""}
              onChange={(e) =>
                updateNested("address", "municipality", e.target.value)
              }
            />
          </div>

          <div className="field wide">
            <label htmlFor="address-province">Provincia</label>
            <input
              id="address-province"
              value={bureau.address?.province ?? ""}
              onChange={(e) =>
                updateNested("address", "province", e.target.value)
              }
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
            <label htmlFor="contact-website">Página web</label>
            <input
              id="contact-website"
              value={bureau.contact?.website ?? ""}
              onChange={(e) => updateNested("contact", "website", e.target.value)}
            />
          </div>
        </div>

        <h2>Profesionales</h2>
        {bureau.professionals.length === 0 && (
          <p className="muted">No hay profesionales añadidos todavía.</p>
        )}

        {bureau.professionals.map((professional, index) => (
          <div key={professional.id} className="card">
            <div className="row" style={{ marginBottom: 12 }}>
              <strong>Profesional {index + 1}</strong>
              <button
                type="button"
                className="btn danger"
                onClick={() =>
                  update(
                    "professionals",
                    bureau.professionals.filter((p) => p.id !== professional.id)
                  )
                }
              >
                Eliminar
              </button>
            </div>

            <div className="grid">
              {(
                ["name", "dni", "colegiado", "colegio", "role"] as const
              ).map((field) => (
                <div
                  key={field}
                  className={field === "role" ? "field wide" : "field"}
                >
                  <label htmlFor={`prof-${professional.id}-${field}`}>
                    {
                      {
                        name: "Nombre",
                        dni: "DNI",
                        colegiado: "Número de colegiado",
                        colegio: "Colegio profesional",
                        role: "Cargo / especialidad",
                      }[field]
                    }
                  </label>

                  <input
                    id={`prof-${professional.id}-${field}`}
                    value={professional[field] ?? ""}
                    onChange={(e) =>
                      update(
                        "professionals",
                        bureau.professionals.map((p) =>
                          p.id === professional.id
                            ? { ...p, [field]: e.target.value }
                            : p
                        )
                      )
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
                {
                  id: uuid(),
                  name: "",
                  dni: "",
                  colegiado: "",
                  colegio: "",
                  role: "",
                },
              ])
            }
          >
            + Añadir profesional
          </button>
        </div>

        <div className="actions">
          <button type="button" className="btn" onClick={save}>
            Guardar cambios
          </button>
        </div>

        {message && <div className="notice success">{message}</div>}
      </main>
    </div>
  );
}