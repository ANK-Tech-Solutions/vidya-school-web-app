import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'https://vidya-school-web-app.vercel.app';
const OUT = path.join(__dirname, 'e2e-browser-artifacts');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function log(step, ok, detail = '') {
  results.push({ step, ok, detail });
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${step}${detail ? ' — ' + detail : ''}`);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
}

async function login(page, username, password) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await Promise.all([
    page.waitForURL(/(admin|driver|student)/, { timeout: 90000 }).catch(() => null),
    page.getByRole('button', { name: /continue to dashboard|signing/i }).click(),
  ]);
  await page.waitForTimeout(2500);
  const toastFail = await page
    .locator('text=/couldn.?t sign you in|can.?t reach the api|access blocked|sign-in failed/i')
    .first()
    .isVisible()
    .catch(() => false);
  return { url: page.url(), toastFail };
}

async function visit(page, pathName, expectText) {
  await page.goto(`${BASE}${pathName}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  const body = await page.locator('body').innerText();
  const bad = /could not load|unexpected error|internal server|we couldn/i.test(body);
  const has = expectText ? new RegExp(expectText, 'i').test(body) : true;
  return { url: page.url(), bad, has, snippet: body.slice(0, 180).replace(/\s+/g, ' ') };
}

const browser = await chromium.launch({ headless: false, slowMo: 250 });
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();
page.setDefaultTimeout(45000);

try {
  const adminLogin = await login(page, 'admin', 'Password@123');
  await shot(page, '01-admin-after-login');
  log('Admin login', !adminLogin.toastFail && /\/admin/.test(adminLogin.url), adminLogin.url);
  if (adminLogin.toastFail) throw new Error('Admin login failed in UI');

  for (const [p, expect] of [
    ['/admin', 'student|driver|bus|online|dashboard|recent'],
    ['/admin/buses', 'bus|plate|capacity|empty|add'],
    ['/admin/routes', 'route|stop|empty|add'],
    ['/admin/drivers', 'driver|license|empty|add'],
    ['/admin/students', 'student|grade|empty|add'],
    ['/admin/parents', 'parent|empty|add'],
    ['/admin/assignments', 'assign|empty|driver|student'],
    ['/admin/reports', 'report|summary|trip|attendance'],
  ]) {
    const r = await visit(page, p, expect);
    await shot(page, `admin-${p.replace(/\//g, '_') || 'home'}`);
    log(`Admin page ${p}`, !r.bad && r.has && /\/admin/.test(r.url), r.snippet);
  }

  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());

  const driverLogin = await login(page, 'driver1', 'Password@123');
  await shot(page, '02-driver-after-login');
  log('Driver login', !driverLogin.toastFail && /\/driver/.test(driverLogin.url), driverLogin.url);
  for (const p of ['/driver', '/driver/trip', '/driver/students', '/driver/route', '/driver/profile']) {
    const r = await visit(page, p, '.');
    await shot(page, `driver-${p.replace(/\//g, '_')}`);
    log(`Driver page ${p}`, !r.bad && /\/driver/.test(r.url), r.snippet);
  }
  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());

  const parentLogin = await login(page, 'parent1', 'Password@123');
  await shot(page, '03-parent-after-login');
  log('Parent login', !parentLogin.toastFail && /\/student/.test(parentLogin.url), parentLogin.url);
  for (const p of ['/student', '/student/attendance', '/student/history', '/student/tracking', '/student/profile']) {
    const r = await visit(page, p, '.');
    await shot(page, `student-${p.replace(/\//g, '_')}`);
    log(`Parent page ${p}`, !r.bad && /\/student/.test(r.url), r.snippet);
  }
} catch (err) {
  log('Fatal', false, err.message);
  await shot(page, '99-error').catch(() => {});
} finally {
  const failed = results.filter((r) => !r.ok).length;
  const passed = results.filter((r) => r.ok).length;
  console.log(`\nSUMMARY passed=${passed} failed=${failed}`);
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
  await page.waitForTimeout(2000);
  await browser.close();
  process.exit(failed ? 1 : 0);
}
