# 📨 Sistema de Comunicações - Documentação Técnica

**Data:** 27 Outubro 2025
**Status:** 🟢 Implementado e em Produção (70%)
**Última Atualização:** Deploy completo VPS - 27 Out 2025 15:07

---

## 🎯 Objetivo

Criar um sistema de mensagens/chat entre **Advogada** e **Backoffice** para comunicação sobre processos de cidadania. Substituir a aba "Notas" por "Comunicações" no modal de detalhes do pedido.

---

## ✅ O Que Foi Implementado e Deployado

### 1. Tipos TypeScript (`src/lib/types.ts`)

```typescript
// Tipos adicionados (linhas 383-435):

export enum MessageType {
  SYSTEM = "system",
  USER = "user",
  LAWYER_REQUEST = "lawyer_request",      // Solicitação da advogada
  BACKOFFICE_RESPONSE = "backoffice_response", // Resposta do backoffice
}

export enum MessageStatus {
  UNREAD = "unread",
  READ = "read",
}

export interface Message {
  id: string;
  serviceId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  type: MessageType;
  content: string;
  status: MessageStatus;
  createdAt: Date | string;
  readAt?: Date | string | null;
  requestType?: "document" | "clarification" | "other";
  documentType?: DocumentType | string;
  metadata?: {
    actionType?: "approve" | "refuse" | "almost";
    previousStatus?: ServiceStatus | string;
    newStatus?: ServiceStatus | string;
  };
}

export interface Service {
  // ... campos existentes ...
  messages?: Message[]; // ✅ NOVO CAMPO ADICIONADO
}
```

### 2. Componente MessageThread (`src/components/MessageThread.tsx`)

**Status:** ✅ Completo e Deployado
**Funcionalidades:**
- Interface de chat estilo timeline
- Envio de mensagens com Enter (Shift+Enter para nova linha)
- Botões de tipo de solicitação para advogada (Documento, Esclarecimento, Outro)
- Indicador visual de mensagens não lidas
- Auto-scroll para última mensagem
- Diferenciação visual por role (cores diferentes)
- Ícones por tipo de mensagem

### 3. Componente NotificationPanel (`src/components/NotificationPanel.tsx`)

**Status:** ✅ Criado e Deployado (27 Out 2025)
**Funcionalidades:**
- Popup que aparece ao clicar no sino do header
- Lista todas as mensagens não lidas de todos os serviços
- Ordenadas por mais recentes primeiro
- Mostra informações do remetente (nome, role, timestamp)
- Exibe preview da mensagem
- Indica tipo de solicitação (documento, esclarecimento, outro)
- Ao clicar em uma notificação, abre o modal do serviço correspondente
- Layout responsivo com scroll interno
- Estado vazio amigável quando não há notificações

**Props:**
```typescript
interface NotificationPanelProps {
  services: Service[];
  currentUserId: string;
  onClose: () => void;
  onOpenService: (serviceId: string) => void;
}
```

### 4. Dashboard (`src/app/page.tsx`)

**Mudanças Implementadas:**

#### a) Estado e Controle do Popup (linha 52)
```typescript
const [showNotificationPanel, setShowNotificationPanel] = useState(false);
```

#### b) Cálculo de Serviços com Notificações (linhas 69-72)
```typescript
const servicesWithNotifications = useMemo(() => {
  return services.filter(service => getUnreadMessagesCount(service) > 0);
}, [services, user]);
```

#### c) Bell Icon Interativo (linhas 341-369)
```typescript
{/* Notifications Bell */}
<div className="relative">
  <button
    onClick={() => setShowNotificationPanel(!showNotificationPanel)}
    className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
    title={`${totalUnreadMessages} notificação${totalUnreadMessages !== 1 ? 'ões' : ''} não lida${totalUnreadMessages !== 1 ? 's' : ''}`}
  >
    <Bell className="w-5 h-5 text-gray-600" />
    {totalUnreadMessages > 0 && (
      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
        {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
      </span>
    )}
  </button>

  {/* Notification Panel Popup */}
  {showNotificationPanel && user && (
    <NotificationPanel
      services={services}
      currentUserId={user.id}
      onClose={() => setShowNotificationPanel(false)}
      onOpenService={(serviceId) => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
          setSelectedService(service as ServiceWithRelations);
        }
      }}
    />
  )}
</div>
```

#### d) Card de Comunicações Pendentes (linhas 229-237)
```typescript
{
  label: "Comunicações Pendentes",
  count: servicesWithNotifications.length,
  icon: <MessageSquare className="w-5 h-5" />,
  color: "bg-blue-100 text-blue-700",
  action: () => {
    setShowNotificationPanel(true);
  }
},
```

### 5. Modal de Detalhes (`src/components/pedidos/service-modal.tsx`)

