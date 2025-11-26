// Script para gerar 100 registros mockados completos seguindo o schema Prisma REAL
// Executar: node scripts/generate-mock-data.js > src/lib/mockDataGenerated.ts

const { ServiceStatus, DocumentType } = {
  ServiceStatus: [
    "Passo 1", "Passo 2", "Passo 3", "Passo 4", "Passo 5", "Passo 6", "Passo 7",
    "Passo 7 Esperando", "Passo 7 Aprovado", "Passo 7 Recusado", "Passo 7 Quase",
    "Passo 8", "Passo 8 Confirmado pelo Cliente", "Passo 8 Confirmado pelo Governo",
    "Cancelado", "Submetido", "Em análise", "Aguarda resposta", "Para decisão", "Concluído"
  ],
  DocumentType: ["identity", "birth_certificate", "criminal_record", "residence_title", "other"]
};

// Dados para gerar mocks realistas
const firstNames = [
  "João", "Maria", "Pedro", "Ana", "Carlos", "Beatriz", "Miguel", "Sofia", "António", "Mariana",
  "Francisco", "Leonor", "Rodrigo", "Carolina", "Tiago", "Inês", "Rafael", "Matilde", "Gonçalo", "Francisca",
  "Diogo", "Catarina", "Tomás", "Isabel", "Lucas", "Teresa", "Gabriel", "Rita", "Duarte", "Marta",
  "André", "Joana", "Martim", "Sara", "Afonso", "Laura", "Bruno", "Lúcia", "Ricardo", "Patrícia",
  "Rui", "Diana", "Paulo", "Vera", "José", "Carla", "Manuel", "Sandra", "Luís", "Helena",
  "Fernando", "Cristina", "Jorge", "Mónica", "Vasco", "Liliana", "Nuno", "Andreia", "Hugo", "Cláudia",
  "David", "Sónia", "Daniel", "Raquel", "Filipe", "Paula", "Marco", "Susana", "Sérgio", "Daniela",
  "Eduardo", "Fátima", "Alberto", "Rosa", "Vítor", "Alexandra", "Armando", "Manuela", "Joaquim", "Fernanda",
  "Américo", "Graça", "Henrique", "Conceição", "Álvaro", "Lurdes", "Augusto", "Odete", "César", "Natália"
];

const lastNames = [
  "Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins", "Jesus", "Sousa",
  "Fernandes", "Gonçalves", "Gomes", "Lopes", "Marques", "Alves", "Almeida", "Ribeiro", "Pinto", "Carvalho",
  "Teixeira", "Moreira", "Correia", "Mendes", "Nunes", "Soares", "Vieira", "Monteiro", "Cardoso", "Rocha",
  "Dias", "Castro", "Barbosa", "Tavares", "Reis", "Machado", "Campos", "Araújo", "Cunha", "Coelho",
  "Freitas", "Pires", "Ramos", "Matos", "Azevedo", "Batista", "Lima", "Fonseca", "Magalhães", "Simões"
];

const cities = ["Lisboa", "Porto", "Braga", "Coimbra", "Faro", "Setúbal", "Évora", "Aveiro", "Viseu", "Leiria"];
const professions = ["Engenheiro", "Professor", "Médico", "Advogado", "Empresário", "Designer", "Arquiteto", "Contador", "Consultor", "Dentista"];
const civilStates = ["Solteiro", "Casado", "Divorciado", "Viúvo", "União Estável"];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateNIF() {
  return `${Math.floor(100000000 + Math.random() * 900000000)}`;
}

function generatePhone() {
  return `${Math.floor(910000000 + Math.random() * 90000000)}`;
}

