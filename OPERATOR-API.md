# API de Operadores - Luzio API

# Link de homologação da api:

https://api.lusio.staging.goldenclouddev.com.br/

## Visão Geral

A API de Operadores foi criada para permitir que administradores da plataforma gerenciem serviços e tenham acesso completo aos dados do sistema. Os operadores possuem permissões elevadas e podem visualizar e editar todos os serviços, independentemente do usuário que os criou.

## Autenticação

Todos os endpoints protegidos requerem autenticação via JWT token com tipo "operator". O token deve ser enviado no header `Authorization` com o formato:

```
Authorization: Bearer <token>
```

## Endpoints Públicos (Sem Autenticação)

### 1. Login de Operador

**POST** `/operator/login`

Autentica um operador e retorna um token JWT.

**Request Body:**

```json
{
  "email": "admin@luzio.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "operator": {
    "id": "uuid-do-operador",
    "fullName": "Administrador Lusio",
    "email": "admin@luzio.com",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-aqui"
}
```

### 2. Esqueci Minha Senha

**POST** `/operator/reset-password`

Solicita reset de senha para um operador.

**Request Body:**

```json
{
  "email": "admin@luzio.com"
}
```

**Response:**

```json
{
  "message": "Reset token generated successfully",
  "resetToken": "token-de-reset"
}
```

### 3. Reset de Senha com Token

**POST** `/operator/reset-password-token?token=<reset-token>`

Redefine a senha usando o token de reset.

**Query Parameters:**

- `token`: Token de reset recebido

**Request Body:**

```json
{
  "password": "nova-senha-123"
}
```

**Response:**

```json
{
  "message": "Password reset successfully"
}
```

## Endpoints Protegidos (Requer Autenticação de Operador)

### 4. Cadastrar Novo Operador

**POST** `/operator/register`

Cria um novo operador no sistema.

**Headers:**

```
Authorization: Bearer <operator-token>
```

**Request Body:**

```json
{
  "fullName": "Novo Operador",
  "email": "novo@luzio.com",
  "password": "senha123"
}
```

**Response:**

