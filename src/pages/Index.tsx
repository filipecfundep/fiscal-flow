import { FiscalProvider, useFiscal } from '@/contexts/FiscalContext';
import { Stepper } from '@/components/Stepper';
import { StepStatusCard } from '@/components/StepStatusCard';
import { StepUploadXml } from '@/components/StepUploadXml';
import { StepXmlResults } from '@/components/StepXmlResults';
import { StepDadosPedido } from '@/components/StepDadosPedido';
import { StepSolicitacao } from '@/components/StepSolicitacao';
import { StepResultado } from '@/components/StepResultado';
import { FileText } from 'lucide-react';

function FiscalContent() {
  const { currentStep } = useFiscal();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Processo Fiscal</h1>
            <p className="text-xs text-muted-foreground">Validação de Nota Fiscal</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Stepper />
        <StepStatusCard />

        {currentStep === 0 && <StepUploadXml />}
        {currentStep === 1 && <StepXmlResults />}
        {currentStep === 2 && <StepDadosPedido />}
        {currentStep === 3 && <StepSolicitacao />}
        {currentStep === 4 && <StepResultado />}
      </main>
    </div>
  );
}

const Index = () => (
  <FiscalProvider>
    <FiscalContent />
  </FiscalProvider>
);

export default Index;
