import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import wallpaper from "./assets/workspace-wallpaper.svg";
import { starterMarkdown } from "./sample";

const themes = [
  {
    id: "mist",
    name: "雾青",
    note: "像晨雾一样柔和，适合长时间阅读。",
    colors: {
      "--app-bg": "#dfe8ea",
      "--shell-glow-a": "rgba(94, 143, 130, 0.16)",
      "--shell-glow-b": "rgba(84, 120, 148, 0.18)",
      "--sidebar-bg": "linear-gradient(180deg, rgba(239, 245, 244, 0.96) 0%, rgba(231, 239, 240, 0.94) 100%)",
      "--main-bg": "rgba(244, 248, 248, 0.76)",
      "--panel-bg": "rgba(255, 255, 255, 0.84)",
      "--preview-bg": "linear-gradient(180deg, rgba(251, 253, 252, 0.96) 0%, rgba(243, 247, 246, 0.94) 100%)",
      "--surface-strong": "#ffffff",
      "--border": "rgba(95, 121, 134, 0.15)",
      "--text": "#21313d",
      "--muted": "#6e818f",
      "--accent": "#2d9d7b",
      "--accent-strong": "#177357",
      "--danger": "#d76262",
      "--shadow": "0 24px 60px rgba(24, 40, 51, 0.12)"
    }
  },
  {
    id: "sand",
    name: "浅砂",
    note: "暖米色更接近纸面，适合写作草稿。",
    colors: {
      "--app-bg": "#ece4d9",
      "--shell-glow-a": "rgba(191, 151, 104, 0.15)",
      "--shell-glow-b": "rgba(116, 136, 134, 0.14)",
      "--sidebar-bg": "linear-gradient(180deg, rgba(248, 242, 235, 0.96) 0%, rgba(241, 233, 223, 0.94) 100%)",
      "--main-bg": "rgba(250, 246, 241, 0.78)",
      "--panel-bg": "rgba(255, 252, 248, 0.88)",
      "--preview-bg": "linear-gradient(180deg, rgba(255, 253, 250, 0.96) 0%, rgba(248, 244, 238, 0.94) 100%)",
      "--surface-strong": "#fffdfa",
      "--border": "rgba(135, 116, 92, 0.14)",
      "--text": "#3a3027",
      "--muted": "#88776b",
      "--accent": "#b68458",
      "--accent-strong": "#8f6238",
      "--danger": "#c76464",
      "--shadow": "0 24px 56px rgba(69, 51, 34, 0.12)"
    }
  },
  {
    id: "lake",
    name: "湖蓝",
    note: "更清透的对比，适合白天处理文档。",
    colors: {
      "--app-bg": "#d9e5ee",
      "--shell-glow-a": "rgba(68, 126, 176, 0.18)",
      "--shell-glow-b": "rgba(81, 162, 149, 0.14)",
      "--sidebar-bg": "linear-gradient(180deg, rgba(236, 243, 249, 0.96) 0%, rgba(228, 236, 244, 0.94) 100%)",
      "--main-bg": "rgba(242, 247, 251, 0.78)",
      "--panel-bg": "rgba(255, 255, 255, 0.84)",
      "--preview-bg": "linear-gradient(180deg, rgba(250, 253, 255, 0.96) 0%, rgba(242, 247, 250, 0.94) 100%)",
      "--surface-strong": "#ffffff",
      "--border": "rgba(89, 120, 150, 0.14)",
      "--text": "#203444",
      "--muted": "#6b7e8f",
      "--accent": "#3a86bf",
      "--accent-strong": "#285f89",
      "--danger": "#c45b67",
      "--shadow": "0 24px 60px rgba(32, 52, 68, 0.13)"
    }
  },
  {
    id: "sage",
    name: "鼠尾草",
    note: "低饱和绿色，适合夜间偏亮环境。",
    colors: {
      "--app-bg": "#dde3dc",
      "--shell-glow-a": "rgba(116, 147, 109, 0.16)",
      "--shell-glow-b": "rgba(125, 132, 145, 0.12)",
      "--sidebar-bg": "linear-gradient(180deg, rgba(239, 243, 238, 0.96) 0%, rgba(230, 236, 228, 0.94) 100%)",
      "--main-bg": "rgba(243, 246, 242, 0.78)",
      "--panel-bg": "rgba(252, 253, 251, 0.86)",
      "--preview-bg": "linear-gradient(180deg, rgba(250, 252, 249, 0.96) 0%, rgba(242, 246, 240, 0.94) 100%)",
      "--surface-strong": "#fbfcfb",
      "--border": "rgba(111, 126, 105, 0.14)",
      "--text": "#29332c",
      "--muted": "#718173",
      "--accent": "#64885c",
      "--accent-strong": "#4a6844",
      "--danger": "#bc6767",
      "--shadow": "0 24px 54px rgba(46, 55, 44, 0.12)"
    }
  }
];

