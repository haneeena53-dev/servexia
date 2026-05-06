"use client";

import { useState, useEffect, useCallback } from "react";

interface Location {
  lat: number;
  lng: number;
}

export function useMap() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Could not get your location. Please check your permissions.");
        setLoading(false);
        // Default to a fallback location (e.g., Cairo, Egypt)
        setUserLocation({ lat: 30.0444, lng: 31.2357 });
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { userLocation, loading, error, requestLocation };
}
