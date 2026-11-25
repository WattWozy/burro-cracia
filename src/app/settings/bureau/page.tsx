
"use client";

import { useEffect, useState } from "react";
import type { Bureau } from "@/lib/types";
import { loadBureaus, saveBureaus } from "@/lib/storage";
import { v4 as uuid } from "uuid";

export default function BureauSettingsPage() {
  const [bureau, setBureau] = useState<Bureau | null>(null);
  const [bureaus, setBureaus] = useState<Bureau[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loaded = loadBureaus();
    setBureaus(loaded.bureaus);
    setCurrentId(loaded.currentId);

    const current = loaded.bureaus.find(
      (b) => b.id === loaded.currentId
    );

    setBureau(current ?? null);
    setReady(true);
  }, []);

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
    if (!bureau || !currentId) return;

    const next = bureaus.map((b) =>
      b.id === bureau.id ? bureau : b
    );

    setBureaus(next);
    saveBureaus(next, currentId);
    setMessage("Cambios guardados correctamente.");

    setTimeout(() => setMessage(""), 3000);
  };

  if (!ready) return <div className="wrap">Cargando...</div>;

  if (!bureau) {
    return (
      <div className="wrap">
        <p className="muted">No hay ningún despacho seleccionado.</p>
      </div>
    );
  }

  return (
    <div className="wrap">
      <header style={{ marginBottom: 24 }}>
        <a href="/" className="muted">← Volver</a>
        <h1>Configuración del despacho</h1>
        <p className="muted">
          Gestiona los datos profesionales utilizados en tus documentos.
        </p>
      </header>

      <main className="panel">
        <h2>Identidad profesional</h2>

        <label>Nombre del despacho</label>
        <input
          value={bureau.name}
          onChange={(e) => update("name", e.target.value)}
        />

        <label>Razón social</label>
        <input
          value={bureau.legalName}
          onChange={(e) => update("legalName", e.target.value)}
        />

        <label>CIF</label>
        <input
          value={bureau.cif}
          onChange={(e) => update("cif", e.target.value)}
        />

        <hr />

        <h2>Dirección</h2>

        <label>Calle y número</label>
        <input
          value={bureau.address.street}
          onChange={(e) =>
            updateNested("address", "street", e.target.value)
          }
        />

        <label>Código postal</label>
        <input
          value={bureau.address.postalCode}
          onChange={(e) =>
            updateNested("address", "postalCode", e.target.value)
          }
        />

        <label>Municipio</label>
        <input
          value={bureau.address.municipality}
          onChange={(e) =>
            updateNested("address", "municipality", e.target.value)
          }
        />

        <label>Provincia</label>
        <input
          value={bureau.address.province}
          onChange={(e) =>
            updateNested("address", "province", e.target.value)
          }
        />

        <hr />

        <h2>Contacto</h2>

        <label>Email</label>
        <input
          type="email"
          value={bureau.contact.email}
          onChange={(e) =>
            updateNested("contact", "email", e.target.value)
          }
        />

        <label>Teléfono</label>
        <input
          value={bureau.contact.phone}
          onChange={(e) =>
            updateNested("contact", "phone", e.target.value)
          }
        />

        <label>Página web</label>
        <input
          value={bureau.contact.website}
          onChange={(e) =>
            updateNested("contact", "website", e.target.value)
          }
        />

        <hr />

        <h2>Profesionales</h2>

        {bureau.professionals.map((professional, index) => (
        <div
            key={professional.id}
            style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>Profesional {index + 1}</h3>
            <button
                type="button"
                onClick={() =>
                update(
                    "professionals",
                    bureau.professionals.filter(
                    (p) => p.id !== professional.id
                    )
                )
                }
            >
                Eliminar
            </button>
            </div>

            {(
            ["name", "dni", "colegiado", "colegio", "role"] as const
            ).map((field) => (
            <div key={field}>
                <label>
                {{
                    name: "Nombre",
                    dni: "DNI",
                    colegiado: "Número de colegiado",
                    colegio: "Colegio profesional",
                    role: "Cargo / especialidad",
                }[field]}
                </label>

                <input
                value={professional[field]}
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
        ))}

        <button
        type="button"
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

        <hr />

        <button onClick={save}>Guardar cambios</button>

        {message && (
          <p className="muted">{message}</p>
        )}
      </main>
    </div>
  );
}
