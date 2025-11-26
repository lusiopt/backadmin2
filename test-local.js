const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 Testando http://localhost:3000/backadmin (LOCAL)');

  await page.goto('http://localhost:3000/backadmin', { waitUntil: 'networkidle' });

  // Aguardar um pouco para o JavaScript rodar
  await page.waitForTimeout(3000);

  // Procurar pelo ProfileSwitcher
  const profileSwitcher = await page.locator('text=Perfil Atual').count();
  console.log(`✅ ProfileSwitcher encontrado: ${profileSwitcher > 0 ? 'SIM' : 'NÃO'}`);

  // Procurar pelo PermissionIndicator
  const permissionIndicator = await page.locator('text=Permissões').count();
  console.log(`✅ PermissionIndicator encontrado: ${permissionIndicator > 0 ? 'SIM' : 'NÃO'}`);

  // Screenshot
  await page.screenshot({ path: 'test-local-screenshot.png', fullPage: true });
  console.log('📸 Screenshot salvo em test-local-screenshot.png');

  // Mostrar o que está no header
  const headerText = await page.locator('header').textContent();
  console.log('\n📝 Conteúdo do header:', headerText);

  await browser.close();

  if (profileSwitcher > 0 && permissionIndicator > 0) {
    console.log('\n✅ SUCESSO LOCAL! Ambos os componentes estão presentes!');
    process.exit(0);
  } else {
    console.log('\n❌ FALHA LOCAL! Componentes não encontrados.');
    process.exit(1);
  }
})();
