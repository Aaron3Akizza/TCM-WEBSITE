/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── TCM Brand Palette (derived from official logo) ──────────────
        // Navy / Dark Blue — primary backgrounds, navbar, headings
        tcm: {
          navy:       '#0F1F3D',   // deepest navy
          'navy-mid': '#1A3561',   // mid navy for sections
          'navy-lt':  '#2A4A7F',   // lighter navy for cards
          gold:       '#C9A84C',   // gold from logo ring
          'gold-lt':  '#E8C96A',   // lighter gold for hover / glow
          orange:     '#E86A2A',   // warm fire/orange CTA
          'orange-lt':'#F08040',   // lighter orange for hover
          sky:        '#A8C8E8',   // light sky blue from logo background
          'sky-lt':   '#D4E8F5',   // very light sky for subtle backgrounds
          cream:      '#FAFAF7',   // warm white / off-white
          'gray-soft': '#F2F4F7',  // section background
          'gray-mid':  '#8A9AB5',  // muted text
          'gray-dark': '#3D4F6B',  // secondary text on light
        },
        // ── Legacy aliases kept so existing components don't break ───────
        'tym-bg':      '#FAFAF7',
        'tym-slate':   '#0F1F3D',
        'tym-crimson': '#E86A2A',
      },
      fontFamily: {
        'dm-sans':   ['DM Sans', 'sans-serif'],
        cormorant:   ['Cormorant Garamond', 'serif'],
      },
      boxShadow: {
        'gold':    '0 4px 24px 0 rgba(201,168,76,0.20)',
        'navy':    '0 4px 24px 0 rgba(15,31,61,0.18)',
        'orange':  '0 4px 20px 0 rgba(232,106,42,0.25)',
      },
      backgroundImage: {
        'gold-gradient':   'linear-gradient(135deg, #C9A84C 0%, #E8C96A 100%)',
        'navy-gradient':   'linear-gradient(160deg, #0F1F3D 0%, #1A3561 100%)',
        'fire-gradient':   'linear-gradient(135deg, #E86A2A 0%, #C9A84C 100%)',
        'hero-overlay':    'linear-gradient(to right, rgba(15,31,61,0.94) 0%, rgba(15,31,61,0.7) 60%, rgba(15,31,61,0.2) 100%)',
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease forwards',
        'fade-in':    'fadeIn 0.5s ease forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(201,168,76,0)' } },
      },
    },
  },
  plugins: [],
}
