import cors from 'cors';
import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
app.use(cors());

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const PORT = process.env.PORT ?? 4000;

// The whole architecture bet: this loads the exact same React component
// (ResumeContent) that the FE previews with Paged.js — just at the bare
// /print route, no app chrome. `preferCSSPageSize` tells Chromium to use
// the frontend's own @page CSS rule (size/margin) instead of JS-side
// options here, so page geometry is defined once, not duplicated.
app.get('/api/resume.pdf', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${FRONTEND_URL}/print`, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.send(pdf);
  } catch (error) {
    console.error('[GET /api/resume.pdf] failed:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  } finally {
    await browser?.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
