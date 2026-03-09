// ─── ISAAC DESIGN TOKENS ──────────────────────────────────────────────────────
// Single source of truth for the entire visual system.
// Changing values here propagates everywhere.

export const Colors = {
  // Brand
  primary: '#1A56DB',
  primaryDark: '#1040A8',
  primaryLight: '#EBF2FF',
  primaryMid: '#3B82F6',

  // Status
  statusOpen: '#F59E0B',
  statusOpenBg: '#FFFBEB',
  statusInProgress: '#1A56DB',
  statusInProgressBg: '#EBF2FF',
  statusFinished: '#10B981',
  statusFinishedBg: '#ECFDF5',

  // Priority
  priorityLow: '#6B7280',
  priorityMedium: '#F59E0B',
  priorityHigh: '#EF4444',

  // Neutral
  white: '#FFFFFF',
  background: '#F7F9FC',
  surface: '#FFFFFF',
  border: '#E5E9F2',
  borderLight: '#F0F3FA',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Feedback
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  errorLight: '#FEE2E2',

  // Misc
  overlay: 'rgba(15, 23, 42, 0.4)',
  shadow: 'rgba(15, 23, 42, 0.08)',
} as const;

export const Typography = {
  // Font families
  fontRegular: 'System',
  fontMedium: 'System',
  fontSemiBold: 'System',
  fontBold: 'System',

  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 36,

  // Line heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;
