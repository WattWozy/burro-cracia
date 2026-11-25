"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import type { Bureau, Project, Template, GeneratedDoc, FieldKey } from "@/lib/types";
import { BUILTIN_TEMPLATES } from "@/lib/constants";
import {
  loadBureaus, saveBureaus, loadProjects, saveProjects, loadTemplates,
  saveTemplates, createDefaultBureau, createDefaultProject,
} from "@/lib/storage";
import { fillTemplate, safeFilename } from "@/lib/pdf";
import { saveGeneratedDoc, getGeneratedDocs } from "@/lib/pdfDb";
import { validateProject } from "@/lib/validation";

import type { Tab } from "../components/types";
import AppHeader from "../components/AppHeader";
import BureauSelector from "../components/BureauSelector";
import Sidebar from "../components/Sidebar";
import ProjectTab from "../components/ProjectTab";
import ProjectDataTab from "../components/ProjectDataTab";
import DocumentsTab from "../components/DocumentsTab";
import TemplatesTab from "../components/TemplatesTab";
import HelpTab from "../components/HelpTab";

export default function HomePage() {
  const [ready, setReady] = useState(false);
  const [bureaus, setBureaus] = useState<Bureau[]>([]);
  const [currentBureauId, setCurrentBureauId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [tab, setTab] = useState<Tab>("obras");
  const [msg, setMsg] = useState("");
  const [genMsg, setGenMsg] = useState("");
  const [folderMsg, setFolderMsg] = useState("");
  const [generated, setGenerated] = useState<GeneratedDoc[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(
    new Set(BUILTIN_TEMPLATES.map((t) => t.id))
  );
  const [configTemplateId, setConfigTemplateId] = useState<string | null>(null);
  const [newBureauName, setNewBureauName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");

  const allTemplates = useMemo(
    () => [...BUILTIN_TEMPLATES, ...customTemplates],
    [customTemplates]
  );
  const currentProject = projects.find((p) => p.id === currentProjectId) || null;
  const currentBureau = bureaus.find((b) => b.id === currentBureauId) || null;

  useEffect(() => {
    const { bureaus: loadedBureaus, currentId } = loadBureaus();
    let list = loadedBureaus;
    let id = currentId;
    if (!list.length) {
      const bureau = createDefaultBureau();
      list = [bureau];
      id = bureau.id;
      saveBureaus(list, id);
    }
    setBureaus(list);
    setCurrentBureauId(id);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!currentBureauId) return;
    let loadedProjects = loadProjects(currentBureauId);
    const bureau = bureaus.find((b) => b.id === currentBureauId);
    if (!loadedProjects.length) {
      loadedProjects = [createDefaultProject(bureau?.defaults)];
      saveProjects(currentBureauId, loadedProjects);
    }
    setProjects(loadedProjects);
    setCurrentProjectId(loadedProjects[0].id);
    setCustomTemplates(loadTemplates(currentBureauId));
  }, [currentBureauId]);

  const saveBureauDefaults = () => {
    if (!currentBureau || !currentProject || !currentBureauId) return;
    if (!confirm("¿Guardar los datos profesionales actuales como valores predeterminados del despacho?")) return;

    const defaultFields: FieldKey[] = [
      "arquitectos", "arquitecto1", "arquitecto2", "colegiado1", "colegiado2",
      "colegiado3", "colegiado4", "arquitecto_tecnico", "delegacion",
      "provincia", "lugar",
    ];
    const defaults: Partial<Record<FieldKey, string>> = Object.fromEntries(
      defaultFields.map((field) => [field, currentProject.data[field] || ""])
    ) as Partial<Record<FieldKey, string>>;

    const next = bureaus.map((bureau) =>
      bureau.id === currentBureauId ? { ...bureau, defaults } : bureau
    );
    setBureaus(next);
    saveBureaus(next, currentBureauId);
    setMsg("Valores predeterminados del despacho guardados.");
  };

  const refreshGenerated = useCallback(async () => {
    if (!currentProjectId) {
      setGenerated([]);
      return;
    }
    try {
      setGenerated(await getGeneratedDocs(currentProjectId));
    } catch {
      setGenerated([]);
    }
  }, [currentProjectId]);

  useEffect(() => {
    refreshGenerated();
  }, [refreshGenerated]);

  const persistProjects = (next: Project[]) => {
    if (!currentBureauId) return;
    setProjects(next);
    saveProjects(currentBureauId, next);
  };

  const persistTemplates = (next: Template[]) => {
    if (!currentBureauId) return;
    setCustomTemplates(next);
    saveTemplates(currentBureauId, next);
  };

  const updateProjectData = (key: FieldKey, value: string) => {
    if (!currentProject) return;
    persistProjects(projects.map((project) =>
      project.id === currentProject.id
        ? { ...project, data: { ...project.data, [key]: value } }
        : project
    ));
  };

  const updateProjectDate = (key: string, value: string) => {
    if (!currentProject) return;
    persistProjects(projects.map((project) =>
      project.id === currentProject.id
        ? { ...project, dates: { ...project.dates, [key]: value } }
        : project
    ));
  };

  const createBureau = () => {
    const name = newBureauName.trim();
    if (!name) {
      alert("Escribe un nombre para el despacho.");
      return;
    }
    const bureau: Bureau = { id: uuid(), name, createdAt: new Date().toISOString() };
    const next = [...bureaus, bureau];
    setBureaus(next);
    setCurrentBureauId(bureau.id);
    saveBureaus(next, bureau.id);
    setNewBureauName("");
  };

  const createProject = () => {
    const name = newProjectName.trim();
    if (!name) {
      alert("Escribe un nombre para la obra.");
      return;
    }
    const project: Project = {
      id: uuid(),
      name,
      data: { ...(currentBureau?.defaults || {}) },
      dates: {},
    };
    persistProjects([...projects, project]);
    setCurrentProjectId(project.id);
    setNewProjectName("");
    setTab("datos");
  };

  const deleteProject = () => {
    if (projects.length <= 1) {
      alert("Debe quedar al menos una obra.");
      return;
    }
    if (!confirm("¿Eliminar esta obra y sus datos?")) return;
    const next = projects.filter((project) => project.id !== currentProjectId);
    persistProjects(next);
    setCurrentProjectId(next[0].id);
  };

  const toggleDoc = (id: string) => {
    setSelectedDocs((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const generate = async () => {
    if (!currentProject) return;
    const chosen = allTemplates.filter((template) => selectedDocs.has(template.id));
    if (!chosen.length) {
      alert("Selecciona al menos un impreso.");
      return;
    }
    setGenMsg("Generando PDF…");
    const errors = validateProject(currentProject);
    try {
      for (const template of chosen) {
        setGenMsg(`Generando: ${template.name}…`);
        const bytes = await fillTemplate(template, currentProject);
        const filename = `${safeFilename(currentProject.name)} - ${safeFilename(template.name)}.pdf`;
        await saveGeneratedDoc(currentProject.id, template.name, filename, bytes);
        const blob = new Blob([Uint8Array.from(bytes).buffer], { type: "application/pdf" });
        const anchor = document.createElement("a");
        anchor.href = URL.createObjectURL(blob);
        anchor.download = filename;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(anchor.href), 5000);
        if (errors.length) {
          setGenMsg(
            "Corrige los siguientes errores antes de generar:\n" +
            errors.map((error) => `• ${error}`).join("\n")
          );
          return;
        }
      }
      await refreshGenerated();
      setGenMsg(`Se han generado y guardado ${chosen.length} PDF en esta obra. También se han descargado.`);
    } catch (error: unknown) {
      const err = error as Error;
      console.error(error);
      setGenMsg("No se pudo generar el PDF: " + (err.message || String(error)));
      alert("Error al generar PDF: " + (err.message || String(error)));
    }
  };

  const addCustomTemplate = async (file: File | null, nameInput: string) => {
    if (!file) {
      alert("Selecciona un PDF.");
      return;
    }
    const name = nameInput.trim() || file.name;
    try {
      const buffer = await file.arrayBuffer();
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(buffer);
      const fields = pdf.getForm().getFields();
      if (!fields.length) {
        alert("Este PDF no contiene campos de formulario detectables. En esta versión no se puede rellenar automáticamente.");
        return;
      }
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const template: Template = {
        id: "custom_" + uuid(),
        name,
        filename: file.name,
        data: btoa(binary),
        builtin: false,
        fields: fields.map((field) => ({ name: field.getName(), type: field.constructor.name })),
        mapping: {},
      };
      persistTemplates([...customTemplates, template]);
      setConfigTemplateId(template.id);
      setTab("plantillas");
      alert("PDF incorporado. Ahora relaciona sus campos con los datos de la obra.");
    } catch (error: unknown) {
      const err = error as Error;
      alert("No se pudo leer el PDF. Puede estar protegido o dañado. " + err.message);
    }
  };

  const saveMapping = (templateId: string, mapping: Record<string, string>) => {
    persistTemplates(customTemplates.map((template) =>
      template.id === templateId ? { ...template, mapping } : template
    ));
    alert("Correspondencias guardadas.");
  };

  const removeTemplate = (id: string) => {
    if (!confirm("¿Eliminar esta plantilla?")) return;
    persistTemplates(customTemplates.filter((template) => template.id !== id));
    if (configTemplateId === id) setConfigTemplateId(null);
  };

  const exportBackup = () => {
    if (!currentBureauId) return;
    const payload = { bureau: currentBureau, projects, templates: customTemplates };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `copia-seguridad-${safeFilename(currentBureau?.name || "despacho")}.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const importBackup = async (file: File | null) => {
    if (!file || !currentBureauId) return;
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      if (!Array.isArray(backup.projects) || !Array.isArray(backup.templates)) {
        throw new Error("Formato no válido");
      }
      persistProjects(backup.projects);
      persistTemplates(backup.templates);
      if (backup.projects[0]) setCurrentProjectId(backup.projects[0].id);
      alert("Copia restaurada para este despacho.");
    } catch (error: unknown) {
      alert("No se pudo restaurar: " + (error as Error).message);
    }
  };

  const saveToFolder = async () => {
    try {
      if (!("showDirectoryPicker" in window)) {
        setFolderMsg("Tu navegador no permite elegir una carpeta directamente. Usa los botones «Descargar» de cada PDF.");
        return;
      }
      if (!generated.length) {
        setFolderMsg("Esta obra todavía no tiene PDF generados.");
        return;
      }
      // @ts-expect-error File System Access API
      const directory = await window.showDirectoryPicker({ id: "coavn-pdf-destination", mode: "readwrite" });
      let saved = 0;
      for (const doc of generated) {
        const handle = await directory.getFileHandle(doc.filename, { create: true });
        const writable = await handle.createWritable();
        await writable.write(new Blob([new Uint8Array(doc.bytes)], { type: "application/pdf" }));
        await writable.close();
        saved++;
      }
      setFolderMsg(`Se han guardado ${saved} PDF en la carpeta que has elegido.`);
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (err?.name === "AbortError") {
        setFolderMsg("Selección de carpeta cancelada.");
        return;
      }
      setFolderMsg("No se pudieron guardar: " + (err.message || String(error)));
    }
  };

  if (!ready) {
    return <div className="wrap"><p className="muted">Cargando…</p></div>;
  }

  return (
    <div className="wrap">
      <AppHeader />
      <BureauSelector
        bureaus={bureaus}
        currentBureauId={currentBureauId}
        newBureauName={newBureauName}
        onSelect={(id) => {
          setCurrentBureauId(id);
          saveBureaus(bureaus, id);
        }}
        onNameChange={setNewBureauName}
        onCreate={createBureau}
      />
      <div className="layout">
        <Sidebar tab={tab} onChange={setTab} />
        <main className="panel">
          {tab === "obras" && (
            <ProjectTab
              projects={projects}
              currentProject={currentProject}
              currentProjectId={currentProjectId}
              newProjectName={newProjectName}
              onSelect={setCurrentProjectId}
              onNameChange={setNewProjectName}
              onCreate={createProject}
              onDelete={deleteProject}
            />
          )}
          {tab === "datos" && currentProject && (
            <ProjectDataTab
              project={currentProject}
              message={msg}
              onUpdate={updateProjectData}
              onSave={() => {
                setMsg("Datos guardados correctamente.");
                setTimeout(() => setMsg(""), 2500);
              }}
            />
          )}
          {tab === "documentos" && currentProject && (
            <DocumentsTab
              project={currentProject}
              templates={allTemplates}
              selectedDocs={selectedDocs}
              generated={generated}
              genMsg={genMsg}
              folderMsg={folderMsg}
              onToggleDoc={toggleDoc}
              onUpdateDate={updateProjectDate}
              onGenerate={generate}
              onSaveToFolder={saveToFolder}
              onRefreshGenerated={refreshGenerated}
            />
          )}
          {tab === "plantillas" && (
            <TemplatesTab
              templates={customTemplates}
              configTemplateId={configTemplateId}
              onAdd={addCustomTemplate}
              onToggleConfig={(id) => setConfigTemplateId(configTemplateId === id ? null : id)}
              onSaveMapping={saveMapping}
              onRemove={removeTemplate}
            />
          )}
          {tab === "ayuda" && <HelpTab onExport={exportBackup} onImport={importBackup} />}
        </main>
      </div>
      <div className="sub" style={{ margin: "16px 2px" }}>
        Versión 0.5 · Next.js · Prototipo local multi-despacho · Los PDF
        originales se incluyen como plantillas estáticas.
      </div>
    </div>
  );
}
