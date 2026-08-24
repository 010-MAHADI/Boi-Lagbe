'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { DEFAULT_LOCATION } from '@/lib/constants';

interface LocationState {
  lat: number;
  lng: number;
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'manual';
  division?: string;
  district?: string;
}

interface LocationContextType extends LocationState {
  requestLocation: () => void;
  setManualLocation: (lat: number, lng: number, division?: string, district?: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const DISTRICT_CENTROIDS = [
  { division: 'dhaka', district: 'ঢাকা', lat: 23.8103, lng: 90.4125 },
  { division: 'dhaka', district: 'গাজীপুর', lat: 24.0023, lng: 90.4264 },
  { division: 'dhaka', district: 'নারায়ণগঞ্জ', lat: 23.6238, lng: 90.5000 },
  { division: 'chattogram', district: 'চট্টগ্রাম', lat: 22.3569, lng: 91.7832 },
  { division: 'chattogram', district: 'কক্সবাজার', lat: 21.4272, lng: 92.0058 },
  { division: 'chattogram', district: 'কুমিল্লা', lat: 23.4607, lng: 91.1809 },
  { division: 'rajshahi', district: 'রাজশাহী', lat: 24.3745, lng: 88.6042 },
  { division: 'rajshahi', district: 'বগুড়া', lat: 24.8465, lng: 89.3730 },
  { division: 'khulna', district: 'খুলনা', lat: 22.8456, lng: 89.5403 },
  { division: 'khulna', district: 'যশোর', lat: 23.1634, lng: 89.2132 },
  { division: 'sylhet', district: 'সিলেট', lat: 24.8949, lng: 91.8687 },
  { division: 'barishal', district: 'বরিশাল', lat: 22.7010, lng: 90.3535 },
  { division: 'mymensingh', district: 'ময়মনসিংহ', lat: 24.7471, lng: 90.4203 },
  { division: 'rangpur', district: 'রংপুর', lat: 25.7439, lng: 89.2752 },
];

function findNearestDistrict(lat: number, lng: number): { division: string; district: string } {
  let closest = DISTRICT_CENTROIDS[0];
  let minDistance = Number.POSITIVE_INFINITY;

  for (const c of DISTRICT_CENTROIDS) {
    const dist = Math.hypot(c.lat - lat, c.lng - lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = c;
    }
  }

  return { division: closest.division, district: closest.district };
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocationState>({
    lat: DEFAULT_LOCATION.lat,
    lng: DEFAULT_LOCATION.lng,
    status: 'idle',
    division: DEFAULT_LOCATION.division,
    district: DEFAULT_LOCATION.district,
  });

  // Try to load saved location
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('boi-lagbe-location');
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const persistLocation = useCallback((loc: LocationState) => {
    localStorage.setItem('boi-lagbe-location', JSON.stringify(loc));
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, status: 'denied' }));
      return;
    }

    setState((prev) => ({ ...prev, status: 'requesting' }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const matched = findNearestDistrict(lat, lng);

        const newState: LocationState = {
          lat,
          lng,
          status: 'granted',
          division: matched.division,
          district: matched.district,
        };
        setState(newState);
        persistLocation(newState);
      },
      () => {
        setState((prev) => ({ ...prev, status: 'denied' }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  }, [persistLocation]);

  const setManualLocation = useCallback(
    (lat: number, lng: number, division?: string, district?: string) => {
      const newState: LocationState = { lat, lng, status: 'manual', division, district };
      setState(newState);
      persistLocation(newState);
    },
    [persistLocation]
  );

  return (
    <LocationContext.Provider value={{ ...state, requestLocation, setManualLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

export { LocationContext };
