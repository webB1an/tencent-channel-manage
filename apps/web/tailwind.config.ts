import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: ["class", ".dark"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          2: "rgb(var(--ink-2) / <alpha-value>)",
          3: "rgb(var(--ink-3) / <alpha-value>)",
          4: "rgb(var(--ink-4) / <alpha-value>)",
          inverse: "rgb(var(--ink-inverse) / <alpha-value>)",
        },
        paper: {
          DEFAULT: "rgb(var(--paper) / <alpha-value>)",
          2: "rgb(var(--paper-2) / <alpha-value>)",
          sunken: "rgb(var(--paper-sunken) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          strong: "rgb(var(--line-strong) / <alpha-value>)",
        },
        lime: {
          DEFAULT: "rgb(var(--lime) / <alpha-value>)",
          ink: "rgb(var(--lime-ink) / <alpha-value>)",
        },
        risk: {
          high: "#E5484D",
          mid: "#F5A524",
          low: "#30A46C",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "system-ui"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular", "monospace"],
        display: ["var(--font-inter)", "ui-sans-serif", "PingFang SC"],
      },
      fontSize: {
        d1: ["44px", { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "500" }],
        d2: ["32px", { lineHeight: "1.1",  letterSpacing: "-0.03em", fontWeight: "500" }],
        d3: ["24px", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "500" }],
        h1: ["20px", { lineHeight: "1.3",  letterSpacing: "-0.01em", fontWeight: "600" }],
        h2: ["17px", { lineHeight: "1.35", fontWeight: "600" }],
        h3: ["15px", { lineHeight: "1.4",  fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.55" }],
        small: ["13px", { lineHeight: "1.5" }],
        mini: ["12px", { lineHeight: "1.45" }],
        micro: ["11px", { lineHeight: "1.4", letterSpacing: "0.02em" }],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        sheet: "0 -8px 32px -8px rgba(0,0,0,0.18), 0 -1px 0 var(--line) inset",
        pop: "0 8px 24px -8px rgba(0,0,0,0.16), 0 0 0 1px var(--line)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-out-cubic": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
