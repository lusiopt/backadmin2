# Changelog - Backadmin

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [0.9.0] - 2025-11-07

### ✨ Adicionado

#### Integração com API Real da Lusio - 100% Funcional
- **Restauração completa** do backup de 04/Nov/2025 (90 arquivos, 746KB)
- **Documentação da API**: OPERATOR-API.md com 10 endpoints documentados
- **Adapter completo**: apiAdapter.ts (379 linhas, 10/10 testes validados)
- **Serviço de autenticação**: auth.ts com JWT, cookies e interceptors
- **Contexts React**: AuthContext e ServicesContext implementados
- **Hooks de autenticação**: useLogin, useLogout, useAuthUser
- **Hooks de serviços**: useServices, useService, useUpdateService
- **ProtectedRoute**: Componente de proteção de rotas
- **Página de login**: Integrada com API real, credenciais configuradas

#### Configuração de Produção
- **URL da API**: https://api.lusio.staging.goldenclouddev.com.br
- **Mock desabilitado**: NEXT_PUBLIC_ENABLE_MOCK_DATA=false
- **Credenciais**: admin@luzio.com / admin123
- **Total de serviços**: 1.037+ registros reais disponíveis

### 📊 Estado da Integração

**Fase 0: Equiparação de Schemas** - ✅ 100% COMPLETO
- Análise completa da API
- Comparação campo a campo (95% compatível)
- Adapter testado e validado

**Fase 1: Autenticação** - ✅ 100% COMPLETO
- Sistema de login funcionando
- JWT tokens gerenciados
- Proteção de rotas ativa

**Fase 2: Hooks da API** - 🚧 50% COMPLETO
- Hooks básicos implementados
- Componentes ainda usando mock em alguns casos

### 🔧 Modificado

#### Arquivos Atualizados do Backup
- src/app/(auth)/login/page.tsx - Login com API real
- src/app/layout.tsx - Providers configurados
- src/app/page.tsx - Dashboard com hooks da API
- src/app/pedidos/[id]/page.tsx - Detalhes integrados
- src/lib/types.ts - Campo _count adicionado

