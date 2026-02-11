import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { XmlData, StepInfo, StepStatus } from '@/types/fiscal';

interface FiscalContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  steps: StepInfo[];
  updateStepStatus: (stepIndex: number, status: StepStatus, motivo?: string) => void;
  xmlData: XmlData | null;
  setXmlData: (data: XmlData | null) => void;
  fileName: string;
  setFileName: (name: string) => void;
  solicitacaoId: number | null;
  setSolicitacaoId: (id: number | null) => void;
  resetAll: () => void;
}

const defaultSteps: StepInfo[] = [
  { label: 'Inserir XML', status: 'PENDENTE' },
  { label: 'Dados XML', status: 'PENDENTE' },
  { label: 'Dados Pedido', status: 'PENDENTE' },
  { label: 'Resultado Solicitacao', status: 'PENDENTE' },
  { label: 'Resultado Final', status: 'PENDENTE' },
];

const FiscalContext = createContext<FiscalContextType | undefined>(undefined);

export function FiscalProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<StepInfo[]>([...defaultSteps]);
  const [xmlData, setXmlData] = useState<XmlData | null>(null);
  const [fileName, setFileName] = useState('');
  const [solicitacaoId, setSolicitacaoId] = useState<number | null>(null);

  const updateStepStatus = (stepIndex: number, status: StepStatus, motivo?: string) => {
    setSteps(prev => prev.map((s, i) => i === stepIndex ? { ...s, status, motivo } : s));
  };

  const resetAll = () => {
    setCurrentStep(0);
    setSteps([...defaultSteps]);
    setXmlData(null);
    setFileName('');
    setSolicitacaoId(null);
  };

  return (
    <FiscalContext.Provider value={{
      currentStep, setCurrentStep,
      steps, updateStepStatus,
      xmlData, setXmlData,
      fileName, setFileName,
      solicitacaoId, setSolicitacaoId,
      resetAll,
    }}>
      {children}
    </FiscalContext.Provider>
  );
}

export function useFiscal() {
  const ctx = useContext(FiscalContext);
  if (!ctx) throw new Error('useFiscal must be used within FiscalProvider');
  return ctx;
}
