import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  console.log('Test 1: Opening modal and capturing overlay...');

  // Navigate to test page
  await page.goto('http://localhost:8000/test.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Find the shadow root and click the button within it
  try {
    // Look for the shadow host element
    const shadowHost = await page.locator('div').filter({ has: page.locator('button') }).first();

    // Try different approaches to find and click the button
    const button = page.locator('button:has-text("Ask Blues AI a question")').first();
    await button.waitFor({ timeout: 5000 });
    await button.click();

    await page.waitForTimeout(1500);

    // Take screenshot showing overlay and modal
    await page.screenshot({
      path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/modal-with-overlay.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved: modal-with-overlay.png');

    // Verify the overlay background
    const overlay = page.locator('[class*="bg-gray-200"]').first();
    const overlayVisible = await overlay.isVisible().catch(() => false);
    console.log(overlayVisible ? '✓ Light gray overlay (bg-gray-200/30) is visible' : '✗ Overlay not visible');

    // Verify Blues logo
    const logo = page.locator('img').first();
    const logoVisible = await logo.isVisible().catch(() => false);
    console.log(logoVisible ? '✓ Blues logo is visible' : '✗ Blues logo not visible');

    // Verify heading
    const heading = page.locator('text=/Ask Blues AI/i').first();
    const headingVisible = await heading.isVisible().catch(() => false);
    console.log(headingVisible ? '✓ "Ask Blues AI" heading is visible' : '✗ Heading not visible');

  } catch (error) {
    console.error('Error in test 1:', error.message);
  }

  console.log('\nTest 2: Triggering error to show Blues Forum link...');

  try {
    // Block the backend request to force an error
    await page.route('**/chat', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    // Find the textarea - need to look for the one that's not the reCAPTCHA
    const textarea = page.locator('textarea[placeholder*="Type your message"]').first();
    await textarea.waitFor({ timeout: 5000 });

    // Type a message
    await textarea.fill('This is a test message that will trigger an error');
    await page.waitForTimeout(500);

    // Click the submit button
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for the error to appear
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({
      path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/error-with-forum-link.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved: error-with-forum-link.png');

    // Verify error message is visible
    const errorText = page.locator('text=/try again later/i').first();
    const errorVisible = await errorText.isVisible().catch(() => false);
    console.log(errorVisible ? '✓ Error message is visible' : '✗ Error message not visible');

    // Verify Blues Forum link
    const forumLink = page.locator('a[href="https://discuss.blues.com"]').first();
    const forumLinkVisible = await forumLink.isVisible().catch(() => false);
    console.log(forumLinkVisible ? '✓ Blues Forum link is visible and clickable' : '✗ Forum link not visible');

    if (forumLinkVisible) {
      // Verify link text
      const linkText = await forumLink.textContent();
      console.log(`  Link text: "${linkText}"`);

      // Verify link attributes
      const href = await forumLink.getAttribute('href');
      const target = await forumLink.getAttribute('target');
      const rel = await forumLink.getAttribute('rel');
      console.log(`  href: ${href}`);
      console.log(`  target: ${target}`);
      console.log(`  rel: ${rel}`);
    }

  } catch (error) {
    console.error('Error in test 2:', error.message);
  }

  // Keep browser open for a few seconds to see the result
  console.log('\nKeeping browser open for 3 seconds...');
  await page.waitForTimeout(3000);

  await browser.close();
  console.log('\n=== Tests complete! ===\n');
  console.log('Screenshots saved:');
  console.log('1. modal-with-overlay.png - Shows overlay and modal with Blues branding');
  console.log('2. error-with-forum-link.png - Shows error message with Blues Forum link');
})();
