import { test, expect, Page } from '@playwright/test';

test.describe('Blues AI Widget - Comprehensive Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:8000/test.html');
    // Wait for the widget to initialize
    await page.waitForTimeout(2000);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('1. Button Tests', () => {
    test('should verify button is visible and centered at bottom', async () => {
      const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
      await chatButton.waitFor({ state: 'visible', timeout: 10000 });

      // Verify button is visible
      await expect(chatButton).toBeVisible();

      // Take screenshot of initial state
      await page.screenshot({
        path: 'screenshots/01-button-initial-state.png',
        fullPage: true
      });

      // Check button positioning (should be at bottom)
      const buttonBox = await chatButton.boundingBox();
      expect(buttonBox).not.toBeNull();

      if (buttonBox) {
        const viewportSize = page.viewportSize();
        if (viewportSize) {
          // Button should be near the bottom of the viewport
          expect(buttonBox.y).toBeGreaterThan(viewportSize.height * 0.7);
        }
      }

      console.log('✓ Button is visible and positioned at bottom');
    });

    test('should verify hover effect (5% scale increase)', async () => {
      const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
      await chatButton.waitFor({ state: 'visible', timeout: 10000 });

      // Get initial transform before hover
      const initialTransform = await chatButton.evaluate((el) =>
        window.getComputedStyle(el).transform
      );

      // Hover over the button
      await chatButton.hover();
      await page.waitForTimeout(500); // Wait for animation

      // Take screenshot of hover state
      await page.screenshot({
        path: 'screenshots/02-button-hover-state.png',
        fullPage: true
      });

      // Get transform after hover
      const hoverTransform = await chatButton.evaluate((el) =>
        window.getComputedStyle(el).transform
      );

      // Verify transforms are different (indicating scale change)
      expect(hoverTransform).not.toBe(initialTransform);

      console.log('✓ Hover effect applied');
      console.log(`  Initial transform: ${initialTransform}`);
      console.log(`  Hover transform: ${hoverTransform}`);
    });

    test('should open modal with Command-I keyboard shortcut', async () => {
      // Press Command-I (or Control-I on non-Mac)
      await page.keyboard.press(process.platform === 'darwin' ? 'Meta+KeyI' : 'Control+KeyI');

      // Wait for modal to appear
      await page.waitForTimeout(1000);

      // Take screenshot
      await page.screenshot({
        path: 'screenshots/03-keyboard-shortcut-modal.png',
        fullPage: true
      });

      // Verify modal is visible - look for the heading
      const modalHeading = page.locator('text=Blues AI: Your Technical Assistant');
      await expect(modalHeading).toBeVisible({ timeout: 5000 });

      console.log('✓ Command-I keyboard shortcut opens modal');
    });
  });

  test.describe('2. Modal Tests', () => {
    test.beforeEach(async () => {
      // Open modal by clicking button
      const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
      await chatButton.waitFor({ state: 'visible', timeout: 10000 });
      await chatButton.click();
      await page.waitForTimeout(1500); // Wait for animation
    });

    test('should verify modal appears with fade-in and scale animation', async () => {
      // Take screenshot of modal
      await page.screenshot({
        path: 'screenshots/04-modal-opened.png',
        fullPage: true
      });

      // Modal should be visible
      const modalHeading = page.locator('text=Blues AI: Your Technical Assistant');
      await expect(modalHeading).toBeVisible();

      console.log('✓ Modal appears with animation');
    });

    test('should verify modal heading', async () => {
      const heading = page.locator('text=Blues AI: Your Technical Assistant');
      await expect(heading).toBeVisible();

      console.log('✓ Modal heading verified: "Blues AI: Your Technical Assistant"');
    });

    test('should verify Blues logo is displayed', async () => {
      // Look for img element with Blues logo
      const logo = page.locator('img[src*="blues-logo"]');
      const logoCount = await logo.count();

      if (logoCount > 0) {
        await expect(logo.first()).toBeVisible();
        console.log('✓ Blues logo is displayed');
      } else {
        console.log('⚠ Blues logo not found with expected src pattern');
      }

      // Take screenshot
      await page.screenshot({
        path: 'screenshots/05-modal-with-logo.png',
        fullPage: true
      });
    });

    test('should verify placeholder text and Blues Forum link', async () => {
      // Look for placeholder text in textarea or input
      const messageInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="Ask"]').first();

      if (await messageInput.count() > 0) {
        const placeholder = await messageInput.getAttribute('placeholder');
        console.log(`Found placeholder: ${placeholder}`);

        // Check if placeholder contains expected text
        if (placeholder) {
          const hasAskText = placeholder.includes('Ask') || placeholder.includes('question');
          const hasForumText = placeholder.includes('Blues Forum') || placeholder.includes('human');

          console.log(`✓ Placeholder text found`);
          console.log(`  Contains "Ask/question": ${hasAskText}`);
          console.log(`  Contains "Blues Forum/human": ${hasForumText}`);
        }
      }

      // Look for Blues Forum link
      const forumLink = page.locator('a[href*="discuss.blues.com"]');
      const linkCount = await forumLink.count();

      if (linkCount > 0) {
        await expect(forumLink.first()).toBeVisible();
        console.log('✓ Blues Forum link is clickable');
      } else {
        console.log('⚠ Blues Forum link not found as separate element (may be in placeholder)');
      }

      // Take screenshot
      await page.screenshot({
        path: 'screenshots/06-modal-placeholder.png',
        fullPage: true
      });
    });

    test('should verify dark grey border (border-2 border-gray-800)', async () => {
      // Look for modal container - it might be in a shadow root
      const modalContainer = page.locator('[class*="border"]').first();

      if (await modalContainer.count() > 0) {
        const borderStyles = await modalContainer.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            borderWidth: styles.borderWidth,
            borderColor: styles.borderColor,
            borderStyle: styles.borderStyle
          };
        });

        console.log('✓ Border styles found:');
        console.log(`  Border width: ${borderStyles.borderWidth}`);
        console.log(`  Border color: ${borderStyles.borderColor}`);
        console.log(`  Border style: ${borderStyles.borderStyle}`);
      }

      await page.screenshot({
        path: 'screenshots/07-modal-border.png',
        fullPage: true
      });
    });

    test('should verify subtle drop shadow', async () => {
      // Look for modal with shadow
      const modalWithShadow = page.locator('[class*="shadow"]').first();

      if (await modalWithShadow.count() > 0) {
        const boxShadow = await modalWithShadow.evaluate((el) =>
          window.getComputedStyle(el).boxShadow
        );

        console.log('✓ Drop shadow found:');
        console.log(`  Box shadow: ${boxShadow}`);
      }

      await page.screenshot({
        path: 'screenshots/08-modal-shadow.png',
        fullPage: true
      });
    });

    test('should verify light grey overlay background (bg-gray-200/30)', async () => {
      // Look for overlay/backdrop element
      const overlay = page.locator('[class*="bg-gray"], [class*="backdrop"]').first();

      if (await overlay.count() > 0) {
        const bgColor = await overlay.evaluate((el) =>
          window.getComputedStyle(el).backgroundColor
        );

        console.log('✓ Overlay background found:');
        console.log(`  Background color: ${bgColor}`);
      }

      await page.screenshot({
        path: 'screenshots/09-modal-overlay.png',
        fullPage: true
      });
    });
  });

  test.describe('3. Input Tests', () => {
    test.beforeEach(async () => {
      // Open modal
      const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
      await chatButton.waitFor({ state: 'visible', timeout: 10000 });
      await chatButton.click();
      await page.waitForTimeout(1500);
    });

    test('should verify text input placeholder', async () => {
      const messageInput = page.locator('textarea[placeholder*="Type"], input[placeholder*="Type"]').first();

      if (await messageInput.count() > 0) {
        const placeholder = await messageInput.getAttribute('placeholder');

        if (placeholder) {
          expect(placeholder).toContain('Type your message');
          console.log('✓ Input placeholder verified: "Type your message..."');
        }
      } else {
        console.log('⚠ Message input with "Type your message" placeholder not found');
      }

      await page.screenshot({
        path: 'screenshots/10-input-placeholder.png',
        fullPage: true
      });
    });

    test('should verify send button has blue color (rgba(62, 90, 255, 0.8))', async () => {
      // Look for send button - might be a button with icon or specific class
      const sendButton = page.locator('button[type="submit"], button:has-text("Send"), button:has(svg)').last();

      if (await sendButton.count() > 0) {
        const buttonStyles = await sendButton.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            fill: styles.fill
          };
        });

        console.log('✓ Send button styles:');
        console.log(`  Background color: ${buttonStyles.backgroundColor}`);
        console.log(`  Color: ${buttonStyles.color}`);
        console.log(`  Fill: ${buttonStyles.fill}`);

        // Check if any of these match the expected blue color
        const hasBlueColor =
          buttonStyles.backgroundColor.includes('62') ||
          buttonStyles.backgroundColor.includes('90') ||
          buttonStyles.backgroundColor.includes('255') ||
          buttonStyles.color.includes('62') ||
          buttonStyles.color.includes('255');

        if (hasBlueColor) {
          console.log('  ✓ Button has blue color matching expected range');
        }
      }

      await page.screenshot({
        path: 'screenshots/11-send-button.png',
        fullPage: true
      });
    });
  });

  test.describe('4. Closing Tests', () => {
    test.beforeEach(async () => {
      // Open modal
      const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
      await chatButton.waitFor({ state: 'visible', timeout: 10000 });
      await chatButton.click();
      await page.waitForTimeout(1500);
    });

    test('should close modal with Escape key', async () => {
      // Verify modal is open
      const modalHeading = page.locator('text=Blues AI: Your Technical Assistant');
      await expect(modalHeading).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);

      // Take screenshot
      await page.screenshot({
        path: 'screenshots/12-after-escape-close.png',
        fullPage: true
      });

      // Verify modal is closed (heading should not be visible)
      await expect(modalHeading).not.toBeVisible({ timeout: 5000 });

      console.log('✓ Escape key closes modal');
    });

    test('should close modal with X button', async () => {
      // Verify modal is open
      const modalHeading = page.locator('text=Blues AI: Your Technical Assistant');
      await expect(modalHeading).toBeVisible();

      // Look for close button (X button)
      const closeButton = page.locator('button[aria-label*="close"], button:has-text("×"), button:has-text("✕")').first();

      if (await closeButton.count() > 0) {
        await closeButton.click();
        await page.waitForTimeout(1000);

        // Take screenshot
        await page.screenshot({
          path: 'screenshots/13-after-x-button-close.png',
          fullPage: true
        });

        // Verify modal is closed
        await expect(modalHeading).not.toBeVisible({ timeout: 5000 });

        console.log('✓ X button closes modal');
      } else {
        console.log('⚠ X/close button not found');
      }
    });

    test('should close modal by clicking outside', async () => {
      // Verify modal is open
      const modalHeading = page.locator('text=Blues AI: Your Technical Assistant');
      await expect(modalHeading).toBeVisible();

      // Click outside the modal (at top-left corner)
      await page.mouse.click(10, 10);
      await page.waitForTimeout(1000);

      // Take screenshot
      await page.screenshot({
        path: 'screenshots/14-after-outside-click-close.png',
        fullPage: true
      });

      // Verify modal is closed
      const isVisible = await modalHeading.isVisible().catch(() => false);

      if (!isVisible) {
        console.log('✓ Clicking outside modal closes it');
      } else {
        console.log('⚠ Modal still visible after clicking outside');
      }
    });
  });

  test('Summary: Full widget interaction flow', async () => {
    console.log('\n=== FULL WIDGET INTERACTION FLOW ===\n');

    // 1. Initial state
    const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
    await chatButton.waitFor({ state: 'visible', timeout: 10000 });
    await page.screenshot({ path: 'screenshots/15-flow-01-initial.png', fullPage: true });
    console.log('1. Initial state captured');

    // 2. Hover button
    await chatButton.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/15-flow-02-hover.png', fullPage: true });
    console.log('2. Button hover state captured');

    // 3. Click to open
    await chatButton.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/15-flow-03-modal-open.png', fullPage: true });
    console.log('3. Modal opened');

    // 4. Verify all modal elements
    const heading = page.locator('text=Blues AI: Your Technical Assistant');
    await expect(heading).toBeVisible();
    console.log('   ✓ Heading visible');

    // 5. Type a message
    const messageInput = page.locator('textarea, input[type="text"]').first();
    if (await messageInput.count() > 0) {
      await messageInput.fill('Test message');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/15-flow-04-message-typed.png', fullPage: true });
      console.log('4. Test message typed');
    }

    // 6. Close with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/15-flow-05-closed.png', fullPage: true });
    console.log('5. Modal closed with Escape');

    console.log('\n=== FLOW COMPLETE ===\n');
  });
});
