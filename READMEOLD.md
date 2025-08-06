# ADUI - iDempiere AD-Driven Mobile Form Engine POC

A React Native mobile application demonstrating dynamic form generation from iDempiere Application Dictionary metadata, designed to surpass ODK's capabilities in field data collection.

## 🚀 Quick Start

```bash
# Install dependencies (already done by setup script)
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS  
npm run ios
```

## 📋 Features

- **Dynamic Form Generation**: Forms rendered from iDempiere AD metadata
- **Advanced Field Types**: QR scanning, camera capture, conditional logic
- **Mobile-Optimized UX**: Touch gestures, animations, offline support
- **Professional Validation**: Real-time validation with error handling
- **Tab Navigation**: Swipeable tabs with smooth transitions

## 🏗️ Architecture

Based on the Mobile AD Engine framework with:
- React Native + Expo for cross-platform development
- Reanimated for smooth animations
- Gesture Handler for touch interactions
- FlashList for high-performance lists
- Mock AD metadata simulating iDempiere structure

## 📱 Templates Included

1. **Equipment Inspection**: QR asset identification, photo capture, condition dropdowns
2. **Safety Audit**: Mandatory fields, conditional questions, signature capture  
3. **Asset Verification**: Simple BIM integration demonstration

## 🔧 Development

Project structure:
```
src/
├── components/     # Reusable UI components
├── screens/        # Main app screens
├── services/       # Business logic
├── types/          # TypeScript definitions
├── utils/          # Helper functions
└── data/           # Mock AD metadata
```

## 🎯 ODK Competitive Advantages

- ⚡ **Setup**: 5 minutes vs ODK's hours
- 🎨 **Visual Design**: Point-and-click vs XLSForm syntax
- 📱 **Mobile-First**: Native touch interactions vs basic web forms
- 🔌 **ERP Integration**: Direct iDempiere connection vs server complexity
- 🚀 **Performance**: Native animations vs web-based interface

## 📊 Next Steps

1. Copy Mobile AD Engine code to App.tsx
2. Implement sample window definitions
3. Add form validation and submission logic
4. Test on physical devices for camera/GPS functionality
