import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  status: string;
}

export class LocationService {
  private static defaultLocation: LocationData = {
    latitude: 3.1390,
    longitude: 101.6869,
    accuracy: 100,
    timestamp: new Date().toISOString(),
    status: 'default',
  };

  static async getCurrentLocation(): Promise<LocationData> {
    console.log('🔧 GPS: Starting location request...');
    
    try {
      // Check current permission status
      const currentStatus = await Location.getForegroundPermissionsAsync();
      let finalStatus = currentStatus.status;
      
      if (finalStatus !== 'granted') {
        console.log('🔧 GPS: Permission not granted, requesting...');
        
        const permissionResult = await Location.requestForegroundPermissionsAsync();
        finalStatus = permissionResult.status;
      }
      
      if (finalStatus === 'granted') {
        console.log('🔧 GPS: Getting location with granted permission...');
        
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 10000,
          maximumAge: 60000,
        });
        
        return {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
          timestamp: new Date().toISOString(),
          status: 'real',
        };
      } else {
        console.log('🔧 GPS: Permission denied');
        return { ...this.defaultLocation, status: 'permission_denied' };
      }
    } catch (error) {
      console.log('🔧 GPS ERROR:', error);
      return { ...this.defaultLocation, status: 'error' };
    }
  }

  static getDefaultLocation(): LocationData {
    return { ...this.defaultLocation };
  }
}
