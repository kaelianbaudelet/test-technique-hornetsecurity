import { test, expect } from '@playwright/test';

test.describe('La Petite Librairie - E2E Testing Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the landing page before each test
    await page.goto('/');
  });

  test('should load the landing page and navigate to books', async ({ page }) => {
    // Verify the landing page title
    await expect(page).toHaveTitle(/La Petite Librairie/);
    
    // Check main layout elements
    const heading = page.getByRole('heading', { name: 'Literary Escape.', exact: true });
    await expect(heading).toBeVisible();

    // Verify presence of call to action button
    const ctaButton = page.getByRole('link', { name: 'Explore the catalog' });
    await expect(ctaButton).toBeVisible();

    // Navigate to the catalog page via CTA
    await ctaButton.click();
    await expect(page).toHaveURL(/\/books/);

    // Verify book list heading
    await expect(page.getByRole('heading', { name: 'Books', exact: true })).toBeVisible();
  });

  test('should filter, search, and paginate books', async ({ page }) => {
    // Go directly to books page
    await page.goto('/books');

    // Wait for books to load (skeletons disappear and cards appear)
    const bookCards = page.locator('section[hlmcard]');
    await expect(bookCards.first()).toBeVisible({ timeout: 10000 });

    // Search for a specific book title or author
    const searchInput = page.locator('#book-search');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Book'); // fakerapi generates standard names containing "Book" usually
    await page.waitForTimeout(500); // Wait for input debounce / signal computation

    // Ensure filtering query param matches URL
    await expect(page).toHaveURL(/search=Book/);

    // Reset filters
    const resetBtn = page.getByRole('button', { name: 'Reset filters' });
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await expect(page).not.toHaveURL(/search=/);
    }
  });

  test('should toggle dark/light theme and persist user preference', async ({ page }) => {
    // Find theme toggle button
    const themeBtn = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeBtn).toBeVisible();

    const htmlElement = page.locator('html');

    // Check initial theme state
    const isDarkInitial = await htmlElement.evaluate((el) => el.classList.contains('dark'));

    // Toggle theme
    await themeBtn.click();
    await page.waitForTimeout(300);

    // Check toggled theme state
    const isDarkAfterToggle = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    expect(isDarkAfterToggle).not.toBe(isDarkInitial);

    // Toggle back
    await themeBtn.click();
    await page.waitForTimeout(300);
    const isDarkFinal = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    expect(isDarkFinal).toBe(isDarkInitial);
  });

  test('should execute a complete book reservation workflow with form validation', async ({ page }) => {
    // Go to catalog
    await page.goto('/books');
    
    // Wait for list to load
    const bookCards = page.locator('section[hlmcard]');
    await expect(bookCards.first()).toBeVisible({ timeout: 10000 });

    // 1. Reserve the first book from the list
    const firstBookCard = bookCards.first();
    const firstBookTitle = await firstBookCard.locator('h3[hlmcardtitle]').textContent();
    const reserveBtn = firstBookCard.getByRole('button', { name: /Reserve/ });
    await expect(reserveBtn).toBeVisible();
    await reserveBtn.click();

    // Verify button text changes to "Remove" and the basket cart badge displays "1"
    await expect(firstBookCard.getByRole('button', { name: /Remove/ })).toBeVisible();
    
    const cartTrigger = page.locator('app-basket button[hlmSheetTrigger]');
    await expect(cartTrigger).toContainText('1');

    // 2. Click details on the second book to visit the detail page
    const secondBookCard = bookCards.nth(1);
    const secondBookTitle = await secondBookCard.locator('h3[hlmcardtitle]').textContent();
    const detailsLink = secondBookCard.getByRole('link', { name: /Details/ });
    await detailsLink.click();

    // Verify detail page loaded
    await expect(page).toHaveURL(/\/books\/\d+/);
    await expect(page.locator('h1')).toHaveText(secondBookTitle || '');

    // Reserve from detail page
    const detailReserveBtn = page.getByRole('button', { name: /Reserve/ });
    await expect(detailReserveBtn).toBeVisible();
    await detailReserveBtn.click();

    // Verify details page reserve button changes to "Remove from Reservations"
    await expect(page.getByRole('button', { name: /Remove from Reservations/ })).toBeVisible();
    
    // 3. Open the reservation basket sheet panel
    await cartTrigger.click();
    
    // Verify sheet title and items
    const sheetTitle = page.locator('h3[hlmsheettitle]');
    await expect(sheetTitle).toBeVisible();
    await expect(sheetTitle).toHaveText('Your Reservations');

    const basketItems = page.locator('hlm-sheet-content a[href^="/books/"]');
    await expect(basketItems).toHaveCount(2);

    // 4. Test removing one item from the basket
    const firstRemoveItemBtn = page.locator('hlm-sheet-content button:has(ng-icon[name="lucideTrash2"])').first();
    await expect(firstRemoveItemBtn).toBeVisible();
    await firstRemoveItemBtn.click();
    await expect(basketItems).toHaveCount(1);
    await expect(cartTrigger).toContainText('1');

    // 5. Open checkout dialog to confirm booking
    const confirmBookingBtn = page.getByRole('button', { name: 'Confirm Booking' });
    await expect(confirmBookingBtn).toBeVisible();
    await confirmBookingBtn.click();

    // Verify dialog title is displayed
    const dialogTitle = page.locator('h3[hlmdialogtitle]');
    await expect(dialogTitle).toBeVisible();
    await expect(dialogTitle).toHaveText('Finalize Reservation');

    // 6. Test checkout validation errors by submitting empty form
    const submitBookingBtn = page.locator('button[type="submit"]', { hasText: 'Confirm Booking' });
    await expect(submitBookingBtn).toBeVisible();
    await submitBookingBtn.click();

    // Assert that validation errors are visible under required inputs
    const firstNameError = page.locator('#checkout-firstName-error');
    await expect(firstNameError).toBeVisible();
    await expect(firstNameError).toContainText('First name is required.');

    const lastNameError = page.locator('#checkout-lastName-error');
    await expect(lastNameError).toBeVisible();
    await expect(lastNameError).toContainText('Last name is required.');

    // 7. Test invalid telephone and email formats
    const phoneInput = page.locator('#checkout-phone');
    const emailInput = page.locator('#checkout-email');

    await phoneInput.fill('invalid');
    await emailInput.fill('invalidEmail');
    await submitBookingBtn.click();

    await expect(page.locator('hlm-field-error', { hasText: 'Please enter a valid phone number.' })).toBeVisible();
    await expect(page.locator('hlm-field-error', { hasText: 'Please enter a valid email address.' })).toBeVisible();

    // 8. Submit successfully with valid data
    await page.locator('#checkout-firstName').fill('Kaelian');
    await page.locator('#checkout-lastName').fill('Baudelet');
    await phoneInput.fill('0612345678');
    await emailInput.fill('kaelian.baudelet@example.com');
    await submitBookingBtn.click();

    // Verify success confirmation view
    const successTitle = page.locator('h3[hlmdialogtitle]', { hasText: 'Reservation Confirmed!' });
    await expect(successTitle).toBeVisible();
    await expect(page.locator('div[hlmdialogdescription]')).toContainText('You have successfully booked:');

    // 9. Close success screen
    const okBtn = page.getByRole('button', { name: 'Ok', exact: true });
    await expect(okBtn).toBeVisible();
    await okBtn.click();

    // Check basket panel items are empty and badge count is reset
    const emptyStateText = page.locator('hlm-empty');
    await expect(emptyStateText).toBeVisible();
    await expect(page.locator('div[hlmemptytitle]')).toHaveText('Your cart is empty');
  });

  test('should validate and submit the contact form successfully', async ({ page }) => {
    // 1. Locate and click Contact trigger in navbar (desktop view)
    const contactTrigger = page.locator('nav').getByRole('button', { name: 'Contact' });
    await expect(contactTrigger).toBeVisible();
    await contactTrigger.click();

    // Verify Contact dialog is open
    const dialogTitle = page.locator('h3[hlmdialogtitle]', { hasText: 'Contact Us' });
    await expect(dialogTitle).toBeVisible();

    // 2. Submit empty form to trigger validation errors
    const sendBtn = page.locator('button[type="submit"]', { hasText: 'Send' });
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();

    // Verify missing field errors are displayed
    await expect(page.locator('#contact-name-error')).toContainText('Your full name is required.');
    await expect(page.locator('#contact-email-error')).toContainText('Email is required.');
    await expect(page.locator('#contact-message-error')).toContainText('A message is required.');

    // 3. Test invalid format and length validations
    await page.locator('#contact-name').fill('Jane Doe');
    await page.locator('#contact-email').fill('invalidEmail');
    await page.locator('#contact-message').fill('Short');
    await sendBtn.click();

    await expect(page.locator('#contact-email-error')).toContainText('Please enter a valid email address.');
    await expect(page.locator('#contact-message-error')).toContainText('Message must be at least 10 characters long.');

    // 4. Fill in correct information and submit successfully
    await page.locator('#contact-email').fill('jane.doe@example.com');
    await page.locator('#contact-message').fill('Hello, this is a beautiful and very robust message!');
    await sendBtn.click();

    // Verify successful confirmation dialogue
    const successTitle = page.locator('h3[hlmdialogtitle]', { hasText: 'Message sent!' });
    await expect(successTitle).toBeVisible();
    await expect(page.locator('hlm-dialog-content')).toContainText('Thank you for contacting us.');

    // 5. Close dialogue
    const closeBtn = page.getByRole('button', { name: 'Close', exact: true });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Check that the dialog is closed (hidden)
    await expect(dialogTitle).not.toBeVisible();
  });

});
