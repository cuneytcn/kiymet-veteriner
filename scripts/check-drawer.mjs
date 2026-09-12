import { chromium } from "playwright";

/** Nokta düğmesi paneli açıyor mu, klavyeyle kapanıyor mu? */
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);

const trigger = page.locator('button[aria-label="Klinik bilgilerini aç"]');
const panel = page.locator('div[role="dialog"][aria-label="Klinik bilgileri"]');

console.log(`düğme görünür     : ${await trigger.isVisible()}`);

await trigger.click();
await page.waitForTimeout(600);

const openState = await panel.evaluate((el) => ({
  transform: getComputedStyle(el).transform,
  focused: document.activeElement === el || el.contains(document.activeElement),
}));
console.log(`panel açıldı      : ${openState.transform === "none" || openState.transform.includes("matrix(1, 0, 0, 1, 0, 0)") ? "evet ✓" : openState.transform}`);
console.log(`odak panelde      : ${openState.focused ? "evet ✓" : "HAYIR ✗"}`);

const heading = await panel.locator("h2").first().textContent();
console.log(`ilk başlık        : "${heading?.trim()}"`);

// Esc ile kapanmalı
await page.keyboard.press("Escape");
await page.waitForTimeout(600);
const offscreen = await panel.evaluate((el) => el.getBoundingClientRect().left >= window.innerWidth - 2);
console.log(`Esc ile kapandı   : ${offscreen ? "evet ✓" : "HAYIR ✗"}`);

const focusBack = await page.evaluate(
  () => document.activeElement?.getAttribute("aria-label"),
);
console.log(`odak düğmeye döndü: ${focusBack === "Klinik bilgilerini aç" ? "evet ✓" : focusBack}`);

await browser.close();
