import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Loader2, 
  Download, 
  Bookmark, 
  Radio, 
  Flame, 
  Clock, 
  Calendar, 
  Video, 
  Tag, 
  TrendingUp, 
  Sparkles, 
  ExternalLink,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { 
  formatNumber, 
  formatDuration, 
  parseDuration, 
  calculateVPH, 
  calculateEngagement, 
  extractKeywords, 
  downloadCSV 
} from '../utils/helpers';

export default function CompetitorTab({
  service,
  onAnalyzeAi,
  favorites = [],
  onToggleFavorite,
  onRequireKey,
  initialTarget
}) {
  const [inputVal, setInputVal] = useState(
    initialTarget ? (typeof initialTarget === 'object' ? initialTarget.id : initialTarget) : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Trigger search when initialTarget changes (e.g. from NicheTab or TrendTab "Bedah SEO")
  useEffect(() => {
    if (initialTarget) {
      const targetId = typeof initialTarget === 'object' ? initialTarget.id : initialTarget;
      if (targetId) {
        setInputVal(targetId);
        handleSearch(targetId);
      }
    }
  }, [initialTarget]);

  // Results State
  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [filterFormat, setFilterFormat] = useState('all'); // all | shorts | regular
  const [searchFilter, setSearchFilter] = useState('');

  const handleSearch = async (target) => {
    const q = (target || inputVal).trim();
    if (!q) {
      setError('Masukkan link video, channel URL, atau @handle kompetitor.');
      return;
    }
    if (!service.getKey()) {
      onRequireKey();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const channelId = await service.resolveChannelId(q);
      const [channel, live] = await Promise.all([
        service.getChannelInfo(channelId),
        service.checkLiveStatus(channelId)
      ]);

      const uploadsId = channel.contentDetails?.relatedPlaylists?.uploads;
      let uploadVideos = [];
      if (uploadsId) {
        uploadVideos = await service.getChannelUploads(uploadsId, 50);
      }

      setChannelData(channel);
      setLiveStreams(live);
      setVideos(uploadVideos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  let totalViews50 = 0;
  let totalShorts = 0;
  let totalRegular = 0;
  let regularDurationSum = 0;
  const tagCounts = {};
  const hourCounts = Array(24).fill(0);
  const dayCounts = Array(7).fill(0); // 0 = Sun
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  videos.forEach(v => {
    const durSec = parseDuration(v.contentDetails?.duration);
    const views = Number(v.statistics?.viewCount || 0);
    totalViews50 += views;

    if (durSec <= 61 && v.snippet?.liveBroadcastContent !== 'live') {
      totalShorts++;
    } else {
      totalRegular++;
      regularDurationSum += durSec;
    }

    // Tags
    if (v.snippet?.tags) {
      v.snippet.tags.forEach(t => {
        const lower = t.toLowerCase();
        tagCounts[lower] = (tagCounts[lower] || 0) + 1;
      });
    }

    // Publish time histogram
    const pub = new Date(v.snippet.publishedAt);
    hourCounts[pub.getHours()]++;
    dayCounts[pub.getDay()]++;
  });

  const avgViews = videos.length > 0 ? Math.round(totalViews50 / videos.length) : 0;
  const avgRegularDuration = totalRegular > 0 ? Math.round(regularDurationSum / totalRegular) : 0;

  // Upload frequency heuristic
  let uploadFreq = 'Tidak Diketahui';
  if (videos.length > 1) {
    const dates = [...new Set(videos.map(v => new Date(v.snippet.publishedAt).toDateString()))].map(d => new Date(d).getTime()).sort((a, b) => b - a);
    if (dates.length > 1) {
      const avgDays = (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24) / (dates.length - 1);
      if (avgDays <= 1.5) uploadFreq = 'Setiap Hari';
      else if (avgDays <= 3.5) uploadFreq = '2-3 Hari Sekali';
      else if (avgDays <= 7.5) uploadFreq = '1x Seminggu';
      else if (avgDays <= 15.5) uploadFreq = '2 Minggu Sekali';
      else uploadFreq = '1x Sebulan / Jarang';
    }
  }

  // Top keywords & tags
  const topKeywords = extractKeywords(videos.map(v => v.snippet.title), 12);
  const topTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a).slice(0, 15);
  const topBreakouts = [...videos].sort((a, b) => Number(b.statistics?.viewCount || 0) - Number(a.statistics?.viewCount || 0)).slice(0, 4);

  // Filtered videos table
  const filteredVideos = videos.filter(v => {
    const isShort = parseDuration(v.contentDetails?.duration) <= 61;
    if (filterFormat === 'shorts' && !isShort) return false;
    if (filterFormat === 'regular' && isShort) return false;
    if (searchFilter) {
      const matchTitle = v.snippet.title.toLowerCase().includes(searchFilter.toLowerCase());
      return matchTitle;
    }
    return true;
  });

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!videos.length) return;
    const rows = [
      ['No', 'Judul Video', 'URL Video', 'Format', 'Views', 'VPH (Views/Jam)', 'Likes', 'Komentar', 'Engagement Rate', 'Durasi', 'Tanggal Publish', 'Tags']
    ];

    videos.forEach((v, idx) => {
      const durSec = parseDuration(v.contentDetails?.duration);
      const isShort = durSec <= 61;
      const fmt = v.snippet?.liveBroadcastContent === 'live' ? 'Live Stream' : (isShort ? 'Shorts' : 'Reguler');
      const views = Number(v.statistics?.viewCount || 0);
      const likes = Number(v.statistics?.likeCount || 0);
      const comments = Number(v.statistics?.commentCount || 0);
      const vph = calculateVPH(views, v.snippet.publishedAt);
      const eng = calculateEngagement(likes, comments, views);
      const tags = (v.snippet?.tags || []).join('; ');

      rows.push([
        idx + 1,
        `"${(v.snippet.title || '').replace(/"/g, '""')}"`,
        `https://youtube.com/watch?v=${v.id}`,
        fmt,
        views,
        vph,
        likes,
        comments,
        eng,
        formatDuration(durSec),
        new Date(v.snippet.publishedAt).toLocaleDateString('id-ID'),
        `"${tags.replace(/"/g, '""')}"`
      ]);
    });

    const channelName = channelData?.snippet?.title || 'Channel';
    downloadCSV(rows, `${channelName.replace(/[^a-zA-Z0-9]/g, '_')}_50_Videos.csv`);
  };

  const isFavorited = channelData && favorites.some(f => f.id === channelData.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Search Input Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Bongkar Rahasia Kompetitor YouTube
            </h2>
            <p className="text-sm text-slate-500">
              Analisis 50 video terbaru, jam posting terbaik, SEO tags tersembunyi, dan skor Views Per Hour (VPH).
            </p>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Masukkan link channel, @handle, link video, atau nama channel..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menganalisis...
                </>
              ) : (
                'Mulai Analisis'
              )}
            </button>
          </form>

          {/* Quick Click Samples */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-500">
            <span>Contoh:</span>
            {['@MrBeast', '@cleverprogrammer', '@TEDx', '@DeddyCorbuzier', '@FikiNaki'].map(sample => (
              <button
                key={sample}
                type="button"
                onClick={() => { setInputVal(sample); handleSearch(sample); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-medium"
              >
                {sample}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-2xl text-xs sm:text-sm text-red-600 dark:text-red-400 text-center">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Main Results View */}
      {channelData && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Channel Header Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <img
                  src={channelData.snippet?.thumbnails?.medium?.url || channelData.snippet?.thumbnails?.default?.url}
                  alt={channelData.snippet?.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-slate-100 dark:ring-slate-800 shadow-md"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {channelData.snippet?.title}
                    </h3>
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                    {channelData.snippet?.country && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400">
                        {channelData.snippet.country}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    {channelData.snippet?.customUrl || `@${channelData.id}`}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 max-w-xl pt-1">
                    {channelData.snippet?.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => onToggleFavorite(channelData)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
                    isFavorited
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'Tersimpan' : 'Simpan ke Watchlist'}
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Ekspor CSV
                </button>
              </div>
            </div>

            {/* Live Stream Alert */}
            {liveStreams.length > 0 && (
              <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <div>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                      Sedang Live Streaming Sekarang!
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {liveStreams[0].snippet?.title}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://youtube.com/watch?v=${liveStreams[0].id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white flex items-center gap-1 shrink-0"
                >
                  Tonton Live <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500">Total Subscribers</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {channelData.statistics?.hiddenSubscriberCount ? 'Disembunyikan' : formatNumber(channelData.statistics?.subscriberCount)}
              </p>
              <span className="text-[11px] text-slate-400">Total Video: {formatNumber(channelData.statistics?.videoCount)}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500">Rata-rata Views (50 Video)</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {formatNumber(avgViews)}
              </p>
              <span className="text-[11px] text-slate-400">Total Views: {formatNumber(channelData.statistics?.viewCount)}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500">Frekuensi Upload</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {uploadFreq}
              </p>
              <span className="text-[11px] text-slate-400">Durasi Rata-rata: {formatDuration(avgRegularDuration)}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500">Proporsi Konten</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {totalShorts} <span className="text-xs font-normal text-slate-400">Shorts</span> / {totalRegular} <span className="text-xs font-normal text-slate-400">Reguler</span>
              </p>
              <span className="text-[11px] text-slate-400">Berdasarkan 50 video terbaru</span>
            </div>
          </div>

          {/* Upload Schedules / Histograms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 24-Hour Hour Histogram */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500" /> Jam Upload Favorit (00:00 - 23:00)
                </h4>
                <span className="text-xs text-slate-400">Waktu Lokal</span>
              </div>
              <div className="flex items-end gap-1 h-32 pt-4">
                {hourCounts.map((count, h) => {
                  const maxCount = Math.max(...hourCounts, 1);
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <div key={h} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div 
                        style={{ height: `${pct}%` }} 
                        className={`w-full rounded-t-sm transition-all ${
                          count > 0 ? 'bg-red-500 group-hover:bg-red-600' : 'bg-slate-100 dark:bg-slate-800'
                        }`}
                      />
                      <span className="text-[9px] text-slate-400">{h % 4 === 0 ? h : ''}</span>
                      {count > 0 && (
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                          {h}:00 ({count}x)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7-Day Day Histogram */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" /> Hari Upload Favorit
                </h4>
                <span className="text-xs text-slate-400">Distribusi Mingguan</span>
              </div>
              <div className="flex items-end gap-3 h-32 pt-4">
                {dayCounts.map((count, d) => {
                  const maxCount = Math.max(...dayCounts, 1);
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <div key={d} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <div 
                        style={{ height: `${pct}%` }} 
                        className={`w-full rounded-t-lg transition-all ${
                          count > 0 ? 'bg-indigo-500 group-hover:bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'
                        }`}
                      />
                      <span className="text-xs font-bold text-slate-500">{dayNames[d]}</span>
                      {count > 0 && (
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                          {count} video
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Keywords & Tags Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title Keywords */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Kata Kunci Judul Terpopuler
              </h4>
              <p className="text-xs text-slate-400">Kata yang paling sering digunakan pada judul video kompetitor ini</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {topKeywords.map(({ keyword, count }) => (
                  <span
                    key={keyword}
                    className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    <span>{keyword}</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-700 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {count}x
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Hidden SEO Tags */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-500" /> Meta Tags Tersembunyi
              </h4>
              <p className="text-xs text-slate-400">Tags YouTube yang dimasukkan kreator untuk ranking pencarian</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {topTags.length > 0 ? (
                  topTags.map(([tag, count]) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-800/60 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5"
                    >
                      #{tag}
                      <span className="text-[10px] opacity-75">({count})</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Channel ini tidak menggunakan meta tags pada videonya.</span>
                )}
              </div>
            </div>
          </div>

          {/* Top 4 Breakout Videos */}
          <div className="space-y-4">
            <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" /> 4 Video Paling Meledak
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topBreakouts.map((v) => {
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
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[11px] font-mono font-bold">
                        {isShort ? 'Shorts' : formatDuration(durSec)}
                      </span>
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold shadow">
                        VPH: {formatNumber(vph)}/jam
                      </span>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2" title={v.snippet.title}>
                        {v.snippet.title}
                      </h5>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatNumber(views)} views
                        </span>
                        <button
                          onClick={() => onAnalyzeAi(v)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-100 text-[11px] flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Bedah AI
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full 50 Videos Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-lg text-slate-900 dark:text-white">
                  Daftar 50 Video Terbaru
                </h4>
                <p className="text-xs text-slate-500">Urutan terbit terbaru dari upload playlist</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Filter judul..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
                />
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {['all', 'shorts', 'regular'].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setFilterFormat(fmt)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        filterFormat === fmt
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {fmt === 'all' ? 'Semua' : fmt === 'shorts' ? 'Shorts' : 'Reguler'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-3 px-3">Video</th>
                    <th className="py-3 px-3">Format</th>
                    <th className="py-3 px-3">Views</th>
                    <th className="py-3 px-3">VPH</th>
                    <th className="py-3 px-3">Eng. Rate</th>
                    <th className="py-3 px-3">Publish</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredVideos.map((v) => {
                    const durSec = parseDuration(v.contentDetails?.duration);
                    const isShort = durSec <= 61;
                    const views = Number(v.statistics?.viewCount || 0);
                    const likes = Number(v.statistics?.likeCount || 0);
                    const comments = Number(v.statistics?.commentCount || 0);
                    const vph = calculateVPH(views, v.snippet.publishedAt);
                    const eng = calculateEngagement(likes, comments, views);

                    return (
                      <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-3 max-w-sm">
                          <div className="flex items-center gap-3">
                            <img
                              src={v.snippet.thumbnails?.default?.url}
                              alt=""
                              className="w-16 h-10 object-cover rounded-lg shrink-0"
                            />
                            <div className="space-y-0.5">
                              <a
                                href={`https://youtube.com/watch?v=${v.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-slate-800 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 line-clamp-1"
                                title={v.snippet.title}
                              >
                                {v.snippet.title}
                              </a>
                              <span className="text-[11px] text-slate-400 font-mono">
                                Durasi: {formatDuration(durSec)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isShort 
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400' 
                              : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                          }`}>
                            {isShort ? 'Shorts' : 'Reguler'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                          {formatNumber(views)}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-red-600 dark:text-red-400">
                            {formatNumber(vph)}
                          </span>
                          <span className="text-slate-400 text-[10px]">/jam</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-600 dark:text-slate-300">
                          {eng}
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {new Date(v.snippet.publishedAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onAnalyzeAi(v)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm ml-auto"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Bedah AI
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
