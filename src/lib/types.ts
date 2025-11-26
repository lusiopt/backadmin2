// Types baseados no schema Prisma do Lusio Cidadania
// Corrigido e validado em: 2025-10-27
// Reflete 100% do schema Prisma REAL (sem campos inventados)

// =====================================================
// ENUMS
// =====================================================

export enum ServiceStatus {
  STEP_1 = "Passo 1",
  STEP_2 = "Passo 2",
  STEP_3 = "Passo 3",
  STEP_4 = "Passo 4",
  STEP_5 = "Passo 5",
  STEP_6 = "Passo 6",
  STEP_7 = "Passo 7",
  STEP_7_WAITING = "Passo 7 Esperando",
  STEP_7_APPROVED = "Passo 7 Aprovado",
  STEP_7_RECUSED = "Passo 7 Recusado",
  STEP_7_ALMOST = "Passo 7 Quase",
  STEP_8 = "Passo 8",
  STEP_8_CLIENT_CONFIRMED = "Passo 8 Confirmado pelo Cliente",
  STEP_8_CONFIRMED_BY_GOVERNMENT = "Passo 8 Confirmado pelo Governo",
  CANCELLED = "Cancelado",
  SUBMITTED = "Submetido",
  UNDER_ANALYSIS = "Em análise",
  WAITING_RESPONSE = "Aguarda resposta",
  FOR_DECISION = "Para decisão",
  COMPLETED = "Concluído",
}

export enum DocumentType {
  IDENTITY = "identity",
  BIRTH_CERTIFICATE = "birth_certificate",
  CRIMINAL_RECORD = "criminal_record",
  RESIDENCE_TITLE = "residence_title",
  MARRIAGE_CERTIFICATE = "marriage_certificate",
  DIVORCE_CERTIFICATE = "divorce_certificate",
  CHILD_BIRTH_CERTIFICATE = "child_birth_certificate",
  CIVIL_CERTIFICATE = "civil_certificate",
  OTHER = "other",
}

// =====================================================
// INTERFACES
// =====================================================

export interface User {
  id: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  areaCode?: string | null;
  phone?: string | null;
  email: string;
  password?: string; // Hash da senha
  address?: string | null; // Endereço completo do usuário
  city?: string | null; // Cidade do usuário
  state?: string | null; // Estado/Região do usuário
  country?: string | null; // País do usuário
  postalCode?: string | null; // Código postal
  role?: string | null; // Papel no sistema
  active: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
  deletedAt?: Date | string | null; // Soft delete
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  alternativeNames?: string | null;
  profession?: string | null;
  fatherFullName?: string | null;
  fatherAlternativeNames?: string | null;
  fatherBirthPlace?: string | null;
  motherFullName?: string | null;
  motherAlternativeNames?: string | null;
  motherBirthPlace?: string | null;
  civilState?: string | null;
  nationality?: string | null;
  birthDate?: Date | string | null;
  alternativeBirthDate?: string | null; // Data alternativa de nascimento
  cityPlace?: string | null;
  statePlace?: string | null;
  countryPlace?: string | null;
  gender?: string | null;
  residenceCountries?: string | null;
  nif?: string | null; // Número de Identificação Fiscal (Portugal)
  email?: string | null; // Email da pessoa
  otp?: string | null; // OTP para autenticação

  userId: string;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
  deletedAt?: Date | string | null;
}

export interface Address {
  id: string;
  street?: string | null;
  postalCode?: string | null;
  locality?: string | null; // Localidade/Cidade
  areaCode?: string | null; // Código de área
  phone?: string | null; // Telefone
  email?: string | null; // Email de contato
  complement?: string | null;
  province?: string | null; // Província/Distrito (Portugal)
  country?: string | null;
  serviceId: string;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  title?: string | null; // Título do documento
  number?: string | null; // Número do documento (RG, CPF, Passaporte, etc)
  type?: DocumentType | string;
  size?: number;
  issuedAt?: Date | string | null; // Data de emissão
  expiresAt?: Date | string | null; // Data de validade
  issuedBy?: string | null; // Órgão emissor
  approved?: boolean | null; // Status de aprovação pela advogada
  uploadedAt: Date | string;
  serviceId: string;
  updatedAt?: Date | string | null;
  deletedAt?: Date | string | null;
}

