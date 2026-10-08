"use client";

import { Button, Popconfirm, Space, Tag, Typography } from "antd";
import { formatCurrency } from "@/lib/money";
import type { LedgerEntry } from "@/lib/entries";

const typeLabels = {
  expense: "支出",
  income: "收入",
};

export function EntryCard({ entry, onEdit, onDelete }: { entry: LedgerEntry; onEdit: (entry: LedgerEntry) => void; onDelete: (id: number) => void }) {
  const amountClass = entry.type === "expense" ? "amount-expense" : "amount-income";
  return (
    <article className="entry-card">
      <div className="entry-card-header">
        <div>
          <Typography.Text strong>{entry.title || entry.category}</Typography.Text>
          <div className="muted">{new Date(entry.date).toLocaleString("zh-CN")}</div>
        </div>
        <Typography.Title level={4} className={amountClass} style={{ margin: 0 }}>
          {entry.type === "expense" ? "-" : "+"}
          {formatCurrency(entry.amount)}
        </Typography.Title>
      </div>

      <Space wrap size={[6, 6]}>
        <Tag color={entry.type === "expense" ? "red" : "green"}>{typeLabels[entry.type]}</Tag>
        <Tag>{entry.category}</Tag>
        {entry.paymentMethod ? <Tag color="blue">{entry.paymentMethod}</Tag> : null}
        {entry.tags.map((tag) => (
          <Tag key={tag.id} color={tag.color}>
            {tag.name}
          </Tag>
        ))}
      </Space>

      {entry.note ? <p className="muted">{entry.note}</p> : null}

      <Space style={{ marginTop: 12 }}>
        <Button size="small" onClick={() => onEdit(entry)}>
          编辑
        </Button>
        <Popconfirm title="确认删除这笔账目？" okText="删除" cancelText="取消" onConfirm={() => onDelete(entry.id)}>
          <Button size="small" danger>
            删除
          </Button>
        </Popconfirm>
      </Space>
    </article>
  );
}
