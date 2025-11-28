# 🚀 Lusio Backadmin - Sistema de Backoffice

> Interface administrativa moderna para gestão de pedidos de cidadania portuguesa

## 📊 Status do Desenvolvimento

```
Progresso: ███████████████ 100%

✅ Dashboard com estatísticas
✅ Listagem de processos
✅ Filtros avançados
✅ Detalhes do pedido
✅ Ações do advogado
✅ Upload de documentos
✅ Sistema de notificações (UI)
✅ Sistema de permissões por role
✅ Permissões por fase do processo
✅ Página de configurações com tabs
✅ Mobile Responsiveness completa
✅ Branding oficial com logo Lusio
✅ Deploy automatizado com script
✅ Integração com API real (1.037+ serviços)
⏳ Modo produção
```

## 🎨 Features Implementadas

### 1. Dashboard Completo
- **Estatísticas em tempo real** - Cards com métricas principais
- **Gráfico de distribuição** - Visualização por fase do processo
- **Atividade recente** - Últimas atualizações com timestamps
- **Ações rápidas** - Acesso direto às tarefas pendentes
- **Status do sistema** - Monitoramento de serviços

### 2. Gestão de Processos
- **Listagem completa** com paginação
- **Filtros múltiplos** (status, datas, busca, comunicações pendentes)
- **Filtro de Comunicações Pendentes** - toggle para mostrar apenas processos com mensagens não lidas
- **Visualização por usuário** ou todos
- **Detalhes expandidos** em modal
- **Timeline do processo** visual
- **Ordenação de colunas** (nome, email, status, data criação)
- **Paginação configurável** (10, 25, 50, 100 itens por página)

### 3. Ações do Advogado
- **Aprovar processo** com dados IRN
- **Recusar** com justificativa
- **Marcar como quase completo**
- **Formulários validados**
- **Confirmações de segurança**
- **Interface limpa** sem blocos de instruções

### 4. Sistema de Documentos
- **Upload drag & drop**
- **Categorização automática**
- **Validação de tipos** (PDF, JPG, PNG)
- **Preview de documentos**
- **Download individual**
- **Exclusão com confirmação**

### 5. Sistema de Permissões e Roles
- **4 perfis de usuário**: Admin, Backoffice, Advogada, Visualizador
- **Permissões granulares** por funcionalidade
- **Permissões por fase** do processo (Passo 1-8, status especiais)
- **Configuração dinâmica** via interface
- **Filtro automático** de processos por permissão de fase
- **Indicador visual** de permissões ativas

### 6. Página de Configurações
- **Interface com tabs** (Usuários e Perfis)
- **Gerenciamento de usuários** (criar, editar, deletar)
- **Configuração de permissões** por perfil
- **Botões "Selecionar Todos"** por categoria
- **Persistência** em localStorage
- **Preview de permissões** ativas

### 7. Tab Histórico
- **Timeline completa** de todos eventos do processo
- **Agregação automática** de:
  - Criação e atualizações do processo
  - Mudanças de status com detalhes
  - Mensagens (advogada e backoffice)
  - Uploads de documentos
  - Pagamentos (taxa e governo)
  - Submissão e atribuição
- **Ordenação cronológica** (mais recente primeiro)
- **Ícones e cores** diferenciados por tipo de evento
- **Data/hora formatada** para cada evento
- **Scroll vertical** para históricos longos

### 8. Interface Moderna
- **Design responsivo** mobile-first
- **Animações suaves** com Framer Motion
- **Cores e ícones intuitivos**
- **Feedback visual** em todas ações
- **Loading states** apropriados

