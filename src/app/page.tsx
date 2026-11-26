"use client";

import { useState } from "react";
import type { Tab } from "../components/types";

import AppHeader from "../components/AppHeader";
import BureauSelector from "../components/BureauSelector";
import Sidebar from "../components/Sidebar";
import BureauDataTab from "../components/BureauDataTab";
import ProjectTab from "../components/ProjectTab";
import ProjectDataTab from "../components/ProjectDataTab";
import DocumentsTab from "../components/DocumentsTab";
import TemplatesTab from "../components/TemplatesTab";
import HelpTab from "../components/HelpTab";

import { useBureaus } from "../../hooks/useBureaus";
import { useProjects } from "../../hooks/useProjects";
import { useTemplates } from "../../hooks/useTemplates";
import { useGeneratedDocs } from "../../hooks/useGeneratedDocs";
import { useDocumentGeneration } from "../../hooks/useDocumentGeneration";

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("obras");

  const {
    ready,
    bureaus,
    currentBureau,
    currentBureauId,
    newBureauName,
    setNewBureauName,
    setCurrentBureauId,
    createBureau,
    updateBureau,
    saveBureauDefaults,
  } = useBureaus();

  const {
    projects,
    currentProject,
    currentProjectId,
    newProjectName,
    setNewProjectName,
    setCurrentProjectId,
    createProject,
    deleteProject,
    updateProjectData,
    updateProjectDate,
  } = useProjects(currentBureauId, currentBureau?.defaults);

  const {
    customTemplates,
    allTemplates,
    configTemplateId,
    setConfigTemplateId,
    addCustomTemplate,
    saveMapping,
    removeTemplate,
  } = useTemplates(currentBureauId);

  const { generated, refreshGenerated } = useGeneratedDocs(currentProjectId);

  const {
    generatingId,
    genErrors,
    folderMsg,
    generateOne,
    saveToFolder,
  } = useDocumentGeneration({
    currentProject,
    allTemplates,
    generated,
    refreshGenerated,
  });

  if (!ready) {
    return (
      <div className="wrap">
        <p className="muted">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="wrap">
      <AppHeader />

      <BureauSelector
        bureaus={bureaus}
        currentBureauId={currentBureauId}
        newBureauName={newBureauName}
        onSelect={setCurrentBureauId}
        onNameChange={setNewBureauName}
        onCreate={createBureau}
      />

      <div className="layout">
        <Sidebar tab={tab} onChange={setTab} />

        <main className="panel">
          {tab === "despacho" && currentBureau && (
            // key forces remount on bureau switch — prevents stale local form state. See ADR-0004.
            <BureauDataTab
              key={currentBureauId ?? ""}
              bureau={currentBureau}
              onSave={updateBureau}
            />
          )}

          {tab === "obras" && (
            <ProjectTab
              projects={projects}
              currentProject={currentProject}
              currentProjectId={currentProjectId}
              newProjectName={newProjectName}
              onSelect={setCurrentProjectId}
              onNameChange={setNewProjectName}
              onCreate={() => { createProject(); setTab("datos"); }}
              onDelete={deleteProject}
            />
          )}

          {tab === "datos" && currentProject && (
            <ProjectDataTab
              project={currentProject}
              bureau={currentBureau}
              onUpdate={updateProjectData}
            />
          )}

          {tab === "documentos" && currentProject && (
            <DocumentsTab
              project={currentProject}
              templates={allTemplates}
              generated={generated}
              generatingId={generatingId}
              genErrors={genErrors}
              folderMsg={folderMsg}
              onGenerateDoc={generateOne}
              onUpdateDate={updateProjectDate}
              onSaveToFolder={saveToFolder}
              onRefreshGenerated={refreshGenerated}
            />
          )}

          {tab === "plantillas" && (
            <TemplatesTab
              templates={customTemplates}
              configTemplateId={configTemplateId}
              onAdd={addCustomTemplate}
              onToggleConfig={(id) =>
                setConfigTemplateId(configTemplateId === id ? null : id)
              }
              onSaveMapping={saveMapping}
              onRemove={removeTemplate}
            />
          )}

          {tab === "ayuda" && (
            <HelpTab
              onExport={() => { /* TODO: backup util */ }}
              onImport={() => { /* TODO: backup util */ }}
            />
          )}
        </main>
      </div>

      <div className="sub" style={{ margin: "16px 2px" }}>
        Versión 0.6 · Next.js · Prototipo local multi-despacho · Datos guardados en este navegador.
      </div>
    </div>
  );
}
