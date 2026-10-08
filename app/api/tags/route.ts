import { NextResponse } from "next/server";
import { createTag, listTags } from "@/lib/tags";

export async function GET() {
  return NextResponse.json(listTags());
}

export async function POST(request: Request) {
  const body = await request.json();
  const tag = createTag(body);
  return NextResponse.json(tag, { status: 201 });
}
