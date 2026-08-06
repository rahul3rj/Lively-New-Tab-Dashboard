/**
 * Spotify URL parsing helper functions.
 */

/** Extract Spotify embed path (type/id) from various Spotify URL formats. */
export const extractSpotifyEmbedUrl = (url) => {
  if (!url) return null;
  try {
    const match = url.match(/open\.spotify\.com\/(playlist|track|album|artist|episode|show)\/([a-zA-Z0-9]+)/);
    if (match) {
      const type = match[1];
      const id = match[2];
      return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
    }
  } catch {
    /* ignore */
  }
  return null;
};

/** Check if a URL is a valid Spotify link. */
export const isSpotifyUrl = (url) => {
  if (!url) return false;
  return /open\.spotify\.com\/(playlist|track|album|artist|episode|show)\//.test(url);
};
