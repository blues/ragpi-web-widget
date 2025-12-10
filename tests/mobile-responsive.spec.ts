import { test, expect, devices } from '@playwright/test';

const mobileTest = test.extend({});
mobileTest.use(devices['iPhone 12']);

test.describe('Blues AI Widget - Mobile Responsive Tests', () => {
  mobileTest('should display mobile-optimized button text', async ({ page }) => {
    await page.goto('http://localhost:8000/test.html');
    await page.waitForTimeout(2000);

    // On mobile, button text should be "Ask Blues AI"
    const chatButton = page.locator('button:has-text("Ask Blues AI")');
    await expect(chatButton).toBeVisible({ timeout: 10000 });

    // Should NOT show the full text
    const longTextButton = page.locator('button:has-text("Ask Blues AI a question...")');
    expect(await longTextButton.count()).toBe(0);

    await page.screenshot({
      path: 'screenshots/mobile-01-button.png',
      fullPage: true
    });

    console.log('✓ Mobile button shows shortened text: "Ask Blues AI"');
  });

  mobileTest('should hide keyboard shortcut on mobile', async ({ page }) => {
    await page.goto('http://localhost:8000/test.html');
    await page.waitForTimeout(2000);

    const chatButton = page.locator('button:has-text("Ask Blues AI")');
    await expect(chatButton).toBeVisible({ timeout: 10000 });

    // Keyboard shortcut should not be visible on mobile
    const shortcutText = chatButton.locator('span:has-text("⌘I"), span:has-text("Ctrl-I")');
    expect(await shortcutText.count()).toBe(0);

    console.log('✓ Keyboard shortcut hidden on mobile');
  });

  mobileTest('should show thicker up arrow icon on mobile', async ({ page }) => {
    await page.goto('http://localhost:8000/test.html');
    await page.waitForTimeout(2000);

    const chatButton = page.locator('button:has-text("Ask Blues AI")');
    await expect(chatButton).toBeVisible({ timeout: 10000 });

    // Check arrow SVG stroke width
    const arrow = chatButton.locator('svg path');
    const strokeWidth = await arrow.getAttribute('stroke-width');

    // On mobile, stroke width should be 3
    expect(strokeWidth).toBe('3');

    await page.screenshot({
      path: 'screenshots/mobile-02-arrow-icon.png',
      fullPage: true
    });

    console.log('✓ Arrow icon has thicker stroke (3) on mobile');
  });

  mobileTest('should always show close button on touch devices', async ({ page }) => {
    await page.goto('http://localhost:8000/test.html');
    await page.waitForTimeout(2000);

    const chatButton = page.locator('button:has-text("Ask Blues AI")');
    await expect(chatButton).toBeVisible({ timeout: 10000 });

    // Close button should be visible on mobile without hover
    const closeButton = page.locator('button[aria-label="Hide widget"]');
    await expect(closeButton).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: 'screenshots/mobile-03-close-button-visible.png',
      fullPage: true
    });

    console.log('✓ Close button always visible on touch devices');
  });

  mobileTest('should display shortened header text on mobile', async ({ page }) => {
    await page.goto('http://localhost:8000/test.html');
    await page.waitForTimeout(2000);

    // Open modal
    const chatButton = page.locator('button:has-text("Ask Blues AI")');
    await chatButton.click();
    await page.waitForTimeout(1500);

    // Header should show "Blues AI" instead of full text
    const shortHeader = page.locator('text="Blues AI"').first();
    await expect(shortHeader).toBeVisible();

    // Should NOT show full header text
    const longHeader = page.locator('text="Blues AI: Your Technical Assistant"');
    expect(await longHeader.count()).toBe(0);

    await page.screenshot({
      path: 'screenshots/mobile-04-header.png',
      fullPage: true
    });

    console.log('✓ Header shows shortened text: "Blues AI"');
  });

  mobileTest('should hide placeholder text on mobile', async ({ page }) => {
    await page.goto('http://localhost:8000/test.html');
    await page.waitForTimeout(2000);

    // Open modal
    const chatButton = page.locator('button:has-text("Ask Blues AI")');
    await chatButton.click();
    await page.waitForTimeout(1500);

    // Placeholder text should be hidden on mobile
    const placeholderText = page.locator('text="Ask Blues AI your technical or product questions"');
    expect(await placeholderText.count()).toBe(0);

    // Blues Forum link should also be hidden
    const forumLink = page.locator('a[href*="discuss.blues.com"]');
    expect(await forumLink.count()).toBe(0);

    await page.screenshot({
      path: 'screenshots/mobile-05-no-placeholder.png',
      fullPage: true
    });

    console.log('✓ Placeholder text hidden on mobile');
  });

  mobileTest('should test hide/show widget functionality on mobile', async ({ page }) => {
    await page.goto('http://localhost:8000/test.html');
    await page.waitForTimeout(2000);

    const chatButton = page.locator('button:has-text("Ask Blues AI")');
    await expect(chatButton).toBeVisible({ timeout: 10000 });

    // Click close button to hide widget
    const closeButton = page.locator('button[aria-label="Hide widget"]');
    await closeButton.click();
    await page.waitForTimeout(1000);

    // Widget should be hidden
    await expect(chatButton).not.toBeVisible();

    // Hub icon should appear
    const hubIcon = page.locator('button[aria-label="Show widget"]');
    await expect(hubIcon).toBeVisible();

    await page.screenshot({
      path: 'screenshots/mobile-06-hub-icon.png',
      fullPage: true
    });

    // Click hub icon to show widget again
    await hubIcon.click();
    await page.waitForTimeout(1000);

    // Widget should be visible again
    await expect(chatButton).toBeVisible();

    console.log('✓ Hide/show widget functionality works on mobile');
  });

  mobileTest('Mobile: Full interaction flow', async ({ page }) => {
    console.log('\n=== MOBILE INTERACTION FLOW ===\n');

    await page.goto('http://localhost:8000/test.html');
    await page.waitForTimeout(2000);

    // 1. Initial mobile view
    await page.screenshot({ path: 'screenshots/mobile-flow-01-initial.png', fullPage: true });
    console.log('1. Mobile initial state');

    // 2. Verify button
    const chatButton = page.locator('button:has-text("Ask Blues AI")');
    await expect(chatButton).toBeVisible();
    console.log('2. Button visible with mobile text');

    // 3. Verify close button visible
    const closeButton = page.locator('button[aria-label="Hide widget"]');
    await expect(closeButton).toBeVisible();
    console.log('3. Close button always visible');

    // 4. Open modal
    await chatButton.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/mobile-flow-02-modal-open.png', fullPage: true });
    console.log('4. Modal opened');

    // 5. Verify mobile header
    const header = page.locator('text="Blues AI"').first();
    await expect(header).toBeVisible();
    console.log('5. Mobile header verified');

    // 6. Verify no placeholder text
    const placeholder = page.locator('text="Ask Blues AI your technical or product questions"');
    expect(await placeholder.count()).toBe(0);
    console.log('6. Placeholder hidden on mobile');

    // 7. Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/mobile-flow-03-closed.png', fullPage: true });
    console.log('7. Modal closed');

    console.log('\n=== MOBILE FLOW COMPLETE ===\n');
  });
});

const desktopTest = test.extend({});
desktopTest.use({
  viewport: { width: 1024, height: 768 },
});

test.describe('Blues AI Widget - Tablet/Desktop Responsive Tests', () => {
  desktopTest('should display full text on desktop', async ({ page }) => {
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

  desktopTest('should show keyboard shortcut on desktop', async ({ page }) => {
    await page.goto('http://localhost:8000/test.html');
    await page.waitForTimeout(2000);

    const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
    await expect(chatButton).toBeVisible({ timeout: 10000 });

    // Keyboard shortcut should be visible
    const shortcutText = chatButton.locator('span:has-text("⌘I"), span:has-text("Ctrl-I")');
    await expect(shortcutText.first()).toBeVisible();

    console.log('✓ Keyboard shortcut visible on desktop');
  });

  desktopTest('should show full header text on desktop', async ({ page }) => {
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

  desktopTest('should show placeholder text on desktop', async ({ page }) => {
    await page.goto('http://localhost:8000/test.html');
    await page.waitForTimeout(2000);

    // Open modal
    const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
    await chatButton.click();
    await page.waitForTimeout(1500);

    // Placeholder text should be visible
    const placeholderText = page.locator('text="Ask Blues AI your technical or product questions"');
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