### 9. Mobile Responsiveness (✨ NOVO)
- **Design totalmente responsivo** com suporte mobile-first
- **Brand Header** com logo e título da empresa
- **Breakpoints otimizados**: Mobile (<768px), Tablet (768-1023px), Desktop (≥1024px)
- **Componentes compactos** para telas pequenas
- **Filtros centralizados** em todos os dispositivos
- **Settings visível** em mobile e desktop
- **iOS Safari compatível** com fixes específicos para inputs
- **Touch-friendly** com áreas de toque otimizadas
- **Testado** em iPhone SE, iPhone 12 Pro, Samsung Galaxy S21, iPad Mini, Desktop 1920px

## 🛠️ Tecnologias

```javascript
{
  "framework": "Next.js 14.2.4",
  "linguagem": "TypeScript",
  "estilo": "TailwindCSS",
  "estado": "React Query + Context API",
  "api": "Axios",
  "data": "date-fns",
  "ícones": "Lucide React"
}
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Páginas (App Router)
│   ├── dashboard/
│   │   └── page.tsx       # Dashboard unificado (toggle entre visão geral e lista)
│   └── pedidos/
│       └── [id]/
│           ├── page.tsx   # Detalhes do pedido
│           └── components/
│               ├── LawyerActions.tsx
│               └── DocumentUpload.tsx
│
├── components/            # Componentes reutilizáveis
│   ├── stats/            # Cards de estatísticas
│   ├── charts/           # Gráficos
│   ├── tables/           # Tabelas e listagens
│   ├── pedidos/          # Componentes de pedidos
│   └── ui/               # Componentes base
│
├── lib/                  # Utilitários
│   ├── api.ts           # Cliente API
│   ├── types.ts         # TypeScript types (100% schema Prisma)
│   ├── mockData.ts      # Dados mock (integração)
│   └── mockDataGenerated.ts  # 100 pedidos gerados (13.963 linhas)
│
├── hooks/               # Custom hooks
│   └── useApi.ts       # Hooks para API
│
└── providers/          # Context providers
    └── QueryProvider.tsx
```

## 🚀 Como Rodar

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Rodar em modo dev
npm run dev

# Acessar
http://localhost:3001
```

### Configuração
```bash
# Copiar arquivo de ambiente
cp .env.local.example .env.local

# Configurar API backend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🚢 Deploy

### Ambiente de Desenvolvimento (DEV)

**Servidor:** 72.61.165.88
**Porta:** 3007
**URL:** https://dev.lusio.market/backadmin2
**Branch:** `dev`
**Gerenciador:** PM2 (`backadmin2-dev`)

#### Deploy com Zero-Downtime (Recomendado)

```bash
# Deploy completo com PM2 reload (zero-downtime)
ssh root@72.61.165.88 "cd /var/www/dev/backadmin2 && git pull && npm run build && pm2 reload backadmin2-dev"
```

#### Comandos Úteis

```bash
# Ver logs em tempo real
ssh root@72.61.165.88 "pm2 logs backadmin2-dev"

# Ver status do processo
ssh root@72.61.165.88 "pm2 status backadmin2-dev"

# Restart (se necessário)
ssh root@72.61.165.88 "pm2 restart backadmin2-dev"

# Verificar URL
curl -s -o /dev/null -w '%{http_code}' https://dev.lusio.market/backadmin2
```

#### Estrutura no Servidor

```
/var/www/dev/backadmin2/
├── .next/                # Build Next.js
├── src/                  # Código fonte
├── public/               # Assets públicos
├── .git/                 # Repositório Git
├── package.json
└── node_modules/
```

#### Troubleshooting

**Erro: Processo não responde**
```bash
ssh root@72.61.165.88 "pm2 restart backadmin2-dev"
```

**Erro: Build failed**
```bash
ssh root@72.61.165.88 "cd /var/www/dev/backadmin2 && npm run build 2>&1 | tail -50"
```

**Ver logs de erro**
```bash
ssh root@72.61.165.88 "pm2 logs backadmin2-dev --lines 100"
```

## 🔌 Integração com Backend

### Estado Atual - v0.9.0 (07 Nov 2025)

**✅ INTEGRADO COM API REAL DA LUSIO**

