import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to dashboard', async ({ page }) => {
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should navigate to meetings page', async ({ page }) => {
    await page.click('text=Toplantılar')
    await expect(page).toHaveURL('/meetings')
    await expect(page.locator('h1')).toContainText('Toplantılar')
  })

  test('should navigate to tasks page', async ({ page }) => {
    await page.click('text=Görevler')
    await expect(page).toHaveURL('/tasks')
    await expect(page.locator('h1')).toContainText('Görevler')
  })

  test('should navigate to messages page', async ({ page }) => {
    await page.click('text=Mesaj Yönetimi')
    await expect(page).toHaveURL('/messages')
    await expect(page.locator('h1')).toContainText('Mesaj Yönetimi')
  })

  test('should navigate to donations page', async ({ page }) => {
    await page.click('text=Bağış Yönetimi')
    await expect(page).toHaveURL('/donations')
    await expect(page.locator('h1')).toContainText('Bağış Yönetimi')
  })

  test('should navigate to definitions page', async ({ page }) => {
    await page.click('text=Tanımlamalar')
    await expect(page).toHaveURL('/definitions')
    await expect(page.locator('h1')).toContainText('Tanımlamalar')
  })

  test('should navigate to system settings page', async ({ page }) => {
    await page.click('text=Sistem Ayarları')
    await expect(page).toHaveURL('/system')
    await expect(page.locator('h1')).toContainText('Sistem Ayarları')
  })

  test('should show correct page title in topbar', async ({ page }) => {
    // Check dashboard title
    await expect(page.locator('[data-testid="page-title"]')).toContainText('Dashboard')

    // Navigate to meetings and check title
    await page.click('text=Toplantılar')
    await expect(page.locator('[data-testid="page-title"]')).toContainText('Toplantılar')

    // Navigate to tasks and check title
    await page.click('text=Görevler')
    await expect(page.locator('[data-testid="page-title"]')).toContainText('Görevler')
  })

  test('should maintain sidebar state after navigation', async ({ page }) => {
    // Navigate to a page
    await page.click('text=Toplantılar')
    await expect(page).toHaveURL('/meetings')

    // Check that sidebar is still visible
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()

    // Navigate to another page
    await page.click('text=Görevler')
    await expect(page).toHaveURL('/tasks')

    // Check that sidebar is still visible
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
  })

  test('should handle 404 page', async ({ page }) => {
    await page.goto('/non-existent-page')
    await expect(page.locator('h1')).toContainText('404')
    await expect(page.locator('text=Sayfa bulunamadı')).toBeVisible()
  })
})
