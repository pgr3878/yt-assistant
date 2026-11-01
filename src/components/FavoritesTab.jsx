import React from 'react';
import { Bookmark, Trash2, ArrowRight, BarChart3, Users, Video, Eye } from 'lucide-react';
import { formatNumber } from '../utils/helpers';

export default function FavoritesTab({ favorites = [], onSelectChannel, onRemoveFavorite, onGoToCompetitor }) {
  if (favorites.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Bookmark className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Belum Ada Channel yang Disimpan
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Buka menu <span className="font-semibold text-slate-700 dark:text-slate-300">Riset Kompetitor</span>, cari channel yang ingin Anda pantau berkala, lalu klik tombol <span className="font-semibold text-amber-500">"Simpan ke Watchlist"</span>.
          </p>
        </div>
        <button
          onClick={onGoToCompetitor}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-red-500/25 transition-all inline-flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" /> Mulai Riset Kompetitor
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-500 fill-amber-500" /> Watchlist Channel Favorit
          </h2>
          <p className="text-xs text-slate-500">
            Daftar kompetitor yang Anda pantau secara berkala. Klik bedah untuk menganalisis ulang 50 video terbarunya.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
          {favorites.length} Channel
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {favorites.map((ch) => (
          <div
            key={ch.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center gap-4">
              <img
                src={ch.snippet?.thumbnails?.medium?.url || ch.snippet?.thumbnails?.default?.url}
                alt={ch.snippet?.title}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
              />
              <div className="space-y-0.5 truncate">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate" title={ch.snippet?.title}>
                  {ch.snippet?.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono truncate">
                  {ch.snippet?.customUrl || `@${ch.id}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Subs</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {ch.statistics?.hiddenSubscriberCount ? 'Privat' : formatNumber(ch.statistics?.subscriberCount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Total Views</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatNumber(ch.statistics?.viewCount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Video</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {formatNumber(ch.statistics?.videoCount)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => onRemoveFavorite(ch.id)}
                className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                title="Hapus dari Watchlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSelectChannel(ch.id)}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                Bedah Ulang <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
