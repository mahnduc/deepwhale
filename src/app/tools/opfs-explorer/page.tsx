"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Folder, 
  FileText, 
  Trash2, 
  Upload, 
  RefreshCw, 
  Home, 
  X, 
  Save, 
  ChevronRight, 
  ChevronDown,
  FolderPlus,
  FilePlus,
  FolderRoot
} from "lucide-react";

/* ================= TYPES ================= */

type NodeType = "file" | "folder";
type Path = string[];

interface FileNode {
  name: string;
  type: NodeType;
  children?: FileNode[];
}

type WebkitFile = File & {
  webkitRelativePath?: string;
};

/* ================= OPFS HELPERS ================= */

async function getDirHandle(path: Path, create = false) {
  let dir = await navigator.storage.getDirectory();
  for (const segment of path) {
    dir = await dir.getDirectoryHandle(segment, { create });
  }
  return dir;
}

/* ================= COMPONENT ================= */

export default function OPFSExplorer() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [currentPath, setCurrentPath] = useState<Path>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingFile, setEditingFile] = useState<{
    path: Path;
    name: string;
    content: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
  const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
  const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)] transition-all duration-200";

  /* ================= LOAD TREE (UPDATED WITH FILTER) ================= */

  const readDirectory = useCallback(async (dirHandle: FileSystemDirectoryHandle): Promise<FileNode[]> => {
    const entries: FileNode[] = [];
    
    for await (const [name, handle] of dirHandle.entries()) {
      // Logic lọc: Không hiển thị thư mục bắt đầu bằng "system" hoặc "SYSTEM"
      const isSystemFolder = handle.kind === "directory" && name.toLowerCase().startsWith("system");
      
      if (isSystemFolder) continue;

      if (handle.kind === "directory") {
        entries.push({
          name,
          type: "folder",
          children: await readDirectory(handle),
        });
      } else {
        entries.push({ name, type: "file" });
      }
    }
    
    return entries.sort((a, b) =>
      a.type === b.type ? a.name.localeCompare(a.name) : a.type === "folder" ? -1 : 1
    );
  }, []);

  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      const root = await navigator.storage.getDirectory();
      const data = await readDirectory(root);
      setTree(data);
    } catch (error) {
      console.error("OPFS Error:", error);
    } finally {
      setLoading(false);
    }
  }, [readDirectory]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  /* ================= ACTIONS ================= */

  const handleCreate = async (type: NodeType) => {
    const name = prompt(`Nhập tên ${type === "folder" ? "thư mục" : "tập tin"}:`);
    if (!name) return;
    try {
      const dir = await getDirHandle(currentPath, true);
      if (type === "folder") {
        await dir.getDirectoryHandle(name, { create: true });
      } else {
        const fileHandle = await dir.getFileHandle(name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write("");
        await writable.close();
      }
      loadTree();
    } catch (err) { alert("Lỗi: " + err); }
  };

  const handleDelete = async (e: React.MouseEvent, path: Path, name: string, type: NodeType) => {
    e.stopPropagation();
    if (!confirm(`Xóa ${name}?`)) return;
    try {
      const dir = await getDirHandle(path);
      await dir.removeEntry(name, { recursive: type === "folder" });
      loadTree();
    } catch (err) { alert("Lỗi khi xóa: " + err); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setLoading(true);
    try {
      const files = Array.from(e.target.files) as WebkitFile[];
      const targetDir = await getDirHandle(currentPath, true);
      for (const file of files) {
        const parts = file.webkitRelativePath ? file.webkitRelativePath.split("/") : [file.name];
        let current = targetDir;
        for (let i = 0; i < parts.length - 1; i++) {
          current = await current.getDirectoryHandle(parts[i], { create: true });
        }
        const fileName = parts[parts.length - 1];
        const fileHandle = await current.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file);
        await writable.close();
      }
    } finally {
      e.target.value = "";
      setLoading(false);
      loadTree();
    }
  };

  const openFile = async (path: Path, name: string) => {
    try {
      const dir = await getDirHandle(path);
      const fileHandle = await dir.getFileHandle(name);
      const file = await fileHandle.getFile();
      const content = await file.text();
      setEditingFile({ path, name, content });
    } catch (err) { alert("Lỗi mở file: " + err); }
  };

  const saveFile = async () => {
    if (!editingFile) return;
    try {
      const dir = await getDirHandle(editingFile.path, true);
      const fileHandle = await dir.getFileHandle(editingFile.name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(editingFile.content);
      await writable.close();
      setEditingFile(null);
      loadTree();
    } catch (err) { alert("Lỗi lưu file: " + err); }
  };

  const toggleFolder = (key: string, path: Path) => {
    setCurrentPath(path);
    setExpanded((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  /* ================= RENDER TREE ================= */

  const renderTree = (nodes: FileNode[], path: Path = []) => {
    return nodes.map((node) => {
      const fullPath = [...path, node.name];
      const key = fullPath.join("/");
      const isExpanded = expanded.includes(key);
      const isSelected = currentPath.join("/") === key;

      return (
        <div key={key} className="flex flex-col mb-2">
          <div 
            onClick={() => node.type === 'folder' ? toggleFolder(key, fullPath) : openFile(path, node.name)}
            className={`group flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300
              ${isSelected ? `bg-base-200 ${neoInset} text-primary font-bold` : `hover:scale-[1.01] text-base-content/70`}`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {node.type === "folder" ? (
                <>
                  <div className="opacity-50">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                  <Folder size={18} className={`${isExpanded ? "text-primary" : "text-base-content/40"}`} />
                </>
              ) : (
                <>
                  <span className="w-4" /> 
                  <FileText size={18} className="text-base-content/40" />
                </>
              )}
              <span className="truncate text-[11px] font-black uppercase tracking-wider">{node.name}</span>
            </div>

            <button 
              onClick={(e) => handleDelete(e, path, node.name, node.type)}
              className={`p-2 rounded-xl text-error opacity-0 group-hover:opacity-100 transition-all ${neoFlat} ${neoPressed}`}
            >
              <Trash2 size={14} />
            </button>
          </div>

          {node.type === "folder" && isExpanded && node.children && (
            <div className="ml-6 mt-2 border-l border-base-content/5 pl-2 space-y-1">
              {renderTree(node.children, fullPath)}
            </div>
          )}
        </div>
      );
    });
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-base-200 p-6 md:p-10 text-base-content select-none">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER PANEL */}
        <div className={`p-8 rounded-[2rem] bg-base-200 ${neoFlat}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                <div className={`p-3 rounded-2xl bg-base-200 ${neoFlat}`}>
                    <Folder className="text-primary" size={20} />
                </div>
                OPFS <span className="text-primary">Explorer</span>
              </h1>
              {/* <div className="flex items-center gap-2">
                <span className="h-1 w-8 bg-primary rounded-full opacity-50"></span>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Protocol v0.0.1</p>
              </div> */}
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentPath([])} className={`p-4 rounded-2xl bg-base-200 ${neoFlat} ${neoPressed}`} title="Root">
                <FolderRoot size={18} />
              </button>
              <button onClick={loadTree} className={`p-4 rounded-2xl bg-base-200 ${neoFlat} ${neoPressed} ${loading ? 'animate-spin opacity-50' : ''}`}>
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-10">
            <button onClick={() => handleCreate("folder")} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-base-200 ${neoFlat} ${neoPressed}`}>
              <FolderPlus size={16} className="text-primary" /> Thư mục
            </button>
            <button onClick={() => handleCreate("file")} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-base-200 ${neoFlat} ${neoPressed}`}>
              <FilePlus size={16} className="text-primary" /> File
            </button>
            <button onClick={() => fileInputRef.current?.click()} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-base-200 ${neoFlat} ${neoPressed}`}>
              <Upload size={16} className="text-primary" /> Upload
            </button>
          </div>

          <div className={`mt-8 px-5 py-3 rounded-2xl text-[10px] font-mono flex items-center gap-3 bg-base-200 ${neoInset}`}>
            <span className="opacity-30 font-black tracking-widest uppercase">Location:</span>
            <span className="text-primary font-black tracking-widest uppercase">/{currentPath.join("/") || "root"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className={`lg:col-span-4 rounded-[2rem] bg-base-200 h-[650px] flex flex-col overflow-hidden ${neoFlat}`}>
            <div className="p-6 border-b border-base-content/5">
              <label className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">Directory Tree</label>
            </div>
            <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
              {tree.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center h-full opacity-10 gap-3">
                  <Folder size={48} strokeWidth={1} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Void Storage</span>
                </div>
              ) : (
                renderTree(tree)
              )}
            </div>
          </div>

          <div className={`lg:col-span-8 rounded-[2rem] bg-base-200 h-[650px] flex flex-col overflow-hidden ${neoFlat}`}>
            {editingFile ? (
              <>
                <div className="p-6 border-b border-base-content/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-base-200 ${neoInset}`}>
                        <FileText size={16} className="text-primary" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-base-content">{editingFile.name}</span>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={saveFile} className={`p-3 rounded-2xl text-primary bg-base-200 ${neoFlat} ${neoPressed}`}>
                      <Save size={18} />
                    </button>
                    <button onClick={() => setEditingFile(null)} className={`p-3 rounded-2xl text-error bg-base-200 ${neoFlat} ${neoPressed}`}>
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-8">
                  <textarea
                    value={editingFile.content}
                    onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
                    className={`w-full h-full p-6 font-mono text-[12px] resize-none focus:outline-none rounded-[2rem] bg-base-200 leading-relaxed text-base-content/80 ${neoInset}`}
                    spellCheck="false"
                    placeholder="// Initialize content..."
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-8 opacity-20">
                <div className={`p-12 rounded-[3rem] bg-base-200 ${neoFlat}`}>
                   <FileText size={80} strokeWidth={1} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Ready for protocol</p>
              </div>
            )}
          </div>
        </div>

        <input type="file" multiple ref={fileInputRef} onChange={handleUpload} className="hidden" />
        <input type="file" ref={folderInputRef} onChange={handleUpload} className="hidden" {...({ webkitdirectory: "" } as any)} />
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}