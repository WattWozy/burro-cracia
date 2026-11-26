import type { Bureau, FieldKey } from "@/lib/types";

export function getBureauFieldDefaults(
  bureau?: Bureau | null
): Partial<Record<FieldKey, string>> {
  if (!bureau) return {};

  const pros = bureau.professionals ?? [];
  const [pro1, pro2, pro3, pro4] = pros;
  const technicalPro = pros.find((p) =>
    /t[eé]cnico|aparejador|arquitecto t[eé]cnico/i.test(p.role ?? "")
  );

  const architectsSummary = [pro1, pro2, pro3, pro4]
    .map((p) => p?.name)
    .filter((name): name is string => Boolean(name?.trim()))
    .join(", ");

  const mapped: Partial<Record<FieldKey, string>> = {};

  if (bureau.address?.province) mapped.provincia = bureau.address.province;
  if (bureau.address?.municipality) {
    mapped.lugar = bureau.address.municipality;
    mapped.incid_lugar = bureau.address.municipality;
  }
  if (architectsSummary) mapped.arquitectos = architectsSummary;
  if (pro1?.name) mapped.arquitecto1 = pro1.name;
  if (pro1?.colegiado) mapped.colegiado1 = pro1.colegiado;
  if (pro2?.name) mapped.arquitecto2 = pro2.name;
  if (pro2?.colegiado) mapped.colegiado2 = pro2.colegiado;
  if (pro3?.name) mapped.arquitecto3 = pro3.name;
  if (pro3?.colegiado) mapped.colegiado3 = pro3.colegiado;
  if (pro4?.name) mapped.arquitecto4 = pro4.name;
  if (pro4?.colegiado) mapped.colegiado4 = pro4.colegiado;
  if (technicalPro?.name) mapped.arquitecto_tecnico = technicalPro.name;

  const combined: Partial<Record<FieldKey, string>> = {
    ...mapped,
    ...(bureau.defaults ?? {}),
  };

  // Also watch out for `Object.entries` if `constructor` isn't an own property —
  // `Object.entries` only iterates own enumerable properties, so it's safe at runtime.
  const cleaned: Partial<Record<FieldKey, string>> = {};
  for (const [key, value] of Object.entries(combined) as [FieldKey, string | undefined][]) {
    if (typeof value === "string" && value.trim() !== "") {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

export function applyBureauDefaults(
  currentData: Partial<Record<FieldKey, string>> | undefined,
  bureau?: Bureau | null,
  options: { overwrite?: boolean } = {}
): Partial<Record<FieldKey, string>> {
  const defaults = getBureauFieldDefaults(bureau);
  const next: Partial<Record<FieldKey, string>> = { ...(currentData ?? {}) };

  (Object.keys(defaults) as FieldKey[]).forEach((key) => {
    const defaultValue = defaults[key];
    if (!defaultValue) return;

    const currentValue = next[key];
    const isEmpty = !currentValue || currentValue.trim() === "";

    if (options.overwrite || isEmpty) {
      next[key] = defaultValue;
    }
  });

  return next;
}