import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('CaliGuide E2E Tests', () => {

  test('01 - 页面加载', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e/screenshots/01-loaded.png', fullPage: true });
    // Should see auth page
    const loginBtn = page.locator('button:has-text("Login")');
    await expect(loginBtn).toBeVisible();
  });

  test('02 - 注册新用户', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(500);

    // Switch to register
    await page.click('button:has-text("Register")');
    await page.waitForTimeout(300);

    // Fill form
    await page.fill('input[placeholder="Elena Rodriguez"]', 'Test User');
    await page.fill('input[placeholder="you@example.com"]', `test${Date.now()}@example.com`);
    await page.fill('input[placeholder="At least 6 characters"]', 'password123');

    await page.screenshot({ path: 'e2e/screenshots/02-register-form.png', fullPage: true });

    // Submit
    await page.click('button:has-text("Create account")');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/02-after-register.png', fullPage: true });

    // Should see home page
    const homeContent = page.locator('text=Recommended');
    await expect(homeContent).toBeVisible({ timeout: 5000 });
  });

  test('03 - 登录测试账号', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(500);

    await page.fill('input[placeholder="you@example.com"]', 'alice@caliguide.com');
    await page.fill('input[placeholder="At least 6 characters"]', 'hello123');
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/03-home-page.png', fullPage: true });

    // Should see home page with content
    const homeTitle = page.locator('text=Recommended for You');
    await expect(homeTitle).toBeVisible({ timeout: 5000 });
  });

  test('04 - 首页搜索', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    // Type in search
    const searchInput = page.locator('input[placeholder*="Search for DMV"]');
    await searchInput.fill('driver');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/04-search-results.png', fullPage: true });

    // Should show search results
    const results = page.locator('text=Search Results');
    await expect(results).toBeVisible({ timeout: 5000 });
  });

  test('05 - 分类筛选', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    // Click DMV category
    await page.click('button:has-text("DMV")');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/05-category-filter.png', fullPage: true });
  });

  test('06 - 指南列表', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    // Click "See all"
    await page.click('button:has-text("See all")');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/06-guide-list.png', fullPage: true });

    // Should show guide list
    const guideTitle = page.locator('text=All Guides');
    await expect(guideTitle).toBeVisible({ timeout: 5000 });
  });

  test('07 - 指南详情', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    // Click first guide card
    const guideCard = page.locator('text=California Driver').first();
    await guideCard.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'e2e/screenshots/07-guide-detail.png', fullPage: true });

    // Should show guide content
    const overview = page.locator('text=Overview');
    await expect(overview).toBeVisible({ timeout: 5000 });
  });

  test('08 - 收藏指南', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    // Navigate to guide
    const guideCard = page.locator('text=California Driver').first();
    await guideCard.click();
    await page.waitForTimeout(1500);

    // Click save button
    const saveBtn = page.locator('button:has-text("Save Guide")');
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'e2e/screenshots/08-guide-saved.png', fullPage: true });
    }
  });

  test('09 - 论坛页面', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    // Navigate to forum
    await page.click('nav button:has-text("Forum")');
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'e2e/screenshots/09-forum-page.png', fullPage: true });

    // Should show forum title
    const forumTitle = page.locator('text=Community Forum');
    await expect(forumTitle).toBeVisible({ timeout: 5000 });
  });

  test('10 - 论坛分类筛选', async ({ page }) => {
    await login(page);
    await page.click('nav button:has-text("Forum")');
    await page.waitForTimeout(1500);

    // Click Banking category
    await page.click('button:has-text("#Banking")');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/10-forum-filter.png', fullPage: true });
  });

  test('11 - 论坛帖子详情', async ({ page }) => {
    await login(page);
    await page.click('nav button:has-text("Forum")');
    await page.waitForTimeout(1500);

    // Click first post
    const post = page.locator('text=Best areas for new families').first();
    await post.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'e2e/screenshots/11-post-detail.png', fullPage: true });

    // Should show reply input
    const replyInput = page.locator('input[placeholder*="reply"]');
    await expect(replyInput).toBeVisible({ timeout: 5000 });
  });

  test('12 - 发帖功能', async ({ page }) => {
    await login(page);
    await page.click('nav button:has-text("Forum")');
    await page.waitForTimeout(1500);

    // Click FAB button
    const fab = page.locator('button').filter({ has: page.locator('svg') }).last();
    // Find the + button at bottom right
    const plusBtn = page.locator('.fixed.bottom-28');
    if (await plusBtn.isVisible()) {
      await plusBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'e2e/screenshots/12-create-post-modal.png', fullPage: true });
    }
  });

  test('13 - 聊天页面', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    // Navigate to chatbot
    await page.click('nav button:has-text("Chatbot")');
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'e2e/screenshots/13-chatbot-page.png', fullPage: true });

    // Should show CaliBot
    const botTitle = page.locator('text=CaliBot');
    await expect(botTitle).toBeVisible({ timeout: 5000 });
  });

  test('14 - 个人中心', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    // Navigate to profile
    await page.click('nav button:has-text("Profile")');
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'e2e/screenshots/14-profile-page.png', fullPage: true });

    // Should show user info
    const userName = page.locator('text=Alice Chen');
    await expect(userName).toBeVisible({ timeout: 5000 });
  });

  test('15 - 文件清单', async ({ page }) => {
    await login(page);
    await page.click('nav button:has-text("Profile")');
    await page.waitForTimeout(1500);

    // Click Document Checklist
    await page.click('text=Document Checklist');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/15-checklist.png', fullPage: true });

    // Should show checklist items
    const passport = page.locator('text=Passport');
    await expect(passport).toBeVisible({ timeout: 5000 });
  });

  test('16 - 语言切换', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    // Click language icon
    const langBtn = page.locator('header button').first();
    await langBtn.click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'e2e/screenshots/16-language-dropdown.png', fullPage: true });

    // Click Chinese
    const zhBtn = page.locator('text=简体中文');
    if (await zhBtn.isVisible()) {
      await zhBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/screenshots/16-after-chinese.png', fullPage: true });
    }
  });

  test('17 - 设置页', async ({ page }) => {
    await login(page);
    await page.click('nav button:has-text("Profile")');
    await page.waitForTimeout(1500);

    // Click Settings
    await page.click('text=Settings');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/17-settings.png', fullPage: true });
  });

  test('18 - 已收藏指南', async ({ page }) => {
    await login(page);
    await page.click('nav button:has-text("Profile")');
    await page.waitForTimeout(1500);

    // Click Saved Guides
    await page.click('text=Saved Guides');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/18-saved-guides.png', fullPage: true });
  });

  test('19 - 我的帖子', async ({ page }) => {
    await login(page);
    await page.click('nav button:has-text("Profile")');
    await page.waitForTimeout(1500);

    // Click My Forum Posts
    await page.click('text=My Forum Posts');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/19-my-posts.png', fullPage: true });
  });

  test('20 - 退出登录', async ({ page }) => {
    await login(page);
    await page.click('nav button:has-text("Profile")');
    await page.waitForTimeout(1500);

    // Click Sign Out
    await page.click('text=Sign Out');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/20-after-logout.png', fullPage: true });

    // Should see auth page
    const loginBtn = page.locator('button:has-text("Login")');
    await expect(loginBtn).toBeVisible({ timeout: 5000 });
  });
});

async function login(page: Page) {
  await page.goto(BASE);
  await page.waitForTimeout(500);
  await page.fill('input[placeholder="you@example.com"]', 'alice@caliguide.com');
  await page.fill('input[placeholder="At least 6 characters"]', 'hello123');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(2000);
}
