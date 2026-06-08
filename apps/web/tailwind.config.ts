import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Material 3 inspired palette
        primary: {
          DEFAULT: "#0057c2",
          hover: "#004ba8",
          active: "#003f8c",
          soft: "#d9e2ff",
          container: "#006ef2",
          fixed: "#afc6ff",
        },
        // Backwards-compat shim (existing code uses `bg-primary-soft` etc.)
        "primary-soft": "#d9e2ff",
        surface: {
          DEFAULT: "#faf9ff",
          dim: "#d8d9e5",
          container: "#ecedf9",
          "container-low": "#f2f3ff",
          "container-high": "#e6e7f3",
          card: "#ffffff",
        },
        ink: {
          DEFAULT: "#181b23",
          variant: "#414755",
          muted: "#727786",
          faint: "#9097a8",
        },
        // Backwards-compat shim
        text: {
          DEFAULT: "#181b23",
          2: "#414755",
          3: "#9097a8",
        },
        border: {
          DEFAULT: "#d9d9d9",
          soft: "#e6e9f0",
          strong: "#c1c6d7",
        },
        bg: {
          page: "#f5f5f5",
          card: "#ffffff",
        },
        success: {
          DEFAULT: "#2cb56a",
          soft: "#e6f7eb",
          border: "#bfe5cc",
        },
        warning: {
          DEFAULT: "#d97706",
          soft: "#fff4e5",
          border: "#f8d3a3",
        },
        danger: {
          DEFAULT: "#ba1a1a",
          soft: "#ffdad6",
          border: "#ffb3ad",
        },
        info: {
          DEFAULT: "#006ef2",
          soft: "#d9e2ff",
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "'PingFang SC'", "'Hiragino Sans GB'", "'Microsoft YaHei'", "system-ui", "sans-serif"],
        sans: ["'Inter'", "'PingFang SC'", "'Hiragino Sans GB'", "'Microsoft YaHei'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "'Cascadia Code'", "Consolas", "monospace"],
      },
      fontSize: {
        // M3 type scale (rounded up slightly for legibility on mobile)
        "display-sm": ["28px", { lineHeight: "36px", fontWeight: "600", letterSpacing: "-0.01em" }],
        "title-lg": ["20px", { lineHeight: "28px", fontWeight: "600", letterSpacing: "-0.005em" }],
        "title-md": ["18px", { lineHeight: "26px", fontWeight: "600" }],
        "title-sm": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "22px", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "18px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", fontWeight: "500", letterSpacing: "0.02em" }],
        "label-sm": ["10px", { lineHeight: "14px", fontWeight: "700", letterSpacing: "0.05em" }],
        // Legacy aliases used by existing pages
        xs: ["11px", { lineHeight: "1.4" }],
        sm: ["12px", { lineHeight: "1.5" }],
        base: ["14px", { lineHeight: "1.55" }],
        md: ["14px", { lineHeight: "1.55" }],
        lg: ["16px", { lineHeight: "1.4", fontWeight: "600" }],
        xl: ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        "2xl": ["20px", { lineHeight: "1.35", fontWeight: "600" }],
        "3xl": ["24px", { lineHeight: "1.3", fontWeight: "700" }],
        "4xl": ["32px", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        pill: "9999px",
      },
      spacing: {
        "page": "16px",
        "gutter": "12px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "24px",
        "safe-bottom": "34px",
        "tabbar": "64px",
        "appbar": "56px",
      },
      maxWidth: {
        phone: "430px",
      },
      boxShadow: {
        "card": "0 1px 2px rgba(20, 22, 35, 0.04)",
        "elev-1": "0 1px 2px rgba(20, 22, 35, 0.06)",
        "elev-2": "0 6px 16px rgba(20, 22, 35, 0.08)",
        "tabbar": "0 -2px 8px rgba(20, 22, 35, 0.04)",
        "primary": "0 4px 12px rgba(0, 89, 194, 0.24)",
      },
      transitionTimingFunction: {
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "pop-in": { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        "slide-down": { from: { transform: "translateY(-100%)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        "sheet-up": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out both",
        "pop-in": "pop-in 180ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-down": "slide-down 220ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "sheet-up": "sheet-up 300ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
