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
 * Validates whether a given string is a well-formed HTTP/HTTPS URL with a valid domain/TLD or IP.
 */
export function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return false;
  const trimmed = urlString.trim();
  if (!trimmed) return false;

  let urlToTest = trimmed;
  if (/^www\./i.test(urlToTest)) {
    urlToTest = `https://${urlToTest}`;
  }

  try {
    const parsed = new URL(urlToTest);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname;
    if (
      !hostname ||
      hostname.includes("..") ||
      hostname.startsWith(".") ||
      hostname.endsWith(".")
    ) {
      return false;
    }

    // Check if IPv4 address (e.g. 192.168.1.1)
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(hostname)) {
      const parts = hostname.split(".").map(Number);
      return parts.every((p) => p >= 0 && p <= 255);
    }

    // Valid domain name regex (must have at least one label followed by dot and valid 2-63 letter TLD)
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
    return domainRegex.test(hostname);
  } catch {
    return false;
  }
}

/**
 * Extracts URL and YouTube thumbnail from a text string only if it is a valid, well-formed URL.
 */
export function getLinkPreview(text) {
  if (!text || typeof text !== "string") return null;

  // Match potential HTTP/HTTPS or www URL tokens
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const matches = text.match(urlRegex);
  if (!matches) return null;

  for (const rawMatch of matches) {
    // Strip trailing punctuation often attached at end of sentences or quotes
    const cleanUrl = rawMatch.replace(/[.,;:!?)>"']+$/, "");
    if (!cleanUrl || !isValidUrl(cleanUrl)) continue;

    const fullUrl =
      cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")
        ? cleanUrl
        : `https://${cleanUrl}`;

    let domain = "";
    try {
      const parsed = new URL(fullUrl);
      domain = parsed.hostname.replace(/^www\./, "");
    } catch (e) {
      domain = "link";
    }

    // Check for YouTube (Shorts, Watch, Embed, YouTu.be)
    const ytMatch = fullUrl.match(
      /(?:youtube\.com\/(?:shorts\/|watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
    );

    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      return {
        url: cleanUrl,
        fullUrl,
        rawUrl: rawMatch,
        domain: "youtube.com",
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        isYoutube: true,
        videoId,
      };
    }

    return {
      url: cleanUrl,
      fullUrl,
      rawUrl: rawMatch,
      domain,
      thumbnail: null,
      isYoutube: false,
    };
  }

  return null;
}

/**
 * Checks if a string is a raw Unicode emoji (e.g. "😊", "🔥", "⚽") vs a URL/path.
 */
export function isEmoji(str) {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  if (!trimmed) return false;
  // If it starts with http, https, data:, blob:, or /, it's a URL or relative path
  if (/^(https?:\/\/|data:|blob:|\/|\.\/)/i.test(trimmed)) {
    return false;
  }
  // Check if string contains emoji characters or is a short string of unicode emojis
  const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji})/u;
  return emojiRegex.test(trimmed) && trimmed.length <= 10;
}

/**
 * Converts a remote emoji image URL or Unicode emoji to a real binary File object for FormData uploads.
 */
