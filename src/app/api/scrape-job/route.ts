import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url || !URL.canParse(url)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LazyCV/1.0)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`Failed to fetch URL: ${res.statusText}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove noise
    $('script, style, nav, header, footer, aside, [class*="cookie"], [class*="banner"], [id*="nav"]').remove();

    // Try common job posting selectors first, fall back to main/article/body
    const selectors = [
      '[class*="job-description"]', '[class*="jobDescription"]', '[id*="job-description"]',
      '[class*="job-details"]', '[class*="description"]', 'main', 'article', 'body',
    ];

    let text = '';
    for (const sel of selectors) {
      const el = $(sel).first();
      if (el.length && el.text().trim().length > 200) {
        text = el.text();
        break;
      }
    }

    // Normalise whitespace
    text = text.replace(/\s+/g, ' ').trim().substring(0, 8000);

    if (!text) return NextResponse.json({ error: 'Could not extract text from page' }, { status: 422 });

    return NextResponse.json({ text });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Failed to scrape URL' }, { status: 500 });
  }
}
