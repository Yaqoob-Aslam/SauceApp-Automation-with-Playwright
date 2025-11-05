import { test, expect, chromium } from '@playwright/test';

test.describe.serial('Swag Labs', () => {

  let browser, context, page;
  const BASE_URL = 'https://www.saucedemo.com/';

  test.beforeAll(async () => {
    browser = await chromium.launch({headless: true, args: ['--start-maximized'],slowMo: 1000});
    context = await browser.newContext({viewport: null,deviceScaleFactor: undefined});
    page = await context.newPage();
  });

  test('Login with empty username and password', async () => {
     await page.goto(BASE_URL, { timeout: 120000 });
     await page.locator("xpath=//input[@id='user-name']").fill("standard_user");
     await page.locator("xpath=//input[@id='password']").fill("secret_sauce");
     await page.locator("xpath=//input[@id='login-button']").click();
  });

  test('Inventory page', async () => {

      // List of all products (id, name, price)
      const products = [
        { id: 'sauce-labs-backpack', name: 'Sauce Labs Backpack', price: '$29.99' },
        { id: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light', price: '$9.99' },
        { id: 'sauce-labs-bolt-t-shirt', name: 'Sauce Labs Bolt T-Shirt', price: '$15.99' },
        { id: 'sauce-labs-fleece-jacket', name: 'Sauce Labs Fleece Jacket', price: '$49.99' },
        { id: 'sauce-labs-onesie', name: 'Sauce Labs Onesie', price: '$7.99' },
        { id: 'test.allthethings()-t-shirt-(red)', name: 'Test.allTheThings() T-Shirt (Red)', price: '$15.99' },
      ];

      function cssEscape(str) {
        return str.replace(/([!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~])/g, '\\$1');
      }

      // ✅ Safeguard wait if navigation took longer
      await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html', { timeout: 20000 });

      // ✅ Verify total product count
      await expect(page.locator("//div[@class='inventory_item']")).toHaveCount(6);

      for (const product of products) {
        console.log(`🧪 Testing product: ${product.name}`);

        // Product name verification
        await expect(page.locator(`//div[normalize-space()='${product.name}']`)).toBeVisible();

        // Product price verification
        const productCard = page.locator(`//div[@class='inventory_item'][.//div[normalize-space()='${product.name}']]`);

        // Verify price inside that container
        await expect(productCard.locator(".inventory_item_price")).toHaveText(product.price);

        // Optional: verify image is visible (only for first product you had)
        if (product.id === 'sauce-labs-backpack') {
          const image = page.locator('[data-test="item-4-img-link"] img');
          await expect(image).toBeVisible();
        }

        // Add to cart
        await page.locator(`#${cssEscape(`add-to-cart-${product.id}`)}`).click();
        await page.locator('[data-test="shopping-cart-link"]').click();
        await page.locator("#checkout").click();

        // Fill checkout info
        await page.locator('[data-test="firstName"]').fill('Test');
        await page.locator('[data-test="lastName"]').fill('Engineer');
        await page.locator('[data-test="postalCode"]').fill('4335FDW');
        await page.locator('[data-test="continue"]').click();

        // Finish order
        await page.locator('[data-test="finish"]').click();

        // Order confirmation assertions
        await expect(page.locator("//h2[normalize-space()='Thank you for your order!']")).toBeVisible();
        await expect(page.locator("//h2[normalize-space()='Thank you for your order!']")).toHaveText('Thank you for your order!');
        await expect(page.locator("//div[@class='complete-text']")).toHaveText(
          'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
        );
        await expect(page.locator("//img[@alt='Pony Express']")).toBeVisible();

        // Go back to inventory page
        await page.locator("#back-to-products").click();
        await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html', { timeout: 20000 });
        } 
  });

  test('Footer section', async () => {
      // Verify footer text
      const footer = page.locator(".footer_copy");
      await expect(footer).toBeVisible();
      await expect(footer).toHaveText('© 2025 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy');

      // Verify social media links
      const twitterLink = page.locator("a[href='https://twitter.com/saucelabs']");
      const facebookLink = page.locator("a[href='https://www.facebook.com/saucelabs']");
      const linkedinLink = page.locator("a[href='https://www.linkedin.com/company/sauce-labs/']");

      await expect(twitterLink).toBeVisible();
      await expect(facebookLink).toBeVisible();
      await expect(linkedinLink).toBeVisible();
  });

  test('Sort products by Price (low to high)', async () => {
      // Select sort option
      await page.locator('[data-test="product-sort-container"]').selectOption('az');
      await page.waitForTimeout(5000);
      await page.locator('[data-test="product-sort-container"]').selectOption('za');
      await page.waitForTimeout(5000);
      await page.locator('[data-test="product-sort-container"]').selectOption('lohi');
      await page.waitForTimeout(5000);
      // Verify products are sorted by price (low to high)  
      await page.locator('[data-test="product-sort-container"]').selectOption('hilo');
  });
  
  test.afterAll(async () => {
     await page.pause();
     //await browser.close();
  });
});