const quickInsert = [
  { label: "H2", value: "\n## 新章节\n" },
  { label: "清单", value: "\n- 待办事项\n- 下一步\n" },
  { label: "引用", value: "\n> 在这里写下重点内容\n" },
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

function buildPreview(content) {
  return content
    .replace(/[#>*`\-\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 84) || "空白文档";
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
  const [editorRatio, setEditorRatio] = useState(() => {
    const saved = Number(window.localStorage.getItem("mojian-editor-ratio"));
    return Number.isFinite(saved) && saved >= 0.35 && saved <= 0.75 ? saved : 0.52;
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
      requestAnimationFrame(() => {
        insertSnippet(snippet);
      });
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
    <div className="shell theme-shell" style={themeStyle}>
      <aside className="left-pane">
        <div className="brand">
          <div className="brand-mark" />
          <div>
            <p className="eyebrow">Markdown Workspace</p>
            <h1>MoJian 墨笺</h1>
          </div>
        </div>

        <section className="sidebar-card">
          <div className="section-head">
            <span>文件操作</span>
            <small>单窗口模式</small>
          </div>
          <div className="action-grid">
            <button className="primary" onClick={openDocument}>
              打开文档
            </button>
            <button className="secondary" onClick={createDocument}>
              新建草稿
            </button>
            <button className="secondary" onClick={() => saveDocument(false)} disabled={!currentDoc}>
              保存
            </button>
            <button className="secondary" onClick={() => saveDocument(true)} disabled={!currentDoc}>
              另存为
            </button>
          </div>
          <p className="sidebar-tip">
            支持把 `.md` 文档拖到应用窗口，或拖到桌面快捷方式后直接由当前窗口接管。
          </p>
        </section>

        <section className="sidebar-card">
          <div className="section-head">
            <span>主题背景</span>
            <small>护眼预设</small>
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

        <section className="sidebar-card info-card">
          <div className="section-head">
            <span>当前状态</span>
            <small>{currentDoc ? "文档已载入" : "空工作区"}</small>
          </div>
          {currentDoc ? (
            <>
              <div className="meta-line">
                <span>标题</span>
                <strong>{currentDoc.title}</strong>
              </div>
              <div className="meta-line">
                <span>位置</span>
                <strong>{currentDoc.path ? "本地文件" : "未保存草稿"}</strong>
              </div>
              <div className="meta-grid">
                <div>
                  <small>字符</small>
                  <strong>{metrics?.chars}</strong>
                </div>
                <div>
                  <small>行数</small>
                  <strong>{metrics?.lines}</strong>
                </div>
                <div>
                  <small>词数</small>
                  <strong>{metrics?.words}</strong>
                </div>
              </div>
              <p className="sidebar-tip">{formatTime(currentDoc.updatedAt)} 更新</p>
            </>
          ) : (
            <p className="sidebar-tip">
              关闭最后一个文档后会回到空工作区。你可以直接拖入 Markdown、双击文件关联，或新建草稿继续写作。
            </p>
          )}
        </section>
      </aside>

      <main className="main-pane">
        <header className="workspace-topbar">
          <div className="topbar-left">
            <div className="window-dots">
              <i />
              <i />
              <i />
            </div>
            <div className="crumbs">
              <span>Workspace</span>
              <span>/</span>
              <span>Markdown</span>
              <span>/</span>
              <strong>{currentDoc ? currentDoc.title : "空白工作区"}</strong>
            </div>
          </div>

          <div className="topbar-center">
            <div className="file-tab">
              <span className={`file-dot ${currentDoc?.path ? "saved" : "draft"}`} />
              <strong>{currentDoc ? currentDoc.title : "未打开文档"}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            {quickInsert.map((item) => (
              <button
                key={item.label}
                className="chip"
                onClick={() => insertSnippet(item.value)}
                disabled={!currentDoc}
              >
                {item.label}
              </button>
            ))}
            <button className="secondary" onClick={focusEditor} disabled={!currentDoc}>
              聚焦编辑
            </button>
            <button
              className="secondary"
              onClick={() => setIsEditorPriority((value) => !value)}
              disabled={!currentDoc}
            >
              {isEditorPriority ? "恢复双栏" : "编辑优先"}
            </button>
            <button className="secondary warn" onClick={closeDocument} disabled={!currentDoc}>
              关闭文档
            </button>
          </div>
        </header>

        {currentDoc ? (
          <>
            <div
              ref={contentGridRef}
              className={`content-grid ${isEditorPriority ? "compact" : ""} ${isResizing ? "resizing" : ""}`}
              style={{
                "--editor-ratio": String(isEditorPriority ? Math.max(editorRatio, 0.58) : editorRatio),
                "--preview-ratio": String(1 - (isEditorPriority ? Math.max(editorRatio, 0.58) : editorRatio))
              }}
            >
              <section className="panel editor-panel">
                <div className="panel-head">
                  <span>编辑区</span>
                  <small>{currentDoc.path || "未保存文档"}</small>
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
                  <span>阅读预览</span>
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
          <section className={`empty-workspace ${isDragActive ? "drag-active" : ""}`}>
            <div className="empty-hero">
              <img src={wallpaper} alt="workspace wallpaper" />
              <div className="empty-copy">
                <p className="eyebrow">Blank Workspace</p>
                <h2>把文档拖进来，或者从这里开始。</h2>
                <p>
                  当前没有打开的文档。你可以新建草稿、打开本地 Markdown，
                  也可以把 `.md` 文件拖到窗口里，或拖到桌面快捷方式后直接复用当前程序。
                </p>
                <div className="empty-actions">
                  <button className="primary" onClick={openDocument}>
                    打开本地文档
                  </button>
                  <button className="secondary" onClick={createDocument}>
                    新建空白草稿
                  </button>
                </div>
              </div>
            </div>
            <div className="status-bar empty-status">
              <span>{isDragActive ? "松开鼠标即可导入 Markdown 文档" : status}</span>
              <span>{activeTheme.name} 主题</span>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
