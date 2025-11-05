import { test, expect, chromium } from '@playwright/test';

test.describe.serial('Swag Labs', () => {

  let browser, context, page;
  const BASE_URL = 'https://www.saucedemo.com/';

  test.beforeAll(async () => {
    browser = await chromium.launch({headless: true, args: ['--start-maximized']});
    context = await browser.newContext({viewport: null,deviceScaleFactor: undefined});
    page = await context.newPage();
  });

  // Login with Invalid credentials
  test('Login with empty username and password', async () => {
     await page.goto(BASE_URL, { timeout: 120000 });
     await page.locator("xpath=//input[@id='password']").fill("secret_sauce");
     await page.locator("xpath=//input[@id='login-button']").click();
    });

  test('Login with empty username', async () => {
    await page.goto(BASE_URL,{ timeout: 40000 });
    await page.locator("xpath=//input[@id='user-name']").fill("standard_user");
    await page.locator("xpath=//input[@id='login-button']").click();
  });

  test('Login with invalid username', async () => {
    await page.goto(BASE_URL, { timeout: 40000 });
    await page.locator("xpath=//input[@id='user-name']").fill("stand_user");
    await page.locator("xpath=//input[@id='login-button']").click();
  });

  test('Login with invalid password', async () => {
    await page.goto(BASE_URL, { timeout: 40000 });
    await page.locator("xpath=//input[@id='password']").fill("secret_sauce");
    await page.locator("xpath=//input[@id='login-button']").click();
  });

  test('Login with SQL injection attempt', async () => {
    await page.goto(BASE_URL, { timeout: 40000 });
    await page.locator("xpath=//input[@id='user-name']").fill("' OR '1'='1");
    await page.locator("xpath=//input[@id='password']").fill("' OR '1'='1");
    await page.locator("xpath=//input[@id='login-button']").click();
  });

  test('Login with XSS attempt', async () => {
    await page.goto(BASE_URL, { timeout: 40000 });
    await page.locator("xpath=//input[@id='user-name']").fill("<script>alert('hack')</script>");
    await page.locator("xpath=//input[@id='password']").fill('Password@123');
    await page.locator("xpath=//input[@id='login-button']").click();
  });

  test('User should be able to login with valid credentials', async () => {
    await page.locator("xpath=//input[@id='user-name']").fill("standard_user");
    await page.locator("xpath=//input[@id='password']").fill("secret_sauce");
    await page.locator("xpath=//input[@id='login-button']").click();
  });

  test('User should be able to logout', async () => {
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.locator('[data-test="logout-sidebar-link"]').click();
  });

  test.afterAll(async () => {
     await page.pause();
     //await browser.close();
  });
});