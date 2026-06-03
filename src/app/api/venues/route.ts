import { NextResponse } from "next/server";
import { venueOptions } from "@/lib/venues";

export function GET() {
  return NextResponse.json({ venues: venueOptions });
}
