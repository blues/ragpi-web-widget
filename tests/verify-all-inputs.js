import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the test page
  await page.goto('http://localhost:8000/test.html', { waitUntil: 'networkidle' });

  // Wait for widget to load
  await page.waitForTimeout(3000);

  // Find ALL input/textarea elements and their positions
  const allInputs = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"]'));
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportCenterX = viewportWidth / 2;

    return inputs.map(input => {
      const rect = input.getBoundingClientRect();
      const style = window.getComputedStyle(input);
      const inlineStyle = input.style;

      // Find positioned ancestor
      let positionedAncestor = null;
      let parent = input.parentElement;
      while (parent && !positionedAncestor) {
        const pStyle = window.getComputedStyle(parent);
        if (pStyle.position === 'fixed' || pStyle.position === 'absolute') {
          const pRect = parent.getBoundingClientRect();
          const pCenterX = pRect.left + (pRect.width / 2);
          positionedAncestor = {
            tag: parent.tagName,
            id: parent.id,
            class: parent.className,
            position: pStyle.position,
            left: pStyle.left,
            transform: pStyle.transform,
            inlineLeft: parent.style.left || 'not set',
            inlineTransform: parent.style.transform || 'not set',
            width: pRect.width.toFixed(2),
            centerX: pCenterX.toFixed(2),
            offsetFromCenter: Math.abs(pCenterX - viewportCenterX).toFixed(2)
          };
        }
        parent = parent.parentElement;
      }

      const centerX = rect.left + (rect.width / 2);
      const offset = Math.abs(centerX - viewportCenterX);

      return {
        tag: input.tagName,
        id: input.id,
        placeholder: input.placeholder || 'none',
        type: input.type,
        rect: {
          left: rect.left.toFixed(2),
          top: rect.top.toFixed(2),
          width: rect.width.toFixed(2),
          height: rect.height.toFixed(2),
          centerX: centerX.toFixed(2)
        },
        viewport: {
          width: viewportWidth,
          height: viewportHeight,
          centerX: viewportCenterX.toFixed(2)
        },
        centering: {
          offset: offset.toFixed(2),
          isCentered: offset < 2
        },
        styles: {
          position: style.position,
          display: style.display,
          visibility: style.visibility,
          left: style.left,
          transform: style.transform,
          inlineLeft: inlineStyle.left || 'not set',
          inlineTransform: inlineStyle.transform || 'not set'
        },
        positionedAncestor
      };
    });
  });

  console.log('='.repeat(70));
  console.log('ALL INPUT/TEXTAREA ELEMENTS FOUND');
  console.log('='.repeat(70));
  console.log(`Total: ${allInputs.length}\n`);

  allInputs.forEach((input, idx) => {
    console.log(`Input ${idx + 1}: ${input.tag}${input.id ? '#' + input.id : ''}`);
    console.log(`  Placeholder: "${input.placeholder}"`);
    console.log(`  Position: ${input.rect.left}px from left, ${input.rect.top}px from top`);
    console.log(`  Size: ${input.rect.width}px x ${input.rect.height}px`);
    console.log(`  Element center X: ${input.rect.centerX}px`);
    console.log(`  Viewport center X: ${input.viewport.centerX}px`);
    console.log(`  Offset from center: ${input.centering.offset}px`);
    console.log(`  Perfectly centered: ${input.centering.isCentered ? '✓ YES' : '✗ NO'}`);
    console.log(`  Display: ${input.styles.display}, Visibility: ${input.styles.visibility}`);
    console.log(`  Position: ${input.styles.position}`);
    console.log(`  Inline left: ${input.styles.inlineLeft}`);
    console.log(`  Inline transform: ${input.styles.inlineTransform}`);
    console.log(`  Computed left: ${input.styles.left}`);
    console.log(`  Computed transform: ${input.styles.transform}`);

    if (input.positionedAncestor) {
      console.log(`  Positioned Ancestor: ${input.positionedAncestor.tag}${input.positionedAncestor.id ? '#' + input.positionedAncestor.id : ''}`);
      console.log(`    Position: ${input.positionedAncestor.position}`);
      console.log(`    Width: ${input.positionedAncestor.width}px`);
      console.log(`    Center X: ${input.positionedAncestor.centerX}px`);
      console.log(`    Offset from center: ${input.positionedAncestor.offsetFromCenter}px`);
      console.log(`    Inline left: ${input.positionedAncestor.inlineLeft}`);
      console.log(`    Inline transform: ${input.positionedAncestor.inlineTransform}`);
      console.log(`    Computed left: ${input.positionedAncestor.left}`);
      console.log(`    Computed transform: ${input.positionedAncestor.transform}`);
    }

    console.log('');
  });

  console.log('='.repeat(70));

  // Take screenshot
  await page.screenshot({
    path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/button-centered-verification.png',
    fullPage: true
  });
  console.log('\nScreenshot saved to: button-centered-verification.png');

  await browser.close();
})();
