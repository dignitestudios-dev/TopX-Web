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

/**
 * Converts a remote emoji image URL to a real binary File object for FormData uploads.
 */
export async function emojiUrlToFile(emojiUrl, filename = "emoji_profile.png") {
  if (!emojiUrl) return null;

  // Extract clean filename from URL if available
  let cleanFilename = filename;
  let pathname = "";
  try {
    const urlObj = new URL(emojiUrl);
    pathname = urlObj.pathname;
    const extractedName = pathname.split("/").pop();
    if (extractedName && extractedName.includes(".")) {
      cleanFilename = extractedName;
    }
  } catch {
    // Keep fallback filename
  }

  // Candidate URLs to try fetching from
  const candidateUrls = [];

  // In Vite dev mode, use local proxy to bypass S3 CORS completely
  if (import.meta.env.DEV && emojiUrl.includes("topx-uploads.s3.us-east-1.amazonaws.com")) {
    candidateUrls.push(`/s3-proxy${pathname}`);
  }

  // Direct URL
  candidateUrls.push(emojiUrl);

  // CORS proxies for production or fallback
  candidateUrls.push(`https://corsproxy.io/?url=${encodeURIComponent(emojiUrl)}`);
  candidateUrls.push(`https://api.allorigins.win/raw?url=${encodeURIComponent(emojiUrl)}`);

  // Try fetching binary from candidate URLs
  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        method: "GET",
      });
      if (response.ok) {
        const blob = await response.blob();
        if (blob && blob.size > 0) {
          const mimeType = blob.type || "image/png";
          return new File([blob], cleanFilename, { type: mimeType });
        }
      }
    } catch {
      // Continue to next candidate
    }
  }

  // Fallback: XMLHttpRequest with responseType = blob
  try {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", emojiUrl, true);
      xhr.responseType = "blob";
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 0) {
          resolve(xhr.response);
        } else {
          reject(new Error(`XHR failed status: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error("XHR network error"));
      xhr.send();
    });

    if (blob && blob.size > 0) {
      const mimeType = blob.type || "image/png";
      return new File([blob], cleanFilename, { type: mimeType });
    }
  } catch {
    // Continue to canvas fallback
  }

  // Fallback: HTML Image + Canvas drawing
  try {
    return await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || 128;
          canvas.height = img.naturalHeight || 128;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob && blob.size > 0) {
              resolve(new File([blob], cleanFilename, { type: "image/png" }));
            } else {
              resolve(null);
            }
          }, "image/png");
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = emojiUrl;
    });
  } catch {
    return null;
  }
}

/**
 * Deduplicates interest categories and sub-interests so each interest only appears once.
 */
export function deduplicateInterestsList(rawList) {
  if (!Array.isArray(rawList)) return [];

  // Pass 1: Identify all unique category names (normalized)
  const categoryNamesSet = new Set();
  const uniqueCategories = [];

  rawList.forEach((item, index) => {
    if (!item) return;
    const catName = typeof item === "string" ? item.trim() : (item.name || item.title || "").trim();
    if (!catName) return;

    const lowerName = catName.toLowerCase();
    let existingCategory = uniqueCategories.find(
      (c) => (typeof c === "string" ? c.trim().toLowerCase() : (c.name || c.title || "").trim().toLowerCase()) === lowerName
    );

    const rawSubs = Array.isArray(item.subCategories)
      ? item.subCategories
      : Array.isArray(item.subTopics)
      ? item.subTopics
      : Array.isArray(item.subInterests)
      ? item.subInterests
      : Array.isArray(item.children)
      ? item.children
      : [];

    if (!existingCategory) {
      categoryNamesSet.add(lowerName);
      existingCategory = {
        ...(typeof item === "object" ? item : { name: catName }),
        name: catName,
        _id: item._id || item.id || `cat-${index}`,
        subCategories: [],
      };
      uniqueCategories.push(existingCategory);
    }

    // Accumulate raw subs to existingCategory for later deduplication
    if (!existingCategory._rawSubs) {
      existingCategory._rawSubs = [];
    }
    existingCategory._rawSubs.push(...rawSubs);
  });

  // Pass 2: Deduplicate sub-interests across all categories
  // `seenNames` already includes all top-level category names so no sub-interest duplicates a top-level category
  const seenNames = new Set(categoryNamesSet);

  const result = uniqueCategories.map((cat) => {
    const rawSubs = cat._rawSubs || [];
    const dedupedSubs = [];

    rawSubs.forEach((sub) => {
      if (!sub) return;
      const subName = typeof sub === "string" ? sub.trim() : (sub.name || sub.title || "").trim();
      if (!subName) return;

      const lowerSub = subName.toLowerCase();
      if (!seenNames.has(lowerSub)) {
        seenNames.add(lowerSub);
        dedupedSubs.push(typeof sub === "object" ? { ...sub, name: subName } : subName);
      }
    });

    const { _rawSubs, ...cleanCat } = cat;
    return {
      ...cleanCat,
      subCategories: dedupedSubs,
      subTopics: dedupedSubs,
      subInterests: dedupedSubs,
      children: dedupedSubs,
    };
  });

  return result;
}

