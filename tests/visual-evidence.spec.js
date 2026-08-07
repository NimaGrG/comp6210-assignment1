import { expect, test } from '@playwright/test'

test('desktop catalogue, navigation, search and filtering', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'SCP-002', level: 1 })).toBeVisible()
  await expect(page.getByText('5 records available')).toBeVisible()
  await page.screenshot({ path: 'evidence/desktop-scp-002.png', fullPage: false })

  await page.getByRole('searchbox', { name: /search scp records/i }).fill('ornate key')
  await expect(page.getByText('1 record available')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'SCP-005', level: 1 })).toBeVisible()
  await page.screenshot({ path: 'evidence/desktop-search-filter.png', fullPage: false })
})

test('mobile catalogue drawer and subject record', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'SCP-002', level: 1 })).toBeVisible()
  await page.getByRole('button', { name: 'Catalogue', exact: true }).click()
  await expect(page.getByRole('complementary', { name: 'SCP catalogue' })).toBeVisible()
  await page.screenshot({ path: 'evidence/mobile-catalogue.png', fullPage: false })

  await page.getByRole('option').filter({ hasText: 'SCP-005' }).click()
  await expect(page.getByRole('heading', { name: 'SCP-005', level: 1 })).toBeVisible()
  await expect(page).toHaveURL(/#scp-005$/)
  await page.screenshot({ path: 'evidence/mobile-scp-005.png', fullPage: false })
})
