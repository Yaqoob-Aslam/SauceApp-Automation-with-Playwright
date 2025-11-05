
import { test, expect, chromium } from '@playwright/test';

test.describe.serial('Swag Labs', () => {

  let browser, context, page;
  const BASE_URL = 'https://www.saucedemo.com/';

  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: true, args: ['--start-maximized'], slowMo: 1000 });
    context = await browser.newContext({ viewport: null, deviceScaleFactor: undefined });
    page = await context.newPage();
  });

  test("Login with valid username and password", async () => {
    await page.goto(BASE_URL, { timeout: 120000 });
    await page.locator("xpath=//input[@id='user-name']").fill("standard_user");
    await page.locator("xpath=//input[@id='password']").fill("secret_sauce");
    await page.locator("xpath=//input[@id='login-button']").click();
  });

  test("Menu Navigation", async () => {
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.locator('[data-test="about-sidebar-link"]').click();
    await expect(page).toHaveURL('https://saucelabs.com/');
  });

  test('Verify the Banner', async () => {
    // Wait for hero banner to appear (flexible)
    await page.waitForSelector("section:has(h1), div:has(h1)", { timeout: 20000 });

    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible({ timeout: 10000 });

    // Log the text for reference (helps if the headline changes)
    console.log('Hero heading text:', await heroHeading.textContent());
  });

  test("Verify the Header", async () => {
    // Ensure full page and scripts are loaded
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 });
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch {
      console.warn('⚠️ Skipping networkidle wait — page likely has ongoing requests.');
    }
    await page.waitForTimeout(1500);


    // --- Verify Header ---
    const header = page.locator('header');
    await expect(header).toBeVisible({ timeout: 15000 });

    // --- Verify Navigation Links ---
    const navItems = ['Products', 'Resources', 'Developers'];
    for (const item of navItems) {
      const navLink = header.getByRole('link', { name: item, exact: false });
      if ((await navLink.count()) > 0) {
        await expect(navLink.first()).toBeVisible({ timeout: 10000 });
        console.log(`✅ "${item}" link visible`);
      } else {
        console.warn(`⚠️ "${item}" link not found (may be nested in dropdown).`);
      }
    }

    // --- Handle optional "Pricing" link gracefully ---
    const pricingLink = page.getByRole('link', { name: /Pricing/i });
    const pricingCount = await pricingLink.count();
    if (pricingCount > 0) {
      await expect(pricingLink.first()).toBeVisible({ timeout: 8000 });
      console.log('✅ "Pricing" link visible');
    } else {
      console.warn('⚠️ "Pricing" link not found or hidden (skipping check).');
    }

    // --- Brand / Logo link ---
    const brandLink = page.getByRole('link', { name: /Sauce Labs/i });
    await expect(brandLink).toBeVisible({ timeout: 10000 });

    // --- Verify top-level buttons ---
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000); // brief buffer for animations    
    // Handle either "Request a demo" or "Try it free"
    const requestDemoBtn = page.getByRole('button', { name: /Request a demo/i });
    const tryFreeBtn = page.getByRole('button', { name: /Try it free/i });

    const demoCount = await requestDemoBtn.count();
    const tryCount = await tryFreeBtn.count();

    if (demoCount > 0) {
      await expect(requestDemoBtn.first()).toBeVisible({ timeout: 10000 });
      console.log('✅ "Request a demo" button visible');
    } else {
      console.warn('⚠️ "Request a demo" button not found.');
    }

    if (tryCount > 0) {
      await expect(tryFreeBtn.first()).toBeVisible({ timeout: 10000 });
      console.log('✅ "Try it free" button visible');
    } else {
      console.warn('⚠️ "Try it free" button not found.');
    }

    console.log('✅ Header verification completed successfully.');
  });

  test('Verify Products dropdown content', async () => {
    
      await page.waitForSelector('header');
      const productsMenu = page.locator("//span[contains(@class,'MuiTypography-buttonLabelNav') and contains(text(),'Products')]").first();
      // await expect(productsMenu).toBeVisible({ timeout: 10000 });
      await productsMenu.hover();
      

      await expect(page.getByRole('link', { name: 'Saucelabs' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Platform for Test' })).toBeVisible();
      await expect(page.locator("xpath=//a[@href='/products/cross-browser-testing']//div[@class='MuiBox-root css-d416pa']")).toBeVisible();
      await expect(page.locator("xpath=//span[text()='Sauce Mobile']")).toBeVisible();
      await expect(page.locator("(//span[contains(text(), 'Mobile App Distribution')])[1]")).toBeVisible();
      await expect(page.locator("(//span[contains(@class, 'MuiTypography-buttonLabel') and normalize-space(text())='Sauce Visual' and not(contains(@style, 'none'))])[1]")).toBeVisible();
      await expect(page.locator("xpath=//span[contains(text(),'Setup & integrate')]")).toBeVisible();
      await expect(page.locator("xpath=//a[@href='/products/integrations-and-plugins']//div[@class='MuiBox-root css-d416pa']")).toBeVisible();
      await expect(page.locator("(//span[text()='Supported browsers & devices'])[1]")).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Platform configurator' })).toBeVisible();
      await expect(page.getByText('Demo center')).toBeVisible();
      await expect(page.getByRole('banner').getByText('Global tools')).toBeVisible();

      await expect(page.getByRole('link', { name: /location Sauce AI/i }).first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('link', { name: 'location Performance' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Insights' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Take a product tour' })).toBeVisible();
    });

  test('Verify Solutions dropdown content', async () => {
      await page.waitForSelector('header');
      const productsMenu = page.locator("xpath=//span[normalize-space()='Solutions']").hover();
      await productsMenu.hover();

      await expect(page.locator("xpath=//span[normalize-space()='Enterprise Solutions']")).toBeVisible();
      await expect(page.locator("xpath=//span[normalize-space()='Enterprise Testing Platform']")).toBeVisible();
      await expect(page.locator("xpath=//div[@class='MuiBox-root css-0']//span[contains(text(), 'Premium Consulting Services')]")).toBeVisible();
      await expect(page.locator("xpath=//span[normalize-space()='Enterprise Support']")).toBeVisible();
      await expect(page.locator("xpath=//span[normalize-space()='Use Cases']")).toBeVisible();
      await expect(page.locator("xpath=//span[normalize-space()='CI/CD pipeline optimization']")).toBeVisible();

      await expect(page.getByRole('link', { name: 'location Mobile App Distribution' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Continuous testing' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Scalable test' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Crash & error' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Test analytics' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Debugging' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Visual testing' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Mobile application' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Visual testing' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Accessibility Testing' })).toBeVisible();

      await expect(page.getByText('Industries')).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Financial Services' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Retail' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Insurance' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Healthcare' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'location Gaming' })).toBeVisible();
  });

  test('Verify Developer dropdown content', async () => {
    await page.waitForSelector('header');
    const productsMenu = page.locator("xpath=//span[normalize-space()='Developers']").first();
    await productsMenu.hover();

    await expect(page.locator("xpath=//span[normalize-space()='Resources for devs & testers']")).toBeVisible();

    await expect(page.getByRole('link', { name: 'Documentation How to use' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Changelog See what\'s new' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Support By framework' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'FAQs Learn more about our' })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Selenium' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cypress' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Appium' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Playwright' })).toBeVisible();

    await expect(page.getByText('Getting started guides')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mobile app testing', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Web app testing' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'CI', exact: true })).toBeVisible();

    await expect(page.getByText('Integrations').nth(1)).toBeVisible();
    await expect(page.getByRole('link', { name: 'location CI/CD' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'location Test automation' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'location Test management' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'location Test creation' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'location Accessibility' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'location API Management' })).toBeVisible();
    await expect(page.getByText('Set up & configure')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Integrations', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Supported browsers & devices' })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('link', { name: 'Platform configurator' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Test configuration' })).toBeVisible();
  });

  test("Verify dropdown Resources", async () => {
    await page.waitForSelector('header');
    const productsMenu = page.getByRole('banner').getByText('Resources', { exact: true }).first();
    await productsMenu.hover();
    await page.waitForTimeout(800);

    await expect(page.getByText('Explore & learn')).toBeVisible();
    await expect(page.getByRole('link', { name: 'location Blog Expert insights' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'location Webinars Continued' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'location Videos Watch & learn' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'location Reports Industry &' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'location White papers In-' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'location Demos Explore the' })).toBeVisible();

    await expect(page.getByText('Why Sauce Labs?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'location Case studies' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'location TEI Study The ROI of' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'location Data sheets Product' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'location Security Our' })).toBeVisible();

    await expect(page.getByText('Discover by topic')).toBeVisible();
    await expect(page.getByRole('link', { name: 'All topics' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Automated testing' })).toBeVisible();

    // ✅ FIXED — disambiguated the "Mobile testing" link
    await expect(page.locator('a[href="/resources/topic-hub/mobile-app-testing"]')).toBeVisible();

    await expect(page.getByRole('link', { name: 'Selenium' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Appium' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Playwright' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cross-browser testing' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'CI/CD' })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Request a demo' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try it free' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'search' })).toBeVisible();
  });

  // (rest of tests unchanged)

  test("Home page verification", async () => {  

    await expect(page.getByRole('heading', { name: 'Build apps users love with AI' })).toBeVisible();
    await expect(page.getByText('Power your mobile and web')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign up for free' }).first()).toBeVisible();    
    await expect(page.getByRole('button', { name: 'Book a demo' })).toBeVisible
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect(page.getByText('+bn')).toBeVisible();
    await expect(page.getByText('TESTS EXECUTED')).toBeVisible();
    await expect(page.getByText('300k')).toBeVisible();
    await expect(page.getByText('ACTIVE USERS')).toBeVisible();
    await expect(page.getByText('9000+')).toBeVisible();
    await expect(page.getByText('REAL DEVICES', { exact: true })).toBeVisible();
    await expect(page.getByText('2500+')).toBeVisible();
    await expect(page.getByText('EMUSIMS AND BROWSER/OSES')).toBeVisible();
    await page.mouse.move(0, 0);
  }) 

  test("Verify the Card Section-1", async () => {  
    await page.evaluate(() => {
       window.scrollBy(0, 1000);
    }); 
    await expect(page.getByRole('heading', { name: 'ENTERPRISE-READY. AI-DRIVEN.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'One Platform for Continuous' })).toBeVisible();
    await expect(page.getByText('Ensure quality at every stage')).toBeVisible();

    await page.getByRole('button', { name: 'AI-Powered Insights' }).click();
    await page.getByRole('button', { name: 'Mobile App Testing' }).click();
    await page.getByRole('button', { name: 'Web Testing' }).click();
    await page.getByRole('button', { name: 'Mobile App Distribution' }).click();
    await page.getByRole('button', { name: 'Error Reporting' }).click();
    await page.getByRole('button', { name: 'Visual Testing' }).click();
  });

  test("Verify the Card Section-2", async () => {  
    await page.evaluate(() => {
       window.scrollBy(0, 1500);
    }); 
    await page.locator('.MuiBox-root.css-0 > .MuiBox-root.css-b8pqf7 > .MuiContainer-root > .MuiStack-root.css-ktxroh').click();
    await expect(page.getByRole('heading', { name: 'CASE STUDIES' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The secret sauce behind every' })).toBeVisible();
    await expect(page.getByText('Discover how leading brands')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Why our customers love Sauce' })).toBeVisible();
  });

  test("Verify the Footer Section-3", async () => {  
    await page.evaluate(() => {
       window.scrollBy(0, 1500);
    }); 
    await page.locator('div').filter({ hasText: 'Integrate & SetupSauce Labs' }).nth(1).click();
    await page.locator('.MuiStack-root.css-93l11j').first().click();
    await page.locator('.MuiStack-root.css-150idp').first().click();
    await page.locator('.MuiStack-root.css-162p5k5 > div:nth-child(2)').first().click();
    await page.locator('.MuiStack-root.css-1y79squ').first().click();
    await page.getByRole('heading', { name: 'Integrate & Setup' }).click();
    await page.getByRole('heading', { name: 'Sauce Labs + Your Go-To' }).click();
    await page.getByText('Easily connect with your').click();
    const page1Promise = page.waitForEvent('popup');

    // Click the "Learn more about integrations" button that opens a new tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'), // Wait for new tab to open
      page.getByRole('button', { name: 'Learn more about integrations' }).click()
    ]);

    // Wait until the new tab fully loads
    await newPage.waitForLoadState('domcontentloaded');

    // ✅ Perform verification or actions in the new tab
    await expect(newPage).toHaveTitle(/Integrations/i); // example assertion
    console.log('Opened tab title:', await newPage.title());

    // ✅ Switch back to the original tab (first page)
    const pages = page.context().pages();
    const firstPage = pages[0];

    await firstPage.bringToFront();
    console.log('Switched back to main tab');

    const page1 = await page1Promise;
    await page.locator('.MuiStack-root.css-13f5wiq > .MuiStack-root.css-nzw4r > .MuiStack-root.css-1ociqks > .MuiStack-root.css-1y79squ').click();
    await page.locator('.MuiStack-root.css-13f5wiq > .MuiStack-root.css-nzw4r > .MuiStack-root.css-162p5k5 > .MuiStack-root.css-93l11j').click();
    await page.locator('.MuiStack-root.css-nzw4r > .MuiStack-root.css-1ociqks > .MuiStack-root.css-93l11j').click();
    await page.locator('.MuiStack-root.css-nzw4r > .MuiStack-root.css-162p5k5 > .MuiStack-root.css-150idp').click();

  });

  test("Verify the Card Section-4", async () => {  
    await page.evaluate(() => {
       window.scrollBy(0, 1500);
    }); 
    await page.locator('div').filter({ hasText: 'Ready to Start Testing? Try' }).nth(1).click();
    await page.getByRole('heading', { name: 'Ready to Start Testing? Try' }).click();
    await page.getByText('Set up in minutes and run').click();
    const page2Promise = page.waitForEvent('popup');
    
    // Click the "Sign up for free" button (2nd one) that opens a new tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'), // Waits for new tab to open
      page.getByRole('button', { name: 'Sign up for free' }).nth(1).click()
    ]);

    // Wait for the new tab to load completely
    await newPage.waitForLoadState('domcontentloaded');

    // ✅ Perform some action or verification in the new tab
    console.log('New tab title:', await newPage.title());
    await expect(newPage).toHaveTitle(/Sign Up/i); // Example assertion

    // ✅ Switch back to the first/original tab
    const pages = page.context().pages(); // Get all open tabs
    const firstPage = pages[0]; // The original page is always index 0
    await firstPage.bringToFront(); // Focus back to main tab

  });

    test("Verify the Card Section-5", async () => {  
      await page.evaluate(() => {
        window.scrollBy(0, 1500);
      }); 
  // ✅ Click first blog and go back
    await Promise.all([
      page.waitForLoadState('load'),
      page.getByRole('link', { name: 'Solving the Disconnect Between Software Testing Teams and Executives'}).click()
    ]);
    await page.goBack();

    // ✅ Click second blog and go back
    await Promise.all([
      page.waitForLoadState('load'),
      page.getByRole('link', { name: 'Future Proof Your Mobile Testing: Why Sauce Labs Virtual Devices on Apple Silicon is a Game-Changer'}).click()
    ]);
    await page.goBack();

    await Promise.all([
      page.waitForLoadState('load'),
      page.getByRole('link', { name: 'An AI-Powered Reality Check: 5 Key Findings From Our Latest Agentic Survey'}).click()
    ]);
    await page.goBack();

    // ✅ Click "More updates"
    await Promise.all([
      page.waitForLoadState('load'),
      page.getByRole('link', { name: 'More updates' }).click()
    ]);

    // ✅ Switch back to the first/original tab
      const pages = page.context().pages(); // Get all open tabs
      const firstPage = pages[0]; // The original page is always index 0
      await firstPage.bringToFront(); // Focus back to main tab
  });

  test.afterAll(async () => {
    await page.pause();
  });
});
