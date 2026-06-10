"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Crop,
  Eye,
  Flower2,
  ImagePlus,
  Loader2,
  LockKeyhole,
  Palette,
  Trash2,
  Type,
  Upload
} from "lucide-react";
import { TemplateCanvas } from "@/components/template-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getLayerPermissions, normalizeTemplateDocument } from "@/lib/template-document";
import type { TemplateDocument, TemplateImageLayer, TemplateLayer, WeddingFormData } from "@/types";
import { cn } from "@/lib/utils";

const editableFontFamilies = [
  "Cormorant Garamond",
  "Playfair Display",
  "Great Vibes",
  "Cinzel",
  "Marcellus",
  "Montserrat",
  "Georgia",
  "Baskerville"
];

type InvitationDesignEditorProps = {
  invitationId: string;
  document: TemplateDocument;
  data: Partial<WeddingFormData>;
  onChange: (document: TemplateDocument) => void;
};

export function InvitationDesignEditor({
  invitationId,
  document: sourceDocument,
  data,
  onChange
}: InvitationDesignEditorProps) {
  const document = useMemo(() => normalizeTemplateDocument(sourceDocument), [sourceDocument]);
  const canvasShellRef = useRef<HTMLDivElement>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.3);
  const [mobileTab, setMobileTab] = useState<"preview" | "edit">("preview");
  const selectedLayer = document.layers.find((layer) => layer.id === selectedLayerId) ?? null;

  useEffect(() => {
    const container = canvasShellRef.current;
    if (!container) return;
    const update = () => setScale(Math.min(0.38, Math.max(0.2, (container.clientWidth - 32) / document.width)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [document.width]);

  const updateLayer = (id: string, patch: Partial<TemplateLayer>) => {
    onChange({
      ...document,
      layers: document.layers.map((layer) =>
        layer.id === id ? ({ ...layer, ...patch } as TemplateLayer) : layer
      )
    });
  };

  const removeLayer = (id: string) => {
    onChange({ ...document, layers: document.layers.filter((layer) => layer.id !== id) });
    setSelectedLayerId(null);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d9cdb9] bg-[#f6f1e8] shadow-[0_24px_80px_rgba(43,35,24,.12)]">
      <div className="flex items-center justify-between border-b border-[#ded4c4] px-4 py-3">
        <div>
          <p className="font-['Cormorant_Garamond'] text-lg font-bold text-[#292b27]">Taklifnoma dizayni</p>
          <p className="text-[11px] text-[#7d7466]">Faqat dizayner ochgan elementlarni o‘zgartirasiz</p>
        </div>
        <span className="rounded-full bg-[#173f31] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {document.layers.length} layer
        </span>
      </div>

      <div className="grid grid-cols-2 border-b border-[#ded4c4] md:hidden">
        <button type="button" onClick={() => setMobileTab("preview")} className={cn("px-3 py-2 text-xs font-semibold", mobileTab === "preview" && "bg-[#173f31] text-white")}>Preview</button>
        <button type="button" onClick={() => setMobileTab("edit")} className={cn("px-3 py-2 text-xs font-semibold", mobileTab === "edit" && "bg-[#173f31] text-white")}>Edit</button>
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_270px]">
        <div
          ref={canvasShellRef}
          className={cn(
            "min-w-0 overflow-auto bg-[#242b27] p-4",
            mobileTab !== "preview" && "hidden md:block"
          )}
        >
          <div className="mx-auto w-fit">
            <TemplateCanvas
              document={document}
              data={data}
              selectedLayerId={selectedLayerId}
              interactive
              permissionMode="user"
              snapToGrid={false}
              scale={scale}
              onSelectLayer={(id) => {
                setSelectedLayerId(id);
                if (id) setMobileTab("edit");
              }}
              onChangeLayer={updateLayer}
            />
          </div>
        </div>

        <div className={cn("max-h-[720px] overflow-y-auto bg-[#fbf8f2] p-4", mobileTab !== "edit" && "hidden md:block")}>
          {selectedLayer ? (
            <UserLayerInspector
              invitationId={invitationId}
              layer={selectedLayer}
              onChange={(patch) => updateLayer(selectedLayer.id, patch)}
              onDelete={() => removeLayer(selectedLayer.id)}
            />
          ) : (
            <div className="grid min-h-56 place-items-center rounded-xl border border-dashed border-[#d7cab6] p-5 text-center">
              <div>
                <Palette className="mx-auto h-6 w-6 text-[#a8884d]" />
                <p className="mt-3 text-sm font-semibold text-[#33352f]">Element tanlang</p>
                <p className="mt-1 text-xs leading-5 text-[#857b6c]">Canvas ichidagi matn yoki rasmni bosing.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserLayerInspector({
  invitationId,
  layer,
  onChange,
  onDelete
}: {
  invitationId: string;
  layer: TemplateLayer;
  onChange: (patch: Partial<TemplateLayer>) => void;
  onDelete: () => void;
}) {
  const permissions = getLayerPermissions(layer);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const editable =
    permissions.editable ||
    permissions.styleEditable ||
    permissions.movable ||
    permissions.resizable ||
    permissions.rotatable ||
    permissions.cropEditable ||
    permissions.deletable;

  const uploadImage = async (file?: File) => {
    if (!file || layer.type !== "image") return;
    setUploading(true);
    setUploadError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch(`/api/invitations/${invitationId}/assets`, { method: "POST", body });
      const result = await response.json() as { url?: string; message?: string };
      if (!response.ok || !result.url) throw new Error(result.message ?? "Rasm yuklanmadi");
      onChange({ src: result.url, focalX: 0.5, focalY: 0.5 } as Partial<TemplateImageLayer>);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Rasm yuklanmadi");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-semibold text-[#30332d]">
            {layer.type === "text" ? <Type className="h-4 w-4" /> : layer.type === "ornament" ? <Flower2 className="h-4 w-4" /> : layer.type === "image" ? <ImagePlus className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {layer.name}
          </div>
          {!editable ? (
            <span className="mt-2 flex items-center gap-1 text-xs text-[#8b8172]">
              <LockKeyhole className="h-3.5 w-3.5" />
              Shablon tomonidan himoyalangan
            </span>
          ) : null}
        </div>
        {permissions.deletable ? (
          <Button type="button" variant="destructive" size="icon" onClick={onDelete} aria-label="Layerni o'chirish">
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {layer.type === "text" && permissions.editable ? (
        layer.binding ? (
          <p className="rounded-lg border border-[#ded4c4] bg-white px-3 py-2 text-xs leading-5 text-[#776e61]">
            Bu matn <strong>{layer.binding}</strong> maydoniga bog‘langan. Asosiy formadan o‘zgartiring.
          </p>
        ) : (
          <div>
            <Label>Matn</Label>
            <Textarea className="mt-2 bg-white" value={layer.text} onChange={(event) => onChange({ text: event.target.value })} />
          </div>
        )
      ) : null}

      {layer.type === "image" && permissions.editable ? (
        <div>
          <Label>Shaxsiy rasm</Label>
          <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#b9a47c] bg-white px-3 py-5 text-xs font-semibold text-[#5f533d] hover:bg-[#f1e8d9]">
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={uploading} onChange={(event) => void uploadImage(event.target.files?.[0])} />
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Yuklanmoqda..." : "Rasm tanlash"}
          </label>
          {uploadError ? <p className="mt-2 text-xs text-red-600">{uploadError}</p> : null}
        </div>
      ) : null}

      {layer.type === "image" && permissions.cropEditable ? (
        <div className="rounded-xl border border-[#ded4c4] bg-white p-3">
          <Label className="flex items-center gap-2"><Crop className="h-3.5 w-3.5" /> Rasm markazi</Label>
          <RangeField label="Gorizontal" value={(layer.focalX ?? 0.5) * 100} onChange={(value) => onChange({ focalX: value / 100 })} />
          <RangeField label="Vertikal" value={(layer.focalY ?? 0.5) * 100} onChange={(value) => onChange({ focalY: value / 100 })} />
        </div>
      ) : null}

      {permissions.styleEditable ? (
        <div className="space-y-3 border-t border-[#ded4c4] pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a744c]">Style</p>
          {layer.type === "text" ? (
            <>
              <ColorField label="Matn rangi" value={layer.color} onChange={(color) => onChange({ color })} />
              <div>
                <Label>Font</Label>
                <select value={layer.fontFamily} onChange={(event) => onChange({ fontFamily: event.target.value })} className="mt-2 h-10 w-full rounded-md border border-[#d9cdb9] bg-white px-3 text-sm">
                  {editableFontFamilies.map((font) => <option key={font}>{font}</option>)}
                </select>
              </div>
              <div>
                <Label>Font size</Label>
                <Input className="mt-2 bg-white" type="number" min={8} value={layer.fontSize} onChange={(event) => onChange({ fontSize: Number(event.target.value) })} />
              </div>
            </>
          ) : null}
          {layer.type === "shape" ? <ColorField label="Shakl rangi" value={layer.fill.startsWith("#") ? layer.fill : "#ffffff"} onChange={(fill) => onChange({ fill })} /> : null}
          {layer.type === "ornament" ? (
            <>
              <ColorField label="Asosiy rang" value={layer.color} onChange={(color) => onChange({ color })} />
              <ColorField label="Ikkinchi rang" value={layer.secondaryColor} onChange={(secondaryColor) => onChange({ secondaryColor })} />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function RangeField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="mt-3 block text-[11px] text-[#766c5e]">
      <span className="flex justify-between"><span>{label}</span><span>{Math.round(value)}%</span></span>
      <input className="mt-1.5 w-full accent-[#173f31]" type="range" min={0} max={100} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex h-10 items-center gap-2 rounded-md border border-[#d9cdb9] bg-white px-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-6 w-7 border-0 bg-transparent p-0" />
        <Input value={value} onChange={(event) => onChange(event.target.value)} className="h-8 border-0 px-1 shadow-none focus-visible:ring-0" />
      </div>
    </div>
  );
}
