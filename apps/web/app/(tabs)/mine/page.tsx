"use client";

import { List, Toast } from "antd-mobile";
import { PageHeader } from "@/components/business/Mobile";

export default function MinePage() {
  return (
    <main className="page-pad">
      <PageHeader title="我的" />
      <List className="rounded-lg">
        <List.Item clickable extra=">" onClick={() => Toast.show({ content: "使用说明待接入" })}>使用说明</List.Item>
        <List.Item clickable extra=">" onClick={() => Toast.show({ content: "Token 获取说明待接入" })}>Token 获取说明</List.Item>
        <List.Item clickable extra=">" onClick={() => Toast.show({ content: "系统设置待接入" })}>系统设置</List.Item>
        <List.Item clickable extra=">" onClick={() => {
          localStorage.removeItem("tcm_disabled_task_ids");
          Toast.show({ content: "缓存已清理" });
        }}>清理缓存</List.Item>
        <List.Item clickable extra=">" onClick={() => Toast.show({ content: "关于项目待接入" })}>关于项目</List.Item>
      </List>
    </main>
  );
}
