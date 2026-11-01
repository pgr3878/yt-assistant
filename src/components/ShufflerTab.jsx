import React, { useState } from 'react';
import { Music, Upload, Shuffle, Download, Copy, Check, FileAudio, Trash2, Loader2, Sparkles } from 'lucide-react';
import JSZip from 'jszip';

export default function ShufflerTab() {
  const [files, setFiles] = useState([]);
  const [songLimit, setSongLimit] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chaptersText, setChaptersText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setChaptersText('');
    setProgress(0);
  };

  // Get precise duration using HTML5 Audio element
  const getAudioDuration = (file) => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        resolve(audio.duration || 180); // Fallback 3 mins
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audio.src);
        resolve(180);
      };
    });
  };

  const handleShuffleAndGenerate = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(0);
    setChaptersText('');

    try {
      // 1. Random shuffle
      let shuffled = [...files].sort(() => Math.random() - 0.5);
      const limit = parseInt(songLimit, 10);
      if (!isNaN(limit) && limit > 0 && limit < shuffled.length) {
        shuffled = shuffled.slice(0, limit);
      }

      const zip = new JSZip();
      let accumulatedSec = 0;
      let chapters = '🎧 Chapters / Tracklist:\n\n';

      const padLen = String(shuffled.length).length < 2 ? 2 : String(shuffled.length).length;

      // 2. Iterate each track and build timestamps
      for (let i = 0; i < shuffled.length; i++) {
        const file = shuffled[i];
        const trackNum = String(i + 1).padStart(padLen, '0');
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        const renamed = `${trackNum} - ${cleanName}.${file.name.split('.').pop()}`;

        // Add file to zip
        zip.file(renamed, file);

        // Format current timestamp
        const totalSec = Math.floor(accumulatedSec);
        const hours = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        const timeStr = hours > 0
          ? `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
          : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        chapters += `${timeStr}   🎵 Track ${i + 1}: ${cleanName}\n`;

        // Read audio duration
        const dur = await getAudioDuration(file);
        accumulatedSec += dur;

        // Update progress for file reading (0% - 50%)
        setProgress(Math.round(((i + 1) / shuffled.length) * 50));
      }

      // Add final repeat timestamp
      const totalSec = Math.floor(accumulatedSec);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;
      const finalTimeStr = hours > 0
        ? `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      chapters += `${finalTimeStr}   ~  (Selesai / Loop)\n`;

      setChaptersText(chapters);
      zip.file('00 - Daftar_Lagu.txt', chapters);

      // 3. Generate ZIP (50% - 100%)
      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setProgress(50 + Math.round(metadata.percent / 2));
      });

      // 4. Trigger download
      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Hasil_Acak_Musik_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

    } catch (err) {
      alert('Gagal memproses audio: ' + err.message);
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };

  const copyChapters = () => {
    navigator.clipboard.writeText(chaptersText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Pengacak Musik & Pembuat Timestamp Chapters
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Otomasi untuk video kompilasi YouTube (Lofi, BGM, Ambient). Masukkan lagu, sistem akan mengacak urutan, membaca durasi audio, dan membuat file ZIP + format timestamp siap paste ke deskripsi YouTube.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-8 text-center transition-colors group relative cursor-pointer">
          <input
            type="file"
            multiple
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Pilih atau Tarik File Lagu ke Sini (MP3, WAV, dll)
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Bisa memilih puluhan file sekaligus. Semua diproses langsung di browser Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Options */}
        {files.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                Ambil Berapa Lagu:
              </label>
              <input
                type="number"
                min="1"
                max={files.length}
                value={songLimit}
                onChange={(e) => setSongLimit(e.target.value)}
                placeholder={`Maks ${files.length} lagu`}
                className="w-36 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={clearAll}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors"
              >
                Hapus Semua ({files.length})
              </button>
              <button
                onClick={handleShuffleAndGenerate}
                disabled={processing}
                className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Memproses... {progress}%
                  </>
                ) : (
                  <>
                    <Shuffle className="w-4 h-4" /> Acak & Unduh ZIP
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {processing && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] font-bold text-slate-500">
              <span>Membaca durasi & mengemas file...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div 
                style={{ width: `${progress}%` }} 
                className="h-full bg-indigo-500 transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Daftar Lagu Terpilih ({files.length} file)
            </span>
            <div className="max-h-48 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl">
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs">
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <FileAudio className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{f.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chapters Result Display */}
      {chaptersText && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Hasil Timestamp Chapters (00 - Daftar_Lagu.txt)
              </h3>
            </div>
            <button
              onClick={copyChapters}
              className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin!' : 'Salin Semua Timestamp'}
            </button>
          </div>

          <pre className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar select-all">
            {chaptersText}
          </pre>
        </div>
      )}
    </div>
  );
}
