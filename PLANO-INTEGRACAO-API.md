# 🔗 Plano de Integração - API Luzio → Backadmin

**Data:** 04 Novembro 2025
**Versão:** v1.0
**Status:** 📋 Planejamento

---

## 🎯 Objetivo

Substituir os dados mock (100 pedidos fictícios) pela API real do luzio-api em staging, mantendo todas as funcionalidades existentes do backadmin.

---

## 📊 Estado Atual vs Futuro

### Estado Atual (Mock)
- ✅ 100 pedidos gerados localmente
- ✅ Dados em `lib/mockDataGenerated.ts`
- ✅ Schema 100% compatível com Prisma
- ✅ Todas funcionalidades implementadas
- ❌ Sem autenticação real
- ❌ Sem persistência de dados

### Estado Futuro (API Real)
- ✅ 1.037+ serviços reais
- ✅ API de Operadores autenticada
- ✅ Persistência no banco de dados
- ✅ Paginação backend
- ✅ Filtros avançados
- ✅ Integração completa

---

## 🗺️ Roadmap de Integração

### **FASE 1: Autenticação** (Estimativa: 2-3h)

#### 1.1. Criar Serviço de API
**Arquivo:** `src/lib/api/operatorApi.ts`

```typescript
// Configuração base
const API_BASE_URL = 'https://api.lusio.staging.goldenclouddev.com.br';

// Funções principais
- login(email, password)
- refreshToken()
- logout()
- getCurrentOperator()
```

**Features:**
- ✅ Axios interceptors para token automático
- ✅ Refresh token automático
- ✅ Error handling
- ✅ TypeScript types

#### 1.2. Criar Context de Autenticação
**Arquivo:** `src/contexts/AuthContext.tsx`

