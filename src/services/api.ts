import type { XmlProcessResponse, SolicitacaoBody, SolicitacaoResponse, SolicitacaoDetailResponse, ConsultarProcessoFiscalResponse } from '@/types/fiscal';

const API_FISCAL = "http://localhost:5100/api"
const API_DOCS_FISCAIS = "http://localhost:5001/api"

export async function processarXml(file: File): Promise<XmlProcessResponse> {
  const formData = new FormData();
  formData.append('arquivo', file);

  const response = await fetch(`${API_DOCS_FISCAIS}/NotasFiscais/processar-xml`, {
    method: 'POST',
    headers: { 'Accept': 'application/json; charset=utf-8' },
    body: formData,
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      const errorMessage = errorData?.message || errorData?.error || errorData?.errors?.[0] || response.statusText;
      throw new Error(errorMessage);
    } catch (e) {
      if (e instanceof Error && e.message !== response.statusText) {
        throw e;
      }
      throw new Error(`Erro ao processar XML: ${response.statusText}`);
    }
  }

  return response.json();
}

export async function enviarSolicitacao(body: SolicitacaoBody): Promise<SolicitacaoResponse> {
  const response = await fetch(`${API_FISCAL}/SolicitacaoProcessoFiscal`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      const errorMessage = errorData?.message || errorData?.error || errorData?.errors?.[0] || response.statusText;
      throw new Error(errorMessage);
    } catch (e) {
      if (e instanceof Error && e.message !== response.statusText) {
        throw e;
      }
      throw new Error(`Erro ao enviar solicitação: ${response.statusText}`);
    }
  }

  return response.json();
}

export async function consultarSolicitacao(id: number): Promise<SolicitacaoDetailResponse> {
  const response = await fetch(`${API_FISCAL}/SolicitacaoProcessoFiscal/${id}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json; charset=utf-8' },
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      const errorMessage = errorData?.message || errorData?.error || errorData?.errors?.[0] || response.statusText;
      throw new Error(errorMessage);
    } catch (e) {
      if (e instanceof Error && e.message !== response.statusText) {
        throw e;
      }
      throw new Error(`Erro ao consultar solicitação: ${response.statusText}`);
    }
  }

  return response.json();
}

export async function consultarProcessoFiscal(id: number): Promise<ConsultarProcessoFiscalResponse> {
  const response = await fetch(`${API_FISCAL}/ProcessoFiscal/solicitacao/${id}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json; charset=utf-8' },
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      const errorMessage = errorData?.message || errorData?.error || errorData?.errors?.[0] || response.statusText;
      throw new Error(errorMessage);
    } catch (e) {
      if (e instanceof Error && e.message !== response.statusText) {
        throw e;
      }
      throw new Error(`Erro ao consultar processo fiscal: ${response.statusText}`);
    }
  }

  return response.json();
}
