import axios from "axios";
import { ErrorToast } from "./components/global/Toaster";
import Cookies from "js-cookie";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

// ================= BASE URL =================
export const baseUrl = "https://api.my-topx.com";
// export const baseUrl = "https://0jxxmx1m-8080.inc1.devtunnels.ms";
// export const baseUrl = "http://192.168.10.174:8080";


// ================= DEVICE FINGERPRINT =================
// Load once (not on every request = faster)
let deviceFingerprint = null;
let fingerprintPromise = null;

async function loadFingerprintOnce() {
  if (!deviceFingerprint) {
    if (!fingerprintPromise) {
      fingerprintPromise = (async () => {
        try {
          const fp = await FingerprintJS.load();
          const result = await fp.get();
          deviceFingerprint = result.visitorId;
          return deviceFingerprint;
        } catch (error) {
          console.error("Fingerprint error:", error);
          fingerprintPromise = null; // Reset on error
          return null;
        }
      })();
    }
    return await fingerprintPromise;
  }
  return deviceFingerprint;
}

// ================= AXIOS INSTANCE =================
const instance = axios.create({
  baseURL: baseUrl,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Bypass Ngrok warning HTML pages
instance.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

// ================= REQUEST INTERCEPTOR =================
instance.interceptors.request.use(
  async (request) => {
    const token = Cookies.get("access_token");

    // Internet check - more reliable
    if (!navigator.onLine) {
      ErrorToast("No internet connection. Please check your network.");
      return Promise.reject(new Error("No internet connection"));
    }

    // Device fingerprint (cached)
    try {
      const fingerprint = await loadFingerprintOnce();
      
      request.headers = {
        ...request.headers,
        Accept: "application/json, text/plain, */*",
        devicemodel: fingerprint,
        deviceuniqueid: fingerprint,
        ...(token && { Authorization: `Bearer ${token}` }),
        "ngrok-skip-browser-warning": "true",
      };
    } catch (error) {
      console.error("Fingerprint loading error:", error);
      // Continue without fingerprint if it fails
      request.headers = {
        ...request.headers,
        Accept: "application/json, text/plain, */*",
        ...(token && { Authorization: `Bearer ${token}` }),
        "ngrok-skip-browser-warning": "true",
      };
    }

    return request;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ================= RETRY CONFIG =================
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Retry function for network errors
async function retryRequest(config, retryCount = 0) {
  if (retryCount >= MAX_RETRIES) {
    return Promise.reject(new Error("Max retries exceeded"));
  }

  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
  
  return instance.request(config);
}

// ================= RESPONSE INTERCEPTOR =================
instance.interceptors.response.use(
  (response) => {
    // Check if Ngrok returned HTML instead of JSON
    const ct = response.headers?.["content-type"] || "";
    if (ct && !ct.includes("application/json") && !ct.includes("multipart/form-data")) {
      // Allow multipart/form-data for file uploads
      if (!ct.includes("text/html")) {
        return response; // Allow non-JSON responses that aren't HTML
      }
      return Promise.reject(
        new Error("Unexpected response (HTML instead of JSON).")
      );
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // Retry logic for network errors (only for GET requests to avoid duplicate POSTs)
    if (
      !error.response &&
      config &&
      !config._retry &&
      config.method === "get"
    ) {
      config._retry = true;
      const retryCount = config._retryCount || 0;
      
      if (retryCount < MAX_RETRIES) {
        config._retryCount = retryCount + 1;
        console.log(`Retrying request (${retryCount + 1}/${MAX_RETRIES}):`, config.url);
        return retryRequest(config, retryCount);
      }
    }

    // Network errors
    if (!error.response) {
      if (error.code === "ECONNABORTED" || error.message === "Network Error") {
        ErrorToast("Network error. Please check your connection and try again.");
      } else if (error.code === "ERR_NETWORK") {
        ErrorToast("Network error. Please check your internet connection.");
      } else if (error.code === "ECONNREFUSED") {
        ErrorToast("Connection refused. Please try again.");
      } else {
        ErrorToast("Network error. Please reload the page.");
      }
      return Promise.reject(error);
    }

    // Timeout
    if (error.code === "ECONNABORTED") {
      ErrorToast("Request timeout. Please try again.");
    }

    // 401 auto-logout
    if (error.response?.status === 401) {
      Cookies.remove("access_token");
      ErrorToast("Session expired. Please log in again.");
      // Optionally redirect to login
      if (window.location.pathname !== "/login") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    }

    // 500+ server errors
    if (error.response?.status >= 500) {
      ErrorToast("Server error. Please try again later.");
    }

    // 404 errors
    if (error.response?.status === 404) {
      console.error("API endpoint not found:", error.config?.url);
    }

    return Promise.reject(error);
  }
);

export default instance;
