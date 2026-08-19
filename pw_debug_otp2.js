const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text()); });
  page.on('pageerror', e => console.log('PAGE ERR:', e.message));
  await page.goto('http://localhost:5173', { waitUntil: 'load' });
  await page.waitForSelector('text=Welcome Back');

  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.waitForSelector('text=Welcome back');

  await page.evaluate(() => window.nav('settings'));
  await page.waitForSelector('text=Hide Amount for Each Record');
  await page.click('.toggle-pill');
  await page.waitForTimeout(150);
  await page.click('.toggle-pill');

  await page.click('text=Logout');
  await page.waitForSelector('text=Welcome Back');

  console.log('--- now attempting OTP flow ---');
  const otpBtn = page.getByRole('button', { name: 'Login with OTP' }).first();
  console.log('otp button count:', await page.getByRole('button', { name: 'Login with OTP' }).count());
  await otpBtn.click();
  await page.waitForTimeout(200);
  console.log('after click url/body sample:', (await page.textContent('#app')).replace(/\s+/g, ' ').slice(0, 150));

  await page.fill('#otpMobile', '9998887770');
  await page.click('button:has-text("Send OTP")');
  await page.waitForTimeout(300);
  console.log('after send otp, #app sample:', (await page.textContent('#app')).replace(/\s+/g, ' ').slice(0, 300));
  console.log('Verify & Login count:', await page.locator('button:has-text("Verify & Login")').count());

  await browser.close();
})();