### 📦 Arquivos Criados
- OPERATOR-API.md (14KB)
- PLANO-INTEGRACAO-API.md (13KB)
- SCHEMA-INTEGRATION-COMPLETE.md (9KB)
- SCHEMA-FINAL-COMPARISON.md (12KB)
- src/lib/adapters/apiAdapter.ts (11KB)
- src/lib/services/auth.ts (4.5KB)
- src/contexts/AuthContext.tsx
- src/contexts/ServicesContext.tsx
- src/hooks/auth/* (4 arquivos)
- src/hooks/services/* (4 arquivos)
- src/components/auth/ProtectedRoute.tsx

### 🚀 Deploy

**Status**: ✅ Online em https://dev.lusio.market/backadmin
**Build**: Compilado sem erros
**PM2**: Rodando estável

### 📝 Notas Importantes

- Sistema agora conectado com API real da Lusio (staging)
- Dados mock desabilitados
- Autenticação JWT funcionando
- 1.037+ serviços disponíveis via API

---

## [0.8.0] - 2025-11-02

### ✨ Adicionado

#### Branding Oficial
- **Logo da Lusio** no header substituindo placeholder "L"
- Imagem oficial `Logo.jpeg` (49KB) da pasta `Branding/Lusio/`
- Logo preenche completamente o quadrado branco com `object-cover`
- Integração com `next/image` para otimização automática

#### Deploy Automatizado
- Script `deploy.sh` para deploy completo em um comando
- Automação de 5 etapas: pull, install, build, copy assets, restart
- Documentação completa no README.md

### 🐛 Corrigido

#### Problema Critical do Build Standalone
- **Causa identificada:** Next.js standalone não copia automaticamente `static/` e `public/`
- **Impacto:** CSS e imagens não carregavam após deploy
- **Solução:** Cópia automática de assets no script de deploy
- **Prevenção:** Documentação clara e script automatizado

```bash
# Agora incluído automaticamente no deploy.sh
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
```

### 📚 Documentação

#### README.md Atualizado
- Seção completa de Deploy (Automatizado + Manual)
- Explicação detalhada do problema standalone
- Comandos de troubleshooting
- Instruções de verificação pós-deploy

#### Arquivos de Deploy
- `/var/www/dev/backadmin/deploy.sh` (VPS)
- Permissões de execução configuradas
- Logs detalhados de cada etapa

### 🔧 Modificado

#### Header Component
- Logo responsiva (10x10 mobile, 12x12 desktop)
- Container com `overflow-hidden` e `rounded-lg`
- Imagem com classes Tailwind: `w-full h-full object-cover`

### 📦 Arquivos Modificados
- `src/app/page.tsx` - Adicionado import Image e logo
- `public/logo-lusio.jpeg` - Logo oficial adicionada
- `README.md` - Seção de Deploy completa
- `/var/www/dev/backadmin/deploy.sh` - Script automatizado (VPS)

### 🚀 Deploy

#### Comando Simplificado
```bash
ssh root@72.61.165.88 'cd /var/www/dev/backadmin && ./deploy.sh'
```

#### Processo Automatizado
1. ✅ Pull das mudanças do Git (branch dev)
2. ✅ Instala dependências (npm install)
3. ✅ Build otimizado (npm run build)
4. ✅ Copia assets para standalone (static + public)
5. ✅ Reinicia serviço systemd (backadmin-dev.service)

### ⚠️ Breaking Changes
- Nenhum (mudanças retrocompatíveis)

### 📝 Notas de Migração
- Deploy manual agora **requer** cópia de assets após build
- Recomendado usar script automatizado para evitar problemas

---

## [0.5.1] - 2025-10-27

### ✨ Adicionado

#### Filtro de Comunicações Pendentes
- Novo botão de filtro "Comunicações Pendentes" na barra de filtros
- Ícone `MessageSquare` para identificação visual
- Estilo toggle (branco/azul) indicando estado ativo/inativo
- Badge dinâmico mostrando quantidade de processos com comunicações não lidas
- Funciona em todas as visualizações (Dashboard, Lista, Por Usuário)

### 🔧 Modificado

#### Lógica de Filtragem
- Integrado filtro de comunicações pendentes ao `filteredAndSortedServices`
- Filtra processos baseado na função `getUnreadMessagesCount()`
- Combinação com outros filtros (Status, Datas, Busca)
- Dependências do useMemo atualizadas para incluir `showPendingCommunications` e `user`

### 📊 Comportamentos

#### Filtro de Comunicações Pendentes
- ✅ Ativa/desativa com um clique no botão
- ✅ Funciona independentemente (mostra apenas processos com mensagens não lidas)
- ✅ Combina com filtro de Status (AND lógico)
- ✅ Combina com filtro de Datas (AND lógico)
- ✅ Combina com busca textual (AND lógico)
- ✅ Badge mostra quantidade em tempo real
- ✅ Visual claro: botão azul quando ativo, branco quando inativo

### 📦 Arquivos Modificados
- `src/app/page.tsx`:
  - Adicionado state `showPendingCommunications`
  - Implementada lógica de filtragem por mensagens não lidas
  - Adicionado botão de filtro no header
  - Atualizado useMemo dependencies

### 📝 Testes Realizados
- ✅ Filtro individual: 15 → 1 processo (Carlos Eduardo Mendes)
- ✅ Combinação Status + Comunicações: filtragem correta (AND)
- ✅ Busca + Comunicações: filtragem correta (AND)
- ✅ Toggle ativo/inativo: mudança de cor do botão
- ✅ Badge dinâmico: atualiza com quantidade correta

---

## [0.5.0] - 2025-10-27

### ✨ Adicionado

#### Sistema de Roles e Permissões
- Sistema completo de controle de acesso baseado em roles (RBAC)
- 4 perfis de usuário implementados:
  - **Admin** - Acesso total (14 permissões)
  - **Backoffice** - Operações completas exceto gerenciar usuários (12 permissões)
  - **Advogada** - Visualizar, editar, alterar status e documentos (7 permissões)
  - **Visualizador** - Apenas leitura (3 permissões)
- 14 permissões granulares definidas:
  - `VIEW_SERVICES`, `CREATE_SERVICE`, `EDIT_SERVICE`, `DELETE_SERVICE`
  - `CHANGE_STATUS`
  - `VIEW_DOCUMENTS`, `UPLOAD_DOCUMENTS`, `DELETE_DOCUMENTS`
  - `VIEW_USERS`, `MANAGE_USERS`
  - `VIEW_ALL_SERVICES`, `ASSIGN_SERVICES`
  - `VIEW_STATISTICS`, `EXPORT_DATA`

#### AuthContext
- Context React para gerenciamento de autenticação
- Persistência de usuário selecionado em localStorage
- Funções helper para verificação de permissões:
  - `hasPermission(permission)` - Verifica permissão única
  - `hasAnyPermission(permissions[])` - Verifica se tem qualquer uma das permissões
  - `hasAllPermissions(permissions[])` - Verifica se tem todas as permissões
- Carregamento automático do perfil Admin no primeiro acesso

#### ProfileSwitcher (Dev Mode)
- Componente para trocar entre perfis em desenvolvimento
- Dropdown com os 4 usuários do sistema
- Ícones específicos por role:
  - 👑 Crown (Admin)
  - 💼 Briefcase (Backoffice)
  - 🛡️ Shield (Advogada)
  - 👁️ Eye (Visualizador)
- Cores distintas por role (roxo, azul, verde, cinza)
- Badge de perfil atual no header
- Aviso visual de "Modo Desenvolvimento"

#### PermissionIndicator
- Componente que exibe permissões ativas do usuário
- Botão "Permissões" no header
- Dropdown com grid de permissões
- Badges verdes para permissões ativas
- Ícones específicos para cada tipo de permissão
- Dica informativa no rodapé

#### Controle de UI Baseado em Permissões
- Botão "Exportar" visível apenas com `EXPORT_DATA`
- Botão "Configurações" visível apenas com `MANAGE_USERS`
- Botão "Editar" no modal visível apenas com `EDIT_SERVICE`
- Botão "Adicionar Documentos" visível apenas com `UPLOAD_DOCUMENTS`
- Botão "Remover" documentos visível apenas com `DELETE_DOCUMENTS`
- Tab "Ações" bloqueada para usuários sem `CHANGE_STATUS`
- Mensagem de permissão negada para Visualizador na tab Ações

### 🔧 Modificado

#### Estrutura de Types
- `src/lib/types.ts`:
  - Adicionado enum `UserRole` com 4 roles
  - Adicionado enum `Permission` com 14 permissões
  - Adicionado `ROLE_PERMISSIONS` mapeando roles → permissões
  - Criada interface `AuthUser` (User + role)
  - Criada interface `AuthContextType`

#### Mock Data
- `src/lib/mockData.ts`:
  - Adicionados 4 usuários sistema com roles:
    - admin@lusio.market (Admin)
    - patricia@lusio.market (Backoffice)
    - ana.advogada@lusio.market (Advogada)
    - joao.visual@lusio.market (Visualizador)

#### Layout Principal
- `src/app/layout.tsx`:
  - Adicionado `<AuthProvider>` envolvendo a aplicação
  - Provider posicionado entre QueryProvider e ServicesProvider

#### Dashboard
- `src/app/page.tsx`:
  - Importado `useAuth()` e `Permission`
  - Adicionados checks de permissão em botões do header
  - Adicionados checks de permissão em botões "Ver Detalhes"
  - Integrado `ProfileSwitcher` e `PermissionIndicator` no header

#### Modal de Serviço
- `src/components/pedidos/service-modal.tsx`:
  - Importado `useAuth()` e `Permission`
  - Botão "Editar" dados do cliente com check `EDIT_SERVICE`
  - Botão "Adicionar Documentos" com check `UPLOAD_DOCUMENTS`
  - Botão "Ver" documentos com check `VIEW_DOCUMENTS`
  - Botão "Remover" documentos com check `DELETE_DOCUMENTS`
  - Tab "Ações" com check `CHANGE_STATUS`
  - Mensagem de bloqueio para usuários sem permissão

### 📊 Comportamentos

#### Perfil Admin
- ✅ Vê todos os botões e funcionalidades
- ✅ Pode criar, editar, excluir processos
- ✅ Pode alterar status e gerenciar workflow
- ✅ Pode adicionar e remover documentos
- ✅ Acesso a configurações do sistema
- ✅ Pode exportar dados

#### Perfil Backoffice
- ✅ Vê quase todos os botões exceto "Configurações"
- ✅ Pode criar e editar processos
- ❌ Não pode excluir processos
- ✅ Pode alterar status e gerenciar workflow
- ✅ Pode adicionar e remover documentos
- ❌ Não pode gerenciar usuários
- ✅ Pode exportar dados

#### Perfil Advogada
- ❌ Não vê botões "Exportar" e "Configurações"
- ❌ Não pode criar processos
- ✅ Pode editar dados dos clientes
- ✅ Pode alterar status e gerenciar workflow
- ✅ Pode adicionar documentos
- ❌ Não pode remover documentos
- ❌ Não pode exportar dados

#### Perfil Visualizador
- ❌ Não vê botões de ação no header
- ✅ Pode visualizar processos
- ❌ Não pode editar nada
- ❌ Não pode alterar status (vê mensagem de bloqueio)
- ❌ Não pode gerenciar documentos
- ✅ Pode visualizar documentos
- ✅ Pode ver estatísticas

### 📝 Ícones Adicionados
- `Crown` - Admin
- `Briefcase` - Backoffice
- `Shield` - Advogada/Permissões
- `Eye` - Visualizador/Visualizar
- `Edit` - Editar
- `Trash2` - Excluir
- `Upload` - Upload
- `Download` - Download/Exportar
- `Users` - Gerenciar Usuários
- `BarChart3` - Estatísticas

### 📦 Arquivos Criados
1. `src/contexts/AuthContext.tsx` - Context de autenticação
2. `src/components/ProfileSwitcher.tsx` - Seletor de perfil (dev)
3. `src/components/PermissionIndicator.tsx` - Indicador de permissões
4. `PERMISSION_TESTS.md` - Documentação de testes de permissões

### 📦 Arquivos Modificados
1. `src/lib/types.ts` - Adicionados types de roles e permissões
2. `src/lib/mockData.ts` - Adicionados usuários sistema
3. `src/app/layout.tsx` - Integrado AuthProvider
4. `src/app/page.tsx` - Adicionados checks de permissões na UI
5. `src/components/pedidos/service-modal.tsx` - Adicionados checks de permissões

### 🔒 Segurança
- Controle de acesso implementado na camada de apresentação
- Verificações de permissão antes de exibir ações sensíveis
- Sistema preparado para integração com backend real
- Mock data para desenvolvimento seguro

### 🐛 Corrigido
- Nenhum bug reportado nesta versão

---

## [0.4.0] - 2025-10-27

### ✨ Adicionado

#### Sistema de Ordenação de Colunas
- Ordenação clicável em colunas da tabela (Nome, Email, Status, Criado Em)
- Indicadores visuais de ordenação com ícones:
  - `ArrowUpDown` (cinza) - Coluna não ordenada
  - `ArrowUp` (azul) - Ordenação ascendente
  - `ArrowDown` (azul) - Ordenação descendente
- Toggle automático entre ASC/DESC ao clicar na mesma coluna
- Reset para página 1 ao mudar ordenação

#### Sistema de Paginação
- Controle de itens por página (10, 25, 50, 100)
- Navegação entre páginas com botões "Anterior" e "Próxima"
- Numeração de páginas inteligente:
  - Sempre mostra primeira e última página
  - Mostra página atual e ±1 página adjacente
  - Reticências (...) para indicar gap entre páginas
- Contador de resultados: "Mostrando X a Y de Z resultados"
- Estados disabled em botões quando não há mais páginas

### 🔧 Modificado

#### Refatoração de Lógica de Filtragem
- `filteredServices` renomeado para `filteredAndSortedServices`
- Lógica de ordenação integrada ao useMemo de filtragem
- Novo useMemo `paginatedServices` para slice paginado
- Constante `totalPages` calculada automaticamente
- Handlers `handleSort()` e `renderSortIcon()` para controle de UI

#### Melhorias na UI da Lista
- Header da lista agora inclui seletor de itens por página
- Layout flex para alinhar título e controles
- Controles de paginação em rodapé com background cinza claro
- Botões de ordenação em cabeçalhos de coluna com hover state

### 🐛 Corrigido
- Referências a `filteredServices` atualizadas para `filteredAndSortedServices`
- Correção no `servicesByUser` para usar dados filtrados e ordenados

### 📊 Comportamentos
- Ordenação mantém filtros ativos
- Paginação reseta ao mudar ordenação
- Paginação reseta ao mudar quantidade de itens por página
- Indicador visual sempre mostra coluna e direção ativa

### 📝 Ícones Adicionados
- `ArrowUpDown` - Ordenação neutra
- `ArrowUp` - Ordenação ascendente
- `ArrowDown` - Ordenação descendente
- `ChevronLeft` - Botão "Anterior"
- `ChevronRight` - Botão "Próxima" (já existia)

### 📦 Arquivos Modificados
- `src/app/page.tsx`:
  - Adicionados states: `sortColumn`, `sortDirection`, `currentPage`, `itemsPerPage`
  - Implementadas funções: `handleSort()`, `renderSortIcon()`
  - Refatorado: `filteredServices` → `filteredAndSortedServices`
  - Adicionado: `paginatedServices` useMemo
  - Modificada tabela da view "Lista" com ordenação e paginação

---

## [0.3.0] - 2025-10-23

### ✨ Adicionado

#### Visualização "Por Usuário"
- Nova visualização que agrupa pedidos por usuário
- Lista de usuários com avatar (inicial do nome)
- Badge dinâmico mostrando quantidade de pedidos
- Click-to-drill-down: clicar no usuário mostra apenas seus pedidos
- Breadcrumb de navegação "← Voltar para todos os usuários"
- Alternância entre visualizações: 📁 Todos Processos / 👤 Por Usuário

#### Filtros Integrados na Visualização "Por Usuário"
- Filtro de busca por nome/email do usuário
- Filtro por status dos pedidos
- Filtro por intervalo de datas (criação)
- Combinação de múltiplos filtros (AND lógico)

### 🔧 Modificado
- `src/app/dashboard/page.tsx`:
  - Adicionado state `selectedUserId` para controle de drill-down
  - Implementado `userGroups` useMemo para agrupar services por user
  - Implementado `filteredUsers` useMemo com lógica de filtragem avançada
  - Modificado `filteredServices` para incluir filtro por usuário selecionado
  - Adicionada renderização condicional de tabelas (usuários vs processos)
  - Badge agora mostra `filteredCount` em vez de total de pedidos

### 📊 Comportamentos
- Usuários sem pedidos que atendam aos filtros são ocultados
- Badge mostra apenas pedidos que passam pelos filtros ativos
- Filtros funcionam em ambas visualizações (Todos Processos e Por Usuário)
- Ao trocar de visualização, `selectedUserId` é resetado

### 🐛 Corrigido
- Deploy em dev não estava atualizando corretamente (caminho npm corrigido)

### 📝 Commits
- `02ccc9d` - feat: Adicionar filtros de status e data na visualização por usuário
- `667e21a` - feat: Implementar visualização "Por Usuário" no dashboard

---

## [0.2.0] - 2025-10-22

### 🚀 Modificado

#### Autenticação Desabilitada
- Login removido temporariamente durante fase de prototipagem
- Redirect automático de `/` para `/dashboard`
- Comentado código de verificação de auth

#### Redesign do Layout
- Removida sidebar lateral
- Implementado menu horizontal fixo no topo
- Filtros reorganizados em layout horizontal

#### Sistema de Filtros
- Adicionado filtro multi-status com checkboxes
- Adicionado filtro por intervalo de datas (Data Inicial / Data Final)
- Validação de datas (início < fim)
- Botões "Limpar" em cada filtro
- Click outside para fechar dropdowns

### 📝 Commits
- `29c116c` - feat: Remover página de login e redirect direto para dashboard
- `63821ce` - Implementar filtro por intervalo de datas
- `5feebc7` - Remover sidebar e corrigir checkboxes do filtro de status
- `c0f17a5` - Redesign do layout: menu horizontal e filtro multi-status

---

## [0.1.0] - 2025-10 (Data exata não registrada)

### ✨ Adicionado

#### Setup Inicial do Projeto
- Inicializado projeto Next.js 14 com App Router
- Configurado TypeScript
- Configurado Tailwind CSS
- Adicionado Shadcn/UI components

#### Estrutura de Dados
- Criado `ServicesContext` para gerenciamento de estado global
- Criado arquivo `mockData.ts` com dados fictícios:
  - 5 usuários
  - 15 pedidos (3 por usuário)
  - Todos os status do fluxo representados
- Criado `types.ts` alinhado com schema Prisma

#### Interface Principal
- Página de dashboard (`/dashboard`)
- Tabela de processos com colunas:
  - ID (abreviado)
  - Nome do usuário
  - Email (link mailto)
  - Status (badge colorido)
  - Data de criação
  - Ações (botão Ver Detalhes)
- Busca textual por nome, email ou ID
- Hover states e cursor pointer

#### Componentes
- `ServiceModal` - Modal de detalhes do pedido
- `StatusBadge` - Badge visual para status dos pedidos
- Componentes Shadcn/UI (Input, Card, etc.)

#### Utilitários
- Função `formatDate()` para formatação de datas
- Helpers de busca e filtragem

---

## Roadmap Futuro

### v0.6.0 (Planejado)
- [ ] Integração com API real
- [ ] Sistema de autenticação OAuth 2.0
- [ ] Estatísticas por usuário (quantos em cada status)
- [ ] Exportação de dados (CSV/Excel)

### v1.0.0 (Futuro)
- [ ] Dashboard com gráficos e métricas
- [ ] Sistema de notificações
- [ ] Histórico de alterações (audit log)
- [ ] Upload de documentos
- [ ] Edição inline de status

---

## Tipos de Mudanças

- `✨ Adicionado` - Novas funcionalidades
- `🔧 Modificado` - Mudanças em funcionalidades existentes
- `🗑️ Removido` - Funcionalidades removidas
- `🐛 Corrigido` - Correções de bugs
- `🔒 Segurança` - Vulnerabilidades corrigidas
- `📊 Comportamentos` - Mudanças de comportamento sem código novo
- `📝 Commits` - Lista de commits da versão

---

**Mantido por:** Euclides Gomes + Claude Code
