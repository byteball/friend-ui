import "server-only";

let _cached: any = null;
const _pagePool: any[] = [];
const MAX_POOL_SIZE = 3;
let _isLaunching = false;

export async function getBrowser() {
  // Wait if browser is being launched
  while (_isLaunching) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (_cached && (await safeIsConnected(_cached))) return _cached;

  _isLaunching = true;

  try {
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

      _cached = await puppeteer.launch({
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }

    // Handle browser disconnect
    _cached.on('disconnected', () => {
      console.log('Browser disconnected, clearing cache');
      _cached = null;
      _pagePool.length = 0;
    });

    return _cached;
  } finally {
    _isLaunching = false;
  }
}

export async function getPage() {
  const browser = await getBrowser();

  // cache page if available
  if (_pagePool.length > 0) {
    const page = _pagePool.pop();
    // Verify page is still valid
    if (page && !page.isClosed()) {
      return page;
    }
  }

  // Create new page with retry logic
  let retries = 3;
  while (retries > 0) {
    try {
      const page = await browser.newPage();
      return page;
    } catch (error) {
      retries--;
      if (retries === 0) throw error;

      console.log(`Failed to create page, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to get a fresh browser
      _cached = null;
      const newBrowser = await getBrowser();
      if (newBrowser !== browser) {
        // Browser was recreated, try again
        const page = await newBrowser.newPage();
        return page;
      }
    }
  }

  throw new Error('Failed to create page after retries');
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