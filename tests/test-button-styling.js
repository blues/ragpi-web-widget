import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport size for consistent screenshots
  await page.setViewportSize({ width: 1280, height: 720 });

  // Navigate to the test page
  console.log('Navigating to http://localhost:8000/test.html...');
  await page.goto('http://localhost:8000/test.html');

  // Wait for the button to be visible
  await page.waitForSelector('button', { timeout: 5000 });

  // Take first screenshot - button in normal state
  console.log('Taking screenshot 1: Normal state with border...');
  await page.screenshot({
    path: 'screenshot-1-normal-state.png',
    fullPage: false
  });

  // Hover over the button
  console.log('Hovering over the button...');
  await page.hover('button');

  // Wait a bit for the animation to complete
  await page.waitForTimeout(500);

  // Take second screenshot - button in hover state
  console.log('Taking screenshot 2: Hover state with scale effect...');
  await page.screenshot({
    path: 'screenshot-2-hover-state.png',
    fullPage: false
  });

  console.log('Screenshots saved successfully!');
  console.log('- screenshot-1-normal-state.png');
  console.log('- screenshot-2-hover-state.png');

  await browser.close();
})();