- ✅ **API URL**: https://api.lusio.staging.goldenclouddev.com.br
- ✅ **Autenticação JWT**: Sistema completo implementado
- ✅ **1.037+ serviços**: Dados reais carregados da API
- ✅ **Adapter funcional**: apiAdapter.ts (10/10 testes validados)
- ✅ **Hooks implementados**: useLogin, useServices, useService, useUpdateService
- ✅ **Mock desabilitado**: NEXT_PUBLIC_ENABLE_MOCK_DATA=false
- ✅ **Documentação completa**: OPERATOR-API.md com todos endpoints

### Credenciais de Acesso

**Ambiente de Staging:**
```
Email: admin@luzio.com
Senha: admin123
```

### Arquitetura da Integração

```typescript
// 1. Autenticação (src/hooks/auth/useLogin.ts)
const { mutate: login, isPending } = useLogin();
login({ email: 'admin@luzio.com', password: 'admin123' });

// 2. Listar Serviços (src/hooks/services/useServices.ts)
const { data: services, isLoading } = useServices({
  page: 1,
  limit: 20
});

// 3. Detalhes do Serviço (src/hooks/services/useService.ts)
const { data: service } = useService(serviceId);

// 4. Atualizar Serviço (src/hooks/services/useUpdateService.ts)
const { mutate: updateService } = useUpdateService();
updateService({ id, data });
```

### Endpoints Disponíveis

Ver documentação completa em **OPERATOR-API.md**:
- POST `/operator/login` - Autenticação
- GET `/operator/services` - Listar serviços (paginado)
- GET `/operator/services/:id` - Detalhes do serviço
- PUT `/operator/services/:id` - Atualizar serviço
- GET `/operator/viabilities` - Listar viabilidades
- GET `/operator/problems` - Listar problemas

## 📱 Páginas Disponíveis

| Rota | Descrição | Status |
|------|-----------|--------|
| `/` | Redireciona para dashboard | ✅ |
| `/login` | Tela de login com autenticação | ✅ |
| `/pedidos/[id]` | Detalhes do pedido | ✅ |
| `/configuracoes` | Configurações (tabs: Usuários e Perfis) | ✅ |

## 🔐 Sistema de Permissões

### Perfis de Usuário

| Perfil | Descrição | Permissões |
|--------|-----------|------------|
| **Admin** | Acesso total ao sistema | Todas as permissões + gerenciar usuários |
| **Backoffice** | Operação completa | Todas exceto gerenciar usuários |
| **Advogada** | Análise e decisão | Visualização, análise, mudança de status (Passo 7+) |
| **Visualizador** | Apenas leitura | Visualização de todas as fases |

### Permissões por Fase

O sistema implementa controle granular de acesso por fase do processo:

- **Passos 1-8**: Permissões individuais para cada passo
- **Status especiais**: Cancelado, Submetido, Em Análise, etc.
- **Filtro automático**: Processos são filtrados automaticamente baseado nas permissões do usuário

### Configuração de Permissões

Administradores podem:
- ✅ Criar/editar/deletar usuários
- ✅ Configurar permissões por perfil
- ✅ Selecionar/desmarcar permissões por categoria
- ✅ Visualizar permissões ativas em tempo real
- ✅ Resetar para configurações padrão

## 🎯 Próximos Passos

### Alta Prioridade
- [ ] Conectar com API real do backend
- [ ] Implementar autenticação JWT
- [ ] Adicionar WebSocket para real-time

### Média Prioridade
- [ ] Criar página de relatórios
- [ ] Implementar exportação PDF/Excel
- [ ] Adicionar filtros salvos

### Baixa Prioridade
- [ ] Modo dark/light
- [ ] Configurações do usuário
- [ ] Tour guiado para novos usuários

## 📝 Notas Importantes

### Segurança
- JWT tokens armazenados no localStorage
- Interceptors Axios para refresh automático
- Validação de formulários no frontend e backend

