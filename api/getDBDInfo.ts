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

    let prefix = '7';
    if (taxId.startsWith('01075') || taxId.charAt(3) === '7') {
      prefix = '5'; // Public Company
    } else {
      prefix = '7'; // Private Company / Partnership
    }
    
    const url = `https://datawarehouse.dbd.go.th/company/profile/${prefix}/${taxId}`;
    console.log(`[DBD Scraper] Navigating to: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const profileData = await page.evaluate(() => {
      const store = (window as any).__NUXT__?.pinia?.companyProfileStore;
      if (!store) return { error: 'Pinia store not found', html: document.body.innerHTML.substring(0, 500) };

      const profile = store.profile?._value || store.profile;
      if (!profile) return { error: 'Profile not found in store', storeState: JSON.stringify(Object.keys(store)) };

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

    if (!profileData || (profileData as any).error) {
      console.error('[DBD Scraper] result is null or has error:', profileData);
      return res.status(404).json({ 
        error: 'Company not found/mapping failed', 
        diagnostics: profileData,
        taxId,
        url 
      });
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
