"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QrCodeCard({ value }: { value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>QR kod</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="inline-flex rounded-md border bg-white p-3">
          <QRCodeCanvas value={value} size={144} />
        </div>
      </CardContent>
    </Card>
  );
}
