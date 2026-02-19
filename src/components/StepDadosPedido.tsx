import { useState } from 'react';
import { useFiscal } from '@/contexts/FiscalContext';
import { enviarSolicitacao } from '@/services/api';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { SolicitacaoBody, TipoProcessoFiscal, IdentificadorOrigem, TipoDocumentoFiscal } from '@/types/fiscal';
import '@/components/styles/no-spinner.css';

export function StepDadosPedido() {
  const { xmlData, updateStepStatus, setCurrentStep, setSolicitacaoId, resetAll, formData, setFormData } = useFiscal();
  const [loading, setLoading] = useState(false);
  const [showDivergencia, setShowDivergencia] = useState(false);
  const [showEnviado, setShowEnviado] = useState(false);
  const [showErro, setShowErro] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [divergencias, setDivergencias] = useState<string[]>([]);

  const idMocadaPessoa = uuidv4();
  const idMocadaEmissor = uuidv4();
  const idMocadaContaBancaria = uuidv4();
  const numeroPedidoMocado = Math.floor(Math.random() * 1000000);

  const [form, setForm] = useState({
    origem: (formData?.origem || 1) as IdentificadorOrigem,
    tipoProcesso: (formData?.tipoProcesso || 0) as TipoProcessoFiscal,
    valorTotal: formData?.valorTotal || xmlData?.valorTotal || 0,
    codigoPessoa: formData?.codigoPessoa || idMocadaPessoa,
    idContaBancaria: formData?.idContaBancaria || idMocadaContaBancaria,
    cpfBeneficiario: formData?.cpfBeneficiario || xmlData?.cnpjCpfDestinatario || '',
    codigoEmissor: formData?.codigoEmissor || idMocadaEmissor,
    cnpjEmissor: formData?.cnpjEmissor || xmlData?.cnpjCpfEmitente || '',
    codigoCnaeEmissor: formData?.codigoCnaeEmissor || '',
    codigoProjeto: formData?.codigoProjeto || '',
    subProjeto: formData?.subProjeto || 0,
    rubrica: formData?.rubrica || '',
    contaRazao: formData?.contaRazao || '',
    centroDeCusto: formData?.centroDeCusto || '',
    numeroPedido: formData?.numeroPedido || numeroPedidoMocado,
    justificativa: formData?.justificativa || '',
  });

  const update = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const checkDivergencias = (): string[] => {
    const divs: string[] = [];
    if (xmlData) {
      if (form.valorTotal !== xmlData.valorTotal) {
        divs.push(`Valor Total divergente: Formulário R$ ${form.valorTotal} ≠ XML R$ ${xmlData.valorTotal}`);
      }
      if (form.cnpjEmissor && form.cnpjEmissor !== xmlData.cnpjCpfEmitente) {
        divs.push(`CNPJ Emissor divergente: ${form.cnpjEmissor} ≠ ${xmlData.cnpjCpfEmitente}`);
      }
    }
    return divs;
  };

  const handleValidar = () => {
    const divs = checkDivergencias();
    if (divs.length > 0) {
      setDivergencias(divs);
      setShowDivergencia(true);
    } else {
      submitSolicitacao();
    }
  };

  const submitSolicitacao = async () => {
    setShowDivergencia(false);
    setShowEnviado(true);
    setLoading(true);

    try {
      const body: SolicitacaoBody = {
        ...form,
        documentosFiscais: [{
          tipoDocumento: 0 as TipoDocumentoFiscal,
          idDocumentoFiscalExterno: xmlData?.id || '',
          chaveAcessoNf: xmlData?.chaveAcesso || '',
          dataEmissao: xmlData?.dataEmissao || '',
        }],
      };

      // Salva os dados do formulário no contexto antes de enviar
      setFormData(body);

      const response = await enviarSolicitacao(body);

      setShowEnviado(false);

      if (response.success) {
        setSolicitacaoId(response.data.id);
        updateStepStatus(2, 'APROVADO');
        updateStepStatus(3, 'PENDENTE');
        setCurrentStep(3);
      } else {
        setErros(response.errors || [response.message]);
        updateStepStatus(2, 'RECUSADO', response.errors?.join(', ') || response.message);
        setShowErro(true);
      }
    } catch (err) {
      setShowEnviado(false);
      const errorMessage = err instanceof Error ? err.message : 'Erro de conexão com o servidor';
      setErros([errorMessage]);
      setShowErro(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarRevisao = () => {
    setShowDivergencia(false);
    setShowEnviado(true);
    setTimeout(() => {
      setShowEnviado(false);
    }, 2000);
  };

  const handleSolicitarCancelamento = () => {
    setShowConfirmCancel(true);
  };

  const handleConfirmarCancelamento = () => {
    setShowConfirmCancel(false);
    resetAll();
  };

  return (
    <>
      <Card className="shadow-md border-none">
        <CardHeader>
          <CardTitle className="text-lg">Dados do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Beneficiário */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Beneficiário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cpfBeneficiario">CPF/CNPJ Beneficiário</Label>
                <Input id="cpfBeneficiario" value={form.cpfBeneficiario} onChange={e => update('cpfBeneficiario', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Emissor */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Emissor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cnpjEmissor">CNPJ Emissor</Label>
                <Input id="cnpjEmissor" value={form.cnpjEmissor} onChange={e => update('cnpjEmissor', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="codigoCnaeEmissor">Código CNAE</Label>
                <Input id="codigoCnaeEmissor" value={form.codigoCnaeEmissor} onChange={e => update('codigoCnaeEmissor', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Dados Contábeis */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dados Contábeis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="codigoProjeto">Código Projeto</Label>
                <Input id="codigoProjeto" value={form.codigoProjeto} onChange={e => update('codigoProjeto', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subProjeto">Sub Projeto</Label>
                <Input className="no-spinner" id="subProjeto" type="number" value={form.subProjeto} onChange={e => update('subProjeto', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rubrica">Rubrica</Label>
                <Input id="rubrica" value={form.rubrica} onChange={e => update('rubrica', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contaRazao">Conta Razão</Label>
                <Input id="contaRazao" value={form.contaRazao} onChange={e => update('contaRazao', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="centroDeCusto">Centro de Custo</Label>
                <Input id="centroDeCusto" value={form.centroDeCusto} onChange={e => update('centroDeCusto', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Pedido */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pedido</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="valorTotal">Valor Total</Label>
                <Input className="no-spinner" id="valorTotal" type="number" step="0.01" value={form.valorTotal} onChange={e => update('valorTotal', Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="justificativa">Justificativa</Label>
              <Textarea id="justificativa" rows={3} value={form.justificativa} onChange={e => update('justificativa', e.target.value)} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button variant="destructive" onClick={handleSolicitarCancelamento}>Cancelar Solicitação</Button>
          <Button onClick={handleValidar} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Validar Pedido
          </Button>
        </CardFooter>
      </Card>

      {/* Modal Divergências */}
      <Dialog open={showDivergencia} onOpenChange={setShowDivergencia}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Divergências Encontradas
            </DialogTitle>
            <DialogDescription>
              Foram encontradas divergências entre os dados preenchidos e o XML.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 my-4">
            {divergencias.map((d, i) => (
              <li key={i} className="text-sm bg-warning/10 text-warning rounded-lg p-3">
                {d}
              </li>
            ))}
          </ul>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDivergencia(false)}>
              Corrigir
            </Button>
            <Button onClick={handleSolicitarRevisao}>
              Solicitar Revisão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Enviado */}
      <Dialog open={showEnviado} onOpenChange={() => {}}>
        <DialogContent className="text-center sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg font-medium">Enviando Solicitação</p>
            <p className="text-sm text-muted-foreground">Aguardando processamento...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Sucesso */}
      <Dialog open={showErro} onOpenChange={setShowErro}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Erro na Validação
            </DialogTitle>
          </DialogHeader>
          <ul className="space-y-2 my-4">
            {erros.map((e, i) => (
              <li key={i} className="text-sm bg-destructive/10 text-destructive rounded-lg p-3">{e}</li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowErro(false)}>
              Voltar aos dados do Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Cancelamento */}
      <Dialog open={showConfirmCancel} onOpenChange={setShowConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Cancelar Solicitação
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar a solicitação? Todos os dados preenchidos serão perdidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmCancel(false)}>
              Não, Continuar
            </Button>
            <Button variant="destructive" onClick={handleConfirmarCancelamento}>
              Sim, Cancelar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
