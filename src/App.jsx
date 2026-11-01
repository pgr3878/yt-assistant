import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KeyModal from './components/KeyModal';
import AiModal from './components/AiModal';
import CompetitorTab from './components/CompetitorTab';
import TrendTab from './components/TrendTab';
import NicheTab from './components/NicheTab';
import ShufflerTab from './components/ShufflerTab';
import FavoritesTab from './components/FavoritesTab';
import { youtubeService } from './services/youtube';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('yt_dark_mode');
    return saved !== null ? saved === 'true' : true; // Default dark
  });

  // Keys state
  const [ytKeys, setYtKeys] = useState(() => localStorage.getItem('yt_api_keys') || '');
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Active Tab state
  const [activeTab, setActiveTab] = useState('competitor');

  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('yt_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // AI Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedAiVideo, setSelectedAiVideo] = useState(null);

  // Competitor ref/query trigger when switching from favorites or niche/trend
  const [prefilledTarget, setPrefilledTarget] = useState(null);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('yt_dark_mode', darkMode);
  }, [darkMode]);

  // Sync keys to youtube service
  useEffect(() => {
    youtubeService.setKeys(ytKeys);
  }, [ytKeys]);

  // Sync favorites
  const handleToggleFavorite = (channel) => {
    if (!channel || !channel.id) return;
    setFavorites(prev => {
      const exists = prev.some(f => f.id === channel.id);
      let updated;
      if (exists) {
        updated = prev.filter(f => f.id !== channel.id);
      } else {
        updated = [channel, ...prev];
      }
      localStorage.setItem('yt_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveFavorite = (channelId) => {
    setFavorites(prev => {
      const updated = prev.filter(f => f.id !== channelId);
      localStorage.setItem('yt_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Inspect channel from NicheTab, TrendTab, or FavoritesTab
  const handleInspectChannel = (channelId) => {
    setActiveTab('competitor');
    setPrefilledTarget({ id: channelId, timestamp: Date.now() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAi = (video) => {
    setSelectedAiVideo(video);
    setIsAiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-red-500 selection:text-white transition-colors duration-200">
      {/* Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenKeys={() => setIsKeyModalOpen(true)}
        hasYtKey={Boolean(ytKeys.trim())}
        favoriteCount={favorites.length}
      />

      {/* Main Container: Persistent Mounting (Display Toggle) so states never reset */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div style={{ display: activeTab === 'competitor' ? 'block' : 'none' }}>
          <CompetitorTab
            service={youtubeService}
            onAnalyzeAi={handleOpenAi}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onRequireKey={() => setIsKeyModalOpen(true)}
            initialTarget={prefilledTarget}
          />
        </div>

        <div style={{ display: activeTab === 'trend' ? 'block' : 'none' }}>
          <TrendTab
            service={youtubeService}
            onAnalyzeAi={handleOpenAi}
            onRequireKey={() => setIsKeyModalOpen(true)}
            onInspectChannel={handleInspectChannel}
          />
        </div>

        <div style={{ display: activeTab === 'niche' ? 'block' : 'none' }}>
          <NicheTab
            service={youtubeService}
            onAnalyzeAi={handleOpenAi}
            onRequireKey={() => setIsKeyModalOpen(true)}
            onInspectChannel={handleInspectChannel}
          />
        </div>

        <div style={{ display: activeTab === 'shuffler' ? 'block' : 'none' }}>
          <ShufflerTab />
        </div>

        <div style={{ display: activeTab === 'favorites' ? 'block' : 'none' }}>
          <FavoritesTab
            favorites={favorites}
            onSelectChannel={handleInspectChannel}
            onRemoveFavorite={handleRemoveFavorite}
            onGoToCompetitor={() => setActiveTab('competitor')}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-500">
        <p>YT Analyzer Pro v2.0 • Market Intelligence & Automation for YouTube Creators</p>
      </footer>

      {/* Modals */}
      <KeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        ytKeys={ytKeys}
        setYtKeys={setYtKeys}
        geminiKey={geminiKey}
        setGeminiKey={setGeminiKey}
      />

      <AiModal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          setSelectedAiVideo(null);
        }}
        video={selectedAiVideo}
        geminiKey={geminiKey}
      />
    </div>
  );
}
