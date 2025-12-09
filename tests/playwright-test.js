import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to test page...');
    await page.goto('http://localhost:8000/test.html');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for widget to initialize

    console.log('Clicking button to open modal...');
    const button = await page.locator('text=/Ask Blues AI a question/i').first();
    await button.click();

    // Wait for modal to appear
    console.log('Waiting for modal to appear...');
    await page.waitForTimeout(1500);

    // Check if there's an iframe (the modal might be in an iframe)
    const iframeCount = await page.locator('iframe').count();
    console.log('Number of iframes found:', iframeCount);

    // Take screenshot of modal with dark grey border
    console.log('Taking screenshot of modal with dark grey border...');
    await page.screenshot({
      path: path.join(__dirname, 'modal-border-screenshot.png'),
      fullPage: false
    });
    console.log('Screenshot saved: modal-border-screenshot.png');

    // Try to get border styles from any visible modal container
    try {
      const modalElements = await page.locator('[class*="modal"]').all();
      console.log('Found modal elements:', modalElements.length);

      for (let i = 0; i < modalElements.length; i++) {
        const isVisible = await modalElements[i].isVisible();
        if (isVisible) {
          const className = await modalElements[i].getAttribute('class');
          console.log(`Modal element ${i} class:`, className);

          const styles = await modalElements[i].evaluate(el => {
            const computedStyle = window.getComputedStyle(el);
            return {
              borderWidth: computedStyle.borderWidth,
              borderColor: computedStyle.borderColor,
              borderStyle: computedStyle.borderStyle,
              border: computedStyle.border
            };
          });
          console.log(`Modal element ${i} border styles:`, styles);
        }
      }
    } catch (err) {
      console.log('Could not inspect modal styles:', err.message);
    }

    console.log('\nTest completed successfully!');

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();
