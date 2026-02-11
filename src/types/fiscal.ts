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
  id: string; // format: uuid
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
export interface SolicitacaoBody {
  origem: string;
  tipoProcesso: string;
  valorTotal: number;
  codigoPessoa: string;
  idContaBancaria: string;
  cpfBeneficiario: string;
  codigoEmissor: string;
  cnpjEmissor: string;
  codigoCnaeEmissor: string;
  codigoProjeto: string;
  subProjeto: number;
  rubrica: string;
  contaRazao: string;
  centroDeCusto: string;
  numeroPedido: number;
  justificativa: string;
  documentosFiscais: DocumentoFiscal[];
}

export interface DocumentoFiscal {
  tipoDocumento: string;
  idDocumentoFiscalExterno: string;
  chaveAcessoNf: string;
  dataEmissao: string;
}

export interface SolicitacaoResponse {
  success: boolean;
  data: {
    id: number;
    tipoProcesso: string;
    origem: string;
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
    justificativa: string;
    erros: string;
    beneficiario: {
      codigoPessoa: string;
      idContaBancaria: string;
      cpfBeneficiario: string;
    };
    emissor: {
      codigoEmissor: string;
      cnpjEmissor: string;
      codigoCnaeEmissor: string;
    };
    dadosContabeis: {
      codigoProjeto: string;
      subProjeto: number;
      rubrica: string;
      contaRazao: string;
      centroDeCusto: string;
    };
    documentosFiscais: {
      id: number;
      tipoDocumento: string;
      idDocumentoFiscalExterno: string;
      chaveAcessoNf: string;
      dataEmissao: string;
    }[];
  };
  message: string;
  errors: string[];
  timestamp: string;
}

export type StepStatus = 'PENDENTE' | 'APROVADO' | 'RECUSADO';

export interface StepInfo {
  label: string;
  status: StepStatus;
  motivo?: string;
}
