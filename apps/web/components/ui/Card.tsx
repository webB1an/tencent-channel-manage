import * as React from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "sunken" | "outline";
export type CardPad = "sm" | "md" | "lg";

const variants: Record<CardVariant, string> = {
  default: "surface",
  sunken: "bg-paper-2",
  outline: "bg-transparent border border-line",
};

const pads: Record<CardPad, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  pad?: CardPad;
  as?: "div" | "article" | "section";
}

export function Card({ variant = "default", pad = "md", as = "div", className, children, ...rest }: CardProps) {
  const Tag = as as "div";
  return (
    <Tag className={cn("rounded-xl", variants[variant], pads[pad], className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pb-3 mb-3 border-b border-line", className)} {...rest}>
      {children}
    </div>
  );
}
