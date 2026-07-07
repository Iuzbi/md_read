const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mdBridge", {
  openMarkdown: () => ipcRenderer.invoke("dialog:openMarkdown"),
  openPath: (filePath) => ipcRenderer.invoke("file:openPath", filePath),
  saveMarkdown: (payload) => ipcRenderer.invoke("file:saveMarkdown", payload),
  saveMarkdownAs: (payload) => ipcRenderer.invoke("file:saveMarkdownAs", payload),
  revealInFolder: (filePath) => ipcRenderer.invoke("file:revealInFolder", filePath),
  onExternalOpen: (callback) => {
    const handler = (_event, filePath) => callback(filePath);
    ipcRenderer.on("file:openExternal", handler);
    return () => {
      ipcRenderer.removeListener("file:openExternal", handler);
    };
  }
});
