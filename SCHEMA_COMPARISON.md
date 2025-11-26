# Comparação: Schema Prisma vs Mock Data

## 📊 Análise Detalhada - 27 Outubro 2025 (CORRIGIDA)

Este documento compara o schema real do banco de dados (Prisma) com os dados mock atuais do backadmin.

**IMPORTANTE**: Versão corrigida após identificação de campos inventados que não existem no schema real.

---

## 1️⃣ Model: **Person**

### ✅ Campos PRESENTES no Mock Data
- `id`, `firstName`, `lastName`, `profession`
- `fatherFullName`, `motherFullName`, `civilState`, `nationality`
- `birthDate`, `cityPlace`, `statePlace`, `countryPlace`, `gender`
- `userId`, `createdAt`

### ❌ Campos AUSENTES no Mock Data
```typescript
// Do Schema Prisma REAL (linhas 77-108)
updatedAt             DateTime @updatedAt
alternativeNames      String?   // Nomes alternativos
alternativeBirthDate  DateTime? // Data de nascimento alternativa
email                 String    // Email da pessoa
nif                   String?   // Número de Identificação Fiscal (Portugal)
residenceCountries    String?   // Países de residência
otp                   String?   // OTP para autenticação
fatherAlternativeNames String?  // Nomes alternativos do pai
fatherBirthPlace      String?   // Local de nascimento do pai
motherAlternativeNames String?  // Nomes alternativos da mãe
motherBirthPlace      String?   // Local de nascimento da mãe
```

**Impacto**: Faltam 11 campos, principalmente:
- Email da pessoa (OBRIGATÓRIO no schema)
- NIF (essencial para processos em PT)
- Nomes alternativos (pessoa, pai, mãe)
- Locais de nascimento dos pais
- Países de residência

**⚠️ CAMPOS QUE NÃO EXISTEM** (foram removidos do types.ts):
- ❌ hasSpouse, spouseFirstName, spouseLastName (e outros 10 campos de cônjuge)
- ❌ hasChildren, childrenQty
- ❌ otpExpiration

---

## 2️⃣ Model: **Address**

### ✅ Campos PRESENTES no Mock Data
- `id`, `street`, `complement`
- `postalCode`, `country`
- `serviceId`, `createdAt`

### ❌ Campos AUSENTES no Mock Data
```typescript
// Do Schema Prisma REAL (linhas 110-127)
updatedAt     DateTime @updatedAt
locality      String?   // Localidade/Cidade (em vez de city/state)
areaCode      String?   // Código de área
phone         String?   // Telefone
email         String?   // Email de contato
province      String?   // Província/Distrito (Portugal)
```

**Impacto**: Faltam 6 campos. Além disso:
- Mock usa `city`, `state`, `number` que **NÃO EXISTEM** no schema real
- Schema real usa `locality` (localidade) em vez de city/state separados
- Schema NÃO tem campo `number` (número do endereço)

**⚠️ CAMPOS INCORRETOS NO MOCK** (precisam ser substituídos):
- ❌ city → ✅ locality
- ❌ state → ✅ (não existe no schema)
- ❌ number → ✅ (não existe no schema)
- ❌ mobilePhone → ✅ phone

---

## 3️⃣ Model: **Document**

### ✅ Campos PRESENTES no Mock Data
- `id`, `name`, `url`, `type`, `size`
- `uploadedAt`, `serviceId`

### ❌ Campos AUSENTES no Mock Data
```typescript
// Do Schema Prisma REAL (linhas 129-146)
title         String?   // Título do documento
number        String?   // Número do documento (RG, CPF, Passaporte, etc)
issuedAt      DateTime? // Data de emissão
expiresAt     DateTime? // Data de validade
issuedBy      String?   // Órgão emissor
approved      Boolean?  // Status de aprovação pela advogada
updatedAt     DateTime @updatedAt
```

