import { useState, useEffect, useRef, useCallback } from 'react';
import { useFiscal } from '@/contexts/FiscalContext';
import { consultarSolicitacao } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';
import type { SolicitacaoDetailResponse } from '@/types/fiscal';
import { isStatusSuccess, isStatusError } from '@/types/fiscal';

export function StepResultado() {
  const { solicitacaoId, updateStepStatus, resetAll } = useFiscal();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolicitacaoDetailResponse | null>(null);
  const [error, setError] = useState('');
  const pollAttempts = useRef(0);
  const pollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPoll = () => {
    if (pollTimeout.current) {
      clearTimeout(pollTimeout.current);
      pollTimeout.current = null;
    }
  };

  const consultar = useCallback(async (isPolling = false) => {
    if (!solicitacaoId) return;
    
    // Reseta tentativas quando é chamada manualmente (não é polling)
    if (!isPolling) {
      pollAttempts.current = 0;
    }
    
    setLoading(true);
    setError('');
    try {
      const data = await consultarSolicitacao(solicitacaoId);
      setResult(data);
      const statusSuccess = isStatusSuccess(data.data.status);
      const statusError = isStatusError(data.data?.status);
      const hasApiErrors = Boolean(data.data?.erros || data.errors?.length);
      const errorMsg = data.data?.erros || data.message || data.errors?.join(', ') || 'Erro desconhecido';

      // Se sucesso final (validado ou concluído), marca como aprovado
      if (data.success && statusSuccess && !hasApiErrors) {
        updateStepStatus(4, 'APROVADO');
        clearPoll();
      } 
      // Se erro explícito ou falha na API, marca como recusado
      else if (!data.success || statusError || hasApiErrors) {
        updateStepStatus(4, 'RECUSADO', errorMsg);
        clearPoll();
      } 
      // Se ainda está processando (ex: status "Criado"), continua polling
      else {
        if (pollAttempts.current < 6) {
          clearPoll();
          pollTimeout.current = setTimeout(() => {
            pollAttempts.current += 1;
            consultar(true);
          }, 3000);
        } else {
          // Após 6 tentativas sem resultado final, mantém pendente
          updateStepStatus(4, 'PENDENTE');
          clearPoll();
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Não foi possível consultar a solicitação.';
      setError(errorMessage);
      updateStepStatus(4, 'RECUSADO', errorMessage);
      clearPoll();
    } finally {
      setLoading(false);
    }
  }, [solicitacaoId, updateStepStatus]);

  useEffect(() => {
    if (solicitacaoId) {
      consultar();
    } else {
      // Quando resetAll é chamado, limpa o estado local
      setResult(null);
      setError('');
      clearPoll();
    }
    return () => clearPoll();
  }, [consultar, solicitacaoId]);

  const isError = result && (!result.success || isStatusError(result.data?.status) || Boolean(result.data?.erros || result.errors?.length));

  return (
    <div className="space-y-4">
      {loading && !result ? (
        <Card className="shadow-md border-none">
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg font-semibold">Consultando resultado da solicitação...</p>
            <p className="text-sm text-muted-foreground">ID da solicitação: {solicitacaoId}</p>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      ) : result ? (
        <>
          {/* Card de Resultado da Solicitação */}
          {result.success && isStatusSuccess(result.data.status) ? (
            <Card className="shadow-md border-none border-l-4 border-l-success">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success text-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  Solicitação Processada com Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge className="bg-success text-success-foreground">
                    Status: {result.data.status || 'Desconhecido'}
                  </Badge>
                </div>

                {/* Informações Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-muted-foreground">ID da Solicitação</p>
                    <p className="text-lg font-mono">{result.data.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-muted-foreground">Número do Pedido</p>
                    <p className="text-lg font-mono">{result.data.numeroPedido}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-muted-foreground">Valor Total</p>
                    <p className="text-lg font-semibold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.data.valorTotal)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-muted-foreground">Data de Criação</p>
                    <p className="text-lg">{new Date(result.data.dataCriacao).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {/* Beneficiário */}
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-semibold text-sm">Beneficiário</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Código Pessoa</p>
                      <p className="text-sm font-mono">{result.data.beneficiario.codigoPessoa}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">ID Conta Bancária</p>
                      <p className="text-sm font-mono">{result.data.beneficiario.idContaBancaria}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">CPF</p>
                      <p className="text-sm font-mono">{result.data.beneficiario.cpfBeneficiario || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Emissor */}
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-semibold text-sm">Emissor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Código Emissor</p>
                      <p className="text-sm font-mono">{result.data.emissor.codigoEmissor}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">CNPJ</p>
                      <p className="text-sm font-mono">{result.data.emissor.cnpjEmissor || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">CNAE</p>
                      <p className="text-sm font-mono">{result.data.emissor.codigoCnaeEmissor || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Dados Contábeis */}
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-semibold text-sm">Dados Contábeis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Código Projeto</p>
                      <p className="text-sm font-mono">{result.data.dadosContabeis.codigoProjeto || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Sub Projeto</p>
                      <p className="text-sm font-mono">{result.data.dadosContabeis.subProjeto}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Rubrica</p>
                      <p className="text-sm font-mono">{result.data.dadosContabeis.rubrica || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Conta Razão</p>
                      <p className="text-sm font-mono">{result.data.dadosContabeis.contaRazao || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Centro de Custo</p>
                      <p className="text-sm font-mono">{result.data.dadosContabeis.centroDeCusto || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Documentos Fiscais */}
                {result.data.documentosFiscais && result.data.documentosFiscais.length > 0 && (
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="font-semibold text-sm">Documentos Fiscais</h4>
                    <div className="space-y-2 ml-4">
                      {result.data.documentosFiscais.map((doc, i) => (
                        <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground">Documento #{i + 1}</p>
                          <p className="text-sm"><span className="font-semibold">Tipo:</span> {doc.tipoDocumento}</p>
                          <p className="text-sm font-mono break-all"><span className="font-semibold">ID:</span> {doc.idDocumentoFiscalExterno}</p>
                          <p className="text-sm font-mono"><span className="font-semibold">Chave:</span> {doc.chaveAcessoNf || 'N/A'}</p>
                          <p className="text-sm"><span className="font-semibold">Data:</span> {new Date(doc.dataEmissao).toLocaleDateString('pt-BR')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={() => consultar()} variant="outline" className="gap-2 flex-1" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Atualizar
                  </Button>
                  <Button onClick={resetAll} className="gap-2 flex-1">
                    <ArrowLeft className="w-4 h-4" />
                    Nova Solicitação
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md border-none border-l-4 border-l-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive text-lg">
                  <XCircle className="w-5 h-5" />
                  Erro no Processo Fiscal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge className="bg-destructive text-destructive-foreground">
                    Status: {result.data?.status || 'Erro'}
                  </Badge>
                </div>

                {/* ID da Solicitação */}
                {result.data?.id && (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-muted-foreground">ID da Solicitação</p>
                    <p className="text-lg font-mono">{result.data.id}</p>
                  </div>
                )}

                {/* Mensagem de Erro - Prioridade 1: erros array */}
                {result.errors && result.errors.length > 0 && (
                  <div className="bg-destructive/10 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Erros Encontrados
                    </p>
                    <ul className="space-y-2">
                      {result.errors.map((err, i) => (
                        <li key={i} className="text-sm text-destructive flex gap-2">
                          <span className="text-destructive mt-0.5">•</span>
                          <span>{err}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mensagem de Erro - Prioridade 2: data.erros */}
                {result.data.erros && !result.errors?.length && (
                  <div className="bg-destructive/10 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Detalhes do Erro
                    </p>
                    <p className="text-sm text-destructive whitespace-pre-wrap">{result.data.erros}</p>
                  </div>
                )}

                {/* Mensagem de Erro - Prioridade 3: message */}
                {result.message && !result.errors?.length && !result.data.erros && (
                  <div className="bg-destructive/10 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Mensagem da API
                    </p>
                    <p className="text-sm text-destructive">{result.message}</p>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={() => consultar()} variant="outline" className="gap-2 flex-1" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Atualizar
                  </Button>
                  <Button onClick={resetAll} className="gap-2 flex-1">
                    <ArrowLeft className="w-4 h-4" />
                    Nova Solicitação
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="shadow-md border-none">
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <AlertCircle className="w-12 h-12 text-muted-foreground" />
            <p className="text-lg font-semibold">Nenhum resultado disponível</p>
            <p className="text-sm text-muted-foreground">ID da solicitação: {solicitacaoId}</p>
            <Button onClick={() => consultar()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Tentar Consultar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
