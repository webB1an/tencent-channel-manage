import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import type { TaskTemplate } from "@/lib/domain";

export function TaskTemplateCard({ template, selected, onClick }: { template: TaskTemplate; selected?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left u-press">
      <Card className={cn("transition-colors", selected && "border-primary bg-primary-soft")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg text-text">{template.name}</h3>
            <p className="mt-1 text-sm text-text-2">{template.description}</p>
          </div>
          <StatusBadge status={template.targetLevel} />
        </div>
      </Card>
    </button>
  );
}
