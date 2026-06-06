import { ListRow } from "@/components/ui/list-row";

export function HotTopicItem({ emoji, title, meta, onClick }: { emoji: string; title: string; meta: string; onClick?: () => void }) {
  return (
    <ListRow
      onClick={onClick}
      prefix={<span className="text-base">{emoji}</span>}
      title={<span className="line-clamp-1">{title}</span>}
      description={meta}
    />
  );
}
