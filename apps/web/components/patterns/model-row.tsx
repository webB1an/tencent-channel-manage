import { ListRow } from "@/components/ui/list-row";
import { Badge } from "@/components/ui/badge";

export function ModelRow({ name, provider, status, onClick }: { name: string; provider: string; status: "enabled" | "disabled"; onClick?: () => void }) {
  return (
    <ListRow
      onClick={onClick}
      title={name}
      description={provider}
      suffix={
        <Badge
          variant={status === "enabled" ? "success" : "neutral"}
          text={status === "enabled" ? "启用" : "停用"}
        />
      }
    />
  );
}
