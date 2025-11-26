/**
 * API Adapter - Luzio API → Backadmin
 *
 * Adapta os dados retornados pela API real (luzio-api) para o formato
 * esperado pelo backadmin (baseado no schema Prisma local).
 *
 * Criado em: 04 Novembro 2025
 * Baseado em: Análise completa da API staging
 */

import { Service, Document, DocumentAttorney, User, Person, Address, Problem } from '@/lib/types';

// =====================================================
// TYPES DA API
// =====================================================

export interface ApiDocument {
  id: string;
  title: string | null;
  number: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  issuedBy: string | null;
  attachment: string | null; // URL pública assinada (Google Cloud Storage)
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiService {
  id: string;
  assignedAt: string | null;
  isPaidTax: boolean;
  processNumber: string | null;
  processPassword: string | null;
  entity: string | null;
  reference: string | null;
  paidTaxAt: string | null;
  isPaidGovernment: boolean;
  paidGovernmentAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  personId: string;
  userId: string;
  paymentReferenceId: string | null;
  documentPromotion: boolean | null;
  hasResidenceTitle: boolean | null;
  hasBirthCertificate: boolean | null;
  hasCriminalRecord: boolean | null;
  hasIdentificationDocument: boolean | null;
  hasBrasilianCriminalRecord: boolean | null;
  refuseJustification: string | null;
  almostJustification: string | null;
  sendSolicitationDate: string | null;
  submissionDate: string | null;
  user: any;
  person: any;
  address: any;
  documents: ApiDocument[];
  documentsAttorney: any[];
  problems: any[];
  _count: {
    documents: number;
    documentsAttorney: number;
    problems: number;
  };
}

export interface ApiServiceListResponse {
  services: ApiService[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiServiceDetailResponse {
  service: ApiService;
  summary: {
    totalDocuments: number;
    totalAttorneyDocuments: number;
    totalProblems: number;
    approvedDocuments: number;
    pendingDocuments: number;
  };
}

// =====================================================
// ADAPTERS
// =====================================================

/**
 * Adapta documento da API para formato local
 *
 * Diferenças principais:
 * - API: 'title' → Local: 'name'
 * - API: 'attachment' (signed URL) → Local: 'url'
 * - API: 'createdAt' → Local: 'uploadedAt'
 */
export function adaptDocument(apiDoc: ApiDocument, serviceId?: string): Document {
  return {
    id: apiDoc.id,
    name: apiDoc.title || 'Documento sem título', // API usa 'title'
    url: apiDoc.attachment || '', // Signed URL pública (expira em 1h)
    title: apiDoc.title,
    number: apiDoc.number,
    type: undefined, // NÃO existe na API
    size: undefined, // NÃO existe na API
    issuedAt: apiDoc.issuedAt,
    expiresAt: apiDoc.expiresAt,
    issuedBy: apiDoc.issuedBy,
    approved: apiDoc.approved,
    uploadedAt: apiDoc.createdAt, // Usar createdAt como uploadedAt
    serviceId: serviceId || '', // Será preenchido pelo parent
    updatedAt: apiDoc.updatedAt,
    deletedAt: undefined, // NÃO existe na API
  };
}

/**
 * Adapta documento do advogado da API para formato local
 */
export function adaptDocumentAttorney(apiDoc: any, serviceId?: string): DocumentAttorney {
  return {
    id: apiDoc.id,
    name: apiDoc.title || apiDoc.name || 'Documento',
    url: apiDoc.attachment || apiDoc.url || '',
    size: apiDoc.size,
    uploadedAt: apiDoc.createdAt,
    serviceId: serviceId || '',
    createdAt: apiDoc.createdAt,
    updatedAt: apiDoc.updatedAt,
  };
}

/**
 * Adapta User da API para formato local
 *
 * User já está 100% compatível, sem necessidade de transformação
 */
export function adaptUser(apiUser: any): User {
  return {
    id: apiUser.id,
    fullName: apiUser.fullName,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    email: apiUser.email,
    phone: apiUser.phone,
    areaCode: apiUser.areaCode,
    active: apiUser.active,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
    // Campos que não existem na API
    password: undefined,
    address: undefined,
    city: undefined,
    state: undefined,
    country: undefined,
    postalCode: undefined,
    role: undefined,
    deletedAt: undefined,
  };
}

/**
 * Adapta Person da API para formato local
 *
 * Person já está 100% compatível
 */
export function adaptPerson(apiPerson: any): Person {
  return {
    id: apiPerson.id,
    firstName: apiPerson.firstName,
    lastName: apiPerson.lastName,
    alternativeNames: apiPerson.alternativeNames,
    profession: apiPerson.profession,
    fatherFullName: apiPerson.fatherFullName,
    fatherAlternativeNames: apiPerson.fatherAlternativeNames,
    fatherBirthPlace: apiPerson.fatherBirthPlace,
    motherFullName: apiPerson.motherFullName,
    motherAlternativeNames: apiPerson.motherAlternativeNames,
    motherBirthPlace: apiPerson.motherBirthPlace,
    civilState: apiPerson.civilState,
    nationality: apiPerson.nationality,
    birthDate: apiPerson.birthDate,
    alternativeBirthDate: apiPerson.alternativeBirthDate,
    cityPlace: apiPerson.cityPlace,
    statePlace: apiPerson.statePlace,
    countryPlace: apiPerson.countryPlace,
    gender: apiPerson.gender,
    residenceCountries: apiPerson.residenceCountries,
    nif: apiPerson.nif,
    email: apiPerson.email,
    otp: apiPerson.otp,
    userId: '', // Será preenchido pelo parent se necessário
    createdAt: apiPerson.createdAt,
    updatedAt: apiPerson.updatedAt,
    deletedAt: undefined,
  };
}

/**
 * Adapta Address da API para formato local
 *
 * Address já está 100% compatível
 */
export function adaptAddress(apiAddress: any, serviceId?: string): Address {
  return {
    id: apiAddress.id,
    street: apiAddress.street,
    postalCode: apiAddress.postalCode,
    locality: apiAddress.locality,
    areaCode: apiAddress.areaCode,
    phone: apiAddress.phone,
    email: apiAddress.email,
    complement: apiAddress.complement,
    province: apiAddress.province,
    country: apiAddress.country,
    serviceId: serviceId || '',
    createdAt: apiAddress.createdAt,
    updatedAt: apiAddress.updatedAt,
  };
}

/**
 * Adapta Problem da API para formato local
 *
 * Problem já está 100% compatível
 */
export function adaptProblem(apiProblem: any): Problem {
  return {
    id: apiProblem.id,
    resume: apiProblem.resume,
    details: apiProblem.details,
    serviceId: apiProblem.serviceId,
    service: apiProblem.service ? adaptService(apiProblem.service) : undefined,
    createdAt: apiProblem.createdAt,
    updatedAt: apiProblem.updatedAt,
  };
}

/**
 * Adapta serviço completo da API para formato local
 *
 * Este é o adapter principal que orquestra todos os outros
 */
export function adaptService(apiService: ApiService): Service {
  return {
    // ===== Campos 100% compatíveis (cópia direta) =====
    id: apiService.id,
    status: apiService.status,
    processNumber: apiService.processNumber,
    processPassword: apiService.processPassword,
    entity: apiService.entity,
    reference: apiService.reference,
    assignedAt: apiService.assignedAt,
    isPaidTax: apiService.isPaidTax,
    paidTaxAt: apiService.paidTaxAt,
    isPaidGovernment: apiService.isPaidGovernment,
    paidGovernmentAt: apiService.paidGovernmentAt,
    paymentReferenceId: apiService.paymentReferenceId,
    documentPromotion: apiService.documentPromotion,
    hasResidenceTitle: apiService.hasResidenceTitle,
    hasBirthCertificate: apiService.hasBirthCertificate,
    hasCriminalRecord: apiService.hasCriminalRecord,
    hasIdentificationDocument: apiService.hasIdentificationDocument,
    hasBrasilianCriminalRecord: apiService.hasBrasilianCriminalRecord,
    refuseJustification: apiService.refuseJustification,
    almostJustification: apiService.almostJustification,
    sendSolicitationDate: apiService.sendSolicitationDate,
    submissionDate: apiService.submissionDate,
    createdAt: apiService.createdAt,
    updatedAt: apiService.updatedAt,
    userId: apiService.userId,
    personId: apiService.personId,

    // ===== Campos que NÃO existem na API (sempre null) =====
    submittedAt: null,
    conclusionDate: null,
    appointmentDate: null,
    viabilityId: null,
    slug: null,
    otp: null,
    otpExpiration: null,
    deletedAt: null,

    // ===== Relacionamentos (adaptados) =====
    user: apiService.user ? adaptUser(apiService.user) : undefined,
    person: apiService.person ? adaptPerson(apiService.person) : undefined,
    address: apiService.address ? adaptAddress(apiService.address, apiService.id) : undefined,

    // ===== Documentos (adaptar cada um) =====
    documents: apiService.documents?.map(doc =>
      adaptDocument(doc, apiService.id)
    ) || [],

    documentsAttorney: apiService.documentsAttorney?.map(doc =>
      adaptDocumentAttorney(doc, apiService.id)
    ) || [],

    // ===== Problemas =====
    problems: apiService.problems || [],

    // ===== Messages não existe na API de services =====
    messages: [],

    // ===== Viability buscar separadamente se necessário =====
    viability: null,

    // ===== Campo especial da API =====
    _count: apiService._count,
  };
}

/**
 * Adapta resposta de lista de serviços
 */
export function adaptServiceListResponse(apiResponse: ApiServiceListResponse) {
  return {
    services: apiResponse.services.map(adaptService),
    pagination: apiResponse.pagination,
  };
}

/**
 * Adapta resposta de detalhes de serviço
 */
export function adaptServiceDetailResponse(apiResponse: ApiServiceDetailResponse) {
  return {
    service: adaptService(apiResponse.service),
    summary: apiResponse.summary,
  };
}

// =====================================================
// HELPERS
// =====================================================

/**
 * Verifica se uma URL de documento expirou
 * Signed URLs do Google Cloud Storage expiram em 1 hora
 */
export function isDocumentUrlExpired(url: string): boolean {
  if (!url) return true;

  try {
    const urlObj = new URL(url);
    const expires = urlObj.searchParams.get('X-Amz-Expires');
    const date = urlObj.searchParams.get('X-Amz-Date');

    if (!expires || !date) return false; // Não é signed URL

    // Converter data ISO para timestamp
    const dateStr = date.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z');
    const createdAt = new Date(dateStr).getTime();
    const expiresIn = parseInt(expires) * 1000; // Converter para ms
    const expiresAt = createdAt + expiresIn;

    return Date.now() > expiresAt;
  } catch (error) {
    console.error('Error checking URL expiration:', error);
    return false;
  }
}

/**
 * Extrai ID do serviço de uma URL de documento
 * Útil para renovar URLs expiradas
 */
export function extractServiceIdFromDocumentUrl(url: string): string | null {
  // Implementar se necessário baseado no padrão de URL
  return null;
}
