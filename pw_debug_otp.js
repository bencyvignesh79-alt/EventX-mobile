const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text()); });
  page.on('pageerror', e => console.log('PAGE ERR:', e.message));
  await page.goto('http://localhost:5173', { waitUntil: 'load' });
  await page.waitForSelector('text=Welcome Back');

  const otpButtons = await page.getByRole('button', { name: 'Login with OTP' }).all();
  console.log('Matching "Login with OTP" buttons:', otpButtons.length);

  await page.getByRole('button', { name: 'Login with OTP' }).first().click();
  await page.waitForTimeout(300);
  console.log('After click, body:', (await page.textContent('body')).replace(/\s+/g, ' ').slice(0, 150));

  await page.fill('#otpMobile', '9998887770');
  await page.click('button:has-text("Send OTP")');
  await page.waitForTimeout(300);
  console.log('After Send OTP, body:', (await page.textContent('body')).replace(/\s+/g, ' ').slice(0, 300));

  const verifyBtnCount = await page.locator('button:has-text("Verify & Login")').count();
  console.log('Verify & Login button count:', verifyBtnCount);

  await browser.close();
})();
