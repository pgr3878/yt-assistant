// Utilities & Helpers for YT Analyzer Pro

export const formatNumber = (num) => {
  const n = Number(num) || 0;
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString('id-ID');
};

export const parseDuration = (durationStr = '') => {
  if (!durationStr) return 0;
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);
  return hours * 3600 + minutes * 60 + seconds;
};

export const formatDuration = (totalSeconds = 0) => {
  const s = Math.floor(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${m}:${String(sec).padStart(2, '0')}`;
};

export const calculateVPH = (viewCount, publishedAt) => {
  const views = Number(viewCount) || 0;
  const pubDate = new Date(publishedAt).getTime();
  const diffHours = Math.max(1, (Date.now() - pubDate) / (1000 * 60 * 60));
  return Math.round(views / diffHours);
};

export const calculateEngagement = (likes, comments, views) => {
  const v = Number(views) || 0;
  if (v <= 0) return '0.0%';
  const l = Number(likes) || 0;
  const c = Number(comments) || 0;
  return (((l + c) / v) * 100).toFixed(2) + '%';
};

export const STOPWORDS = new Set([
  'di', 'ke', 'dari', 'yang', 'dan', 'untuk', 'ini', 'itu', 'dengan', 'vs', 'the',
  'a', 'an', 'in', 'on', 'at', 'is', 'to', 'for', 'with', 'ada', 'akan', 'aku',
  'anda', 'apa', 'atau', 'bisa', 'dalam', 'juga', 'karena', 'kita', 'lebih',
  'mereka', 'pada', 'saat', 'sama', 'saya', 'seperti', 'sudah', 'tidak', 'ya',
  'yg', 'nya', 'buat', 'cara', 'hal', 'jadi', 'lagi', 'terus', 'music', 'video',
  'official', 'remix', 'full', 'lagu', 'terbaru', 'part', 'eps', 'episode'
]);

export const extractKeywords = (titles = [], topN = 15) => {
  const counts = {};
  titles.forEach(title => {
    const clean = title.toLowerCase().replace(/[^\w\s]/gi, ' ').split(/\s+/);
    clean.forEach(word => {
      if (word.length >= 3 && !STOPWORDS.has(word) && isNaN(Number(word))) {
        counts[word] = (counts[word] || 0) + 1;
      }
    });
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([keyword, count]) => ({ keyword, count }));
};

export const downloadCSV = (rows, filename = 'YT_Analysis.csv') => {
  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
