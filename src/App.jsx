import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { starterMarkdown } from "./sample";

const themes = [
  {
    id: "mist",
    name: "雾青",
    note: "适合长时间阅读",
    colors: {
      "--app-bg": "#edf2f5",
      "--sidebar-bg": "rgba(245, 248, 251, 0.96)",
      "--main-bg": "rgba(251, 252, 253, 0.94)",
      "--panel-bg": "rgba(255, 255, 255, 0.96)",
      "--preview-bg": "rgba(252, 253, 254, 0.98)",
      "--surface-strong": "#ffffff",
      "--border": "rgba(118, 134, 146, 0.12)",
      "--text": "#21313d",
      "--muted": "#6f7f8a",
      "--accent": "#25866a",
      "--accent-strong": "#16604a",
      "--danger": "#c95d5d",
      "--shadow": "0 18px 48px rgba(26, 38, 46, 0.08)"
    }
  },
  {
    id: "sand",
    name: "浅砂",
    note: "更接近纸面观感",
    colors: {
      "--app-bg": "#f2ede6",
      "--sidebar-bg": "rgba(250, 247, 242, 0.96)",
      "--main-bg": "rgba(253, 250, 247, 0.94)",
      "--panel-bg": "rgba(255, 252, 249, 0.96)",
      "--preview-bg": "rgba(255, 253, 251, 0.98)",
      "--surface-strong": "#fffdfa",
      "--border": "rgba(139, 120, 97, 0.12)",
      "--text": "#372d26",
      "--muted": "#857568",
      "--accent": "#a9794f",
      "--accent-strong": "#7d5937",
      "--danger": "#c06969",
      "--shadow": "0 18px 46px rgba(62, 48, 35, 0.08)"
    }
  },
  {
    id: "lake",
    name: "湖蓝",
    note: "白天更清透",
    colors: {
      "--app-bg": "#e7eff5",
      "--sidebar-bg": "rgba(244, 248, 252, 0.96)",
      "--main-bg": "rgba(250, 252, 254, 0.94)",
      "--panel-bg": "rgba(255, 255, 255, 0.96)",
      "--preview-bg": "rgba(252, 254, 255, 0.98)",
      "--surface-strong": "#ffffff",
      "--border": "rgba(107, 128, 147, 0.12)",
      "--text": "#203241",
      "--muted": "#6b7c8d",
      "--accent": "#2f74a8",
      "--accent-strong": "#22557a",
      "--danger": "#c45f68",
      "--shadow": "0 18px 48px rgba(30, 48, 65, 0.08)"
    }
  }
];

const quickInsert = [
  { label: "H2", value: "\n## 新章节\n" },
  { label: "清单", value: "\n- 待办事项\n- 下一步\n" },
  { label: "引用", value: "\n> 在这里写下重点\n" },
  { label: "代码", value: "\n```ts\nconst note = 'hello';\n```\n" }
];

function createDraftDocument() {
  return {
    id: `draft-${Date.now()}`,
    title: "未命名文档",
    path: "",
    content: starterMarkdown,
    updatedAt: new Date().toISOString()
  };
}

function extractTitle(content) {
  const firstLine = content
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return "未命名文档";
  }

  return firstLine.replace(/^#+\s*/, "") || "未命名文档";
}

