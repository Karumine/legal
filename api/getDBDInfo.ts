import type { VercelRequest, VercelResponse } from '@vercel/node';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let { taxId } = req.query;
  console.log(`[DBD Scraper] Request received for Tax ID: ${taxId}`);

  if (typeof taxId === 'string') {
    taxId = taxId.replace(/-/g, '').trim();
  }

  if (!taxId || typeof taxId !== 'string' || taxId.length !== 13) {
    console.error(`[DBD Scraper] Invalid Tax ID: ${taxId}`);
    return res.status(400).json({ error: 'Valid 13-digit taxId is required', received: taxId });
  }

  let browser;
  try {
    console.log(`[DBD Scraper] Launching browser...`);
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: (chromium as any).defaultViewport || { width: 1280, height: 720 },
      executablePath: await chromium.executablePath(),
      headless: true, // Vercel requires headless: true
    });

    const page = await browser.newPage();
    // Pipe browser console to Vercel logs
    page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

    const url = `https://datawarehouse.dbd.go.th/company/profile/7${taxId}`;
    console.log(`[DBD Scraper] Navigating to: ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
    } catch (e) {
      console.warn('[DBD Scraper] Navigation timeout or networkidle2 failed, proceeding anyway...');
    }

    // Wait for the Nuxt state to be potentially ready
    await new Promise(r => setTimeout(r, 1000));

    const diagnostics = await page.evaluate(() => {
      return {
        title: document.title,
        hasNuxt: !!(window as any).__NUXT__,
        bodyLength: document.body.innerText.length,
        htmlSnippet: document.documentElement.innerHTML.substring(0, 500)
      };
    });
    console.log('[DBD Scraper] Page Diagnostics:', JSON.stringify(diagnostics));

    if (diagnostics.title.includes('Access Denied') || diagnostics.title.includes('Attention Required')) {
      console.error('[DBD Scraper] BLOCK DETECTED: Page title indicates access denial');
      return res.status(403).json({ error: 'Access Denied by DBD website', diagnostics });
    }

    const profileData = await page.evaluate(() => {
      // @ts-ignore
      const store = window.__NUXT__?.pinia?.companyProfileStore?.profile;
      if (!store) {
        console.error('[DBD Scraper] Profile store not found in window.__NUXT__');
        return null;
      }

      console.log('[DBD Scraper] Found profile store for:', store.jpName);

      // Format date if it's an array [Y, M, D]
      let regDate = '';
      if (Array.isArray(store.regDate)) {
        const [y, m, d] = store.regDate;
        regDate = `${d}/${m}/${y}`;
      } else {
        regDate = store.regDate || '';
      }

      return {
        companyName: store.jpName,
        taxId: store.jpNo,
        type: store.jpTypeDesc || store.businessType?.businessTypeDesc || '',
        status: store.jpStatus?.jpStatDesc || store.jpStatDesc || '',
        registrationDate: regDate,
        capital: store.capAmt,
        address: store.address || '',
        directors: store.committees?.map((c: any) => 
          `${c.title || ''}${c.firstName || ''} ${c.lastName || ''}`.trim()
        ) || [],
        signingCondition: store.committeeSigns?.[0]?.detail || '',
        businessCategory: store.jpDescriptions?.map((d: any) => d.tsicDesc).join(', ') || '',
      };
    });

    if (!profileData) {
      console.error('[DBD Scraper] result is null or empty');
      return res.status(404).json({ error: 'Company not found/mapping failed', diagnostics });
    }

    console.log('[DBD Scraper] Success! Returning data for:', profileData.companyName);
    return res.status(200).json(profileData);

  } catch (error: any) {
    console.error('Vercel Scraper Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
