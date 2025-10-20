import "server-only";

let _cached: any = null;
const _pagePool: any[] = [];
const MAX_POOL_SIZE = 3;

export async function getBrowser() {
  if (_cached && (await safeIsConnected(_cached))) return _cached;

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    // Use local Chrome/Chromium for development
    const puppeteer = await import("puppeteer");
    _cached = await puppeteer.launch({
      headless: true,
    });
  } else {
    // Use @sparticuz/chromium for production
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = await import("puppeteer-core");

    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || await chromium.executablePath();

    _cached = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath,
      headless: true,
    });
  }

  return _cached;
}

export async function getPage() {
  const browser = await getBrowser();

  // cache page if available
  if (_pagePool.length > 0) {
    return _pagePool.pop();
  }

  return browser.newPage();
}

export async function releasePage(page: any) {
  try {
    await page.reload(); // Очищаем страницу для переиспользования
    if (_pagePool.length < MAX_POOL_SIZE) {
      _pagePool.push(page);
    } else {
      await page.close();
    }
  } catch {
    try { await page.close(); } catch { /* ignore */ }
  }
}

async function safeIsConnected(browser: any) {
  try { return browser?.isConnected?.(); } catch { return false; }
}