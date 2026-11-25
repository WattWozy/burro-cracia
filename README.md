# Rellenador de documentos · Obras (Next.js)

Versión multi-despacho de la herramienta de relleno de formularios PDF para obras de arquitectura (colegio / COAVN y similares).

## Qué incluye

- **Multi-despacho**: varios bureaus independientes en el mismo navegador (datos aislados por despacho).
- Gestión de **obras** (proyectos) con datos comunes reutilizables.
- **4 plantillas PDF** oficiales embebidas (Acta Plan SyS, Certificado final, Libro de Órdenes, Libro de Incidencias).
- Generación de PDF rellenados con **pdf-lib**.
- Añadir plantillas PDF propias (AcroForm) y mapear campos.
- Almacenamiento local (localStorage + IndexedDB).
- Copia de seguridad / restauración por despacho.
- Exportación a carpeta (File System Access API donde esté disponible).

## Cómo arrancar

```bash
cd rellenador-next
npm install
npm run dev
```

Abre http://localhost:3000

## Estructura relevante

- `public/templates/` — PDFs originales
- `src/lib/constants.ts` — mapeos de campos y claves
- `src/lib/pdf.ts` — lógica de relleno
- `src/app/page.tsx` — UI completa (client component)

## Notas

- Todo es **client-side**. No hay backend ni sincronización en la nube.
- Las firmas y visados siguen siendo manuales.
- Revisa siempre los PDF generados antes de usarlos oficialmente.

## Próximos pasos posibles

- Autenticación + backend (Supabase / Firebase) para sincronizar entre dispositivos.
- Roles por despacho / usuario.
- Plantillas adicionales del colegio.
- Firma electrónica integrada (si el colegio lo permite).
