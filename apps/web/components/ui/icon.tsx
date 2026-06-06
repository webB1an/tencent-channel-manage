import type { SVGProps } from "react";

type IconName =
  | "chevron-left" | "chevron-right" | "close" | "check"
  | "home" | "tasks" | "profile"
  | "plus" | "trash" | "search" | "edit" | "eye" | "eye-off"
  | "calendar" | "clock" | "alert-triangle" | "info";

const paths: Record<IconName, React.ReactNode> = {
  "chevron-left": <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "chevron-right": <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "close": <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  "check": <path d="m5 12 5 5 9-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "home": <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "tasks": <><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M8 3v4M16 3v4M4 10h16M8 14l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "profile": <><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" /><path d="M4.5 20c1.5-3.5 4.5-5 7.5-5s6 1.5 7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "plus": <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  "trash": <><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "search": <><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "edit": <path d="M4 20h4l11-11-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "eye": <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /></>,
  "eye-off": <><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M10.5 6.7A11 11 0 0 1 12 6.5c6.5 0 10 5.5 10 5.5a18 18 0 0 1-3.1 3.7M6.5 7.7C3.5 9.7 2 12 2 12s3.5 7 10 7c1.6 0 3-.3 4.3-.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "calendar": <><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "clock": <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "alert-triangle": <><path d="M12 3 2 21h20L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M12 10v5M12 18v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "info": <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 11v6M12 8v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
};

export function Icon({ name, size = 16, className, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
