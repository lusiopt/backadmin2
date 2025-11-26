const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  console.log('🔍 Testando https://dev.lusio.market/backadmin (SEM CACHE)');

  // Force hard reload - bypass cache
  await page.goto('https://dev.lusio.market/backadmin', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // Hard reload to bypass cache
  await page.reload({ waitUntil: 'networkidle' });

  // Aguardar um pouco para o JavaScript rodar
  await page.waitForTimeout(3000);

  // Procurar pelo ProfileSwitcher
  const profileSwitcher = await page.locator('text=Perfil Atual').count();
  console.log(`✅ ProfileSwitcher encontrado: ${profileSwitcher > 0 ? 'SIM' : 'NÃO'}`);

  // Procurar pelo PermissionIndicator
  const permissionIndicator = await page.locator('text=Permissões').count();
  console.log(`✅ PermissionIndicator encontrado: ${permissionIndicator > 0 ? 'SIM' : 'NÃO'}`);

  // Screenshot
  await page.screenshot({ path: 'test-components-screenshot.png', fullPage: true });
  console.log('📸 Screenshot salvo em test-components-screenshot.png');

  // Mostrar o que está no header
  const headerText = await page.locator('header').textContent();
  console.log('\n📝 Conteúdo do header:', headerText);

  await browser.close();

  if (profileSwitcher > 0 && permissionIndicator > 0) {
    console.log('\n✅ SUCESSO! Ambos os componentes estão presentes!');
    process.exit(0);
  } else {
    console.log('\n❌ FALHA! Componentes não encontrados.');
    process.exit(1);
  }
})();
