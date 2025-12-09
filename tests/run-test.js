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

  // Find and click the button to open modal
  try {
    const button = page.locator('text=/Ask Blues AI a question/i').first();
    await button.waitFor({ timeout: 5000 });
    await button.click();
    await page.waitForTimeout(1500);

    // Take screenshot showing overlay and modal
    await page.screenshot({
      path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/modal-with-overlay.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved: modal-with-overlay.png');
  } catch (error) {
    console.error('Error in test 1:', error.message);
  }

  console.log('\nTest 2: Attempting to trigger error message...');

  // Try to trigger an error
  try {
    // Look for textarea and submit button
    const textarea = page.locator('textarea').first();
    await textarea.waitFor({ timeout: 5000 });

    // Try submitting without entering text to trigger validation error
    const submitButton = page.locator('button:has-text("Send")').first();
    await submitButton.waitFor({ timeout: 5000 });
    await submitButton.click();

    await page.waitForTimeout(2000);

    // Check if there's an error message visible
    const errorVisible = await page.locator('text=/error|forum/i').first().isVisible().catch(() => false);

    if (!errorVisible) {
      console.log('No error triggered by empty submission. Trying with invalid input...');

      // Enter some text that might trigger an error
      await textarea.fill('test');
      await submitButton.click();
      await page.waitForTimeout(3000);
    }

    // Take screenshot
    await page.screenshot({
      path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/error-message-attempt.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved: error-message-attempt.png');

    // Check if error message with forum link is visible
    const forumLink = page.locator('a[href*="discuss.blues.com"]').first();
    const isForumLinkVisible = await forumLink.isVisible().catch(() => false);

    if (isForumLinkVisible) {
      console.log('✓ Blues Forum link found in error message!');
    } else {
      console.log('ℹ Blues Forum link not visible (may need actual backend error)');
    }

  } catch (error) {
    console.error('Error in test 2:', error.message);
  }

  console.log('\nTest 3: Inspecting modal elements...');

  try {
    // Check for overlay with correct classes
    const overlay = page.locator('[class*="bg-gray-200"]').first();
    const overlayVisible = await overlay.isVisible().catch(() => false);
    console.log(overlayVisible ? '✓ Overlay with bg-gray-200 found' : '✗ Overlay not found');

    // Check for Blues logo
    const logo = page.locator('img[alt*="Blues"], img[src*="blues"]').first();
    const logoVisible = await logo.isVisible().catch(() => false);
    console.log(logoVisible ? '✓ Blues logo found' : '✗ Blues logo not found');

    // Get all visible text to check for heading
    const bodyText = await page.textContent('body');
    console.log('Page contains "Blues":', bodyText.toLowerCase().includes('blues'));

  } catch (error) {
    console.error('Error in test 3:', error.message);
  }

  // Keep browser open for a few seconds to see the result
  await page.waitForTimeout(3000);

  await browser.close();
  console.log('\nTests complete!');
})();
