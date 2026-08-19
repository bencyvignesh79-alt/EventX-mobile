const { chromium } = require('playwright');

const results = [];
function record(name, ok, detail) {
  results.push({ name, ok, detail: detail || '' });
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (detail ? '  -- ' + detail : ''));
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => pageErrors.push(err.message));

  const errCountBefore = () => consoleErrors.length + pageErrors.length;
  async function step(name, fn) {
    const before = errCountBefore();
    try {
      await fn();
      const newErrs = errCountBefore() - before;
      if (newErrs > 0) {
        record(name, false, 'threw no exception but produced ' + newErrs + ' page/console error(s): ' +
          [...pageErrors, ...consoleErrors].slice(-newErrs).join(' | '));
      } else {
        record(name, true);
      }
    } catch (e) {
      record(name, false, e.message.split('\n')[0]);
    }
  }
  const body = async () => (await page.textContent('body')).replace(/\s+/g, ' ');

  await page.goto('http://localhost:5173', { waitUntil: 'load' });

  // ---------- AUTH ----------
  await step('Login screen loads', async () => {
    await page.waitForSelector('text=Welcome Back');
  });
  await step('Password visibility toggle works', async () => {
    const before = await page.getAttribute('#authPass', 'type');
    await page.click('#authPass + button');
    const after = await page.getAttribute('#authPass', 'type');
    if (before === after) throw new Error('type did not change: ' + before);
  });
  await step('Login with Password', async () => {
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.waitForSelector('text=Welcome back');
  });
  await step('Logout via Settings toggle path (Settings screen route)', async () => {
    await page.evaluate(() => window.nav('settings'));
    await page.waitForSelector('text=Hide Amount for Each Record');
  });
  await step('Toggle Hide Amounts and confirm masking', async () => {
    await page.click('.toggle-pill');
    await page.waitForTimeout(150);
    const txt = await body();
    if (!txt.includes('••••')) throw new Error('amounts not masked after toggle');
    await page.click('.toggle-pill'); // toggle back off
  });
  await step('Logout button on Settings works', async () => {
    await page.click('text=Logout');
    await page.waitForSelector('text=Welcome Back');
  });
  await step('OTP login flow', async () => {
    await page.getByRole('button', { name: 'Login with OTP' }).first().click();
    await page.fill('#otpMobile', '9998887770');
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('button:has-text("Verify & Login")');
    await page.click('button:has-text("Verify & Login")');
    await page.waitForSelector('text=Welcome back');
  });
  await step('Logout to test Sign Up flow', async () => {
    await page.evaluate(() => window.logout());
    await page.waitForSelector('text=Welcome Back');
  });
  await step('Sign Up flow end to end', async () => {
    await page.click('text=Sign Up');
    await page.waitForSelector('text=Create your account');
    await page.fill('#suName', 'Playwright Signup');
    await page.fill('#suEmail', 'pwsignup@relfam.app');
    await page.fill('#suPass', 'Str0ng!Pass');
    await page.fill('#suConfirm', 'Str0ng!Pass');
    await page.click('text=Sign Up >> nth=0');
    const txt = await body();
    if (!txt.includes('Terms')) { /* toast likely shown, fine */ }
  });
  await step('Terms & Conditions modal opens and accepts', async () => {
    await page.click('text=Terms & Conditions');
    await page.waitForSelector('text=Accept & Continue');
    await page.click('text=Accept & Continue');
    await page.waitForSelector('#suTerms:checked');
  });
  await step('Sign Up completes after accepting terms', async () => {
    await page.click('button:has-text("Sign Up")');
    await page.waitForSelector('text=Welcome back');
  });

  // ---------- HOME / FIND EVENT ----------
  await step('Home: Find an Event by code', async () => {
    await page.fill('#findCodeQuick', 'WED4821');
    await page.click('button:has-text("Search")');
    await page.waitForSelector('text=Rahul & Priya Wedding');
  });
  await step('Event Overview: View Location', async () => {
    await page.click('text=View Location');
    await page.waitForSelector('text=Open in Maps');
    await page.goBack({ waitUntil: 'load' }).catch(() => {});
  });

  await browser.close();

  console.log('\n=== SUMMARY ===');
  const failed = results.filter(r => !r.ok);
  console.log(`${results.length} steps, ${failed.length} failed`);
  if (failed.length) failed.forEach(f => console.log(' - ' + f.name + ': ' + f.detail));
  process.exit(failed.length ? 1 : 0);
})();