```typescript
interface AuthContextData {
  operator: Operator | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

**Persistência:**
- Token no `localStorage`
- Refresh automático ao recarregar página
- Logout automático se token expirar

#### 1.3. Criar Página de Login
**Arquivo:** `src/app/login/page.tsx`

**UI:**
- Logo Lusio
- Form: Email + Password
- Botão "Esqueci minha senha"
- Loading states
- Mensagens de erro

**Validações:**
- Email válido
- Senha mínima
- Feedback visual

#### 1.4. Proteger Rotas
**Arquivo:** `src/middleware.ts` ou `src/components/ProtectedRoute.tsx`

```typescript
// Middleware Next.js
export function middleware(request: NextRequest) {
  const token = request.cookies.get('operator_token');

  if (!token && !request.url.includes('/login')) {
    return NextResponse.redirect('/login');
  }
}
```

**Rotas protegidas:**
- `/` (dashboard)
- `/pedidos/*`
- `/configuracoes`

**Rota pública:**
- `/login`

---

### **FASE 2: Hooks da API** (Estimativa: 3-4h)

#### 2.1. Criar Hooks Customizados
**Arquivo:** `src/hooks/useOperatorApi.ts`

**Hooks principais:**

```typescript
// Serviços
export function useServices(page: number, limit: number) {
  return useQuery(['services', page, limit], () =>
    operatorApi.getServices(page, limit)
  );
}

export function useService(id: string) {
  return useQuery(['service', id], () =>
    operatorApi.getService(id)
  );
}

export function useUpdateService(id: string) {
  return useMutation((data) =>
    operatorApi.updateService(id, data)
  );
}

// Viabilidades
export function useViabilities(filters) {
  return useQuery(['viabilities', filters], () =>
    operatorApi.getViabilities(filters)
  );
}

// Problemas
export function useProblems(filters) {
  return useQuery(['problems', filters], () =>
    operatorApi.getProblems(filters)
  );
}
```

**Configuração React Query:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 10, // 10 minutos
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
});
```

#### 2.2. Criar Serviço de API Completo
**Arquivo:** `src/lib/api/operatorApi.ts`

**Métodos:**

```typescript
class OperatorApiService {
  // Autenticação
  async login(email: string, password: string)
  async resetPassword(email: string)
  async resetPasswordWithToken(token: string, password: string)

  // Serviços
  async getServices(page: number, limit: number)
  async getService(id: string)
  async updateService(id: string, data: any)

  // Viabilidades
  async getViabilities(filters: ViabilityFilters)

  // Problemas
  async getProblems(filters: ProblemFilters)

  // Operadores
  async createOperator(data: CreateOperatorDTO)
  async updateOperator(id: string, data: UpdateOperatorDTO)
}
```

---

### **FASE 3: Migração de Componentes** (Estimativa: 4-5h)

#### 3.1. Dashboard Principal
**Arquivo:** `src/app/page.tsx`

**Mudanças:**

```typescript
// ANTES (Mock)
import { mockServices } from '@/lib/mockData';
const services = mockServices;

// DEPOIS (API)
import { useServices } from '@/hooks/useOperatorApi';
const { data, isLoading, error } = useServices(currentPage, pageSize);
const services = data?.services || [];
```

**Adicionar:**
- Loading skeleton
- Error boundary
- Empty states
- Paginação real (backend)

#### 3.2. Lista de Pedidos
**Componente:** Mesma mudança do dashboard

**Adicionar:**
- Filtros sincronizados com backend
- Busca em tempo real
- Ordenação via API

#### 3.3. Detalhes do Pedido
**Arquivo:** `src/app/pedidos/[id]/page.tsx`

```typescript
// ANTES
const service = mockServices.find(s => s.id === params.id);

// DEPOIS
const { data: serviceData, isLoading } = useService(params.id);
const service = serviceData?.service;
```

**Adicionar:**
- Loading de detalhes
- Refresh manual
- Otimistic updates

#### 3.4. Ações do Advogado
**Componente:** `LawyerActions.tsx`

```typescript
const { mutate: updateService } = useUpdateService(service.id);

const handleApprove = async (data) => {
  await updateService({
    status: 'aprovado',
    processNumber: data.processNumber,
    // ... outros campos
  });
};
```

**Adicionar:**
- Loading states em botões
- Success/error feedback
- Invalidação de cache

---

### **FASE 4: Paginação e Filtros** (Estimativa: 2-3h)

#### 4.1. Paginação Backend
**Implementar:**

```typescript
interface PaginationResponse {
  services: Service[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**UI:**
- Botões Previous/Next
- Seletor de página
- Total de registros
- Items per page

#### 4.2. Filtros Avançados
**API suporta:**
- ❓ Status (precisa confirmar se API suporta)
- ❓ Datas (precisa confirmar)
- ❓ Busca por nome/email (precisa confirmar)

**Nota:** Atualmente a API só tem `page` e `limit`. Pode precisar:
1. Fazer filtragem no frontend
2. Solicitar novos query params ao backend

---

### **FASE 5: Novas Funcionalidades** (Estimativa: 3-4h)

#### 5.1. Gestão de Viabilidades
**Nova Página:** `src/app/viabilidades/page.tsx`

**Features:**
- Listagem com filtros
- Status: approved, pending, rejected
- Filtro por email
- Paginação

#### 5.2. Gestão de Problemas
**Nova Página:** `src/app/problemas/page.tsx`

**Features:**
- Listagem de problemas
- Filtro por serviço
- Filtro por resumo
- Link para serviço relacionado

---

### **FASE 6: Testes e Deploy** (Estimativa: 2-3h)

#### 6.1. Testes de Integração
**Checklist:**
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Token refresh automático
- [ ] Listagem de serviços
- [ ] Detalhes de serviço
- [ ] Edição de serviço
- [ ] Paginação
- [ ] Filtros
- [ ] Loading states
- [ ] Error states
- [ ] Mobile responsive

#### 6.2. Deploy para Dev
**Processo:**
1. Commit mudanças
2. Push para branch `dev`
3. Deploy via script
4. Testar em https://dev.lusio.market/backadmin
5. Validar com credenciais reais

---

## 📁 Estrutura de Arquivos Novos

```
src/
├── lib/
│   └── api/
│       ├── operatorApi.ts          # ⭐ NOVO - Serviço de API
│       └── axiosConfig.ts          # ⭐ NOVO - Configuração Axios
│
├── contexts/
│   └── AuthContext.tsx             # ⭐ NOVO - Context de autenticação
│
├── hooks/
│   ├── useOperatorApi.ts           # ⭐ NOVO - Hooks customizados
│   └── useAuth.ts                  # ⭐ NOVO - Hook de autenticação
│
├── app/
│   ├── login/
│   │   └── page.tsx                # ⭐ NOVO - Página de login
│   │
│   ├── viabilidades/               # ⭐ NOVO - Gestão de viabilidades
│   │   └── page.tsx
│   │
│   └── problemas/                  # ⭐ NOVO - Gestão de problemas
│       └── page.tsx
│
├── types/
│   └── operator.ts                 # ⭐ NOVO - Types da API
│
└── middleware.ts                   # ⭐ NOVO - Proteção de rotas
```

---

## 🔄 Arquivos que Serão Modificados

```
src/
├── app/
│   ├── page.tsx                    # 🔄 Substituir mock por API
│   └── pedidos/[id]/
│       ├── page.tsx                # 🔄 Substituir mock por API
│       └── components/
│           └── LawyerActions.tsx   # 🔄 Adicionar mutations
│
├── lib/
│   ├── api.ts                      # 🔄 Adaptar para novo serviço
│   └── types.ts                    # 🔄 Adicionar types da API
│
└── providers/
    └── QueryProvider.tsx           # 🔄 Configurar cache
```

---

## 🚨 Pontos de Atenção

### 1. **Diferenças de Schema**
- **Mock:** Usa exatamente o schema Prisma
- **API Real:** Retorna alguns campos a mais/menos

**Solução:** Criar adapter/transformer para normalizar dados

### 2. **Paginação**
- **Mock:** Paginação frontend (todos dados carregados)
- **API Real:** Paginação backend (100 itens por vez)

**Solução:** Implementar paginação completa no UI

### 3. **Filtros**
- **Mock:** Filtros no frontend (JavaScript)
- **API Real:** Precisa verificar quais filtros a API suporta

**Solução:**
- Opção A: Fazer filtros no frontend (menos eficiente)
- Opção B: Solicitar ao backend adicionar query params

### 4. **Performance**
- **Mock:** Instantâneo (dados locais)
- **API Real:** Network requests (latência)

**Solução:**
- Loading skeletons
- React Query cache
- Optimistic updates

### 5. **Autenticação**
- **Mock:** Sem autenticação
- **API Real:** JWT com expiração de 24h

**Solução:**
- Interceptors para refresh automático
- Redirect para login se expirar
- Persistir token no localStorage

---

## 📝 Variáveis de Ambiente

Criar arquivo `.env.local`:

```bash
# API
NEXT_PUBLIC_API_BASE_URL=https://api.lusio.staging.goldenclouddev.com.br

# Auth
NEXT_PUBLIC_TOKEN_STORAGE_KEY=operator_token
NEXT_PUBLIC_TOKEN_EXPIRY_HOURS=24

# Features
NEXT_PUBLIC_ENABLE_VIABILITIES=true
NEXT_PUBLIC_ENABLE_PROBLEMS=true
```

---

## 🎯 Ordem de Implementação Recomendada

### **Semana 1: Base**
1. ✅ Criar serviço de API (`operatorApi.ts`)
2. ✅ Implementar autenticação (`AuthContext.tsx`)
3. ✅ Criar página de login
4. ✅ Proteger rotas

### **Semana 2: Integração Principal**
5. ✅ Criar hooks customizados
6. ✅ Migrar dashboard para API
7. ✅ Migrar listagem de pedidos
8. ✅ Migrar detalhes de pedidos

### **Semana 3: Features Avançadas**
9. ✅ Implementar paginação backend
10. ✅ Implementar filtros
11. ✅ Adicionar gestão de viabilidades
12. ✅ Adicionar gestão de problemas

### **Semana 4: Testes e Deploy**
13. ✅ Testes de integração completos
14. ✅ Deploy em dev
15. ✅ Testes em staging
16. ✅ Documentação final

---

## 📊 Checklist de Migração

### Autenticação
- [ ] Serviço de API criado
- [ ] Context de autenticação implementado
- [ ] Página de login funcional
- [ ] Proteção de rotas ativa
- [ ] Refresh token automático
- [ ] Logout funcional

### Dashboard
- [ ] Listagem via API
- [ ] Loading states
- [ ] Error handling
- [ ] Paginação backend
- [ ] Filtros funcionais
- [ ] Cache otimizado

### Detalhes
- [ ] Busca por ID via API
- [ ] Loading skeleton
- [ ] Error boundary
- [ ] Refresh manual
- [ ] Optimistic updates

### Ações
- [ ] Edição via API
- [ ] Loading em botões
- [ ] Success feedback
- [ ] Error feedback
- [ ] Invalidação de cache

### Novas Features
- [ ] Gestão de viabilidades
- [ ] Gestão de problemas
- [ ] Paginação avançada
- [ ] Filtros avançados

### Deploy
- [ ] Testes locais passando
- [ ] Deploy em dev
- [ ] Testes em staging
- [ ] Documentação atualizada
- [ ] README atualizado

---

## 🔗 Referências

- **API Docs:** `OPERATOR-API.md`
- **Base URL:** https://api.lusio.staging.goldenclouddev.com.br
- **Credenciais Test:** admin@luzio.com / admin123
- **Total Serviços:** 1.037+
- **Scripts Teste:** `test-api.js`, `test-api-search.js`

---

## 📞 Próximos Passos

**Agora, você decide:**

1. **Começar pela FASE 1** (Autenticação)
2. **Criar estrutura completa** de arquivos primeiro
3. **Fazer um protótipo** rápido de uma feature
4. **Outro approach** que preferir

**Qual fase começamos?**
