// ─── GCQ MANUTENÇÕES — DESIGN TOKENS ─────────────────────────────────────────
// Paleta extraída da logo: bordô escuro + grafite + branco quente

export const Colors = {
  // ── Brand GCQ
  primary:      '#8C1C2E',   // bordô escuro da logo
  primaryDark:  '#5E1020',   // bordô mais escuro (hover/pressed)
  primaryLight: '#F5E8EA',   // bordô bem claro (backgrounds suaves)
  primaryMid:   '#B02540',   // bordô médio (accents)

  // ── Status tickets
  statusOpen:         '#C0392B',   // vermelho GCQ — aberto/urgente
  statusOpenBg:       '#FDEDEC',
  statusInProgress:   '#8C1C2E',   // bordô — em andamento
  statusInProgressBg: '#F5E8EA',
  statusFinished:     '#1E7E4A',   // verde neutro — finalizado
  statusFinishedBg:   '#EAF7EF',

  // ── Priority
  priorityLow:    '#6B7280',
  priorityMedium: '#D4850A',
  priorityHigh:   '#8C1C2E',

  // ── Neutrals
  white:       '#FFFFFF',
  background:  '#F9F5F5',   // branco levemente quente (combina com bordô)
  surface:     '#FFFFFF',
  border:      '#E8D8DA',   // borda com tom rosado suave
  borderLight: '#F3EAEB',

  // ── Text
  textPrimary:   '#1A0A0C',   // quase preto com tom quente
  textSecondary: '#6B4A50',   // cinza quente
  textTertiary:  '#A07A80',   // cinza claro quente
  textInverse:   '#FFFFFF',

  // ── Feedback
  success:    '#1E7E4A',
  warning:    '#D4850A',
  error:      '#C0392B',
  errorBg:    '#FDEDEC',
  errorLight: '#FAD4D0',

  // ── Misc
  overlay: 'rgba(26, 10, 12, 0.45)',
  shadow:  'rgba(140, 28, 46, 0.10)',
} as const;

export const Typography = {
  fontRegular:  'System',
  fontMedium:   'System',
  fontSemiBold: 'System',
  fontBold:     'System',

  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  30,
  xxxl: 36,

  lineHeightTight:   1.2,
  lineHeightNormal:  1.5,
  lineHeightRelaxed: 1.75,
} as const;

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  xxl:  32,
  xxxl: 48,
} as const;

export const Radii = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
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