export interface DocumentAttorney {
  id: string;
  name: string;
  url: string;
  size?: number;
  uploadedAt: Date | string;
  serviceId: string;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

export interface Service {
  id: string;
  status: ServiceStatus | string | null;
  processNumber?: string | null;
  processPassword?: string | null;
  entity?: string | null;
  reference?: string | null;
  assignedAt?: Date | string | null;
  isPaidTax: boolean;
  paidTaxAt?: Date | string | null;
  isPaidGovernment: boolean;
  paidGovernmentAt?: Date | string | null;
  paymentReferenceId?: string | null;

  // Documentos obrigatórios
  hasResidenceTitle?: boolean | null;
  hasBirthCertificate?: boolean | null;
  hasCriminalRecord?: boolean | null;
  hasIdentificationDocument?: boolean | null;
  hasBrasilianCriminalRecord?: boolean | null;
  documentPromotion?: boolean | null;
  refuseJustification?: string | null;
  almostJustification?: string | null;
  sendSolicitationDate?: Date | string | null;
  submissionDate?: Date | string | null;
  submittedAt?: Date | string | null; // Data de envio do pedido
  conclusionDate?: Date | string | null; // Data de conclusão
  appointmentDate?: Date | string | null; // Data de agendamento

  // Relações
  viabilityId?: string | null; // ID da análise de viabilidade

  // Outros
  slug?: string | null; // Slug único para URL amigável
  otp?: string | null; // OTP para autenticação do processo
  otpExpiration?: Date | string | null; // Expiração do OTP

  createdAt: Date | string;
  updatedAt?: Date | string | null;
  deletedAt?: Date | string | null; // Soft delete
  userId: string;
  personId?: string | null;

  // Relacionamentos (opcionais - só existem quando populados)
  user?: User;
  person?: Person | null;
  address?: Address | null;
  documents?: Document[];
  documentsAttorney?: DocumentAttorney[];
  messages?: Message[];
  problems?: Problem[]; // Problemas do processo
  viability?: Viability | null; // Análise de viabilidade

  // Campo especial retornado pela API
  _count?: {
    documents: number;
    documentsAttorney: number;
    problems: number;
  };
}

// =====================================================
// NOVOS MODELS: PROBLEM E VIABILITY
// =====================================================

export interface Problem {
  id: string;
  resume: string; // Resumo do problema
  details: string; // Detalhes do problema (Text)
  serviceId: string;
  service?: Service;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

export interface Viability {
  id: string;
  email: string;
  portugueseMaternalLanguage?: boolean | null; // Português é língua materna?
  dateFiveYears?: Date | string | null; // Data de 5 anos
  moreThanEithteen?: boolean | null; // Maior de 18 anos?
  emancipated?: boolean | null; // Emancipado?
  lived5Years?: boolean | null; // Viveu 5 anos em território português?
  approvedAuthorization?: boolean | null; // Autorização aprovada?
  threeYearsPrison?: boolean | null; // Condenação superior a 3 anos de prisão?
  terrorist?: boolean | null; // Envolvimento em atividades terroristas?
  fullName: string;
  firstName: string;
  lastName: string;
  areaCode: string;
  phone: string;
  dateAuthorizationRequest?: Date | string | null; // Data do pedido de autorização
  status: string; // Status da análise
  descriptionPrison?: string | null; // Descrição da condenação prisional (Text)
  descriptionAuthorization?: string | null; // Descrição da autorização (Text)
  descriptionTerrorist?: string | null; // Descrição de atividades terroristas (Text)
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

// =====================================================
// HELPER TYPES
// =====================================================

export type ServiceWithRelations = Service & {
  user: User;
  person: Person;
  address?: Address;
  documents: Document[];
  documentsAttorney: DocumentAttorney[];
  problems?: Problem[];
  viability?: Viability | null;
};

export interface StatusHistory {
  id: string;
  serviceId: string;
  fromStatus: ServiceStatus | string;
  toStatus: ServiceStatus | string;
  changedBy: string;
  changedAt: Date | string;
  notes?: string;
}

export interface LawyerAction {
  type: "approve" | "refuse" | "almost" | "add_irn_data";
  serviceId: string;
  notes?: string;
  processNumber?: string;
  entity?: string;
  reference?: string;
}

// =====================================================
// FILTERS & PAGINATION
// =====================================================

export interface ServiceFilters {
  status?: ServiceStatus | string;
  search?: string; // busca por nome, email, processo
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =====================================================
// ROLES & PERMISSIONS
// =====================================================

export enum UserRole {
  ADMIN = "admin",
  BACKOFFICE = "backoffice",
  ADVOGADA = "advogada",
  VISUALIZADOR = "visualizador",
}

export enum Permission {
  // Service permissions
  VIEW_SERVICES = "view_services",
  CREATE_SERVICE = "create_service",
  EDIT_SERVICE = "edit_service",
  DELETE_SERVICE = "delete_service",
  CHANGE_STATUS = "change_status",

