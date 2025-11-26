"use client";

import { useState, useEffect, useRef, memo } from "react";
import { ServiceWithRelations, ServiceStatus, Permission, CreateMessageInput, Message, MessageType, MessageStatus } from "@/lib/types";
import { useServices } from "@/contexts/ServicesContext";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/pedidos/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MessageThread } from "@/components/MessageThread";

interface ServiceModalProps {
  service: ServiceWithRelations;
  open: boolean;
  onClose: () => void;
}

export const ServiceModal = memo(function ServiceModal({ service: initialService, open, onClose }: ServiceModalProps) {
  const { getService, updateService } = useServices();

  // Ref para evitar re-renders desnecessários no useEffect
  const updateServiceRef = useRef(updateService);
  updateServiceRef.current = updateService;
  const { user, hasPermission } = useAuth();
  const service = getService(initialService.id) || initialService;

  const [activeTab, setActiveTab] = useState("acoes");
  const [isEditingClient, setIsEditingClient] = useState(false);

  // Client edit state
  const [editableClient, setEditableClient] = useState({
    firstName: service?.person?.firstName || "",
    lastName: service?.person?.lastName || "",
    profession: service?.person?.profession || "",
    nationality: service?.person?.nationality || "",
    birthDate: service?.person?.birthDate || "",
    fatherFullName: service?.person?.fatherFullName || "",
    motherFullName: service?.person?.motherFullName || "",
  });

  // Workflow state
  const [almostNote, setAlmostNote] = useState("");
  const [entity, setEntity] = useState(service?.entity || "");
  const [reference, setReference] = useState(service?.reference || "");
  const [processNumber, setProcessNumber] = useState(service?.processNumber || "");
  const [processPassword, setProcessPassword] = useState(service?.processPassword || "");

  // Mini modals for actions
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showAlmostModal, setShowAlmostModal] = useState(false);
  const [showIRNModal, setShowIRNModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);

  const handleSaveClientEdit = () => {
    if (!service.person) return;
    updateService(service.id, {
      person: {
        ...service.person,
        ...editableClient
      } as any
    });
    setIsEditingClient(false);
    alert("✅ Dados atualizados!");
  };

  const handleApprove = () => {
    updateService(service.id, { status: ServiceStatus.STEP_7_APPROVED });
    setShowApproveModal(false);
    alert("✅ Documentos aprovados!");
  };

  const handleAlmost = () => {
    if (!almostNote.trim()) {
      alert("Explique o que falta");
      return;
    }

    if (!user) {
      alert("Erro: usuário não autenticado");
      return;
    }

    // Criar mensagem da advogada
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      serviceId: service.id,
      senderId: user.id,
      senderName: user.fullName,
      senderRole: user.role,
      type: MessageType.LAWYER_REQUEST,
      content: almostNote,
      status: MessageStatus.UNREAD,
      createdAt: new Date().toISOString(),
      requestType: "other",
      metadata: {
        actionType: "almost",
        previousStatus: service.status || "",
        newStatus: ServiceStatus.STEP_7_ALMOST,
      },
    };

    updateService(service.id, {
      status: ServiceStatus.STEP_7_ALMOST,
      almostJustification: almostNote,
      messages: [...(service.messages || []), newMessage]
    });
    setShowAlmostModal(false);
    setAlmostNote("");
    alert("⚠️ Status alterado e mensagem enviada ao backoffice");
  };

  const handleSendMessage = (input: CreateMessageInput) => {
    if (!user) {
      alert("Erro: usuário não autenticado");
      return;
    }

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      serviceId: service.id,
      senderId: user.id,
      senderName: user.fullName,
      senderRole: user.role,
      type: input.type || MessageType.USER,
      content: input.content,
      status: MessageStatus.UNREAD,
      createdAt: new Date().toISOString(),
      requestType: input.requestType,
      documentType: input.documentType,
    };

    updateService(service.id, {
      messages: [...(service.messages || []), newMessage]
    });
  };

  // Marcar mensagens como lidas quando abrir a tab Comunicações
  useEffect(() => {
    if (activeTab === "comunicacoes" && service.messages && user) {
      const unreadMessages = service.messages.filter(
        m => m.status === MessageStatus.UNREAD && m.senderId !== user.id
      );

      if (unreadMessages.length > 0) {
        const updatedMessages = service.messages.map(m =>
          m.status === MessageStatus.UNREAD && m.senderId !== user.id
            ? { ...m, status: MessageStatus.READ, readAt: new Date().toISOString() }
            : m
        );

        // Usar ref para evitar dependência de updateService
        updateServiceRef.current(service.id, { messages: updatedMessages });
      }
    }
  }, [activeTab, service.id, service.messages, user]);

  const handleAddIRN = () => {
    if (!entity || !reference) {
      alert("Preencha Entidade e Referência");
      return;
    }
    updateService(service.id, {
      entity,
      reference,
      status: ServiceStatus.STEP_8
    });
    setShowIRNModal(false);
    alert("✅ Dados do IRN inseridos!");
  };

  const handleConfirmGovernment = () => {
    updateService(service.id, {
      status: ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT,
      isPaidGovernment: true,
      paidGovernmentAt: new Date().toISOString()
    });
    alert("✅ Pagamento confirmado pelo governo!");
  };

  const handleSubmitProcess = () => {
    if (!processNumber || !processPassword) {
      alert("Preencha Número e Senha");
      return;
    }
    updateService(service.id, {
      processNumber,
      processPassword,
      status: ServiceStatus.SUBMITTED,
      submissionDate: new Date().toISOString()
    });
    setShowProcessModal(false);
    alert("✅ Processo submetido!");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent onClose={onClose}>
          {/* Header */}
          <DialogHeader>
            <div className="flex items-start justify-between pr-8">
              <div>
                <DialogTitle>{service.user?.fullName || 'N/A'}</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">{service.user?.email || 'N/A'}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="secondary" className="text-xs">
                  {service.id}
                </Badge>
                <StatusBadge status={service.status} />
              </div>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-50">
              <TabsTrigger value="dados" icon="📋">Dados</TabsTrigger>
              <TabsTrigger value="documentos" icon="📄">Documentos</TabsTrigger>
              <TabsTrigger value="timeline" icon="📅">Histórico</TabsTrigger>
              <TabsTrigger value="comunicacoes" icon="💬">
                Comunicações
                {service.messages && service.messages.some(m => m.status === MessageStatus.UNREAD && m.senderId !== user?.id) && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                    {service.messages.filter(m => m.status === MessageStatus.UNREAD && m.senderId !== user?.id).length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="acoes" icon="⚡">Ações</TabsTrigger>
            </TabsList>

            <DialogBody className="max-h-[65vh]">
              {/* TAB: Dados */}
              <TabsContent value="dados" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Dados do Requerente</h3>
                  {/* Only users with EDIT_SERVICE permission can edit */}
                  {hasPermission(Permission.EDIT_SERVICE) && (
                    !isEditingClient ? (
                      <Button onClick={() => setIsEditingClient(true)} size="sm" variant="outline">
                        ✏️ Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleSaveClientEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                          💾 Salvar
                        </Button>
                        <Button onClick={() => setIsEditingClient(false)} size="sm" variant="outline">
                          ❌ Cancelar
                        </Button>
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  {isEditingClient ? (
                    <>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Nome</label>
                        <Input
                          value={editableClient.firstName}
                          onChange={(e) => setEditableClient({...editableClient, firstName: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Sobrenome</label>
                        <Input
                          value={editableClient.lastName}
                          onChange={(e) => setEditableClient({...editableClient, lastName: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Profissão</label>
                        <Input
                          value={editableClient.profession}
                          onChange={(e) => setEditableClient({...editableClient, profession: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Nacionalidade</label>
                        <Input
                          value={editableClient.nationality}
                          onChange={(e) => setEditableClient({...editableClient, nationality: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Data Nascimento</label>
                        <Input
                          type="date"
                          value={editableClient.birthDate ? new Date(editableClient.birthDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => setEditableClient({...editableClient, birthDate: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Pai</label>
                        <Input
                          value={editableClient.fatherFullName}
                          onChange={(e) => setEditableClient({...editableClient, fatherFullName: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-600 font-medium">Mãe</label>
                        <Input
                          value={editableClient.motherFullName}
                          onChange={(e) => setEditableClient({...editableClient, motherFullName: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div><span className="font-medium">Nome:</span> {service.person?.firstName} {service.person?.lastName}</div>
                      {service.person?.alternativeNames && (
                        <div><span className="font-medium">Nome Alternativo:</span> {service.person.alternativeNames}</div>
                      )}
                      <div><span className="font-medium">Email:</span> {service.person?.email || "-"}</div>
                      <div><span className="font-medium">NIF:</span> {service.person?.nif || "-"}</div>
                      <div><span className="font-medium">Profissão:</span> {service.person?.profession || "-"}</div>
                      <div><span className="font-medium">Nacionalidade:</span> {service.person?.nationality || "-"}</div>
                      {service.person?.residenceCountries && (
                        <div><span className="font-medium">Países Residência:</span> {service.person.residenceCountries}</div>
                      )}
                      <div><span className="font-medium">Nascimento:</span> {formatDate(service.person?.birthDate)}</div>
                      {service.person?.alternativeBirthDate && (
                        <div><span className="font-medium">Data Alt:</span> {formatDate(service.person.alternativeBirthDate)}</div>
                      )}
                      <div className="col-span-2 border-t pt-2 mt-2">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Dados dos Pais</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div><span className="font-medium">Pai:</span> {service.person?.fatherFullName || "-"}</div>
                          {service.person?.fatherAlternativeNames && (
                            <div><span className="font-medium">Pai (Alt):</span> {service.person.fatherAlternativeNames}</div>
                          )}
                          {service.person?.fatherBirthPlace && (
                            <div><span className="font-medium">Nasc. Pai:</span> {service.person.fatherBirthPlace}</div>
                          )}
                          <div><span className="font-medium">Mãe:</span> {service.person?.motherFullName || "-"}</div>
                          {service.person?.motherAlternativeNames && (
                            <div><span className="font-medium">Mãe (Alt):</span> {service.person.motherAlternativeNames}</div>
                          )}
                          {service.person?.motherBirthPlace && (
                            <div><span className="font-medium">Nasc. Mãe:</span> {service.person.motherBirthPlace}</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {service.address && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-3">Endereço em Portugal</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div><span className="font-medium">Rua:</span> {service.address.street || "-"}</div>
                      {service.address.complement && (
                        <div><span className="font-medium">Complemento:</span> {service.address.complement}</div>
                      )}
                      <div><span className="font-medium">Cód. Postal:</span> {service.address.postalCode || "-"}</div>
                      <div><span className="font-medium">Localidade:</span> {service.address.locality || "-"}</div>
                      {service.address.province && (
                        <div><span className="font-medium">Província:</span> {service.address.province}</div>
                      )}
                      <div><span className="font-medium">País:</span> {service.address.country || "-"}</div>
                      {service.address.phone && (
                        <div><span className="font-medium">Telefone:</span> {service.address.areaCode ? `+${service.address.areaCode} ` : ""}{service.address.phone}</div>
                      )}
                      {service.address.email && (
                        <div><span className="font-medium">Email:</span> {service.address.email}</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">Dados do Processo</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">Criado:</span> {formatDate(service.createdAt)}</div>
                    <div><span className="font-medium">Atualizado:</span> {formatDate(service.updatedAt)}</div>
                    {service.assignedAt && (
                      <div><span className="font-medium">Atribuído:</span> {formatDate(service.assignedAt)}</div>
                    )}
                    {service.sendSolicitationDate && (
                      <div><span className="font-medium">Solicitação:</span> {formatDate(service.sendSolicitationDate)}</div>
                    )}
                    <div><span className="font-medium">Taxa Paga:</span> {service.isPaidTax ? "✅" : "❌"}</div>
                    <div><span className="font-medium">Governo:</span> {service.isPaidGovernment ? "✅" : "❌"}</div>
                    {service.paymentReferenceId && (
                      <div><span className="font-medium">Ref. Pagamento:</span> {service.paymentReferenceId}</div>
                    )}
                    {service.documentPromotion !== null && service.documentPromotion !== undefined && (
                      <div><span className="font-medium">Promoção Docs:</span> {service.documentPromotion ? "✅" : "❌"}</div>
                    )}
                    <div><span className="font-medium">Entidade:</span> {service.entity || "-"}</div>
                    <div><span className="font-medium">Referência:</span> {service.reference || "-"}</div>
                    <div><span className="font-medium">Nº Processo:</span> {service.processNumber || "-"}</div>
                    {service.processPassword && (
                      <div><span className="font-medium">Senha:</span> {service.processPassword}</div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* TAB: Documentos */}
              <TabsContent value="documentos" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Documentos ({service.documents?.length || 0})</h3>
                  {/* Only users with UPLOAD_DOCUMENTS permission can upload */}
                  {hasPermission(Permission.UPLOAD_DOCUMENTS) && (
                    <div>
                      <input
                        id={`file-upload-${service.id}`}
                        type="file"
                        className="hidden"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            const newDocs = files.map((file, idx) => ({
                              id: `doc_${Date.now()}_${idx}`,
                              name: file.name,
                              url: URL.createObjectURL(file),
                              uploadedAt: new Date().toISOString(),
                              serviceId: service.id,
                            }));
                            updateService(service.id, {
                              documents: [...(service.documents || []), ...newDocs]
                            });
                            alert(`✅ ${files.length} arquivo(s) adicionado(s)!`);
                            e.target.value = '';
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="text-xs"
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(`file-upload-${service.id}`) as HTMLInputElement;
                          if (input) input.click();
                        }}
                      >
                        📎 Adicionar Documentos
                      </Button>
                    </div>
                  )}
                </div>
                {service.documents && service.documents.length > 0 ? (
                  <div className="space-y-2">
                    {service.documents.map((doc) => (
                      <div key={doc.id} className="p-3 bg-gray-50 rounded hover:bg-gray-100">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            {/* Title and Approval Status */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {doc.title || doc.name}
                              </span>
                              {doc.approved !== null && doc.approved !== undefined && (
                                <span className={`text-xs px-2 py-0.5 rounded ${doc.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {doc.approved ? '✅ Aprovado' : '⏳ Pendente'}
                                </span>
                              )}
                            </div>

                            {/* File name (if different from title) */}
                            {doc.title && doc.title !== doc.name && (
                              <p className="text-xs text-gray-500">
                                Arquivo: {doc.name}
                              </p>
                            )}

                            {/* Document metadata grid */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                              {doc.number && (
                                <div><span className="font-medium">Número:</span> {doc.number}</div>
                              )}
                              {doc.issuedBy && (
                                <div><span className="font-medium">Emissor:</span> {doc.issuedBy}</div>
                              )}
                              {doc.issuedAt && (
                                <div><span className="font-medium">Emissão:</span> {formatDate(doc.issuedAt)}</div>
                              )}
                              {doc.expiresAt && (
                                <div><span className="font-medium">Validade:</span> {formatDate(doc.expiresAt)}</div>
                              )}
                              {doc.uploadedAt && (
                                <div><span className="font-medium">Upload:</span> {formatDate(doc.uploadedAt)}</div>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2 flex-shrink-0">
                            {hasPermission(Permission.VIEW_DOCUMENTS) && (
                              <button className="text-xs text-primary hover:underline">Ver</button>
                            )}
                            {hasPermission(Permission.DELETE_DOCUMENTS) && (
                              <button
                                onClick={() => {
                                  if (confirm(`Remover ${doc.name}?`)) {
                                    updateService(service.id, {
                                      documents: service.documents?.filter(d => d.id !== doc.id)
                                    });
                                  }
                                }}
                                className="text-xs text-red-600 hover:underline"
                              >
                                Remover
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-8 text-center">
                    Nenhum documento anexado.<br/>
                    Clique em "Adicionar Documentos" para enviar arquivos.
                  </p>
                )}
              </TabsContent>

              {/* TAB: Histórico */}
              <TabsContent value="timeline">
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {(() => {
                    // Agregação de todos os eventos do processo
                    const events: Array<{ date: Date; description: string; icon: string; color: string }> = [];

                    // Criação do processo
                    if (service.createdAt) {
                      events.push({
                        date: new Date(service.createdAt),
                        description: "Processo criado",
                        icon: "🆕",
                        color: "blue"
                      });
                    }

                    // Mudanças de status via mensagens
                    if (service.messages) {
                      service.messages.forEach(msg => {
                        if (msg.metadata?.newStatus) {
                          events.push({
                            date: new Date(msg.createdAt),
                            description: `Status alterado para: ${msg.metadata.newStatus}`,
                            icon: "🔄",
                            color: "purple"
                          });
                        }

                        // Mensagens da advogada
                        if (msg.type === MessageType.LAWYER_REQUEST) {
                          events.push({
                            date: new Date(msg.createdAt),
                            description: `Solicitação da advogada: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`,
                            icon: "⚖️",
                            color: "yellow"
                          });
                        }

                        // Respostas do backoffice
                        if (msg.type === MessageType.BACKOFFICE_RESPONSE) {
                          events.push({
                            date: new Date(msg.createdAt),
                            description: `Resposta do backoffice: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`,
                            icon: "💬",
                            color: "green"
                          });
                        }
                      });
                    }

                    // Upload de documentos
                    if (service.documents) {
                      service.documents.forEach(doc => {
                        events.push({
                          date: new Date(doc.uploadedAt),
                          description: `Documento enviado: ${doc.name}`,
                          icon: "📄",
                          color: "indigo"
                        });
                      });
                    }

                    // Documentos do advogado
                    if (service.documentsAttorney) {
                      service.documentsAttorney.forEach(doc => {
                        events.push({
                          date: new Date(doc.uploadedAt),
                          description: `Documento da advogada: ${doc.name}`,
                          icon: "📋",
                          color: "violet"
                        });
                      });
                    }

                    // Pagamentos
                    if (service.paidTaxAt) {
                      events.push({
                        date: new Date(service.paidTaxAt),
                        description: "Taxa paga",
                        icon: "💰",
                        color: "green"
                      });
                    }

                    if (service.paidGovernmentAt) {
                      events.push({
                        date: new Date(service.paidGovernmentAt),
                        description: "Pagamento ao governo confirmado",
                        icon: "🏛️",
                        color: "green"
                      });
                    }

                    // Submissão do processo
                    if (service.submissionDate) {
                      events.push({
                        date: new Date(service.submissionDate),
                        description: "Processo submetido",
                        icon: "📤",
                        color: "cyan"
                      });
                    }

                    // Atribuição
                    if (service.assignedAt) {
                      events.push({
                        date: new Date(service.assignedAt),
                        description: "Processo atribuído",
                        icon: "👤",
                        color: "gray"
                      });
                    }

                    // Última atualização
                    if (service.updatedAt && service.updatedAt !== service.createdAt) {
                      events.push({
                        date: new Date(service.updatedAt),
                        description: "Processo atualizado",
                        icon: "✏️",
                        color: "gray"
                      });
                    }

                    // Ordenar por data (mais recente primeiro)
                    events.sort((a, b) => b.date.getTime() - a.date.getTime());

                    // Renderizar lista de eventos
                    if (events.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">Nenhum evento registrado ainda</p>
                        </div>
                      );
                    }

                    return events.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border-l-4 rounded hover:bg-gray-50 transition-colors"
                        style={{ borderLeftColor: `var(--${event.color}-500)` }}
                      >
                        <span className="text-2xl flex-shrink-0">{event.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{event.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(event.date.toISOString())}
                          </p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </TabsContent>

              {/* TAB: Comunicações */}
              <TabsContent value="comunicacoes">
                <MessageThread
                  serviceId={service.id}
                  messages={service.messages || []}
                  onSendMessage={handleSendMessage}
                />
              </TabsContent>

              {/* TAB: Ações */}
              <TabsContent value="acoes" className="space-y-2 max-w-full sm:max-w-2xl mx-auto">
                {!hasPermission(Permission.CHANGE_STATUS) ? (
                  <div className="bg-yellow-50 border border-yellow-300 rounded p-4 text-center">
                    <p className="text-sm font-medium text-yellow-800">
                      ⚠️ Você não tem permissão para alterar o status dos processos
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Apenas usuários com permissão adequada podem realizar ações no workflow.
                    </p>
                  </div>
                ) : (
                  <>
                {/* Passo 1 */}
                <div className="border rounded p-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8 ? 'bg-green-500 text-white' : 'bg-gray-300'
                    }`}>
                      {service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8 ? '✓' : '1'}
                    </div>
                    <h4 className="font-semibold text-xs">Revisão de Documentos</h4>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowApproveModal(true)}
                      disabled={service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8}
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-xs h-7"
                    >
                      ✅ Aprovar
                    </Button>
                    <Button
                      onClick={() => setShowAlmostModal(true)}
                      disabled={service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8}
                      size="sm"
                      variant="secondary"
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs h-7"
                    >
                      ⚠️ Quase Lá
                    </Button>
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="border rounded p-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      service.status === ServiceStatus.STEP_8 || service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ? 'bg-green-500 text-white' : 'bg-gray-300'
                    }`}>
                      {service.status === ServiceStatus.STEP_8 || service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ? '✓' : '2'}
                    </div>
                    <h4 className="font-semibold text-xs">Inserir Dados IRN</h4>
                  </div>
                  <Button
                    onClick={() => setShowIRNModal(true)}
                    disabled={service.status !== ServiceStatus.STEP_7_APPROVED}
                    size="sm"
                    className="w-full sm:max-w-[250px] sm:mx-auto text-xs h-7"
                  >
                    📝 Dados IRN
                  </Button>
                  {service.entity && (
                    <p className="text-xs text-green-700 mt-1">✓ Ent: {service.entity} | Ref: {service.reference}</p>
                  )}
                </div>

                {/* Passo 3 */}
                <div className="border rounded p-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ? 'bg-green-500 text-white' : service.status === ServiceStatus.STEP_8 ? 'bg-yellow-500 text-white animate-pulse' : 'bg-gray-300'
                    }`}>
                      {service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ? '✓' : '3'}
                    </div>
                    <h4 className="font-semibold text-xs">Cliente Pagar (€250)</h4>
                  </div>
                  {service.status === ServiceStatus.STEP_8 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-yellow-700">⏳ Aguardando pagamento...</p>
                      <Button
                        onClick={() => {
                          updateService(service.id, { status: ServiceStatus.STEP_8_CLIENT_CONFIRMED });
                          alert("✅ Pagamento simulado");
                        }}
                        size="sm"
                        variant="outline"
                        className="w-full sm:max-w-[250px] sm:mx-auto text-xs h-7"
                      >
                        🎭 Simular Pagamento
                      </Button>
                    </div>
                  )}
                  {service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED && (
                    <p className="text-xs text-green-700">✓ Cliente confirmou pagamento</p>
                  )}
                </div>

                {/* Passo 4 */}
                <div className="border rounded p-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ? 'bg-green-500 text-white' : 'bg-gray-300'
                    }`}>
                      {service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ? '✓' : '4'}
                    </div>
                    <h4 className="font-semibold text-xs">Confirmar Governo</h4>
                  </div>
                  <Button
                    onClick={handleConfirmGovernment}
                    disabled={service.status !== ServiceStatus.STEP_8_CLIENT_CONFIRMED}
                    size="sm"
                    className="w-full sm:max-w-[250px] sm:mx-auto bg-green-600 hover:bg-green-700 text-xs h-7"
                  >
                    ✅ Governo Confirmou
                  </Button>
                </div>

                {/* Passo 5 */}
                <div className="border rounded p-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      service.status === ServiceStatus.SUBMITTED ? 'bg-green-500 text-white' : 'bg-gray-300'
                    }`}>
                      {service.status === ServiceStatus.SUBMITTED ? '✓' : '5'}
                    </div>
                    <h4 className="font-semibold text-xs">Inserir Processo e Senha</h4>
                  </div>
                  <Button
                    onClick={() => setShowProcessModal(true)}
                    disabled={service.status !== ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT}
                    size="sm"
                    className="w-full sm:max-w-[250px] sm:mx-auto text-xs h-7"
                  >
                    🔐 Processo e Senha
                  </Button>
                  {service.status === ServiceStatus.SUBMITTED && (
                    <p className="text-xs text-green-700 mt-1">✓ Proc: {service.processNumber}</p>
                  )}
                </div>
                  </>
                )}
              </TabsContent>
            </DialogBody>
          </Tabs>

          <DialogFooter>
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mini Modals */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-lg mb-3">Aprovar Documentos?</h3>
            <p className="text-sm text-gray-600 mb-4">Cliente receberá email de confirmação.</p>
            <div className="flex gap-2">
              <Button onClick={handleApprove} className="flex-1 bg-green-600 hover:bg-green-700">Confirmar</Button>
              <Button onClick={() => setShowApproveModal(false)} variant="outline" className="flex-1">Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {showAlmostModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-lg mb-3">Quase Lá</h3>
            <p className="text-sm text-gray-600 mb-2">Explique o que falta:</p>
            <textarea
              value={almostNote}
              onChange={(e) => setAlmostNote(e.target.value)}
              className="w-full border rounded p-2 text-sm mb-4"
              rows={3}
              placeholder="Ex: Falta certidão de nascimento..."
            />
            <div className="flex gap-2">
              <Button onClick={handleAlmost} className="flex-1">Enviar</Button>
              <Button onClick={() => setShowAlmostModal(false)} variant="outline" className="flex-1">Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {showIRNModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-lg mb-3">Dados do IRN</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Entidade (5 dígitos)</label>
                <Input
                  value={entity}
                  onChange={(e) => setEntity(e.target.value)}
                  placeholder="Ex: 12345"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Referência (9 dígitos)</label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex: 123 456 789"
                  maxLength={11}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Valor (€)</label>
                <Input value="200" disabled />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddIRN} className="flex-1 bg-green-600 hover:bg-green-700">Submeter</Button>
              <Button onClick={() => setShowIRNModal(false)} variant="outline" className="flex-1">Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {showProcessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-lg mb-3">Dados do Processo</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Número do Processo</label>
                <Input
                  value={processNumber}
                  onChange={(e) => setProcessNumber(e.target.value)}
                  placeholder="Ex: 2024/12345"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Senha</label>
                <Input
                  value={processPassword}
                  onChange={(e) => setProcessPassword(e.target.value)}
                  placeholder="Senha do processo"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSubmitProcess} className="flex-1 bg-green-600 hover:bg-green-700">Submeter</Button>
              <Button onClick={() => setShowProcessModal(false)} variant="outline" className="flex-1">Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
