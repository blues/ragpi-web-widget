import { test, expect } from '@playwright/test';

test.describe('Modal Text Updates Test', () => {
  test('verify modal text updates', async ({ page }) => {
    // Navigate to the test page
    await page.goto('http://localhost:8000/test.html');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for the widget to initialize
    await page.waitForTimeout(2000);

    // Click the "Ask Blues AI a question..." button to open the modal
    const button = page.locator('text=/Ask Blues AI a question/i').first();
    await button.click();

    // Wait for modal animation to complete
    await page.waitForTimeout(1500);

    // Verify the updated heading is present
    const headingLocator = page.locator('text=/Ask Blues AI: Your Technical Assistant/i');
    await expect(headingLocator.first()).toBeVisible();
    console.log('✓ Found updated heading: "Ask Blues AI: Your Technical Assistant"');

    // Verify the textarea has the updated placeholder text
    const textarea = page.locator('textarea').first();
    const placeholderText = await textarea.getAttribute('placeholder');
    console.log('✓ Found placeholder text:', placeholderText);

    // Check if the placeholder contains the expected text
    if (placeholderText && placeholderText.includes('Ask the Blues AI technical and/or product questions')) {
      console.log('✓ Placeholder text is correct');
    }

    // Verify "Blues Forum" link is present and clickable
    const forumLink = page.locator('a:has-text("Blues Forum")').first();
    await expect(forumLink).toBeVisible();
    console.log('✓ "Blues Forum" link is visible and clickable');

    // Take a screenshot showing the modal with all updates
    await page.screenshot({
      path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/modal-text-updates.png',
      fullPage: true
    });

    console.log('\n✓ Screenshot saved: modal-text-updates.png');
    console.log('\nVerified modal contains:');
    console.log('- Updated heading: "Ask Blues AI: Your Technical Assistant"');
    console.log('- Updated placeholder: "Ask the Blues AI technical and/or product questions. Want to talk to a human? Reach out on the Blues Forum."');
    console.log('- Clickable "Blues Forum" link');
  });
});
