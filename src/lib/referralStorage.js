/**
 * referralStorage.js
 * 
 * Manages the lifecycle of a pending referral code for new user registration.
 * Ensures referral attribution survives:
 * - navigation from landing page to sign-up
 * - authentication screens
 * - email OTP request and retry
 * - page reload / cold start
 * - switching between registration screens
 * 
 * Cleared only upon:
 * - successful email verification
 * - successful creation of a new social account
 * - explicit reset of registration flow
 */

const REFERRAL_STORAGE_KEY = "topx_pending_referral";
const REFERRAL_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Validates whether the given value is a valid non-empty referral code string.
 * @param {any} code 
 * @returns {boolean}
 */
export function isValidReferralCode(code) {
  return typeof code === "string" && code.trim().length > 0;
}

/**
 * Stores the pending referral code with timestamp.
 * @param {string} code 
 * @returns {boolean} True if successfully stored
 */
export function setPendingReferralCode(code) {
  if (!isValidReferralCode(code)) {
    return false;
  }

  const cleanCode = code.trim();
  const payload = {
    code: cleanCode,
    storedAt: Date.now(),
  };

  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("Failed to store pending referral code:", error);
    return false;
  }
}

/**
 * Retrieves the pending referral code if present and not expired.
 * @returns {string|null} The raw referral code, or null if none/expired.
 */
export function getPendingReferralCode() {
  try {
    const raw = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!raw) return null;

    // Support both plain string and JSON payload
    let code = null;
    let storedAt = null;

    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null && parsed.code) {
        code = parsed.code;
        storedAt = parsed.storedAt;
      } else if (typeof parsed === "string") {
        code = parsed;
      }
    } catch {
      code = raw;
    }

    if (!isValidReferralCode(code)) {
      clearPendingReferralCode();
      return null;
    }

    // Check expiration if storedAt is recorded
    if (storedAt && Date.now() - storedAt > REFERRAL_EXPIRY_MS) {
      clearPendingReferralCode();
      return null;
    }

    return code.trim();
  } catch (error) {
    console.error("Failed to retrieve pending referral code:", error);
    return null;
  }
}

/**
 * Clears the pending referral code from storage.
 */
export function clearPendingReferralCode() {
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear pending referral code:", error);
  }
}

/**
 * Checks if a pending referral code exists.
 * @returns {boolean}
 */
export function hasPendingReferralCode() {
  return Boolean(getPendingReferralCode());
}
