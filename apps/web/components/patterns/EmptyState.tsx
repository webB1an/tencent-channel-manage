import * as React from "react";

function FolderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}
function InboxIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 13l3-9h12l3 9v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6Z" />
      <path d="M3 13h5l2 3h4l2-3h5" />
    </svg>
  );
}
function PulseIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </svg>
  );
}

const ICONS = { folder: FolderIcon, inbox: InboxIcon, pulse: PulseIcon } as const;

export type EmptyIcon = keyof typeof ICONS;

export interface EmptyStateProps {
  icon: EmptyIcon;
  title: string;
  hint?: string;
}

export function EmptyState({ icon, title, hint }: EmptyStateProps) {
  const Icon = ICONS[icon];
  return (
    <div className="flex flex-col items-center justify-center py-10 text-ink-3">
      <Icon />
      <p className="mt-4 text-small text-ink-2">{title}</p>
      {hint && <p className="mt-1 text-mini text-ink-3">{hint}</p>}
    </div>
  );
}
