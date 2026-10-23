import { NextResponse } from "next/server";
import { createReservation } from "@/server/reservation-service";
import { publicError } from "@/server/service-error";
import { reservationSchema } from "@/server/validation";

export async function POST(request: Request) {
  try {
    const parsed = reservationSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_RESERVATION", message: "Please review your reservation details.", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });
    return NextResponse.json(await createReservation(parsed.data), { status: 201 });
  } catch (error) { const response = publicError(error); return NextResponse.json(response.body, { status: response.status }); }
}
