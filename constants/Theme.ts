export const DarkColors = {
  primary: '#ffe2aa',
  primaryContainer: '#fbc02d',
  surface: '#131313',
  surfaceBright: '#393939',
  surfaceVariant: 'rgba(53, 53, 53, 0.4)',
  onSurfaceVariant: '#d3c5ad',
  surfaceContainerHighest: '#353535',
  surfaceContainerLowest: '#0e0e0e',
  secondary: '#bbc8d0',
  outlineVariant: '#4f4633',
  outline: '#9c8f79',
  onSurface: '#e5e2e1',
  onPrimary: '#402d00',
  error: '#ffb4ab',
  blurTint: 'dark' as const,
  cardBorder: 'rgba(255, 255, 255, 0.12)', // Added for better visibility
};

export const LightColors = {
  primary: '#d69400',
  primaryContainer: '#ffca58',
  surface: '#f6f7f9',
  surfaceBright: '#ffffff',
  surfaceVariant: 'rgba(255, 255, 255, 0.8)',
  onSurfaceVariant: '#5e5a52',
  surfaceContainerHighest: '#e8ecef',
  surfaceContainerLowest: '#ffffff',
  secondary: '#4b6574',
  outlineVariant: '#c4bcae',
  outline: '#9e9481',
  onSurface: '#121212',
  onPrimary: '#ffffff',
  error: '#ba1a1a',
  blurTint: 'light' as const,
  cardBorder: 'rgba(79, 70, 51, 0.12)', // Standard light border
};

export const Typography = {
  fontFamily: 'Inter',
  sizes: {
    xs: 10, sm: 12, base: 14, lg: 16, xl: 20, title: 24, display: 36,
  }
};
