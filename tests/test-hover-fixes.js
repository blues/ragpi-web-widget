import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Navigate to the test page
  await page.goto('http://localhost:8000/test.html');

  // Wait for the widget to load - the button is inside a shadow DOM
  await page.waitForTimeout(2000); // Give it time to load

  console.log('Page loaded successfully');

  // 1. Screenshot of normal state showing the border radius
  await page.screenshot({
    path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/screenshot-normal-state.png',
    fullPage: false
  });
  console.log('Screenshot 1: Normal state saved');

  // 2. Hover over the button and take screenshot
  // The button is in the shadow DOM, so we need to find it differently
  const button = await page.locator('button[aria-label="Open chat"]');
  await button.hover();

  // Wait a moment for the transition to start
  await page.waitForTimeout(200);

  await page.screenshot({
    path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/screenshot-hover-state-1.png',
    fullPage: false
  });
  console.log('Screenshot 2: Hover state (early transition) saved');

  // 3. Take another screenshot during mid-hover
  await page.waitForTimeout(150);

  await page.screenshot({
    path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/screenshot-hover-state-2.png',
    fullPage: false
  });
  console.log('Screenshot 3: Hover state (mid transition) saved');

  // 4. Take final screenshot with full hover effect
  await page.waitForTimeout(150);

  await page.screenshot({
    path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/screenshot-hover-state-3.png',
    fullPage: false
  });
  console.log('Screenshot 4: Hover state (complete) saved');

  // 5. Move away and capture return to normal
  await page.mouse.move(0, 0);
  await page.waitForTimeout(500);

  await page.screenshot({
    path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/screenshot-after-hover.png',
    fullPage: false
  });
  console.log('Screenshot 5: After hover (back to normal) saved');

  // Also capture a zoomed-in view of just the button
  const buttonBox = await button.boundingBox();
  if (buttonBox) {
    await page.screenshot({
      path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/screenshot-button-closeup-normal.png',
      clip: {
        x: Math.max(0, buttonBox.x - 20),
        y: Math.max(0, buttonBox.y - 20),
        width: buttonBox.width + 40,
        height: buttonBox.height + 40
      }
    });
    console.log('Screenshot 6: Button closeup (normal) saved');

    // Hover again for closeup
    await button.hover();
    await page.waitForTimeout(500);

    const buttonBoxHover = await button.boundingBox();
    await page.screenshot({
      path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/screenshot-button-closeup-hover.png',
      clip: {
        x: Math.max(0, buttonBoxHover.x - 20),
        y: Math.max(0, buttonBoxHover.y - 20),
        width: buttonBoxHover.width + 40,
        height: buttonBoxHover.height + 40
      }
    });
    console.log('Screenshot 7: Button closeup (hover) saved');
  }

  await browser.close();
  console.log('\nAll screenshots captured successfully!');
})();
