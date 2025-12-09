import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen for console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  // Navigate to the test page
  await page.goto('http://localhost:8000/test.html', { waitUntil: 'networkidle' });

  // Wait a bit for the widget to initialize
  await page.waitForTimeout(2000);

  // Check what's on the page
  const pageContent = await page.content();
  console.log('Page loaded successfully');

  // Check for all widget elements
  const widgetElements = await page.evaluate(() => {
    const widget = document.querySelector('#ragpi-widget');

    // Find all elements inside the widget
    const allElements = widget ? Array.from(widget.querySelectorAll('*')).map(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        id: el.id,
        tag: el.tagName,
        class: el.className,
        display: style.display,
        position: style.position,
        bottom: style.bottom,
        left: style.left,
        transform: style.transform,
        width: rect.width,
        height: rect.height,
        hasText: el.textContent.substring(0, 50)
      };
    }).filter(el => el.width > 0 && el.height > 0) : [];

    return {
      widgetElements: allElements
    };
  });

  console.log('Widget elements found:', JSON.stringify(widgetElements, null, 2));

  // Find the visible bottom-centered input bar
  const inputBarIndex = widgetElements.widgetElements.findIndex(el =>
    el.position === 'fixed' && el.bottom !== 'auto' && el.width > 200
  );

  if (inputBarIndex === -1) {
    console.log('Input bar not found, taking screenshot...');
    await page.screenshot({
      path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/button-centered-verification.png',
      fullPage: true
    });
    console.log('Screenshot saved');
    await browser.close();
    return;
  }

  const targetElement = widgetElements.widgetElements[inputBarIndex];
  console.log('Found target element:', targetElement);

  // Get detailed centering information
  const buttonInfo = await page.evaluate((targetId) => {
    const widget = document.querySelector('#ragpi-widget');
    const button = widget.querySelector(`#${targetId}`) || widget.querySelector('[style*="position: fixed"]');

    if (!button) {
      // Try to find by looking for fixed positioned elements
      const allFixed = Array.from(widget.querySelectorAll('*')).filter(el => {
        return window.getComputedStyle(el).position === 'fixed';
      });
      if (allFixed.length > 0) {
        return allFixed.map(el => ({
          id: el.id,
          rect: el.getBoundingClientRect(),
          styles: {
            left: el.style.left,
            transform: el.style.transform,
            computedLeft: window.getComputedStyle(el).left,
            computedTransform: window.getComputedStyle(el).transform
          }
        }));
      }
      return null;
    }

    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const buttonCenterX = rect.left + (rect.width / 2);
    const viewportCenterX = viewportWidth / 2;
    const offset = Math.abs(buttonCenterX - viewportCenterX);

    // Get computed styles
    const computedStyle = window.getComputedStyle(button);
    const inlineStyle = button.style;

    return {
      buttonRect: {
        left: rect.left,
        right: rect.right,
        width: rect.width,
        centerX: buttonCenterX
      },
      viewport: {
        width: viewportWidth,
        centerX: viewportCenterX
      },
      offset: offset,
      isCentered: offset < 1, // Within 1 pixel is considered centered
      styles: {
        inlineLeft: inlineStyle.left,
        inlineTransform: inlineStyle.transform,
        computedLeft: computedStyle.left,
        computedTransform: computedStyle.transform,
        computedPosition: computedStyle.position
      },
      elementId: button.id,
      elementTag: button.tagName
    };
  }, targetElement.id);

  console.log('\nButton Centering Analysis:');
  console.log('===========================');
  console.log(`Element: ${buttonInfo.elementTag}#${buttonInfo.elementId}`);
  console.log(`Viewport Width: ${buttonInfo.viewport.width}px`);
  console.log(`Viewport Center: ${buttonInfo.viewport.centerX.toFixed(2)}px`);
  console.log(`Button Center: ${buttonInfo.buttonRect.centerX.toFixed(2)}px`);
  console.log(`Button Left Edge: ${buttonInfo.buttonRect.left.toFixed(2)}px`);
  console.log(`Button Right Edge: ${buttonInfo.buttonRect.right.toFixed(2)}px`);
  console.log(`Button Width: ${buttonInfo.buttonRect.width.toFixed(2)}px`);
  console.log(`Offset from Center: ${buttonInfo.offset.toFixed(2)}px`);
  console.log(`Is Perfectly Centered: ${buttonInfo.isCentered ? '✓ YES' : '✗ NO'}`);
  console.log('\nApplied Styles:');
  console.log(`- Inline left: ${buttonInfo.styles.inlineLeft || 'not set'}`);
  console.log(`- Inline transform: ${buttonInfo.styles.inlineTransform || 'not set'}`);
  console.log(`- Computed left: ${buttonInfo.styles.computedLeft}`);
  console.log(`- Computed transform: ${buttonInfo.styles.computedTransform}`);
  console.log(`- Position: ${buttonInfo.styles.computedPosition}`);

  // Take a full page screenshot
  await page.screenshot({
    path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/button-centered-verification.png',
    fullPage: true
  });

  console.log('\nScreenshot saved to: button-centered-verification.png');

  await browser.close();
})();
