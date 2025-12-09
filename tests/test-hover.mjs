import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1280, height: 720 });

  console.log('Navigating to http://localhost:8000/test.html...');
  await page.goto('http://localhost:8000/test.html');

  console.log('Waiting for button...');
  await page.waitForSelector('button', { timeout: 5000 });

  console.log('Hovering over button...');
  await page.hover('button');

  // Wait for animation
  await page.waitForTimeout(500);

  console.log('Taking hover screenshot...');
  await page.screenshot({
    path: '/Users/roblauer/Documents/GitHub/blues-ragpi-web-widget/screenshot-2-hover-state.png',
    fullPage: false
  });

  console.log('Done!');
  await browser.close();
}

main().catch(console.error);
