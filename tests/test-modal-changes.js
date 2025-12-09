import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to test page...');
    await page.goto('http://localhost:8000/test.html');

    // Wait for the widget to load
    await page.waitForTimeout(2000);

    console.log('Looking for the button...');

    // Find and click the button using the visible text
    const button = await page.locator('text=Ask Blues AI a question...').first();
    await button.waitFor({ state: 'visible', timeout: 10000 });

    console.log('Clicking the button to open modal...');
    await button.click();

    // Wait for modal to appear and animate
    await page.waitForTimeout(1500);

    console.log('Modal should be open, taking screenshot...');

    // Take a full page screenshot
    await page.screenshot({
      path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/modal-comprehensive-test.png',
      fullPage: true
    });

    console.log('Screenshot saved as modal-comprehensive-test.png');

    // Verify all the changes by checking for elements
    console.log('\nVerifying modal changes:');

    // 1. Check for white overlay with high opacity
    const overlay = await page.locator('[style*="background"]').first();
    const overlayStyles = await overlay.evaluate(el => window.getComputedStyle(el).backgroundColor);
    console.log('✓ Overlay background color:', overlayStyles);

    // 2. Check for Blues logo
    const logo = await page.locator('img[alt*="Blues"], img[src*="blues"]').first();
    if (await logo.count() > 0) {
      console.log('✓ Blues logo found in header');
    } else {
      console.log('✗ Blues logo NOT found');
    }

    // 3. Check for "Ask Blues AI" heading
    const heading = await page.locator('text=/Ask Blues AI/i').first();
    if (await heading.count() > 0) {
      console.log('✓ "Ask Blues AI" heading found');
    } else {
      console.log('✗ "Ask Blues AI" heading NOT found');
    }

    // 4. Check for placeholder text
    const placeholder = await page.locator('textarea, input').first();
    const placeholderText = await placeholder.getAttribute('placeholder');
    if (placeholderText && placeholderText.includes('Send a message')) {
      console.log('✓ Correct placeholder text found:', placeholderText);
    } else {
      console.log('✗ Placeholder text:', placeholderText);
    }

    // 5. Check that "Powered by Ragpi" is NOT present
    const poweredBy = await page.locator('text=/Powered by Ragpi/i');
    if (await poweredBy.count() === 0) {
      console.log('✓ "Powered by Ragpi" text correctly removed');
    } else {
      console.log('✗ "Powered by Ragpi" text still present');
    }

    // 6. Check that "Protected by reCAPTCHA" is NOT present
    const recaptcha = await page.locator('text=/Protected by reCAPTCHA/i');
    if (await recaptcha.count() === 0) {
      console.log('✓ "Protected by reCAPTCHA" text correctly removed');
    } else {
      console.log('✗ "Protected by reCAPTCHA" text still present');
    }

    // 7. Check for Send button with blue color
    const sendButton = await page.locator('button:has-text("Send"), button[type="submit"]').first();
    if (await sendButton.count() > 0) {
      const buttonColor = await sendButton.evaluate(el => window.getComputedStyle(el).backgroundColor);
      console.log('✓ Send button found with color:', buttonColor);
    } else {
      console.log('✗ Send button NOT found');
    }

    // 8. Check for modal shadow
    const modal = await page.locator('[class*="modal"], [role="dialog"]').first();
    if (await modal.count() > 0) {
      const shadowStyle = await modal.evaluate(el => window.getComputedStyle(el).boxShadow);
      console.log('✓ Modal shadow found:', shadowStyle !== 'none' ? 'Yes' : 'No');
    }

    console.log('\nTest completed successfully!');

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({
      path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/modal-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
})();
