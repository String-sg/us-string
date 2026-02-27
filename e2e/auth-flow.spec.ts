import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show login page when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');

    // Should show login form
    await expect(page.locator('text=LOGIN / SIGNUP')).toBeVisible();
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();
  });

  test('should show Google OAuth button on login page', async ({ page }) => {
    await page.goto('/login');

    // Check login page elements
    await expect(page.locator('text=us.string.sg')).toBeVisible();
    await expect(page.locator('text=Sign in to claim your handle')).toBeVisible();

    const googleButton = page.locator('button:has-text("Continue with Google")');
    await expect(googleButton).toBeVisible();
    await expect(googleButton).not.toBeDisabled();
  });

  test('should redirect authenticated users away from login', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('string-auth-user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg'
      }));
    });

    await page.goto('/login');

    // Should redirect to claim page
    await expect(page).toHaveURL('/claim');
  });
});

test.describe('Profile Creation Flow', () => {
  test('should show claim page for authenticated users without profiles', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('string-auth-user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg'
      }));
    });

    await page.goto('/claim');

    // Should show claim form
    await expect(page.locator('text=CLAIM YOUR HANDLE')).toBeVisible();
    await expect(page.locator('text=us.string.sg/')).toBeVisible();

    const usernameInput = page.locator('input[placeholder="yourname"]');
    await expect(usernameInput).toBeVisible();
  });

  test('should validate username requirements', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('string-auth-user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg'
      }));
    });

    await page.goto('/claim');

    const usernameInput = page.locator('input[placeholder="yourname"]');
    const submitButton = page.locator('button[type="submit"]');

    // Test too short username
    await usernameInput.fill('ab');
    await expect(page.locator('text=Username must be at least 3 characters')).toBeVisible();
    await expect(submitButton).toBeDisabled();

    // Test invalid characters
    await usernameInput.fill('user@123');
    await expect(page.locator('text=Only lowercase letters and numbers allowed')).toBeVisible();
    await expect(submitButton).toBeDisabled();

    // Test reserved word
    await usernameInput.fill('admin');
    await expect(page.locator('text=This username is reserved')).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });
});

test.describe('Dashboard Flow', () => {
  test('should show dashboard for users with profiles', async ({ page }) => {
    // Mock authenticated state and API responses
    await page.route('/api/profiles*', async (route) => {
      if (route.request().url().includes('userId=test-user-id')) {
        await route.fulfill({
          json: {
            profile: {
              id: 'test-user-id',
              username: 'testuser',
              name: 'Test User',
              tagline: 'Test tagline',
              claimed: true
            }
          }
        });
      }
    });

    await page.route('/api/product-members*', async (route) => {
      await route.fulfill({
        json: { productMembers: [] }
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('string-auth-user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg'
      }));
    });

    await page.goto('/dashboard');

    // Should show dashboard content
    await expect(page.locator('text=EDIT PROFILE')).toBeVisible();
    await expect(page.locator('text=PRODUCTS SHIPPED')).toBeVisible();
    await expect(page.locator('text=us.string.sg/testuser')).toBeVisible();
  });
});