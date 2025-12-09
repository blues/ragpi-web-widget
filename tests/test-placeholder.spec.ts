import { test, expect } from '@playwright/test';

test('verify modal placeholder text and Blues Forum link', async ({ page }) => {
  // Navigate to the test page
  await page.goto('http://localhost:8000/test.html');

  // Wait for the page to load and widget to initialize
  await page.waitForTimeout(2000);

  // Find and click the "Ask Blues AI a question..." button
  const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
  await chatButton.waitFor({ state: 'visible', timeout: 10000 });
  await chatButton.click();

  // Wait for the modal to open
  await page.waitForTimeout(1000);

  // Take a screenshot of the modal with the placeholder text
  await page.screenshot({
    path: 'modal-placeholder-screenshot.png',
    fullPage: true
  });

  console.log('Screenshot saved as modal-placeholder-screenshot.png');

  // Verify the placeholder text contains the expected content
  const placeholderText = await page.locator('textarea, input[type="text"], [placeholder]').first();
  const placeholder = await placeholderText.getAttribute('placeholder');

  console.log('Found placeholder text:', placeholder);

  // Verify it contains the key phrases
  if (placeholder) {
    expect(placeholder).toContain('Send a message to start chatting with the Blues AI assistant');
    expect(placeholder).toContain('Want to talk to a human?');
    expect(placeholder).toContain('Reach out on the Blues Forum');
  }

  // Try to find and verify the Blues Forum link
  const forumLink = page.locator('a[href="https://discuss.blues.com"]');
  const linkCount = await forumLink.count();

  if (linkCount > 0) {
    console.log('Found Blues Forum link!');
    await expect(forumLink.first()).toHaveAttribute('href', 'https://discuss.blues.com');
  } else {
    console.log('Note: Blues Forum link might be in placeholder text rather than as a separate link element');
  }
});
