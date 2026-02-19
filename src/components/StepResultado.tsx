import { useState, useEffect, useRef } from 'react';
import { useFiscal } from '@/contexts/FiscalContext';
import { consultarSolicitacao, consultarProcessoFiscal } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, RefreshCw, ArrowLeft, AlertCircle, Pencil } from 'lucide-react';
import type { SolicitacaoDetailResponse, ConsultarProcessoFiscalResponse } from '@/types/fiscal';
import { isStatusSuccess, isStatusError, isStatusPending } from '@/types/fiscal';

export function StepResultado() {
  const { solicitacaoId, updateStepStatus, resetAll, setCurrentStep } = useFiscal();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolicitacaoDetailResponse | null>(null);
  const [error, setError] = useState('');
  const [processoFiscal, setProcessoFiscal] = useState<ConsultarProcessoFiscalResponse | null>(null);
  const [loadingProcesso, setLoadingProcesso] = useState(false);
  const hasConsultedRef = useRef(false);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const consultar = async (isRetry = false) => {
    if (!solicitacaoId) return;
    
    if (!isRetry) {
      setResult(null); 
      setProcessoFiscal(null);
      setError('');
    }
    
    setLoading(true);
    
    try {
      const data = await consultarSolicitacao(solicitacaoId);
      setResult(data);
      
      const statusSuccess = isStatusSuccess(data.data.status);
      const statusError = isStatusError(data.data?.status);
      const statusPending = isStatusPending(data.data?.status);
      const hasApiErrors = Boolean(data.data?.erros || data.errors?.length);

      // 1. SUCESSO NA SOLICITAÇÃO
      if (data.success && statusSuccess && !hasApiErrors) {
        updateStepStatus(4, 'APROVADO');
        
        // Função recursiva para buscar o ID até que ele exista
        const buscarIdProcesso = async (idSolicitacao: number) => {
          setLoadingProcesso(true);
          try {
            const processoData = await consultarProcessoFiscal(idSolicitacao);
            
            // Se a API retornou sucesso mas o ID ainda é nulo/vazio, tenta de novo em 2s
            if (!processoData.data?.id) {
              setTimeout(() => buscarIdProcesso(idSolicitacao), 2000);
            } else {
              setProcessoFiscal(processoData);
              setLoadingProcesso(false);
            }
          } catch (err) {
            // Em caso de erro na rede, tenta novamente também
            setTimeout(() => buscarIdProcesso(idSolicitacao), 3000);
          }
        };

        if (data.data?.id) {
          buscarIdProcesso(data.data.id);
        }
      } 
      // 2. AINDA PROCESSANDO A SOLICITAÇÃO (CRIADO)
      else if (statusPending && !hasApiErrors) {
        updateStepStatus(4, 'PENDENTE');
        pollingTimeoutRef.current = setTimeout(() => consultar(true), 3000);
      }
      // 3. ERRO REAL
      else if (!data.success || statusError || hasApiErrors) {
        const errorMsg = data.data?.erros || data.message || data.errors?.join(', ') || 'Erro desconhecido';
        updateStepStatus(4, 'RECUSADO', errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Não foi possível consultar.';
      setError(errorMessage);
      updateStepStatus(4, 'RECUSADO', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (solicitacaoId && !hasConsultedRef.current) {
      hasConsultedRef.current = true;
      consultar();
    }

    return () => {
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
      hasConsultedRef.current = false;
    };
  }, [solicitacaoId]);

  const handleCorrigir = () => setCurrentStep(2);

  // Lógica de exibição: Mostra loading se estiver carregando OU se o resultado for Pendente
  const isActuallyLoading = loading || (result && isStatusPending(result.data?.status));

  return (
    <div className="space-y-6">
      {/* LOADING STATE: Exibe enquanto carrega ou enquanto o status for "Criado/Pendente" */}
      {isActuallyLoading && (!result || isStatusPending(result.data?.status)) ? (
        <Card className="shadow-lg border-2 border-primary/20">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <div className="text-center space-y-2">
              <p className="text-xl font-bold">Processando solicitação...</p>
              <p className="text-sm text-muted-foreground italic">
                Aguarde, estamos criando o seu Processo Fiscal.
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">ID da solicitação: {solicitacaoId}</p>
            {error && <p className="text-sm text-destructive font-semibold">{error}</p>}
          </CardContent>
        </Card>
      ) : result ? (
        <>
          {/* SUCESSO: Só entra aqui se isStatusSuccess for true */}
          {result.success && isStatusSuccess(result.data.status) ? (
            <div className="space-y-6">
              <Card className="shadow-xl border-2 border-success bg-gradient-to-br from-success/5 to-success/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-success text-2xl">
                    <CheckCircle2 className="w-8 h-8" />
                    Processo Fiscal Criado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-background rounded-xl p-6 shadow-inner border-2 border-success/30">
                    <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">Identificador do Processo Fiscal</p>
                    {loadingProcesso ? (
                      <div className="flex items-center gap-3 py-2">
                        <Loader2 className="w-6 h-6 animate-spin text-success" />
                        <span className="text-lg text-muted-foreground">Gerando ID...</span>
                      </div>
                    ) : (
                      <p className="text-3xl font-bold font-mono text-success">
                        {processoFiscal?.data?.id || 'Gerando ID...'}
                      </p>
                    )}
                  </div>
                  {/* Grid de informações omitido para brevidade, mas mantido igual ao seu original */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background rounded-lg p-4 shadow-sm border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Número do Pedido</p>
                      <p className="text-xl font-mono font-bold">{result.data.numeroPedido}</p>
                    </div>
                    <div className="bg-background rounded-lg p-4 shadow-sm border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Valor Total</p>
                      <p className="text-xl font-bold text-success">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.data.valorTotal)}
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-4 shadow-sm border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Data de Criação</p>
                      <p className="text-base font-semibold">{new Date(result.data.dataCriacao).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-2">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={resetAll} size="lg" className="gap-2 flex-1">
                      <ArrowLeft className="w-4 h-4" /> Nova Solicitação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* ERRO: Só entra aqui se NÃO for sucesso e NÃO for pendente */
            <div className="space-y-6">
              <Card className="shadow-xl border-2 border-destructive bg-gradient-to-br from-destructive/5 to-destructive/10">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-destructive text-2xl flex items-center gap-2">
                      <XCircle className="w-8 h-8" />
                      Erro no Processamento
                    </CardTitle>
                    <Badge variant="destructive">Status: {result.data?.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-background rounded-lg p-4 border text-muted-foreground">
                    Não foi possível criar o Processo Fiscal. <br></br> Revise os detalhes do erro abaixo, corrija as informações e tente novamente.
                  </div>
                  <div className="space-y-4 pt-4 border-t-2 border-destructive/20">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-5 h-5" />
                      <h4 className="font-semibold text-lg">Detalhes do Erro</h4>
                    </div>
                    <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/30 text-destructive text-sm font-mono">
                      {result.errors?.join(', ') || result.data.erros || result.message || 'Erro não especificado pelo servidor.'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleCorrigir} size="lg" className="gap-2 flex-1">
                  <Pencil className="w-4 h-4" /> Corrigir Dados
                </Button>
                <Button onClick={resetAll} variant="outline" size="lg" className="gap-2 flex-1">
                  Voltar ao Início
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
         /* Caso sem resultado (Vazio) */
         <div className="text-center py-20">
            <Button onClick={() => consultar()}>Tentar Consultar Novamente</Button>
         </div>
      )}
    </div>
  );
}