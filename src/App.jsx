import { useDeferredValue, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { starterMarkdown } from "./sample";

const STORAGE_KEYS = {
  theme: "mojian-theme",
  editorRatio: "mojian-editor-ratio",
  recentDocs: "mojian-recent-docs"
};

const themes = [
  {
    id: "mist",
    name: "Mist Blue",
    note: "Clean and soft for long reading sessions.",
    colors: {
      "--app-bg": "#eaf0f4",
      "--shell-bg": "rgba(245, 248, 251, 0.78)",
      "--toolbar-bg": "rgba(252, 253, 255, 0.84)",
      "--panel-bg": "rgba(255, 255, 255, 0.86)",
      "--panel-alt": "rgba(249, 251, 253, 0.88)",
      "--surface-strong": "#ffffff",
      "--border": "rgba(91, 112, 128, 0.12)",
      "--text": "#1e2f3c",
      "--muted": "#6f808c",
      "--accent": "#2b7a78",
      "--accent-soft": "rgba(43, 122, 120, 0.12)",
      "--danger": "#c56a67",
      "--shadow": "0 18px 48px rgba(24, 37, 48, 0.08)",
      "--wallpaper": "radial-gradient(circle at top left, rgba(143, 196, 210, 0.35), transparent 34%), radial-gradient(circle at top right, rgba(210, 226, 231, 0.48), transparent 28%), linear-gradient(140deg, #eef4f7 0%, #dde8ee 100%)",
      "--wallpaper-soft": "rgba(232, 240, 245, 0.72)"
    }
  },
  {
    id: "matcha",
    name: "Matcha Cloud",
    note: "A softer green with stronger eye comfort.",
    colors: {
      "--app-bg": "#eef3ec",
      "--shell-bg": "rgba(248, 251, 246, 0.76)",
      "--toolbar-bg": "rgba(253, 254, 251, 0.84)",
      "--panel-bg": "rgba(255, 255, 252, 0.88)",
      "--panel-alt": "rgba(250, 252, 248, 0.88)",
      "--surface-strong": "#fffefb",
      "--border": "rgba(104, 125, 103, 0.12)",
      "--text": "#273426",
      "--muted": "#73826f",
      "--accent": "#5d8f63",
      "--accent-soft": "rgba(93, 143, 99, 0.13)",
      "--danger": "#b76b63",
      "--shadow": "0 18px 46px rgba(39, 52, 38, 0.08)",
      "--wallpaper": "radial-gradient(circle at top left, rgba(195, 218, 195, 0.42), transparent 30%), radial-gradient(circle at 80% 18%, rgba(226, 234, 207, 0.5), transparent 26%), linear-gradient(145deg, #eff5ed 0%, #dfe8dc 100%)",
      "--wallpaper-soft": "rgba(236, 242, 232, 0.72)"
    }
  },
  {
    id: "sand",
    name: "Warm Sand",
    note: "Paper-like and comfortable in preview mode.",
    colors: {
      "--app-bg": "#f2ede5",
      "--shell-bg": "rgba(249, 245, 239, 0.76)",
      "--toolbar-bg": "rgba(255, 252, 248, 0.84)",
      "--panel-bg": "rgba(255, 252, 248, 0.88)",
      "--panel-alt": "rgba(252, 248, 242, 0.88)",
      "--surface-strong": "#fffdf8",
      "--border": "rgba(124, 103, 80, 0.13)",
      "--text": "#382b22",
      "--muted": "#8b7869",
      "--accent": "#b07a51",
      "--accent-soft": "rgba(176, 122, 81, 0.13)",
      "--danger": "#c16d64",
      "--shadow": "0 18px 48px rgba(53, 40, 29, 0.08)",
      "--wallpaper": "radial-gradient(circle at left top, rgba(232, 205, 173, 0.36), transparent 32%), radial-gradient(circle at 86% 16%, rgba(244, 229, 204, 0.52), transparent 28%), linear-gradient(140deg, #f4efe8 0%, #e9ddd0 100%)",
      "--wallpaper-soft": "rgba(243, 237, 228, 0.74)"
    }
  },
  {
    id: "lake",
    name: "Lake Light",
    note: "Cooler and calmer for focused work.",
    colors: {
      "--app-bg": "#e8f0f5",
      "--shell-bg": "rgba(245, 249, 252, 0.76)",
      "--toolbar-bg": "rgba(251, 254, 255, 0.84)",
      "--panel-bg": "rgba(255, 255, 255, 0.88)",
      "--panel-alt": "rgba(248, 252, 254, 0.88)",
      "--surface-strong": "#ffffff",
      "--border": "rgba(91, 117, 140, 0.12)",
      "--text": "#203243",
      "--muted": "#6b7f91",
      "--accent": "#3b78a1",
      "--accent-soft": "rgba(59, 120, 161, 0.13)",
      "--danger": "#bf6a6d",
      "--shadow": "0 18px 48px rgba(30, 48, 65, 0.08)",
      "--wallpaper": "radial-gradient(circle at 16% 10%, rgba(167, 208, 226, 0.38), transparent 32%), radial-gradient(circle at 86% 18%, rgba(206, 229, 240, 0.52), transparent 28%), linear-gradient(145deg, #edf4f8 0%, #dbe6ee 100%)",
      "--wallpaper-soft": "rgba(232, 240, 245, 0.72)"
    }
  },
  {
    id: "lavender",
    name: "Lavender Fog",
    note: "A gentle purple-grey with more design character.",
    colors: {
      "--app-bg": "#eeedf4",
      "--shell-bg": "rgba(247, 246, 251, 0.76)",
      "--toolbar-bg": "rgba(253, 252, 255, 0.84)",
      "--panel-bg": "rgba(255, 255, 255, 0.88)",
      "--panel-alt": "rgba(250, 249, 253, 0.88)",
      "--surface-strong": "#ffffff",
      "--border": "rgba(108, 103, 129, 0.12)",
      "--text": "#2d2b3a",
      "--muted": "#7d788d",
      "--accent": "#7b73a8",
      "--accent-soft": "rgba(123, 115, 168, 0.13)",
      "--danger": "#b96c73",
      "--shadow": "0 18px 48px rgba(40, 37, 55, 0.08)",
      "--wallpaper": "radial-gradient(circle at 12% 14%, rgba(210, 203, 233, 0.42), transparent 30%), radial-gradient(circle at 88% 16%, rgba(234, 226, 245, 0.52), transparent 28%), linear-gradient(145deg, #f1f0f6 0%, #e4e0ed 100%)",
      "--wallpaper-soft": "rgba(238, 236, 244, 0.72)"
    }
  },
  {
    id: "amber",
    name: "Amber Sun",
    note: "Warm and bright with a richer desktop feel.",
    colors: {
      "--app-bg": "#f5efe6",
      "--shell-bg": "rgba(251, 247, 240, 0.76)",
      "--toolbar-bg": "rgba(255, 252, 247, 0.84)",
      "--panel-bg": "rgba(255, 252, 248, 0.88)",
      "--panel-alt": "rgba(252, 248, 242, 0.88)",
      "--surface-strong": "#fffdf9",
      "--border": "rgba(135, 108, 78, 0.12)",
      "--text": "#3a2d21",
      "--muted": "#8c7660",
      "--accent": "#c28a48",
      "--accent-soft": "rgba(194, 138, 72, 0.13)",
      "--danger": "#bc665f",
      "--shadow": "0 18px 48px rgba(56, 43, 30, 0.08)",
      "--wallpaper": "radial-gradient(circle at 14% 12%, rgba(236, 198, 135, 0.36), transparent 30%), radial-gradient(circle at 86% 18%, rgba(245, 230, 195, 0.52), transparent 28%), linear-gradient(145deg, #f6f1ea 0%, #eadfce 100%)",
      "--wallpaper-soft": "rgba(245, 239, 230, 0.74)"
    }
  },
  {
    id: "ink",
    name: "Ink Night",
    note: "A dark theme that keeps contrast soft.",
    colors: {
      "--app-bg": "#1b2229",
      "--shell-bg": "rgba(28, 35, 42, 0.82)",
      "--toolbar-bg": "rgba(34, 41, 48, 0.84)",
      "--panel-bg": "rgba(31, 39, 46, 0.88)",
      "--panel-alt": "rgba(26, 33, 39, 0.9)",
      "--surface-strong": "#222a32",
      "--border": "rgba(147, 165, 180, 0.12)",
      "--text": "#e7eef5",
      "--muted": "#9eafbd",
      "--accent": "#6cae9b",
      "--accent-soft": "rgba(108, 174, 155, 0.16)",
      "--danger": "#df8d85",
      "--shadow": "0 18px 48px rgba(0, 0, 0, 0.28)",
      "--wallpaper": "radial-gradient(circle at 10% 10%, rgba(54, 84, 95, 0.38), transparent 28%), radial-gradient(circle at 84% 16%, rgba(63, 97, 88, 0.28), transparent 24%), linear-gradient(145deg, #1d252d 0%, #14191f 100%)",
      "--wallpaper-soft": "rgba(26, 33, 40, 0.74)"
    }
  }
];

const quickInsert = [
  { label: "H2", value: "\n## Section Title\n" },
  { label: "List", value: "\n- Todo item\n- Next action\n" },
  { label: "Quote", value: "\n> Write the key point here\n" },
  { label: "Code", value: '\n```ts\nconst note = "hello";\n```\n' }
];

function readStoredRecentDocs() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.recentDocs);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => item?.path) : [];
  } catch {
    return [];
  }
}

