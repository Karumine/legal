import type { VercelRequest, VercelResponse } from '@vercel/node';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let { taxId } = req.query;

  if (typeof taxId === 'string') {
    taxId = taxId.replace(/-/g, '').trim();
  }

  if (!taxId || typeof taxId !== 'string' || taxId.length !== 13) {
    return res.status(400).json({ error: 'Valid 13-digit taxId is required', received: taxId });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: (chromium as any).defaultViewport || { width: 1280, height: 720 },
      executablePath: await chromium.executablePath(),
      headless: true, // Vercel requires headless: true
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

    const url = `https://datawarehouse.dbd.go.th/company/profile/7${taxId}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const profileData = await page.evaluate(() => {
      // @ts-ignore
      const store = window.__NUXT__?.pinia?.companyProfileStore?.profile;
      if (!store) return null;

      return {
        companyName: store.jpName,
        taxId: store.jpNo,
        type: store.jpTypeDesc,
        status: store.jpStatusDesc,
        registrationDate: store.registerDate,
        capital: store.capAmt,
        address: `${store.address} ${store.locationTumbon} ${store.locationAmpur} ${store.locationProvince} ${store.zipCode}`,
        directors: store.committees?.map((c: any) => `${c.firstName} ${c.lastName}`) || [],
        signingCondition: store.committeeSigns?.[0]?.detail || '',
        businessCategory: store.jpDescriptions?.map((d: any) => d.tsicDesc).join(', ') || '',
      };
    });

    if (!profileData) {
      return res.status(404).json({ error: 'Company not found' });
    }

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
