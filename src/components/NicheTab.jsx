import React, { useState } from 'react';
import { Compass, Search, Loader2, Sparkles, SlidersHorizontal, ExternalLink, BarChart3, ArrowRight, User } from 'lucide-react';
import { formatNumber } from '../utils/helpers';

export default function NicheTab({ service, onAnalyzeAi, onRequireKey, onInspectChannel }) {
  const [query, setQuery] = useState('');
  const [timeframe, setTimeframe] = useState('month');
  const [regionCode, setRegionCode] = useState('ID');
  const [minRatio, setMinRatio] = useState(2);
  const [minViews, setMinViews] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSearch = async (targetQuery) => {
    const q = (targetQuery || query).trim();
    if (!q) {
      setError('Masukkan topik atau kata kunci niche yang ingin diriset.');
      return;
    }
    if (!service.getKey()) {
      onRequireKey();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await service.searchNicheVideos({
        query: q,
        regionCode,
        timeframe,
        minRatio,
        minViews
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Search & Configuration Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Pencari Niche (Blue Ocean Finder)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Temukan topik di mana channel dengan subscriber kecil mendapatkan ledakan ratusan ribu views. Menandakan audiens haus konten ini dan persaingan masih minim!
          </p>
        </div>

        {/* Search Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Contoh: review laptop murah, lofi cafe malam, cerita misteri desa..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3.5 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Menyelami Samudra Biru...
              </>
            ) : (
              'Cari Peluang Niche'
            )}
          </button>
        </form>

        {/* Filter Sliders & Dropdowns */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Rentang Waktu</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="today">Hari Ini</option>
              <option value="week">1 Minggu Terakhir</option>
              <option value="month">1 Bulan Terakhir</option>
              <option value="3months">3 Bulan Terakhir</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Target Negara</label>
            <select
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ID">🇮🇩 Indonesia</option>
              <option value="US">🇺🇸 Global / US</option>
              <option value="MY">🇲🇾 Malaysia</option>
              <option value="JP">🇯🇵 Jepang</option>
              <option value="GB">🇬🇧 Inggris</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Min. Rasio Views:Subs ({minRatio}x)
            </label>
            <input
              type="range"
              min="1.5"
              max="10"
              step="0.5"
              value={minRatio}
              onChange={(e) => setMinRatio(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Min. Views ({formatNumber(minViews)})
            </label>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={minViews}
              onChange={(e) => setMinViews(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Opportunity Score Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Analisis Potensi Pasar
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Status Niche: {result.opportunityScore >= 70 ? '🔥 Sangat Blue Ocean!' : result.opportunityScore >= 40 ? '⚡ Potensial Bagus' : '⚖️ Pasar Normal / Ketat'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xl">
                {result.opportunityScore >= 70 
                  ? 'Banyak channel kecil yang mendapatkan views meledak di topik ini. Persaingan rendah dengan minat penonton tinggi!'
                  : 'Ditemukan beberapa video outlier. Buat sudut pandang (angle) baru atau thumbnail yang lebih kontras untuk menang.'}
              </p>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-800/60 rounded-2xl min-w-[130px]">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">Opportunity Score</span>
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{result.opportunityScore}%</span>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl min-w-[130px]">
                <span className="text-[11px] font-bold text-slate-500 block">Outlier Ditemukan</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">{result.outliers.length}</span>
              </div>
            </div>
          </div>

          {/* Sub-Niches Suggestions */}
          {result.subNiches.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> 🎯 Rekomendasi Pecahan Sub-Niche (Klik untuk Riset):
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {result.subNiches.map(sn => (
                  <button
                    key={sn}
                    onClick={() => { setQuery(sn); handleSearch(sn); }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-all border border-indigo-200/60 dark:border-indigo-800/60"
                  >
                    + {sn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Outliers Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                Video Outlier (Channel Kecil dengan Ledakan Views)
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                {result.outliers.length} video ditemukan
              </span>
            </div>

            {result.outliers.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-slate-400 text-sm">
                Tidak ada video outlier dengan rasio &ge; {minRatio}x dan &ge; {formatNumber(minViews)} views pada topik ini. Coba turunkan slider batas rasio atau cari kata kunci lain.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {result.outliers.map((v) => (
                  <div
                    key={v.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    {/* Thumbnail & Outlier Ratio Badge */}
                    <div className="relative aspect-video overflow-hidden">
                      <a
                        href={`https://youtube.com/watch?v=${v.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full h-full"
                      >
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </a>
                      <span className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-md flex items-center gap-1">
                        🔥 {v.ratio.toFixed(1)}x dari Subs!
                      </span>
                      <a
                        href={`https://youtube.com/watch?v=${v.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs transition-colors"
                        title="Tonton di YouTube"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <a
                          href={`https://youtube.com/watch?v=${v.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title={v.title}
                        >
                          {v.title}
                        </a>

                        {/* Channel link with avatar/icon */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <a
                            href={`https://youtube.com/channel/${v.channelId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline font-semibold text-slate-700 dark:text-slate-300 line-clamp-1"
                            title="Buka Channel di YouTube"
                          >
                            {v.channelTitle}
                          </a>
                          <span className="shrink-0">
                            ({v.subs ? `${formatNumber(v.subs)} subs` : 'Privat'})
                          </span>
                        </div>
                      </div>

                      {/* Views & Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {formatNumber(v.views)} views
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(v.publishedAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Bedah SEO / Bedah Kompetitor Button */}
                          <button
                            onClick={() => onInspectChannel && onInspectChannel(v.channelId)}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                            title="Bedah 50 video & SEO tags channel ini di tab Riset Kompetitor"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" /> Bedah SEO →
                          </button>

                          {/* Bedah AI Button */}
                          <button
                            onClick={() => onAnalyzeAi(v)}
                            className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm shrink-0"
                            title="Buat naskah, hook, dan prompt thumbnail AI dari video ini"
                          >
                            <Sparkles className="w-3 h-3" /> Bedah AI
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
