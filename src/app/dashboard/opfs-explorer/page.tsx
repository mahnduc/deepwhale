"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Folder, FileText, Trash2, Upload, RefreshCw, 
  X, Save, FolderPlus, FilePlus, ChevronRight
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

  const [sidebarWidth] = useState(260);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      console.error("Lỗi tải cây thư mục:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTree(); }, [loadTree]);

  const handleSaveFile = async () => {
    if (editingFile) {
      try {
        await opfsApi.save(editingFile.path, editingFile.content);
        setEditingFile(null);
        await loadTree();
      } catch (err) {
        alert("Không thể lưu tệp: " + err);
      }
    }
  };

  const handleCreate = async (type: NodeType) => {
    const name = prompt(`Nhập tên ${type === "folder" ? "thư mục" : "tập tin"}:`);
    if (!name) return;
    const cleanPath = currentPath.endsWith("/") ? currentPath : `${currentPath}/`;
    const fullPath = `${cleanPath}${name}`;
    try {
      if (type === "folder") await opfsApi.createFolder(fullPath);
      else await opfsApi.createEmptyFile(fullPath);
      if (!expanded.includes(currentPath)) setExpanded(prev => [...prev, currentPath]);
      await loadTree();
    } catch (err) { alert("Lỗi tạo mới: " + err); }
  };

  const openFile = async (path: string, name: string) => {
    try {
      const content = await opfsApi.readAsText(path);
      setEditingFile({ path, name, content });
    } catch (err) { alert("Lỗi đọc tệp: " + err); }
  };

  const handleDelete = async () => {
    if (currentPath === "/") return;
    if (confirm(`Xóa vĩnh viễn: ${currentPath}?`)) {
      try {
        await opfsApi.delete(currentPath, true);
        setCurrentPath("/");
        await loadTree();
      } catch (err) { alert("Lỗi xóa: " + err); }
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
      await loadTree();
    } catch (err) { alert("Lỗi tải lên: " + err); } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setLoading(false);
    }
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
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-all duration-200 group rounded-lg mb-0.5
              ${isSelected ? "bg-[#FFF0F7] text-[#FF3399]" : "hover:bg-[#F7F9FB] text-[#2D3436] font-bold"}`}
          >
            {node.type === "folder" ? (
              <Folder size={16} className={isExpanded ? "text-[#FF3399] fill-[#FF3399]/10" : "text-[#B2BEC3]"} />
            ) : (
              <FileText size={16} className={isSelected ? "text-[#FF3399]" : "text-[#B2BEC3]"} />
            )}
            <span className="text-[13px] truncate flex-1">{node.name}</span>
            {node.type === "folder" && (
              <ChevronRight size={12} className={`transition-transform ${isExpanded ? 'rotate-90' : ''} text-[#B2BEC3]`} />
            )}
          </div>
          {node.type === "folder" && isExpanded && node.children && (
            <div className="ml-4 border-l border-[#E5E5E5] pl-2 flex flex-col">
              {node.children.length > 0 ? renderTree(node.children) : <span className="text-[10px] text-[#B2BEC3] py-1 pl-4 font-bold">TRỐNG</span>}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    /* ĐÃ XÓA VIỀN NGOÀI VÀ BO GÓC CONTAINER */
    <div className="flex h-full w-full overflow-hidden bg-white">
      
      {/* SIDEBAR TRÁI */}
      <aside style={{ width: `${sidebarWidth}px` }} className="flex flex-col bg-white border-r border-[#F0F0F0] shrink-0">
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
          <h2 className="text-[10px] text-[#B2BEC3] mb-4 font-black uppercase tracking-widest">Hệ thống tệp tin</h2>
          <div className="space-y-0.5">{renderTree(tree)}</div>
        </div>
      </aside>

      {/* EDITOR CHÍNH */}
      <main className="flex-1 flex flex-col bg-white min-w-0">
        {editingFile ? (
          <div className="flex flex-col h-full animate-in fade-in duration-200">
            <div className="h-14 px-6 flex items-center justify-between border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00CEC9]"></div>
                <span className="text-[13px] text-[#2D3436] font-black uppercase tracking-tight">{editingFile.name}</span>
              </div>
              <button onClick={() => setEditingFile(null)} className="p-1.5 hover:bg-[#F7F9FB] rounded-md text-[#B2BEC3] hover:text-[#FF3399] transition-all">
                <X size={18} strokeWidth={3} />
              </button>
            </div>
            <div className="flex-1 p-6">
              <textarea
                value={editingFile.content}
                onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
                className="w-full h-full bg-[#F7F9FB] rounded-xl p-5 outline-none resize-none text-[14px] font-mono text-[#2D3436] border border-[#F0F0F0] focus:border-[#FF3399]/20 transition-all"
                spellCheck="false" autoFocus
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#B2BEC3] bg-[#FDFDFD]">
            <Folder size={48} strokeWidth={1} className="mb-3 opacity-10" />
            <p className="font-bold text-[13px] uppercase tracking-widest opacity-40">Chọn tệp để chỉnh sửa</p>
          </div>
        )}
      </main>

      {/* TOOLBAR PHẢI - ĐÃ THU NHỎ ICON VÀ NÚT */}
      <aside className="w-16 flex flex-col items-center py-6 gap-3 bg-[#F7F9FB] border-l border-[#F0F0F0] shrink-0">
        <button 
          onClick={handleSaveFile} disabled={!editingFile}
          className={`p-3 rounded-xl border-b-2 active:translate-y-0.5 active:border-b-0 transition-all ${editingFile ? "bg-[#00CEC9] text-white border-[#00A8A5] shadow-md" : "bg-white text-[#E5E5E5] border-[#E5E5E5]"}`}
        >
          <Save size={20} strokeWidth={2.5} />
        </button>
        <div className="w-8 h-[1px] bg-[#E5E5E5] my-1" />
        <ToolbarButton icon={<FilePlus size={18} />} onClick={() => handleCreate("file")} />
        <ToolbarButton icon={<FolderPlus size={18} />} onClick={() => handleCreate("folder")} />
        <ToolbarButton icon={<Upload size={18} />} onClick={() => fileInputRef.current?.click()} />
        <ToolbarButton icon={<RefreshCw size={18} />} onClick={loadTree} loading={loading} color="text-[#FF3399]" />
        
        <div className="mt-auto">
          <button onClick={handleDelete} className="p-3 text-[#B2BEC3] hover:text-[#FF3399] hover:bg-[#FFF0F7] rounded-xl transition-all">
            <Trash2 size={20} strokeWidth={2.5} />
          </button>
        </div>
      </aside>

      <input type="file" multiple ref={fileInputRef} onChange={handleUpload} className="hidden" />
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #EEE; border-radius: 10px; }
      `}</style>
    </div>
  );
}

const ToolbarButton = ({ icon, onClick, loading, color }: any) => (
  <button onClick={onClick} className={`p-3 bg-white rounded-xl border border-[#E5E5E5] border-b-[3px] hover:border-[#FF3399]/30 active:translate-y-0.5 active:border-b-px transition-all ${loading ? "animate-spin" : ""}`}>
    <div className={`${color || "text-[#2D3436]"}`}>{icon}</div>
  </button>
);