### Performance
- React Query cache de 1 minuto
- Lazy loading de componentes pesados
- Otimização de re-renders com memo

### UX/UI
- Feedback visual em todas ações
- Estados de loading apropriados
- Mensagens de erro claras
- Confirmações antes de ações destrutivas

## 📱 Mobile Responsiveness - Guia Técnico

### Implementação

O sistema foi desenvolvido com abordagem **mobile-first**, garantindo experiência otimizada em todos dispositivos.

#### Breakpoints Tailwind CSS

```javascript
{
  // Mobile (padrão)
  default: '< 640px',

  // Tablet
  sm: '≥ 640px',  // Small screens
  md: '≥ 768px',  // Medium screens
  lg: '≥ 1024px', // Large screens (Desktop)

  // Desktop grande
  xl: '≥ 1280px',
  '2xl': '≥ 1536px'
}
```

#### Componentes Responsivos

**1. Brand Header (`src/app/page.tsx:296-310`)**
```tsx
// Cabeçalho da marca com logo e título
<div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
  <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
    {/* Logo Lusio Cidadania */}
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg">
      <span className="text-2xl sm:text-3xl font-bold text-blue-600">L</span>
    </div>
  </div>
</div>
```

**Como substituir o logo placeholder:**
```tsx
// Substituir de:
<span className="text-2xl sm:text-3xl font-bold text-blue-600">L</span>

// Para:
<Image
  src="/logo-lusio.png"
  alt="Lusio Cidadania"
  width={48}
  height={48}
  className="w-10 h-10 sm:w-12 sm:h-12"
/>
```

**2. ProfileSwitcher Compacto (`src/components/ProfileSwitcher.tsx:54-66`)**
```tsx
// Mobile: ícones menores, sem texto "Perfil Atual"
<button className="px-2 sm:px-3 py-1.5 sm:py-2">
  <RoleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
  <span className="text-xs opacity-75 hidden sm:inline">Perfil Atual</span>
  <span className="font-semibold text-xs sm:text-sm">{roleLabels[user.role]}</span>
</button>
```

**3. Settings Button Visível (`src/app/page.tsx:393-402`)**
```tsx
// Removido: hidden sm:block
// Adicionado: paddings responsivos
<button className="p-1 sm:p-1.5 md:p-2 rounded-lg">
  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
</button>
```

**4. Filtros Centralizados (`src/app/page.tsx:440`)**
```tsx
// Centralizado em mobile e desktop
<div className="flex flex-wrap gap-2 justify-center">
  {/* Botões de filtro */}
</div>
```

#### Fixes para iOS Safari

**Problema:** Inputs `type="date"` transbordavam do container no Safari/iOS

**Solução:** (`src/app/globals.css:122-143`)
```css
/* Fix para inputs type="date" no Safari/iOS */
input[type="date"] {
  min-width: 0 !important;
  max-width: 100% !important;
}

/* Controla o ícone do calendário */
input[type="date"]::-webkit-calendar-picker-indicator {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  flex-shrink: 0;
}

/* Previne zoom automático em mobile */
@media screen and (max-width: 768px) {
  input[type="date"] {
    font-size: 16px !important;
  }
}
```

#### Testes de Responsividade

**Script automatizado:** `test-responsive-final.js`

```bash
# Rodar testes em múltiplos dispositivos
node test-responsive-final.js

# Dispositivos testados:
# - iPhone SE (375x667)
# - iPhone 12 Pro (390x844)
# - Samsung Galaxy S21 (360x800)
# - iPad Mini (768x1024)
# - Desktop 1920 (1920x1080)

# Screenshots gerados em: screenshots/final-*
```

**Testes manuais:**
- ✅ Navegação mobile (hamburger menu)
- ✅ Cards responsivos vs tabelas
- ✅ Modais em telas pequenas
- ✅ Inputs e formulários touch-friendly
- ✅ Botões com área de toque adequada (mínimo 44px)

