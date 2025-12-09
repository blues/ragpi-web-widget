import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the test page
  await page.goto('http://localhost:8000/test.html', { waitUntil: 'networkidle' });

  // Wait for widget to load
  await page.waitForTimeout(3000);

  // Try to find the input by its placeholder text
  try {
    const inputElement = await page.locator('text="Ask Blues AI a question"').first();
    const isVisible = await inputElement.isVisible({ timeout: 5000 });

    console.log(`Input element visible: ${isVisible}`);

    if (isVisible) {
      // Get the input's parent container
      const container = inputElement.locator('..').locator('..'); // Go up two levels

      // Get bounding box
      const box = await inputElement.boundingBox();
      const containerBox = await container.boundingBox();

      const viewportSize = page.viewportSize();
      const viewportCenterX = viewportSize.width / 2;

      console.log('\n='.repeat(60));
      console.log('BUTTON CENTERING ANALYSIS');
      console.log('='.repeat(60));
      console.log(`Viewport: ${viewportSize.width}px x ${viewportSize.height}px`);
      console.log(`Viewport Center: ${viewportCenterX.toFixed(2)}px`);

      if (containerBox) {
        const containerCenterX = containerBox.x + (containerBox.width / 2);
        const offset = Math.abs(containerCenterX - viewportCenterX);

        console.log('\nContainer (Input Bar):');
        console.log(`  Left: ${containerBox.x.toFixed(2)}px`);
        console.log(`  Width: ${containerBox.width.toFixed(2)}px`);
        console.log(`  Center X: ${containerCenterX.toFixed(2)}px`);
        console.log(`  Offset from viewport center: ${offset.toFixed(2)}px`);
        console.log(`  Perfectly centered: ${offset < 2 ? '✓ YES' : '✗ NO'}`);
      }

      if (box) {
        const inputCenterX = box.x + (box.width / 2);
        const offset = Math.abs(inputCenterX - viewportCenterX);

        console.log('\nInput Element:');
        console.log(`  Left: ${box.x.toFixed(2)}px`);
        console.log(`  Width: ${box.width.toFixed(2)}px`);
        console.log(`  Center X: ${inputCenterX.toFixed(2)}px`);
        console.log(`  Offset from viewport center: ${offset.toFixed(2)}px`);
        console.log(`  Perfectly centered: ${offset < 2 ? '✓ YES' : '✗ NO'}`);
      }

      // Get inline styles
      const styles = await page.evaluate(() => {
        const textInput = document.evaluate(
          "//*[contains(text(), 'Ask Blues AI')]",
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;

        if (!textInput) return null;

        let currentEl = textInput.parentElement;
        const styleInfo = [];

        // Check up to 5 parent levels
        for (let i = 0; i < 5 && currentEl; i++) {
          const style = window.getComputedStyle(currentEl);
          const inlineStyle = currentEl.style;

          if (style.position === 'fixed' || style.position === 'absolute') {
            styleInfo.push({
              level: i,
              tag: currentEl.tagName,
              id: currentEl.id,
              class: currentEl.className,
              position: style.position,
              left: style.left,
              transform: style.transform,
              inlineLeft: inlineStyle.left || 'not set',
              inlineTransform: inlineStyle.transform || 'not set'
            });
          }

          currentEl = currentEl.parentElement;
        }

        return styleInfo;
      });

      if (styles && styles.length > 0) {
        console.log('\n' + '='.repeat(60));
        console.log('POSITIONING STYLES');
        console.log('='.repeat(60));
        styles.forEach(s => {
          console.log(`\nLevel ${s.level}: ${s.tag}${s.id ? '#' + s.id : ''}${s.class ? '.' + s.class.split(' ')[0] : ''}`);
          console.log(`  Position: ${s.position}`);
          console.log(`  Inline left: ${s.inlineLeft}`);
          console.log(`  Inline transform: ${s.inlineTransform}`);
          console.log(`  Computed left: ${s.left}`);
          console.log(`  Computed transform: ${s.transform}`);
        });
      }

      console.log('\n' + '='.repeat(60));
    }
  } catch (e) {
    console.log('Could not find input element by text:', e.message);
  }

  // Take screenshot
  await page.screenshot({
    path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/button-centered-verification.png',
    fullPage: true
  });
  console.log('\nScreenshot saved to: button-centered-verification.png');

  await browser.close();
})();
