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
  FolderPlus,
  FilePlus,
  MoreVertical,
  GripVertical
} from "lucide-react";

import { opfsApi } from "../../lib/opfs/opfsApis";

type NodeType = "file" | "folder";
interface FileNode {
  name: string;
  type: NodeType;
  path: string;
  children?: FileNode[];
}

export default function OPFSExplorer() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("/"); 
  const [expanded, setExpanded] = useState<string[]>(["/"]);
  const [loading, setLoading] = useState(false);
  const [editingFile, setEditingFile] = useState<{
    path: string;
    name: string;
    content: string;
  } | null>(null);

  const [sidebarWidth, setSidebarWidth] = useState(260);
  const isResizing = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* --- RESIZE LOGIC --- */
  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    if (newWidth > 160 && newWidth < 600) {
      setSidebarWidth(newWidth);
    }
  }, []);

  /* --- CORE LOGIC --- */
  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      const data = await opfsApi.getTree("/");
      const mapNodes = (items: any[]): FileNode[] => {
        return items.map((item) => ({
          name: item.name,
          type: item.kind === "directory" ? "folder" : "file",
          path: item.path,
          children: item.children ? mapNodes(item.children) : undefined
        }));
      };
      setTree(mapNodes(data));
    } catch (error) {
      console.error("OPFS Load Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const handleSaveFile = async () => {
    if (editingFile) {
      try {
        await opfsApi.save(editingFile.path, editingFile.content);
        setEditingFile(null);
        loadTree();
      } catch (err) { alert(err); }
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setLoading(true);
    try {
      const cleanPath = currentPath.endsWith("/") ? currentPath : `${currentPath}/`;
      for (const file of Array.from(e.target.files)) {
        await opfsApi.save(`${cleanPath}${file.name}`, file);
      }
    } catch (err) { alert("Lỗi upload: " + err); }
    finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setLoading(false);
      loadTree();
    }
  };

  const handleCreate = async (type: NodeType) => {
    const name = prompt(`Nhập tên ${type === "folder" ? "thư mục" : "tập tin"}:`);
    if (!name) return;
    const cleanPath = currentPath.endsWith("/") ? currentPath : `${currentPath}/`;
    const fullPath = `${cleanPath}${name}`;
    try {
      type === "folder" ? await opfsApi.createFolder(fullPath) : await opfsApi.createEmptyFile(fullPath);
      if (!expanded.includes(currentPath)) setExpanded(prev => [...prev, currentPath]);
      loadTree();
    } catch (err) { alert("Lỗi: " + err); }
  };

  const openFile = async (path: string, name: string) => {
    try {
      const content = await opfsApi.readAsText(path);
      setEditingFile({ path, name, content });
    } catch (err) { alert("Lỗi mở file: " + err); }
  };

  const toggleFolder = (path: string) => {
    setCurrentPath(path);
    setExpanded(prev => prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]);
  };

  const renderTree = (nodes: FileNode[]) => {
    const sorted = [...nodes].sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "folder" ? -1 : 1));
    return sorted.map((node) => {
      const isExpanded = expanded.includes(node.path);
      const isSelected = currentPath === node.path;
      return (
        <div key={node.path} className="flex flex-col">
          <div 
            onClick={() => node.type === 'folder' ? toggleFolder(node.path) : openFile(node.path, node.name)}
            className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-all duration-200 group rounded-md mb-0.5
              ${isSelected ? "bg-[#00E5FF]/10 text-[#00E5FF]" : "hover:bg-white/5 text-white/60 hover:text-white"}`}
          >
            {node.type === "folder" ? (
              <Folder size={14} className={isExpanded ? "text-[#00E5FF] fill-[#00E5FF]/10" : "text-[#717B7A]"} />
            ) : (
              <FileText size={14} className={isSelected ? "text-[#00E5FF]" : "text-[#717B7A]"} />
            )}
            <span className={`text-[12px] truncate font-mono tracking-tight ${isSelected ? 'font-bold' : ''}`}>
              {node.name}
            </span>
          </div>
          {node.type === "folder" && isExpanded && node.children && (
            <div className="ml-3 border-l border-[#262626] pl-2 flex flex-col">
              {node.children.length > 0 ? renderTree(node.children) : <span className="text-[10px] text-[#262626] py-1 pl-4 uppercase">Empty</span>}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-[calc(100%+64px)] -mx-8 -mt-8 overflow-hidden bg-black font-mono selection:bg-[#00E5FF]/30">
      
      {/* --- LEFT SIDEBAR: STICKY --- */}
      <aside 
        style={{ width: `${sidebarWidth}px` }}
        className="flex flex-col shrink-0 bg-[#0A0A0A] border-r border-[#262626] relative group sticky top-0 h-full"
      >
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar pb-6 pt-6">
          <div className="text-[10px] text-[#717B7A] mb-4 uppercase tracking-[0.2em] font-bold">Explorer</div>
          {renderTree(tree)}
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={startResizing}
          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-[#00E5FF]/40 transition-colors flex items-center justify-center group/handle"
        >
          <div className="hidden group-hover/handle:block text-[#00E5FF]">
             <GripVertical size={10} />
          </div>
        </div>
      </aside>

      {/* --- CENTER MAIN: EDITOR (Màu nền xám tối giúp chữ trắng nổi bật) --- */}
      <main className="flex-1 flex flex-col bg-[#050505] relative min-w-0 overflow-y-auto custom-scrollbar">
        {editingFile ? (
          <div className="flex flex-col min-h-full animate-in fade-in duration-300">
            {/* Header Editor - Sticky top */}
            <div className="h-12 px-8 flex items-center justify-between shrink-0 border-b border-[#262626] bg-[#050505]/95 backdrop-blur sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"></div>
                <span className="text-[11px] text-white font-medium uppercase tracking-wider truncate">
                  {editingFile.path}
                </span>
              </div>
              <button 
                onClick={() => setEditingFile(null)} 
                className="p-1 hover:text-[#00E5FF] text-[#717B7A] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 px-8 py-6">
              <textarea
                value={editingFile.content}
                onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
                className="w-full h-full min-h-[70vh] bg-transparent border-none outline-none resize-none text-[14px] leading-relaxed font-mono text-white placeholder:text-[#262626]"
                spellCheck="false"
                autoFocus
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center select-none min-h-full">
          </div>
        )}
      </main>

      {/* --- RIGHT SIDEBAR: TOOLBAR STICKY --- */}
      <aside className="w-14 flex flex-col items-center py-6 gap-6 bg-[#0A0A0A] border-l border-[#262626] shrink-0 sticky top-0 h-full">
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleSaveFile} 
            className={`p-3 transition-all duration-300 rounded-xl ${
              editingFile 
                ? "text-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_15px_rgba(0,229,255,0.1)]" 
                : "text-[#262626] cursor-not-allowed"
            }`}
            title="Lưu (Save)"
          >
            <Save size={20} />
          </button>
          
          <div className="w-6 h-[1px] bg-[#262626] my-2 self-center" />

          <ToolbarButton icon={<FilePlus size={18} />} title="Tệp mới" onClick={() => handleCreate("file")} />
          <ToolbarButton icon={<FolderPlus size={18} />} title="Thư mục mới" onClick={() => handleCreate("folder")} />
          <ToolbarButton icon={<Upload size={18} />} title="Tải lên" onClick={() => fileInputRef.current?.click()} />
          <ToolbarButton icon={<RefreshCw size={18} />} title="Làm mới" onClick={loadTree} loading={loading} />
        </div>

        <div className="mt-auto flex flex-col gap-4 items-center">
          <button 
            onClick={() => {
                if (currentPath !== "/") {
                    const confirmDelete = confirm(`Xóa vĩnh viễn: ${currentPath}?`);
                    if(confirmDelete) opfsApi.delete(currentPath, true).then(loadTree);
                }
            }}
            className="p-3 text-[#717B7A] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Xóa">
            <Trash2 size={18} />
          </button>
          <button className="p-3 text-[#262626] hover:text-[#717B7A]">
            <MoreVertical size={18} />
          </button>
        </div>
      </aside>

      <input type="file" multiple ref={fileInputRef} onChange={handleUpload} className="hidden" />
    </div>
  );
}

const ToolbarButton = ({ icon, title, onClick, loading }: { icon: any, title: string, onClick: () => void, loading?: boolean }) => (
  <button 
    onClick={onClick} 
    className={`p-3 text-[#717B7A] hover:text-[#00E5FF] hover:bg-[#00E5FF]/5 rounded-xl transition-all ${loading ? "animate-spin text-[#00E5FF]" : ""}`} 
    title={title}
  >
    {icon}
  </button>
);