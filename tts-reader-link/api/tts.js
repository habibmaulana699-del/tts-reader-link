import fetch from 'node-fetch';
import { extractReadable } from '../lib/extract.js';

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Parameter ?url wajib diisi' });

    const pageResp = await fetch(url, {
      headers: { 'User-Agent': process.env.USER_AGENT || 'TTS Reader Bot (+https://example.com)' },
      timeout: 15000
    });
    if (!pageResp.ok) return res.status(502).json({ error: `Gagal fetch: ${pageResp.status}` });
    const html = await pageResp.text();

    const { title, textContent } = extractReadable(html, url);
    if (!textContent) return res.status(422).json({ error: 'Tidak ada teks yang dapat dibacakan.' });

    const MAX_CHARS = parseInt(process.env.MAX_CHARS || '8000', 10);
    const voice = process.env.TTS_VOICE || 'alloy';
    const model = process.env.TTS_MODEL || 'gpt-4o-mini-tts';
    const textToRead = textContent.slice(0, MAX_CHARS);
    const input = `${title ? title + '. ' : ''}${textToRead}`;

    const ttsResp = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, voice, input })
    });
    if (!ttsResp.ok) {
      const errText = await ttsResp.text();
      return res.status(502).json({ error: `TTS gagal: ${errText}` });
    }
    const audio = Buffer.from(await ttsResp.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent((title||'audio'))}.mp3"`);
    return res.send(audio);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Kesalahan server' });
  }
}