function createDraftDocument() {
  return {
    id: `draft-${Date.now()}`,
    title: "Untitled",
    path: "",
    content: starterMarkdown,
    updatedAt: new Date().toISOString(),
    lastSavedContent: starterMarkdown,
    dirty: false
  };
}

function extractTitle(content) {
  const firstLine = content
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return "Untitled";
  }

  return firstLine.replace(/^#+\s*/, "") || "Untitled";
}

function createDocumentFromPayload(payload) {
  return {
    id: payload.path ? `file-${payload.path}` : `draft-${Date.now()}`,
    title: payload.title || extractTitle(payload.content),
    path: payload.path || "",
    content: payload.content,
    updatedAt: payload.updatedAt || new Date().toISOString(),
    lastSavedContent: payload.content,
    dirty: false
  };
}

function formatTime(dateValue) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateValue));
}

function getDocumentMetrics(content) {
  const lines = content.split("\n").length;
  const chars = content.length;
  const words = content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return { lines, chars, words };
}

function dedupeRecentDocs(documents) {
  const map = new Map();

  documents.forEach((item) => {
    if (!item?.path) {
      return;
    }

    map.set(item.path, {
      path: item.path,
      title: item.title || "Untitled",
      updatedAt: item.updatedAt || new Date().toISOString()
    });
  });

  return Array.from(map.values())
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);
}

