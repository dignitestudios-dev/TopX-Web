import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "topx_boost_session_id";
const SEEN_IMPRESSIONS_KEY = "topx_seen_boost_impressions";
const PENDING_BOOST_PREFIX = "topx_pending_boost_";
const PENDING_BOOST_LATEST = "topx_pending_boost_latest";

/**
 * Get or create a stable device session ID for impression accounting
 */
export const getDeviceSessionId = () => {
  try {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : uuidv4();
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return "session-" + Math.random().toString(36).substring(2, 12);
  }
};

/**
 * Check if an impression has already been recorded locally for this session
 */
export const hasRecordedImpression = (boostId) => {
  try {
    const raw = sessionStorage.getItem(SEEN_IMPRESSIONS_KEY);
    const set = raw ? JSON.parse(raw) : [];
    return Array.isArray(set) && set.includes(boostId);
  } catch {
    return false;
  }
};

/**
 * Mark an impression as recorded locally
 */
export const markImpressionRecorded = (boostId) => {
  try {
    const raw = sessionStorage.getItem(SEEN_IMPRESSIONS_KEY);
    const set = raw ? JSON.parse(raw) : [];
    if (!set.includes(boostId)) {
      set.push(boostId);
      sessionStorage.setItem(SEEN_IMPRESSIONS_KEY, JSON.stringify(set));
    }
  } catch (err) {
    console.error("Failed to mark impression locally:", err);
  }
};

/**
 * Save pending boost campaign settings before redirecting to Stripe Checkout
 */
export const savePendingBoostCampaign = (checkoutSessionId, campaignData) => {
  try {
    const dataStr = JSON.stringify(campaignData);
    if (checkoutSessionId) {
      localStorage.setItem(`${PENDING_BOOST_PREFIX}${checkoutSessionId}`, dataStr);
    }
    localStorage.setItem(PENDING_BOOST_LATEST, dataStr);
  } catch (err) {
    console.error("Failed to save pending boost campaign:", err);
  }
};

/**
 * Retrieve saved pending boost campaign settings upon returning from Stripe
 */
export const getPendingBoostCampaign = (checkoutSessionId) => {
  try {
    if (checkoutSessionId) {
      const saved = localStorage.getItem(`${PENDING_BOOST_PREFIX}${checkoutSessionId}`);
      if (saved) return JSON.parse(saved);
    }
    const latest = localStorage.getItem(PENDING_BOOST_LATEST);
    if (latest) return JSON.parse(latest);
  } catch (err) {
    console.error("Failed to get pending boost campaign:", err);
  }
  return null;
};

/**
 * Clear saved pending boost campaign settings
 */
export const clearPendingBoostCampaign = (checkoutSessionId) => {
  try {
    if (checkoutSessionId) {
      localStorage.removeItem(`${PENDING_BOOST_PREFIX}${checkoutSessionId}`);
    }
    localStorage.removeItem(PENDING_BOOST_LATEST);
  } catch (err) {
    console.error("Failed to clear pending boost campaign:", err);
  }
};

/**
 * Known approximate coordinates for states and major cities (MongoDB GeoJSON: [lng, lat])
 */
const LOCATION_COORDINATES_MAP = {
  // States
  Florida: [-81.5158, 27.6648],
  California: [-119.4179, 36.7783],
  "New York": [-74.006, 40.7128],
  Texas: [-99.9018, 31.9686],
  Illinois: [-89.3985, 40.6331],
  Georgia: [-82.9001, 32.1656],
  Washington: [-120.7401, 47.7511],
  "North Carolina": [-79.0193, 35.7596],

  // Cities
  Miami: [-80.1918, 25.7617],
  Orlando: [-81.3792, 28.5383],
  Tampa: [-82.4572, 27.9506],
  Austin: [-97.7431, 30.2672],
  Houston: [-95.3698, 29.7604],
  Dallas: [-96.797, 32.7767],
  "Los Angeles": [-118.2437, 34.0522],
  "San Francisco": [-122.4194, 37.7749],
  Chicago: [-87.6298, 41.8781],
  Atlanta: [-84.388, 33.749],
  Seattle: [-122.3321, 47.6062],
};

/**
 * Returns [longitude, latitude] in GeoJSON Point order
 */
export const getAreaCoordinates = (cityName, stateName) => {
  if (cityName && LOCATION_COORDINATES_MAP[cityName]) {
    return LOCATION_COORDINATES_MAP[cityName];
  }
  if (stateName && LOCATION_COORDINATES_MAP[stateName]) {
    return LOCATION_COORDINATES_MAP[stateName];
  }
  // Default Austin, TX as in docs
  return [-97.7431, 30.2672];
};