**Alterações:**
- ✅ Linha 149: Tab renomeada de "Notas" para "Comunicações"
- ✅ TabContent atualizado (valor="comunicacoes")
- ⚠️ **Conteúdo ainda é placeholder** - integração MessageThread pendente

---

## 🚀 Deploy Realizado

### Build Local
```bash
npm run build
✓ Compiled successfully
Route (app)                              Size     First Load JS
┌ ○ /                                    26.6 kB         126 kB
```

### Commit
```bash
git add -A
git commit -m "feat: add notification panel and dashboard card

Implemented notification system enhancements:
- Created NotificationPanel component with popup display
- Added bell icon click handler to show/hide notification panel
- Added \"Comunicações Pendentes\" card to dashboard
- Notifications show unread messages from all services
- Click notification to open specific service modal
- Panel shows sender info, timestamp, and message preview

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```
**Commit ID:** 3f6ea11

### Deploy VPS (72.61.165.88)

**Sequência Executada:**
1. ✅ Git pull origin main
2. ✅ npm run build (produção)
3. ✅ Copiar arquivos estáticos (.next/static, public, src)
4. ✅ Reiniciar servidor Node.js (porta 3004)
5. ✅ Verificar servidor online
6. ✅ Teste HTTP: 200 OK

**URL de Acesso:** http://72.61.165.88:3004/backadmin

**Status:** 🟢 ONLINE e FUNCIONANDO

---

## 🔄 O Que Falta Implementar

### PASSO 1: Adicionar Mensagens Mock (RECOMENDADO)
**Arquivo:** `src/lib/mockData.ts`

Adicionar mensagens de exemplo em alguns serviços para testes visuais:

```typescript
// Exemplo de mensagens para o serviço s4 (João Pedro - Passo 7 Quase):
messages: [
  {
    id: "msg1",
    serviceId: "s4",
    senderId: "sys3", // Advogada
    senderName: "Dra. Ana Advogada",
    senderRole: UserRole.ADVOGADA,
    type: MessageType.LAWYER_REQUEST,
    content: "A certidão de nascimento está ilegível. Por favor, solicitar ao cliente uma nova cópia com melhor qualidade.",
    status: MessageStatus.UNREAD,
    createdAt: "2025-01-25T14:30:00Z",
    requestType: "document",
    documentType: DocumentType.BIRTH_CERTIFICATE,
  },
  {
    id: "msg2",
    serviceId: "s4",
    senderId: "sys2", // Backoffice
    senderName: "Patricia Backoffice",
    senderRole: UserRole.BACKOFFICE,
    type: MessageType.BACKOFFICE_RESPONSE,
    content: "Ok, vou contactar o cliente hoje ainda e solicitar novo documento.",
    status: MessageStatus.READ,
    createdAt: "2025-01-25T15:15:00Z",
  },
]
```

### PASSO 2: Integrar MessageThread no Modal
**Arquivo:** `src/components/pedidos/service-modal.tsx`

**Linha 360-362 - Substituir o placeholder por:**

```typescript
import { MessageThread } from "@/components/MessageThread";
import { CreateMessageInput, MessageType, MessageStatus } from "@/lib/types";

// Dentro do componente ServiceModal, adicionar handler:
const handleSendMessage = (input: CreateMessageInput) => {
  const { user } = useAuth();

  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    serviceId: service.id,
    senderId: user!.id,
    senderName: user!.fullName,
    senderRole: user!.role,
    type: input.type || MessageType.USER,
    content: input.content,
    status: MessageStatus.UNREAD,
    createdAt: new Date().toISOString(),
    requestType: input.requestType,
    documentType: input.documentType,
  };

  // Adicionar mensagem ao serviço
  updateService(service.id, {
    messages: [...(service.messages || []), newMessage]
  });
};

// Substituir o TabsContent:
<TabsContent value="comunicacoes">
  <MessageThread
    serviceId={service.id}
    messages={service.messages || []}
    onSendMessage={handleSendMessage}
  />
</TabsContent>
```

### PASSO 3: Conectar Formulário "Quase Lá"
**Arquivo:** `src/components/pedidos/service-modal.tsx`

**Função handleAlmost (linhas 71-83) - Modificar para criar mensagem:**

```typescript
const handleAlmost = () => {
  if (!almostNote.trim()) {
    alert("Explique o que falta");
    return;
  }

  // Criar mensagem da advogada
  const { user } = useAuth();
  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    serviceId: service.id,
    senderId: user!.id,
    senderName: user!.fullName,
    senderRole: user!.role,
    type: MessageType.LAWYER_REQUEST,
    content: almostNote,
    status: MessageStatus.UNREAD,
    createdAt: new Date().toISOString(),
    requestType: "other",
    metadata: {
      actionType: "almost",
      previousStatus: service.status,
      newStatus: ServiceStatus.STEP_7_ALMOST,
    }
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
```

