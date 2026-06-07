import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FileItem, NoteMetadata, GraphNode, GraphLink, GraphData, ViewMode,
  extractTags, extractWikiLinks, countWords 
} from './types';

export function useNoteGraph() {
  const [note, setNote] = useState<string>('');
  const [sourceFiles, setSourceFiles] = useState<FileItem[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => { setStatusMessage(''); }, 2500);
  };

  const refreshFileList = useCallback(async (selectTarget?: string) => {
    try {
      const root = await navigator.storage.getDirectory();
      const notebookDir = await root.getDirectoryHandle('notebook', { create: true });
      const fileList: FileItem[] = [];
      
      for await (const entry of (notebookDir as any).values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
          fileList.push({ name: entry.name, cleanName: entry.name.replace('.json', '') });
        }
      }
      
      fileList.sort((a, b) => a.cleanName.localeCompare(b.cleanName));
      setSourceFiles(fileList);

      if (selectTarget) {
        setSelectedSource(selectTarget);
      } else if (fileList.length > 0 && !selectedSource) {
        setSelectedSource(fileList[0].cleanName);
      }
    } catch (error) {
      console.error('Lỗi khi truy xuất kho lưu trữ OPFS:', error);
    }
  }, [selectedSource]);

  useEffect(() => {
    refreshFileList();
  }, []);

  useEffect(() => {
    if (!selectedSource) { setNote(''); return; }
    async function fetchExistingNote() {
      setIsLoading(true);
      setIsDirty(false);
      try {
        const root = await navigator.storage.getDirectory();
        const notebookDir = await root.getDirectoryHandle('notebook', { create: true });
        try {
          const fileHandle = await notebookDir.getFileHandle(`${selectedSource}.json`);
          const file = await fileHandle.getFile();
          const text = await file.text();
          if (text) {
            const parsed: NoteMetadata = JSON.parse(text);
            setNote(parsed.content || '');
          } else {
            setNote('');
          }
        } catch {
          setNote('');
        }
      } catch (error) {
        console.error('Lỗi nạp văn bản:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExistingNote();
  }, [selectedSource]);

  const performSave = useCallback(async (content: string, silent = false) => {
    if (!selectedSource) return;
    try {
      const root = await navigator.storage.getDirectory();
      const notebookDir = await root.getDirectoryHandle('notebook', { create: true });
      const fileHandle = await notebookDir.getFileHandle(`${selectedSource}.json`, { create: true });
      
      const payload: NoteMetadata = {
        title: selectedSource,
        sourceContext: selectedSource,
        content,
        updatedAt: new Date().toISOString(),
        characterCount: content.length,
        wordCount: countWords(content),
        tags: extractTags(content),
      };
      
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(payload, null, 2));
      await writable.close();
      setIsDirty(false);
      if (!silent) showStatus('Đã ghi nhận thay đổi');
    } catch {
      if (!silent) showStatus('Lưu dữ liệu thất bại!');
    }
  }, [selectedSource]);

  const handleNoteChange = (val: string) => {
    setNote(val);
    setIsDirty(true);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (selectedSource) performSave(val, true);
    }, 2000);
  };

  const handleSave = () => performSave(note, false);

  const buildGraphNetwork = useCallback(async () => {
    setIsLoading(true);
    try {
      const root = await navigator.storage.getDirectory();
      const notebookDir = await root.getDirectoryHandle('notebook', { create: true });
      const nodesMap = new Map<string, GraphNode>();
      const links: GraphLink[] = [];
      const degreeCount = new Map<string, number>();
      const rawLinks: { source: string; targets: string[] }[] = [];
      const noteToTagsMap = new Map<string, string[]>();
      const physicalFiles = new Set<string>();

      for await (const entry of (notebookDir as any).values()) {
        if (entry.kind !== 'file' || !entry.name.endsWith('.json')) continue;
        const fh = await notebookDir.getFileHandle(entry.name);
        const file = await fh.getFile();
        const text = await file.text();
        if (!text) continue;
        try {
          const parsed: NoteMetadata = JSON.parse(text);
          const currentFileName = parsed.title || entry.name.replace('.json', '');
          const noteContent = parsed.content || '';
          
          physicalFiles.add(currentFileName);

          nodesMap.set(currentFileName, {
            id: currentFileName,
            name: currentFileName,
            val: 14, 
            type: 'file', 
            level: 1,
          });

          const wikiLinks = extractWikiLinks(noteContent);
          if (wikiLinks.length > 0) rawLinks.push({ source: currentFileName, targets: wikiLinks });

          const tags = extractTags(noteContent);
          if (tags.length > 0) noteToTagsMap.set(currentFileName, tags);
        } catch {}
      }

      noteToTagsMap.forEach((tags, noteTitle) => {
        tags.forEach(tag => {
          const tagId = `#${tag}`;
          if (!nodesMap.has(tagId)) {
            nodesMap.set(tagId, { id: tagId, name: tagId, val: 10, type: 'tag', level: 1 });
          }
          links.push({ source: noteTitle, target: tagId });
          degreeCount.set(noteTitle, (degreeCount.get(noteTitle) || 0) + 1);
          degreeCount.set(tagId, (degreeCount.get(tagId) || 0) + 1);
        });
      });

      rawLinks.forEach(({ source, targets }) => {
        targets.forEach(conceptName => {
          if (conceptName === source) return;

          if (conceptName.includes('/') || conceptName.includes(' -> ')) {
            const separator = conceptName.includes('/') ? '/' : ' -> ';
            const parts = conceptName.split(separator).map(p => p.trim()).filter(Boolean);
            
            if (parts.length > 1) {
              for (let i = 0; i < parts.length; i++) {
                const currentNodeName = parts[i];
                const calculatedLevel = i + 1;
                
                if (!nodesMap.has(currentNodeName)) {
                  nodesMap.set(currentNodeName, {
                    id: currentNodeName,
                    name: currentNodeName,
                    val: 13, 
                    type: physicalFiles.has(currentNodeName) ? 'file' : 'concept',
                    level: calculatedLevel
                  });
                } else {
                  const existingNode = nodesMap.get(currentNodeName)!;
                  if (calculatedLevel > existingNode.level) {
                    existingNode.level = calculatedLevel;
                  }
                }
                
                if (i === 0) {
                  if (!links.some(l => l.source === source && l.target === currentNodeName)) {
                    links.push({ source, target: currentNodeName });
                    degreeCount.set(source, (degreeCount.get(source) || 0) + 1);
                    degreeCount.set(currentNodeName, (degreeCount.get(currentNodeName) || 0) + 1);
                  }
                } else {
                  const parentNodeName = parts[i - 1];
                  if (!links.some(l => l.source === parentNodeName && l.target === currentNodeName)) {
                    links.push({ source: parentNodeName, target: currentNodeName });
                    degreeCount.set(parentNodeName, (degreeCount.get(parentNodeName) || 0) + 1);
                    degreeCount.set(currentNodeName, (degreeCount.get(currentNodeName) || 0) + 1);
                  }
                }
              }
              return;
            }
          }

          if (!nodesMap.has(conceptName)) {
            nodesMap.set(conceptName, { 
              id: conceptName, 
              name: conceptName, 
              val: 13, 
              type: physicalFiles.has(conceptName) ? 'file' : 'concept', 
              level: 2 
            });
          }
          if (!links.some(l => l.source === source && l.target === conceptName)) {
            links.push({ source, target: conceptName });
            degreeCount.set(source, (degreeCount.get(source) || 0) + 1);
            degreeCount.set(conceptName, (degreeCount.get(conceptName) || 0) + 1);
          }
        });
      });

      for (const [id, node] of nodesMap) {
        node.degree = degreeCount.get(id) || 0;
      }

      setGraphData({ nodes: Array.from(nodesMap.values()), links });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'graph') buildGraphNetwork();
  }, [viewMode, buildGraphNetwork]);

  const handleCreateNewNote = async () => {
    const rawName = prompt('Nhập tên cho ghi chú mới');
    if (!rawName) return;
    
    const cleanName = rawName.trim().replace(/[/\\?%*:|"<>]/g, '');
    if (!cleanName) return;

    if (sourceFiles.some(f => f.cleanName.toLowerCase() === cleanName.toLowerCase())) {
      setSelectedSource(cleanName);
      return;
    }

    try {
      const root = await navigator.storage.getDirectory();
      const notebookDir = await root.getDirectoryHandle('notebook', { create: true });
      const fileHandle = await notebookDir.getFileHandle(`${cleanName}.json`, { create: true });
      
      const initialPayload: NoteMetadata = {
        title: cleanName,
        sourceContext: cleanName,
        content: `# ${cleanName}\n\nBắt đầu viết tại đây...`,
        updatedAt: new Date().toISOString(),
        characterCount: 0,
        wordCount: 0,
        tags: []
      };

      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(initialPayload, null, 2));
      await writable.close();
      
      await refreshFileList(cleanName);
      setViewMode('edit');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameNote = async () => {
    if (!selectedSource) return;
    
    const rawNewName = prompt(`Đổi tên cho ghi chú "${selectedSource}" thành:`, selectedSource);
    if (!rawNewName) return;

    const cleanNewName = rawNewName.trim().replace(/[/\\?%*:|"<>]/g, '');
    if (!cleanNewName || cleanNewName === selectedSource) return;

    if (sourceFiles.some(f => f.cleanName.toLowerCase() === cleanNewName.toLowerCase())) {
      alert('Tên ghi chú này đã tồn tại!');
      return;
    }

    setIsLoading(true);
    try {
      const root = await navigator.storage.getDirectory();
      const notebookDir = await root.getDirectoryHandle('notebook', { create: true });
      
      const oldFileHandle = await notebookDir.getFileHandle(`${selectedSource}.json`);
      const oldFile = await oldFileHandle.getFile();
      const oldText = await oldFile.text();
      let currentContent = note;
      let updatedAt = new Date().toISOString();
      
      if (oldText) {
        try {
          const parsed: NoteMetadata = JSON.parse(oldText);
          currentContent = parsed.content || note;
          updatedAt = parsed.updatedAt;
        } catch {}
      }

      const newFileHandle = await notebookDir.getFileHandle(`${cleanNewName}.json`, { create: true });
      const payload: NoteMetadata = {
        title: cleanNewName,
        sourceContext: cleanNewName,
        content: currentContent,
        updatedAt: updatedAt,
        characterCount: currentContent.length,
        wordCount: countWords(currentContent),
        tags: extractTags(currentContent),
      };

      const writable = await newFileHandle.createWritable();
      await writable.write(JSON.stringify(payload, null, 2));
      await writable.close();

      await notebookDir.removeEntry(`${selectedSource}.json`);
      showStatus(`Đã đổi tên thành: ${cleanNewName}`);
      
      await refreshFileList(cleanNewName);
      if (viewMode === 'graph') await buildGraphNetwork();
    } catch (err) {
      console.error('Lỗi khi đổi tên file hệ thống:', err);
      showStatus('Đổi tên thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoCreateFromConcept = async (conceptName: string) => {
    const cleanName = conceptName.trim().replace(/[/\\?%*:|"<>]/g, '');
    if (!cleanName) return;

    try {
      const root = await navigator.storage.getDirectory();
      const notebookDir = await root.getDirectoryHandle('notebook', { create: true });
      const fileHandle = await notebookDir.getFileHandle(`${cleanName}.json`, { create: true });
      
      const initialPayload: NoteMetadata = {
        title: cleanName,
        sourceContext: cleanName,
        content: `# ${cleanName}\n\n*Ghi chú này được khởi tạo tự động từ Đồ thị tri thức.*\n\nBắt đầu phát triển nội dung tại đây...`,
        updatedAt: new Date().toISOString(),
        characterCount: 0,
        wordCount: 0,
        tags: []
      };

      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(initialPayload, null, 2));
      await writable.close();
      
      showStatus(`Đã tạo không gian: ${cleanName}`);
      await refreshFileList(cleanName);
      await buildGraphNetwork();
      setViewMode('edit');
    } catch (err) {
      console.error('Không thể tạo file từ đồ thị:', err);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedSource || !confirm(`Xóa vĩnh viễn ghi chú "${selectedSource}"?`)) return;
    try {
      const root = await navigator.storage.getDirectory();
      const notebookDir = await root.getDirectoryHandle('notebook', { create: true });
      await notebookDir.removeEntry(`${selectedSource}.json`);
      
      const nextIndex = sourceFiles.findIndex(f => f.cleanName === selectedSource);
      let newSelection = '';
      if (sourceFiles.length > 1) {
        newSelection = nextIndex === 0 ? sourceFiles[1].cleanName : sourceFiles[nextIndex - 1].cleanName;
      }
      setSelectedSource(newSelection);
      await refreshFileList(newSelection);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    note, sourceFiles, selectedSource, statusMessage, isLoading, isDirty, viewMode, graphData,
    setSelectedSource, setViewMode, handleNoteChange, handleSave, handleCreateNewNote,
    handleRenameNote, handleAutoCreateFromConcept, handleDeleteNote, buildGraphNetwork, showStatus
  };
}