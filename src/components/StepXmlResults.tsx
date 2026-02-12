import { useState } from 'react';
import { useFiscal } from '@/contexts/FiscalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { FileText, ArrowRight, Building2, User, DollarSign, Info, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

function DataRow({ label, value }: { label: string; value: string | number | boolean | undefined }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50 last:border-none">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%] break-words">
        {typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : String(value)}
      </span>
    </div>
  );
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function formatDate(val: string) {
  if (!val) return '';
  return new Date(val).toLocaleDateString('pt-BR');
}

export function StepXmlResults() {
  const { xmlData, fileName, setCurrentStep, steps, updateStepStatus, resetAll } = useFiscal();
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  if (!xmlData) return null;

  const isApproved = steps[1].status === 'APROVADO';
  const isRecusado = steps[1].status === 'RECUSADO';

  const handleApprove = () => {
    updateStepStatus(1, 'APROVADO');
    setCurrentStep(2);
  };

  const handleSolicitarCancelamento = () => {
    setShowConfirmCancel(true);
  };

  const handleConfirmarCancelamento = () => {
    setShowConfirmCancel(false);
    resetAll();
  };

  return (
    <div className="space-y-4">
      {/* <Card className="shadow-md border-none">
        <CardContent className="flex items-center gap-3 py-4">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <p className="font-medium">{fileName}</p>
            <p className="text-sm text-muted-foreground">
              {xmlData.tipoNota} • Chave de Acesso: {xmlData.chaveAcesso}
            </p>
          </div>
          {steps[1].status !== 'PENDENTE' && (
            <Badge className={`ml-auto ${
              isApproved ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
            }`}>
              {steps[1].status}
            </Badge>
          )}
        </CardContent>
      </Card> */}

      {isRecusado && steps[1].motivo && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3 px-4">
            <p className="text-sm font-medium text-destructive">Motivo da recusa:</p>
            <p className="text-sm text-destructive/80 mt-1">{steps[1].motivo}</p>
          </CardContent>
        </Card>
      )}


      <Card className={`shadow-md border-none border-l-4 ${
        xmlData.documentoValidado ? 'border-l-success bg-success/5' : 'border-l-destructive bg-destructive/5'
      }`}>
        <CardContent className="flex items-center gap-3 py-4">
          {xmlData.documentoValidado ? (
            <CheckCircle2 className="w-8 h-8 text-success" />
          ) : (
            <XCircle className="w-8 h-8 text-destructive" />
          )}
          <div>
            <p className="font-semibold text-base">
              Validação na SEFAZ
            </p>
            <p className="text-sm text-muted-foreground">
              {xmlData.documentoValidado 
                ? 'Documento validado com sucesso' 
                : 'Documento não válido ou cancelado'}
            </p>
          </div>
          <Badge className={`ml-auto ${
            xmlData.documentoValidado 
              ? 'bg-success text-success-foreground' 
              : 'bg-destructive text-destructive-foreground'
          }`}>
            {xmlData.documentoValidado ? 'Validado' : 'Não Validado'}
          </Badge>
        </CardContent>
      </Card>

      <Card className="shadow-md border-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Dados da Nota Fiscal</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-2">
            <AccordionItem value="emitente" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Emitente
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <DataRow label="CNPJ/CPF" value={xmlData.cnpjCpfEmitente} />
                <DataRow label="Nome" value={xmlData.nomeEmitente} />
                <DataRow label="Nome Fantasia" value={xmlData.nomeFantasiaEmitente} />
                <DataRow label="Inscrição Estadual" value={xmlData.inscricaoEstadualEmitente} />
                <DataRow label="UF" value={xmlData.ufEmitente} />
                <DataRow label="Município" value={xmlData.municipioEmitente} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="destinatario" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Destinatário
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <DataRow label="CNPJ/CPF" value={xmlData.cnpjCpfDestinatario} />
                <DataRow label="Nome" value={xmlData.nomeDestinatario} />
                <DataRow label="Inscrição Estadual" value={xmlData.inscricaoEstadualDestinatario} />
                <DataRow label="UF" value={xmlData.ufDestinatario} />
                <DataRow label="Município" value={xmlData.municipioDestinatario} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="valores" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" /> Valores
                </span>
              </AccordionTrigger>
              <AccordionContent>
               <DataRow label="Valor Total" value={formatCurrency(xmlData.valorTotal)} />
               <DataRow label="Valor Produtos" value={formatCurrency(xmlData.valorProdutos || 0)} />
               <DataRow label="Valor Serviços" value={formatCurrency(xmlData.valorServicos || 0)} />
               
               {/* Ajuste nos caminhos dos tributos conforme a nova estrutura */}
               <DataRow label="Base ICMS" value={formatCurrency(xmlData.tributosEstaduais?.baseCalculoICMS || 0)} />
               <DataRow label="Valor ICMS" value={formatCurrency(xmlData.tributosEstaduais?.valorICMS || 0)} />
               <DataRow label="Valor ICMS ST" value={formatCurrency(xmlData.tributosEstaduais?.valorICMSST || 0)} />
               <DataRow label="Valor IPI" value={formatCurrency(xmlData.tributosFederais?.valorIPI || 0)} />
               <DataRow label="Valor PIS" value={formatCurrency(xmlData.tributosFederais?.valorPIS || 0)} />
               <DataRow label="Valor COFINS" value={formatCurrency(xmlData.tributosFederais?.valorCOFINS || 0)} />
               <DataRow label="Valor ISS" value={formatCurrency(xmlData.tributosMunicipais?.valorISS || 0)} />
               
               <DataRow label="Valor Líquido" value={formatCurrency(xmlData.valorLiquido || 0)} />
             </AccordionContent>
            </AccordionItem>

            <AccordionItem value="geral" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" /> Informações Gerais
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <DataRow label="Número" value={xmlData.numero} />
                <DataRow label="Série" value={xmlData.serie} />
                <DataRow label="Modelo" value={xmlData.modelo} />
                <DataRow label="Data Emissão" value={formatDate(xmlData.dataEmissao)} />
                <DataRow label="Natureza da Operação" value={xmlData.naturezaOperacao} />
                <DataRow label="Tipo Emissão" value={xmlData.tipoEmissao} />
                <DataRow label="Finalidade" value={xmlData.finalidadeEmissao} />
                <DataRow label="Qtd. Itens" value={xmlData.modelo != "99" ? xmlData.quantidadeItens : "Não se aplica"} />
                <DataRow label="Status" value={xmlData.statusDescricao} />
                <DataRow label="Retenção Federal" value={xmlData.retencaoFederal} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {!isApproved && !isRecusado && (
        <div className="flex justify-between gap-3">
          <Button variant="destructive" onClick={handleSolicitarCancelamento}>
            Cancelar Solicitação
          </Button>
          <Button onClick={handleApprove} className="gap-2">
            Aprovar e Continuar <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

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
    </div>
  );
}