export async function emojiUrlToFile(emojiUrl, filename = "emoji_profile.png") {
  if (!emojiUrl) return null;

  // If it's already a File or Blob
  if (emojiUrl instanceof File) return emojiUrl;
  if (emojiUrl instanceof Blob) {
    return new File([emojiUrl], filename, { type: emojiUrl.type || "image/png" });
  }

  if (typeof emojiUrl !== "string") return null;
  const trimmed = emojiUrl.trim();

  // If it's a raw Unicode emoji (e.g. "😊" or "🚀")
  if (isEmoji(trimmed)) {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, 256, 256);
        ctx.font = "180px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(trimmed, 128, 140);
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        if (blob && blob.size > 0) {
          return new File([blob], filename, { type: "image/png" });
        }
      }
    } catch (err) {
      console.error("Canvas emoji render error:", err);
    }
  }

  // If it's a Data URL (base64)
  if (trimmed.startsWith("data:")) {
    try {
      const res = await fetch(trimmed);
      const blob = await res.blob();
      if (blob && blob.size > 0) {
        return new File([blob], filename, { type: blob.type || "image/png" });
      }
    } catch {}
  }

  // Extract clean filename from URL if available
  let cleanFilename = filename;
  let pathname = "";
  try {
    const urlObj = new URL(trimmed);
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
  if (import.meta.env.DEV && trimmed.includes("topx-uploads.s3.us-east-1.amazonaws.com")) {
    candidateUrls.push(`/s3-proxy${pathname}`);
  }

  // Direct URL
  candidateUrls.push(trimmed);

  // CORS proxies for production or fallback
  candidateUrls.push(`https://corsproxy.io/?url=${encodeURIComponent(trimmed)}`);
  candidateUrls.push(`https://api.allorigins.win/raw?url=${encodeURIComponent(trimmed)}`);

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
      xhr.open("GET", trimmed, true);
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
      img.src = trimmed;
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

/**
 * Determines the user's onboarding and profile completion status.
 * Returns { isCompleted: boolean, step: number }
 * Steps:
 * 0: Create Account (not logged in / initial)
 * 1: Verification (email & phone OTP verification)
 * 2: Personal Details (username, dob, gender, etc.)
 * 3: Interests (topic interests selection)
 * 4: Recommendations (optional follow step)
 * 5: Completed
 */
export function getOnboardingStatus(user) {
  if (!user) {
    return { isCompleted: false, step: 0 };
  }

  // 1. Mandatory Email & Phone Verification
  if (!user.isEmailVerified || !user.isPhoneVerified) {
    return { isCompleted: false, step: 1 };
  }

  // 2. Mandatory Personal Details (Username is required)
  if (!user.username || typeof user.username !== "string" || user.username.trim() === "") {
    return { isCompleted: false, step: 2 };
  }

  // 3. Mandatory Interests (At least 1 interest selected)
  if (!user.interests || !Array.isArray(user.interests) || user.interests.length === 0) {
    return { isCompleted: false, step: 3 };
  }

  return { isCompleted: true, step: 5 };
}

/**
 * Checks and requests Camera & Microphone permissions before going live.
 * Returns { success: boolean, error?: string, code?: string }
 */
export async function checkMediaPermissions() {
  if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      success: false,
      code: "UNSUPPORTED",
      error: "Camera and microphone access is not supported on this browser.",
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    // Release tracks immediately so Agora RTC can acquire them cleanly
    stream.getTracks().forEach((track) => track.stop());
    return { success: true };
  } catch (err) {
    const errorName = err?.name || "";
    let userFriendlyMessage = "Camera and microphone permissions are required to go live.";

    if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
      userFriendlyMessage =
        "Camera and microphone permissions were denied. Please allow camera and microphone access in your browser settings .";
    } else if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
      userFriendlyMessage =
        "No camera or microphone device was found on your computer. Please connect a camera and microphone to start streaming.";
    } else if (errorName === "NotReadableError" || errorName === "TrackStartError") {
      userFriendlyMessage =
        "Camera or microphone is currently in use by another application. Please close other apps and try again.";
    }

    return {
      success: false,
      code: errorName || "PERMISSION_DENIED",
      error: userFriendlyMessage,
    };
  }
}

/**
 * Detects if an input string contains dangerous XSS, HTML tags, script, or SQL injection patterns.
 */
export function hasMaliciousInput(str) {
  if (!str || typeof str !== "string") return false;

  // Check for HTML/XSS tags & script patterns
  const xssPattern =
    /<[^>]*>|javascript:|data:|vbscript:|onload=|onerror=|onclick=|onmouseover=|<script|<\/script|<img|<iframe|<svg|eval\(|alert\(/i;
  if (xssPattern.test(str)) return true;

  // Check for common SQL injection keywords and special syntax
  const sqlPattern =
    /(--|\/\*|\*\/|;|'|"|`|=|union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|update\s+.*\s+set|delete\s+from|or\s+1\s*=\s*1|or\s+'1'\s*=\s*'1')/i;
  if (sqlPattern.test(str)) return true;

  return false;
}

/**
 * Sanitizes username input: strips out dangerous characters, HTML tags, scripts, and non-allowed characters.
 * Only allows lowercase/uppercase alphanumeric characters, dot, and underscore.
 */
export function sanitizeUsername(input) {
  if (!input || typeof input !== "string") return "";
  // Strip all HTML tags
  let cleaned = input.replace(/<[^>]*>/g, "");
  // Keep only alphanumeric characters, underscores, and dots
  cleaned = cleaned.replace(/[^a-zA-Z0-9_.]/g, "");
  return cleaned;
}

/**
 * Validates a username string. Returns { isValid: boolean, error?: string }.
 */
export function validateUsername(username) {
  if (!username || typeof username !== "string" || username.trim() === "") {
    return { isValid: false, error: "Please enter your username." };
  }

  const trimmed = username.trim();

  // Check for malicious XSS/SQL patterns first
  if (hasMaliciousInput(username)) {
    return {
      isValid: false,
      error: "Malicious characters or script patterns are not allowed in username.",
    };
  }

  if (/\s/.test(username)) {
    return { isValid: false, error: "Username cannot contain spaces." };
  }

  if (trimmed.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters long." };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: "Username cannot exceed 50 characters." };
  }

  if (!/^[a-zA-Z0-9_.]+$/.test(trimmed)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, underscores, and dots.",
    };
  }

  if (/^[._]/.test(trimmed) || /[._]$/.test(trimmed)) {
    return {
      isValid: false,
      error: "Username cannot start or end with a dot or underscore.",
    };
  }

  if (/[_.]{2,}/.test(trimmed)) {
    return {
      isValid: false,
      error: "Username cannot contain consecutive dots or underscores.",
    };
  }

  return { isValid: true };
}
