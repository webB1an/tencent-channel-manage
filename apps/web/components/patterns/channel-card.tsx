import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { Channel } from "@/lib/domain";

export function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Link href={`/accounts/${channel.accountId}/channels/${channel.id}`} className="block">
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-2xl text-text">{channel.name}</h3>
            <p className="mt-1 text-xs text-text-3">ID：{channel.channelId}</p>
          </div>
          <span className="flex items-center gap-1 text-sm text-text-3">
            进入 <Icon name="chevron-right" size={12} />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Info label="状态" value="正常" />
          <Info label="板块" value={`${channel.sectionCount ?? 0}`} />
          <Info label="任务" value={`${channel.scheduledTaskCount ?? 0}`} />
        </div>
      </Card>
    </Link>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-bg-page px-3 py-2">
      <dt className="text-xs text-text-3">{label}</dt>
      <dd className="mt-0.5 font-medium text-text">{value}</dd>
    </div>
  );
}
