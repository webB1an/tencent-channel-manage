import Link from "next/link";
import { cn } from "@/lib/utils";

export interface HotTopicItemProps {
  rank: number;
  title: string;
  authorName?: string;
  likeCount?: number;
  commentCount?: number;
  href?: string;
}

export function HotTopicItem({ rank, title, authorName, likeCount, commentCount, href }: HotTopicItemProps) {
  const inner = (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-h3 font-semibold tabular",
          rank <= 3 ? "bg-lime text-lime-ink" : "bg-paper-2 text-ink-3",
        )}
      >
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-h3 text-ink truncate">{title}</p>
        <p className="mt-0.5 text-micro text-ink-3">
          {authorName ?? "未知"} · 赞 {likeCount ?? 0} · 评论 {commentCount ?? 0}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block -mx-3 px-3 py-2.5 rounded-md hover:bg-paper-2 transition-colors"
      >
        {inner}
      </Link>
    );
  }
  return <div className="py-2.5">{inner}</div>;
}
