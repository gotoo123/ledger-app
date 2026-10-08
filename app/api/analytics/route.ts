import { NextResponse } from "next/server";
import { getCategoryStats, getSummary, getTrendStats } from "@/lib/analytics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  };

  return NextResponse.json({
    summary: getSummary(filters),
    categories: getCategoryStats(filters),
    trend: getTrendStats(filters),
  });
}
