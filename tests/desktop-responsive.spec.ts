import { test, expect } from '@playwright/test';

// Split out of mobile-responsive.spec.ts. Sharing one file meant the two
// viewport classes fought over a single file-scope test.use(): this 1024x768
// viewport won and silently applied to the mobile tests too. See the comment in
// mobile-responsive.spec.ts.
test.use({ viewport: { width: 1024, height: 768 } });

test.describe('Blues AI Widget - Tablet/Desktop Responsive Tests', () => {
  test('should display full text on desktop', async ({ page }) => {
    await page.goto('http://localhost:8000/test.html');
    await page.waitForTimeout(2000);

    // On desktop, full button text should be visible
    const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
    await expect(chatButton).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: 'screenshots/desktop-01-button.png',
      fullPage: true
    });

    console.log('✓ Desktop shows full button text');
  });

  test('should show keyboard shortcut on desktop', async ({ page }) => {
    await page.goto('http://localhost:8000/test.html');
    await page.waitForTimeout(2000);

    const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
    await expect(chatButton).toBeVisible({ timeout: 10000 });

    // Keyboard shortcut should be visible
    const shortcutText = chatButton.locator('span:has-text("⌘I"), span:has-text("Ctrl-I")');
    await expect(shortcutText.first()).toBeVisible();

    console.log('✓ Keyboard shortcut visible on desktop');
  });

  test('should show full header text on desktop', async ({ page }) => {
    await page.goto('http://localhost:8000/test.html');
    await page.waitForTimeout(2000);

    // Open modal
    const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
    await chatButton.click();
    await page.waitForTimeout(1500);

    // Full header should be visible
    const header = page.locator('text="Blues AI: Your Technical Assistant"');
    await expect(header).toBeVisible();

    await page.screenshot({
      path: 'screenshots/desktop-02-header.png',
      fullPage: true
    });

    console.log('✓ Full header text visible on desktop');
  });

  test('should show placeholder text on desktop', async ({ page }) => {
    await page.goto('http://localhost:8000/test.html');
    await page.waitForTimeout(2000);

    // Open modal
    const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
    await chatButton.click();
    await page.waitForTimeout(1500);

    // Placeholder text should be visible
    const placeholderText = page.getByText('Ask Blues AI your technical or product questions');
    await expect(placeholderText).toBeVisible();

    // Forum link should be visible
    const forumLink = page.locator('a[href*="discuss.blues.com"]');
    await expect(forumLink).toBeVisible();

    await page.screenshot({
      path: 'screenshots/desktop-03-placeholder.png',
      fullPage: true
    });

    console.log('✓ Placeholder text visible on desktop');
  });
});
