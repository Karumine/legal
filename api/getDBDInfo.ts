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

    const entityType = taxId.charAt(3);
    const url = `https://datawarehouse.dbd.go.th/company/profile/${entityType}${taxId}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for data to be populated in the Pinia store
    try {
      await page.waitForFunction(() => {
        // @ts-ignore
        const p = window.__NUXT__?.pinia?.companyProfileStore?.profile?._value;
        return !!(p && (p.jpName || p.jpNameTH));
      }, { timeout: 15000 });
    } catch (e) {
      console.warn('[DBD Scraper] Waiting for hydration timed out, attempting to scrape anyway');
    }

    const profileData = await page.evaluate(() => {
      // @ts-ignore
      const store = (window as any).__NUXT__?.pinia?.companyProfileStore;
      if (!store) return null;

      const profile = store.profile?._value || store.profile;
      if (!profile || (!profile.jpName && !profile.jpNo)) return null;

      const committees = store.committees?._value || [];
      const committeeSigns = store.signCommittees?._value || [];

      return {
        companyName: profile.jpName,
        taxId: profile.jpNo,
        type: profile.jpType?.jpTypeDesc || profile.jpTypeDesc || '',
        status: profile.jpStatus?.jpStatDesc || profile.jpStatusDesc || '',
        registrationDate: profile.regDate || profile.registerDate || '',
        capital: profile.capAmt,
        address: [
          profile.address,
          profile.locationTumbon?.tumbonDesc,
          profile.locationAmpur?.ampurDesc,
          profile.locationProvince?.pvDesc,
          profile.zipCode
        ].filter(Boolean).join(' ').trim(),
        directors: committees.map((c: any) => `${c.titleName || ''}${c.firstName} ${c.lastName}`.trim()),
        signingCondition: committeeSigns[0]?.signDescription || '',
        businessCategory: profile.jpDescriptions?.map((d: any) => d.tsicDesc).join(', ') || '',
      };
    });

    if (!profileData) {
      console.error('[DBD Scraper] result is null or empty');
      return res.status(404).json({ error: 'Company not found/mapping failed' });
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
