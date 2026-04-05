import { NextResponse } from "next/server";
import { receipts } from "@/lib/drinks";

export function GET() {
  return NextResponse.json({ receipts });
}
