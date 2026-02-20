import { useState, useEffect } from 'react';
import { useFiscal } from '@/contexts/FiscalContext';
import { consultarSolicitacao } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import type { SolicitacaoDetailResponse } from '@/types/fiscal';
import { isStatusSuccess, isStatusError } from '@/types/fiscal';

export function StepSolicitacao() {
  const { solicitacaoId, updateStepStatus, setCurrentStep, xmlData } = useFiscal();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SolicitacaoDetailResponse | null>(null);
  const [error, setError] = useState('');

  const consultar = async () => {
    if (!solicitacaoId) return;
    updateStepStatus(3, 'PENDENTE'); // mantém cinza enquanto consulta
    setLoading(true);
    setError('');
    try {
      const data = await consultarSolicitacao(solicitacaoId);
      setResult(data);
      if (data.success && !isStatusError(data.data?.status)) {
        updateStepStatus(3, 'APROVADO');
      } else {
        const errorMsg = data.data?.erros || data.message || data.errors?.join(', ') || 'Erro desconhecido';
        updateStepStatus(3, 'RECUSADO', errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Não foi possível consultar a solicitação.';
      setError(errorMessage);
      updateStepStatus(3, 'RECUSADO', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (solicitacaoId) {
      consultar();
    }
  }, [solicitacaoId]);

  const isErrorStatus = result && (!result.success || isStatusError(result.data?.status));

  const handleProximo = () => {
    if (result && !isErrorStatus) {
      setCurrentStep(4);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-md border-none">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Consultando resultado da solicitação...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !result) {
    return (
      <Card className="shadow-md border-none">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <p className="text-lg font-semibold text-destructive">Erro ao consultar resultado</p>
          <p className="text-sm text-muted-foreground text-center">{error}</p>
          <Button onClick={consultar} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Card de Resultado da Solicitação */}
      {!isErrorStatus ? (
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
                <p className="text-lg">
                  {new Date(result.data.dataCriacao).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Beneficiário */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-semibold text-sm">Beneficiário</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">CPF/CNPJ</p>
                  <p className="text-sm font-mono">{result.data.beneficiario.cpfBeneficiario || 'N/A'}</p>
                </div>
                {xmlData?.nomeDestinatario && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Nome</p>
                    <p className="text-sm">{xmlData.nomeDestinatario}</p>
                  </div>
                )}
                {xmlData?.municipioDestinatario && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Município</p>
                    <p className="text-sm">{xmlData.municipioDestinatario}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Emissor */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-semibold text-sm">Emissor</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">CPF/CNPJ</p>
                  <p className="text-sm font-mono">{result.data.emissor.cnpjEmissor || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">CNAE</p>
                  <p className="text-sm font-mono">{result.data.emissor.codigoCnaeEmissor || 'N/A'}</p>
                </div>
                {xmlData?.nomeFantasiaEmitente && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Nome Fantasia</p>
                    <p className="text-sm">{xmlData.nomeFantasiaEmitente}</p>
                  </div>
                )}
                {xmlData?.municipioEmitente && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Município</p>
                    <p className="text-sm">{xmlData.municipioEmitente}</p>
                  </div>
                )}
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
                  <p className="text-xs font-semibold text-muted-foreground">Sub-projeto</p>
                  <p className="text-sm font-mono">{result.data.dadosContabeis.subProjeto}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Rúbrica</p>
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
                {result.data.documentosFiscais.map((doc, i) => (
                  <div key={i} className="ml-4 p-3 bg-muted/50 rounded-md space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Tipo</p>
                        <p className="text-sm">{doc.tipoDocumento}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Chave de Acesso</p>
                        <p className="text-sm font-mono break-all">{doc.chaveAcessoNf || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">ID Externo</p>
                        <p className="text-sm font-mono">{doc.idDocumentoFiscalExterno}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Data Emissão</p>
                        <p className="text-sm">
                          {new Date(doc.dataEmissao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md border-none border-l-4 border-l-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive text-lg">
              <XCircle className="w-5 h-5" />
              Erro ao Processar Solicitação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge className="bg-destructive text-destructive-foreground">
              Status: {result.data.status || 'Erro'}
            </Badge>
            <div className="p-3 bg-destructive/10 rounded-md">
              <p className="text-sm text-destructive">{result.data.erros || 'Erro desconhecido'}</p>
            </div>
            <Button onClick={consultar} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-3 justify-between">
        <Button variant="outline">Voltar</Button>
        <Button onClick={handleProximo} disabled={isErrorStatus || !result}>
          Próximo
        </Button>
      </div>
    </div>
  );
}
