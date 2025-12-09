import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the test page
  await page.goto('http://localhost:8000/test.html');

  // Wait for the widget to load
  await page.waitForTimeout(2000);

  // Take screenshot of normal state
  console.log('Taking screenshot of normal state...');
  await page.screenshot({
    path: 'normal-state.png',
    fullPage: true
  });

  // Find the chat button and hover over it
  console.log('Hovering over the button...');
  const chatButton = await page.locator('button[aria-label*="Chat"], button:has-text("Ask Blues AI")').first();

  // Move mouse to the button to trigger hover
  await chatButton.hover();

  // Wait a bit for the transition to complete
  await page.waitForTimeout(500);

  // Take screenshot of hover state
  console.log('Taking screenshot of hover state...');
  await page.screenshot({
    path: 'hover-state.png',
    fullPage: true
  });

  console.log('Screenshots captured successfully!');
  console.log('- normal-state.png: Shows the button in normal state');
  console.log('- hover-state.png: Shows the button being hovered');

  await browser.close();
})();