### PASSO 4: Indicador de Mensagens Não Lidas na Tab
**Arquivo:** `src/components/pedidos/service-modal.tsx`

**Na linha 149, adicionar badge:**

```typescript
<TabsTrigger value="comunicacoes" icon="💬">
  Comunicações
  {service.messages && service.messages.some(m => m.status === MessageStatus.UNREAD && m.senderId !== user?.id) && (
    <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
      {service.messages.filter(m => m.status === MessageStatus.UNREAD && m.senderId !== user?.id).length}
    </span>
  )}
</TabsTrigger>
```

### PASSO 5: Marcar Mensagens como Lidas
**Arquivo:** `src/components/pedidos/service-modal.tsx`

**Adicionar useEffect para marcar mensagens como lidas:**

```typescript
// Quando a tab de comunicações é aberta
useEffect(() => {
  if (activeTab === "comunicacoes" && service.messages) {
    const { user } = useAuth();
    const unreadMessages = service.messages.filter(
      m => m.status === MessageStatus.UNREAD && m.senderId !== user?.id
    );

    if (unreadMessages.length > 0) {
      const updatedMessages = service.messages.map(m =>
        m.status === MessageStatus.UNREAD && m.senderId !== user?.id
          ? { ...m, status: MessageStatus.READ, readAt: new Date().toISOString() }
          : m
      );

      updateService(service.id, { messages: updatedMessages });
    }
  }
}, [activeTab, service.id]);
```

---

## 🧪 Como Testar

1. **Abrir aplicação:** http://72.61.165.88:3004/backadmin
2. **Fazer login** (qualquer usuário do mockSystemUsers)
3. **Verificar dashboard:**
   - Card "Comunicações Pendentes" aparece
   - Badge vermelho no sino (se houver mensagens não lidas)
4. **Clicar no sino:**
   - Popup aparece com lista de notificações
   - Mensagens ordenadas por mais recentes
   - Informações do remetente visíveis
5. **Clicar em uma notificação:**
   - Modal do serviço abre
   - Tab "Comunicações" está disponível (ainda com placeholder)
6. **Clicar no card "Comunicações Pendentes":**
   - Popup também abre

---

## 📁 Arquivos Modificados/Criados

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `src/lib/types.ts` | ✅ Completo | Tipos Message, MessageType, MessageStatus |
| `src/components/MessageThread.tsx` | ✅ Criado | Componente de chat |
| `src/components/NotificationPanel.tsx` | ✅ Criado | Popup de notificações |
| `src/app/page.tsx` | ✅ Completo | Bell icon + popup + card dashboard |
| `src/components/pedidos/service-modal.tsx` | 🟡 Parcial | Tab renomeada, falta integrar |
| `src/lib/mockData.ts` | ❌ Pendente | Adicionar mensagens mock |

---

## 🚀 Próximos Passos (Ordem Recomendada)

1. ✅ **Testar sistema de notificações em produção**
2. 🟡 **Adicionar mensagens mock** em 2-3 serviços para testes visuais
3. 🟡 **Integrar MessageThread** na tab Comunicações do modal
4. 🟡 **Conectar formulário "Quase Lá"** para criar mensagens
5. 🟡 **Adicionar indicador** de não lidas na tab
6. 🟡 **Adicionar lógica** para marcar mensagens como lidas
7. ✅ **Deploy final** após todos os passos

---

## ⚠️ Notas Importantes

- **Deployment:** Sistema de notificações 100% funcional e online
- **URLs:** http://72.61.165.88:3004/backadmin
- **Performance:** Build otimizado (126 kB First Load JS)
- **Git:** Commit 3f6ea11 pushed to main
- **Servidor:** Porta 3004, Status 200 OK
- **NÃO modificar** nada fora desses arquivos para não quebrar funcionalidades existentes
- **Testar localmente** antes de fazer deploy de mudanças futuras
- **useAuth()** já existe no modal - reutilizar
- **updateService()** já existe no modal - reutilizar

---

## 🔗 Contexto Adicional

**Sistema existente:**
- ServicesContext gerencia estado dos serviços
- AuthContext gerencia usuário logado e permissões
- mockData.ts tem 15 serviços de exemplo
- Modal service-modal.tsx já tem tabs funcionando (Dados, Documentos, Timeline, Ações)

**Workflow "Quase Lá" (desejado):**
1. Advogada clica "⚠️ Quase Lá"
2. Abre popup com textarea
3. Advogada escreve o que falta
4. Salva em `almostJustification` **E cria mensagem**
5. Muda status para `STEP_7_ALMOST`
6. Backoffice vê notificação no sino
7. Backoffice responde no chat
8. Histórico fica salvo como timeline

---

**Status Final:** 🟢 Sistema de Notificações Deployado e Funcionando
**Progresso Total:** 70% (Popup e Dashboard completos, falta integração do chat no modal)

**FIM DA DOCUMENTAÇÃO**
