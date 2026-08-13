import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateViewerLocation } from "../redux/slices/boost.slice";

const LOCATION_SYNCED_KEY = "topx_viewer_location_synced";

export default function useViewerLocation() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!user || attemptedRef.current) return;
    if (typeof window === "undefined" || !navigator.geolocation) return;

    attemptedRef.current = true;

    // Check if synced recently (within last 30 minutes) to minimize redundant requests
    const lastSync = sessionStorage.getItem(LOCATION_SYNCED_KEY);
    if (lastSync && Date.now() - Number(lastSync) < 30 * 60 * 1000) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (typeof latitude === "number" && typeof longitude === "number") {
          dispatch(updateViewerLocation({ latitude, longitude }));
          sessionStorage.setItem(LOCATION_SYNCED_KEY, Date.now().toString());
        }
      },
      (error) => {
        // Geolocation denied or unavailable - silent fallback
        console.debug("Viewer location sync skipped:", error.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [user, dispatch]);
}
