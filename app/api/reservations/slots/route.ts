import { NextResponse } from "next/server";
import { z } from "zod";
import { availableReservationSlots } from "@/server/reservation-service";
import { publicError } from "@/server/service-error";

const querySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), partySize: z.coerce.number().int().min(1).max(8) });
export async function GET(request: Request) {
  try {
    const url = new URL(request.url); const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Choose a valid date and party size." } }, { status: 400 });
    return NextResponse.json({ slots: await availableReservationSlots(parsed.data.date, parsed.data.partySize) });
  } catch (error) { const response = publicError(error); return NextResponse.json(response.body, { status: response.status }); }
}
