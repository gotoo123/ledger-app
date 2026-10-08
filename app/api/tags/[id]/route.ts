import { NextResponse } from "next/server";
import { deleteTag, getTag, updateTag } from "@/lib/tags";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const tag = getTag(Number(id));
  if (!tag) return NextResponse.json({ message: "Tag not found" }, { status: 404 });
  return NextResponse.json(tag);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();
  const tag = updateTag(Number(id), body);
  if (!tag) return NextResponse.json({ message: "Tag not found" }, { status: 404 });
  return NextResponse.json(tag);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = deleteTag(Number(id));
  if (!deleted) return NextResponse.json({ message: "Tag not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
