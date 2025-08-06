import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';

const { width: screenWidth } = Dimensions.get('window');

export const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textInverse,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textInverse,
    opacity: 0.9,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  headerButtonText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.md,
  },
  saveButton: {
    backgroundColor: colors.overlay,
  },
  saveButtonText: {
    fontWeight: typography.fontWeight.bold,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export const fieldStyles = StyleSheet.create({
  fieldContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  mandatoryLabel: {
    color: colors.mandatory,
  },
  fieldHelp: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
  },
  fieldDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  validationError: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: 4,
  },
  
  // Input Styles
  textInput: {
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: 6,
    padding: 12,
    fontSize: typography.fontSize.md,
    backgroundColor: colors.fieldBackground,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: 6,
    padding: 12,
    fontSize: typography.fontSize.md,
    backgroundColor: colors.fieldBackground,
    height: 100,
    textAlignVertical: 'top',
  },
  readonlyInput: {
    backgroundColor: colors.fieldDisabled,
    color: colors.textSecondary,
  },
  readonlyContainer: {
    padding: 12,
    backgroundColor: colors.fieldDisabled,
    borderRadius: 6,
  },
  readonlyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  
  // Switch Styles
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  
  // List Field Styles
  listField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: 6,
    padding: 12,
    backgroundColor: colors.fieldBackground,
  },
  listFieldText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    flex: 1,
  },
  listFieldIcon: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  // Picker Styles
  pickerContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  pickerClose: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerItemText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  pickerItemDesc: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: 4,
  },
  
  // Image Field Styles
  imageFieldContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.fieldDisabled,
  },
  imageButton: {
    backgroundColor: colors.camera,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  imageButtonText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  
  // QR Field Styles
  qrFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: 6,
    padding: 12,
    fontSize: typography.fontSize.md,
    backgroundColor: colors.fieldBackground,
    marginRight: 8,
  },
  qrScanButton: {
    backgroundColor: colors.qrScan,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
  },
  qrScanText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
});

export const tabStyles = StyleSheet.create({
  tabContainer: {
    flex: 1,
  },
  tabIndicatorContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTabIndicator: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabIndicatorText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  activeTabIndicatorText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  tabContentContainer: {
    flex: 1,
  },
  tabWrapper: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export const qrStyles = StyleSheet.create({
  qrContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.qrScan,
    padding: 15,
    paddingTop: 50,
  },
  qrTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textInverse,
  },
  qrCloseButton: {
    backgroundColor: colors.overlay,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  qrCloseText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  qrCamera: {
    flex: 1,
  },
  qrBottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  qrInstructions: {
    fontSize: typography.fontSize.md,
    color: colors.textInverse,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  qrCancelButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  qrCancelText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
});
