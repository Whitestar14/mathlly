module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "oklch(var(--color-border) / <alpha-value>)",
        input: "oklch(var(--color-input) / <alpha-value>)",
        ring: "oklch(var(--color-ring) / <alpha-value>)",
        background: "oklch(var(--color-background) / <alpha-value>)",
        foreground: "oklch(var(--color-foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "oklch(var(--color-primary) / <alpha-value>)",
          foreground: "oklch(var(--color-primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(var(--color-secondary) / <alpha-value>)",
          foreground: "oklch(var(--color-secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(var(--color-destructive) / <alpha-value>)",
          foreground: "oklch(var(--color-destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "oklch(var(--color-muted) / <alpha-value>)",
          foreground: "oklch(var(--color-muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--color-accent) / <alpha-value>)",
          foreground: "oklch(var(--color-accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(var(--color-popover) / <alpha-value>)",
          foreground: "oklch(var(--color-popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "oklch(var(--color-card) / <alpha-value>)",
          foreground: "oklch(var(--color-card-foreground) / <alpha-value>)",
        },
        panel: {
          DEFAULT: "oklch(var(--color-panel) / <alpha-value>)",
        },
        backdrop: {
          DEFAULT: "oklch(var(--backdrop) / <alpha-value>)",
          light: "oklch(var(--backdrop-light) / <alpha-value>)",
          surface: "oklch(var(--backdrop-surface) / <alpha-value>)",
        },
      },
      animation: {
        "spin-fast": "spin 1s linear infinite",
        "spin-slow": "spin 3s linear infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        'accordion-down': 'accordion-down 0.25s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-in',
      },
      keyframes: {
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        'accordion-down': {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          to: { height: '0', opacity: '0' },
        },
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "Consolas", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
};
