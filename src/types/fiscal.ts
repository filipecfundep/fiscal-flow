import { UUID } from "crypto";

//    ###   DTOs API GESTAO DOCUMENTO FISCAL  ### 
export interface XmlProcessResponse {
  success: boolean;
  data: XmlData;
  message: string;
  errors: string[];
  timestamp: string;
}

export interface TributosFederais {
  valorIPI: number;
  valorPIS: number;
  valorCOFINS: number;
  valorINSS: number;
  valorIR: number;
  valorCSLL: number;
  total: number;
  totalRetencoes: number;
}

export interface TributosEstaduais {
  valorICMS: number;
  baseCalculoICMS: number | null;
  baseCalculoICMSST: number | null;
  valorICMSST: number;
  total: number;
}

export interface TributosMunicipais {
  valorISS: number;
  total: number;
}

export interface XmlData {
  id: UUID; // format: uuid
  nomeArquivo: string | null;
  hash: string | null;
  tipoNota: string; // Ref: TipoNotaFiscal enum
  chaveAcesso: string | null;
  numero: number;
  serie: number;
  modelo: string | null;
  dataEmissao: string; // format: date-time
  cnpjCpfEmitente: string | null;
  nomeEmitente: string | null;
  nomeFantasiaEmitente: string | null;
  inscricaoEstadualEmitente: string | null;
  ufEmitente: string | null;
  municipioEmitente: string | null;
  cnpjCpfDestinatario: string | null;
  nomeDestinatario: string | null;
  inscricaoEstadualDestinatario: string | null;
  ufDestinatario: string | null;
  municipioDestinatario: string | null;
  valorTotal: number;
  valorProdutos: number | null;
  valorServicos: number | null;
  
  // Agrupamentos de tributos conforme o Swagger
  tributosFederais: TributosFederais;
  tributosEstaduais: TributosEstaduais;
  tributosMunicipais: TributosMunicipais;

  status: string; // Ref: StatusNota enum
  statusDescricao: string | null;
  tipoEmissao: string; // Ref: TipoEmissao enum
  quantidadeItens: number;
  informacoesFisco: string | null;
  finalidadeEmissao: string | null;
  tipoOperacao: string | null;
  naturezaOperacao: string | null;
  dataCompetencia: string | null;
  itemListaServicos: string | null;
  codigoCNAE: string | null;
  discriminacaoServico: string | null;
  codigoServicoMunicipio: string | null;
  municipioIncidencia: string | null;
  
  // Propriedades adicionais do schema original
  codigoNBS?: string | null;
  descricaoNBS?: string | null;
  descricaoTributacaoNacional?: string | null;
  descricaoTributacaoMunicipal?: string | null;
  opcaoSimplesNacional?: string | null;
  regimeApuracaoSimplesNacional?: string | null;
  
  valorDeducoes: number | null;
  aliquotaISS: number | null;
  valorLiquido: number | null;
  retencaoFederal: boolean | null;
  documentoValidado: boolean;
}

// ###   DTOs API FISCAL   ###

export type IdentificadorOrigem = 1 | 2 | 3 | 4 | 5; // Pedidos | Compras | Pessoal | Importacao | Contratos
export const IdentificadorOrigemMap: Record<IdentificadorOrigem, string> = {
  1: 'Pedidos',
  2: 'Compras',
  3: 'Pessoal',
  4: 'Importacao',
  5: 'Contratos'
};

export type TipoProcessoFiscal = 0 | 1 | 2 | 3; // PagamentoNotaFiscal | Reembolso | AcertoAdiantamento | Diarias
export const TipoProcessoFiscalMap: Record<TipoProcessoFiscal, string> = {
  0: 'PagamentoNotaFiscal',
  1: 'Reembolso',
  2: 'AcertoAdiantamento',
  3: 'Diarias'
};

export type TipoDocumentoFiscal = 0 | 1 | 2 | 3 | 4; // NotaFiscal | NotaFiscalServico | NotaFiscalEletronica | CupomFiscal | Recibo
export const TipoDocumentoFiscalMap: Record<TipoDocumentoFiscal, string> = {
  0: 'NotaFiscal',
  1: 'NotaFiscalServico',
  2: 'NotaFiscalEletronica',
  3: 'CupomFiscal',
  4: 'Recibo'
};

export type StatusSolicitacaoProcessoFiscal = 0 | 1 | 2 | 3; // Criado | Validado | Erro | Concluido
export const StatusSolicitacaoProcessoFiscalMap: Record<StatusSolicitacaoProcessoFiscal, string> = {
  0: 'Criado',
  1: 'Validado',
  2: 'Erro',
  3: 'Concluido'
};

// Reverse mapping - para converter string em número
export function stringToStatusNumber(status: string): StatusSolicitacaoProcessoFiscal {
  const statusMap: Record<string, StatusSolicitacaoProcessoFiscal> = {
    'Criado': 0,
    'Validado': 1,
    'Erro': 2,
    'Concluido': 3
  };
  return statusMap[status] || 0;
}

