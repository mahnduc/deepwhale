'use client';

import { CustomDictionaryEntry, fetchDictionaryInsightFromGroq } from '@/hooks/useDictionary';
import { keyApi } from '@/app/dashboard/settings/api-key/_api/key.api';
import { useState, useEffect } from 'react';

export interface PartOfSpeech {
  partOfSpeech: string;
  definitionEn: string;
  definitionVi: string;
}

export interface SavedWord {
  word: string;
  phonetics: string[];
  partsOfSpeech: PartOfSpeech[];
}

export interface UseCollectionReturn {
  collections: string[];
  selectedCollection: string | null;
  wordsList: SavedWord[];
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  newCollectionName: string;
  scrollbarClass: string;
  
  isDeleting: boolean;
  deletingWordIndex: number | null;
  localWordsList: SavedWord[];
  isAddModalOpen: boolean;
  newWord: string;
  isAddingWord: boolean;

  setIsModalOpen: (isOpen: boolean) => void;
  setNewCollectionName: (name: string) => void;
  setIsAddModalOpen: (isOpen: boolean) => void;
  setNewWord: (word: string) => void;
  resetSelection: () => void;

  handleSpeak: (text: string) => void;
  loadCollections: () => Promise<void>;
  handleCreateCollection: (e: React.FormEvent | string) => Promise<string>;
  handleSelectCollection: (fileName: string) => Promise<void>;
  handleDeleteCollection: () => Promise<void>;
  handleDeleteWord: (wordIndex: number, wordText: string) => Promise<void>;
  handleAddWord: () => Promise<void>;
  handleSaveDirectToCollection: (targetFileName: string, word: string, data: any) => Promise<void>;
}

