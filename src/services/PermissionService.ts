import { Platform, PermissionsAndroid, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export class PermissionService {
  private static hasPermissions = false;

  static async requestAllPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        const cameraGranted = granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED;
        this.hasPermissions = cameraGranted;
        
        if (!cameraGranted) {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera permission in Settings for photo capture and QR scanning',
            [{ text: 'OK' }]
          );
        }
        
        return cameraGranted;
      } else {
        // iOS permissions
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        this.hasPermissions = cameraPermission.status === 'granted';
        return this.hasPermissions;
      }
    } catch (error) {
      console.log('Permission request error:', error);
      return false;
    }
  }

  static getPermissionStatus(): boolean {
    return this.hasPermissions;
  }

  static async checkAndRequestPermissions(): Promise<boolean> {
    if (!this.hasPermissions) {
      return await this.requestAllPermissions();
    }
    return true;
  }
}
