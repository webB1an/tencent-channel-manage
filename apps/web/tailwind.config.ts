import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary-color)",
          soft: "var(--primary-soft)",
        },
        text: {
          DEFAULT: "var(--text-color)",
          2: "var(--text-color-2)",
          3: "var(--text-color-3)",
        },
        border: "var(--border-color)",
        bg: {
          page: "var(--bg-page)",
          card: "var(--bg-card)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
      },
      fontSize: {
        xs: ["11px", { lineHeight: "1.4" }],
        sm: ["12px", { lineHeight: "1.5" }],
        base: ["13px", { lineHeight: "1.55" }],
        md: ["14px", { lineHeight: "1.55" }],
        lg: ["15px", { lineHeight: "1.4", fontWeight: "600" }],
        xl: ["16px", { lineHeight: "1.4", fontWeight: "500" }],
        "2xl": ["18px", { lineHeight: "1.35", fontWeight: "600" }],
        "3xl": ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        "4xl": ["24px", { lineHeight: "1.25", fontWeight: "700" }],
      },
      fontFamily: {
        sans: ["'PingFang SC'", "'Hiragino Sans GB'", "'Microsoft YaHei'", "sans-serif"],
        mono: ["'SF Mono'", "'Cascadia Code'", "'Consolas'", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        pill: "999px",
      },
      transitionTimingFunction: {
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
