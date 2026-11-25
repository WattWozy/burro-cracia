import type { Bureau } from "../types";
import { v4 as uuid } from "uuid";

export function createDefaultBureau(): Bureau {
  return {
    id: uuid(),
    name: "Mi despacho",
    legalName: "",
    cif: "",
    createdAt: new Date().toISOString(),
    professionals: [],
    address: {
      street: "",
      postalCode: "",
      municipality: "",
      province: "",
    },
    contact: {
      email: "",
      phone: "",
      website: "",
    },
    defaults: {},
  };
}