const { chromium } = require('playwright');

const mobileDevices = [
  {
    name: 'iPhone SE',
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true
  },
  {
    name: 'iPhone 12 Pro',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true
  },
  {
    name: 'iPhone 14 Pro Max',
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 3,
    isMobile: true
  },
  {
    name: 'Samsung Galaxy S21',
    viewport: { width: 360, height: 800 },
    deviceScaleFactor: 3,
    isMobile: true
  },
  {
    name: 'iPad Mini',
    viewport: { width: 768, height: 1024 },
    deviceScaleFactor: 2,
    isMobile: true
  }
];

async function testResponsiveness() {
  const browser = await chromium.launch({ headless: true });

  for (const device of mobileDevices) {
    console.log(`\n📱 Testando: ${device.name} (${device.viewport.width}x${device.viewport.height})`);

    const context = await browser.newContext({
      viewport: device.viewport,
      deviceScaleFactor: device.deviceScaleFactor,
      isMobile: device.isMobile,
      hasTouch: device.isMobile
    });

    const page = await context.newPage();

    try {
      // Página de login
      await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
      await page.screenshot({
        path: `screenshots/mobile-${device.name.replace(/\s+/g, '-')}-login.png`,
        fullPage: true
      });
      console.log(`  ✓ Login page capturada`);

      // Fazer login
      await page.fill('input[type="email"]', 'admin@lusio.market');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**', { timeout: 5000 });

      // Dashboard
      await page.screenshot({
        path: `screenshots/mobile-${device.name.replace(/\s+/g, '-')}-dashboard.png`,
        fullPage: true
      });
      console.log(`  ✓ Dashboard capturado`);

      // Testar scroll horizontal em tabelas
      const hasHorizontalScroll = await page.evaluate(() => {
        const tables = document.querySelectorAll('table');
        for (const table of tables) {
          if (table.scrollWidth > table.clientWidth) {
            return true;
          }
        }
        return false;
      });

      if (hasHorizontalScroll) {
        console.log(`  ⚠️  PROBLEMA: Scroll horizontal detectado em tabelas`);
      }

      // Verificar se há overflow
      const hasOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });

      if (hasOverflow) {
        console.log(`  ⚠️  PROBLEMA: Overflow horizontal detectado (${await page.evaluate(() => document.body.scrollWidth)}px > ${device.viewport.width}px)`);
      }

      // Clicar em "Lista" para ver tabela
      const listButton = await page.locator('button:has-text("Lista")');
      if (await listButton.count() > 0) {
        await listButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({
          path: `screenshots/mobile-${device.name.replace(/\s+/g, '-')}-lista.png`,
          fullPage: true
        });
        console.log(`  ✓ Vista de lista capturada`);

        // Verificar se tabela está responsiva
        const tableVisible = await page.isVisible('table');
        if (tableVisible) {
          const tableWidth = await page.evaluate(() => {
            const table = document.querySelector('table');
            return table ? table.scrollWidth : 0;
          });

          if (tableWidth > device.viewport.width) {
            console.log(`  ⚠️  PROBLEMA: Tabela muito larga (${tableWidth}px > ${device.viewport.width}px)`);
          }
        }

        // Testar abrir um processo (modal)
        const verDetalhesBtn = await page.locator('button:has-text("Ver Detalhes")').first();
        if (await verDetalhesBtn.count() > 0) {
          await verDetalhesBtn.click();
          await page.waitForTimeout(1000);
          await page.screenshot({
            path: `screenshots/mobile-${device.name.replace(/\s+/g, '-')}-modal.png`,
            fullPage: true
          });
          console.log(`  ✓ Modal capturado`);

          // Verificar se modal está responsivo
          const modalWidth = await page.evaluate(() => {
            const modal = document.querySelector('[role="dialog"]');
            return modal ? modal.scrollWidth : 0;
          });

          if (modalWidth > device.viewport.width) {
            console.log(`  ⚠️  PROBLEMA: Modal muito largo (${modalWidth}px > ${device.viewport.width}px)`);
          }
        }
      }

      console.log(`  ✅ Teste completo para ${device.name}`);

    } catch (error) {
      console.error(`  ❌ Erro ao testar ${device.name}:`, error.message);
    }

    await context.close();
  }

  await browser.close();
  console.log('\n✅ Todos os testes concluídos!');
  console.log('📸 Screenshots salvos em: screenshots/');
}

testResponsiveness().catch(console.error);