**Impacto**: Faltam 7 campos críticos para gestão documental:
- Metadados do documento (número, emissor, datas)
- Sistema de aprovação pela advogada

---

## 4️⃣ Model: **DocumentAttorney**

### ✅ Status no Mock Data
- Presente na estrutura mas **SEMPRE VAZIO** `[]`

### ❌ Schema Prisma Completo
```typescript
// Do Schema Prisma REAL (linhas 148-157)
id          String @id @default(cuid())
title       String   // Título do documento
attachment  String   // URL/caminho do arquivo
size        Int?     // Tamanho em bytes
uploadedAt  DateTime @default(now())
serviceId   String
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt
```

**Impacto**:
- Mock usa `name` e `url` mas schema usa `title` e `attachment`
- Documentos da advogada não estão sendo mockados

---

## 5️⃣ Model: **Service**

### ✅ Campos PRESENTES no Mock Data
- `id`, `status`, `processNumber`, `entity`, `reference`
- `isPaidTax`, `isPaidGovernment`, `paidTaxAt`, `paidGovernmentAt`
- `hasResidenceTitle`, `hasBirthCertificate`, `hasCriminalRecord`
- `hasIdentificationDocument`, `hasBrasilianCriminalRecord`
- `refuseJustification`, `almostJustification`, `submissionDate`
- `createdAt`, `userId`, `personId`

### ❌ Campos AUSENTES no Mock Data
```typescript
// Do Schema Prisma REAL (linhas 169-204)
updatedAt          DateTime @updatedAt
assignedAt         DateTime? // Data de atribuição do processo
processPassword    String?   // Senha do processo (IRN)
paymentReferenceId String?   // ID da referência de pagamento
documentPromotion  Boolean?  // Promoção de documentos
sendSolicitationDate DateTime? // Data de envio da solicitação
```

**Impacto**: Faltam 6 campos importantes

**⚠️ CAMPOS QUE NÃO EXISTEM** (foram removidos do types.ts):
- ❌ hasCivilCertificate
- ❌ hasMarriageCertificate
- ❌ hasDivorceCertificate
- ❌ hasChildBirthCertificate
- ❌ deletedAt, submittedAt, conclusionDate, appointmentDate, viabilityId, slug, otp, otpExpiration

---

## 6️⃣ Model: **Problem**

### ❌ TOTALMENTE AUSENTE no Mock Data

