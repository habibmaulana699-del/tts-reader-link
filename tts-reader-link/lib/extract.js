import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export function extractReadable(html, url) {
  try {
    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;
    const reader = new Readability(doc);
    const article = reader.parse();
    const title = (article?.title || doc.querySelector('title')?.textContent || 'Halaman').trim();
    let textContent = (article?.textContent || doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
    if (textContent && textContent.length < 50) textContent = '';
    return { title, textContent };
  } catch {
    return { title: 'Halaman', textContent: '' };
  }
}
