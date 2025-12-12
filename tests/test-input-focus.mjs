import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Navigating to test page...');
  await page.goto('http://localhost:8000/test.html');

  // Wait for the widget to be fully loaded
  console.log('Waiting for widget to load...');
  await page.waitForTimeout(3000);

  // Check if the widget loaded
  const widgetLoaded = await page.evaluate(() => {
    const widget = document.querySelector('#ragpi-widget');
    return widget !== null;
  });

  console.log('Widget loaded:', widgetLoaded);

  if (!widgetLoaded) {
    console.error('ERROR: Widget did not load. Exiting test.');
    await browser.close();
    process.exit(1);
  }

  console.log('\n=== Test 1: Opening modal by clicking chat button ===\n');

  // Click the chat button to open the modal
  const chatButtonClicked = await page.evaluate(() => {
    const host = document.querySelector('#ragpi-widget');
    if (!host) return { error: 'Widget container not found' };

    let shadowHost = null;
    for (const child of host.childNodes) {
      if (child.shadowRoot) {
        shadowHost = child;
        break;
      }
    }

    if (!shadowHost) return { error: 'Shadow host not found' };

    const button = shadowHost.shadowRoot.querySelector('[aria-label="Open chat"]');
    if (!button) return { error: 'Chat button not found' };

    button.click();
    return { success: true };
  });

  console.log('Chat button click result:', JSON.stringify(chatButtonClicked));
  await page.waitForTimeout(1000);

  // Check if the textarea has focus
  const focusCheck = await page.evaluate(() => {
    const host = document.querySelector('#ragpi-widget');
    if (!host) return { error: 'Widget container not found' };

    let shadowHost = null;
    for (const child of host.childNodes) {
      if (child.shadowRoot) {
        shadowHost = child;
        break;
      }
    }

    if (!shadowHost) return { error: 'Shadow host not found' };

    const textarea = shadowHost.shadowRoot.querySelector('textarea[placeholder="Type your message..."]');
    if (!textarea) return { error: 'Textarea not found' };

    const hasFocus = document.activeElement === shadowHost && shadowHost.shadowRoot.activeElement === textarea;

    return {
      hasFocus,
      textareaFound: true,
      activeElement: document.activeElement ? document.activeElement.tagName : null,
      shadowActiveElement: shadowHost.shadowRoot.activeElement ? shadowHost.shadowRoot.activeElement.tagName : null
    };
  });

  console.log('Focus check after clicking button:', JSON.stringify(focusCheck, null, 2));

  if (focusCheck.hasFocus) {
    console.log('✓ PASS: Textarea has focus after clicking button');
  } else {
    console.log('✗ FAIL: Textarea does NOT have focus after clicking button');
  }

  // Close the modal
  await page.evaluate(() => {
    const host = document.querySelector('#ragpi-widget');
    let shadowHost = null;
    for (const child of host.childNodes) {
      if (child.shadowRoot) {
        shadowHost = child;
        break;
      }
    }
    const closeButton = shadowHost.shadowRoot.querySelector('[aria-label="Close chat"]');
    if (closeButton) closeButton.click();
  });

  await page.waitForTimeout(500);

  console.log('\n=== Test 2: Opening modal with keyboard shortcut (Cmd+I / Ctrl+I) ===\n');

  // Use keyboard shortcut to open the modal
  const isMac = process.platform === 'darwin';
  if (isMac) {
    await page.keyboard.press('Meta+KeyI');
  } else {
    await page.keyboard.press('Control+KeyI');
  }

  await page.waitForTimeout(1000);

  // Check if the textarea has focus after keyboard shortcut
  const focusCheckKeyboard = await page.evaluate(() => {
    const host = document.querySelector('#ragpi-widget');
    if (!host) return { error: 'Widget container not found' };

    let shadowHost = null;
    for (const child of host.childNodes) {
      if (child.shadowRoot) {
        shadowHost = child;
        break;
      }
    }

    if (!shadowHost) return { error: 'Shadow host not found' };

    const textarea = shadowHost.shadowRoot.querySelector('textarea[placeholder="Type your message..."]');
    if (!textarea) return { error: 'Textarea not found' };

    const hasFocus = document.activeElement === shadowHost && shadowHost.shadowRoot.activeElement === textarea;

    return {
      hasFocus,
      textareaFound: true,
      activeElement: document.activeElement ? document.activeElement.tagName : null,
      shadowActiveElement: shadowHost.shadowRoot.activeElement ? shadowHost.shadowRoot.activeElement.tagName : null
    };
  });

  console.log('Focus check after keyboard shortcut:', JSON.stringify(focusCheckKeyboard, null, 2));

  if (focusCheckKeyboard.hasFocus) {
    console.log('✓ PASS: Textarea has focus after keyboard shortcut');
  } else {
    console.log('✗ FAIL: Textarea does NOT have focus after keyboard shortcut');
  }

  console.log('\n=== Test 3: Typing in the textarea ===\n');

  // Try typing in the textarea
  await page.keyboard.type('Hello, this is a test message!');
  await page.waitForTimeout(500);

  const textareaValue = await page.evaluate(() => {
    const host = document.querySelector('#ragpi-widget');
    let shadowHost = null;
    for (const child of host.childNodes) {
      if (child.shadowRoot) {
        shadowHost = child;
        break;
      }
    }
    const textarea = shadowHost.shadowRoot.querySelector('textarea[placeholder="Type your message..."]');
    return textarea ? textarea.value : null;
  });

  console.log('Textarea value after typing:', textareaValue);

  if (textareaValue === 'Hello, this is a test message!') {
    console.log('✓ PASS: Text was successfully typed into the textarea');
  } else {
    console.log('✗ FAIL: Text was not typed correctly. Got:', textareaValue);
  }

  console.log('\n=== All tests complete ===\n');
  console.log('Browser will stay open for 10 seconds for inspection...');
  await page.waitForTimeout(10000);

  await browser.close();
  process.exit(0);
})();
