import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // === FITBOARD Design System Colors ===
      colors: {
        // Surfaces (dark hierarchy)
        'background':               '#121414',
        'surface':                  '#121414',
        'surface-dim':              '#121414',
        'surface-container-lowest': '#0d0e0f',
        'surface-container-low':    '#1a1c1c',
        'surface-container':        '#1e2020',
        'surface-container-high':   '#292a2a',
        'surface-container-highest':'#343535',
        'surface-bright':           '#38393a',
        'surface-variant':          '#343535',

        // On-surface text
        'on-background':            '#e3e2e2',
        'on-surface':               '#e3e2e2',
        'on-surface-variant':       '#c4c7c7',

        // Primary (neutral silver)
        'primary':                  '#c9c6c5',
        'primary-container':        '#0d0d0d',
        'primary-fixed':            '#e5e2e1',
        'primary-fixed-dim':        '#c9c6c5',
        'on-primary':               '#313030',
        'on-primary-container':     '#7c7a7a',
        'on-primary-fixed':         '#1c1b1b',
        'on-primary-fixed-variant': '#474646',
        'inverse-primary':          '#5f5e5e',

        // Secondary (GOLD — accent)
        'secondary':                '#e9c169',
        'secondary-fixed':          '#ffdf9d',
        'secondary-fixed-dim':      '#e9c169',
        'secondary-container':      '#725501',
        'on-secondary':             '#3f2e00',
        'on-secondary-fixed':       '#251a00',
        'on-secondary-fixed-variant':'#5b4300',
        'on-secondary-container':   '#f5cc72',

        // Tertiary (BLUE — links/accent)
        'tertiary':                 '#acc7ff',
        'tertiary-fixed':           '#d7e2ff',
        'tertiary-fixed-dim':       '#acc7ff',
        'tertiary-container':       '#000c25',
        'on-tertiary':              '#002f68',
        'on-tertiary-fixed':        '#001a40',
        'on-tertiary-fixed-variant':'#004492',
        'on-tertiary-container':    '#3578e0',

        // Outlines / borders
        'outline':                  '#8e9192',
        'outline-variant':          '#444748',

        // Error
        'error':                    '#ffb4ab',
        'error-container':          '#93000a',
        'on-error':                 '#690005',
        'on-error-container':       '#ffdad6',

        // Inverse
        'inverse-surface':          '#e3e2e2',
        'inverse-on-surface':       '#2f3131',

        // Tint
        'surface-tint':             '#c9c6c5',
      },

      // === Typography Scale ===
      fontFamily: {
        sans:           ['var(--font-inter)', 'Inter', 'sans-serif'],
        'headline-sm':  ['Inter'],
        'headline-md':  ['Inter'],
        'headline-lg':  ['Inter'],
        'display':      ['Inter'],
        'display-mobile':['Inter'],
        'body-md':      ['Inter'],
        'body-sm':      ['Inter'],
        'label-caps':   ['Inter'],
      },
      fontSize: {
        'headline-sm':    ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'headline-md':    ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-lg':    ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display':        ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-mobile': ['36px', { lineHeight: '1.1', fontWeight: '700' }],
        'body-md':        ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm':        ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-caps':     ['12px', { lineHeight: '1.0', letterSpacing: '0.8px', fontWeight: '500' }],
      },

      // === Spacing Scale ===
      spacing: {
        'base': '4px',
        'xs':   '8px',
        'sm':   '12px',
        'md':   '16px',
        'lg':   '24px',
        'xl':   '32px',
        'xxl':  '48px',
        'huge': '64px',
      },

      // === Border Radius ===
      borderRadius: {
        DEFAULT: '0.25rem',   // 4px
        'lg':    '0.5rem',    // 8px
        'xl':    '0.75rem',   // 12px
        'full':  '9999px',
      },
    },
  },
  plugins: [],
}
export default config
