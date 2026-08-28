import { test, expect, Page } from '@playwright/test';

/**
 * Regression tests for Sentry DEV-BLUES-IO-2HQ: the widget read localStorage
 * unguarded in a useState initializer, so browsers with DOM storage disabled
 * (reported on Chrome Mobile WebView 114 / Android 12) threw
 * "Cannot read properties of null (reading 'getItem')" during the widget's
 * first render and the chat button never appeared.
 *
 * Each case makes storage unusable in a different way before any page script
 * runs, then asserts the widget still mounts and nothing throws uncaught.
 */

const TEST_PAGE = 'http://localhost:8000/test.html';
const CHAT_BUTTON = 'button[aria-label="Ask Blues AI a question..."]';

// Collect uncaught errors; the original bug surfaced in the host page's Sentry
// as an uncaught TypeError rather than as a visibly broken page.
const collectPageErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
};

// Preact flushes useEffect after paint, so the DOM can settle a toggle before
// the persist effect has run. Wait that out before asserting on its fallout.
const settleEffects = (page: Page) => page.waitForTimeout(250);

const expectWidgetMounted = async (page: Page, errors: string[]) => {
  await expect(page.locator(CHAT_BUTTON)).toBeVisible({ timeout: 10000 });
  await settleEffects(page);
  expect(errors).toEqual([]);
};

test.describe('Widget with localStorage unavailable', () => {
  test('mounts when window.localStorage is null', async ({ page }) => {
    // The reported failure mode: the property resolves, but to null.
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get: () => null,
      });
    });

    const errors = collectPageErrors(page);
    await page.goto(TEST_PAGE);
    await expectWidgetMounted(page, errors);
  });

  test('mounts when reading window.localStorage throws SecurityError', async ({ page }) => {
    // Chrome in a cross-origin iframe with third-party cookies blocked, and
    // Firefox with dom.storage.enabled=false: the property read itself throws,
    // which optional chaining does not catch.
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get: () => {
          throw new DOMException('Access is denied for this document.', 'SecurityError');
        },
      });
    });

    const errors = collectPageErrors(page);
    await page.goto(TEST_PAGE);
    await expectWidgetMounted(page, errors);
  });

  test('survives toggling visibility when setItem throws QuotaExceededError', async ({ page }) => {
    // Safari private browsing / storage full: reads work, writes throw. This
    // hits the persist effect on every visibility toggle.
    await page.addInitScript(() => {
      const quotaBoundStorage = {
        length: 0,
        getItem: () => null,
        setItem: () => {
          throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
        },
        removeItem: () => {},
        clear: () => {},
        key: () => null,
      };
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get: () => quotaBoundStorage,
      });
    });

    const errors = collectPageErrors(page);
    await page.goto(TEST_PAGE);
    await expectWidgetMounted(page, errors);

    // Hide, then show again: two writes that would each throw unguarded.
    await page.locator(CHAT_BUTTON).hover();
    await page.locator('button[aria-label="Hide widget"]').click();
    await expect(page.locator('button[aria-label="Show widget"]')).toBeVisible();
    await settleEffects(page);
    expect(errors).toEqual([]);

    await page.locator('button[aria-label="Show widget"]').click();
    await expectWidgetMounted(page, errors);
  });

  test('still persists visibility when storage works', async ({ page }) => {
    // The guards must not quietly disable persistence in the normal case.
    const errors = collectPageErrors(page);
    await page.goto(TEST_PAGE);
    await expectWidgetMounted(page, errors);

    await page.locator(CHAT_BUTTON).hover();
    await page.locator('button[aria-label="Hide widget"]').click();
    await expect(page.locator('button[aria-label="Show widget"]')).toBeVisible();

    await expect
      .poll(() =>
        page.evaluate(() => window.localStorage.getItem('ragpi-widget-visible'))
      )
      .toBe('false');

    // And the hidden state survives a reload.
    await page.reload();
    await expect(page.locator('button[aria-label="Show widget"]')).toBeVisible({ timeout: 10000 });
    expect(await page.locator(CHAT_BUTTON).count()).toBe(0);
    expect(errors).toEqual([]);
  });
});
