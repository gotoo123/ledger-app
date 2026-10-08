"use client";

import ReactECharts from "echarts-for-react";

type CategoryChartProps = {
  data: Array<{ category: string; amount: number; count: number }>;
};

function yuan(amount: number) {
  return Number((amount / 100).toFixed(2));
}

const palette = ["#1677ff", "#52c41a", "#faad14", "#eb2f96", "#722ed1", "#13c2c2", "#fa541c", "#2f54eb", "#a0d911"];

export function CategoryPieChart({ data }: CategoryChartProps) {
  const option = {
    color: palette,
    tooltip: {
      trigger: "item",
      formatter: (params: { name: string; value: number; percent: number }) => `${params.name}<br/>¥${params.value.toFixed(2)} (${params.percent}%)`,
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
    },
    series: [
      {
        name: "分类支出",
        type: "pie",
        radius: ["45%", "68%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          formatter: "{b}",
        },
        data: data.map((item) => ({ name: item.category, value: yuan(item.amount) })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 360 }} />;
}

export function CategoryBarChart({ data }: CategoryChartProps) {
  const option = {
    color: ["#1677ff"],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value: number) => `¥${Number(value).toFixed(2)}`,
    },
    grid: { left: 48, right: 24, top: 28, bottom: 48 },
    xAxis: {
      type: "category",
      data: data.map((item) => item.category),
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: "¥{value}" },
      splitLine: { lineStyle: { color: "#eef2f7" } },
    },
    series: [
      {
        name: "支出金额",
        type: "bar",
        barMaxWidth: 36,
        itemStyle: { borderRadius: [6, 6, 0, 0] },
        data: data.map((item) => yuan(item.amount)),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 320 }} />;
}
