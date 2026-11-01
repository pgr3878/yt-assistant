import React, { useState } from 'react';
import { Sparkles, Copy, Check, X, Bot, Wand2, Loader2, FileText, ArrowRight } from 'lucide-react';
import { generateGeminiContent } from '../services/gemini';

export default function AiModal({ isOpen, onClose, video, geminiKey }) {
  const [format, setFormat] = useState('storytelling');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen || !video) return null;

  const formats = [
    { id: 'storytelling', label: '📝 Narasi & Storytelling' },
    { id: 'music', label: '🎵 Musik & Kompilasi' },
    { id: 'shorts', label: '📱 YouTube Shorts' },
    { id: 'review', label: '📦 Review Produk/Tech' },
    { id: 'gaming', label: '🎮 Gaming & Highlights' },
    { id: 'tutorial', label: '💡 Tutorial & Edukasi' },
    { id: 'vlog', label: '🗣️ Podcast & Vlog' },
  ];

  const buildPrompt = () => {
    let instructions = '';
    if (format === 'music') {
      instructions = `### TUGAS KONSULTAN KONTEN YOUTUBE (MUSIK & AMBIENT):
1. Buatkan 5 variasi ide Judul Video yang memancing rasa rileks, estetis, dan SEO-friendly.
2. Rancang konsep visual background (misal: nuansa cafe hujan, lofi room, pemandangan malam) agar audiens betah mendengarkan berjam-jam.
3. Berikan saran susunan alur tracklist (pembagian mood atau tempo) agar tidak monoton.
4. Buatkan draf deskripsi YouTube lengkap dengan Call to Action untuk subscribe.
5. Buatkan 1 "Prompt AI Image" (dalam bahasa Inggris untuk Midjourney / DALL-E 3) yang sangat mendetail untuk visual Thumbnail / Background.`;
    } else if (format === 'shorts') {
      instructions = `### TUGAS KONSULTAN VIRAL YOUTUBE SHORTS:
1. Buatkan 5 variasi Judul Shorts yang ultra-clickbait dan memancing rasa penasaran tinggi.
2. Rancang "3-Second Hook": Kalimat pembuka dan visual aksi yang langsung menghentikan scrolling penonton.
3. Tuliskan naskah padat berdurasi 30-50 detik dengan pacing cepat dan retensi tinggi.
4. Berikan trik loop ending (sambungan akhir video yang mengulang mulus ke detik pertama).
5. Tuliskan rekomendasi 10 hashtag Shorts viral yang relevan.`;
    } else {
      instructions = `### TUGAS KONSULTAN KONTEN YOUTUBE PROFESIONAL:
1. Buatkan 5 variasi ide Judul Video yang memancing CTR tinggi (clickbait beretika, emosional, atau memancing rasa penasaran audiens).
2. Tuliskan naskah (script outline) berdurasi 8-10 menit dengan alur penceritaan (storytelling) yang dinamis.
3. Rancang "Hook" (30 detik pertama) yang membuat audiens wajib menonton sampai akhir.
4. Berikan saran 3 visual B-Roll atau cutaway penting untuk menaikkan average view duration.
5. Buatkan 1 "Prompt AI Image" (dalam bahasa Inggris untuk Midjourney / DALL-E 3) untuk menghasilkan ide Thumbnail yang mencolok.`;
    }

    const title = video.snippet?.title || video.title || '';
    const desc = (video.snippet?.description || video.description || '').substring(0, 500);
    const tags = video.snippet?.tags || video.tags || [];
    const tagsText = tags.length > 0 ? tags.join(', ') : 'Tidak ada tag khusus';

    return `Saya ingin membuat video YouTube terinspirasi dari referensi video kompetitor berikut:

### REFERENSI VIDEO:
- Judul Asli: "${title}"
- Deskripsi: "${desc}..."
- SEO Tags: ${tagsText}

${instructions}

Tolong berikan hasil dalam format markdown yang rapi, aplikatif, dan langsung bisa dieksekusi.`;
  };

  const currentPrompt = buildPrompt();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateDirect = async () => {
    if (!geminiKey) {
      setError('Masukkan Google Gemini API Key di tombol pengaturan (ikon kunci di atas) untuk generate otomatis.');
      return;
    }
    setLoading(true);
    setError(null);
    setAiResult('');
    try {
      const result = await generateGeminiContent(geminiKey, currentPrompt);
      setAiResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-rose-500 text-white rounded-2xl shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                Bedah Strategi Konten & AI
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">
                Referensi: {video.snippet?.title || video.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="py-4 shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {formats.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFormat(f.id);
                setAiResult('');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                format === f.id
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {aiResult ? (
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Bot className="w-4 h-4" /> Hasil Eksekusi Gemini AI
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiResult);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs font-bold px-3 py-1 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Tersalin' : 'Salin Hasil'}
                </button>
              </div>
              <div className="text-xs text-slate-800 dark:text-slate-200 font-sans whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar">
                {aiResult}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Prompt Siap Pakai (Prompt Engineering)
                </span>
                <span className="text-[11px] text-slate-400">Bisa di-paste ke ChatGPT, Claude, atau Gemini</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto custom-scrollbar select-all">
                {currentPrompt}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-all flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Prompt Berhasil Disalin!' : 'Salin Prompt untuk ChatGPT/Claude'}
          </button>

          <button
            onClick={handleGenerateDirect}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sedang Menganalisis...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Generate Langsung via Gemini AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
