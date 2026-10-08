"use client";

import { Segmented } from "antd";

export type ViewMode = "card" | "table";

export function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (value: ViewMode) => void }) {
  return (
    <Segmented
      value={value}
      onChange={(next) => onChange(next as ViewMode)}
      options={[
        { label: "卡片", value: "card" },
        { label: "表格", value: "table" },
      ]}
    />
  );
}
