import { useFiscal } from '@/contexts/FiscalContext';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export function Stepper() {
  const { currentStep, steps } = useFiscal();

  return (
    <div className="w-full px-2">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step.status === 'APROVADO'
                    ? 'bg-success text-success-foreground'
                    : step.status === 'RECUSADO'
                    ? 'bg-destructive text-destructive-foreground'
                    : i === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                } ${i === currentStep ? 'shadow-lg ring-4 ring-primary/20' : ''}`}
              >
                {step.status === 'APROVADO' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : step.status === 'RECUSADO' ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs font-medium text-center max-w-[80px] leading-tight ${
                i === currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`step-line mx-2 mb-5 ${
                i < currentStep ? 'step-line-active' : 'step-line-inactive'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
