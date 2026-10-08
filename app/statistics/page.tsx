"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, DatePicker, Empty, Spin, Statistic, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { AppHeader } from "@/components/AppHeader";
import { CategoryBarChart, CategoryPieChart } from "@/components/charts/CategoryCharts";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { formatCurrency } from "@/lib/money";

const { RangePicker } = DatePicker;

type AnalyticsData = {
  summary: {
    totalExpense: number;
    totalIncome: number;
    count: number;
  };
  categories: Array<{ category: string; amount: number; count: number }>;
  trend: Array<{ day: string; expense: number; income: number }>;
};

export default function StatisticsPage() {
  const [range, setRange] = useState<[string, string]>(() => {
    const end = dayjs();
    const start = end.startOf("month");
    return [start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD")];
  });
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const hasData = useMemo(() => Boolean(data && data.summary.count > 0), [data]);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      const params = new URLSearchParams({ from: range[0], to: range[1] });
      const response = await fetch(`/api/analytics?${params}`);
      setData(await response.json());
      setLoading(false);
    }
    void loadAnalytics();
  }, [range]);

  const categoryColumns: ColumnsType<{ category: string; amount: number; count: number }> = [
    { title: "分类", dataIndex: "category" },
    { title: "笔数", dataIndex: "count", align: "right" },
    { title: "金额", dataIndex: "amount", align: "right", render: (value: number) => formatCurrency(value) },
  ];

  return (
    <main className="page-shell">
      <AppHeader subtitle="按日期范围查看分类占比、趋势和分类金额" />
      <div className="toolbar">
        <RangePicker
          value={[dayjs(range[0]), dayjs(range[1])]}
          onChange={(value) => {
            if (value?.[0] && value[1]) setRange([value[0].format("YYYY-MM-DD"), value[1].format("YYYY-MM-DD")]);
          }}
        />
      </div>

      <Spin spinning={loading}>
        <div className="summary-grid">
          <Card>
            <Statistic title="支出" value={data ? formatCurrency(data.summary.totalExpense) : "¥0.00"} valueStyle={{ color: "#cf1322" }} />
          </Card>
          <Card>
            <Statistic title="收入" value={data ? formatCurrency(data.summary.totalIncome) : "¥0.00"} valueStyle={{ color: "#389e0d" }} />
          </Card>
          <Card>
            <Statistic title="账目数量" value={data?.summary.count ?? 0} suffix="笔" />
          </Card>
        </div>

        {!hasData ? (
          <Card>
            <Empty description="这个时间范围还没有账目" />
          </Card>
        ) : (
          <>
            <div className="chart-grid">
              <Card title="支出分类占比">
                <CategoryPieChart data={data?.categories ?? []} />
              </Card>
              <Card title="分类金额对比">
                <CategoryBarChart data={data?.categories ?? []} />
              </Card>
            </div>
            <Card title="每日趋势" style={{ marginTop: 16 }}>
              <TrendLineChart data={data?.trend ?? []} />
            </Card>
            <Card title="分类明细" style={{ marginTop: 16 }}>
              <Table rowKey="category" columns={categoryColumns} dataSource={data?.categories ?? []} pagination={false} />
            </Card>
          </>
        )}
      </Spin>
    </main>
  );
}