```json
{
  "operator": {
    "id": "uuid-do-novo-operador",
    "fullName": "Novo Operador",
    "email": "novo@luzio.com",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Editar Operador

**PUT** `/operator/:id`

Edita as informações de um operador existente.

**Headers:**

```
Authorization: Bearer <operator-token>
```

**Request Body:**

```json
{
  "fullName": "Nome Atualizado",
  "email": "email-atualizado@luzio.com",
  "password": "nova-senha-opcional",
  "active": false
}
```

**Response:**

```json
{
  "operator": {
    "id": "uuid-do-operador",
    "fullName": "Nome Atualizado",
    "email": "email-atualizado@luzio.com",
    "active": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 6. Listar Todos os Serviços

**GET** `/operator/services`

Retorna todos os serviços do sistema com informações completas e suporte a paginação.

**Headers:**

```
Authorization: Bearer <operator-token>
```

**Query Parameters (opcionais):**

- `page` (number): Página a ser exibida (padrão: 1)
- `limit` (number): Número de itens por página (padrão: 10)

**Exemplo de Requisição:**

```
GET /operator/services?page=1&limit=20
```

**Response:**

```json
{
  "services": [
    {
      "id": "service-uuid",
      "assignedAt": "2024-01-01T00:00:00.000Z",
      "isPaidTax": true,
      "processNumber": "PROC123456",
      "processPassword": "senha-processo",
      "entity": "Entidade Responsável",
      "reference": "REF123",
      "paidTaxAt": "2024-01-02T00:00:00.000Z",
      "isPaidGovernment": false,
      "paidGovernmentAt": null,
      "status": "em_andamento",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "fullName": "Nome do Cliente",
        "email": "cliente@email.com",
        "phone": "123456789",
        "areaCode": "+351"
      },
      "person": {
        "id": "person-uuid",
        "firstName": "João",
        "lastName": "Silva",
        "email": "joao@email.com",
        "profession": "Engenheiro",
        "nationality": "Brasileira",
        "birthDate": "1990-01-01T00:00:00.000Z",
        "gender": "M",
        "nif": "123456789"
      },
      "address": {
        "id": "address-uuid",
        "street": "Rua das Flores, 123",
        "postalCode": "1000-001",
        "locality": "Lisboa",
        "country": "Portugal",
        "phone": "123456789",
        "email": "endereco@email.com"
      },
      "documents": [
        {
          "id": "doc-uuid",
          "title": "Passaporte",
          "number": "AB123456",
          "issuedAt": "2020-01-01T00:00:00.000Z",
          "expiresAt": "2030-01-01T00:00:00.000Z",
          "issuedBy": "República Federativa do Brasil",
          "approved": true,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "problems": [],
      "_count": {
        "documents": 1,
        "documentsAttorney": 0,
        "problems": 0
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 7. Detalhes de um Serviço

**GET** `/operator/services/:id`

Retorna informações detalhadas de um serviço específico.

**Headers:**

```
Authorization: Bearer <operator-token>
```

**Response:**

```json
{
  "service": {
    "id": "service-uuid",
    "assignedAt": "2024-01-01T00:00:00.000Z",
    "isPaidTax": true,
    "processNumber": "PROC123456",
    "processPassword": "senha-processo",
    "entity": "Entidade Responsável",
    "reference": "REF123",
    "paidTaxAt": "2024-01-02T00:00:00.000Z",
    "isPaidGovernment": false,
    "paidGovernmentAt": null,
    "status": "em_andamento",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "fullName": "Nome do Cliente",
      "firstName": "João",
      "lastName": "Silva",
      "email": "cliente@email.com",
      "phone": "123456789",
      "areaCode": "+351",
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "person": {
      "id": "person-uuid",
      "firstName": "João",
      "lastName": "Silva",
      "alternativeNames": "João da Silva Santos",
      "email": "joao@email.com",
      "profession": "Engenheiro",
      "fatherFullName": "José Silva",
      "motherFullName": "Maria Silva",
      "civilState": "Solteiro",
      "nationality": "Brasileira",
      "birthDate": "1990-01-01T00:00:00.000Z",
      "cityPlace": "São Paulo",
      "statePlace": "SP",
      "countryPlace": "Brasil",
      "gender": "M",
      "nif": "123456789",
      "residenceCountries": "Brasil, Portugal"
    },
    "address": {
      "street": "Rua das Flores, 123",
      "postalCode": "1000-001",
      "locality": "Lisboa",
      "areaCode": "+351",
      "phone": "123456789",
      "email": "endereco@email.com",
      "complement": "Apartamento 2B",
      "province": "Lisboa",
      "country": "Portugal"
    },
    "documents": [
      {
        "id": "doc-uuid",
        "title": "Passaporte",
        "number": "AB123456",
        "issuedAt": "2020-01-01T00:00:00.000Z",
        "expiresAt": "2030-01-01T00:00:00.000Z",
        "issuedBy": "República Federativa do Brasil",
        "attachment": "base64-string-do-arquivo",
        "approved": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "documentsAttorney": [],
    "problems": []
  },
  "summary": {
    "totalDocuments": 1,
    "totalAttorneyDocuments": 0,
    "totalProblems": 0,
    "approvedDocuments": 1,
    "pendingDocuments": 0
  }
}
```

### 8. Editar Serviço

**PUT** `/operator/services/:id`

Permite que operadores editem qualquer campo de um serviço.

**Headers:**

```
Authorization: Bearer <operator-token>
```

**Request Body:**

```json
{
  "assignedAt": "2024-01-15T10:30:00.000Z",
  "isPaidTax": true,
  "processNumber": "PROC789012",
  "processPassword": "nova-senha-processo",
  "entity": "Nova Entidade",
  "reference": "REF456",
  "paidTaxAt": "2024-01-16T14:00:00.000Z",
  "isPaidGovernment": true,
  "paidGovernmentAt": "2024-01-17T09:00:00.000Z",
  "status": "concluido",
  "paymentReferenceId": "PAY123456",
  "documentPromotion": true,
  "hasResidenceTitle": true,
  "hasBirthCertificate": true,
  "hasCriminalRecord": false,
  "hasIdentificationDocument": true,
  "hasBrasilianCriminalRecord": false,
  "refuseJustification": null,
  "almostJustification": "Documentação quase completa",
  "sendSolicitationDate": "2024-01-18T00:00:00.000Z",
  "submissionDate": "2024-01-19T00:00:00.000Z"
}
```

**Response:**

```json
{
  "service": {
    // Objeto completo do serviço atualizado
    // Similar ao retorno do endpoint de detalhes
  },
  "message": "Service updated successfully"
}
```

## Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Dados inválidos no request
- **401**: Token inválido ou ausente
- **403**: Token válido mas sem permissões de operador
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

## Exemplos de Erro

### Token Inválido

```json
{
  "error": "Invalid or expired token"
}
```

### Acesso Negado

```json
{
  "error": "Invalid token type. Operator access required."
}
```

### Operador Não Encontrado

```json
{
  "error": "Operator not found"
}
```

### Email Já Existe

```json
{
  "error": "Email already exists"
}
```

## Notas Importantes

1. **Segurança**: Todos os tokens de operador têm duração de 24 horas
2. **Permissões**: Apenas operadores podem criar outros operadores
3. **Logs**: Todas as ações de operadores devem ser logadas para auditoria
4. **Dados Sensíveis**: Senhas nunca são retornadas nas respostas da API
5. **Validação**: Todos os campos de entrada são validados antes do processamento

## Endpoints de Viabilidades e Problemas

### 9. Listar Viabilidades

**GET** `/operator/viabilities`

Lista todas as viabilidades com suporte a paginação e filtros.

**Headers:**

```
Authorization: Bearer <operator-token>
```

**Query Parameters (opcionais):**

- `page` (number): Página a ser exibida (padrão: 1)
- `limit` (number): Número de itens por página (padrão: 10)
- `status` (string): Filtrar por status
- `email` (string): Filtrar por email (busca parcial, case-insensitive)

**Exemplo de Requisição:**

```
GET /operator/viabilities?page=1&limit=20&status=approved&email=joao
```

**Response:**

```json
{
  "viabilities": [
    {
      "id": "uuid",
      "email": "joao@example.com",
      "fullName": "João Silva",
      "firstName": "João",
      "lastName": "Silva",
      "status": "approved",
      "portugueseMaternalLanguage": true,
      "moreThanEithteen": true,
      "emancipated": false,
      "lived5Years": true,
      "approvedAuthorization": true,
      "threeYearsPrison": false,
      "terrorist": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 10. Listar Problemas

**GET** `/operator/problems`

Lista todos os problemas com suporte a paginação e filtros.

**Headers:**

```
Authorization: Bearer <operator-token>
```

**Query Parameters (opcionais):**

- `page` (number): Página a ser exibida (padrão: 1)
- `limit` (number): Número de itens por página (padrão: 10)
- `serviceId` (string): Filtrar por ID do serviço
- `resume` (string): Filtrar por resumo (busca parcial, case-insensitive)

**Exemplo de Requisição:**

```
GET /operator/problems?page=1&limit=20&serviceId=uuid&resume=documento
```

**Response:**

```json
{
  "problems": [
    {
      "id": "uuid",
      "resume": "Problema com documento",
      "details": "Detalhes do problema...",
      "serviceId": "service-uuid",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "service": {
        "id": "service-uuid",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "user": {
          "id": "user-uuid",
          "fullName": "João Silva",
          "email": "joao@example.com"
        },
        "person": {
          "id": "person-uuid",
          "firstName": "Maria",
          "lastName": "Santos",
          "email": "maria@example.com"
        }
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Configuração no NocoDB

Para implementar esta funcionalidade, você precisa criar a tabela `operadores` no NocoDB com as seguintes colunas:

- `id` (UUID, Primary Key)
- `nome_completo` (String, Required)
- `email` (String, Unique, Required)
- `senha` (String, Required)
- `reset_token` (String, Nullable, Unique)
- `ativo` (Boolean, Default: true)
- `created_at` (DateTime, Default: now())
- `updated_at` (DateTime, Auto-update)
