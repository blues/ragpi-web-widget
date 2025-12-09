import { chromium } from 'playwright';

(async () => {
  // Launch browser
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the test page
  await page.goto('http://localhost:8000/test.html');

  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Wait a bit more for the widget to initialize
  await page.waitForTimeout(2000);

  // Take a screenshot of the full page
  await page.screenshot({
    path: 'button-screenshot.png',
    fullPage: true
  });

  console.log('Screenshot saved as button-screenshot.png');

  // Try to find and hover over the button to capture the animation
  try {
    // Wait for shadow DOM content
    await page.waitForTimeout(1000);

    // Take another screenshot after waiting
    await page.screenshot({
      path: 'button-initial.png',
      fullPage: true
    });
    console.log('Initial screenshot saved as button-initial.png');

    // Locate the button through shadow DOM if present
    const shadowHost = await page.locator('ragpi-widget-root').first();
    if (await shadowHost.count() > 0) {
      // Get the shadow root
      const button = await page.evaluateHandle(() => {
        const host = document.querySelector('ragpi-widget-root');
        if (host && host.shadowRoot) {
          return host.shadowRoot.querySelector('button');
        }
        return null;
      });

      if (button) {
        // Hover over the button
        await page.evaluate(() => {
          const host = document.querySelector('ragpi-widget-root');
          if (host && host.shadowRoot) {
            const btn = host.shadowRoot.querySelector('button');
            if (btn) {
              btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            }
          }
        });

        // Wait for the animation (500ms)
        await page.waitForTimeout(600);

        // Take screenshot during hover
        await page.screenshot({
          path: 'button-hover.png',
          fullPage: true
        });
        console.log('Hover screenshot saved as button-hover.png');
      }
    }
  } catch (error) {
    console.log('Note: Could not capture hover state:', error.message);
  }

  await browser.close();
})();
