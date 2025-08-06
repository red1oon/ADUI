// MainFormScreen.tsx v1.0 - Extracted Main Form Rendering Logic
// Handles tab management and form field rendering in a reusable component

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// Types
import { FieldValue } from '../../types/ADTypes';

// Engine Layer
import { FieldRenderer } from '../../engine';

// Theme Layer
import { tabStyles } from '../../theme';

// ==================== INTERFACES ====================

interface ADWindowDefinition {
  name: string;
  tabs: Array<{
    tabId?: string;
    id: string;
    name: string;
    fields: Array<{
      fieldId?: string;
      id: string;
      isDisplayed?: boolean;
      sequence?: number;
      [key: string]: any;
    }>;
  }>;
  [key: string]: any;
}

interface MainFormScreenProps {
  windowDef: ADWindowDefinition;
  formData: Record<string, FieldValue>;
  activeTab: number;
  onTabChange: (tabIndex: number) => void;
  onFieldChange: (fieldId: string, value: FieldValue) => void;
  onQRScanned: (data: string) => void;
  onCameraCapture: (uri: string) => void;
  onQRChecklistScan: () => void;
}

// ==================== MAIN FORM SCREEN COMPONENT ====================

export const MainFormScreen: React.FC<MainFormScreenProps> = ({
  windowDef,
  formData,
  activeTab,
  onTabChange,
  onFieldChange,
  onQRScanned,
  onCameraCapture,
  onQRChecklistScan,
}) => {
  console.log('📱 MainFormScreen: Rendering form with', windowDef.tabs.length, 'tabs');

  return (
    <View style={tabStyles.tabContainer}>
      {/* Tab Indicators */}
      <View style={tabStyles.tabIndicatorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {windowDef.tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.tabId || tab.id}
              style={[
                tabStyles.tabIndicator,
                index === activeTab && tabStyles.activeTabIndicator
              ]}
              onPress={() => onTabChange(index)}
            >
              <Text style={[
                tabStyles.tabIndicatorText,
                index === activeTab && tabStyles.activeTabIndicatorText
              ]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Tab Content */}
      <View style={tabStyles.tabContentContainer}>
        {windowDef.tabs.map((tab, index) => (
          <View 
            key={tab.tabId || tab.id} 
            style={[
              tabStyles.tabWrapper, 
              { display: index === activeTab ? 'flex' : 'none' }
            ]}
          >
            <ScrollView 
              style={tabStyles.tabContent} 
              showsVerticalScrollIndicator={false}
            >
              {tab.fields
                .filter(field => field.isDisplayed !== false)
                .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
                .map(field => (
                  <FieldRenderer
                    key={field.fieldId || field.id}
                    fieldDef={field}
                    value={formData[field.fieldId || field.id]}
                    onChange={(value) => onFieldChange(field.fieldId || field.id, value)}
                    formData={formData}
                    onQRScanned={onQRScanned}
                    onCameraCapture={onCameraCapture}
                    onQRChecklistScan={onQRChecklistScan}
                  />
                ))}
            </ScrollView>
          </View>
        ))}
      </View>
    </View>
  );
};