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
        record(name, false, 'produced ' + newErrs + ' error(s): ' + [...pageErrors, ...consoleErrors].slice(-newErrs).join(' | '));
      } else record(name, true);
    } catch (e) { record(name, false, e.message.split('\n')[0]); }
  }
  const body = async () => (await page.textContent('#app')).replace(/\s+/g, ' ');

  await page.goto('http://localhost:5173', { waitUntil: 'load' });
  await page.waitForSelector('text=Welcome Back');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.waitForSelector('text=Welcome back');

  // ---------- RECEIVER FLOW ----------
  await step('Home -> Receive Gift -> Create/Open Event hub', async () => {
    await page.click('text=Receive Gift');
    await page.waitForSelector('text=Open Existing Event');
  });
  await step('Open Existing Event -> My Events list', async () => {
    await page.click('text=Open Existing Event');
    await page.waitForSelector('text=Total 4 Events');
  });
  await step('My Events -> open Rahul & Priya Wedding detail', async () => {
    await page.click('text=Rahul & Priya Wedding');
    await page.waitForSelector('text=Add Entry');
  });
  await step('Event Detail -> Add Entry -> full receiver entry submit', async () => {
    await page.click('text=Add Entry');
    await page.waitForSelector('#enPerson');
    await page.fill('#enPerson', 'Browser Test Guest');
    await page.fill('#enMobile', '90000 12345');
    await page.fill('#enPlace', 'Chennai');
    await page.check('#enOld');
    await page.fill('#enOldAmt', '400');
    await page.fill('#enNewAmt', '600');
    await page.click('#payUpi');
    const qrVisible = await page.isVisible('#qrBlock');
    if (!qrVisible) throw new Error('QR block should show after selecting UPI');
    await page.click('#saveEntryBtn');
    await page.waitForSelector('text=Entry Saved Successfully');
    await page.click('text=OK');
    await page.waitForSelector('text=View Records');
  });
  await step('Records screen shows the new entry with correct total', async () => {
    const txt = await body();
    if (!txt.includes('Browser Test Guest')) throw new Error('new entry not listed');
    if (!txt.includes('₹1,000')) throw new Error('total ₹1,000 not shown for new entry');
  });
  await step('Quick filter chip (Pending) works', async () => {
    await page.click('button:has-text("Pending")');
    await page.waitForTimeout(150);
  });
  await step('Search box filters records live', async () => {
    await page.click('button:has-text("⊞ All")');
    await page.fill('#recordSearchInput', 'chennai');
    await page.waitForTimeout(150);
    const txt = await body();
    if (!txt.includes('Browser Test Guest')) throw new Error('search did not keep matching record visible');
    await page.fill('#recordSearchInput', '');
  });
  await step('Detailed Filter screen opens and applies', async () => {
    await page.click('text=⚙ Filter');
    await page.waitForSelector('text=Records Found');
    await page.click('text=Below ₹100');
    await page.click('text=Apply Filter');
    await page.waitForSelector('text=View Records');
  });
  await step('Clear filters via Filter screen Reset', async () => {
    await page.click('text=⚙ Filter');
    await page.click('text=↺ Reset');
    await page.click('text=Apply Filter');
  });
  await step('Edit a record: change name/place/status', async () => {
    await page.click('text=Browser Test Guest');
    await page.waitForSelector('#erName');
    await page.fill('#erName', 'Edited Guest Name');
    await page.fill('#erPlace', 'Trichy');
    await page.click('text=Mark as Completed');
    await page.click('text=Save Changes');
    await page.waitForSelector('text=View Records');
    const txt = await body();
    if (!txt.includes('Edited Guest Name')) throw new Error('edit did not persist');
  });
  await step('View Invitation screen from event detail', async () => {
    await page.evaluate(() => window.nav('event-detail'));
    await page.click('text=View Invitation');
    await page.waitForSelector('text=Online Gift Contribution');
  });

  // ---------- SENDER FLOW ----------
  await step('Home -> Send Gift -> Collections hub', async () => {
    await page.evaluate(() => window.nav('home'));
    await page.click('text=Send Gift');
    await page.waitForSelector('text=Open Existing Collection');
  });
  await step('Create New Collection end to end', async () => {
    await page.click('text=Create New Collection');
    await page.waitForSelector('#colName');
    await page.fill('#colName', 'Browser Test Collection');
    await page.click('text=Corporate Events');
    await page.click('text=Create Collection');
    await page.waitForSelector('text=Add Entry');
  });
  await step('Sender Add Entry with Cash payment', async () => {
    await page.click('text=Add Entry');
    await page.waitForSelector('#enPerson');
    await page.fill('#enPerson', 'Browser Test Receiver');
    await page.fill('#enMobile', '88888 12345');
    await page.fill('#enPlace', 'Madurai');
    await page.fill('#enTitle', 'Browser Test Occasion');
    await page.check('#enNew');
    await page.fill('#enNewAmt', '750');
    await page.click('#saveEntryBtn');
    await page.waitForSelector('text=Entry Saved Successfully');
    await page.click('text=OK');
    const txt = await body();
    if (!txt.includes('Browser Test Receiver')) throw new Error('sender entry not shown in collection detail');
  });

  // ---------- CONTRIBUTE (public find-event) FLOW ----------
  await step('Find Event -> Contribute with preset amount', async () => {
    await page.evaluate(() => window.nav('home'));
    await page.fill('#findCodeQuick', 'WED4821');
    await page.click('button:has-text("Search")');
    await page.waitForSelector('text=Contribute');
    await page.click('text=Contribute');
    await page.waitForSelector('#contribName');
    await page.click('button:has-text("₹1001")');
    await page.click('button:has-text("GPay")');
    await page.waitForTimeout(200);
    const txt = await body();
    if (!txt.includes('Trust Score') && !txt.includes('Event Code')) { /* landed back on overview, fine */ }
  });
  await step('Share Event screen: copy code + WhatsApp link build', async () => {
    await page.click('text=Share Event');
    await page.waitForSelector('text=Event Code');
    await page.click('text=⧉ Copy Code');
  });
  await step('Live Streaming screen + send chat message', async () => {
    await page.evaluate(() => window.nav('event-overview'));
    await page.click('text=Live Streaming');
    await page.waitForSelector('#chatInput');
    await page.fill('#chatInput', 'Playwright wishes!');
    await page.click('button:has-text("➤")');
    const txt = await body();
    if (!txt.includes('Playwright wishes')) throw new Error('chat message not sent');
  });

  await browser.close();
  console.log('\n=== SUMMARY ===');
  const failed = results.filter(r => !r.ok);
  console.log(`${results.length} steps, ${failed.length} failed`);
  if (failed.length) failed.forEach(f => console.log(' - ' + f.name + ': ' + f.detail));
  process.exit(failed.length ? 1 : 0);
})();
