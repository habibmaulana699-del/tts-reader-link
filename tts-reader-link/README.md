# Reader Link + TTS Overlay (Vercel-ready)

Buat tautan baru yang menampilkan **versi ramah-baca (reader view)** dari sebuah website
dengan **toolbar Text‑to‑Speech** untuk layanan publik.
Cocok untuk dibuat **QR Code** dan diakses banyak orang (aksesibilitas disabilitas).

## Cara pakai
- Deploy ke Vercel.
- Akses:
  ```
  /read?url=https://ppid.kkp.go.id/upt/balai-kipm-tarakan/
  ```
- Halaman akan menampilkan judul + isi artikel (clean view) dan tombol **Putar/Pause**.
- Juga ada fallback **SpeechSynthesis** (langsung di browser) bila API TTS tidak tersedia.

## QR Code
- Buka halaman `/` → tempel URL asal → klik **Buat Link** → QR akan muncul.
- Cetak QR dan bagikan; ketika dipindai, pengguna akan melihat halaman reader + TTS.

## Deploy cepat (Vercel)
1) Buat akun Vercel & OpenAI API Key.
2) Import proyek ini ke Vercel → tambahkan ENV:
   - `OPENAI_API_KEY` (wajib)
   - Opsi tampilan:
     - `SITE_NAME` (judul branding)
     - `PRIMARY_COLOR`, `ACCENT_COLOR` (warna)
3) Selesai. Coba:
   ```
   https://NAMA-PROJEK.vercel.app/read?url=https%3A%2F%2Fppid.kkp.go.id%2Fupt%2Fbalai-kipm-tarakan%2F
   ```

## Catatan
- Ini **reader view** (bukan clone visual identik). Konten utama tetap sama, lebih mudah dibaca.
- Hormati robots.txt & ToS situs asal; konten login/berbayar tidak bisa.
- Untuk PDF, perlu modul tambahan (bisa ditambah).

## Lisensi
MIT
