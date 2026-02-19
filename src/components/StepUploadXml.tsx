import { useState, useCallback } from 'react';
import { useFiscal } from '@/contexts/FiscalContext';
import { processarXml } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, Loader2, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function StepUploadXml() {
  const { setXmlData, setFileName, setCurrentStep, updateStepStatus } = useFiscal();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: '',
    message: '',
  });

  const showError = (title: string, message: string) => {
    setErrorDialog({ open: true, title, message });
  };

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith('.xml')) {
      showError('Arquivo inválido', 'Por favor, selecione um arquivo XML válido.');
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const response = await processarXml(file);
      if (response.success && response.data) {
        setXmlData(response.data);
        setFileName(file.name);
        updateStepStatus(0, 'APROVADO');
        setCurrentStep(1);
      } else {
        updateStepStatus(0, 'RECUSADO', response.message || 'Erro ao processar');
        showError('Erro ao processar XML', response.message || 'Falha ao processar o arquivo XML. Verifique se o arquivo está correto e tente novamente.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Não foi possível conectar ao servidor.';
      showError('Erro de conexão', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="shadow-md border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="w-5 h-5 text-primary" />
            Inserir Arquivo XML - Nota Fiscal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer ${
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            onClick={() => document.getElementById('xml-input')?.click()}
          >
            <input
              id="xml-input"
              type="file"
              accept=".xml"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={e => { e.stopPropagation(); setFile(null); }}
                  className="ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="font-medium">Arraste o arquivo XML aqui</p>
                <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
              </div>
            )}
          </div>

          <Button
            className="w-full mt-6"
            disabled={!file || loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              'Enviar XML'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Dialog de Erro */}
      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl">{errorDialog.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base pt-2">
              {errorDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog(prev => ({ ...prev, open: false }))}>
              Ok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
