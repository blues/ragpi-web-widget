import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the test page
  await page.goto('http://localhost:8000/test.html');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Wait a bit for React to render
  await page.waitForTimeout(1000);

  // Click the button to open the modal
  // The button text is "Ask Blues AI a question..."
  await page.click('text=Ask Blues AI a question...');

  // Wait for the modal to appear and animate
  await page.waitForTimeout(500);

  // Take a screenshot showing the modal with the subtle shadow
  await page.screenshot({
    path: 'modal-subtle-shadow.png',
    fullPage: true
  });

  console.log('Screenshot saved as modal-subtle-shadow.png');

  await browser.close();
})();
