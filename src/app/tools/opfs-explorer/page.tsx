"use client";

import { useEffect, useState } from "react";
import { Folder, File, RefreshCw, Plus, Trash2, X, Save, ChevronDown, ChevronRight } from "lucide-react";

type NodeType = "file" | "folder";

interface FileNode {
  name: string;
  type: NodeType;
  children?: FileNode[];
}

export default function OPFSExplorer() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [editingFile, setEditingFile] = useState<{ name: string; content: string; path: string[] } | null>(null);
  
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(["/"]));

  const neoFlat = "shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.7)]";
  const neoInset = "shadow-[inset_6px_6px_12px_rgba(0,0,0,0.1),inset_-6px_-6px_12px_rgba(255,255,255,0.7)]";
  const neoPressed = "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] active:scale-[0.98]";

  useEffect(() => {
    setIsMounted(true);
    loadTree();
  }, []);

  const loadTree = async () => {
    if (typeof window === 'undefined' || !navigator.storage) return;
    const root = await navigator.storage.getDirectory();
    const result = await readDirectory(root);
    setTree(result);
  };

  const readDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<FileNode[]> => {
    const entries: FileNode[] = [];
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === "directory") {
        const children = await readDirectory(handle);
        entries.push({ name, type: "folder", children });
      } else {
        entries.push({ name, type: "file" });
      }
    }
    return entries.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "folder" ? -1 : 1));
  };

  const toggleFolder = (pathStr: string) => {
    const newPaths = new Set(expandedPaths);
    if (newPaths.has(pathStr)) newPaths.delete(pathStr);
    else newPaths.add(pathStr);
    setExpandedPaths(newPaths);
  };

  const getDirFromPath = async (path: string[]) => {
    let dir = await navigator.storage.getDirectory();
    if (!path || path.length === 0) return dir;
    for (const segment of path) {
      try { dir = await dir.getDirectoryHandle(segment, { create: false }); } 
      catch (e) { return await navigator.storage.getDirectory(); }
    }
    return dir;
  };

  const deleteEntry = async (e: React.MouseEvent, path: string[], name: string, type: NodeType) => {
    e.stopPropagation();
    if (!confirm(`Xác nhận xóa: ${name}?`)) return;
    try {
      const parentPath = path.slice(0, -1);
      const dir = await getDirFromPath(parentPath);
      await dir.removeEntry(name, { recursive: type === "folder" });
      loadTree();
      if (editingFile?.name === name) setEditingFile(null);
    } catch (err) { alert("Lỗi khi xóa."); }
  };

  const openFile = async (path: string[], name: string) => {
    try {
      const parentPath = path.slice(0, -1);
      const dir = await getDirFromPath(parentPath);
      const fileHandle = await dir.getFileHandle(name);
      const file = await fileHandle.getFile();
      const content = await file.text();
      setEditingFile({ name, content, path });
    } catch (err) { alert("Không thể mở file."); }
  };

  const saveFile = async () => {
    if (!editingFile) return;
    try {
      const parentPath = editingFile.path.slice(0, -1);
      const dir = await getDirFromPath(parentPath);
      const fileHandle = await dir.getFileHandle(editingFile.name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(editingFile.content);
      await writable.close();
      setEditingFile(null);
      loadTree();
    } catch (err) { alert("Lỗi khi lưu file"); }
  };

  const renderTree = (nodes: FileNode[], path: string[] = []) => {
    return (
      <ul className="pl-6 mt-4 space-y-4">
        {nodes.map((node) => {
          const newPath = [...path, node.name];
          const pathStr = newPath.join("/");
          const isSelected = currentPath.join("/") === pathStr;
          const isExpanded = expandedPaths.has(pathStr);

          return (
            <li key={pathStr}>
              <div className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer ${isSelected ? neoInset : neoFlat} ${neoPressed}`}>
                <div
                  className="flex items-center gap-4 flex-1 overflow-hidden"
                  onClick={() => {
                    setCurrentPath(newPath);
                    if (node.type === "folder") toggleFolder(pathStr);
                    else openFile(newPath, node.name);
                  }}
                >
                  {node.type === "folder" && (
                    <div className="text-base-content/30 italic">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  )}

                  <div className={`p-2 rounded-xl ${isSelected ? "text-primary" : "text-base-content/60"}`}>
                    {node.type === "folder" ? <Folder size={18} /> : <File size={18} />}
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-wider truncate">
                    {node.name}
                  </span>
                </div>

                <button 
                  onClick={(e) => deleteEntry(e, newPath, node.name, node.type)}
                  className={`ml-2 p-2 rounded-xl text-error/60 hover:text-error transition-all ${neoFlat} ${neoPressed}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              {node.type === "folder" && isExpanded && node.children && node.children.length > 0 && (
                renderTree(node.children, newPath)
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-6 md:p-12 select-none">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-base-content">
              OPFS <span className="text-primary">Explorer</span>
            </h1>
            <p className="text-[10px] font-bold opacity-30 tracking-[0.4em] mt-2">LOCAL STORAGE ENGINE</p>
          </div>
          
          <div className="flex flex-wrap gap-5">
            <button 
              onClick={() => setCurrentPath([])} 
              className={`px-6 py-3 rounded-2xl text-[11px] font-bold uppercase transition-all ${currentPath.length === 0 ? neoInset + ' text-primary' : neoFlat} ${neoPressed}`}
            >
              Root
            </button>

            <button onClick={loadTree} className={`p-4 rounded-2xl transition-all ${neoFlat} ${neoPressed}`}>
              <RefreshCw size={18} className="text-base-content/60" />
            </button>

            <button onClick={async () => {
              const name = prompt("Tên thư mục mới?");
              if (name) {
                const dir = await getDirFromPath(currentPath);
                await dir.getDirectoryHandle(name, { create: true });
                loadTree();
              }
            }} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-bold uppercase text-primary transition-all ${neoFlat} ${neoPressed}`}>
              <Plus size={16} /> Folder
            </button>

            <button onClick={async () => {
              const name = prompt("Tên file mới?");
              if (name) {
                const dir = await getDirFromPath(currentPath);
                const fileHandle = await dir.getFileHandle(name, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write("");
                await writable.close();
                loadTree();
              }
            }} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-bold uppercase text-secondary transition-all ${neoFlat} ${neoPressed}`}>
              <Plus size={16} /> File
            </button>
          </div>
        </div>

        <div className={`p-5 mb-10 rounded-2xl bg-base-200 text-[11px] font-bold text-primary uppercase tracking-widest ${neoInset}`}>
          <span className="opacity-30 mr-2 underline">Location:</span>
          <span className="text-base-content/80 truncate">
            {currentPath.length === 0 ? "/" : `/${currentPath.join("/")}`}
          </span>
        </div>

        <div className={`bg-base-200 rounded-[2.5rem] min-h-150 p-8 ${neoInset}`}>
          {tree.length === 0 ? (
            <div className="h-100 flex flex-col items-center justify-center">
               <span className="loading loading-ring loading-lg text-primary/30 mb-4"></span>
               <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">Scanning System...</p>
            </div>
          ) : (
            renderTree(tree)
          )}
        </div>
      </div>

      {editingFile && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-base-200/80 backdrop-blur-sm">
          <div className={`w-full max-w-4xl h-[85vh] bg-base-200 rounded-[3rem] flex flex-col overflow-hidden ${neoFlat}`}>
            <div className="p-8 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 opacity-50">Editor</span>
                <h3 className="font-bold text-lg text-base-content uppercase italic">{editingFile.name}</h3>
              </div>
              <button onClick={() => setEditingFile(null)} className={`p-4 rounded-full ${neoFlat} ${neoPressed}`}>
                <X size={20} className="text-base-content" />
              </button>
            </div>
            
            <div className="flex-1 px-8 pb-4">
              <textarea
                className={`w-full h-full p-8 bg-base-200 rounded-4xl outline-none text-base-content font-mono text-sm leading-relaxed resize-none ${neoInset}`}
                value={editingFile.content}
                onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
                spellCheck={false}
              />
            </div>

            <div className="p-8 flex justify-end gap-8 items-center">
              <button onClick={() => setEditingFile(null)} className="text-[11px] font-bold uppercase tracking-widest text-base-content/40 hover:text-base-content transition-colors">Discard</button>
              <button onClick={saveFile} className={`flex items-center gap-2 px-12 py-5 rounded-2xl text-[11px] font-black uppercase text-primary ${neoFlat} ${neoPressed}`}>
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}