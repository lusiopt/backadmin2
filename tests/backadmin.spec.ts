import { test, expect } from '@playwright/test';

test.describe('Backadmin - Lusio Cidadania', () => {

  test.beforeEach(async ({ page }) => {
    // Navegar para a aplicação
    await page.goto('http://localhost:3000');
  });

  test('1. Redirect para login quando não autenticado', async ({ page }) => {
    // Deve redirecionar para /login
    await expect(page).toHaveURL('http://localhost:3000/login');
    await expect(page.getByRole('heading', { name: 'Lusio Backoffice' })).toBeVisible();
  });

  test('2. Login com credenciais (mock)', async ({ page }) => {
    // Preencher formulário de login
    await page.fill('input[type="email"]', 'advogada@lusio.pt');
    await page.fill('input[type="password"]', '123456');

    // Clicar em entrar
    await page.click('button:has-text("Entrar")');

    // Aguardar redirect para dashboard
    await page.waitForURL('http://localhost:3000/dashboard');

    // Verificar que está no dashboard
    await expect(page.getByRole('heading', { name: 'Pedidos de Cidadania' })).toBeVisible();
  });

  test('3. Dashboard - Exibir lista de pedidos', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'teste@teste.com');
    await page.fill('input[type="password"]', 'senha');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('http://localhost:3000/dashboard');

    // Verificar que a tabela existe
    await expect(page.locator('table')).toBeVisible();

    // Verificar headers da tabela
    await expect(page.locator('th:has-text("Cliente")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();

    // Verificar que há pedidos na tabela (pelo menos 1)
    const rows = page.locator('tbody tr');
    await expect(rows).not.toHaveCount(0);
  });

  test('4. Dashboard - Filtro por pesquisa', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'teste@teste.com');
    await page.fill('input[type="password"]', 'senha');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('http://localhost:3000/dashboard');

    // Buscar por um nome específico do mockData
    await page.fill('input[placeholder*="Nome, email"]', 'Maria');

    // Aguardar filtro aplicar
    await page.waitForTimeout(500);

    // Verificar que os resultados contêm "Maria"
    const tableContent = await page.locator('tbody').textContent();
    expect(tableContent).toContain('Maria');
  });

  test('5. Dashboard - Filtro por status', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'teste@teste.com');
    await page.fill('input[type="password"]', 'senha');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('http://localhost:3000/dashboard');

    // Selecionar um status específico
    await page.selectOption('select', 'Passo 7 Esperando');

    // Aguardar filtro aplicar
    await page.waitForTimeout(500);

    // Verificar que os resultados mostram o status correto
    const badges = page.locator('tbody .inline-flex');
    const count = await badges.count();

    // Deve haver pelo menos 1 resultado
    expect(count).toBeGreaterThan(0);
  });

  test('6. Ver detalhes de um pedido', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'teste@teste.com');
    await page.fill('input[type="password"]', 'senha');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('http://localhost:3000/dashboard');

    // Clicar no primeiro "Ver Detalhes"
    await page.locator('a:has-text("Ver Detalhes")').first().click();

    // Aguardar navegação
    await page.waitForURL(/.*\/pedidos\/.*/);

    // Verificar que está na página de detalhes (verificar pelo nome do cliente)
    await expect(page.locator('.text-3xl.font-bold').first()).toBeVisible();

    // Verificar cards de informação
    await expect(page.locator('text=Dados do Requerente')).toBeVisible();
    await expect(page.locator('text=Dados do Processo')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Documentos/ })).toBeVisible();
    await expect(page.locator('text=Ações da Advogada')).toBeVisible();
  });

  test('7. Ações da Advogada - Aprovar', async ({ page }) => {
    // Login e navegar para detalhes
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'teste@teste.com');
    await page.fill('input[type="password"]', 'senha');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('http://localhost:3000/dashboard');
    await page.locator('a:has-text("Ver Detalhes")').first().click();
    await page.waitForURL(/.*\/pedidos\/.*/);

    // Clicar em Aprovar Documentos
    await page.click('button:has-text("Aprovar Documentos")');

    // Aguardar modal aparecer
    await expect(page.locator('text=Aprovar Documentos?')).toBeVisible();

    // Confirmar aprovação
    page.once('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Sim, Aprovar")');

    // Aguardar alert
    await page.waitForTimeout(500);

    // Verificar que o status mudou para "Passo 7 Aprovado"
    await expect(page.locator('text=Passo 7 Aprovado')).toBeVisible();
  });

  test('8. Ações da Advogada - Quase', async ({ page }) => {
    // Login e navegar para detalhes
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'teste@teste.com');
    await page.fill('input[type="password"]', 'senha');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('http://localhost:3000/dashboard');
    await page.locator('a:has-text("Ver Detalhes")').first().click();
    await page.waitForURL(/.*\/pedidos\/.*/);

    // Clicar em "Quase Lá"
    await page.click('button:has-text("Quase Lá")');

    // Aguardar modal aparecer
    await expect(page.locator('text=Quase Lá - Falta algo')).toBeVisible();

    // Preencher justificativa
    await page.fill('textarea', 'Título de residência desfocado');

    // Salvar nota
    page.once('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Salvar Nota")');

    // Aguardar processamento
    await page.waitForTimeout(500);
  });

  test('9. Ações da Advogada - IRN (só após aprovação)', async ({ page }) => {
    // Login e navegar para detalhes
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'teste@teste.com');
    await page.fill('input[type="password"]', 'senha');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('http://localhost:3000/dashboard');
    await page.locator('a:has-text("Ver Detalhes")').first().click();
    await page.waitForURL(/.*\/pedidos\/.*/);

    // Verificar que botão IRN está desabilitado inicialmente
    const irnButton = page.locator('button:has-text("Inserir Dados IRN")');
    await expect(irnButton).toBeDisabled();

    // Aprovar primeiro
    await page.click('button:has-text("Aprovar Documentos")');
    page.once('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Sim, Aprovar")');
    await page.waitForTimeout(500);

    // Agora botão IRN deve estar habilitado
    await expect(irnButton).toBeEnabled();

    // Clicar em IRN
    await page.click('button:has-text("Inserir Dados IRN")');

    // Aguardar modal
    await expect(page.locator('text=Inserir Dados do IRN')).toBeVisible();

    // Preencher dados
    await page.fill('input[placeholder="12345"]', '12345');
    await page.fill('input[placeholder="123 456 789"]', '123456789');

    // Inserir e notificar
    page.once('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Inserir e Notificar Cliente")');

    // Aguardar processamento
    await page.waitForTimeout(500);

    // Verificar mudança de status para "Passo 8"
    await expect(page.locator('text=Passo 8')).toBeVisible();
  });

  test('10. Sidebar - Logout', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'teste@teste.com');
    await page.fill('input[type="password"]', 'senha');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('http://localhost:3000/dashboard');

    // Verificar sidebar
    await expect(page.locator('text=Lusio Backoffice')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Clicar em Sair
    await page.click('button:has-text("Sair")');

    // Deve redirecionar para login
    await page.waitForURL('http://localhost:3000/login');
    await expect(page.getByRole('heading', { name: 'Lusio Backoffice' })).toBeVisible();
  });
});
