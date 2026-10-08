import { NextResponse } from "next/server";
import { deleteEntry, getEntry, updateEntry } from "@/lib/entries";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const entry = getEntry(Number(id));
  if (!entry) return NextResponse.json({ message: "Entry not found" }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();
  const entry = updateEntry(Number(id), body);
  if (!entry) return NextResponse.json({ message: "Entry not found" }, { status: 404 });
  return NextResponse.json(entry);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = deleteEntry(Number(id));
  if (!deleted) return NextResponse.json({ message: "Entry not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
