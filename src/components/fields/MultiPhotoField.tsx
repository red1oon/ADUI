// MultiPhotoField.tsx v1.1 - Fixed Photo Taking and Submission
// Fixes: Remove "Take Another" alert, Fix photo attachment in reports
// Save as: src/components/fields/MultiPhotoField.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, StyleSheet, Dimensions } from 'react-native';
import { FieldValue } from '../../types/ADTypes';

interface PhotoEntry {
  id: string;
  uri: string;
  fileName: string;
  timestamp: string;
  location?: any;
  sequence: number;
  fileSize?: number;
}

interface MultiPhotoData {
  photos: PhotoEntry[];
  totalPhotos: number;
  lastCaptured?: string;
}

interface MultiPhotoFieldProps {
  fieldDef: any;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  readonly?: boolean;
  onCameraCapture?: (fieldDef: any, onChange: Function) => void;
}

const screenWidth = Dimensions.get('window').width;
const thumbnailSize = (screenWidth - 60) / 3; // 3 photos per row with margins

export const MultiPhotoField: React.FC<MultiPhotoFieldProps> = ({
  fieldDef,
  value,
  onChange,
  readonly = false,
  onCameraCapture
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEntry | null>(null);

  // Parse current photo collection data
  const photoData: MultiPhotoData = value?.raw || { photos: [], totalPhotos: 0 };
  const photos = photoData.photos || [];

  // Handle taking a new photo
  const handleTakePhoto = useCallback(() => {
    if (readonly || !onCameraCapture) return;
    
    console.log('🔧 MULTI PHOTO v1.1: Starting photo capture...');
    
    // Pass a custom handler that adds to collection
    const customOnChange = (photoValue: FieldValue) => {
      if (photoValue?.raw && photoValue.metadata) {
        const newEntry: PhotoEntry = {
          id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          uri: photoValue.raw,
          fileName: photoValue.metadata.fileName || photoValue.display || 'photo.jpg',
          timestamp: photoValue.metadata.timestamp || new Date().toISOString(),
          location: photoValue.metadata.location,
          sequence: photos.length + 1,
          fileSize: photoValue.metadata.fileSize
        };

        const updatedPhotos = [...photos, newEntry];
        const updatedData: MultiPhotoData = {
          photos: updatedPhotos,
          totalPhotos: updatedPhotos.length,
          lastCaptured: newEntry.timestamp
        };

        console.log('🔧 MULTI PHOTO v1.1: Added photo:', newEntry.fileName, 'Total:', updatedPhotos.length);

        // FIXED: Structure data properly for submission system
        // The submission system expects individual photos with metadata.mediaType = 'photo'
        // So we create a special structure that includes both the collection and individual photo references
        const fieldValue: FieldValue = {
          raw: updatedData,
          display: `${updatedPhotos.length} photos captured`,
          metadata: {
            totalPhotos: updatedPhotos.length,
            lastCaptured: newEntry.timestamp,
            mediaType: 'photo-collection', // Mark as photo collection
            individualPhotos: updatedPhotos.map(photo => ({
              raw: photo.uri,
              metadata: {
                mediaType: 'photo', // Each individual photo marked for submission
                fileName: photo.fileName,
                timestamp: photo.timestamp,
                location: photo.location,
                fileSize: photo.fileSize
              }
            }))
          }
        };

        onChange(fieldValue);
      }
    };

    // Create a modified fieldDef for the capture
    const captureFieldDef = {
      ...fieldDef,
      id: `${fieldDef.id}_capture`,
      fieldId: `${fieldDef.fieldId}_capture`
    };

    onCameraCapture(captureFieldDef, customOnChange);
  }, [photos, fieldDef, onChange, onCameraCapture, readonly]);

  // Handle removing a photo
  const handleRemovePhoto = useCallback((photoId: string) => {
    if (readonly) return;

    const photoToRemove = photos.find(p => p.id === photoId);
    
    Alert.alert(
      'Remove Photo',
      `Remove photo: ${photoToRemove?.fileName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedPhotos = photos.filter(photo => photo.id !== photoId);
            const updatedData: MultiPhotoData = {
              photos: updatedPhotos,
              totalPhotos: updatedPhotos.length,
              lastCaptured: updatedPhotos.length > 0 ? updatedPhotos[updatedPhotos.length - 1].timestamp : undefined
            };

            // FIXED: Update with proper structure for submission
            const fieldValue: FieldValue = {
              raw: updatedData,
              display: `${updatedPhotos.length} photos captured`,
              metadata: {
                totalPhotos: updatedPhotos.length,
                lastCaptured: updatedData.lastCaptured,
                mediaType: 'photo-collection',
                individualPhotos: updatedPhotos.map(photo => ({
                  raw: photo.uri,
                  metadata: {
                    mediaType: 'photo',
                    fileName: photo.fileName,
                    timestamp: photo.timestamp,
                    location: photo.location,
                    fileSize: photo.fileSize
                  }
                }))
              }
            };

            onChange(fieldValue);
          }
        }
      ]
    );
  }, [photos, onChange, readonly]);

  // Handle clearing all photos
  const handleClearAll = useCallback(() => {
    if (readonly || photos.length === 0) return;

    Alert.alert(
      'Clear All Photos',
      `Remove all ${photos.length} photos?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            const emptyData: MultiPhotoData = {
              photos: [],
              totalPhotos: 0
            };

            onChange({
              raw: emptyData,
              display: '0 photos captured',
              metadata: { 
                totalPhotos: 0,
                mediaType: 'photo-collection',
                individualPhotos: []
              }
            });
          }
        }
      ]
    );
  }, [photos.length, onChange, readonly]);

  // Handle photo view
  const handleViewPhoto = useCallback((photo: PhotoEntry) => {
    setSelectedPhoto(photo);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatLocation = (location: any) => {
    if (!location) return 'No location';
    return `${location.latitude?.toFixed(6)}, ${location.longitude?.toFixed(6)}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryStats}>
          <Text style={styles.summaryTitle}>Photos Captured</Text>
          <Text style={styles.summaryCount}>{photos.length}</Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.captureButton, readonly && styles.disabledButton]}
            onPress={handleTakePhoto}
            disabled={readonly}
          >
            <Text style={[styles.captureButtonText, readonly && styles.disabledText]}>
              📸 Take Photo
            </Text>
          </TouchableOpacity>
          
          {photos.length > 0 && !readonly && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <View style={styles.photoGrid}>
          {photos.map((photo) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.photoThumbnail}
              onPress={() => handleViewPhoto(photo)}
            >
              <Image 
                source={{ uri: photo.uri }} 
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
              
              <View style={styles.thumbnailOverlay}>
                <Text style={styles.thumbnailSequence}>#{photo.sequence}</Text>
                {!readonly && (
                  <TouchableOpacity
                    style={styles.thumbnailRemove}
                    onPress={() => handleRemovePhoto(photo.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.thumbnailRemoveText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📸</Text>
          <Text style={styles.emptyStateText}>No photos captured yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Tap "Take Photo" to start capturing photos with GPS and timestamp
          </Text>
        </View>
      )}

      {/* Photo Details Modal */}
      {selectedPhoto && (
        <View style={styles.photoModal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedPhoto.fileName}</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setSelectedPhoto(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Image 
              source={{ uri: selectedPhoto.uri }} 
              style={styles.modalImage}
              resizeMode="contain"
            />
            
            <View style={styles.modalDetails}>
              <Text style={styles.modalDetailText}>
                📅 {formatTimestamp(selectedPhoto.timestamp)}
              </Text>
              <Text style={styles.modalDetailText}>
                📍 {formatLocation(selectedPhoto.location)}
              </Text>
              {selectedPhoto.fileSize && (
                <Text style={styles.modalDetailText}>
                  📁 {formatFileSize(selectedPhoto.fileSize)}
                </Text>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  // Label
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#e53e3e',
  },

  // Summary
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryStats: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  // Buttons
  captureButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  captureButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledText: {
    color: '#999',
  },

  // Photo Grid
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  photoThumbnail: {
    width: thumbnailSize,
    height: thumbnailSize,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 6,
  },
  thumbnailSequence: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  thumbnailRemove: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  thumbnailRemoveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e6ed',
    borderStyle: 'dashed',
  },
  emptyStateIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },

  // Photo Modal
  photoModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 1000,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalImage: {
    flex: 1,
    width: '100%',
    marginBottom: 20,
  },
  modalDetails: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  modalDetailText: {
    color: 'white',
    fontSize: 14,
  },

  // Instructions
  instructionsContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    marginTop: 12,
  },
  instructionsText: {
    fontSize: 12,
    color: '#1565c0',
    lineHeight: 16,
  },
});