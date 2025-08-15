import { test, expect } from '@playwright/test'

test.describe('Forms', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should create a new meeting', async ({ page }) => {
    await page.goto('/meetings')
    
    // Click add meeting button
    await page.click('text=Yeni Toplantı')
    
    // Fill form
    await page.fill('[data-testid="meeting-title"]', 'Test Meeting')
    await page.fill('[data-testid="meeting-description"]', 'Test meeting description')
    await page.fill('[data-testid="meeting-date"]', '2024-12-25')
    await page.fill('[data-testid="meeting-time"]', '14:00')
    await page.selectOption('[data-testid="meeting-type"]', 'online')
    
    // Submit form
    await page.click('text=Kaydet')
    
    // Verify success message
    await expect(page.locator('text=Toplantı başarıyla oluşturuldu')).toBeVisible()
  })

  test('should create a new task', async ({ page }) => {
    await page.goto('/tasks')
    
    // Click add task button
    await page.click('text=Yeni Görev')
    
    // Fill form
    await page.fill('[data-testid="task-title"]', 'Test Task')
    await page.fill('[data-testid="task-description"]', 'Test task description')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.fill('[data-testid="task-due-date"]', '2024-12-30')
    
    // Submit form
    await page.click('text=Kaydet')
    
    // Verify success message
    await expect(page.locator('text=Görev başarıyla oluşturuldu')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/meetings')
    
    // Click add meeting button
    await page.click('text=Yeni Toplantı')
    
    // Try to submit without filling required fields
    await page.click('text=Kaydet')
    
    // Verify validation messages
    await expect(page.locator('text=Başlık zorunludur')).toBeVisible()
    await expect(page.locator('text=Tarih zorunludur')).toBeVisible()
  })

  test('should edit existing meeting', async ({ page }) => {
    await page.goto('/meetings')
    
    // Click on first meeting to edit
    await page.click('[data-testid="meeting-item"]:first-child')
    
    // Update title
    await page.fill('[data-testid="meeting-title"]', 'Updated Meeting Title')
    
    // Submit form
    await page.click('text=Güncelle')
    
    // Verify success message
    await expect(page.locator('text=Toplantı başarıyla güncellendi')).toBeVisible()
  })

  test('should delete meeting with confirmation', async ({ page }) => {
    await page.goto('/meetings')
    
    // Click delete button on first meeting
    await page.click('[data-testid="delete-meeting"]:first-child')
    
    // Confirm deletion
    await page.click('text=Evet, Sil')
    
    // Verify success message
    await expect(page.locator('text=Toplantı başarıyla silindi')).toBeVisible()
  })

  test('should search and filter meetings', async ({ page }) => {
    await page.goto('/meetings')
    
    // Search for a meeting
    await page.fill('[data-testid="search-input"]', 'Test Meeting')
    
    // Apply filter
    await page.selectOption('[data-testid="status-filter"]', 'upcoming')
    
    // Verify results
    await expect(page.locator('[data-testid="meeting-item"]')).toHaveCount(1)
  })

  test('should handle form submission errors', async ({ page }) => {
    await page.goto('/meetings')
    
    // Mock API error
    await page.route('**/api/meetings', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      })
    })
    
    // Try to create meeting
    await page.click('text=Yeni Toplantı')
    await page.fill('[data-testid="meeting-title"]', 'Test Meeting')
    await page.click('text=Kaydet')
    
    // Verify error message
    await expect(page.locator('text=Bir hata oluştu')).toBeVisible()
  })

  test('should handle file upload in forms', async ({ page }) => {
    await page.goto('/meetings')
    
    // Click add meeting button
    await page.click('text=Yeni Toplantı')
    
    // Upload file
    await page.setInputFiles('[data-testid="file-upload"]', {
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content')
    })
    
    // Verify file is uploaded
    await expect(page.locator('text=test-document.pdf')).toBeVisible()
  })

  test('should handle form with dynamic fields', async ({ page }) => {
    await page.goto('/tasks')
    
    // Click add task button
    await page.click('text=Yeni Görev')
    
    // Add subtask
    await page.click('text=Alt Görev Ekle')
    await page.fill('[data-testid="subtask-title"]', 'Subtask 1')
    
    // Add another subtask
    await page.click('text=Alt Görev Ekle')
    await page.fill('[data-testid="subtask-title"]:nth-child(2)', 'Subtask 2')
    
    // Remove first subtask
    await page.click('[data-testid="remove-subtask"]:first-child')
    
    // Verify only one subtask remains
    await expect(page.locator('[data-testid="subtask-title"]')).toHaveCount(1)
  })
})
