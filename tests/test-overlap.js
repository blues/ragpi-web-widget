import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Navigating to test page...');
  await page.goto('http://localhost:8000/test.html');

  // Wait for page to load
  await page.waitForTimeout(2000);

  console.log('Taking initial screenshot...');
  await page.screenshot({ path: 'screenshot-before.png' });

  // Check if the widget button exists in shadow DOM
  console.log('\n--- Checking initial widget state ---');

  // The widget is in a shadow DOM, so we need to pierce through it
  const shadowHost = await page.locator('ragpi-widget').first();
  console.log('Shadow host found:', await shadowHost.count() > 0);

  // Try to find the button inside shadow DOM
  const widgetButton = await page.evaluate(() => {
    const host = document.querySelector('ragpi-widget');
    if (!host || !host.shadowRoot) {
      return { error: 'No shadow host or shadow root found' };
    }

    const button = host.shadowRoot.querySelector('[aria-label="Show widget"]');
    if (!button) {
      return { error: 'Button not found in shadow root' };
    }

    const container = button.closest('div');
    const rect = container.getBoundingClientRect();
    const classes = container.className;

    return {
      classes,
      position: {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom
      }
    };
  });

  console.log('Widget button info (before):', JSON.stringify(widgetButton, null, 2));

  // Click the toggle button
  console.log('\n--- Clicking Toggle REPL button ---');
  await page.click('#toggleRepl');
  await page.waitForTimeout(1000); // Wait for animation

  console.log('Taking screenshot after REPL toggle...');
  await page.screenshot({ path: 'screenshot-after.png' });

  // Check REPL state
  const replInfo = await page.evaluate(() => {
    const repl = document.getElementById('replPanel');
    if (!repl) return { error: 'REPL not found' };

    const rect = repl.getBoundingClientRect();
    const classes = repl.className;
    const styles = window.getComputedStyle(repl);

    return {
      classes,
      isVisible: !classes.includes('hidden'),
      position: {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
      },
      display: styles.display,
      visibility: styles.visibility
    };
  });

  console.log('REPL info (after toggle):', JSON.stringify(replInfo, null, 2));

  // Check widget button position after REPL is shown
  const widgetButtonAfter = await page.evaluate(() => {
    const host = document.querySelector('ragpi-widget');
    if (!host || !host.shadowRoot) {
      return { error: 'No shadow host or shadow root found' };
    }

    const button = host.shadowRoot.querySelector('[aria-label="Show widget"]');
    if (!button) {
      return { error: 'Button not found in shadow root' };
    }

    const container = button.closest('div');
    const rect = container.getBoundingClientRect();
    const classes = container.className;

    return {
      classes,
      position: {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom
      }
    };
  });

  console.log('\n--- Widget button info (after REPL shown) ---');
  console.log(JSON.stringify(widgetButtonAfter, null, 2));

  // Check if they overlap
  const overlap = await page.evaluate(() => {
    const host = document.querySelector('ragpi-widget');
    if (!host || !host.shadowRoot) {
      return { error: 'No shadow host or shadow root found' };
    }

    const button = host.shadowRoot.querySelector('[aria-label="Show widget"]');
    const repl = document.getElementById('replPanel');

    if (!button || !repl) {
      return { error: 'Button or REPL not found' };
    }

    const buttonContainer = button.closest('div');
    const buttonRect = buttonContainer.getBoundingClientRect();
    const replRect = repl.getBoundingClientRect();

    const horizontalOverlap = buttonRect.right > replRect.left && buttonRect.left < replRect.right;
    const verticalOverlap = buttonRect.bottom > replRect.top && buttonRect.top < replRect.bottom;
    const overlaps = horizontalOverlap && verticalOverlap;

    return {
      buttonRect: {
        left: buttonRect.left,
        right: buttonRect.right,
        top: buttonRect.top,
        bottom: buttonRect.bottom
      },
      replRect: {
        left: replRect.left,
        right: replRect.right,
        top: replRect.top,
        bottom: replRect.bottom
      },
      horizontalOverlap,
      verticalOverlap,
      overlaps
    };
  });

  console.log('\n--- Overlap Analysis ---');
  console.log(JSON.stringify(overlap, null, 2));

  // Check what querySelector sees from inside shadow DOM
  const queryTest = await page.evaluate(() => {
    const host = document.querySelector('ragpi-widget');
    if (!host || !host.shadowRoot) {
      return { error: 'No shadow host or shadow root found' };
    }

    // Try to query from shadow root
    const shadowRoot = host.shadowRoot;
    const replFromShadow = shadowRoot.querySelector('[class*="REPL"]');

    // Try to query from document
    const replFromDoc = document.querySelector('[class*="REPL"]');

    return {
      canSeenFromShadowRoot: replFromShadow !== null,
      canSeeFromDocument: replFromDoc !== null,
      replElement: replFromDoc ? {
        tagName: replFromDoc.tagName,
        className: replFromDoc.className,
        id: replFromDoc.id
      } : null
    };
  });

  console.log('\n--- Query Test from Shadow DOM ---');
  console.log(JSON.stringify(queryTest, null, 2));

  console.log('\nTest complete! Press Ctrl+C to close browser...');
  await page.waitForTimeout(60000); // Keep browser open for inspection

  await browser.close();
})();
