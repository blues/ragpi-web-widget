import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:8000/test.html...');
    await page.goto('http://localhost:8000/test.html');

    // Wait for the page to load and widget to initialize
    console.log('Waiting for widget to load...');
    await page.waitForTimeout(3000);

    // Find and click the "Ask Blues AI a question..." button
    console.log('Looking for the chat button...');
    const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
    await chatButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Found chat button, clicking it...');
    await chatButton.click();

    // Wait for the modal to open
    console.log('Waiting for modal to open...');
    await page.waitForTimeout(2000);

    // Take a screenshot of the modal with the placeholder text
    console.log('Taking screenshot...');
    await page.screenshot({
      path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/modal-placeholder-screenshot.png',
      fullPage: true
    });

    console.log('Screenshot saved as modal-placeholder-screenshot.png');

    // Try to find the placeholder text
    console.log('\nLooking for placeholder text...');
    const textareas = await page.locator('textarea').all();
    for (const textarea of textareas) {
      const placeholder = await textarea.getAttribute('placeholder');
      if (placeholder) {
        console.log('\nFound placeholder text:');
        console.log(placeholder);
      }
    }

    // Try to find the Blues Forum link
    console.log('\nLooking for Blues Forum link...');
    const forumLinks = await page.locator('a[href="https://discuss.blues.com"]').all();
    console.log(`Found ${forumLinks.length} Blues Forum link(s)`);

    if (forumLinks.length > 0) {
      const linkText = await forumLinks[0].textContent();
      console.log(`Link text: "${linkText}"`);
    }

    // Also check all links in the modal
    const allLinks = await page.locator('a').all();
    console.log(`\nTotal links found: ${allLinks.length}`);
    for (const link of allLinks) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`  - "${text}" -> ${href}`);
    }

  } catch (error) {
    console.error('Error during test:', error.message);
  } finally {
    console.log('\nClosing browser in 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();
