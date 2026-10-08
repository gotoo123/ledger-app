import { NextResponse } from "next/server";
import { createEntry, listEntries } from "@/lib/entries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tagId = searchParams.get("tagId");
  const entries = listEntries({
    date: searchParams.get("date") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    tagId: tagId ? Number(tagId) : undefined,
  });
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const body = await request.json();
  const entry = createEntry(body);
  return NextResponse.json(entry, { status: 201 });
}
