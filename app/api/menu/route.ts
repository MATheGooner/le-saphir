import { NextResponse } from "next/server";
import { getMenu, getPopularMenuItems } from "@/server/menu-repository";
import { publicError } from "@/server/service-error";

export async function GET(request: Request) {
  try {
    const popular = new URL(request.url).searchParams.get("popular") === "true";
    return NextResponse.json({ items: popular ? await getPopularMenuItems() : await getMenu() });
  } catch (error) { const response = publicError(error); return NextResponse.json(response.body, { status: response.status }); }
}
