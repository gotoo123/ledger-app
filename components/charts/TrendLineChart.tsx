"use client";

import ReactECharts from "echarts-for-react";

type TrendPoint = {
  day: string;
  expense: number;
  income: number;
};

function yuan(amount: number) {
  return Number((amount / 100).toFixed(2));
}

export function TrendLineChart({ data }: { data: TrendPoint[] }) {
  const option = {
    color: ["#cf1322", "#389e0d"],
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number) => `¥${Number(value).toFixed(2)}`,
    },
    legend: { bottom: 0 },
    grid: { left: 48, right: 24, top: 28, bottom: 56 },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.map((item) => item.day),
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: "¥{value}" },
      splitLine: { lineStyle: { color: "#eef2f7" } },
    },
    series: [
      {
        name: "支出",
        type: "line",
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 2 },
        data: data.map((item) => yuan(item.expense)),
      },
      {
        name: "收入",
        type: "line",
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 2 },
        data: data.map((item) => yuan(item.income)),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 340 }} />;
}
