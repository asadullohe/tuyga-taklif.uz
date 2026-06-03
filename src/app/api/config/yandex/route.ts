import { NextResponse } from "next/server";

function getYandexMapsApiKey() {
  return (process.env.YANDEX_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? "").trim();
}

export function GET() {
  const apiKey = getYandexMapsApiKey();

  return NextResponse.json({
    apiKey: apiKey || null
  });
}
