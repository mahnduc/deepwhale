"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Folder, 
  FileText, 
  Trash2, 
  Upload, 
  RefreshCw, 
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

  const readDirectory = useCallback(async (dirHandle: FileSystemDirectoryHandle): Promise<FileNode[]> => {
    const entries: FileNode[] = [];
    for await (const [name, handle] of dirHandle.entries()) {
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
      a.type === b.type ? a.name.localeCompare(b.name) : a.type === "folder" ? -1 : 1
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
        const fileHandle = await targetDir.getFileHandle(file.name, { create: true });
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

  const renderTree = (nodes: FileNode[], path: Path = []) => {
    return nodes.map((node) => {
      const fullPath = [...path, node.name];
      const key = fullPath.join("/");
      const isExpanded = expanded.includes(key);
      const isSelected = currentPath.join("/") === key;

      return (
        <div key={key} className="flex flex-col">
          <div 
            onClick={() => node.type === 'folder' ? toggleFolder(key, fullPath) : openFile(path, node.name)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors group mb-0.5
              ${isSelected ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]" : "hover:bg-[var(--color-ui-border)]/30"}`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {node.type === "folder" ? (
                <>
                  <div className="text-[var(--color-ui-text-subtle)]">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                  <Folder size={16} className={isExpanded ? "text-[var(--color-brand-primary)]" : "text-[var(--color-icon-muted)]"} />
                </>
              ) : (
                <>
                  <span className="w-3.5" /> 
                  <FileText size={16} className="text-[var(--color-icon-muted)]" />
                </>
              )}
              <span className={`text-[13px] truncate ${isSelected ? 'font-semibold' : 'text-[var(--color-ui-text-main)]'}`}>
                {node.name}
              </span>
            </div>

            <button 
              onClick={(e) => handleDelete(e, path, node.name, node.type)}
              className="opacity-0 group-hover:opacity-100 p-1 text-[var(--color-ui-text-subtle)] hover:text-[var(--color-state-error)] transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>

          {node.type === "folder" && isExpanded && node.children && (
            <div className="ml-4 border-l border-[var(--color-ui-border)] pl-1">
              {renderTree(node.children, fullPath)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-ui-bg)]">
      {/* TOOLBAR */}
      <div className="h-14 px-6 border-b border-[var(--color-ui-border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h5 className="!mb-0 uppercase tracking-widest text-[11px]">OPFS Storage</h5>
            <div className="flex items-center gap-2 text-[10px] text-[var(--color-ui-text-subtle)] font-mono">
              <FolderRoot size={10} />
              <span>/{currentPath.join("/") || "root"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={loadTree} className="p-2 hover:bg-[var(--color-ui-border)]/40 rounded-md transition-colors text-[var(--color-icon-muted)]">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="w-[1px] h-4 bg-[var(--color-ui-border)] mx-1" />
          <button onClick={() => handleCreate("folder")} className="p-2 hover:bg-[var(--color-ui-border)]/40 rounded-md transition-colors text-[var(--color-brand-primary)]" title="New Folder">
            <FolderPlus size={16} />
          </button>
          <button onClick={() => handleCreate("file")} className="p-2 hover:bg-[var(--color-ui-border)]/40 rounded-md transition-colors text-[var(--color-brand-primary)]" title="New File">
            <FilePlus size={16} />
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-[var(--color-ui-border)]/40 rounded-md transition-colors text-[var(--color-icon-muted)]" title="Upload">
            <Upload size={16} />
          </button>
        </div>
      </div>

      {/* EXPLORER LAYOUT */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* SIDEBAR TREE */}
        <aside className="w-72 border-r border-[var(--color-ui-border)] flex flex-col bg-[var(--color-ui-bg)]">
          <div className="p-3">
            <h6>Hệ thống tệp tin</h6>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-6 custom-scrollbar">
            {tree.length === 0 && !loading ? (
              <div className="py-10 text-center opacity-40">
                <Folder size={32} className="mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-[10px] uppercase tracking-tighter">Trống</p>
              </div>
            ) : (
              renderTree(tree)
            )}
          </div>
        </aside>

        {/* EDITOR AREA */}
        <main className="flex-1 flex flex-col bg-[var(--color-ui-bg)]">
          {editingFile ? (
            <div className="flex flex-col h-full animate-in fade-in duration-200">
              <div className="h-12 px-6 border-b border-[var(--color-ui-border)] flex items-center justify-between bg-[var(--color-ui-card)]/30">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[var(--color-brand-primary)]" />
                  <span className="text-xs font-semibold">{editingFile.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={saveFile} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-ui-text-main)] text-[var(--color-ui-bg)] rounded-md text-[10px] font-bold uppercase tracking-wider hover:opacity-90">
                    <Save size={12} />
                    <span>Lưu</span>
                  </button>
                  <button onClick={() => setEditingFile(null)} className="p-1.5 hover:bg-[var(--color-ui-border)] rounded-md">
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-6 overflow-hidden">
                <textarea
                  value={editingFile.content}
                  onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
                  className="w-full h-full p-6 bg-[var(--color-ui-card)] border border-[var(--color-ui-border)] rounded-xl text-[13px] font-mono outline-none focus:border-[var(--color-brand-primary)]/40 resize-none custom-scrollbar"
                  spellCheck="false"
                  placeholder="// Bắt đầu nhập nội dung..."
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="ui-card-outline p-12 flex flex-col items-center gap-4 opacity-40 max-w-xs">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--color-ui-border)] flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <p className="text-xs">Chọn một tệp tin từ thanh bên để bắt đầu chỉnh sửa hoặc tải lên tệp mới.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      <input type="file" multiple ref={fileInputRef} onChange={handleUpload} className="hidden" />
    </div>
  );
}