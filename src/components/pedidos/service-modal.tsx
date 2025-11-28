"use client";

import { useState, useEffect, useRef, memo } from "react";
import { ServiceWithRelations, ServiceStatus, Permission, CreateMessageInput, Message, MessageType, MessageStatus } from "@/lib/types";
import { useServices } from "@/contexts/ServicesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useService } from "@/hooks/services/useService";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/pedidos/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MessageThread } from "@/components/MessageThread";
import { FileText, File, MessageSquare, Zap, Calendar, Pencil, Save, X, Check, Clock, Paperclip, AlertTriangle, Plus, RefreshCw, Scale, Banknote, Building, Send, User, Upload, FileCheck, CreditCard, UserCheck, Loader2, ExternalLink, MoreHorizontal, Trash2, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

interface ServiceModalProps {
  service: ServiceWithRelations;
  open: boolean;
  onClose: () => void;
}

export const ServiceModal = memo(function ServiceModal({ service: initialService, open, onClose }: ServiceModalProps) {
  const { getService, updateService } = useServices();

  // Buscar detalhes completos do serviço (incluindo documentos) quando modal abre
  const { data: serviceDetail, isLoading: isLoadingDetails } = useService(open ? initialService.id : undefined);

  // Ref para evitar re-renders desnecessários no useEffect
  const updateServiceRef = useRef(updateService);
  updateServiceRef.current = updateService;
  const { user, hasPermission } = useAuth();

  // Priorizar dados do contexto (para atualizações locais como messages)
  // mas usar dados da API para documentos (que só vêm no endpoint de detalhe)
  const contextService = getService(initialService.id);
  const service = {
    ...(contextService || initialService),
    // Sobrescrever documentos com os dados da API detalhada (se disponível)
    documents: serviceDetail?.service?.documents || contextService?.documents || initialService.documents || [],
    documentsAttorney: serviceDetail?.service?.documentsAttorney || contextService?.documentsAttorney || initialService.documentsAttorney || [],
  };

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
    toast.success("Dados atualizados!");
  };

  const handleApprove = () => {
    updateService(service.id, { status: ServiceStatus.STEP_7_APPROVED });
    setShowApproveModal(false);
    toast.success("Documentos aprovados!");
  };

  const handleAlmost = () => {
    if (!almostNote.trim()) {
      toast.error("Explique o que falta");
      return;
    }

    if (!user) {
      toast.error("Erro: usuário não autenticado");
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
    toast.success("Status alterado e mensagem enviada ao backoffice");
  };

  const handleSendMessage = (input: CreateMessageInput) => {
    if (!user) {
      toast.error("Erro: usuário não autenticado");
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
      toast.error("Preencha Entidade e Referência");
      return;
    }
    updateService(service.id, {
      entity,
      reference,
      status: ServiceStatus.STEP_8
    });
    setShowIRNModal(false);
    toast.success("Dados do IRN inseridos!");
  };

  const handleConfirmGovernment = () => {
    updateService(service.id, {
      status: ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT,
      isPaidGovernment: true,
      paidGovernmentAt: new Date().toISOString()
    });
    toast.success("Pagamento confirmado pelo governo!");
  };

  const handleSubmitProcess = () => {
    if (!processNumber || !processPassword) {
      toast.error("Preencha Número e Senha");
      return;
    }
    updateService(service.id, {
      processNumber,
      processPassword,
      status: ServiceStatus.SUBMITTED,
      submissionDate: new Date().toISOString()
    });
    setShowProcessModal(false);
    toast.success("Processo submetido!");
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-4xl flex flex-col p-0 overflow-hidden">
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-start justify-between pr-8">
              <div>
                <SheetTitle>{service.user?.fullName || 'N/A'}</SheetTitle>
                <p className="text-sm text-muted-foreground mt-1">{service.user?.email || 'N/A'}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="secondary" className="text-xs hidden sm:inline-flex" title={service.id}>
                  {service.id.slice(0, 8)}...
                </Badge>
                <StatusBadge status={service.status} />
              </div>
            </div>
          </SheetHeader>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mx-6 mt-4 bg-muted">
              <TabsTrigger value="dados" className="gap-1.5"><FileText className="h-4 w-4" />Dados</TabsTrigger>
              <TabsTrigger value="documentos" className="gap-1.5"><File className="h-4 w-4" />Documentos</TabsTrigger>
              <TabsTrigger value="timeline" className="gap-1.5"><Calendar className="h-4 w-4" />Histórico</TabsTrigger>
              <TabsTrigger value="comunicacoes" className="gap-1.5">
                <MessageSquare className="h-4 w-4" />
                Comunicações
                {service.messages && service.messages.some(m => m.status === MessageStatus.UNREAD && m.senderId !== user?.id) && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                    {service.messages.filter(m => m.status === MessageStatus.UNREAD && m.senderId !== user?.id).length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="acoes" className="gap-1.5"><Zap className="h-4 w-4" />Ações</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-6">
              {/* TAB: Dados */}
              <TabsContent value="dados" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Dados do Requerente</h3>
                  {/* Only users with EDIT_SERVICE permission can edit */}
                  {hasPermission(Permission.EDIT_SERVICE) && (
                    !isEditingClient ? (
                      <Button onClick={() => setIsEditingClient(true)} size="sm" variant="outline" className="gap-1.5">
                        <Pencil className="h-4 w-4" /> Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleSaveClientEdit} size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700">
                          <Save className="h-4 w-4" /> Salvar
                        </Button>
                        <Button onClick={() => setIsEditingClient(false)} size="sm" variant="outline" className="gap-1.5">
                          <X className="h-4 w-4" /> Cancelar
                        </Button>
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  {isEditingClient ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-xs text-muted-foreground">Nome</Label>
                        <Input
                          id="firstName"
                          value={editableClient.firstName}
                          onChange={(e) => setEditableClient({...editableClient, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-xs text-muted-foreground">Sobrenome</Label>
                        <Input
                          id="lastName"
                          value={editableClient.lastName}
                          onChange={(e) => setEditableClient({...editableClient, lastName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profession" className="text-xs text-muted-foreground">Profissão</Label>
                        <Input
                          id="profession"
                          value={editableClient.profession}
                          onChange={(e) => setEditableClient({...editableClient, profession: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nationality" className="text-xs text-muted-foreground">Nacionalidade</Label>
                        <Input
                          id="nationality"
                          value={editableClient.nationality}
                          onChange={(e) => setEditableClient({...editableClient, nationality: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate" className="text-xs text-muted-foreground">Data Nascimento</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={editableClient.birthDate ? new Date(editableClient.birthDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => setEditableClient({...editableClient, birthDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fatherFullName" className="text-xs text-muted-foreground">Pai</Label>
                        <Input
                          id="fatherFullName"
                          value={editableClient.fatherFullName}
                          onChange={(e) => setEditableClient({...editableClient, fatherFullName: e.target.value})}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="motherFullName" className="text-xs text-muted-foreground">Mãe</Label>
                        <Input
                          id="motherFullName"
                          value={editableClient.motherFullName}
                          onChange={(e) => setEditableClient({...editableClient, motherFullName: e.target.value})}
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
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Dados dos Pais</p>
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
                    <div><span className="font-medium">Taxa Paga:</span> {service.isPaidTax ? <Check className="inline h-4 w-4 text-green-600" /> : <X className="inline h-4 w-4 text-red-600" />}</div>
                    <div><span className="font-medium">Governo:</span> {service.isPaidGovernment ? <Check className="inline h-4 w-4 text-green-600" /> : <X className="inline h-4 w-4 text-red-600" />}</div>
                    {service.paymentReferenceId && (
                      <div><span className="font-medium">Ref. Pagamento:</span> {service.paymentReferenceId}</div>
                    )}
                    {service.documentPromotion !== null && service.documentPromotion !== undefined && (
                      <div><span className="font-medium">Promoção Docs:</span> {service.documentPromotion ? <Check className="inline h-4 w-4 text-green-600" /> : <X className="inline h-4 w-4 text-red-600" />}</div>
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
                  <h3 className="font-semibold flex items-center gap-2">
                    Documentos ({service.documents?.length || 0})
                    {isLoadingDetails && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </h3>
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
                            toast.success(`${files.length} arquivo(s) adicionado(s)!`);
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
                        <Paperclip className="h-4 w-4 mr-1" /> Adicionar Documentos
                      </Button>
                    </div>
                  )}
                </div>
                {service.documents && service.documents.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Documento</TableHead>
                          <TableHead className="hidden sm:table-cell">Número</TableHead>
                          <TableHead className="hidden sm:table-cell">Validade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {service.documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate" title={doc.title || doc.name}>
                                    {doc.title || doc.name}
                                  </p>
                                  {doc.uploadedAt && (
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(doc.uploadedAt)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                              {doc.number || '-'}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                              {doc.expiresAt ? formatDate(doc.expiresAt) : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={doc.approved ? "default" : "secondary"} className={doc.approved ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}>
                                {doc.approved ? 'Aprovado' : 'Pendente'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {hasPermission(Permission.VIEW_DOCUMENTS) && doc.url && (
                                    <DropdownMenuItem onClick={() => window.open(doc.url, '_blank')}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Ver documento
                                    </DropdownMenuItem>
                                  )}
                                  {hasPermission(Permission.VIEW_DOCUMENTS) && doc.url && (
                                    <DropdownMenuItem onClick={() => {
                                      const a = document.createElement('a');
                                      a.href = doc.url;
                                      a.download = doc.name || 'documento';
                                      a.click();
                                    }}>
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Baixar
                                    </DropdownMenuItem>
                                  )}
                                  {hasPermission(Permission.DELETE_DOCUMENTS) && (
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => {
                                        if (confirm(`Remover ${doc.name}?`)) {
                                          updateService(service.id, {
                                            documents: service.documents?.filter(d => d.id !== doc.id)
                                          });
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Remover
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : isLoadingDetails ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Carregando documentos...</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    Nenhum documento anexado.<br/>
                    Clique em "Adicionar Documentos" para enviar arquivos.
                  </p>
                )}
              </TabsContent>

              {/* TAB: Histórico */}
              <TabsContent value="timeline">
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {(() => {
                    // Mapa de ícones
                    const iconMap: Record<string, React.ReactNode> = {
                      plus: <Plus className="h-5 w-5" />,
                      refresh: <RefreshCw className="h-5 w-5" />,
                      scale: <Scale className="h-5 w-5" />,
                      message: <MessageSquare className="h-5 w-5" />,
                      file: <File className="h-5 w-5" />,
                      fileText: <FileText className="h-5 w-5" />,
                      banknote: <Banknote className="h-5 w-5" />,
                      building: <Building className="h-5 w-5" />,
                      upload: <Upload className="h-5 w-5" />,
                      user: <User className="h-5 w-5" />,
                      pencil: <Pencil className="h-5 w-5" />,
                    };

                    // Agregação de todos os eventos do processo
                    const events: Array<{ date: Date; description: string; icon: string; color: string }> = [];

                    // Criação do processo
                    if (service.createdAt) {
                      events.push({
                        date: new Date(service.createdAt),
                        description: "Processo criado",
                        icon: "plus",
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
                            icon: "refresh",
                            color: "purple"
                          });
                        }

                        // Mensagens da advogada
                        if (msg.type === MessageType.LAWYER_REQUEST) {
                          events.push({
                            date: new Date(msg.createdAt),
                            description: `Solicitação da advogada: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`,
                            icon: "scale",
                            color: "yellow"
                          });
                        }

                        // Respostas do backoffice
                        if (msg.type === MessageType.BACKOFFICE_RESPONSE) {
                          events.push({
                            date: new Date(msg.createdAt),
                            description: `Resposta do backoffice: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`,
                            icon: "message",
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
                          icon: "file",
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
                          icon: "fileText",
                          color: "violet"
                        });
                      });
                    }

                    // Pagamentos
                    if (service.paidTaxAt) {
                      events.push({
                        date: new Date(service.paidTaxAt),
                        description: "Taxa paga",
                        icon: "banknote",
                        color: "green"
                      });
                    }

                    if (service.paidGovernmentAt) {
                      events.push({
                        date: new Date(service.paidGovernmentAt),
                        description: "Pagamento ao governo confirmado",
                        icon: "building",
                        color: "green"
                      });
                    }

                    // Submissão do processo
                    if (service.submissionDate) {
                      events.push({
                        date: new Date(service.submissionDate),
                        description: "Processo submetido",
                        icon: "upload",
                        color: "cyan"
                      });
                    }

                    // Atribuição
                    if (service.assignedAt) {
                      events.push({
                        date: new Date(service.assignedAt),
                        description: "Processo atribuído",
                        icon: "user",
                        color: "gray"
                      });
                    }

                    // Última atualização
                    if (service.updatedAt && service.updatedAt !== service.createdAt) {
                      events.push({
                        date: new Date(service.updatedAt),
                        description: "Processo atualizado",
                        icon: "pencil",
                        color: "gray"
                      });
                    }

                    // Ordenar por data (mais recente primeiro)
                    events.sort((a, b) => b.date.getTime() - a.date.getTime());

                    // Renderizar lista de eventos
                    if (events.length === 0) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">Nenhum evento registrado ainda</p>
                        </div>
                      );
                    }

                    return events.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border-l-4 rounded hover:bg-muted transition-colors"
                        style={{ borderLeftColor: `var(--${event.color}-500)` }}
                      >
                        <span className="flex-shrink-0 text-muted-foreground">{iconMap[event.icon]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{event.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
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
                    <p className="text-sm font-medium text-yellow-800 flex items-center justify-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Você não tem permissão para alterar o status dos processos
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Apenas usuários com permissão adequada podem realizar ações no workflow.
                    </p>
                  </div>
                ) : (
                  <>
                {/* Passo 1 */}
                <Card className="p-3">
                  <CardContent className="p-0 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8 ? 'bg-green-500 text-white' : 'bg-muted'
                      }`}>
                        {service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8 ? <Check className="h-3 w-3" /> : '1'}
                      </div>
                      <h4 className="font-semibold text-sm">Revisão de Documentos</h4>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowApproveModal(true)}
                        disabled={service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-xs h-8"
                      >
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => setShowAlmostModal(true)}
                        disabled={service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8}
                        size="sm"
                        variant="secondary"
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs h-8"
                      >
                        Quase Lá
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Passo 2 */}
                <Card className="p-3">
                  <CardContent className="p-0 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        service.status === ServiceStatus.STEP_8 || service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ? 'bg-green-500 text-white' : 'bg-muted'
                      }`}>
                        {service.status === ServiceStatus.STEP_8 || service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ? <Check className="h-3 w-3" /> : '2'}
                      </div>
                      <h4 className="font-semibold text-sm">Inserir Dados IRN</h4>
                    </div>
                    <Button
                      onClick={() => setShowIRNModal(true)}
                      disabled={service.status !== ServiceStatus.STEP_7_APPROVED}
                      size="sm"
                      className="w-full sm:max-w-[250px] sm:mx-auto text-xs h-8"
                    >
                      Dados IRN
                    </Button>
                    {service.entity && (
                      <p className="text-xs text-green-700">Ent: {service.entity} | Ref: {service.reference}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Passo 3 */}
                <Card className="p-3">
                  <CardContent className="p-0 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ? 'bg-green-500 text-white' : service.status === ServiceStatus.STEP_8 ? 'bg-yellow-500 text-white animate-pulse' : 'bg-muted'
                      }`}>
                        {service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ? <Check className="h-3 w-3" /> : '3'}
                      </div>
                      <h4 className="font-semibold text-sm">Cliente Pagar (€250)</h4>
                    </div>
                    {service.status === ServiceStatus.STEP_8 && (
                      <div className="space-y-2">
                        <p className="text-xs text-yellow-700">Aguardando pagamento...</p>
                        <Button
                          onClick={() => {
                            updateService(service.id, { status: ServiceStatus.STEP_8_CLIENT_CONFIRMED });
                            toast.success("Pagamento simulado");
                          }}
                          size="sm"
                          variant="outline"
                          className="w-full sm:max-w-[250px] sm:mx-auto text-xs h-8"
                        >
                          Simular Pagamento
                        </Button>
                      </div>
                    )}
                    {service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED && (
                      <p className="text-xs text-green-700">Cliente confirmou pagamento</p>
                    )}
                  </CardContent>
                </Card>

                {/* Passo 4 */}
                <Card className="p-3">
                  <CardContent className="p-0 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ? 'bg-green-500 text-white' : 'bg-muted'
                      }`}>
                        {service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ? <Check className="h-3 w-3" /> : '4'}
                      </div>
                      <h4 className="font-semibold text-sm">Confirmar Governo</h4>
                    </div>
                    <Button
                      onClick={handleConfirmGovernment}
                      disabled={service.status !== ServiceStatus.STEP_8_CLIENT_CONFIRMED}
                      size="sm"
                      className="w-full sm:max-w-[250px] sm:mx-auto bg-green-600 hover:bg-green-700 text-xs h-8"
                    >
                      Governo Confirmou
                    </Button>
                  </CardContent>
                </Card>

                {/* Passo 5 */}
                <Card className="p-3">
                  <CardContent className="p-0 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        service.status === ServiceStatus.SUBMITTED ? 'bg-green-500 text-white' : 'bg-muted'
                      }`}>
                        {service.status === ServiceStatus.SUBMITTED ? <Check className="h-3 w-3" /> : '5'}
                      </div>
                      <h4 className="font-semibold text-sm">Inserir Processo e Senha</h4>
                    </div>
                    <Button
                      onClick={() => setShowProcessModal(true)}
                      disabled={service.status !== ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT}
                      size="sm"
                      className="w-full sm:max-w-[250px] sm:mx-auto text-xs h-8"
                    >
                      Processo e Senha
                    </Button>
                    {service.status === ServiceStatus.SUBMITTED && (
                      <p className="text-xs text-green-700">Proc: {service.processNumber}</p>
                    )}
                  </CardContent>
                </Card>
                  </>
                )}
              </TabsContent>
            </div>
          </Tabs>

          <SheetFooter className="px-6 py-4 border-t">
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Mini Modals */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Aprovar Documentos?</DialogTitle>
            <DialogDescription>
              Cliente receberá email de confirmação.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button onClick={handleApprove} className="flex-1 bg-green-600 hover:bg-green-700">
              Confirmar
            </Button>
            <Button onClick={() => setShowApproveModal(false)} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAlmostModal} onOpenChange={setShowAlmostModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Quase Lá</DialogTitle>
            <DialogDescription>
              Explique o que falta para o cliente:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="almost-note">Nota</Label>
            <Textarea
              id="almost-note"
              value={almostNote}
              onChange={(e) => setAlmostNote(e.target.value)}
              rows={3}
              placeholder="Ex: Falta certidão de nascimento..."
            />
          </div>
          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button onClick={handleAlmost} className="flex-1">Enviar</Button>
            <Button onClick={() => setShowAlmostModal(false)} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showIRNModal} onOpenChange={setShowIRNModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Dados do IRN</DialogTitle>
            <DialogDescription>
              Preencha os dados de pagamento do IRN.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entity">Entidade (5 dígitos)</Label>
              <Input
                id="entity"
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                placeholder="Ex: 12345"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Referência (9 dígitos)</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: 123 456 789"
                maxLength={11}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Valor (€)</Label>
              <Input id="value" value="200" disabled />
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button onClick={handleAddIRN} className="flex-1 bg-green-600 hover:bg-green-700">
              Submeter
            </Button>
            <Button onClick={() => setShowIRNModal(false)} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showProcessModal} onOpenChange={setShowProcessModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Dados do Processo</DialogTitle>
            <DialogDescription>
              Insira o número do processo e senha.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="process-number">Número do Processo</Label>
              <Input
                id="process-number"
                value={processNumber}
                onChange={(e) => setProcessNumber(e.target.value)}
                placeholder="Ex: 2024/12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="process-password">Senha</Label>
              <Input
                id="process-password"
                value={processPassword}
                onChange={(e) => setProcessPassword(e.target.value)}
                placeholder="Senha do processo"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button onClick={handleSubmitProcess} className="flex-1 bg-green-600 hover:bg-green-700">
              Submeter
            </Button>
            <Button onClick={() => setShowProcessModal(false)} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
