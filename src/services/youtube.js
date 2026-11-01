// YouTube Data API v3 Client Service with Auto-failover Multi-Key support

export const extractTarget = (input) => {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;

  // 1. Check Video URL or 11-char ID
  const videoMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|live\/|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (videoMatch && videoMatch[1].length === 11) {
    return { type: 'video', id: videoMatch[1] };
  }
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('?')) {
    return { type: 'video', id: trimmed };
  }

  // 2. Check Channel URL with /channel/UC...
  if (trimmed.includes('/channel/')) {
    const channelId = trimmed.split('/channel/')[1].split(/[?#&]/)[0];
    return { type: 'channelId', id: channelId };
  }

  // 3. Check @handle URL or direct @handle
  if (trimmed.includes('/@')) {
    const handle = '@' + trimmed.split('/@')[1].split(/[?#&]/)[0];
    return { type: 'handle', handle };
  }
  if (trimmed.startsWith('@')) {
    return { type: 'handle', handle: trimmed };
  }

  // 4. Check direct Channel ID UC...
  if (trimmed.startsWith('UC') && trimmed.length >= 24) {
    return { type: 'channelId', id: trimmed };
  }

  // 5. Default search query
  return { type: 'query', query: trimmed };
};

export class YouTubeService {
  constructor(apiKeys = []) {
    this.apiKeys = Array.isArray(apiKeys) ? apiKeys.filter(Boolean) : [apiKeys].filter(Boolean);
    this.currentKeyIndex = 0;
  }

  setKeys(keys) {
    if (typeof keys === 'string') {
      this.apiKeys = keys.split(/[\n,;]/).map(k => k.trim()).filter(Boolean);
    } else if (Array.isArray(keys)) {
      this.apiKeys = keys.map(k => (typeof k === 'string' ? k.trim() : '')).filter(Boolean);
    }
    this.currentKeyIndex = 0;
  }

  getKey() {
    if (!this.apiKeys.length) return null;
    return this.apiKeys[this.currentKeyIndex % this.apiKeys.length];
  }

  rotateKey() {
    if (this.apiKeys.length <= 1) return false;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return true;
  }

  async fetchApi(endpoint, params = {}) {
    if (!this.apiKeys.length) {
      throw new Error('Silakan masukkan YouTube API Key di menu pengaturan (ikon kunci).');
    }

    let attempts = 0;
    const maxAttempts = Math.max(1, this.apiKeys.length);

    while (attempts < maxAttempts) {
      const activeKey = this.getKey();
      const queryParams = new URLSearchParams({ ...params, key: activeKey });
      const url = `https://www.googleapis.com/youtube/v3/${endpoint}?${queryParams.toString()}`;

      try {
        const response = await fetch(url);
        if (response.ok) {
          return await response.json();
        }

        const errData = await response.json().catch(() => ({}));
        const message = errData.error?.message || response.statusText;
        const reason = errData.error?.errors?.[0]?.reason || '';

        // Check for Quota Exceeded error
        if (response.status === 403 && (reason === 'quotaExceeded' || message.includes('quota'))) {
          console.warn(`Key #${this.currentKeyIndex + 1} quota habis. Mencoba key cadangan...`);
          if (this.rotateKey()) {
            attempts++;
            continue; // Retry with next key
          } else {
            throw new Error('Kuota YouTube API harian Anda telah habis (10.000 unit). Silakan ganti API Key atau tunggu reset besok.');
          }
        }

        throw new Error(`YouTube API Error: ${message}`);
      } catch (err) {
        if (err.message.includes('YouTube API Error') || err.message.includes('Kuota')) {
          throw err;
        }
        attempts++;
        if (!this.rotateKey()) {
          throw new Error(`Koneksi ke YouTube API gagal: ${err.message}`);
        }
      }
    }
    throw new Error('Semua YouTube API Key yang Anda masukkan mengalami kegagalan atau kehabisan kuota.');
  }

  async resolveChannelId(input) {
    const target = extractTarget(input);
    if (!target) throw new Error('Harap masukkan link channel, @handle, atau link video yang valid.');

    if (target.type === 'channelId') {
      return target.id;
    }

    if (target.type === 'video') {
      const videoData = await this.fetchApi('videos', {
        id: target.id,
        part: 'snippet,statistics,liveStreamingDetails'
      });
      if (!videoData.items || videoData.items.length === 0) {
        throw new Error('Video tidak ditemukan.');
      }
      return videoData.items[0].snippet.channelId;
    }

    if (target.type === 'handle' || target.type === 'query') {
      const q = target.handle || target.query;
      const searchData = await this.fetchApi('search', {
        q,
        type: 'channel',
        part: 'snippet',
        maxResults: 1
      });
      if (!searchData.items || searchData.items.length === 0) {
        throw new Error(`Channel "${q}" tidak ditemukan.`);
      }
      return searchData.items[0].id.channelId;
    }

    throw new Error('Format input tidak didukung.');
  }

  async getChannelInfo(channelId) {
    const data = await this.fetchApi('channels', {
      id: channelId,
      part: 'snippet,statistics,brandingSettings,contentDetails'
    });
    if (!data.items || data.items.length === 0) {
      throw new Error('Channel tidak ditemukan atau tidak tersedia publik.');
    }
    return data.items[0];
  }

  async getChannelUploads(uploadsPlaylistId, maxResults = 50) {
    const playlistData = await this.fetchApi('playlistItems', {
      playlistId: uploadsPlaylistId,
      part: 'snippet,contentDetails',
      maxResults
    });

    if (!playlistData.items || playlistData.items.length === 0) {
      return [];
    }

    const videoIds = playlistData.items.map(item => item.contentDetails.videoId).filter(Boolean);
    if (videoIds.length === 0) return [];

    const videosData = await this.fetchApi('videos', {
      id: videoIds.join(','),
      part: 'snippet,statistics,contentDetails,liveStreamingDetails'
    });

    return videosData.items || [];
  }

  async checkLiveStatus(channelId) {
    try {
      const searchLive = await this.fetchApi('search', {
        channelId,
        type: 'video',
        eventType: 'live',
        part: 'snippet',
        maxResults: 2
      });
      if (searchLive.items && searchLive.items.length > 0) {
        const liveIds = searchLive.items.map(i => i.id.videoId).join(',');
        const liveDetails = await this.fetchApi('videos', {
          id: liveIds,
          part: 'snippet,statistics,liveStreamingDetails'
        });
        return liveDetails.items || [];
      }
    } catch (e) {
      console.warn('Live status check skipped:', e.message);
    }
    return [];
  }

  async getTrendingVideos(regionCode = 'ID', categoryId = '0') {
    const params = {
      chart: 'mostPopular',
      regionCode,
      part: 'snippet,statistics,contentDetails,liveStreamingDetails',
      maxResults: 24
    };
    if (categoryId && categoryId !== '0') {
      params.videoCategoryId = categoryId;
    }
    const data = await this.fetchApi('videos', params);
    return data.items || [];
  }

  async searchNicheVideos({ query, regionCode = 'ID', timeframe = 'month', minRatio = 2, minViews = 5000 }) {
    const pubDate = new Date();
    if (timeframe === 'today') pubDate.setDate(pubDate.getDate() - 1);
    else if (timeframe === 'week') pubDate.setDate(pubDate.getDate() - 7);
    else if (timeframe === 'month') pubDate.setMonth(pubDate.getMonth() - 1);
    else if (timeframe === '3months') pubDate.setMonth(pubDate.getMonth() - 3);

    const searchRes = await this.fetchApi('search', {
      q: query,
      part: 'snippet',
      type: 'video',
      maxResults: 50,
      order: 'relevance',
      regionCode,
      publishedAfter: pubDate.toISOString()
    });

    if (!searchRes.items || searchRes.items.length === 0) {
      return { videos: [], outliers: [], opportunityScore: 0, subNiches: [] };
    }

    const videoIds = searchRes.items.map(i => i.id.videoId).filter(Boolean);
    const channelIds = [...new Set(searchRes.items.map(i => i.snippet.channelId))];

    // Fetch video details and channel details in parallel
    const [videosData, channelsData] = await Promise.all([
      this.fetchApi('videos', {
        id: videoIds.join(','),
        part: 'snippet,statistics,contentDetails'
      }),
      this.fetchApi('channels', {
        id: channelIds.join(','),
        part: 'snippet,statistics'
      })
    ]);

    const channelMap = {};
    (channelsData.items || []).forEach(ch => {
      channelMap[ch.id] = ch;
    });

    const videos = videosData.items || [];
    const outliers = [];
    let totalViews = 0;
    let ratioSum = 0;

    videos.forEach(v => {
      const views = Number(v.statistics?.viewCount || 0);
      const ch = channelMap[v.snippet.channelId];
      const subs = ch?.statistics?.hiddenSubscriberCount ? 0 : Number(ch?.statistics?.subscriberCount || 0);
      const ratio = views / Math.max(subs, 100);

      totalViews += views;
      ratioSum += Math.min(ratio, 50);

      if (ratio >= minRatio && views >= minViews) {
        outliers.push({
          id: v.id,
          title: v.snippet.title,
          channelTitle: v.snippet.channelTitle,
          channelId: v.snippet.channelId,
          views,
          subs,
          ratio,
          thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url,
          publishedAt: v.snippet.publishedAt,
          snippet: v.snippet,
          statistics: v.statistics,
          contentDetails: v.contentDetails
        });
      }
    });

    outliers.sort((a, b) => b.ratio - a.ratio);

    const avgRatio = ratioSum / (videos.length || 1);
    const opportunityScore = videos.length === 0 ? 0 : Math.min(100, Math.round((avgRatio / 5) * 100));

    // Extract sub-niches from outlier titles
    const titles = outliers.length > 0 ? outliers.map(o => o.title) : videos.map(v => v.snippet.title);
    const words = {};
    const queryTokens = new Set(query.toLowerCase().split(/\s+/));

    titles.forEach(t => {
      t.toLowerCase().replace(/[^\w\s]/gi, ' ').split(/\s+/).forEach(w => {
        if (w.length >= 3 && !queryTokens.has(w) && isNaN(Number(w))) {
          words[w] = (words[w] || 0) + 1;
        }
      });
    });

    const subNiches = Object.entries(words)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([w]) => `${query} ${w}`);

    return {
      videos,
      outliers,
      avgViews: Math.round(totalViews / (videos.length || 1)),
      opportunityScore,
      subNiches
    };
  }
}

export const youtubeService = new YouTubeService();

