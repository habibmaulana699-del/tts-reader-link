import fetch from 'node-fetch';
import { extractReadable } from '../lib/extract.js';

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send('Parameter ?url wajib diisi');

    const pageResp = await fetch(url, {
      headers: { 'User-Agent': process.env.USER_AGENT || 'TTS Reader Bot (+https://example.com)' },
      timeout: 15000
    });
    if (!pageResp.ok) return res.status(502).send(`Gagal fetch: ${pageResp.status}`);
    const html = await pageResp.text();

    const { title, textContent } = extractReadable(html, url);
    if (!textContent) {
      return res.status(422).send('Tidak ada teks yang dapat dibacakan dari halaman tersebut.');
    }

    const siteName = process.env.SITE_NAME || 'TTS Reader Link';
    const primary = process.env.PRIMARY_COLOR || '#0F172A';
    const accent = process.env.ACCENT_COLOR || '#22C55E';

    const escapedTitle = title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const safeText = textContent.slice(0, parseInt(process.env.MAX_CHARS || '8000', 10));

    const ttsUrl = `/api/tts?url=${encodeURIComponent(url)}`;
    const fullUrl = `${req.headers['x-forwarded-proto']||'https'}://${req.headers.host}${req.url}`;

    const page = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapedTitle} — ${siteName}</title>
<meta name="description" content="Versi ramah-baca dengan Text-to-Speech.">
<link rel="icon" href="data:,">
<style>
:root{--primary:${primary};--accent:${accent}}
*{box-sizing:border-box}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.6;margin:0;background:#f8fafc;color:#0f172a}
.header{background:var(--primary);color:#fff;padding:16px 20px}
.header h1{margin:0;font-size:18px;font-weight:600}
.container{max-width:900px;margin:20px auto;padding:0 16px}
.card{background:#fff;border-radius:16px;box-shadow:0 6px 24px rgba(0,0,0,.08);padding:20px}
h2.title{margin-top:0;font-size:28px}
.meta{color:#475569;margin-bottom:12px}
.toolbar{position:sticky;top:12px;z-index:10;display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.btn{appearance:none;border:none;border-radius:999px;padding:10px 14px;font-size:15px;cursor:pointer;background:var(--primary);color:#fff}
.btn.secondary{background:#111827}
.btn.ghost{background:#e2e8f0;color:#0f172a}
audio{width:100%;margin-top:8px}
.footer{font-size:13px;color:#64748b;margin:24px 0;text-align:center}
.badge{display:inline-block;background:var(--accent);color:#064e3b;padding:4px 10px;border-radius:999px;font-size:12px;margin-left:8px}
</style>
</head>
<body>
  <div class="header"><h1>${siteName} <span class="badge">Aksesibilitas</span></h1></div>
  <div class="container">
    <div class="card">
      <div class="toolbar">
        <button class="btn" id="play">Putar (Server TTS)</button>
        <button class="btn secondary" id="pause">Pause</button>
        <button class="btn ghost" id="browser">Putar (Browser)</button>
        <a class="btn ghost" id="open" href="${url}" target="_blank" rel="noopener">Buka Situs Asli</a>
      </div>
      <h2 class="title">${escapedTitle}</h2>
      <div id="content" style="white-space:pre-wrap">${safeText.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div>
      <audio id="player" controls preload="none"></audio>
      <div class="footer">
        Tautan ini dapat dibagikan atau dijadikan QR: <br/>
        <a href="${fullUrl}">${fullUrl}</a>
      </div>
    </div>
  </div>
<script>
const player = document.getElementById('player');
const playBtn = document.getElementById('play');
const pauseBtn = document.getElementById('pause');
const browserBtn = document.getElementById('browser');

playBtn.addEventListener('click', async () => {
  player.src = '${ttsUrl}';
  try { await player.play(); } catch {}
});
pauseBtn.addEventListener('click', () => {
  if (!player.paused) player.pause();
  if (window.speechSynthesis) speechSynthesis.cancel();
});
browserBtn.addEventListener('click', () => {
  if (!('speechSynthesis' in window)) { alert('Browser TTS tidak tersedia di perangkat ini.'); return; }
  const text = document.getElementById('content').innerText;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'id-ID';
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
});
</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.send(page);
  } catch (e) {
    console.error(e);
    return res.status(500).send('Kesalahan server');
  }
}
