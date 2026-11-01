# 🚀 YT Analyzer Pro v2.0

> **YouTube Market Intelligence, Competitor Analysis, Niche Finder & Creator Automation**

Aplikasi web modern untuk menganalisis kompetitor YouTube, menemukan celah pasar (*Blue Ocean Niche*), memantau tren video global, mengacak musik & menghasilkan timestamp babak (*chapters*), serta merancang strategi konten dengan AI.

---

## ✨ Fitur-Fitur Utama & Keunggulan

1. **Riset Kompetitor (`CompetitorTab`)**:
   - Menerima link channel, `@handle`, channel ID (`UC...`), link video, atau nama channel.
   - Analisis otomatis 50 video terbaru.
   - Perhitungan **VPH (Views Per Hour)** & **Engagement Rate** sesungguhnya.
   - Klasifikasi otomatis **YouTube Shorts vs Video Reguler**.
   - Histogram distribusi **24 Jam Upload** dan **Hari Upload Favorit**.
   - Ekstraksi **SEO Meta Tags tersembunyi** dan kata kunci judul terpopuler.
   - Ekspor data 50 video ke file `.CSV` dengan 1 klik.
2. **Pencari Niche / Blue Ocean Finder (`NicheTab`)**:
   - Mendeteksi video *outlier*: Channel dengan subscriber kecil yang mendapatkan ledakan views raksasa.
   - Slider rasio $\text{Views} / \text{Subscribers}$ dan batas minimal views yang bisa diatur dinamis.
   - Skor Potensi Pasar (*Opportunity Score*).
   - Rekomendasi sub-niche otomatis.
3. **Eksplorasi Tren Global (`TrendTab`)**:
   - Filter video trending berdasarkan negara (Indonesia, US, UK, Jepang, Korea, dll.) dan kategori.
   - Menghitung **Skor Momentum Tren** & laju penonton baru per jam.
4. **Pengacak Musik & Timestamp Chapters (`ShufflerTab`)**:
   - Drag & drop kumpulan file lagu (MP3, WAV, dll).
   - Membaca durasi audio langsung di browser via Web Audio API.
   - Mengacak urutan dan membuat file ZIP (`Hasil_Acak_Musik.zip`) berisi file terurut + file `00 - Daftar_Lagu.txt` dengan format timestamp YouTube siap paste.
5. **Watchlist Channel Favorit (`FavoritesTab`)**:
   - Simpan channel kompetitor ke penyimpanan lokal browser untuk pemantauan berkala.
6. **Bedah AI & Asisten Konten (`AiModal`)**:
   - Menghasilkan 5 variasi judul ber-CTR tinggi, hook 30 detik pertama, naskah 8–10 menit, saran B-roll, serta prompt visual Midjourney/DALL-E.
   - Mendukung **Salin Prompt untuk ChatGPT/Claude** atau **Eksekusi Langsung via Google Gemini API**.
7. **Dukungan Multi-API Key (Auto-Rotation)**:
   - Mendukung memasukkan lebih dari 1 YouTube API Key. Jika satu key habis kuota harian (10.000 unit), sistem otomatis beralih (*failover*) ke key cadangan!

---

## 🛠️ Menjalankan di Lokal (Development)

Pastikan Node.js sudah terpasang di komputer Anda.

```bash
# 1. Masuk ke direktori proyek
cd yt-analyzer-pro

# 2. Jalankan server lokal
npm run dev
```

Buka URL yang muncul di browser (biasanya `http://localhost:5173`).

---

## 🚀 Cara Deploy ke Vercel (Gratis & Mudah)

### Cara 1: Lewat Web Vercel Dashboard (Rekomendasi)
1. Unggah (*push*) folder proyek ini ke repositori **GitHub** Anda.
2. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
3. Klik **"Add New..."** -> **"Project"**.
4. Pilih repositori GitHub Anda.
5. Vercel akan otomatis mendeteksi framework: **Vite**.
6. Klik tombol **"Deploy"**. Selesai! Web Anda akan langsung aktif dengan domain `.vercel.app`.

### Cara 2: Lewat Vercel CLI
```bash
# Pasang Vercel CLI secara global (jika belum)
npm install -g vercel

# Masuk ke direktori dan jalankan
cd yt-analyzer-pro
vercel
```
Ikuti instruksi di layar, pilih default pengaturan.

---

## 🔑 Cara Mendapatkan YouTube API Key (Gratis)
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat Project baru (misal: `YT Analyzer`).
3. Buka menu **APIs & Services** > **Library**, cari **YouTube Data API v3**, lalu klik **Enable**.
4. Buka menu **Credentials** > **Create Credentials** > **API Key**.
5. Salin key tersebut dan masukkan ke ikon kunci di web YT Analyzer Pro.

*(Opsional) Dapatkan juga Google Gemini API Key gratis di [Google AI Studio](https://aistudio.google.com/app/apikey) untuk analisis AI langsung.*

