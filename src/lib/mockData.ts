// Mock Data para o Backadmin - Lusio Cidadania
// 100 pedidos com dados completos seguindo schema Prisma REAL
// Gerado automaticamente em: 2025-10-27

import {
  ServiceStatus,
  User,
  Person,
  Address,
  Document,
  DocumentAttorney,
  Service,
  ServiceWithRelations,
  DocumentType,
  AuthUser,
  UserRole,
  Message,
  MessageType,
  MessageStatus,
} from "./types";

// Importar dados gerados (100 registros completos)
import {
  mockUsers as generatedUsers,
  mockPersons as generatedPersons,
  mockAddresses as generatedAddresses,
  mockDocuments as generatedDocuments,
  mockServices as generatedServices,
} from "./mockDataGenerated";

// =====================================================
// MOCK SYSTEM USERS (BACKOFFICE/STAFF)
// =====================================================

export const mockSystemUsers: AuthUser[] = [
  {
    id: "sys1",
    fullName: "Admin Sistema",
    firstName: "Admin",
    lastName: "Sistema",
    email: "admin@lusio.market",
    password: "admin123",
    phone: "+351910000001",
    areaCode: "+351",
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    role: UserRole.ADMIN,
  },
  {
    id: "sys2",
    fullName: "Patricia Backoffice",
    firstName: "Patricia",
    lastName: "Backoffice",
    email: "patricia@lusio.market",
    password: "patricia123",
    phone: "+351910000002",
    areaCode: "+351",
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    role: UserRole.BACKOFFICE,
  },
  {
    id: "sys3",
    fullName: "Dra. Ana Advogada",
    firstName: "Ana",
    lastName: "Advogada",
    email: "ana.advogada@lusio.market",
    password: "ana123",
    phone: "+351910000003",
    areaCode: "+351",
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    role: UserRole.ADVOGADA,
  },
  {
    id: "sys4",
    fullName: "João Visualizador",
    firstName: "João",
    lastName: "Visualizador",
    email: "joao.visual@lusio.market",
    password: "joao123",
    phone: "+351910000004",
    areaCode: "+351",
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    role: UserRole.VISUALIZADOR,
  },
];

// =====================================================
// EXPORT DOS DADOS GERADOS
// =====================================================

export const mockUsers = generatedUsers;
export const mockPeople = generatedPersons;
export const mockAddresses = generatedAddresses;
export const mockDocuments = generatedDocuments;

// =====================================================
// MOCK SERVICES COM RELAÇÕES (ServiceWithRelations)
// =====================================================

export const mockServices: ServiceWithRelations[] = generatedServices.map((service) => {
  // Encontrar user relacionado
  const user = generatedUsers.find(u => u.id === service.userId);

  // Encontrar person relacionada
  const person = generatedPersons.find(p => p.id === service.personId);

  // Encontrar address relacionado
  const address = generatedAddresses.find(a => a.serviceId === service.id);

  // Encontrar documents relacionados
  const documents = generatedDocuments.filter(d => d.serviceId === service.id);

  // Criar algumas mensagens mockadas para serviços com status específicos
  let messages: Message[] = [];

  if (service.status === ServiceStatus.STEP_7_RECUSED && service.refuseJustification) {
    messages = [
      {
        id: `msg_${service.id}_1`,
        serviceId: service.id,
        senderId: "sys3",
        senderName: "Dra. Ana Advogada",
        senderRole: UserRole.ADVOGADA,
        type: MessageType.LAWYER_REQUEST,
        content: service.refuseJustification,
        status: MessageStatus.READ,
        createdAt: service.updatedAt || service.createdAt,
        readAt: service.updatedAt || service.createdAt,
        requestType: "document",
        metadata: {
          actionType: "refuse",
          previousStatus: ServiceStatus.STEP_7,
          newStatus: ServiceStatus.STEP_7_RECUSED,
        },
      },
    ];
  } else if (service.status === ServiceStatus.STEP_7_ALMOST && service.almostJustification) {
    messages = [
      {
        id: `msg_${service.id}_1`,
        serviceId: service.id,
        senderId: "sys3",
        senderName: "Dra. Ana Advogada",
        senderRole: UserRole.ADVOGADA,
        type: MessageType.LAWYER_REQUEST,
        content: service.almostJustification,
        status: MessageStatus.UNREAD,
        createdAt: service.updatedAt || service.createdAt,
        requestType: "clarification",
      },
    ];
  }

  return {
    ...service,
    user: user!,
    person: person!,
    address,
    documents,
    documentsAttorney: [],
    messages,
  };
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getServiceById = (id: string): ServiceWithRelations | undefined => {
  return mockServices.find((s) => s.id === id);
};

export const getServicesByStatus = (status: ServiceStatus): ServiceWithRelations[] => {
  return mockServices.filter((s) => s.status === status);
};

export const getServicesByUserId = (userId: string): ServiceWithRelations[] => {
  return mockServices.filter((s) => s.userId === userId);
};

export const searchServices = (query: string): ServiceWithRelations[] => {
  const lowerQuery = query.toLowerCase();
  return mockServices.filter(
    (s) =>
      s.user.fullName.toLowerCase().includes(lowerQuery) ||
      s.user.email.toLowerCase().includes(lowerQuery) ||
      s.processNumber?.toLowerCase().includes(lowerQuery) ||
      s.person?.firstName.toLowerCase().includes(lowerQuery) ||
      s.person?.lastName.toLowerCase().includes(lowerQuery)
  );
};
