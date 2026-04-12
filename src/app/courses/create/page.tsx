"use client";

import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Step1 } from "./_components/Step1";
import { Step2 } from "./_components/Step2";

const STEPS = [
  { id: 1, label: "Chuẩn hóa" },
  { id: 2, label: "Tri thức" },
  { id: 3, label: "Biểu đồ" },
  { id: 4, label: "Câu hỏi" },
  { id: 5, label: "Hoàn tất" },
];

export default function CreateCourse() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setIsProcessing(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsProcessing(false);
      }, 1000);
    }
  };

  const renderStepContent = () => {
    if (isProcessing) return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <Loader2 className="animate-spin text-[var(--color-brand-primary)] mb-4" size={32} />
        <span className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase animate-pulse">
          Processing Phase {currentStep}...
        </span>
      </div>
    );

    switch (currentStep) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      default: return <div className="w-full h-full flex items-center justify-center text-gray-300 italic">Tính năng đang được chuẩn bị...</div>;
    }
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="w-full flex flex-col min-h-full relative">
      
      {/* PROGRESS BAR - Dính sát top của vùng content */}
      <div className="sticky top-1 left-0 w-full h-[2px] bg-gray-100 z-50 shrink-0">
        <div 
          className="h-full bg-[var(--color-brand-primary)] transition-all duration-700 ease-in-out shadow-[0_0_8px_rgba(var(--color-brand-primary-rgb),0.4)]"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* step detail */}
      <main className="flex-1 w-full flex flex-col">
        {renderStepContent()}
      </main>

      {/* naviagation */}
      <footer className="sticky bottom-0 w-full border-t border-[var(--color-ui-border)] bg-[var(--color-ui-bg)]/80 backdrop-blur-md p-4 flex items-center justify-between shrink-0 z-40">
        <button 
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1 || isProcessing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-400 hover:text-[var(--color-ui-text-main)] disabled:opacity-0 transition-all"
        >
          <ArrowLeft size={18} />
        </button>

        <button 
          onClick={handleNext}
          disabled={currentStep === 5 || isProcessing}
          className="flex items-center gap-2 px-8 py-2.5 bg-[var(--color-brand-primary)] text-white rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-20 shadow-lg shadow-[var(--color-brand-primary)]/20"
        >
          {currentStep === 5 ? "Hoàn tất" : ""}
          <ArrowRight size={18} />
        </button>
      </footer>
    </div>
  );
}