import { Icon, type IconName } from "@/components/ui/icon";

interface ReviewItem { label: string; value: React.ReactNode }
interface ReviewGroup { title: string; items: ReviewItem[] }

export function ReviewSummary({ groups, serverNode }: { groups: ReviewGroup[]; serverNode?: string }) {
  return (
    <div className="space-y-4">
      {groups.map((g, gi) => (
        <section key={gi} className="rounded-lg border border-border bg-bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-[14px] font-semibold text-ink">
              <Icon name="check-circle" size={16} className="text-success" />
              {g.title}
            </h3>
            <span className="rounded border border-success/30 bg-success-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-success">
              READY
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12px]">
            {g.items.map((it, i) => (
              <div key={i}>
                <dt className="text-[10px] uppercase tracking-wider text-ink-faint">{it.label}</dt>
                <dd className="mt-0.5 truncate font-medium text-ink">{it.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {serverNode && (
        <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-ink to-[#0c0e16] p-4 text-white">
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 80% 20%, rgba(0, 110, 242, 0.4), transparent 50%)" }} />
          <div className="relative flex items-center gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-info-fixed">
              <Icon name="server" size={18} />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/60">Server Node</p>
              <p className="font-mono text-[14px] font-semibold">{serverNode}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
