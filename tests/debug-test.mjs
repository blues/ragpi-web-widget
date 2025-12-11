import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Listen to console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[HubIconButton]')) {
      console.log('CONSOLE:', text);
    }
  });

  console.log('Navigating to test page...');
  await page.goto('http://localhost:8000/test.html');

  // Set localStorage to hide the widget before it loads
  await page.evaluate(() => {
    localStorage.setItem('ragpi-widget-visible', 'false');
  });

  // Reload the page so the widget loads with the hidden state
  await page.reload();

  // Wait for the page to load
  await page.waitForTimeout(2000);

  console.log('\n=== Step 1: Inspecting DOM structure (widget should be hidden) ===\n');

  // Inspect the DOM structure to find the shadow host
  const domInfo = await page.evaluate(() => {
    const widget = document.querySelector('#ragpi-widget');
    if (!widget) return { error: 'Widget container not found' };

    const childNodes = Array.from(widget.childNodes).map(node => ({
      nodeName: node.nodeName,
      nodeType: node.nodeType,
      hasShadowRoot: node.shadowRoot !== null
    }));

    // Look for shadow roots in children
    for (const child of widget.childNodes) {
      if (child.shadowRoot) {
        const shadowContent = Array.from(child.shadowRoot.querySelectorAll('*')).slice(0, 10).map(el => ({
          tagName: el.tagName,
          className: el.className,
          ariaLabel: el.getAttribute('aria-label')
        }));
        return { found: true, childNodes, shadowContent };
      }
    }

    return { found: false, childNodes };
  });

  console.log('DOM info:', JSON.stringify(domInfo, null, 2));

  console.log('\n=== Step 2: Waiting for closed icon to be visible ===\n');
  await page.waitForTimeout(2000);

  console.log('\n=== Step 3: Clicking Toggle REPL button ===\n');
  await page.click('#toggleRepl');

  // Wait for animation and overlap checks
  await page.waitForTimeout(3000);

  console.log('\n=== Test complete. Browser will stay open for 30 seconds ===\n');
  await page.waitForTimeout(30000);

  await browser.close();
  process.exit(0);
})();
