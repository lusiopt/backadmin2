# 🚀 Deploy do Backadmin

## Processo de Deploy

O deploy segue o seguinte fluxo:

1. **Local** → Desenvolvimento e testes locais
2. **DEV (VPS)** → Testes em ambiente de desenvolvimento (`dev.lusio.market/backadmin`)
3. **Production** → Deploy para produção (apenas após aprovação no DEV)

## Como Fazer Deploy para DEV

```bash
cd /Users/euclidesgomes/Claude/projects/experimental/backadmin
./scripts/deploy/deploy-backadmin-dev.sh
```

Ou usar o caminho completo:
```bash
/Users/euclidesgomes/Claude/scripts/deploy/deploy-backadmin-dev.sh
```

## O Que o Script Faz

1. **Commit e Push para GitHub**
   - Commita todas as mudanças pendentes
   - Faz push para `main` branch

2. **Deploy na VPS via SSH**
   - Conecta em `root@72.61.165.88`
   - Faz `git pull` em `/var/www/dev/backadmin`
   - Instala dependências com `npm install`
   - Builda aplicação com `npm run build`
   - **IMPORTANTE**: Copia TODOS os arquivos necessários para standalone:
     - `.next/static` → `.next/standalone/.next/`
     - `public` → `.next/standalone/`
     - `src` → `.next/standalone/`
   - Reinicia servidor na porta 3004
   - Verifica se o servidor iniciou corretamente

3. **Verificação**
   - Testa se o site está acessível em `https://dev.lusio.market/backadmin`

## Estrutura do Build Standalone

O Next.js cria uma build standalone que precisa de TODOS estes arquivos:

```
.next/standalone/
├── .next/
│   ├── server/          # Código do servidor (criado automaticamente)
│   └── static/          # ⚠️ PRECISA SER COPIADO
├── public/              # ⚠️ PRECISA SER COPIADO
├── src/                 # ⚠️ PRECISA SER COPIADO
├── node_modules/        # Criado automaticamente (minificado)
├── package.json
└── server.js           # Entry point
```

## Correções Implementadas

### ❌ Problema Anterior
O deploy quebrava porque:
- Usava `npm ci` (muito restrito)
- Não copiava TODOS os arquivos necessários
- Não verificava se o servidor iniciou
- Log file estava errado

### ✅ Solução Implementada
- Usa `npm install` (mais flexível)
- Copia TODOS os arquivos: `.next/static`, `public`, `src`
- Verifica cada etapa do processo
- Testa se o servidor respondeu corretamente
- Log correto: `/var/log/backadmin-dev.log`

## Troubleshooting

### Servidor não inicia
```bash
ssh root@72.61.165.88
tail -50 /var/log/backadmin-dev.log
```

### Porta 3004 ocupada
```bash
ssh root@72.61.165.88
fuser -k 3004/tcp
```

### Rebuild manual na VPS
```bash
ssh root@72.61.165.88
cd /var/www/dev/backadmin
rm -rf .next node_modules
npm install
npm run build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
cp -r src .next/standalone/
fuser -k 3004/tcp
cd .next/standalone
PORT=3004 nohup node server.js > /var/log/backadmin-dev.log 2>&1 &
```

## URLs

- **DEV**: https://dev.lusio.market/backadmin
- **Configuração de Perfis**: https://dev.lusio.market/backadmin/configuracoes/perfis

## Notas Importantes

1. **SEMPRE teste no DEV antes de produção**
2. O servidor roda na porta 3004
3. Nginx faz proxy reverso de `dev.lusio.market/backadmin` para `localhost:3004`
4. Logs ficam em `/var/log/backadmin-dev.log`
5. **NUNCA** delete a pasta `.next/standalone` manualmente sem rebuild

## Configuração Next.js

O `next.config.js` está configurado com:
```javascript
output: 'standalone'  // Cria build otimizado
basePath: '/backadmin'  // Path base da aplicação
```
