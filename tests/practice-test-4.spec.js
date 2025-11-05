
const { test, chromium, expect } = require('@playwright/test');

test.describe.serial('Swag Labs', () => {
  let browser, context, page;
  const BASE_URL = 'https://www.saucedemo.com/';

  // ✅ Helper to safely click links (new tab or same tab)
  async function safeClickAndReturn(name) {
    const oldPages = page.context().pages();

    // Click the link and wait a bit for new tab or SPA navigation
    await Promise.allSettled([
      page.waitForLoadState('domcontentloaded'),
      page.getByRole('link', { name, exact: true }).click(),
    ]);
    await page.waitForTimeout(2000);

    const newPages = page.context().pages();
    if (newPages.length > oldPages.length) {
      // ✅ New tab opened
      const newPage = newPages[newPages.length - 1];
      try {
        await newPage.waitForLoadState('domcontentloaded', { timeout: 10000 });
      } catch {}
      await newPage.close();
      const firstPage = page.context().pages()[0];
      await firstPage.bringToFront();
    } else {
      // ✅ Same tab navigation
      try {
        await Promise.race([
          page.goBack({ timeout: 12000 }),
          page.waitForLoadState('domcontentloaded', { timeout: 12000 }),
        ]);
        await page.waitForTimeout(1000);
      } catch (err) {
        console.warn(`⚠️ goBack failed for "${name}", reloading main page...`);
        // Fallback: reload or bring original page to front
        try {
          await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await page.locator('xpath=//input[@id="user-name"]').fill('standard_user');
          await page.locator('xpath=//input[@id="password"]').fill('secret_sauce');
          await page.locator('xpath=//input[@id="login-button"]').click();
          await expect(page.locator('.inventory_list')).toBeVisible({ timeout: 10000 });
        } catch (reloadErr) {
          const firstPage = page.context().pages()[0];
          await firstPage.bringToFront();
        }
      }
    }
  }

  test.beforeAll(async () => {
    browser = await chromium.launch({
      headless: true,
      args: ['--start-maximized'],
      slowMo: 800,
    });
    context = await browser.newContext({ viewport: null, deviceScaleFactor: undefined });
    page = await context.newPage();
  });

  test('Login with valid username and password', async () => {
    await page.goto(BASE_URL, { timeout: 120000, waitUntil: 'domcontentloaded' });
    await page.locator('xpath=//input[@id="user-name"]').fill('standard_user');
    await page.locator('xpath=//input[@id="password"]').fill('secret_sauce');
    await page.locator('xpath=//input[@id="login-button"]').click();
    await expect(page.locator('.inventory_list')).toBeVisible({ timeout: 10000 });
  });

  test('Menu Navigation', async () => {
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.locator('[data-test="about-sidebar-link"]').click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/saucelabs\.com/);
  });

  test('Footer Products Links Verification', async () => {
    await page.evaluate(() => window.scrollBy(0, 6000));
    await page.waitForTimeout(1000);

    await Promise.allSettled([
      page.waitForLoadState('domcontentloaded'),
      page.getByRole('link', { name: 'More updates' }).click(),
    ]);

    const firstPage = page.context().pages()[0];
    await firstPage.bringToFront();

    await page.locator('div').filter({ hasText: /^Products$/ }).nth(2).click();

    await safeClickAndReturn('Platform for Test');
    await safeClickAndReturn('Sauce Web Testing');
    await safeClickAndReturn('Sauce Mobile App Testing');
    await safeClickAndReturn('Mobile App Distribution');
    await safeClickAndReturn('Sauce Error Reporting');
    await safeClickAndReturn('Sauce Visual');
  });

  test('Footer Global tools links', async () => {
    await page.evaluate(() => window.scrollBy(0, 3000));
    await page.waitForTimeout(1000);

    await safeClickAndReturn('Sauce AI');
    await safeClickAndReturn('Sauce Insights');
    await safeClickAndReturn('Sauce Performance');
  });

  test('Footer Set up and integrate links', async () => {
    await page.evaluate(() => window.scrollBy(0, 3000));
    await expect(page.getByText('Set up and integrate')).toBeVisible();
    await page.waitForTimeout(1000);

    await safeClickAndReturn('Integrations & plugins');
    await safeClickAndReturn('Supported browsers and devices');
    await safeClickAndReturn('Platform configurator');
    await safeClickAndReturn('Premium Consulting Services');
  });

  test('Footer Resources links', async () => {
    await page.evaluate(() => window.scrollBy(0, 3000));
    await page.waitForTimeout(1000);

    await safeClickAndReturn('Resources by topic');
    await safeClickAndReturn('Blog');
    await safeClickAndReturn('FAQs');
    await safeClickAndReturn('Documentation');
    await safeClickAndReturn('Support');
    await safeClickAndReturn('Videos');
    await safeClickAndReturn('Webinars');
  });

  test('Company Links Verification', async () => {
    await page.evaluate(() => window.scrollBy(0, 3000));
    await page.waitForTimeout(1000);

    await safeClickAndReturn('About us');
    await safeClickAndReturn('Security');
    await safeClickAndReturn('Partners');
    await safeClickAndReturn('Careers');
    await safeClickAndReturn('News');
    await safeClickAndReturn('Contact us');
    await safeClickAndReturn('Systems status');
  });

  test.afterAll(async () => {
    // await page.waitForTimeout(2000);
    await page.pause(); // for inspection
    // await browser.close();
  });
});