import { useState, useCallback } from 'react';
import { useFiscal } from '@/contexts/FiscalContext';
import { processarXml } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function StepUploadXml() {
  const { setXmlData, setFileName, setCurrentStep, updateStepStatus } = useFiscal();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith('.xml')) {
      toast({ title: 'Arquivo inválido', description: 'Selecione um arquivo XML.', variant: 'destructive' });
      return;
    }
    setFile(f);
  }, [toast]);

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
        toast({ title: 'Erro', description: response.message || 'Falha ao processar XML', variant: 'destructive' });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Não foi possível conectar ao servidor.';
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
