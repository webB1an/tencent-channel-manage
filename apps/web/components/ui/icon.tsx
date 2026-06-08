import type { SVGProps } from "react";

export type IconName =
  | "chevron-left" | "chevron-right" | "chevron-down" | "close" | "check"
  | "arrow-left" | "arrow-right" | "arrow-up-right"
  | "home" | "tasks" | "profile"
  | "plus" | "plus-circle" | "minus" | "trash" | "search" | "edit" | "edit-2"
  | "eye" | "eye-off" | "calendar" | "clock" | "alert-triangle" | "info"
  | "alert-circle" | "check-circle" | "x-circle" | "circle" | "more-vertical" | "more-horizontal"
  | "refresh" | "refresh-cw" | "filter" | "settings" | "log-out" | "shield" | "shield-check"
  | "key" | "lock" | "unlock" | "link" | "share" | "bell" | "book" | "book-open"
  | "file-text" | "file" | "send" | "megaphone" | "zap" | "play" | "pause"
  | "thumbs-up" | "message-circle" | "user-plus" | "users" | "user" | "tag" | "hash"
  | "server" | "globe" | "list" | "list-tree" | "loader" | "trending-up" | "activity"
  | "image" | "video" | "music" | "bar-chart" | "pie-chart" | "database" | "cloud"
  | "chevrons-left" | "chevrons-right" | "copy" | "download" | "upload" | "external-link"
  | "menu" | "grid" | "star" | "heart" | "bookmark" | "help-circle" | "github";

const paths: Record<IconName, React.ReactNode> = {
  // Navigation
  "chevron-left": <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "chevron-right": <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "chevron-down": <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "chevrons-left": <path d="m11 6-6 6 6 6M19 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "chevrons-right": <path d="m5 6 6 6-6 6M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "arrow-left": <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "arrow-right": <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "arrow-up-right": <path d="M7 17 17 7M7 7h10v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "close": <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  "check": <path d="m5 12 5 5 9-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "menu": <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,

  // Tabs
  "home": <><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></>,
  "tasks": <><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M8 3v4M16 3v4M4 10h16M8 14l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "profile": <><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" /><path d="M4.5 20c1.5-3.5 4.5-5 7.5-5s6 1.5 7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,

  // Actions
  "plus": <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  "plus-circle": <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "minus": <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  "trash": <><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "search": <><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "edit": <path d="M4 20h4l11-11-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "edit-2": <><path d="M17 3a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L17 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></>,
  "eye": <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /></>,
  "eye-off": <><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M10.5 6.7A11 11 0 0 1 12 6.5c6.5 0 10 5.5 10 5.5a18 18 0 0 1-3.1 3.7M6.5 7.7C3.5 9.7 2 12 2 12s3.5 7 10 7c1.6 0 3-.3 4.3-.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "calendar": <><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "clock": <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "refresh": <><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "refresh-cw": <><path d="M21 12a9 9 0 1 1-3-6.7L21 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 3v5h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "filter": <path d="M3 4h18l-7 9v6l-4 2v-8L3 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "settings": <><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></>,
  "log-out": <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "shield": <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "shield-check": <><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "key": <><circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="1.6" /><path d="m10.85 12.15 8.15-8.15M16 6l2 2M18 4l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "lock": <><rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "unlock": <><rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M8 11V7a4 4 0 0 1 7-2.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "link": <><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "share": <><circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.6" /><circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /><circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "bell": <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "book": <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></>,
  "book-open": <><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2V4ZM22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></>,
  "file-text": <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M14 2v6h6M8 13h8M8 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "file": <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "send": <><path d="m22 2-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M22 2 11 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "megaphone": <><path d="M3 11v2a2 2 0 0 0 2 2h2l5 4V5L7 9H5a2 2 0 0 0-2 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M15 8a4 4 0 0 1 0 8M19 5a8 8 0 0 1 0 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "zap": <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "play": <path d="M6 4v16l14-8L6 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "pause": <><rect x="6" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="1.6" /><rect x="14" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="1.6" /></>,

  // Status
  "alert-triangle": <><path d="M12 3 2 21h20L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M12 10v5M12 18v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "alert-circle": <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7v6M12 16v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "info": <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 11v6M12 8v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "check-circle": <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="m8 12 3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "x-circle": <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="m9 9 6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "circle": <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />,

  // Misc
  "more-vertical": <><circle cx="12" cy="5" r="1.5" fill="currentColor" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="19" r="1.5" fill="currentColor" /></>,
  "more-horizontal": <><circle cx="5" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="19" cy="12" r="1.5" fill="currentColor" /></>,
  "thumbs-up": <><path d="M7 22h10a2 2 0 0 0 2-1.7l1.5-9A2 2 0 0 0 18.5 9H14V5a3 3 0 0 0-6 0v4H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></>,
  "message-circle": <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.5-.7L3 21l1.7-6A8.38 8.38 0 0 1 4 11.5a8.5 8.5 0 0 1 8.5-8.5 8.38 8.38 0 0 1 8.5 8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "user-plus": <><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" /><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6M19 8v6M16 11h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "users": <><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" /><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M16 3.13a4 4 0 0 1 0 7.75M22 21c0-2.5-2-4.5-5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "user": <><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "tag": <><path d="M20 12 12 20 4 12V4h8l8 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="8" cy="8" r="1.5" fill="currentColor" /></>,
  "hash": <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
  "server": <><rect x="3" y="3" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" /><rect x="3" y="13" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" /><circle cx="7" cy="7" r="0.8" fill="currentColor" /><circle cx="7" cy="17" r="0.8" fill="currentColor" /></>,
  "globe": <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="currentColor" strokeWidth="1.6" /></>,
  "list": <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "list-tree": <><path d="M3 6h6M3 12h6M3 18h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M11 6h10M11 12h10M11 18h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "loader": <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
  "trending-up": <><path d="m22 7-8.5 8.5-5-5L2 17M16 7h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "activity": <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  "image": <><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" /><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.6" /><path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></>,
  "video": <><path d="m22 8-6 4 6 4V8ZM2 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2V6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></>,
  "music": <><path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.6" /><circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.6" /></>,
  "bar-chart": <path d="M12 20V10M18 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
  "pie-chart": <><path d="M21 12A9 9 0 1 1 12 3v9h9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></>,
  "database": <><ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="1.6" /><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "cloud": <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.6A4 4 0 0 0 6.5 19h11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "copy": <><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></>,
  "download": <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "upload": <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "external-link": <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "grid": <><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" /><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" /><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" /><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" /></>,
  "star": <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "heart": <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "bookmark": <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "help-circle": <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "github": <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
};

export function Icon({ name, size = 16, className, ...rest }: { name: IconName; size?: number } & Omit<SVGProps<SVGSVGElement>, "name" | "size">) {
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
