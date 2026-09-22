import { test, expect } from '@playwright/test';

// The guidance copy this used to look for moved out of the composer's
// placeholder attribute and into the empty-state message in
// ChatModal/ChatMessages.tsx, so the old assertions were checking the wrong
// element for text that no longer exists anywhere in src/. They were also
// wrapped in `if (...)`, which let the test pass while asserting nothing --
// notably the Blues Forum link check, which logged a note and passed when the
// link was missing. Both are unconditional now.
test('verify modal placeholder text and Blues Forum link', async ({ page }) => {
  await page.goto('http://localhost:8000/test.html');
  await page.waitForTimeout(2000);

  const chatButton = page.locator('button:has-text("Ask Blues AI a question...")');
  await chatButton.waitFor({ state: 'visible', timeout: 10000 });
  await chatButton.click();
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'screenshots/modal-placeholder-screenshot.png',
    fullPage: true
  });

  // The composer's own placeholder.
  const composer = page.locator('textarea, input[type="text"], [placeholder]').first();
  await expect(composer).toHaveAttribute('placeholder', 'Type your message...');

  // The empty-state guidance, which is where the "talk to a human" copy lives.
  // Rendered on desktop only (ChatMessages gates it on !isMobile), which the
  // config's default Desktop Chrome viewport satisfies.
  await expect(
    page.getByText('Ask Blues AI your technical or product questions')
  ).toBeVisible();
  await expect(page.getByText('Want to talk to a human?')).toBeVisible();

  const forumLink = page.locator('a[href="https://discuss.blues.com"]');
  await expect(forumLink).toBeVisible();
  await expect(forumLink).toHaveText('Blues Forum');
});
