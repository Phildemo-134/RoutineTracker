/**
 * Modern, sophisticated color palette for the RoutineTracker app
 * Inspired by premium productivity apps with perfect accessibility
 */

// Primary brand colors - Modern gradient-friendly palette
const primaryLight = '#6366F1'; // Indigo-500 - Modern, trustworthy
const primaryDark = '#818CF8';  // Indigo-400 - Lighter for dark mode

// Success colors for completed habits
const successLight = '#10B981'; // Emerald-500 - Fresh, positive
const successDark = '#34D399';  // Emerald-400

// Warning/Progress colors
const warningLight = '#F59E0B'; // Amber-500 - Energetic
const warningDark = '#FBBF24';  // Amber-400

// Neutral grays - Carefully balanced for readability
const grayLight = {
  50: '#F8FAFC',   // Backgrounds
  100: '#F1F5F9',  // Card backgrounds
  200: '#E2E8F0',  // Borders, dividers
  300: '#CBD5E1',  // Disabled states
  400: '#94A3B8',  // Placeholders
  500: '#64748B',  // Secondary text
  600: '#475569',  // Primary text (light mode)
  700: '#334155',  // Headings (light mode)
  800: '#1E293B',  // Dark text
  900: '#0F172A',  // Darkest text
};

const grayDark = {
  50: '#0F172A',   // Darkest backgrounds
  100: '#1E293B',  // Card backgrounds
  200: '#334155',  // Borders, dividers
  300: '#475569',  // Disabled states
  400: '#64748B',  // Placeholders
  500: '#94A3B8',  // Secondary text
  600: '#CBD5E1',  // Primary text (dark mode)
  700: '#E2E8F0',  // Headings (dark mode)
  800: '#F1F5F9',  // Light text
  900: '#F8FAFC',  // Lightest text
};

export const Colors = {
  light: {
    // Text colors
    text: grayLight[700],           // Primary text - excellent contrast
    textSecondary: grayLight[500],  // Secondary text
    textMuted: grayLight[400],      // Muted text
    textInverse: '#FFFFFF',         // White text on colored backgrounds
    
    // Background colors
    background: '#FFFFFF',          // Pure white background
    backgroundSecondary: grayLight[50], // Subtle background variation
    backgroundCard: grayLight[100], // Card backgrounds
    backgroundElevated: '#FFFFFF',  // Elevated surfaces
    
    // Brand colors
    primary: primaryLight,          // Primary brand color
    primaryLight: '#8B5CF6',       // Lighter primary (Violet-500)
    primaryDark: '#4F46E5',        // Darker primary (Indigo-600)
    
    // Status colors
    success: successLight,          // Success states
    successLight: '#D1FAE5',       // Light success background
    warning: warningLight,          // Warning states
    warningLight: '#FEF3C7',       // Light warning background
    error: '#EF4444',              // Error states (Red-500)
    errorLight: '#FEE2E2',         // Light error background
    
    // Interactive elements
    tint: primaryLight,
    tabIconDefault: grayLight[400],
    tabIconSelected: primaryLight,
    icon: grayLight[500],
    iconActive: primaryLight,
    
    // Borders and dividers
    border: grayLight[200],
    borderLight: grayLight[100],
    borderFocus: primaryLight,
    
    // Shadows and overlays
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  dark: {
    // Text colors
    text: grayDark[700],           // Primary text - excellent contrast
    textSecondary: grayDark[500],  // Secondary text
    textMuted: grayDark[400],      // Muted text
    textInverse: grayDark[900],    // Dark text on light backgrounds
    
    // Background colors
    background: grayDark[50],      // Main dark background
    backgroundSecondary: grayDark[100], // Subtle background variation
    backgroundCard: grayDark[100], // Card backgrounds
    backgroundElevated: grayDark[200], // Elevated surfaces
    
    // Brand colors
    primary: primaryDark,          // Primary brand color
    primaryLight: '#A78BFA',       // Lighter primary (Violet-400)
    primaryDark: '#6366F1',        // Darker primary (Indigo-500)
    
    // Status colors
    success: successDark,          // Success states
    successLight: 'rgba(52, 211, 153, 0.1)', // Dark success background
    warning: warningDark,          // Warning states
    warningLight: 'rgba(251, 191, 36, 0.1)', // Dark warning background
    error: '#F87171',             // Error states (Red-400)
    errorLight: 'rgba(248, 113, 113, 0.1)', // Dark error background
    
    // Interactive elements
    tint: primaryDark,
    tabIconDefault: grayDark[400],
    tabIconSelected: primaryDark,
    icon: grayDark[500],
    iconActive: primaryDark,
    
    // Borders and dividers
    border: grayDark[200],
    borderLight: grayDark[100],
    borderFocus: primaryDark,
    
    // Shadows and overlays
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};
