const { chromium } = require('playwright');

const devices = [
  {
    name: 'iPhone-SE',
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    name: 'iPhone-12-Pro',
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    name: 'Samsung-Galaxy-S21',
    viewport: { width: 360, height: 800 },
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36'
  },
  {
    name: 'iPad-Mini',
    viewport: { width: 768, height: 1024 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    name: 'Desktop-1920',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  }
];

async function testResponsive() {
  console.log('🚀 Iniciando testes de responsividade...\n');
  const browser = await chromium.launch({ headless: true });

  for (const device of devices) {
    console.log(`📱 Testando: ${device.name} (${device.viewport.width}x${device.viewport.height})`);

    const context = await browser.newContext({
      viewport: device.viewport,
      userAgent: device.userAgent,
      hasTouch: device.viewport.width < 1024
    });

    const page = await context.newPage();

    try {
      // Login - Vai para raiz que redireciona automaticamente para login
      await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForSelector('input[type="text"]', { timeout: 5000 });

      await page.fill('input[type="text"]', 'Admin Test');
      await page.fill('input[type="password"]', 'admin123');

      await page.screenshot({
        path: `screenshots/final-${device.name}-1-login.png`,
        fullPage: false
      });

      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => {
        console.log('  ⚠️  Dashboard redirect timeout, tentando continuar...');
      });

      // Dashboard
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: `screenshots/final-${device.name}-2-dashboard.png`,
        fullPage: false
      });
      console.log(`  ✓ Dashboard capturado`);

      // Clicar em Lista
      const listaButton = page.locator('button:has-text("Lista")');
      if (await listaButton.count() > 0) {
        await listaButton.click();
        await page.waitForTimeout(1000);

        await page.screenshot({
          path: `screenshots/final-${device.name}-3-lista.png`,
          fullPage: false
        });
        console.log(`  ✓ Lista capturada`);

        // Abrir primeiro processo (modal)
        if (device.viewport.width < 1024) {
          // Mobile: Cards
          const card = page.locator('.lg\\:hidden').first();
          if (await card.count() > 0) {
            await card.click();
            await page.waitForTimeout(1000);

            await page.screenshot({
              path: `screenshots/final-${device.name}-4-modal.png`,
              fullPage: false
            });
            console.log(`  ✓ Modal mobile capturado`);
          }
        } else {
          // Desktop: Tabela
          const detalhesBtn = page.locator('button:has-text("Ver Detalhes")').first();
          if (await detalhesBtn.count() > 0) {
            await detalhesBtn.click();
            await page.waitForTimeout(1000);

            await page.screenshot({
              path: `screenshots/final-${device.name}-4-modal.png`,
              fullPage: false
            });
            console.log(`  ✓ Modal desktop capturado`);
          }
        }
      }

      console.log(`  ✅ ${device.name} completo\n`);

    } catch (error) {
      console.error(`  ❌ Erro em ${device.name}:`, error.message, '\n');
    }

    await context.close();
  }

  await browser.close();
  console.log('\n✅ Testes concluídos!');
  console.log('📸 Screenshots em: screenshots/final-*');
}

testResponsive().catch(console.error);
