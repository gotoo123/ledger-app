"use client";

import { Button, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { formatCurrency } from "@/lib/money";
import type { LedgerEntry } from "@/lib/entries";

export function EntryTable({ entries, onEdit, onDelete }: { entries: LedgerEntry[]; onEdit: (entry: LedgerEntry) => void; onDelete: (id: number) => void }) {
  const columns: ColumnsType<LedgerEntry> = [
    {
      title: "时间",
      dataIndex: "date",
      render: (value: string) => new Date(value).toLocaleString("zh-CN"),
    },
    {
      title: "类型",
      dataIndex: "type",
      render: (type: LedgerEntry["type"]) => <Tag color={type === "expense" ? "red" : "green"}>{type === "expense" ? "支出" : "收入"}</Tag>,
    },
    {
      title: "金额",
      dataIndex: "amount",
      align: "right",
      render: (amount: number, row) => <span className={row.type === "expense" ? "amount-expense" : "amount-income"}>{formatCurrency(amount)}</span>,
    },
    { title: "分类", dataIndex: "category" },
    { title: "标题", dataIndex: "title", render: (value: string | null) => value || "-" },
    { title: "支付方式", dataIndex: "paymentMethod", render: (value: string | null) => value || "-" },
    {
      title: "标签",
      dataIndex: "tags",
      render: (_value: unknown, row) => row.tags.map((tag) => <Tag key={tag.id} color={tag.color}>{tag.name}</Tag>),
    },
    {
      title: "操作",
      render: (_value: unknown, row) => (
        <Space>
          <Button size="small" onClick={() => onEdit(row)}>
            编辑
          </Button>
          <Popconfirm title="确认删除这笔账目？" okText="删除" cancelText="取消" onConfirm={() => onDelete(row.id)}>
            <Button size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" columns={columns} dataSource={entries} pagination={false} scroll={{ x: 900 }} />;
}