// Helper function para determinar se o status é sucesso
export function isStatusSuccess(status: StatusSolicitacaoProcessoFiscal | string): boolean {
  const numStatus = typeof status === 'string' ? stringToStatusNumber(status) : status;
  return numStatus === 1 || numStatus === 3; // Validado (1) ou Concluido (3)
}

export function isStatusPending(status: StatusSolicitacaoProcessoFiscal | string): boolean {
  const numStatus = typeof status === 'string' ? stringToStatusNumber(status) : status;
  return numStatus === 0; // Criado (0)
}

// Helper function para determinar se o status é erro
export function isStatusError(status: StatusSolicitacaoProcessoFiscal | string): boolean {
  const numStatus = typeof status === 'string' ? stringToStatusNumber(status) : status;
  return numStatus === 2; // Erro (2)
}

export interface SolicitacaoBody {
  origem: IdentificadorOrigem;
  tipoProcesso: TipoProcessoFiscal;
  valorTotal: number;
  codigoPessoa: string;
  idContaBancaria: string;
  cpfBeneficiario: string | null;
  codigoEmissor: string;
  cnpjEmissor: string | null;
  codigoCnaeEmissor: string | null;
  codigoProjeto: string | null;
  subProjeto: number;
  rubrica: string | null;
  contaRazao: string | null;
  centroDeCusto: string | null;
  numeroPedido: number | string;
  justificativa: string | null;
  documentosFiscais: DocumentoFiscal[];
}

export interface DocumentoFiscal {
  tipoDocumento: TipoDocumentoFiscal;
  idDocumentoFiscalExterno: string;
  chaveAcessoNf: string | null;
  dataEmissao: string;
}

export interface SolicitacaoResponse {
  success: boolean;
  data: {
    id: number;
    tipoProcesso: TipoProcessoFiscal;
    origem: IdentificadorOrigem;
    valorTotal: number;
    numeroPedido: number;
  };
  message: string;
  errors: string[];
  timestamp: string;
}

export interface SolicitacaoDetailResponse {
  success: boolean;
  data: {
    id: number;
    origem: string;
    tipoProcesso: string;
    status: string;
    dataCriacao: string;
    valorTotal: number;
    numeroPedido: number;
    justificativa: string | null;
    erros: string | null;
    beneficiario: {
      codigoPessoa: string;
      idContaBancaria: string;
      cpfBeneficiario: string | null;
    };
    emissor: {
      codigoEmissor: string;
      cnpjEmissor: string | null;
      codigoCnaeEmissor: string | null;
    };
    dadosContabeis: {
      codigoProjeto: string | null;
      subProjeto: number;
      rubrica: string | null;
      contaRazao: string | null;
      centroDeCusto: string | null;
    };
    documentosFiscais: {
      id: number;
      tipoDocumento: string;
      idDocumentoFiscalExterno: string;
      chaveAcessoNf: string | null;
      dataEmissao: string;
    }[];
  };
  message: string;
  errors: string[];
  timestamp: string;
}

// DTOs para ConsultarProcessoFiscalResponse
export interface ProcessoBeneficiarioDto {
  codigoPessoa: string;
  idContaBancaria: string;
  cpfBeneficiario: string | null;
}

export interface ProcessoDadosContabeisDto {
  codigoProjeto: string | null;
  subProjeto: number;
  rubrica: string | null;
  contaRazao: string | null;
  centroDeCusto: string | null;
}

export interface ProcessoDocumentoFiscalDto {
  id: number;
  tipoDocumento: TipoDocumentoFiscal;
  idDocumentoFiscalExterno: string;
  chaveAcessoNf: string | null;
  dataEmissao: string;
}

export interface ProcessoLancamentoFiscalDto {
  id: number;
  tipo: string;
  descricao: string | null;
  valor: number;
  dataLancamento: string;
}

export interface ProcessoFiscalData {
  id: number;
  tipoProcesso: TipoProcessoFiscal;
  origem: IdentificadorOrigem;
  dataCriacao: string;
  numeroPedido: number;
  justificativa: string | null;
  valorTotal: number;
  beneficiario: ProcessoBeneficiarioDto;
  dadosContabeis: ProcessoDadosContabeisDto;
  documentosFiscais: ProcessoDocumentoFiscalDto[] | null;
  lancamentos: ProcessoLancamentoFiscalDto[] | null;
}

export interface ConsultarProcessoFiscalResponse {
  success: boolean;
  data: ProcessoFiscalData;
  timestamp: string;
}

export type StepStatus = 'PENDENTE' | 'APROVADO' | 'RECUSADO';

export interface StepInfo {
  label: string;
  status: StepStatus;
  motivo?: string;
}
