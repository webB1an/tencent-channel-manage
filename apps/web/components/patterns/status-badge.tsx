import { Badge } from "@/components/ui/badge";

const labelMap: Record<string, string> = {
  normal: "正常", expired: "已失效", running: "执行中", error: "异常",
  enabled: "启用", disabled: "停用", success: "成功", failed: "失败", pending: "等待中",
  ACTIVE: "正常", INVALID: "失效", REVOKED: "撤销",
  account: "账号级", channel: "频道级",
};

export function StatusBadge({ status }: { status: string }) {
  const variant =
    ["normal", "enabled", "success", "ACTIVE"].includes(status) ? "success" :
    ["expired", "failed", "error", "INVALID", "REVOKED"].includes(status) ? "danger" :
    "warning";
  return <Badge variant={variant} text={labelMap[status] ?? status} />;
}