function createDocumentFromPayload(payload) {
  return {
    id: payload.path ? `file-${payload.path}` : `draft-${Date.now()}`,
    title: payload.title || extractTitle(payload.content),
    path: payload.path || "",
    content: payload.content,
    updatedAt: payload.updatedAt || new Date().toISOString()
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

function App() {
  const [themeId, setThemeId] = useState(() => {
    return window.localStorage.getItem("mojian-theme") || themes[0].id;
  });
  const [currentDoc, setCurrentDoc] = useState(null);
  const [status, setStatus] = useState("准备就绪");
  const [isEditorPriority, setIsEditorPriority] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editorRatio, setEditorRatio] = useState(() => {
    const saved = Number(window.localStorage.getItem("mojian-editor-ratio"));
    return Number.isFinite(saved) && saved >= 0.35 && saved <= 0.75 ? saved : 0.56;
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

  const themeStyle = useMemo(() => activeTheme.colors, [activeTheme]);
  const metrics = useMemo(() => {
    return currentDoc ? getDocumentMetrics(currentDoc.content) : null;
  }, [currentDoc]);

  useEffect(() => {
    window.localStorage.setItem("mojian-theme", themeId);
  }, [themeId]);

  useEffect(() => {
    window.localStorage.setItem("mojian-editor-ratio", String(editorRatio));
  }, [editorRatio]);

  useEffect(() => {
    document.title = currentDoc ? `${currentDoc.title} - MoJian Markdown` : "MoJian Markdown";
  }, [currentDoc]);

  const replaceCurrentDocument = useEffectEvent((payload, nextStatus) => {
    const nextDoc = createDocumentFromPayload(payload);
    setCurrentDoc(nextDoc);
    setStatus(nextStatus);
  });

  const openDocumentByPath = useEffectEvent(async (filePath, nextStatus = "已打开外部文档") => {
    if (!filePath) {
      return;
    }

    const result = await window.mdBridge.openPath(filePath);
    if (!result) {
      setStatus("无法打开该文档");
      return;
    }

    replaceCurrentDocument(result, `${nextStatus}: ${result.title}`);
  });

  useEffect(() => {
    if (!window.mdBridge?.onExternalOpen) {
      return undefined;
    }

    return window.mdBridge.onExternalOpen((filePath) => {
      void openDocumentByPath(filePath, "已在当前窗口接管文档");
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
      void openDocumentByPath(file.path, "已拖入打开");
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
    setCurrentDoc((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        title: extractTitle(nextContent),
        content: nextContent,
        updatedAt: new Date().toISOString()
      };
    });
    setStatus("文档内容已更新");
  }

  function createDocument() {
    setCurrentDoc(createDraftDocument());
    setStatus("已创建新草稿");
  }

  async function openDocument() {
    const result = await window.mdBridge.openMarkdown();
    if (!result) {
      setStatus("已取消打开文件");
      return;
    }
    replaceCurrentDocument(result, `已打开 ${result.title}`);
  }

  async function saveDocument(forceSaveAs = false) {
    if (!currentDoc) {
      setStatus("当前没有可保存的文档");
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
      setStatus("保存已取消");
      return;
    }

    setCurrentDoc((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        path: result.path,
        updatedAt: result.updatedAt || new Date().toISOString()
      };
    });
    setStatus(`已保存到 ${result.path}`);
  }

  function closeDocument() {
    setCurrentDoc(null);
    setStatus("工作区已清空");
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
    setStatus("已聚焦编辑区");
  }

  function applyResize(clientX) {
    const grid = contentGridRef.current;
    if (!grid) {
      return;
    }
    const rect = grid.getBoundingClientRect();
    const nextRatio = (clientX - rect.left) / rect.width;
    const clamped = Math.min(0.75, Math.max(0.35, nextRatio));
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
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark" />
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>MoJian</h1>
          </div>
        </div>

        <div className="sidebar-group">
          <button className="sidebar-button sidebar-button-primary" onClick={openDocument}>
            打开文档
          </button>
          <button className="sidebar-button" onClick={createDocument}>
            新建草稿
          </button>
          <button className="sidebar-button" onClick={() => saveDocument(false)} disabled={!currentDoc}>
            保存
          </button>
          <button className="sidebar-button" onClick={() => setIsSettingsOpen(true)}>
            设置
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-status">
            <small>当前状态</small>
            <strong>{currentDoc ? currentDoc.title : "空白工作区"}</strong>
            <span>{currentDoc ? formatTime(currentDoc.updatedAt) : status}</span>
          </div>
          {currentDoc ? (
            <div className="sidebar-stats">
              <span>{metrics?.chars} 字符</span>
              <span>{metrics?.lines} 行</span>
              <span>{metrics?.words} 词</span>
            </div>
          ) : (
            <p className="sidebar-tip">支持拖入 `.md` 文档，或双击文档由当前窗口接管。</p>
          )}
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-head">
          <div className="workspace-copy">
            <p className="eyebrow">Current File</p>
            <h2>{currentDoc ? currentDoc.title : "未打开文档"}</h2>
            <span>{currentDoc?.path || "打开 Markdown 文件开始工作"}</span>
          </div>

          <div className="workspace-tools">
            {quickInsert.map((item) => (
              <button
                key={item.label}
                className="tool-chip"
                onClick={() => insertSnippet(item.value)}
                disabled={!currentDoc}
              >
                {item.label}
              </button>
            ))}
            <button className="tool-chip" onClick={focusEditor} disabled={!currentDoc}>
              聚焦编辑
            </button>
            <button className="tool-chip" onClick={() => setIsEditorPriority((value) => !value)} disabled={!currentDoc}>
              {isEditorPriority ? "恢复双栏" : "编辑优先"}
            </button>
            <button className="tool-chip tool-chip-danger" onClick={closeDocument} disabled={!currentDoc}>
              关闭
            </button>
          </div>
        </header>

        {currentDoc ? (
          <>
            <div
              ref={contentGridRef}
              className={`content-grid ${isEditorPriority ? "compact" : ""} ${isResizing ? "resizing" : ""}`}
              style={{
                "--editor-ratio": String(isEditorPriority ? Math.max(editorRatio, 0.6) : editorRatio),
                "--preview-ratio": String(1 - (isEditorPriority ? Math.max(editorRatio, 0.6) : editorRatio))
              }}
            >
              <section className="panel">
                <div className="panel-head">
                  <span>编辑</span>
                  <small>{currentDoc.path ? "本地文件" : "未保存草稿"}</small>
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
                aria-label="调整编辑区与预览区宽度"
                aria-orientation="vertical"
                onPointerDown={startResize}
              >
                <span />
              </div>

              <section className="panel preview-panel">
                <div className="panel-head">
                  <span>预览</span>
                  <small>{status}</small>
                </div>
                <article ref={previewRef} className="markdown-body preview-scroll" onScroll={handlePreviewScroll}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentDoc.content}</ReactMarkdown>
                </article>
              </section>
            </div>

            <footer className="status-bar">
              <span>{status}</span>
              <span>{formatTime(currentDoc.updatedAt)}</span>
            </footer>
          </>
        ) : (
          <section className={`home ${isDragActive ? "drag-active" : ""}`}>
            <div className="home-inner">
              <p className="eyebrow">Blank Workspace</p>
              <h3>开始一份新的 Markdown 工作区</h3>
              <p>拖入文档、打开本地文件，或新建一份空白草稿。</p>
              <div className="home-actions">
                <button className="sidebar-button sidebar-button-primary" onClick={openDocument}>
                  打开本地文档
                </button>
                <button className="sidebar-button" onClick={createDocument}>
                  新建空白草稿
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <aside className={`settings-drawer ${isSettingsOpen ? "open" : ""}`}>
        <div className="settings-head">
          <div>
            <p className="eyebrow">Settings</p>
            <h3>界面设置</h3>
          </div>
          <button className="tool-chip" onClick={() => setIsSettingsOpen(false)}>
            关闭
          </button>
        </div>

        <section className="settings-section">
          <div className="settings-title">
            <span>主题背景</span>
            <small>仅在设置页展示</small>
          </div>
          <div className="theme-list">
            {themes.map((theme) => (
              <button
                key={theme.id}
                className={`theme-item ${theme.id === activeTheme.id ? "active" : ""}`}
                onClick={() => setThemeId(theme.id)}
              >
                <span
                  className="theme-swatch"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors["--accent"]}, ${theme.colors["--app-bg"]})`
                  }}
                />
                <span className="theme-copy">
                  <strong>{theme.name}</strong>
                  <small>{theme.note}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      </aside>

      {isSettingsOpen ? <button className="settings-mask" onClick={() => setIsSettingsOpen(false)} /> : null}
    </div>
  );
}

export default App;
