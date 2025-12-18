import axios from "axios";
import { ErrorToast } from "./components/global/Toaster";
import Cookies from "js-cookie";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

// ================= BASE URL =================
export const baseUrl = "https://api.my-topx.com";
// export const baseUrl = "http://192.168.10.174:8080";


// ================= DEVICE FINGERPRINT =================
// Load once (not on every request = faster)
let deviceFingerprint = null;

async function loadFingerprintOnce() {
  if (!deviceFingerprint) {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    deviceFingerprint = result.visitorId;
  }
  return deviceFingerprint;
}

// ================= AXIOS INSTANCE =================
const instance = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
});

// Bypass Ngrok warning HTML pages
instance.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

// ================= REQUEST INTERCEPTOR =================
instance.interceptors.request.use(
  async (request) => {
    const token = Cookies.get("access_token");

    // Internet check
    if (!navigator.onLine) {
      ErrorToast("No internet connection. Please check your network.");
      return Promise.reject(new Error("No internet connection"));
    }

    // Device fingerprint (cached)
    const fingerprint = await loadFingerprintOnce();

    request.headers = {
      ...request.headers,
      Accept: "application/json, text/plain, */*",
      devicemodel: fingerprint,
      deviceuniqueid: fingerprint,
      ...(token && { Authorization: `Bearer ${token}` }),
      "ngrok-skip-browser-warning": "true",
    };

    return request;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
instance.interceptors.response.use(
  (response) => {
    // Check if Ngrok returned HTML instead of JSON
    const ct = response.headers?.["content-type"] || "";
    if (!ct.includes("application/json")) {
      return Promise.reject(
        new Error("Unexpected response (HTML instead of JSON).")
      );
    }
    return response;
  },
  (error) => {
    // Timeout
    if (error.code === "ECONNABORTED") {
      ErrorToast("Slow internet connection. Please try again.");
    }

    // 401 auto-logout
    if (error.response?.status === 401) {
      Cookies.remove("access_token");
      ErrorToast("Session expired. Please log in again.");
    }

    return Promise.reject(error);
  }
);

export default instance;
