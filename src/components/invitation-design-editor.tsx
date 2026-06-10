"use client";

import { useMemo, useState } from "react";
import { Eye, Flower2, LockKeyhole, Palette, Trash2, Type, WandSparkles } from "lucide-react";
import { TemplateCanvas } from "@/components/template-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getLayerPermissions } from "@/lib/template-document";
import type { TemplateDocument, TemplateLayer, WeddingFormData } from "@/types";
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
  document: TemplateDocument;
  data: Partial<WeddingFormData>;
  onChange: (document: TemplateDocument) => void;
};

export function InvitationDesignEditor({ document, data, onChange }: InvitationDesignEditorProps) {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const selectedLayer = useMemo(
    () => document.layers.find((layer) => layer.id === selectedLayerId) ?? null,
    [document.layers, selectedLayerId]
  );

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
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-950/10 bg-[#f8f4ec] p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Creative canvas</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Layerni bosing. Ruxsat bo'lsa sudrang, resize yoki rotate qiling.
            </p>
          </div>
          <span className="rounded-md bg-emerald-900 px-2.5 py-1 text-xs font-semibold text-white">
            {document.layers.length} layer
          </span>
        </div>
      </div>

      <div className="overflow-auto rounded-xl bg-[#222925] p-3">
        <div className="mx-auto w-fit">
          <TemplateCanvas
            document={document}
            data={data}
            selectedLayerId={selectedLayerId}
            interactive
            permissionMode="user"
            snapToGrid={false}
            scale={0.34}
            onSelectLayer={setSelectedLayerId}
            onChangeLayer={updateLayer}
          />
        </div>
      </div>

      {selectedLayer ? (
        <UserLayerInspector
          layer={selectedLayer}
          onChange={(patch) => updateLayer(selectedLayer.id, patch)}
          onDelete={() => removeLayer(selectedLayer.id)}
        />
      ) : (
        <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
          Edit qilish uchun canvas ichidagi layerni tanlang.
        </div>
      )}
    </div>
  );
}

function UserLayerInspector({
  layer,
  onChange,
  onDelete
}: {
  layer: TemplateLayer;
  onChange: (patch: Partial<TemplateLayer>) => void;
  onDelete: () => void;
}) {
  const permissions = getLayerPermissions(layer);
  const availableActions = [
    permissions.editable ? "Kontent" : null,
    permissions.movable ? "Move" : null,
    permissions.resizable ? "Resize" : null,
    permissions.rotatable ? "Rotate" : null,
    permissions.styleEditable ? "Style" : null
  ].filter((action): action is string => Boolean(action));

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            {layer.type === "text" ? (
              <Type className="h-4 w-4" />
            ) : layer.type === "ornament" ? (
              <Flower2 className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {layer.name}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {availableActions.map((action) => (
              <span key={action} className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">
                {action}
              </span>
            ))}
            {availableActions.length === 0 ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <LockKeyhole className="h-3.5 w-3.5" />
                Bu layer qulflangan
              </span>
            ) : null}
          </div>
        </div>
        {permissions.deletable ? (
          <Button type="button" variant="destructive" size="icon" onClick={onDelete} aria-label="Layerni o'chirish">
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {layer.type === "text" && permissions.editable ? (
        layer.binding ? (
          <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
            Bu matn <strong>{layer.binding}</strong> maydoniga bog'langan. Chapdagi formadan o'zgartiring.
          </p>
        ) : (
          <div>
            <Label>Matn</Label>
            <Textarea
              className="mt-2"
              value={layer.text}
              onChange={(event) => onChange({ text: event.target.value })}
            />
          </div>
        )
      ) : null}

      {permissions.styleEditable ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {layer.type === "text" ? (
            <>
              <ColorField label="Matn rangi" value={layer.color} onChange={(color) => onChange({ color })} />
              <div>
                <Label>Font size</Label>
                <Input
                  className="mt-2"
                  type="number"
                  min={8}
                  value={layer.fontSize}
                  onChange={(event) => onChange({ fontSize: Number(event.target.value) })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Font</Label>
                <select
                  value={layer.fontFamily}
                  onChange={(event) => onChange({ fontFamily: event.target.value })}
                  className="mt-2 h-10 w-full rounded-md border bg-white px-3 text-sm"
                >
                  {editableFontFamilies.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
          {layer.type === "shape" ? (
            <ColorField label="Shakl rangi" value={layer.fill} onChange={(fill) => onChange({ fill })} />
          ) : null}
          {layer.type === "ornament" ? (
            <>
              <ColorField label="Asosiy rang" value={layer.color} onChange={(color) => onChange({ color })} />
              <ColorField
                label="Ikkinchi rang"
                value={layer.secondaryColor}
                onChange={(secondaryColor) => onChange({ secondaryColor })}
              />
            </>
          ) : null}
          <div className="sm:col-span-2 rounded-md border bg-muted/30 p-3">
            <Label className="flex items-center gap-2">
              <WandSparkles className="h-3.5 w-3.5" />
              Effects
            </Label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Blur</Label>
                <Input
                  className="mt-1.5"
                  type="number"
                  min={0}
                  max={40}
                  value={layer.blur ?? 0}
                  onChange={(event) => onChange({ blur: Math.max(0, Number(event.target.value)) })}
                />
              </div>
              <label className="flex items-center gap-2 self-end rounded-md border bg-white px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(layer.shadow)}
                  onChange={(event) =>
                    onChange({
                      shadow: event.target.checked
                        ? { color: "rgba(24, 30, 26, 0.3)", blur: 24, x: 0, y: 12 }
                        : undefined
                    })
                  }
                />
                Yumshoq soya
              </label>
            </div>
          </div>
        </div>
      ) : null}

      {layer.type === "image" && permissions.editable ? (
        <div>
          <Label>Rasm URL</Label>
          <Input
            className="mt-2"
            value={layer.src}
            onChange={(event) => onChange({ src: event.target.value })}
          />
        </div>
      ) : null}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label className="flex items-center gap-2">
        <Palette className="h-3.5 w-3.5" />
        {label}
      </Label>
      <div className="mt-2 flex gap-2">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff"}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-11 rounded-md border bg-white p-1"
        />
        <Input value={value} onChange={(event) => onChange(event.target.value)} className={cn("font-mono")} />
      </div>
    </div>
  );
}
