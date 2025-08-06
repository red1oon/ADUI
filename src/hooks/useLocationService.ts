// useLocationService.ts v1.0 - Extracted Location Management Hook
// Handles GPS location initialization, updates, and state management

import { useState, useCallback, useEffect } from 'react';

// Services
import { LocationService, type LocationData } from '../services';

// ==================== INTERFACES ====================

interface LocationStatus {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  lastUpdate?: Date;
}

interface UseLocationServiceReturn {
  // Location state
  location: LocationData | null;
  locationStatus: LocationStatus;
  
  // Location actions
  initializeLocation: () => Promise<void>;
  refreshLocation: () => Promise<void>;
  resetLocation: () => void;
  
  // Utility functions
  getLocationString: () => string;
  hasValidLocation: () => boolean;
}

// ==================== LOCATION SERVICE HOOK ====================

export const useLocationService = (autoInitialize: boolean = true): UseLocationServiceReturn => {
  
  // ==================== STATE ====================

  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>({
    isLoading: false,
    hasError: false
  });

  console.log('📍 useLocationService: Hook initialized with autoInitialize:', autoInitialize);

  // ==================== LOCATION INITIALIZATION ====================

  const initializeLocation = useCallback(async () => {
    console.log('📍 useLocationService: Initializing location...');
    
    setLocationStatus(prev => ({ ...prev, isLoading: true, hasError: false }));
    
    try {
      // Set default location first for immediate availability
      const defaultLocation = LocationService.getDefaultLocation();
      setLocation(defaultLocation);
      console.log('📍 useLocationService: Default location set:', defaultLocation);
      
      // Attempt to get real GPS location
      const realLocation = await LocationService.getCurrentLocation();
      if (realLocation) {
        setLocation(realLocation);
        console.log('📍 useLocationService: Real location acquired:', realLocation);
        
        setLocationStatus({
          isLoading: false,
          hasError: false,
          lastUpdate: new Date()
        });
      } else {
        console.log('📍 useLocationService: Real location not available, using default');
        setLocationStatus({
          isLoading: false,
          hasError: false,
          lastUpdate: new Date(),
          errorMessage: 'GPS unavailable, using default location'
        });
      }
    } catch (error) {
      console.log('📍 useLocationService: Location initialization error:', error);
      
      // Ensure we have at least default location on error
      if (!location) {
        const fallbackLocation = LocationService.getDefaultLocation();
        setLocation(fallbackLocation);
      }
      
      setLocationStatus({
        isLoading: false,
        hasError: true,
        lastUpdate: new Date(),
        errorMessage: error?.message || 'Location service error'
      });
    }
  }, []);

  // ==================== LOCATION REFRESH ====================

  const refreshLocation = useCallback(async () => {
    console.log('📍 useLocationService: Refreshing location...');
    
    setLocationStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      const newLocation = await LocationService.getCurrentLocation();
      if (newLocation) {
        setLocation(newLocation);
        console.log('📍 useLocationService: Location refreshed:', newLocation);
        
        setLocationStatus({
          isLoading: false,
          hasError: false,
          lastUpdate: new Date()
        });
      } else {
        console.log('📍 useLocationService: Location refresh failed, keeping current');
        setLocationStatus(prev => ({
          ...prev,
          isLoading: false,
          errorMessage: 'Could not refresh location'
        }));
      }
    } catch (error) {
      console.log('📍 useLocationService: Location refresh error:', error);
      setLocationStatus(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        errorMessage: error?.message || 'Location refresh failed'
      }));
    }
  }, []);

  // ==================== LOCATION RESET ====================

  const resetLocation = useCallback(() => {
    console.log('📍 useLocationService: Resetting location to default');
    
    const defaultLocation = LocationService.getDefaultLocation();
    setLocation(defaultLocation);
    
    setLocationStatus({
      isLoading: false,
      hasError: false,
      lastUpdate: new Date(),
      errorMessage: 'Reset to default location'
    });
    
    // Automatically try to get real location after reset
    initializeLocation();
  }, [initializeLocation]);

  // ==================== UTILITY FUNCTIONS ====================

  const getLocationString = useCallback(() => {
    if (!location) return 'Location not available';
    
    const { latitude, longitude, accuracy } = location;
    return `${latitude?.toFixed(6)}, ${longitude?.toFixed(6)} (±${accuracy?.toFixed(0)}m)`;
  }, [location]);

  const hasValidLocation = useCallback(() => {
    return !!(location && location.latitude && location.longitude);
  }, [location]);

  // ==================== AUTO-INITIALIZATION ====================

  useEffect(() => {
    if (autoInitialize) {
      console.log('📍 useLocationService: Auto-initializing location on mount');
      initializeLocation();
    }
  }, [autoInitialize, initializeLocation]);

  // ==================== RETURN INTERFACE ====================

  return {
    // Location state
    location,
    locationStatus,
    
    // Location actions
    initializeLocation,
    refreshLocation,
    resetLocation,
    
    // Utility functions
    getLocationString,
    hasValidLocation,
  };
};