"use client";

import { useEffect, useMemo, useState } from "react";
import { App, Button, Card, DatePicker, Empty, Select, Space, Spin, Statistic, message } from "antd";
import dayjs from "dayjs";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/money";
import type { LedgerEntry } from "@/lib/entries";
import type { LedgerTag } from "@/lib/tags";
import { EntryCard } from "./EntryCard";
import { EntryForm } from "./EntryForm";
import { EntryTable } from "./EntryTable";
import { ViewToggle, type ViewMode } from "./ViewToggle";

export function LedgerHomeClient({ initialDate }: { initialDate: string }) {
  const [messageApi] = message.useMessage();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [tags, setTags] = useState<LedgerTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState<number | undefined>();

  const summary = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        if (entry.type === "expense") acc.expense += entry.amount;
        if (entry.type === "income") acc.income += entry.amount;
        acc.count += 1;
        return acc;
      },
      { expense: 0, income: 0, count: 0 },
    );
  }, [entries]);

  async function loadData() {
    setLoading(true);
    const params = new URLSearchParams({ date: selectedDate });
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (tagFilter) params.set("tagId", String(tagFilter));

    try {
      const [entriesResponse, tagsResponse] = await Promise.all([fetch(`/api/entries?${params}`), fetch("/api/tags")]);
      if (!entriesResponse.ok || !tagsResponse.ok) throw new Error("加载失败");
      setEntries(await entriesResponse.json());
      setTags(await tagsResponse.json());
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, typeFilter, categoryFilter, tagFilter]);

  function openCreateForm() {
    setEditingEntry(null);
    setFormOpen(true);
  }

  function openEditForm(entry: LedgerEntry) {
    setEditingEntry(entry);
    setFormOpen(true);
  }

  async function handleSubmit(values: Record<string, unknown>) {
    const response = await fetch(editingEntry ? `/api/entries/${editingEntry.id}` : "/api/entries", {
      method: editingEntry ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? "保存失败");
    }

    messageApi.success("已保存");
    setFormOpen(false);
    setEditingEntry(null);
    await loadData();
  }

  async function handleDelete(id: number) {
    const response = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    if (!response.ok) {
      messageApi.error("删除失败");
      return;
    }
    messageApi.success("已删除");
    await loadData();
  }

  return (
    <>
      <div className="summary-grid">
        <Card>
          <Statistic title="支出" value={formatCurrency(summary.expense)} valueStyle={{ color: "#cf1322" }} />
        </Card>
        <Card>
          <Statistic title="收入" value={formatCurrency(summary.income)} valueStyle={{ color: "#389e0d" }} />
        </Card>
        <Card>
          <Statistic title="账目数量" value={summary.count} suffix="笔" />
        </Card>
      </div>

      <div className="content-card">
        <div className="toolbar">
          <DatePicker value={dayjs(selectedDate)} onChange={(date) => date && setSelectedDate(date.format("YYYY-MM-DD"))} />
          <Select
            value={typeFilter}
            style={{ width: 120 }}
            onChange={setTypeFilter}
            options={[
              { value: "all", label: "全部类型" },
              { value: "expense", label: "支出" },
              { value: "income", label: "收入" },
            ]}
          />
          <Select
            value={categoryFilter}
            style={{ width: 120 }}
            onChange={setCategoryFilter}
            options={[{ value: "all", label: "全部分类" }, ...CATEGORIES.map((category) => ({ value: category, label: category }))]}
          />
          <Select
            allowClear
            placeholder="标签"
            value={tagFilter}
            style={{ width: 140 }}
            onChange={setTagFilter}
            options={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
          />
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <Space style={{ marginLeft: "auto" }}>
            <Button icon={<ReloadOutlined />} onClick={loadData}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>
              添加账目
            </Button>
          </Space>
        </div>

        <Spin spinning={loading}>
          {entries.length === 0 ? (
            <Empty description="这一天还没有账目" />
          ) : viewMode === "card" ? (
            <div className="entry-grid">
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onEdit={openEditForm} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <EntryTable entries={entries} onEdit={openEditForm} onDelete={handleDelete} />
          )}
        </Spin>
      </div>

      <EntryForm open={formOpen} entry={editingEntry} tags={tags} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
    </>
  );
}