```typescript
// Do Schema Prisma REAL (linhas 10-21)
model Problem {
  id        String @id @default(cuid())
  resume    String @db.VarChar        // Resumo do problema
  details   String @db.Text           // Detalhes completos
  serviceId String
  service   Service @relation(...)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Impacto**: Sistema de rastreamento de problemas não implementado nos mocks.

**⚠️ ESTRUTURA ANTERIOR ESTAVA ERRADA**:
- Removi: title, description, type, priority, status
- Schema real tem apenas: resume, details

---

## 7️⃣ Model: **Viability** (Análise de Viabilidade)

### ❌ TOTALMENTE AUSENTE no Mock Data

```typescript
// Do Schema Prisma REAL (linhas 30-55)
model Viability {
  id                         String @id @default(cuid())
  email                      String @db.VarChar
  portugueseMaternalLanguage Boolean?  // Português é língua materna?
  dateFiveYears              DateTime? // Data de 5 anos
  moreThanEithteen           Boolean?  // Maior de 18 anos?
  emancipated                Boolean?  // Emancipado?
  lived5Years                Boolean?  // Viveu 5 anos em PT?
  approvedAuthorization      Boolean?  // Autorização aprovada?
  threeYearsPrison           Boolean?  // Condenação > 3 anos?
  terrorist                  Boolean?  // Atividades terroristas?
  fullName                   String @db.VarChar
  firstName                  String @db.VarChar
  lastName                   String @db.VarChar
  areaCode                   String @db.VarChar
  phone                      String @db.VarChar
  dateAuthorizationRequest   DateTime? // Data do pedido
  status                     String @db.VarChar
  descriptionPrison          String? @db.Text
  descriptionAuthorization   String? @db.Text
  descriptionTerrorist       String? @db.Text
  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt
}
```

**Impacto**: Sistema completo de análise de viabilidade não implementado.

**⚠️ ESTRUTURA ANTERIOR ESTAVA COMPLETAMENTE ERRADA**:
- Removi: result, notes, hasCriminalRecord, hasValidPassport, hasStableIncome, score, services
- Schema real é um questionário específico com perguntas sobre elegibilidade para cidadania

---

## 8️⃣ Model: **User**

### ✅ Campos PRESENTES no Mock Data
- `id`, `fullName`, `firstName`, `lastName`
- `email`, `phone`, `areaCode`, `active`, `createdAt`

### ❌ Campos AUSENTES no Mock Data
```typescript
// Do Schema Prisma REAL (linhas 57-75)
password      String    // Hash da senha
updatedAt     DateTime @updatedAt
```

**Impacto**: Apenas 2 campos faltando (password é sensível e não deve aparecer no mock)

---

## 📋 RESUMO EXECUTIVO CORRIGIDO

### Estatísticas REAIS:
- **Person**: 11 campos ausentes (~33% do schema)
- **Address**: 6 campos ausentes + 4 campos INCORRETOS (~50% problemas)
- **Document**: 7 campos ausentes (~47% do schema)
- **DocumentAttorney**: Sempre vazio + nomes de campos incorretos
- **Service**: 6 campos ausentes (~15% do schema)
- **User**: 2 campos ausentes (~15% do schema)
- **Problem**: Modelo completo ausente (mas estrutura anterior estava errada)
- **Viability**: Modelo completo ausente (estrutura anterior estava totalmente errada)

### Campos Críticos Ausentes:
1. ✅ **Person.email** (OBRIGATÓRIO no schema)
2. ✅ **Person.nif** (essencial em PT)
3. ✅ **Address.locality** (mock usa city/state incorretamente)
4. ✅ **Document metadados** (número, emissor, aprovação)
5. ✅ **Problem** (modelo completo)
6. ✅ **Viability** (modelo completo)

### ⚠️ Campos que foram REMOVIDOS por não existirem:
1. ❌ Person: hasSpouse, spouse*, hasChildren, childrenQty, otpExpiration
2. ❌ Address: city, state, number, mobilePhone
3. ❌ Service: hasCivilCertificate, hasMarriageCertificate, hasDivorceCertificate, hasChildBirthCertificate, deletedAt, submittedAt, conclusionDate, appointmentDate, viabilityId, slug, otp, otpExpiration
4. ❌ Problem: title, description, type, priority, status (estrutura errada)
5. ❌ Viability: result, notes, hasCriminalRecord, hasValidPassport, hasStableIncome, score (estrutura completamente errada)

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. ✅ **types.ts** - JÁ CORRIGIDO (removidos todos os campos inventados)
2. ⏳ **Enriquecer mockData.ts** com campos reais do schema
3. ⏳ **Implementar Problem e Viability** com estrutura correta
4. ⏳ **Corrigir Address** no mock (usar locality em vez de city/state)
5. ⏳ **Adicionar DocumentAttorney** com dados de exemplo
6. ⏳ **Testar UI** com dados completos

---

## 📌 OBSERVAÇÕES IMPORTANTES

- ✅ types.ts foi corrigido para refletir 100% do schema real
- ⚠️ Documento anterior (SCHEMA_COMPARISON.md) continha ERROS GRAVES com campos inventados
- ✅ Análise feita com base na leitura completa do schema Prisma real
- ⏳ Mock data ainda precisa ser enriquecido com os campos reais
- ❌ Aproximadamente 50% dos campos do schema ainda não estão nos mocks
- ⚠️ Address precisa de correção estrutural (não apenas adição de campos)
