import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

function dbdApiPlugin(): Plugin {
  return {
    name: 'dbd-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/getDBDInfo')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const taxId = url.searchParams.get('taxId');

        if (!taxId || taxId.length !== 13) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Valid 13-digit taxId is required' }));
          return;
        }

        let browser;
        try {
          console.log(`[DBD API] Searching for Tax ID: ${taxId}`);
          const puppeteer = await import('puppeteer-core');

          // Try common browser paths on Windows
          const possiblePaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
            'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
            process.env.CHROME_PATH || '',
          ].filter(Boolean);

          let executablePath = '';
          const fs = await import('fs');
          for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
              executablePath = p;
              break;
            }
          }

          if (!executablePath) {
            console.error('[DBD API] Browser not found');
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Chrome/Edge not found. Set CHROME_PATH env var.' }));
            return;
          }

          console.log(`[DBD API] Launching browser: ${executablePath}`);
          browser = await puppeteer.default.launch({
            executablePath,
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          });

          const page = await browser.newPage();
          await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
          );

          let prefix = '7';
          if (taxId.startsWith('01075') || taxId.charAt(3) === '7') {
            prefix = '5'; // Public Company
          } else {
            prefix = '7'; // Private Company / Partnership
          }
          const profileUrl = `https://datawarehouse.dbd.go.th/company/profile/${prefix}/${taxId}`;
          console.log(`[DBD API] Navigating to: ${profileUrl}`);
          
          await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
          console.log('[DBD API] Page loaded, evaluating content...');

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
            console.warn('[DBD API] Profile data not found in page store');
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Company not found' }));
            return;
          }

          console.log(`[DBD API] Successfully retrieved data for: ${profileData.companyName}`);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(profileData));
        } catch (error: any) {
          console.error('[DBD API] Error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
        } finally {
          if (browser) {
            await browser.close();
            console.log('[DBD API] Browser closed');
          }
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dbdApiPlugin()],
  server: {
    open: true,
    proxy: {
      '/dbd-api': {
        target: 'https://opendata.dbd.go.th',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dbd-api/, ''),
        secure: false,
      },
    },
  },
})
