import React, { useState } from 'react';
import { Key, Sparkles, X, Check, ExternalLink, ShieldCheck } from 'lucide-react';

export default function KeyModal({ isOpen, onClose, ytKeys, setYtKeys, geminiKey, setGeminiKey }) {
  const [localYtKeys, setLocalYtKeys] = useState(ytKeys || '');
  const [localGeminiKey, setLocalGeminiKey] = useState(geminiKey || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setYtKeys(localYtKeys.trim());
    setGeminiKey(localGeminiKey.trim());
    localStorage.setItem('yt_api_keys', localYtKeys.trim());
    localStorage.setItem('gemini_api_key', localGeminiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Pengaturan API Key</h3>
              <p className="text-xs text-slate-500">Tersimpan aman di browser lokal Anda (BYOK)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-5">
          {/* YouTube API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                YouTube Data API v3 Key <span className="text-red-500">*</span>
              </label>
              <a
                href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
              >
                Dapatkan Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <textarea
              rows={3}
              value={localYtKeys}
              onChange={(e) => setLocalYtKeys(e.target.value)}
              placeholder="Masukkan API Key YouTube Anda... (Bisa masukkan lebih dari 1 key dipisah baris baru untuk auto-rotation kuota)"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              Tip: Masukkan 2 atau 3 key jika kuota sering habis. Sistem otomatis rotasi saat limit 10k kuota tercapai.
            </p>
          </div>

          {/* Gemini API Key */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Google Gemini API Key <span className="text-xs font-normal text-slate-400">(Opsional)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
              >
                Gratis di AI Studio <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={localGeminiKey}
              onChange={(e) => setLocalGeminiKey(e.target.value)}
              placeholder="AIzaSy... (Opsional untuk generate konten langsung di web)"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Jika diisi, Anda bisa membedah konten dan menulis script secara langsung tanpa keluar dari web.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/25 transition-all flex items-center gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" /> Tersimpan!
              </>
            ) : (
              'Simpan Pengaturan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