function App() {
  const [themeId, setThemeId] = useState(() => {
    return window.localStorage.getItem(STORAGE_KEYS.theme) || themes[0].id;
  });
  const [currentDoc, setCurrentDoc] = useState(null);
  const [status, setStatus] = useState("Ready");
  const [isEditorPriority, setIsEditorPriority] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [recentDocs, setRecentDocs] = useState(() => readStoredRecentDocs());
  const [editorRatio, setEditorRatio] = useState(() => {
    const saved = Number(window.localStorage.getItem(STORAGE_KEYS.editorRatio));
    return Number.isFinite(saved) && saved >= 0.36 && saved <= 0.75 ? saved : 0.55;
  });
  const [isResizing, setIsResizing] = useState(false);
  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const contentGridRef = useRef(null);
  const dragDepthRef = useRef(0);
  const syncSourceRef = useRef(null);
  const resizeFrameRef = useRef(null);

  const activeTheme = useMemo(() => {
    return themes.find((theme) => theme.id === themeId) || themes[0];
  }, [themeId]);

  const themeStyle = useMemo(() => {
    return activeTheme.colors;
  }, [activeTheme]);

  const metrics = useMemo(() => {
    return currentDoc ? getDocumentMetrics(currentDoc.content) : null;
  }, [currentDoc]);

  const deferredContent = useDeferredValue(currentDoc?.content || "");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.theme, themeId);
  }, [themeId]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.editorRatio, String(editorRatio));
  }, [editorRatio]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.recentDocs, JSON.stringify(recentDocs));
  }, [recentDocs]);

  useEffect(() => {
    document.title = currentDoc ? `${currentDoc.title} - MoJian Markdown` : "MoJian Markdown";
  }, [currentDoc]);

  const rememberRecentDoc = useEffectEvent((documentLike) => {
    if (!documentLike?.path) {
      return;
    }

    setRecentDocs((current) =>
      dedupeRecentDocs([
        {
          path: documentLike.path,
          title: documentLike.title,
          updatedAt: documentLike.updatedAt || new Date().toISOString()
        },
        ...current
      ])
    );
  });

  const replaceCurrentDocument = useEffectEvent((payload, nextStatus) => {
    const nextDoc = createDocumentFromPayload(payload);
    setCurrentDoc(nextDoc);
    rememberRecentDoc(nextDoc);
    setStatus(nextStatus);
  });

  const openDocumentByPath = useEffectEvent(async (filePath, nextStatus = "External document opened") => {
    if (!filePath) {
      return;
    }

    const result = await window.mdBridge.openPath(filePath);
    if (!result) {
      setStatus("Unable to open this document");
      return;
    }

    replaceCurrentDocument(result, `${nextStatus}: ${result.title}`);
  });

  useEffect(() => {
    if (!window.mdBridge?.onExternalOpen) {
      return undefined;
    }

    return window.mdBridge.onExternalOpen((filePath) => {
      void openDocumentByPath(filePath, "Document redirected to the current window");
    });
  }, [openDocumentByPath]);

  useEffect(() => {
    function hasMarkdownFile(event) {
      return Array.from(event.dataTransfer?.files || []).some((file) =>
        /\.(md|markdown|txt)$/i.test(file.name)
      );
    }

    function handleDragEnter(event) {
      if (!hasMarkdownFile(event)) {
        return;
      }

      event.preventDefault();
      dragDepthRef.current += 1;
      setIsDragActive(true);
    }

    function handleDragOver(event) {
      if (!hasMarkdownFile(event)) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }

    function handleDragLeave(event) {
      if (!hasMarkdownFile(event)) {
        return;
      }

      event.preventDefault();
      dragDepthRef.current = Math.max(dragDepthRef.current - 1, 0);
      if (dragDepthRef.current === 0) {
        setIsDragActive(false);
      }
    }

    function handleDrop(event) {
      const file = Array.from(event.dataTransfer?.files || []).find((item) =>
        /\.(md|markdown|txt)$/i.test(item.name)
      );

      if (!file) {
        return;
      }

      event.preventDefault();
      dragDepthRef.current = 0;
      setIsDragActive(false);
      void openDocumentByPath(file.path, "Opened from drag and drop");
    }

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [openDocumentByPath]);

  const syncScroll = useEffectEvent((source) => {
    const editor = editorRef.current;
    const preview = previewRef.current;

    if (!editor || !preview) {
      return;
    }

    const from = source === "editor" ? editor : preview;
    const to = source === "editor" ? preview : editor;
    const fromMax = from.scrollHeight - from.clientHeight;
    const toMax = to.scrollHeight - to.clientHeight;

    if (fromMax <= 0 || toMax <= 0) {
      to.scrollTop = 0;
      return;
    }

    syncSourceRef.current = source;
    to.scrollTop = (from.scrollTop / fromMax) * toMax;

    requestAnimationFrame(() => {
      if (syncSourceRef.current === source) {
        syncSourceRef.current = null;
      }
    });
  });

  const createDocument = useEffectEvent(() => {
    setCurrentDoc(createDraftDocument());
    setStatus("New draft created");
  });

  const openDocument = useEffectEvent(async () => {
    const result = await window.mdBridge.openMarkdown();
    if (!result) {
      setStatus("Open cancelled");
      return;
    }

    replaceCurrentDocument(result, `Opened ${result.title}`);
  });

  const saveDocument = useEffectEvent(async (forceSaveAs = false) => {
    if (!currentDoc) {
      setStatus("There is no document to save");
      return;
    }

    const payload = {
      title: currentDoc.title,
      path: currentDoc.path,
      content: currentDoc.content
    };

    const result =
      forceSaveAs || !currentDoc.path
        ? await window.mdBridge.saveMarkdownAs(payload)
        : await window.mdBridge.saveMarkdown(payload);

    if (!result.saved) {
      setStatus("Save cancelled");
      return;
    }

    setCurrentDoc((documentLike) => {
      if (!documentLike) {
        return documentLike;
      }

      const nextDoc = {
        ...documentLike,
        path: result.path,
        updatedAt: result.updatedAt || new Date().toISOString(),
        lastSavedContent: documentLike.content,
        dirty: false
      };

      rememberRecentDoc(nextDoc);
      return nextDoc;
    });

    setStatus(`Saved to ${result.path}`);
  });

  useEffect(() => {
    function handleKeyDown(event) {
      const isCommand = event.ctrlKey || event.metaKey;
      if (event.key === "Escape" && isSettingsOpen) {
        setIsSettingsOpen(false);
        return;
      }

      if (!isCommand) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "o") {
        event.preventDefault();
        void openDocument();
      }

      if (key === "n") {
        event.preventDefault();
        createDocument();
      }

      if (key === "s") {
        event.preventDefault();
        void saveDocument(event.shiftKey);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [createDocument, isSettingsOpen, openDocument, saveDocument]);

  function handleEditorScroll() {
    if (syncSourceRef.current && syncSourceRef.current !== "editor") {
      return;
    }
    syncScroll("editor");
  }

  function handlePreviewScroll() {
    if (syncSourceRef.current && syncSourceRef.current !== "preview") {
      return;
    }
    syncScroll("preview");
  }

  function updateCurrentContent(nextContent) {
    setCurrentDoc((documentLike) => {
      if (!documentLike) {
        return documentLike;
      }

      return {
        ...documentLike,
        title: extractTitle(nextContent),
        content: nextContent,
        updatedAt: new Date().toISOString(),
        dirty: nextContent !== documentLike.lastSavedContent
      };
    });

    setStatus("Content updated");
  }

  function closeDocument() {
    setCurrentDoc(null);
    setStatus("Workspace cleared");
  }

  function insertSnippet(snippet) {
    if (!currentDoc) {
      createDocument();
      requestAnimationFrame(() => insertSnippet(snippet));
      return;
    }

    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const nextContent =
      currentDoc.content.slice(0, start) + snippet + currentDoc.content.slice(end);

    updateCurrentContent(nextContent);

    requestAnimationFrame(() => {
      editor.focus();
      const nextPosition = start + snippet.length;
      editor.setSelectionRange(nextPosition, nextPosition);
    });
  }

  function focusEditor() {
    editorRef.current?.focus();
    setStatus("Editor focused");
  }

  async function copyPath() {
    if (!currentDoc?.path) {
      setStatus("This document has no file path yet");
      return;
    }

    try {
      await navigator.clipboard.writeText(currentDoc.path);
      setStatus("File path copied");
    } catch {
      setStatus("Copy path failed");
    }
  }

  async function revealInFolder() {
    if (!currentDoc?.path || !window.mdBridge?.revealInFolder) {
      setStatus("This document has no file path yet");
      return;
    }

    await window.mdBridge.revealInFolder(currentDoc.path);
    setStatus("Revealed in Explorer");
  }

  function restoreRecentDocument(item) {
    void openDocumentByPath(item.path, "Restored from recent files");
  }

  function clearRecentDocs() {
    setRecentDocs([]);
    setStatus("Recent files cleared");
  }

  function applyResize(clientX) {
    const grid = contentGridRef.current;
    if (!grid) {
      return;
    }

    const rect = grid.getBoundingClientRect();
    const nextRatio = (clientX - rect.left) / rect.width;
    const clamped = Math.min(0.75, Math.max(0.36, nextRatio));
    setEditorRatio(clamped);
  }

  function stopResize() {
    setIsResizing(false);
    document.body.classList.remove("is-resizing-panels");
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopResize);
  }

  function handlePointerMove(event) {
    if (resizeFrameRef.current) {
      cancelAnimationFrame(resizeFrameRef.current);
    }

    resizeFrameRef.current = requestAnimationFrame(() => {
      applyResize(event.clientX);
    });
  }

  function startResize(event) {
    event.preventDefault();
    setIsResizing(true);
    document.body.classList.add("is-resizing-panels");
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
  }

  useEffect(() => {
    return () => {
      if (resizeFrameRef.current) {
        cancelAnimationFrame(resizeFrameRef.current);
      }

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
      document.body.classList.remove("is-resizing-panels");
    };
  }, []);

  return (
    <div className="shell" style={themeStyle}>
      <div className="shell-frame">
        <header className="topbar">
          <div className="brand-block">
            <div className="brand-mark" />
            <div className="brand-copy">
              <strong>MoJian Markdown</strong>
              <span>{currentDoc ? "Single document workspace" : "Minimal Markdown editor for Windows"}</span>
            </div>
          </div>

          <div className="topbar-actions">
            <button className="primary-button" onClick={() => void openDocument()}>
              Open
            </button>
            <button className="secondary-button" onClick={createDocument}>
              New
            </button>
            <button className="secondary-button" onClick={() => void saveDocument(false)} disabled={!currentDoc}>
              Save
            </button>
            <button className="secondary-button" onClick={() => void saveDocument(true)} disabled={!currentDoc}>
              Save As
            </button>
            <button className="secondary-button" onClick={() => setIsSettingsOpen(true)}>
              Settings
            </button>
          </div>

          <div className="topbar-meta">
            {currentDoc ? (
              <>
                <span className="meta-pill">{currentDoc.dirty ? "Unsaved" : "Saved"}</span>
                <span className="meta-pill">{metrics?.chars} chars</span>
                <span className="meta-pill">{metrics?.lines} lines</span>
                <span className="meta-pill">{metrics?.words} words</span>
                <span className="meta-text">{formatTime(currentDoc.updatedAt)}</span>
              </>
            ) : (
              <span className="meta-text">Drag files in, double click linked docs, or reuse the existing window</span>
            )}
          </div>
        </header>

        <main className="workspace">
          {currentDoc ? (
            <>
              <section className="document-head">
                <div className="document-copy">
                  <div className="title-row">
                    <h1>{currentDoc.title}</h1>
                    {currentDoc.dirty ? <span className="dirty-dot" /> : null}
                  </div>
                  <p>{currentDoc.path || "Unsaved draft"}</p>
                </div>

                <div className="document-tools">
                  {quickInsert.map((item) => (
                    <button key={item.label} className="tool-chip" onClick={() => insertSnippet(item.value)}>
                      {item.label}
                    </button>
                  ))}
                  <button className="tool-chip" onClick={focusEditor}>
                    Focus Editor
                  </button>
                  <button className="tool-chip" onClick={() => setIsEditorPriority((value) => !value)}>
                    {isEditorPriority ? "Balanced View" : "Editor First"}
                  </button>
                  <button className="tool-chip" onClick={copyPath} disabled={!currentDoc.path}>
                    Copy Path
                  </button>
                  <button className="tool-chip" onClick={revealInFolder} disabled={!currentDoc.path}>
                    Show in Folder
                  </button>
                  <button className="tool-chip tool-chip-danger" onClick={closeDocument}>
                    Close
                  </button>
                </div>
              </section>

              <div
                ref={contentGridRef}
                className={`content-grid ${isEditorPriority ? "compact" : ""} ${isResizing ? "resizing" : ""}`}
                style={{
                  "--editor-ratio": String(isEditorPriority ? Math.max(editorRatio, 0.62) : editorRatio),
                  "--preview-ratio": String(1 - (isEditorPriority ? Math.max(editorRatio, 0.62) : editorRatio))
                }}
              >
                <section className="panel">
                  <div className="panel-head">
                    <span>Editor</span>
                    <small>{currentDoc.path ? "Local file" : "Unsaved draft"}</small>
                  </div>
                  <textarea
                    ref={editorRef}
                    className="editor-textarea"
                    value={currentDoc.content}
                    onChange={(event) => updateCurrentContent(event.target.value)}
                    onScroll={handleEditorScroll}
                    spellCheck="false"
                  />
                </section>

                <div
                  className="panel-resizer"
                  role="separator"
                  aria-label="Resize editor and preview panels"
                  aria-orientation="vertical"
                  onPointerDown={startResize}
                >
                  <span />
                </div>

                <section className="panel panel-preview">
                  <div className="panel-head">
                    <span>Preview</span>
                    <small>{status}</small>
                  </div>
                  <article ref={previewRef} className="markdown-body preview-scroll" onScroll={handlePreviewScroll}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{deferredContent}</ReactMarkdown>
                  </article>
                </section>
              </div>

              <footer className="status-bar">
                <span>{status}</span>
                <span>{currentDoc.path ? currentDoc.path : "Ctrl+S to save, Ctrl+Shift+S to save as"}</span>
              </footer>
            </>
          ) : (
            <section className={`home ${isDragActive ? "drag-active" : ""}`}>
              <div className="hero-card">
                <div className="hero-copy">
                  <span className="hero-tag">MoJian 1.1.0</span>
                  <h1>Start from a cleaner Markdown workspace</h1>
                  <p>
                    The main actions now live in the top toolbar. Open a local file, drag a document into the window,
                    or create a new draft and start writing with a simpler layout.
                  </p>
                  <div className="hero-actions">
                    <button className="primary-button" onClick={() => void openDocument()}>
                      Open Local File
                    </button>
                    <button className="secondary-button" onClick={createDocument}>
                      New Draft
                    </button>
                  </div>
                </div>

                <div className="hero-grid">
                  <article className="hero-info-card">
                    <strong>Top toolbar</strong>
                    <span>Moves key actions upward and reduces left-side noise.</span>
                  </article>
                  <article className="hero-info-card">
                    <strong>Single-instance flow</strong>
                    <span>Drag-and-drop, file association and shortcut opens all reuse the current window.</span>
                  </article>
                  <article className="hero-info-card">
                    <strong>Sync and resize</strong>
                    <span>Editor and preview stay linked, and both panes can be resized freely.</span>
                  </article>
                </div>
              </div>

              <section className="recent-panel">
                <div className="section-head">
                  <h2>Recent Files</h2>
                  {recentDocs.length > 0 ? (
                    <button className="text-button" onClick={clearRecentDocs}>
                      Clear
                    </button>
                  ) : null}
                </div>

                {recentDocs.length > 0 ? (
                  <div className="recent-list">
                    {recentDocs.map((item) => (
                      <button key={item.path} className="recent-item" onClick={() => restoreRecentDocument(item)}>
                        <span className="recent-title">{item.title}</span>
                        <span className="recent-path">{item.path}</span>
                        <span className="recent-time">{formatTime(item.updatedAt)}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="recent-empty">
                    <span>No recent files yet</span>
                    <small>Open or drag in a Markdown file and it will appear here for quick access.</small>
                  </div>
                )}
              </section>
            </section>
          )}
        </main>
      </div>

      <aside className={`settings-drawer ${isSettingsOpen ? "open" : ""}`}>
        <div className="settings-head">
          <div>
            <span className="settings-tag">Settings</span>
            <h2>Theme Library</h2>
          </div>
          <button className="secondary-button" onClick={() => setIsSettingsOpen(false)}>
            Close
          </button>
        </div>

        <div className="settings-copy">
          <p>Theme switching lives only here. Each preset is designed to be richer, softer and easier on the eyes.</p>
        </div>

        <div className="theme-list">
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-item ${theme.id === activeTheme.id ? "active" : ""}`}
              onClick={() => setThemeId(theme.id)}
            >
              <span className="theme-swatch" style={{ background: theme.colors["--wallpaper"] }} />
              <span className="theme-copy">
                <strong>{theme.name}</strong>
                <small>{theme.note}</small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      {isSettingsOpen ? <button className="settings-mask" onClick={() => setIsSettingsOpen(false)} /> : null}
    </div>
  );
}

export default App;
