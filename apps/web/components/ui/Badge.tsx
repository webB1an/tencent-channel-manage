import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "riskHigh"
  | "riskMid"
  | "riskLow"
  | "lime"
  | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-paper-sunken text-ink-2",
  riskHigh: "bg-risk-high/10 text-risk-high",
  riskMid: "bg-risk-mid/10 text-risk-mid",
  riskLow: "bg-risk-low/10 text-risk-low",
  lime: "bg-lime text-lime-ink",
  outline: "bg-transparent text-ink-2 border border-line",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  uppercase?: boolean;
}

export function Badge({ tone = "neutral", uppercase, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2 rounded-full text-micro",
        tones[tone],
        uppercase && "uppercase tracking-[0.06em]",
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
