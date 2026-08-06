/**
 * YouTube URL helpers: URL → video/playlist ID extraction.
 */

/** Extract YouTube video ID from various URL formats. */
export const extractVideoId = (url) => {
  if (!url) return null;
  try {
    const patterns = [
      /[?&]v=([^&#]+)/,
      /youtu\.be\/([^?&#]+)/,
      /youtube\.com\/embed\/([^?&#]+)/,
      /youtube\.com\/v\/([^?&#]+)/,
      /youtube\.com\/shorts\/([^?&#]+)/,
      /youtube\.com\/live\/([^?&#]+)/,
      /music\.youtube\.com\/watch\?v=([^&#]+)/,
    ];
    for (const pattern of patterns) {
      const match = pattern.exec(url);
      if (match) return match[1];
    }
  } catch {
    /* ignore */
  }
  return null;
};

/** Extract YouTube playlist ID from various URL formats. */
export const extractPlaylistId = (url) => {
  if (!url) return null;
  try {
    const patterns = [
      /[?&]list=([^&#]+)/,
      /youtube\.com\/playlist\/([^?&#]+)/,
      /music\.youtube\.com\/playlist\/([^?&#]+)/,
    ];
    for (const pattern of patterns) {
      const match = pattern.exec(url);
      if (match) return match[1];
    }
  } catch {
    /* ignore */
  }
  return null;
};

/** Returns the canonical watch/playlist URL for a video ID or playlist ID. */
export const toWatchUrl = (url, videoId, playlistId) => {
  if (url && (extractVideoId(url) || extractPlaylistId(url))) return url;
  if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
  if (playlistId) return `https://www.youtube.com/playlist?list=${playlistId}`;
  return url || "https://www.youtube.com";
};
