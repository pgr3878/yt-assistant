import React, { useState, useEffect } from 'react';
import { Flame, Globe, Filter, Loader2, Sparkles, ExternalLink, TrendingUp } from 'lucide-react';
import { formatNumber, calculateVPH, parseDuration, formatDuration } from '../utils/helpers';

export default function TrendTab({ service, onAnalyzeAi, onRequireKey }) {
  const [regionCode, setRegionCode] = useState('ID');
  const [categoryId, setCategoryId] = useState('0');
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  const countries = [
    { code: 'ID', name: '🇮🇩 Indonesia' },
    { code: 'US', name: '🇺🇸 Amerika Serikat' },
    { code: 'GB', name: '🇬🇧 Inggris' },
    { code: 'JP', name: '🇯🇵 Jepang' },
    { code: 'KR', name: '🇰🇷 Korea Selatan' },
    { code: 'MY', name: '🇲🇾 Malaysia' },
    { code: 'IN', name: '🇮🇳 India' },
    { code: 'BR', name: '🇧🇷 Brasil' },
  ];

  const categories = [
    { id: '0', name: 'Semua Kategori' },
    { id: '10', name: '🎵 Musik' },
    { id: '20', name: '🎮 Gaming' },
    { id: '24', name: '🍿 Hiburan' },
    { id: '28', name: '💡 Sains & Teknologi' },
    { id: '27', name: '📚 Pendidikan' },
    { id: '25', name: '📰 Berita & Politik' },
    { id: '17', name: '⚽ Olahraga' },
  ];

  const loadTrends = async () => {
    if (!service.getKey()) {
      onRequireKey();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await service.getTrendingVideos(regionCode, categoryId);
      setVideos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (service.getKey()) {
      loadTrends();
    }
  }, [regionCode, categoryId]);

  // Momentum Score calculation
  let vphSum = 0;
  videos.forEach(v => {
    vphSum += calculateVPH(v.statistics?.viewCount, v.snippet.publishedAt);
  });
  const avgVph = videos.length > 0 ? Math.round(vphSum / videos.length) : 0;
  const momentumScore = Math.min(100, Math.round((avgVph / 1000) * 10));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Flame className="w-6 h-6 text-red-500 fill-red-500" /> Eksplorasi Tren YouTube
            </h2>
            <p className="text-xs text-slate-500">
              Pantau konten yang sedang mendominasi algoritma dan trending saat ini di berbagai negara.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Region Selector */}
            <div className="relative">
              <select
                value={regionCode}
                onChange={(e) => setRegionCode(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Category Selector */}
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={loadTrends}
              disabled={loading}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-red-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Muat Ulang'}
            </button>
          </div>
        </div>

        {/* Momentum & Stats Banner */}
        {videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  Skor Momentum Tren
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {momentumScore} / 100
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500" />
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Rata-rata Penonton Baru
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatNumber(avgVph)} <span className="text-xs font-normal text-slate-500">/ jam</span>
                </p>
              </div>
              <Flame className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Grid of Trending Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <p className="text-sm font-semibold">Memindai video trending YouTube...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {videos.map((v, idx) => {
            const durSec = parseDuration(v.contentDetails?.duration);
            const isShort = durSec <= 61;
            const views = Number(v.statistics?.viewCount || 0);
            const vph = calculateVPH(views, v.snippet.publishedAt);

            return (
              <div
                key={v.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url}
                    alt={v.snippet.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-white text-[11px] font-bold">
                    #{idx + 1}
                  </span>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-mono font-bold">
                    {isShort ? 'Shorts' : formatDuration(durSec)}
                  </span>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold">
                    🔥 {formatNumber(vph)}/jam
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2" title={v.snippet.title}>
                      {v.snippet.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {v.snippet.channelTitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      {formatNumber(views)} views
                    </span>
                    <button
                      onClick={() => onAnalyzeAi(v)}
                      className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                    >
                      <Sparkles className="w-3 h-3" /> Bedah AI
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
