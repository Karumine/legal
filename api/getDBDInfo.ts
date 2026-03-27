import type { VercelRequest, VercelResponse } from '@vercel/node';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { taxId } = req.query;

  if (!taxId || typeof taxId !== 'string' || taxId.length !== 13) {
    return res.status(400).json({ error: 'Valid 13-digit taxId is required' });
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

    const entityType = taxId.charAt(3);
    const url = `https://datawarehouse.dbd.go.th/company/profile/${entityType}${taxId}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const profileData = await page.evaluate(() => {
      // @ts-ignore
      const store = (window as any).__NUXT__?.pinia?.companyProfileStore;
      if (!store) return null;

      const profile = store.profile?._value || store.profile;
      if (!profile) return null;

      const committees = store.committees?._value || [];
      const committeeSigns = store.signCommittees?._value || [];

      return {
        companyName: profile.jpName,
        taxId: profile.jpNo,
        type: profile.jpTypeDesc,
        status: profile.jpStatusDesc,
        registrationDate: profile.registerDate,
        capital: profile.capAmt,
        address: [profile.address, profile.locationTumbon?.tumbonDesc, profile.locationAmpur?.ampurDesc, profile.locationProvince?.pvDesc, profile.zipCode].filter(Boolean).join(' ').trim(),
        directors: committees.map((c: any) => `${c.firstName} ${c.lastName}`),
        signingCondition: committeeSigns[0]?.signDescription || '',
        businessCategory: profile.jpDescriptions?.map((d: any) => d.tsicDesc).join(', ') || '',
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
