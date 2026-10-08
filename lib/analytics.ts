import { getSqlite } from "./db";

const sqlite = getSqlite();

type AnalyticsFilters = {
  from?: string;
  to?: string;
};

type SummaryRow = {
  totalExpense: number | null;
  totalIncome: number | null;
  count: number;
};

function rangeWhere(filters: AnalyticsFilters) {
  const clauses: string[] = [];
  const params: string[] = [];

  if (filters.from) {
    clauses.push("date >= ?");
    params.push(`${filters.from}T00:00:00.000`);
  }

  if (filters.to) {
    clauses.push("date <= ?");
    params.push(`${filters.to}T23:59:59.999`);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

export function getSummary(filters: AnalyticsFilters = {}) {
  const { where, params } = rangeWhere(filters);
  const row = sqlite
    .prepare(
      `SELECT
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS totalExpense,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS totalIncome,
        COUNT(*) AS count
       FROM entries
       ${where}`,
    )
    .get(...params) as SummaryRow;

  return {
    totalExpense: row.totalExpense ?? 0,
    totalIncome: row.totalIncome ?? 0,
    count: row.count,
  };
}

export function getCategoryStats(filters: AnalyticsFilters = {}) {
  const { where, params } = rangeWhere(filters);
  return sqlite
    .prepare(
      `SELECT category, SUM(amount) AS amount, COUNT(*) AS count
       FROM entries
       ${where ? `${where} AND type = 'expense'` : "WHERE type = 'expense'"}
       GROUP BY category
       ORDER BY amount DESC`,
    )
    .all(...params) as Array<{ category: string; amount: number; count: number }>;
}

export function getTrendStats(filters: AnalyticsFilters = {}) {
  const { where, params } = rangeWhere(filters);
  return sqlite
    .prepare(
      `SELECT substr(date, 1, 10) AS day,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income
       FROM entries
       ${where}
       GROUP BY day
       ORDER BY day ASC`,
    )
    .all(...params) as Array<{ day: string; expense: number; income: number }>;
}