function generateEmail(firstName, lastName) {
  const domain = randomItem(["gmail.com", "hotmail.com", "outlook.com", "sapo.pt", "mail.pt"]);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

console.log(`// Arquivo gerado automaticamente em ${new Date().toISOString()}`);
console.log(`// 100 registros mockados completos seguindo schema Prisma REAL\n`);
console.log(`import { Service, Person, User, Address, Document, ServiceStatus, UserRole, MessageType, MessageStatus } from "./types";\n`);

// Gerar Users (clientes)
console.log("// ==================== USERS (Clientes) ====================");
console.log("export const mockUsers: User[] = [");

const users = [];
for (let i = 1; i <= 100; i++) {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  const user = {
    id: `user-${String(i).padStart(3, '0')}`,
    fullName: `${firstName} ${lastName}`,
    firstName,
    lastName,
    email: generateEmail(firstName, lastName),
    areaCode: "351",
    phone: generatePhone(),
    active: Math.random() > 0.1,
    createdAt: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
    updatedAt: randomDate(new Date(2024, 0, 1), new Date()).toISOString()
  };
  users.push(user);
  console.log(`  ${JSON.stringify(user, null, 2)},`);
}
console.log("];\n");

// Gerar Persons
console.log("// ==================== PERSONS ====================");
console.log("export const mockPersons: Person[] = [");

const persons = [];
for (let i = 1; i <= 100; i++) {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  const fatherFirstName = randomItem(firstNames);
  const fatherLastName = randomItem(lastNames);
  const motherFirstName = randomItem(["Maria", "Ana", "Beatriz", "Sofia", "Isabel", "Teresa", "Rita", "Mariana"]);
  const motherLastName = randomItem(lastNames);

  const person = {
    id: `person-${String(i).padStart(3, '0')}`,
    firstName,
    lastName,
    alternativeNames: Math.random() > 0.7 ? `${randomItem(firstNames)} ${lastName}` : null,
    email: generateEmail(firstName, lastName),
    profession: randomItem(professions),
    fatherFullName: `${fatherFirstName} ${fatherLastName}`,
    fatherAlternativeNames: Math.random() > 0.8 ? `${randomItem(firstNames)} ${fatherLastName}` : null,
    fatherBirthPlace: `${randomItem(cities)}, Brasil`,
    motherFullName: `${motherFirstName} ${motherLastName}`,
    motherAlternativeNames: Math.random() > 0.8 ? `${randomItem(["Maria", "Ana"])} ${motherLastName}` : null,
    motherBirthPlace: `${randomItem(cities)}, Brasil`,
    civilState: randomItem(civilStates),
    nationality: "Brasileira",
    birthDate: randomDate(new Date(1950, 0, 1), new Date(2000, 11, 31)).toISOString(),
    alternativeBirthDate: Math.random() > 0.9 ? randomDate(new Date(1950, 0, 1), new Date(2000, 11, 31)).toISOString() : null,
    cityPlace: "São Paulo",
    statePlace: "SP",
    countryPlace: "Brasil",
    gender: Math.random() > 0.5 ? "Masculino" : "Feminino",
    nif: Math.random() > 0.3 ? generateNIF() : null,
    residenceCountries: Math.random() > 0.5 ? "Brasil, Portugal" : "Brasil",
    otp: null,
    userId: users[i-1].id,
    createdAt: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
    updatedAt: randomDate(new Date(2024, 0, 1), new Date()).toISOString()
  };
  persons.push(person);
  console.log(`  ${JSON.stringify(person, null, 2)},`);
}
console.log("];\n");

// Gerar Addresses
console.log("// ==================== ADDRESSES ====================");
console.log("export const mockAddresses: Address[] = [");

const addresses = [];
const streets = ["Rua das Flores", "Avenida da Liberdade", "Rua Augusta", "Praça do Comércio", "Rua Garrett"];
for (let i = 1; i <= 100; i++) {
  const address = {
    id: `address-${String(i).padStart(3, '0')}`,
    street: randomItem(streets),
    postalCode: `${Math.floor(1000 + Math.random() * 8000)}-${Math.floor(100 + Math.random() * 900)}`,
    locality: randomItem(cities),
    areaCode: "351",
    phone: generatePhone(),
    email: Math.random() > 0.5 ? persons[i-1].email : null,
    complement: Math.random() > 0.6 ? `Apto ${Math.floor(1 + Math.random() * 50)}` : null,
    province: randomItem(cities),
    country: "Portugal",
    serviceId: `service-${String(i).padStart(3, '0')}`,
    createdAt: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
    updatedAt: randomDate(new Date(2024, 0, 1), new Date()).toISOString()
  };
  addresses.push(address);
  console.log(`  ${JSON.stringify(address, null, 2)},`);
}
console.log("];\n");

// Gerar Documents
console.log("// ==================== DOCUMENTS ====================");
console.log("export const mockDocuments: Document[] = [");

const documents = [];
let docId = 1;
for (let i = 1; i <= 100; i++) {
  const numDocs = Math.floor(2 + Math.random() * 4); // 2-5 documentos por serviço
  for (let j = 0; j < numDocs; j++) {
    const type = randomItem(DocumentType);
    const doc = {
      id: `doc-${String(docId++).padStart(3, '0')}`,
      name: `${type}_${persons[i-1].firstName}_${j + 1}.pdf`,
      url: `https://storage.lusio.pt/docs/${type}_${docId}.pdf`,
      title: type === "identity" ? "RG" : type === "birth_certificate" ? "Certidão de Nascimento" : "Documento",
      number: Math.random() > 0.3 ? `${Math.floor(10000000 + Math.random() * 90000000)}` : null,
      type,
      size: Math.floor(100000 + Math.random() * 5000000),
      issuedAt: Math.random() > 0.2 ? randomDate(new Date(2015, 0, 1), new Date()).toISOString() : null,
      expiresAt: type === "identity" ? randomDate(new Date(), new Date(2030, 11, 31)).toISOString() : null,
      issuedBy: type === "identity" ? "SSP/SP" : type === "birth_certificate" ? "Cartório" : null,
      approved: Math.random() > 0.3 ? true : Math.random() > 0.5 ? false : null,
      uploadedAt: randomDate(new Date(2023, 6, 1), new Date()).toISOString(),
      serviceId: `service-${String(i).padStart(3, '0')}`,
      updatedAt: randomDate(new Date(2024, 0, 1), new Date()).toISOString()
    };
    documents.push(doc);
    console.log(`  ${JSON.stringify(doc, null, 2)},`);
  }
}
console.log("];\n");

// Gerar Services
console.log("// ==================== SERVICES ====================");
console.log("export const mockServices: Service[] = [");

for (let i = 1; i <= 100; i++) {
  const status = randomItem(ServiceStatus);
  const createdDate = randomDate(new Date(2023, 0, 1), new Date(2024, 8, 1));

  const service = {
    id: `service-${String(i).padStart(3, '0')}`,
    status,
    processNumber: Math.random() > 0.4 ? `PT${Math.floor(100000 + Math.random() * 900000)}/${new Date().getFullYear()}` : null,
    processPassword: Math.random() > 0.5 ? `PWD${Math.floor(1000 + Math.random() * 9000)}` : null,
    entity: Math.random() > 0.3 ? randomItem(["IRN Lisboa", "IRN Porto", "IRN Braga", "IRN Faro"]) : null,
    reference: Math.random() > 0.4 ? `REF-${Math.floor(10000 + Math.random() * 90000)}` : null,
    assignedAt: Math.random() > 0.6 ? randomDate(createdDate, new Date()).toISOString() : null,
    isPaidTax: Math.random() > 0.3,
    paidTaxAt: Math.random() > 0.5 ? randomDate(createdDate, new Date()).toISOString() : null,
    isPaidGovernment: Math.random() > 0.4,
    paidGovernmentAt: Math.random() > 0.6 ? randomDate(createdDate, new Date()).toISOString() : null,
    paymentReferenceId: Math.random() > 0.5 ? `PAY-${Math.floor(100000 + Math.random() * 900000)}` : null,
    hasResidenceTitle: Math.random() > 0.3,
    hasBirthCertificate: Math.random() > 0.2,
    hasCriminalRecord: Math.random() > 0.4,
    hasIdentificationDocument: Math.random() > 0.1,
    hasBrasilianCriminalRecord: Math.random() > 0.5,
    documentPromotion: Math.random() > 0.7,
    refuseJustification: status.includes("Recusado") && Math.random() > 0.5 ? "Documentação incompleta" : null,
    almostJustification: status.includes("Quase") && Math.random() > 0.5 ? "Falta certidão atualizada" : null,
    sendSolicitationDate: Math.random() > 0.5 ? randomDate(createdDate, new Date()).toISOString() : null,
    submissionDate: Math.random() > 0.4 ? randomDate(createdDate, new Date()).toISOString() : null,
    createdAt: createdDate.toISOString(),
    updatedAt: randomDate(createdDate, new Date()).toISOString(),
    userId: users[i-1].id,
    personId: persons[i-1].id
  };
  console.log(`  ${JSON.stringify(service, null, 2)},`);
}
console.log("];\n");

console.log("// Total de registros gerados:");
console.log(`// - Users: ${users.length}`);
console.log(`// - Persons: ${persons.length}`);
console.log(`// - Addresses: ${addresses.length}`);
console.log(`// - Documents: ${documents.length}`);
console.log(`// - Services: 100`);
