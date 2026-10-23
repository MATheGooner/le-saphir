import { NextResponse } from "next/server";
import { createOrder } from "@/server/order-service";
import { publicError } from "@/server/service-error";
import { orderSchema } from "@/server/validation";

export async function POST(request: Request) {
  try {
    const parsed = orderSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_ORDER", message: "Please review your order details.", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });
    return NextResponse.json(await createOrder(parsed.data), { status: 201 });
  } catch (error) { const response = publicError(error); return NextResponse.json(response.body, { status: response.status }); }
}
