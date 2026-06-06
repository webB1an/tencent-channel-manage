"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, TextArea, Toast } from "antd-mobile";
import { accountService, type Account } from "@/lib/domain";
import { BottomActionBar, FieldLabel, PageHeader } from "@/components/business/Mobile";

export default function EditAccountPage({ params }: { params: { accountId: string } }) {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [token, setToken] = useState("");
  const [nickname, setNickname] = useState("");
  const [remark, setRemark] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    accountService.getAccountDetail(params.accountId).then((a) => {
      setAccount(a);
      setNickname(a?.nickname ?? "");
      setRemark(a?.remark ?? "");
    }).catch((e) => Toast.show({ content: (e as Error).message }));
  }, [params.accountId]);

  async function save() {
    setBusy(true);
    try {
      await accountService.updateAccount(params.accountId, { token, nickname, remark });
      Toast.show({ content: "修改已保存" });
      router.replace(`/accounts/${params.accountId}`);
    } catch (e) {
      Toast.show({ content: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page-pad pb-28">
      <PageHeader title="编辑账号" backHref={`/accounts/${params.accountId}`} />
      <Card className="adm-card-mobile">
        <FieldLabel>QQ号</FieldLabel>
        <Input value={account?.qq ?? ""} disabled placeholder="不可修改" />
        <div className="mt-4">
          <FieldLabel>Token</FieldLabel>
          <TextArea value={token} onChange={setToken} placeholder="留空表示不修改 Token" rows={4} />
        </div>
        <div className="mt-4">
          <FieldLabel>昵称</FieldLabel>
          <Input value={nickname} onChange={setNickname} placeholder="方便识别账号，可不填" clearable />
        </div>
        <div className="mt-4">
          <FieldLabel>备注</FieldLabel>
          <TextArea value={remark} onChange={setRemark} placeholder="自定义备注，可不填" rows={3} />
        </div>
      </Card>
      <BottomActionBar>
        <Button block color="primary" size="large" loading={busy} onClick={save}>保存修改</Button>
      </BottomActionBar>
    </main>
  );
}

