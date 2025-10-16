import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'message-slide-in': 'messageSlideIn 0.3s ease-out',
        'connection-pulse': 'connectionPulse 2s infinite',
      },
      keyframes: {
        messageSlideIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        connectionPulse: {
          '0%, 100%': {
            opacity: '1',
            transform: 'translateY(-50%) scale(1)',
          },
          '50%': {
            opacity: '0.5',
            transform: 'translateY(-50%) scale(1.2)',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