export function useCollection(): UseCollectionReturn {
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [wordsList, setWordsList] = useState<SavedWord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newCollectionName, setNewCollectionName] = useState<string>('');

  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deletingWordIndex, setDeletingWordIndex] = useState<number | null>(null);
  const [localWordsList, setLocalWordsList] = useState<SavedWord[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newWord, setNewWord] = useState<string>('');
  const [isAddingWord, setIsAddingWord] = useState<boolean>(false);

  const scrollbarClass =
    'overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-[#E5E5E5] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#B2BEC3]';

  useEffect(() => {
    setLocalWordsList(wordsList);
  }, [wordsList]);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const loadCollections = async () => {
    try {
      const root = await navigator.storage.getDirectory();
      const dirHandle = await root.getDirectoryHandle('vocabulary-list', { create: true });
      const fileNames: string[] = [];
      // @ts-ignore
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
          fileNames.push(entry.name);
        }
      }
      setCollections(fileNames);
    } catch (err) {
      console.error('Lỗi quét thư mục OPFS:', err);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleCreateCollection = async (e: React.FormEvent | string): Promise<string> => {
    let rawName = '';
    if (typeof e === 'string') {
      rawName = e;
    } else {
      e.preventDefault();
      rawName = newCollectionName;
    }

    const trimmedName = rawName.trim();
    if (!trimmedName) return '';

    const fileName = trimmedName.endsWith('.json') ? trimmedName : `${trimmedName}.json`;
    try {
      const root = await navigator.storage.getDirectory();
      const dirHandle = await root.getDirectoryHandle('vocabulary-list', { create: true });
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify([]));
      await writable.close();
      
      if (typeof e !== 'string') {
        setNewCollectionName('');
        setIsModalOpen(false);
      }
      await loadCollections();
      return fileName;
    } catch (err) {
      console.error('Lỗi tạo bộ sưu tập mới:', err);
      return '';
    }
  };

  const handleSelectCollection = async (fileName: string) => {
    setSelectedCollection(fileName);
    setIsLoading(true);
    setError(null);
    try {
      const root = await navigator.storage.getDirectory();
      const dirHandle = await root.getDirectoryHandle('vocabulary-list', { create: true });
      const fileHandle = await dirHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const text = await file.text();
      const cleanText = text.trim();

      if (cleanText && cleanText !== '[]' && cleanText !== '{}') {
        try {
          const parsedData = JSON.parse(cleanText);
          const cleanData: SavedWord[] = Array.isArray(parsedData) ? parsedData : [parsedData];
          setWordsList(cleanData);
          setLocalWordsList(cleanData);
        } catch (parseErr) {
          console.error('Lỗi định dạng JSON:', parseErr);
          setWordsList([]);
          setLocalWordsList([]);
          setError('Tệp JSON không hợp lệ.');
        }
      } else {
        setWordsList([]);
        setLocalWordsList([]);
      }
    } catch (err) {
      console.error('Lỗi hệ thống tập tin:', err);
      setWordsList([]);
      setLocalWordsList([]);
      setError('Không thể đọc file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;
    const collectionName = selectedCollection.replace('.json', '');
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa bộ sưu tập "${collectionName}" không? Hành động này không thể hoàn tác.`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const root = await navigator.storage.getDirectory();
      const dirHandle = await root.getDirectoryHandle('vocabulary-list', { create: false });
      await dirHandle.removeEntry(selectedCollection);
      await loadCollections();
      resetSelection();
    } catch (err) {
      console.error('Lỗi khi xóa bộ sưu tập:', err);
      alert('Không thể xóa bộ sưu tập này. Vui lòng thử lại sau.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteWord = async (wordIndex: number, wordText: string) => {
    if (!selectedCollection) return;
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa từ "${wordText}" khỏi bộ sưu tập không?`);
    if (!confirmDelete) return;

    setDeletingWordIndex(wordIndex);
    const updatedWordsList = localWordsList.filter((_, index) => index !== wordIndex);
    setLocalWordsList(updatedWordsList);
    
    try {
      const root = await navigator.storage.getDirectory();
      const dirHandle = await root.getDirectoryHandle('vocabulary-list', { create: false });
      const fileHandle = await dirHandle.getFileHandle(selectedCollection, { create: false });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(updatedWordsList, null, 2));
      await writable.close();
      setWordsList(updatedWordsList);
    } catch (err) {
      console.error('Lỗi khi xóa từ:', err);
      alert('Không thể xóa từ này. Vui lòng thử lại.');
      setLocalWordsList(wordsList);
    } finally {
      setDeletingWordIndex(null);
    }
  };

  const saveWordToCollection = async (entry: CustomDictionaryEntry) => {
    if (!selectedCollection || !entry.ai || !entry.ai.partsOfSpeech) return;

    const sanitizedPartsOfSpeech = entry.ai.partsOfSpeech.map((pos) => ({
      partOfSpeech: pos.partOfSpeech,
      definitionEn: pos.definitionEn,
      definitionVi: pos.definitionVi,
    }));

    const cleanDataToSave: SavedWord = {
      word: entry.word,
      phonetics: entry.phonetics?.map((p) => p.text).filter(Boolean) as string[],
      partsOfSpeech: sanitizedPartsOfSpeech,
    };

    const root = await navigator.storage.getDirectory();
    const dirHandle = await root.getDirectoryHandle('vocabulary-list', { create: false });
    const fileHandle = await dirHandle.getFileHandle(selectedCollection, { create: false });
    
    let currentWords: SavedWord[] = [];
    try {
      const file = await fileHandle.getFile();
      const text = await file.text();
      if (text) {
        currentWords = JSON.parse(text);
      }
    } catch (err) {
      console.error(err);
    }

    const existingIndex = currentWords.findIndex(
      (w) => w.word.toLowerCase() === cleanDataToSave.word.toLowerCase()
    );

    if (existingIndex >= 0) {
      currentWords[existingIndex] = cleanDataToSave;
    } else {
      currentWords.push(cleanDataToSave);
    }

    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(currentWords, null, 2));
    await writable.close();
    
    setLocalWordsList(currentWords);
    setWordsList(currentWords);
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    try {
      setIsAddingWord(true);
      const cleanWord = newWord.trim().toLowerCase();
      const apiKey = await keyApi.getKey(1);
      if (!apiKey) {
        throw new Error('Không tìm thấy API key.');
      }

      const aiData = await fetchDictionaryInsightFromGroq(cleanWord, apiKey);
      const generatedEntry: CustomDictionaryEntry = {
        word: aiData.word || cleanWord,
        phonetics: [{ text: aiData.phonetic || '', audio: '' }],
        ai: aiData,
      };

      await saveWordToCollection(generatedEntry);
      setNewWord('');
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Không thể thêm từ mới.');
    } finally {
      setIsAddingWord(false);
    }
  };

  const handleSaveDirectToCollection = async (targetFileName: string, word: string, data: any) => {
    try {
      const root = await navigator.storage.getDirectory();
      const dirHandle = await root.getDirectoryHandle('vocabulary-list', { create: true });
      
      const jsonFileName = targetFileName.endsWith('.json') ? targetFileName : `${targetFileName}.json`;
      
      try {
        await dirHandle.getFileHandle(jsonFileName, { create: false });
      } catch (e) {
        const fileHandle = await dirHandle.getFileHandle(jsonFileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify([]));
        await writable.close();
        await loadCollections();
      }

      const fileHandle = await dirHandle.getFileHandle(jsonFileName, { create: false });
      const file = await fileHandle.getFile();
      const text = await file.text();
      let currentWords: SavedWord[] = [];
      
      if (text.trim()) {
        try {
          currentWords = JSON.parse(text);
        } catch (pErr) {
          currentWords = [];
        }
      }

      const cleanDataToSave: SavedWord = {
        word: word,
        phonetics: data.phonetics?.map((p: any) => p.text).filter(Boolean) || [],
        partsOfSpeech: data.ai?.partsOfSpeech?.map((pos: any) => ({
          partOfSpeech: pos.partOfSpeech,
          definitionEn: pos.definitionEn,
          definitionVi: pos.definitionVi,
        })) || []
      };

      const existingIndex = currentWords.findIndex(
        (w) => w.word.toLowerCase() === word.toLowerCase()
      );

      if (existingIndex >= 0) {
        currentWords[existingIndex] = cleanDataToSave;
      } else {
        currentWords.push(cleanDataToSave);
      }

      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(currentWords, null, 2));
      await writable.close();

      if (selectedCollection === jsonFileName) {
        setLocalWordsList(currentWords);
        setWordsList(currentWords);
      }
    } catch (error) {
      console.error('Lỗi khi tự động lưu vào bộ sưu tập:', error);
      throw error;
    }
  };

  const resetSelection = () => {
    setSelectedCollection(null);
    setWordsList([]);
    setLocalWordsList([]);
  };

  return {
    collections,
    selectedCollection,
    wordsList,
    isLoading,
    error,
    isModalOpen,
    newCollectionName,
    scrollbarClass,
    isDeleting,
    deletingWordIndex,
    localWordsList,
    isAddModalOpen,
    newWord,
    isAddingWord,
    setIsModalOpen,
    setNewCollectionName,
    setIsAddModalOpen,
    setNewWord,
    handleSpeak,
    loadCollections,
    handleCreateCollection,
    handleSelectCollection,
    handleDeleteCollection,
    handleDeleteWord,
    handleAddWord,
    handleSaveDirectToCollection,
    resetSelection,
  };
}