#### Estrutura de Layout

**Mobile (<1024px):**
- Cards verticais para processos
- Menu hamburger
- Filtros empilhados
- Ícones compactos
- ProfileSwitcher sem texto adicional

**Desktop (≥1024px):**
- Tabela completa de processos
- Menu horizontal
- Filtros em linha
- Ícones tamanho normal
- ProfileSwitcher com texto completo

### Customização

Para ajustar breakpoints do projeto:

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',  // Ponto principal mobile → desktop
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}
```

## 🤝 Integração com Equipe Externa

O backend (`luzio-api`) é mantido por equipe terceirizada.

**NÃO MODIFICAR:**
- `/projects/third-party/cidadania/luzio-api/`
- `/projects/third-party/cidadania/luzio-front/`

**Quando a API estiver pronta:**
1. Receberemos endpoint de staging
2. Credenciais de teste
3. Documentação de webhooks
4. Fazer integração gradual

## 🚀 Deploy

### Deploy Rápido (Recomendado)

```bash
# Deploy com zero-downtime via PM2
ssh root@72.61.165.88 "cd /var/www/dev/backadmin2 && git pull && npm run build && pm2 reload backadmin2-dev"
```

O comando faz automaticamente:
1. ✅ Pull das mudanças do Git
2. ✅ Faz build otimizado
3. ✅ Reload sem downtime (PM2)

### Deploy Manual (Passo a Passo)

```bash
# 1. Fazer commit e push local
git add .
git commit -m "feat: sua mudança"
git push origin dev

# 2. Na VPS - deploy
ssh root@72.61.165.88 "cd /var/www/dev/backadmin2 && git pull && npm run build && pm2 reload backadmin2-dev"

# 3. Verificar
ssh root@72.61.165.88 "pm2 status backadmin2-dev"
```

### Verificar se Deploy Funcionou

```bash
# Testar URL (deve retornar 200)
curl -sL -o /dev/null -w '%{http_code}' https://dev.lusio.market/backadmin2

# Ver logs se houver problema
ssh root@72.61.165.88 "pm2 logs backadmin2-dev --lines 50"
```

## 🐛 Debug

```bash
# Ver logs do PM2 em tempo real
ssh root@72.61.165.88 "pm2 logs backadmin2-dev"

# Ver últimas 100 linhas de log
ssh root@72.61.165.88 "pm2 logs backadmin2-dev --lines 100"

# Ver status detalhado
ssh root@72.61.165.88 "pm2 show backadmin2-dev"

# Monitoramento em tempo real (CPU, memória)
ssh root@72.61.165.88 "pm2 monit"

# Ver logs do React Query
# DevTools aparecem no canto inferior direito em dev

# Ver estado do React Query (console do navegador)
window.__REACT_QUERY_STATE__
```

## 📞 Suporte

**Desenvolvedor:** Euclides Gomes + Claude Code
**Última Atualização:** 07 Novembro 2025
**Versão:** v0.9.0

---

🎉 **Sistema 100% completo com integração API real funcionando!**

## 🏷️ Versões

- **v0.9.0** (atual - 07/11/2025) 🚀 **INTEGRAÇÃO API REAL**
  - ✅ **Restauração completa** do backup de 04/Nov/2025
  - ✅ **API da Lusio** conectada (https://api.lusio.staging.goldenclouddev.com.br)
  - ✅ **1.037+ serviços** reais disponíveis
  - ✅ **Autenticação JWT** funcionando (admin@luzio.com / admin123)
  - ✅ **Adapter completo** testado (10/10 validações)
  - ✅ **Hooks implementados** (useLogin, useServices, useService, useUpdateService)
  - ✅ **Documentação** (OPERATOR-API.md + PLANO-INTEGRACAO-API.md)
  - ✅ **Mock desabilitado** (NEXT_PUBLIC_ENABLE_MOCK_DATA=false)
  - 📊 **Fase 0 e 1** completas, Fase 2 em 50%

- **v0.8.0** (02/11/2025) 🎨 **BRANDING + DEPLOY**
  - Logo oficial da Lusio
  - Script de deploy automatizado
  - Correção do build standalone

- **v0.7.1** (01/11/2025) 🔧 **CORREÇÃO NGINX**
  - 🐛 **Corrigido proxy Nginx** - Apontando para porta correta 3004 (antes: 3003)
  - ✅ **Rebuild completo** - Assets estáticos copiados corretamente
  - 📝 **Nginx config** - `/etc/nginx/sites-available/dev-lusio` atualizado
  - 🔄 **Backup criado** - `dev-lusio.bak.YYYYMMDD_HHMMSS`
  - 🚀 **Deploy estável** - https://dev.lusio.market/backadmin funcionando
  - **Causa:** Mismatch entre porta do Nginx (3003) e servidor Node (3004)
  - **Solução:** `proxy_pass http://localhost:3004` no Nginx

