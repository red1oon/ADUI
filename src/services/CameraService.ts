//src/services/CameraService.ts

import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface MediaItem {
  uri: string;
  fileName: string;
  fileSize?: number;
  type: string;
  mediaType: 'photo';
  timestamp: string;
  location: any;
}

export class CameraService {
  static async capturePhoto(documentId: string, fieldId: string, location: any): Promise<MediaItem | null> {
    try {
      console.log('🔧 CAMERA: Starting photo capture...');
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });
      
      console.log('🔧 CAMERA: Photo result:', result);
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        console.log('🔧 CAMERA: Photo asset details:', asset);
        
        const mediaData: MediaItem = {
          uri: asset.uri,
          fileName: asset.fileName || `${documentId}_${fieldId}.jpg`,
          fileSize: asset.fileSize,
          type: 'image/jpeg',
          mediaType: 'photo',
          timestamp: new Date().toISOString(),
          location: location,
        };
        
        console.log('🔧 CAMERA: Photo captured successfully:', mediaData.fileName);
        return mediaData;
      } else {
        console.log('🔧 CAMERA: Photo capture cancelled or no assets');
        return null;
      }
    } catch (error) {
      console.log('🔧 CAMERA ERROR:', error);
      Alert.alert('Camera Error', `Could not capture photo: ${error.message}`);
      return null;
    }
  }
}
