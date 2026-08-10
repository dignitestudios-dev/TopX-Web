// All the helper functions should must be there.
// The functions that you're using multiple times must be there.
// e.g. formatDateToMMDDYYYY, formatEpochToMMDDYYYY, etc.
export function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} year${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} day${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour${interval > 1 ? "s" : ""} ago`;

  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} min${interval > 1 ? "s" : ""} ago`;

  return "Just now";
}

/**
 * Extracts URL and YouTube thumbnail from a text string.
 */
export function getLinkPreview(text) {
  if (!text || typeof text !== "string") return null;

  // Match HTTP/HTTPS URL
  const urlRegex = /(https?:\/\/[^\s]+)/i;
  const match = text.match(urlRegex);
  if (!match) return null;

  const url = match[0];
  let domain = "";
  try {
    const parsed = new URL(url);
    domain = parsed.hostname.replace(/^www\./, "");
  } catch (e) {
    domain = "link";
  }

  // Check for YouTube (Shorts, Watch, Embed, YouTu.be)
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:shorts\/|watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      url,
      domain: "youtube.com",
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isYoutube: true,
      videoId,
    };
  }

  return {
    url,
    domain,
    thumbnail: null,
    isYoutube: false,
  };
}
