import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the test page
  await page.goto('http://localhost:8000/test.html', { waitUntil: 'networkidle' });

  // Wait for widget to load
  await page.waitForTimeout(3000);

  // Take a screenshot first
  await page.screenshot({
    path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/button-centered-verification.png',
    fullPage: true
  });
  console.log('Screenshot saved to: button-centered-verification.png\n');

  // Check for shadow DOM and iframes
  const domStructure = await page.evaluate(() => {
    const widget = document.querySelector('#ragpi-widget');
    if (!widget) return { hasWidget: false };

    const hasShadow = !!widget.shadowRoot;
    let shadowContent = null;

    if (hasShadow) {
      const shadowElements = Array.from(widget.shadowRoot.querySelectorAll('*'));
      shadowContent = shadowElements.slice(0, 30).map(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          id: el.id,
          class: el.className,
          width: rect.width.toFixed(0),
          height: rect.height.toFixed(0),
          bottom: rect.bottom.toFixed(0),
          left: rect.left.toFixed(0),
          position: style.position,
          display: style.display
        };
      }).filter(el => el.width > 0 && el.height > 0);
    }

    return {
      hasWidget: true,
      hasShadow,
      shadowElements: shadowContent
    };
  });

  console.log('\nDOM Structure Check:');
  console.log('==================');
  console.log(JSON.stringify(domStructure, null, 2));

  // Find all elements at the bottom of the viewport
  const centeringAnalysis = await page.evaluate(() => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const viewportCenterX = viewportWidth / 2;

    // Get all elements
    const allElements = Array.from(document.querySelectorAll('*'));
    const totalElements = allElements.length;

    // Get summary of all elements
    const allSummary = allElements.slice(0, 50).map(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        id: el.id,
        width: rect.width.toFixed(0),
        height: rect.height.toFixed(0),
        bottom: rect.bottom.toFixed(0),
        display: style.display,
        visibility: style.visibility
      };
    });

    // Filter to elements near the bottom that have decent size
    // Note: We check for elements that are visually rendered (width/height > 0)
    // and are positioned near the bottom of the viewport
    const bottomElements = allElements.filter(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      return (
        rect.bottom >= viewportHeight - 150 &&
        rect.width > 200 &&
        rect.height > 40 &&
        style.display !== 'none'
        // Note: Removed visibility check as some frameworks use hidden elements for layout
      );
    });

    // Analyze each element
    const analyses = bottomElements.map(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const elementCenterX = rect.left + (rect.width / 2);
      const offset = Math.abs(elementCenterX - viewportCenterX);

      return {
        tag: el.tagName,
        id: el.id || 'no-id',
        className: el.className || 'no-class',
        rect: {
          left: rect.left.toFixed(2),
          right: rect.right.toFixed(2),
          bottom: rect.bottom.toFixed(2),
          width: rect.width.toFixed(2),
          centerX: elementCenterX.toFixed(2)
        },
        styles: {
          position: style.position,
          left: style.left,
          transform: style.transform,
          inlineLeft: el.style.left || 'not set',
          inlineTransform: el.style.transform || 'not set'
        },
        centering: {
          viewportCenterX: viewportCenterX.toFixed(2),
          elementCenterX: elementCenterX.toFixed(2),
          offset: offset.toFixed(2),
          isCentered: offset < 2
        }
      };
    });

    return {
      viewportWidth,
      viewportHeight,
      viewportCenterX,
      totalElements,
      allSummary,
      elementsFound: analyses.length,
      elements: analyses
    };
  });

  console.log('='.repeat(60));
  console.log('BUTTON CENTERING VERIFICATION');
  console.log('='.repeat(60));
  console.log(`Viewport: ${centeringAnalysis.viewportWidth}px x ${centeringAnalysis.viewportHeight}px`);
  console.log(`Viewport Center X: ${centeringAnalysis.viewportCenterX.toFixed(2)}px`);
  console.log(`Total elements on page: ${centeringAnalysis.totalElements}`);
  console.log(`\nFirst 50 elements:`);
  centeringAnalysis.allSummary.forEach((el, idx) => {
    console.log(`  ${idx + 1}. ${el.tag}${el.id ? '#' + el.id : ''} - ${el.width}x${el.height}px, bottom: ${el.bottom}px, display: ${el.display}, vis: ${el.visibility}`);
  });
  console.log(`\nElements matching filter: ${centeringAnalysis.elementsFound}`);
  console.log('='.repeat(60));

  centeringAnalysis.elements.forEach((el, idx) => {
    console.log(`\nElement ${idx + 1}: ${el.tag}#${el.id}`);
    console.log(`  Class: ${el.className}`);
    console.log(`  Position: ${el.styles.position}`);
    console.log(`  Width: ${el.rect.width}px`);
    console.log(`  Left edge: ${el.rect.left}px`);
    console.log(`  Right edge: ${el.rect.right}px`);
    console.log(`  Element center: ${el.rect.centerX}px`);
    console.log(`  Viewport center: ${el.centering.viewportCenterX}px`);
    console.log(`  Offset from center: ${el.centering.offset}px`);
    console.log(`  Perfectly centered: ${el.centering.isCentered ? '✓ YES' : '✗ NO'}`);
    console.log(`  Inline styles:`);
    console.log(`    - left: ${el.styles.inlineLeft}`);
    console.log(`    - transform: ${el.styles.inlineTransform}`);
    console.log(`  Computed styles:`);
    console.log(`    - left: ${el.styles.left}`);
    console.log(`    - transform: ${el.styles.transform}`);
  });

  console.log('\n' + '='.repeat(60));

  await browser.close();
})();
