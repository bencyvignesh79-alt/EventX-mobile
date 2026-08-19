const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(err.message));

  await page.goto('http://localhost:5173', { waitUntil: 'load' });
  await page.waitForSelector('text=Welcome Back');

  // Login: use exact-role match to avoid matching "Login with Password" / "Login with OTP"
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.waitForTimeout(300);
  console.log('After login click, body text sample:', (await page.textContent('body')).slice(0, 80).replace(/\s+/g, ' '));

  // Home -> Receive Gift -> Create New Event -> pick type -> Continue -> fill form -> click slide button
  await page.getByText('Receive Gift', { exact: false }).click();
  await page.waitForSelector('text=Create New Event');
  await page.getByRole('heading', { name: 'Create New Event' }).or(page.getByText('Create New Event')).first().click();
  await page.waitForSelector('text=Event Type');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForSelector('input#evName');
  await page.fill('#evName', 'Playwright Test Wedding');
  await page.fill('#evDate', '2026-12-25');
  await page.fill('#evTime', '18:30');
  await page.fill('#evVenue', 'Test Venue Hall');
  await page.fill('#evUpi', 'pwtest@upi');
  await page.fill('#evDesc', 'A playwright-driven test event');

  const beforeText = (await page.textContent('body')).slice(0, 50);
  console.log('BEFORE click, body starts with:', beforeText.replace(/\s+/g, ' '));

  page.on('request', () => {}); // keep listener slot stable
  const slideBtn = page.locator('button:has-text("Slide to create an event")');
  console.log('Slide button count found:', await slideBtn.count());
  console.log('Slide button visible:', await slideBtn.isVisible());
  const box = await slideBtn.boundingBox();
  console.log('Slide button bounding box:', JSON.stringify(box));

  await slideBtn.click();
  await page.waitForTimeout(500);

  const afterText = (await page.textContent('body')).slice(0, 200).replace(/\s+/g, ' ');
  console.log('AFTER click, body text:', afterText);

  await page.screenshot({ path: 'pw_after_click.png' });

  console.log('\nConsole errors:', consoleErrors.length ? consoleErrors : 'none');
  console.log('Page errors:', pageErrors.length ? pageErrors : 'none');

  await browser.close();
})().catch(async (e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
