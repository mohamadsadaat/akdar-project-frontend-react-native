export const colors = {
  // Primary palette
  primary: '#0A5C4A', // Main medical green
  primaryFixed: '#0A5C4A', // Fixed primary for UI elements
  primaryLight: '#8BD2BB',
  primaryDark: '#004335',
  onPrimary: '#FFFFFF', // Text/icons on primary color

  // Secondary palette
  secondary: '#2ECC71', // Vibrant accent green
  secondaryContainer: '#CDFAE4', // Light container for secondary elements
  onSecondaryContainer: '#004335', // Text on secondary container
  secondaryLight: '#6BFE9C',
  secondaryDark: '#006D37',
  onSecondary: '#FFFFFF', // Text/icons on secondary color

  // Tertiary palette
  tertiary: '#3B82F6', // Blue accent
  tertiaryFixed: '#DBEAFE', // Light container for tertiary elements

  // Background and surfaces
  background: '#F7FAF7', // Soft light gray
  surface: '#FFFFFF', // Pure white for priority cards
  surfaceVariant: '#F2F4F1',
  surfaceContainer: '#ECEFEC', // Mid surface container
  surfaceContainerLow: '#F4F7F4', // Low surface container
  surfaceContainerLowest: '#FFFFFF', // Used for modals
  surfaceContainerHigh: '#E4E7E4', // High surface container
  surfaceContainerHighest: '#DCDFE0', // Highest surface container
  onSurface: '#191C1B', // Text on surface
  onSurfaceVariant: '#3F4945', // Text on surface variant

  // Text colors
  text: '#191C1B', // Dark for high contrast
  textSecondary: '#3F4945', // Reduced opacity text
  textLight: '#555555', // Light text for modals etc.

  // Borders and outlines
  border: 'rgba(10, 92, 74, 0.1)', // Thin primary green border (10% opacity)
  outline: '#6F7975',
  outlineVariant: '#BEC9C4', // Subtle outline variant

  // Feedback colors
  error: '#BA1A1A',
  onError: '#FFFFFF', // Text on error color
  errorContainer: '#FFDAD6', // Light error container background

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)', // Modal backdrops

  // Shadow tints
  shadowTint: 'rgba(0, 92, 74, 0.05)',
  shadowTintStrong: 'rgba(46, 204, 113, 0.2)', // For profile icon secondary glow
};

export type Colors = typeof colors;