  // Document permissions
  VIEW_DOCUMENTS = "view_documents",
  UPLOAD_DOCUMENTS = "upload_documents",
  DELETE_DOCUMENTS = "delete_documents",

  // User permissions
  VIEW_USERS = "view_users",
  MANAGE_USERS = "manage_users",

  // Special permissions
  VIEW_ALL_SERVICES = "view_all_services", // Ver todos os processos (não só os atribuídos)
  ASSIGN_SERVICES = "assign_services", // Atribuir processos a outros usuários
  VIEW_STATISTICS = "view_statistics", // Ver estatísticas e dashboards
  EXPORT_DATA = "export_data", // Exportar dados

  // Phase-specific permissions (Permissões por fase do processo)
  ACCESS_STEP_1 = "access_step_1",
  ACCESS_STEP_2 = "access_step_2",
  ACCESS_STEP_3 = "access_step_3",
  ACCESS_STEP_4 = "access_step_4",
  ACCESS_STEP_5 = "access_step_5",
  ACCESS_STEP_6 = "access_step_6",
  ACCESS_STEP_7 = "access_step_7",
  ACCESS_STEP_8 = "access_step_8",
  ACCESS_CANCELLED = "access_cancelled",
  ACCESS_SUBMITTED = "access_submitted",
  ACCESS_UNDER_ANALYSIS = "access_under_analysis",
  ACCESS_WAITING_RESPONSE = "access_waiting_response",
  ACCESS_FOR_DECISION = "access_for_decision",
  ACCESS_COMPLETED = "access_completed",
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

// Definição de permissões por role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Acesso total
    Permission.VIEW_SERVICES,
    Permission.CREATE_SERVICE,
    Permission.EDIT_SERVICE,
    Permission.DELETE_SERVICE,
    Permission.CHANGE_STATUS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.DELETE_DOCUMENTS,
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_ALL_SERVICES,
    Permission.ASSIGN_SERVICES,
    Permission.VIEW_STATISTICS,
    Permission.EXPORT_DATA,
    // Acesso a todas as fases
    Permission.ACCESS_STEP_1,
    Permission.ACCESS_STEP_2,
    Permission.ACCESS_STEP_3,
    Permission.ACCESS_STEP_4,
    Permission.ACCESS_STEP_5,
    Permission.ACCESS_STEP_6,
    Permission.ACCESS_STEP_7,
    Permission.ACCESS_STEP_8,
    Permission.ACCESS_CANCELLED,
    Permission.ACCESS_SUBMITTED,
    Permission.ACCESS_UNDER_ANALYSIS,
    Permission.ACCESS_WAITING_RESPONSE,
    Permission.ACCESS_FOR_DECISION,
    Permission.ACCESS_COMPLETED,
  ],
  [UserRole.BACKOFFICE]: [
    // Operação completa, exceto gerenciar usuários
    Permission.VIEW_SERVICES,
    Permission.CREATE_SERVICE,
    Permission.EDIT_SERVICE,
    Permission.CHANGE_STATUS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.DELETE_DOCUMENTS,
    Permission.VIEW_USERS,
    Permission.VIEW_ALL_SERVICES,
    Permission.ASSIGN_SERVICES,
    Permission.VIEW_STATISTICS,
    Permission.EXPORT_DATA,
    // Acesso a todas as fases
    Permission.ACCESS_STEP_1,
    Permission.ACCESS_STEP_2,
    Permission.ACCESS_STEP_3,
    Permission.ACCESS_STEP_4,
    Permission.ACCESS_STEP_5,
    Permission.ACCESS_STEP_6,
    Permission.ACCESS_STEP_7,
    Permission.ACCESS_STEP_8,
    Permission.ACCESS_CANCELLED,
    Permission.ACCESS_SUBMITTED,
    Permission.ACCESS_UNDER_ANALYSIS,
    Permission.ACCESS_WAITING_RESPONSE,
    Permission.ACCESS_FOR_DECISION,
    Permission.ACCESS_COMPLETED,
  ],
  [UserRole.ADVOGADA]: [
    // Visualização + análise + mudança de status (apenas a partir do Passo 7)
    Permission.VIEW_SERVICES,
    Permission.EDIT_SERVICE,
    Permission.CHANGE_STATUS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.VIEW_ALL_SERVICES,
    Permission.VIEW_STATISTICS,
    // Acesso apenas a partir do Passo 7
    Permission.ACCESS_STEP_7,
    Permission.ACCESS_STEP_8,
    Permission.ACCESS_SUBMITTED,
    Permission.ACCESS_UNDER_ANALYSIS,
    Permission.ACCESS_WAITING_RESPONSE,
    Permission.ACCESS_FOR_DECISION,
    Permission.ACCESS_COMPLETED,
  ],
  [UserRole.VISUALIZADOR]: [
    // Apenas leitura de todas as fases
    Permission.VIEW_SERVICES,
    Permission.VIEW_DOCUMENTS,
    Permission.VIEW_STATISTICS,
    // Visualização de todas as fases
    Permission.ACCESS_STEP_1,
    Permission.ACCESS_STEP_2,
    Permission.ACCESS_STEP_3,
    Permission.ACCESS_STEP_4,
    Permission.ACCESS_STEP_5,
    Permission.ACCESS_STEP_6,
    Permission.ACCESS_STEP_7,
    Permission.ACCESS_STEP_8,
    Permission.ACCESS_CANCELLED,
    Permission.ACCESS_SUBMITTED,
    Permission.ACCESS_UNDER_ANALYSIS,
    Permission.ACCESS_WAITING_RESPONSE,
    Permission.ACCESS_FOR_DECISION,
    Permission.ACCESS_COMPLETED,
  ],
};

// User estendido com role e senha (para gestão de usuários do sistema)
export interface AuthUser extends User {
  role: UserRole;
  password?: string; // Opcional - usado apenas para autenticação
}

// Context de autenticação
export interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

// =====================================================
// MESSAGING SYSTEM
// =====================================================

export enum MessageType {
  SYSTEM = "system", // Mensagens automáticas do sistema
  USER = "user", // Mensagens de usuários
  LAWYER_REQUEST = "lawyer_request", // Solicitação da advogada
  BACKOFFICE_RESPONSE = "backoffice_response", // Resposta do backoffice
}

export enum MessageStatus {
  UNREAD = "unread",
  READ = "read",
}

export interface Message {
  id: string;
  serviceId: string;
  senderId: string; // ID do usuário que enviou
  senderName: string; // Nome do usuário que enviou
  senderRole: UserRole; // Role do remetente
  type: MessageType;
  content: string; // Conteúdo da mensagem
  status: MessageStatus;
  createdAt: Date | string;
  readAt?: Date | string | null;
  // Para mensagens de solicitação da advogada
  requestType?: "document" | "clarification" | "other"; // Tipo de solicitação
  documentType?: DocumentType | string; // Tipo de documento solicitado (se aplicável)
  // Metadados
  metadata?: {
    actionType?: "approve" | "refuse" | "almost"; // Ação relacionada
    previousStatus?: ServiceStatus | string; // Status anterior do processo
    newStatus?: ServiceStatus | string; // Novo status do processo
  };
}

export interface MessageThread {
  serviceId: string;
  messages: Message[];
  unreadCount: number;
  lastMessageAt: Date | string;
}

// Tipo para criação de nova mensagem
export interface CreateMessageInput {
  serviceId: string;
  content: string;
  type?: MessageType;
  requestType?: "document" | "clarification" | "other";
  documentType?: DocumentType | string;
}
