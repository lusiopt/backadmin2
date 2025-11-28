import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseAttachment } from '@/lib/adapters/apiAdapter';

const LUSIO_API_URL = 'https://api.lusio.staging.goldenclouddev.com.br';
const LUSIO_CREDENTIALS = {
  email: 'admin@luzio.com',
  password: 'admin123',
};

/**
 * Obtém token da API Lusio (do cookie ou gera novo)
 */
async function getLusioToken(): Promise<string | null> {
  // Tentar pegar do cookie primeiro
  const cookieStore = await cookies();
  const existingToken = cookieStore.get('lusio_operator_token')?.value;

  if (existingToken) {
    return existingToken;
  }

  // Se não tem cookie, gerar novo token
  try {
    const response = await fetch(`${LUSIO_API_URL}/operator/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(LUSIO_CREDENTIALS),
    });

    if (!response.ok) {
      console.error('Erro ao autenticar na API Lusio:', response.status);
      return null;
    }

    const data = await response.json();
    return data.token || null;
  } catch (error) {
    console.error('Erro ao conectar com API Lusio:', error);
    return null;
  }
}

/**
 * GET /api/documents/[serviceId]/[docId]
 *
 * Busca URL fresca do documento na API Lusio e redireciona
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; docId: string }> }
) {
  try {
    const { serviceId, docId } = await params;

    if (!serviceId || !docId) {
      return NextResponse.json(
        { error: 'serviceId e docId são obrigatórios' },
        { status: 400 }
      );
    }

    // Obter token da API Lusio
    const token = await getLusioToken();
    if (!token) {
      return NextResponse.json(
        { error: 'Não foi possível autenticar na API Lusio' },
        { status: 401 }
      );
    }

    // Buscar detalhes do serviço (com URLs frescas)
    const response = await fetch(`${LUSIO_API_URL}/operator/services/${serviceId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Erro ao buscar serviço:', response.status);
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      );
    }

    const data = await response.json();
    const service = data.service || data;

    // Encontrar o documento pelo ID
    const documents = service.documents || [];
    const document = documents.find((doc: any) => doc.id === docId);

    if (!document) {
      return NextResponse.json(
        { error: 'Documento não encontrado' },
        { status: 404 }
      );
    }

    // Extrair URL do attachment (formato: "filename(url)")
    const { url } = parseAttachment(document.attachment);

    if (!url) {
      return NextResponse.json(
        { error: 'URL do documento não disponível' },
        { status: 404 }
      );
    }

    // Redirecionar para a URL fresca
    return NextResponse.redirect(url, 302);
  } catch (error) {
    console.error('Erro no proxy de documento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
