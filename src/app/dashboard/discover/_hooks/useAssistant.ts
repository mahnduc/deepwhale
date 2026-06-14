"use client";

import React, { useEffect, useRef } from "react";
import { useOPFSFiles } from "./useOPFSFiles";
import { useUploadToOPFS } from "./useUploadToOPFS";
import { useIngestFile } from "./useIngestFile";
import { useQuiz } from "./useQuiz";

export function useAssistant() {
  const DIR_NAME = "system-raw-file";

  const { files, loading, refreshFiles, deleteFile } = useOPFSFiles(DIR_NAME);
  const { 
    quizData, 
    setQuizData, 
    isLoadingQuiz, 
    showToolbar, 
    setShowToolbar, 
    isPracticing, 
    setIsPracticing, 
    loadQuizFromOPFS, 
    handleToggleToolbar, 
    handleStartQuiz, 
    handleStopQuiz 
  } = useQuiz();
  
  const ingestFileContext = useIngestFile(DIR_NAME);
  const { selectedFile, setSelectedFile, isIngesting, isGeneratingQuiz, handleSelectFile, handleConfirmIngestion } = ingestFileContext;

  const { fileInputRef, triggerFileInput, handleFileUpload } = useUploadToOPFS({
    directoryName: DIR_NAME,
    onUploadSuccess: refreshFiles,
  });

  const lastIngestedFileRef = useRef<string | null>(null);

  const cleanFolderName = selectedFile ? selectedFile.replace(/\.[^/.]+$/, "") : "";
  const isPending = isIngesting || isGeneratingQuiz;
  const isActionDisabled = !selectedFile || isPending;

  useEffect(() => {
    if (!selectedFile || isIngesting || lastIngestedFileRef.current === selectedFile) {
      if (!selectedFile) lastIngestedFileRef.current = null;
      return;
    }

    const autoIngest = async () => {
      lastIngestedFileRef.current = selectedFile;
      try {
        await handleConfirmIngestion();
      } catch (err) {
        console.error("Lỗi tự động nạp cấu trúc tri thức:", err);
        lastIngestedFileRef.current = null; 
      }
    };

    autoIngest();
  }, [selectedFile, isIngesting, handleConfirmIngestion]);

  useEffect(() => {
    if (!selectedFile) {
      setQuizData(null);
      return;
    }
    if (!isGeneratingQuiz) {
      loadQuizFromOPFS(cleanFolderName);
    }
  }, [selectedFile, isGeneratingQuiz, cleanFolderName, loadQuizFromOPFS, setQuizData]);

  useEffect(() => {
    setShowToolbar(false);
    setIsPracticing(false);
  }, [selectedFile, setShowToolbar, setIsPracticing]);

  const handleDeleteFile = async (name: string, e: React.MouseEvent) => {
    await deleteFile(name, e, () => {
      if (selectedFile === name) {
        setSelectedFile(null);
        lastIngestedFileRef.current = null;
      }
    });
  };

  return {
    // File & Upload state
    files,
    loading,
    selectedFile,
    fileInputRef,
    triggerFileInput,
    handleFileUpload,
    handleSelectFile,
    deleteFile: handleDeleteFile,
    cleanFolderName,

    // Ingest & Generator state
    isIngesting,
    isGeneratingQuiz,
    requestedQuestions: ingestFileContext.requestedQuestions,
    setRequestedQuestions: ingestFileContext.setRequestedQuestions,
    handleCreateQuiz: ingestFileContext.handleCreateQuiz,
    isPending,
    isActionDisabled,

    // Quiz state
    quizData,
    isLoadingQuiz,
    showToolbar,
    isPracticing,
    handleToggleToolbar,
    handleStartQuiz,
    handleStopQuiz,
  };
}