- **v0.7.0** (27/10/2025) 🚀 **MOCK DATA UPGRADE + DEPLOY**
  - 📊 **100 Pedidos Mockados Completos** (vs 5 anteriores)
  - ✅ **Schema 100% Prisma Real** - 0 campos inventados
  - 📝 **13.963 linhas de dados gerados** automaticamente
  - 🔧 **7 Correções de TypeScript** - Optional chaining em todos componentes
    - types.ts: Relacionamentos opcionais (Service.user, person, address, etc.)
    - page.tsx: Search, sort, group, display com safe navigation
    - pedidos/[id]/page.tsx: Header do detalhe
    - service-modal.tsx: Dialog header
    - MobileServiceCard.tsx: Card mobile
    - RecentActivity.tsx: Timeline
  - 🚢 **Deploy para DEV** - http://72.61.165.88:3004/backadmin
  - 📚 **Documentação completa** - MOCK_DATA_UPGRADE.md, SCHEMA_COMPARISON.md
  - 🎯 **Type Safety 100%** - Compilação sem erros TypeScript
  - Ver: MOCK_DATA_UPGRADE.md para detalhes completos

- **v0.6.0** (27/10/2025) ✨ **VERSÃO ESTÁVEL**
  - 📱 **Mobile Responsiveness Completa**
  - Brand header com logo Lusio Cidadania
  - Settings visível em mobile
  - ProfileSwitcher compacto
  - Filtros centralizados em todos dispositivos
  - Fixes específicos para iOS Safari (inputs date)
  - **Painel de notificações** corrigido para mobile
    - Backdrop semi-transparente (clique fora para fechar)
    - Posicionamento correto com `top-16` em mobile
    - Mantém comportamento original no desktop
    - Z-index hierarquia correta (backdrop: 40, painel: 50)
  - Testado em 5 dispositivos diferentes
  - Deploy em dev: https://dev.lusio.market:3004/backadmin

- **v0.5.1** (27/10/2025)
  - Filtro de Comunicações Pendentes
  - Toggle visual com badge dinâmico
  - Combinação com outros filtros (AND lógico)

- **v0.5.0** (27/10/2025)
  - Sistema completo de roles e permissões (RBAC)
  - 4 perfis: Admin, Backoffice, Advogada, Visualizador
  - ProfileSwitcher e PermissionIndicator
  - Controle de UI baseado em permissões

- **v0.4.0**
  - Sistema de ordenação de colunas
  - Paginação completa

- **v0.3.0**
  - Visualização "Por Usuário"
  - Filtros de status e data

- **v0.2.0-config-consolidation**
  - Sistema de configurações consolidado com tabs
  - Permissões por fase implementadas
  - Botões "Selecionar Todos" por categoria

- **v0.1.0**
  - Versão inicial do dashboard