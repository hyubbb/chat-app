import { test, expect } from "@playwright/test";

const LOCALHOST = process.env.BASE_URL as string;

test("[로그인 모달 테스트]", async ({ page }) => {
  await page.goto(LOCALHOST);
  await test.step("1. 로그인 확인", async () => {
    // 로그인 버튼 클릭
    const buttonsElm = page.locator("#auth-btn button");
    await buttonsElm.nth(1).click();
    // login dialog가 열렸는지 확인
    await expect(page.locator("div#login-modal")).toBeVisible();

    // fill input
    await page.fill("input#id", "admin");
    await page.fill("input#password", "admin");

    // button중에서 텍스트가 완료인것
    await page.click("button:has-text('완료')");

    // login dialog가 닫혔는지 확인
    await expect(page.locator("div#login-modal")).not.toBeVisible();

    // 로그인이 되어서 userIcon이 보이는지 확인
    await expect(page.locator("#user-icon")).toBeVisible();
  });

  await test.step("2. 로그아웃", async () => {
    // 로그아웃 버튼 클릭
    const logoutElm = page.locator("#logout-btn button");
    await logoutElm.nth(1).click();

    // 로그인이 되어서 userIcon이 사라졌는지 확인
    await expect(page.locator("#user-icon")).not.toBeVisible();
  });

  await test.step("3. 아이디 실패", async () => {
    // 로그인 버튼 클릭
    const buttonsElm = page.locator("#auth-btn button");
    await buttonsElm.nth(1).click();
    // login dialog가 열렸는지 확인
    await expect(page.locator("div#login-modal")).toBeVisible();

    // 아이디 틀리기
    await page.fill("input#id", "admin@");
    await page.fill("input#password", "admin");

    // alert 발생을 감지하고 처리하는 Promise 설정
    const dialogPromise = page.waitForEvent("dialog");

    // 버튼 클릭 후 alert 창 대기
    await page.click("button:has-text('완료')");

    // 다이얼로그 이벤트를 기다림
    const dialog = await dialogPromise;
    // alert 닫기
    await dialog.dismiss();
  });
  await test.step("4. 암호 실패", async () => {
    // login dialog가 열렸는지 확인
    await expect(page.locator("div#login-modal")).toBeVisible();

    // 암호 틀리기
    await page.fill("input#id", "admin");
    await page.fill("input#password", "admin@");

    // alert 발생을 감지하고 처리하는 Promise 설정
    const dialogPromise = page.waitForEvent("dialog");

    // 버튼 클릭 후 alert 창 대기
    await page.click("button:has-text('완료')");

    // 다이얼로그 이벤트를 기다림
    const dialog = await dialogPromise;
    // alert 닫기
    await dialog.dismiss();
  });
});
