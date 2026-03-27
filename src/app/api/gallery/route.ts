import { NextRequest, NextResponse } from "next/server";
import { getGalleryPage } from "@/lib/gallery-store";

/** GET /api/gallery?page=1 — return paginated gallery metadata */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);

  const result = getGalleryPage(page);
  return NextResponse.json(result);
}
