const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('about:blank');
  const nativeNames = await page.evaluate(() => {
    const names = new Set();
    for (const obj of [document, window, HTMLElement.prototype, Element.prototype, Node.prototype]) {
      let o = obj;
      while (o) { Object.getOwnPropertyNames(o).forEach(n => names.add(n)); o = Object.getPrototypeOf(o); }
    }
    return [...names];
  });
  const appFuncs = fs.readFileSync('D:\\EventX-mobile\\www\\index.html', 'utf8')
    .match(/^ {4}function (\w+)\(/gm)
    .map(s => s.trim().replace(/^function /, '').replace(/\($/, ''));
  const nativeSet = new Set(nativeNames);
  const collisions = [...new Set(appFuncs)].filter(n => nativeSet.has(n));
  console.log('Total app-level functions:', new Set(appFuncs).size);
  console.log('COLLISIONS with native Document/Window/Element/Node members:', collisions);
  await browser.close();
})();
