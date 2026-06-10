"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlignCenter,
  AlignHorizontalDistributeCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalDistributeCenter,
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Flower2,
  Group,
  ImagePlus,
  Layers3,
  Loader2,
  Lock,
  Minus,
  MousePointer2,
  Palette,
  Plus,
  Redo2,
  Save,
  Square,
  Timer,
  Trash2,
  Type,
  Undo2,
  Ungroup,
  Unlock,
  Upload,
  WandSparkles
} from "lucide-react";
import { TemplateCanvas } from "@/components/template-canvas";
import { FontPicker } from "@/components/font-picker";
import { TemplateOrnament } from "@/components/template-ornament";
import { TemplateTimeline } from "@/components/template-timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDesignEditor } from "@/hooks/use-design-editor";
import {
  cloneStarterTemplateDocument,
  defaultLayerPermissions,
  getLayerPermissions,
  templateTextBindings
} from "@/lib/template-document";
import type {
  OrnamentKind,
  TemplateCountdownLayer,
  TemplateImageLayer,
  TemplateLayer,
  TemplateOrnamentLayer,
  TemplateShapeLayer,
  TemplateTextLayer,
  InvitationTemplate
} from "@/types";
import { cn } from "@/lib/utils";

const ornamentPresets: Array<{
  kind: OrnamentKind;
  label: string;
  collection: string;
  color: string;
  secondaryColor: string;
}> = [
  { kind: "floral-corner", label: "Botanical Corner", collection: "Maison Flora", color: "#856735", secondaryColor: "#eadfc8" },
  { kind: "olive-branch", label: "Olive Atelier", collection: "Tuscan Vows", color: "#53664b", secondaryColor: "#dce3cf" },
  { kind: "royal-divider", label: "Royal Divider", collection: "Palais d'Or", color: "#a67b2e", secondaryColor: "#f1dfb4" },
  { kind: "islamic-arch", label: "Samarkand Arch", collection: "Silk Road", color: "#947136", secondaryColor: "#e8d7aa" },
  { kind: "art-deco-fan", label: "Deco Nocturne", collection: "Gatsby 1925", color: "#b38b42", secondaryColor: "#e6d3a5" },
  { kind: "sparkle-cluster", label: "Celestial Dust", collection: "Minuit", color: "#a47c37", secondaryColor: "#f0dfb7" },
  { kind: "wax-seal", label: "Maison Seal", collection: "Heritage", color: "#7e2f32", secondaryColor: "#c98b78" },
  { kind: "double-ring", label: "Eternal Rings", collection: "Joaillerie", color: "#a67c36", secondaryColor: "#ead7a6" }
];

type UploadedAsset = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
};

type LeftTab = "elements" | "assets" | "layers";

type TemplateStudioClientProps = {
  initialTemplate?: InvitationTemplate;
};

export function TemplateStudioClient({ initialTemplate }: TemplateStudioClientProps = {}) {
  const router = useRouter();
  const editor = useDesignEditor(initialTemplate?.designDocument ?? cloneStarterTemplateDocument());
  const [leftTab, setLeftTab] = useState<LeftTab>("elements");
  const [zoom, setZoom] = useState(0.34);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [playbackMs, setPlaybackMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [name, setName] = useState(initialTemplate?.name ?? "Yangi premium shablon");
  const [description, setDescription] = useState(
    initialTemplate?.description ?? "Layer-based, to'liq tahrirlanadigan to'y taklifnomasi."
  );
  const [status, setStatus] = useState<"active" | "inactive">(initialTemplate?.status ?? "active");
  const [revision, setRevision] = useState(initialTemplate?.revision ?? 1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [assetError, setAssetError] = useState("");
  const exportCanvasRef = useRef<(() => string) | null>(null);

  const selectedLayer = editor.selectedLayers.length === 1 ? editor.selectedLayers[0] : null;
  const finishPlayback = useCallback(() => setPlaying(false), []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/assets", { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json() as { assets?: UploadedAsset[]; message?: string };
        if (!response.ok) throw new Error(result.message ?? "Assetlar olinmadi");
        setAssets(result.assets ?? []);
      })
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") setAssetError(error.message);
      });
    return () => controller.abort();
  }, []);

  const addLayer = (type: "text" | "shape" | "image" | "countdown") => {
    const id = `${type}-${crypto.randomUUID()}`;
    const base = {
      id,
      name:
        type === "text"
          ? "Yangi matn"
          : type === "shape"
            ? "Yangi shakl"
            : type === "countdown"
              ? "To'ygacha sanoq"
              : "Yangi rasm",
      x: 290,
      y: 780,
      width: 500,
      height: type === "text" ? 160 : type === "countdown" ? 260 : 360,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      permissions: { ...defaultLayerPermissions }
    };
    let layer: TemplateLayer;
    if (type === "countdown") {
      layer = {
        ...base,
        type,
        x: 140,
        y: 1320,
        width: 800,
        height: 260,
        title: "Bizning unutilmas kunimizgacha",
        titleColor: "#7d6a49",
        titleFontFamily: "Cormorant Garamond",
        titleFontSize: 28,
        titleFontWeight: 600,
        titleLetterSpacing: 1,
        titleAlign: "center",
        titleMarginBottom: 12,
        color: "#173f31",
        labelColor: "#7d6a49",
        panelColor: "#fffdf8",
        fontFamily: "Cormorant Garamond",
        valueFontSize: 72,
        valueFontWeight: 700,
        labelFontSize: 22,
        labelFontWeight: 500,
        labelLetterSpacing: 0,
        gap: 14,
        radius: 22,
        panelStroke: "#ded4c4",
        panelStrokeWidth: 1,
        showSeconds: true,
        timezoneOffsetMinutes: 300,
        permissions: {
          editable: false,
          movable: false,
          resizable: false,
          rotatable: false,
          deletable: false,
          styleEditable: false,
          cropEditable: false
        }
      };
    } else {
      layer =
        type === "text"
        ? {
            ...base,
            type,
            text: "Yangi matn",
            color: "#1f2b25",
            fontFamily: "Cormorant Garamond",
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: 0,
            align: "center"
          }
        : type === "shape"
          ? {
              ...base,
              type,
              fill: "#e8dcc5",
              stroke: "#96733b",
              strokeWidth: 1,
              radius: 28
            }
          : {
              ...base,
              type,
              src: "",
              fit: "cover",
              radius: 24
            };
    }
    editor.commitDocument({ ...editor.documentRef.current, layers: [...editor.documentRef.current.layers, layer] });
    editor.setSelectedLayerIds([id]);
  };

  const addOrnament = (preset: (typeof ornamentPresets)[number]) => {
    const id = `ornament-${crypto.randomUUID()}`;
    const layer: TemplateOrnamentLayer = {
      id,
      name: preset.label,
      type: "ornament",
      ornament: preset.kind,
      x: preset.kind === "royal-divider" ? 240 : 80,
      y: preset.kind === "royal-divider" ? 350 : 90,
      width: preset.kind === "royal-divider" ? 600 : 300,
      height: preset.kind === "royal-divider" ? 100 : 300,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      permissions: { ...defaultLayerPermissions },
      color: preset.color,
      secondaryColor: preset.secondaryColor,
      strokeWidth: 2.4
    };
    editor.commitDocument({ ...editor.documentRef.current, layers: [...editor.documentRef.current.layers, layer] });
    editor.setSelectedLayerIds([id]);
  };

  const uploadAsset = async (file?: File, target: "library" | "layer" | "background" = "layer") => {
    if (!file) return undefined;
    setIsUploading(true);
    setAssetError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/assets", { method: "POST", body });
      const result = await response.json() as { asset?: UploadedAsset; message?: string };
      if (!response.ok || !result.asset) throw new Error(result.message ?? "Asset yuklanmadi");
      const asset = result.asset;
      setAssets((current) => [asset, ...current]);
      if (target === "background") {
        editor.commitDocument({
          ...editor.documentRef.current,
          backgroundImage: { src: asset.url, fit: "cover", position: "center", opacity: 1 }
        });
      }
      if (target === "layer") addAssetLayer(asset);
      return asset;
    } catch (error) {
      setAssetError(error instanceof Error ? error.message : "Asset yuklanmadi");
    } finally {
      setIsUploading(false);
    }
    return undefined;
  };

  const addAssetLayer = (asset: UploadedAsset) => {
    const id = `image-${crypto.randomUUID()}`;
    const layer: TemplateImageLayer = {
      id,
      name: asset.name,
      type: "image",
      x: 190,
      y: 430,
      width: 700,
      height: 520,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      permissions: { ...defaultLayerPermissions },
      src: asset.url,
      fit: "cover",
      radius: 0
    };
    editor.commitDocument({ ...editor.documentRef.current, layers: [...editor.documentRef.current.layers, layer] });
    editor.setSelectedLayerIds([id]);
  };

  const deleteAsset = async (asset: UploadedAsset) => {
    const response = await fetch(`/api/admin/assets?path=${encodeURIComponent(asset.id)}`, { method: "DELETE" });
    if (!response.ok) {
      const result = await response.json() as { message?: string };
      setAssetError(result.message ?? "Asset o'chirilmadi");
      return;
    }
    setAssets((current) => current.filter((item) => item.id !== asset.id));
  };

  const moveLayer = (id: string, direction: -1 | 1) => {
    const layers = [...editor.documentRef.current.layers];
    const index = layers.findIndex((layer) => layer.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= layers.length) return;
    [layers[index], layers[next]] = [layers[next], layers[index]];
    editor.commitDocument({ ...editor.documentRef.current, layers });
  };

  const saveTemplate = async () => {
    setIsSaving(true);
    setSaveState("idle");
    setSaveError("");
    try {
      let previewImageUrl = initialTemplate?.previewImageUrl ?? "";
      const dataUrl = exportCanvasRef.current?.();
      if (dataUrl) {
        try {
          const blob = await fetch(dataUrl).then((response) => response.blob());
          const preview = await uploadAsset(
            new File([blob], `preview-${Date.now()}.png`, { type: "image/png" }),
            "library"
          );
          previewImageUrl = preview?.url ?? previewImageUrl;
        } catch {
          previewImageUrl = initialTemplate?.previewImageUrl ?? "";
        }
      }
      const endpoint = initialTemplate
        ? `/api/admin/templates/${encodeURIComponent(initialTemplate.id)}`
        : "/api/templates";
      const response = await fetch(endpoint, {
        method: initialTemplate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          previewImageUrl,
          status,
          designDocument: editor.document,
          ...(initialTemplate ? { revision } : {})
        })
      });
      const result = await response.json() as { template?: InvitationTemplate; message?: string };
      if (response.status === 409) {
        throw new Error(result.message ?? "Template boshqa oynada yangilangan. Sahifani yangilang.");
      }
      if (!response.ok || !result.template) throw new Error(result.message ?? "Template saqlanmadi");
      setRevision(result.template.revision ?? revision);
      setSaveState("saved");
      if (!initialTemplate) {
        router.push(`/admin/templates/${encodeURIComponent(result.template.id)}/edit`);
      }
      router.refresh();
    } catch (error) {
      setSaveState("error");
      setSaveError(error instanceof Error ? error.message : "Template saqlanmadi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[720px] flex-col overflow-hidden bg-[#151a18] text-[#f6f0e5]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#181e1b]/95 px-4 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full border border-[#d5b975]/40 bg-[#d5b975]/10">
            <WandSparkles className="h-4 w-4 text-[#d5b975]" />
          </div>
          <div className="min-w-0">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full truncate bg-transparent font-['Cormorant_Garamond'] text-lg font-semibold text-white outline-none"
              aria-label="Template nomi"
            />
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Invitation atelier · 1080 × 1920</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <StudioIcon label="Undo" disabled={editor.historyIndex === 0} onClick={editor.undo}><Undo2 /></StudioIcon>
          <StudioIcon label="Redo" disabled={editor.historyIndex >= editor.historyLength - 1} onClick={editor.redo}><Redo2 /></StudioIcon>
          <div className="mx-2 h-6 w-px bg-white/10" />
          <StudioIcon label="Duplicate" disabled={!editor.selectedLayers.length} onClick={editor.duplicateSelected}><Copy /></StudioIcon>
          <StudioIcon label="Group" disabled={editor.selectedLayers.length < 2} onClick={editor.groupSelected}><Group /></StudioIcon>
          <StudioIcon label="Ungroup" disabled={!editor.selectedLayers.some((layer) => layer.groupId)} onClick={editor.ungroupSelected}><Ungroup /></StudioIcon>
          <StudioIcon label="Delete" disabled={!editor.selectedLayers.length} onClick={editor.removeSelected}><Trash2 /></StudioIcon>
        </div>

        <div className="flex items-center gap-3">
          <span
            title={saveError || undefined}
            className={cn(
              "hidden max-w-64 truncate text-xs sm:block",
              saveState === "saved" && "text-emerald-300",
              saveState === "error" && "text-red-300",
              saveState === "idle" && "text-white/35"
            )}
          >
            {saveState === "saved" ? "Saqlandi" : saveState === "error" ? saveError || "Save error" : initialTemplate ? `Revision ${revision}` : "Draft"}
          </span>
          <Button
            type="button"
            onClick={() => void saveTemplate()}
            disabled={isSaving}
            className="bg-[#d5b975] text-[#1c211e] hover:bg-[#ead49b]"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Saqlash
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[284px_minmax(0,1fr)_326px]">
        <aside className="flex min-h-0 flex-col border-r border-white/10 bg-[#1b211e]">
          <div className="grid grid-cols-3 border-b border-white/10 p-2">
            <Tab active={leftTab === "elements"} onClick={() => setLeftTab("elements")} icon={<Palette />} label="Elements" />
            <Tab active={leftTab === "assets"} onClick={() => setLeftTab("assets")} icon={<ImagePlus />} label="Assets" />
            <Tab active={leftTab === "layers"} onClick={() => setLeftTab("layers")} icon={<Layers3 />} label="Layers" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
            {leftTab === "elements" ? (
              <ElementsPanel addLayer={addLayer} addOrnament={addOrnament} />
            ) : leftTab === "assets" ? (
              <AssetsPanel
                assets={assets}
                isUploading={isUploading}
                error={assetError}
                onUpload={uploadAsset}
                onAdd={addAssetLayer}
                onDelete={deleteAsset}
              />
            ) : (
              <LayersPanel
                layers={editor.document.layers}
                selected={editor.selectedLayerIds}
                onSelect={editor.setSelectedLayerIds}
                onChange={editor.updateLayer}
                onMove={moveLayer}
                onDelete={(id) => {
                  editor.commitDocument({
                    ...editor.documentRef.current,
                    layers: editor.documentRef.current.layers.filter((layer) => layer.id !== id)
                  });
                  editor.setSelectedLayerIds((current) => current.filter((selectedId) => selectedId !== id));
                }}
              />
            )}
          </div>
        </aside>

        <main className="relative min-h-0 overflow-auto bg-[#242b27]">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,.11) 1px, transparent 0)",
              backgroundSize: "24px 24px"
            }}
          />
          <div className="relative flex min-h-full min-w-max items-center justify-center p-16">
            <TemplateCanvas
              document={editor.document}
              selectedLayerIds={editor.selectedLayerIds}
              interactive
              permissionMode="designer"
              snapToGrid={snapToGrid}
              scale={zoom}
              playbackMs={playbackMs}
              playing={playing}
              onPlaybackTick={setPlaybackMs}
              onPlaybackEnd={finishPlayback}
              onSelectLayers={editor.setSelectedLayerIds}
              onChangeLayer={(id, patch) => editor.updateLayer(id, patch, true)}
              onInteractionEnd={editor.commitCurrentInteraction}
              onExportReady={(exporter) => {
                exportCanvasRef.current = exporter;
              }}
            />
          </div>
          <div className="sticky bottom-28 z-20 mx-auto flex w-fit items-center gap-2 rounded-full border border-white/10 bg-[#111613]/90 px-2 py-1.5 shadow-2xl backdrop-blur">
            <StudioIcon label="Zoom out" onClick={() => setZoom((value) => Math.max(0.18, value - 0.04))}><Minus /></StudioIcon>
            <span className="w-12 text-center text-xs font-semibold text-white/70">{Math.round(zoom * 100)}%</span>
            <StudioIcon label="Zoom in" onClick={() => setZoom((value) => Math.min(0.72, value + 0.04))}><Plus /></StudioIcon>
            <button
              type="button"
              onClick={() => setSnapToGrid((value) => !value)}
              className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", snapToGrid ? "bg-[#d5b975] text-[#18201b]" : "text-white/50")}
            >
              Snap
            </button>
          </div>
          <div className="sticky bottom-0 z-20">
            <TemplateTimeline
              document={editor.document}
              selectedLayer={selectedLayer}
              playbackMs={playbackMs}
              playing={playing}
              onPlaybackChange={(value) => {
                setPlaybackMs(value);
                setPlaying(false);
              }}
              onPlayingChange={(value) => {
                if (value && playbackMs >= (editor.document.timeline?.durationMs ?? 6000)) setPlaybackMs(0);
                setPlaying(value);
              }}
              onDocumentChange={editor.commitDocument}
              onLayerChange={(patch) => selectedLayer && editor.updateLayer(selectedLayer.id, patch)}
            />
          </div>
        </main>

        <aside className="min-h-0 overflow-y-auto overscroll-contain border-l border-white/10 bg-[#f5f0e7] text-[#202520]">
          {selectedLayer ? (
            <LayerInspector layer={selectedLayer} onChange={(patch) => editor.updateLayer(selectedLayer.id, patch)} />
          ) : editor.selectedLayers.length > 1 ? (
            <MultiInspector
              layers={editor.selectedLayers}
              onAlign={editor.alignSelected}
              onDistribute={editor.distributeSelected}
              onGroup={editor.groupSelected}
            />
          ) : (
            <DocumentInspector
              name={name}
              description={description}
              status={status}
              document={editor.document}
              onName={setName}
              onDescription={setDescription}
              onStatus={setStatus}
              onChange={editor.commitDocument}
              onUploadBackground={(file) => void uploadAsset(file, "background")}
              isUploading={isUploading}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function ElementsPanel({
  addLayer,
  addOrnament
}: {
  addLayer: (type: "text" | "shape" | "image" | "countdown") => void;
  addOrnament: (preset: (typeof ornamentPresets)[number]) => void;
}) {
  return (
    <div>
      <SectionTitle title="Asosiy elementlar" subtitle="Canvasga yangi layer qo'shing" />
      <div className="grid grid-cols-3 gap-2">
        <ToolButton icon={<Type />} label="Matn" onClick={() => addLayer("text")} />
        <ToolButton icon={<Square />} label="Shakl" onClick={() => addLayer("shape")} />
        <ToolButton icon={<ImagePlus />} label="Rasm" onClick={() => addLayer("image")} />
        <ToolButton icon={<Timer />} label="Countdown" onClick={() => addLayer("countdown")} />
      </div>
      <div className="mt-7">
        <SectionTitle title="Atelier collection" subtitle="Premium wedding ornaments" />
        <div className="grid grid-cols-2 gap-2">
          {ornamentPresets.map((preset) => (
            <button
              key={preset.kind}
              type="button"
              onClick={() => addOrnament(preset)}
              className="group overflow-hidden rounded-xl border border-[#d5b975]/15 bg-[#eee4d2] text-left transition hover:-translate-y-0.5 hover:border-[#d5b975]/60"
            >
              <div className="grid h-24 place-items-center bg-[radial-gradient(circle_at_center,#fffdf8,#e5d6ba)] p-3">
                <TemplateOrnament kind={preset.kind} color={preset.color} secondaryColor={preset.secondaryColor} strokeWidth={1.5} />
              </div>
              <div className="border-t border-[#8d6d37]/10 px-2.5 py-2">
                <p className="truncate font-['Cormorant_Garamond'] text-sm font-bold text-[#30291f]">{preset.label}</p>
                <p className="truncate text-[8px] font-bold uppercase tracking-[0.16em] text-[#967438]">{preset.collection}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssetsPanel({
  assets,
  isUploading,
  error,
  onUpload,
  onAdd,
  onDelete
}: {
  assets: UploadedAsset[];
  isUploading: boolean;
  error: string;
  onUpload: (file?: File, target?: "library" | "layer" | "background") => void;
  onAdd: (asset: UploadedAsset) => void;
  onDelete: (asset: UploadedAsset) => void;
}) {
  return (
    <div>
      <SectionTitle title="Asset library" subtitle="PNG, JPG, WebP yoki SVG" />
      <label className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-[#d5b975]/35 bg-[#d5b975]/5 p-5 text-center hover:bg-[#d5b975]/10">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="sr-only"
          disabled={isUploading}
          onChange={(event) => {
            void onUpload(event.target.files?.[0], "library");
            event.target.value = "";
          }}
        />
        {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-[#d5b975]" /> : <Upload className="h-5 w-5 text-[#d5b975]" />}
        <span className="mt-2 text-xs font-semibold text-white/70">Asset yuklash</span>
        <span className="mt-1 text-[10px] text-white/30">10 MB gacha</span>
      </label>
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {assets.map((asset) => (
          <div key={asset.id} className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 text-left hover:border-[#d5b975]/50">
            <button type="button" onClick={() => onAdd(asset)} className="block w-full text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.url} alt="" className="h-24 w-full object-cover" />
              <p className="truncate px-2 py-2 text-[10px] text-white/60">{asset.name}</p>
            </button>
            <button type="button" aria-label="Assetni o'chirish" onClick={() => void onDelete(asset)} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/65 text-white opacity-0 transition group-hover:opacity-100">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LayersPanel({
  layers,
  selected,
  onSelect,
  onChange,
  onMove,
  onDelete
}: {
  layers: TemplateLayer[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  onChange: (id: string, patch: Partial<TemplateLayer>) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <SectionTitle title="Layers" subtitle={`${layers.length} ta element`} />
      <div className="space-y-1.5">
        {[...layers].reverse().map((layer) => (
          <div
            key={layer.id}
            className={cn(
              "group flex items-center gap-2 rounded-lg border px-2 py-2 transition",
              selected.includes(layer.id) ? "border-[#d5b975]/60 bg-[#d5b975]/10" : "border-white/5 bg-white/[0.025] hover:bg-white/5"
            )}
          >
            <button
              type="button"
              onClick={() => onSelect([layer.id])}
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
            >
              <LayerIcon layer={layer} />
              <span className="truncate text-xs text-white/70">{layer.name}</span>
            </button>
            <MiniButton label={layer.visible ? "Hide" : "Show"} onClick={() => onChange(layer.id, { visible: !layer.visible })}>
              {layer.visible ? <Eye /> : <EyeOff />}
            </MiniButton>
            <MiniButton label={layer.locked ? "Unlock" : "Lock"} onClick={() => onChange(layer.id, { locked: !layer.locked })}>
              {layer.locked ? <Lock /> : <Unlock />}
            </MiniButton>
            <MiniButton label="Up" onClick={() => onMove(layer.id, 1)}><ArrowUp /></MiniButton>
            <MiniButton label="Down" onClick={() => onMove(layer.id, -1)}><ArrowDown /></MiniButton>
            <MiniButton label="Delete" danger onClick={() => onDelete(layer.id)}><Trash2 /></MiniButton>
          </div>
        ))}
      </div>
    </div>
  );
}

function LayerInspector({
  layer,
  onChange
}: {
  layer: TemplateLayer;
  onChange: (patch: Partial<TemplateLayer>) => void;
}) {
  const permissions = getLayerPermissions(layer);
  return (
    <div className="space-y-6 p-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#937440]">Selected layer</p>
        <Input className="mt-2 border-[#d9cdb9] bg-white font-semibold" value={layer.name} onChange={(event) => onChange({ name: event.target.value })} />
      </div>

      <InspectorSection title="Position & size">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="X" value={layer.x} onChange={(x) => onChange({ x })} />
          <NumberField label="Y" value={layer.y} onChange={(y) => onChange({ y })} />
          <NumberField label="Width" value={layer.width} min={20} onChange={(width) => onChange({ width })} />
          <NumberField label="Height" value={layer.height} min={20} onChange={(height) => onChange({ height })} />
          <NumberField label="Rotation" value={layer.rotation} onChange={(rotation) => onChange({ rotation })} />
          <NumberField label="Opacity %" value={Math.round(layer.opacity * 100)} min={0} max={100} onChange={(opacity) => onChange({ opacity: opacity / 100 })} />
        </div>
      </InspectorSection>

      {layer.type === "text" ? <TextInspector layer={layer} onChange={onChange} /> : null}
      {layer.type === "shape" ? <ShapeInspector layer={layer} onChange={onChange} /> : null}
      {layer.type === "image" ? <ImageInspector layer={layer} onChange={onChange} /> : null}
      {layer.type === "ornament" ? <OrnamentInspector layer={layer} onChange={onChange} /> : null}
      {layer.type === "countdown" ? <CountdownInspector layer={layer} onChange={onChange} /> : null}

      <InspectorSection title="User permissions">
        <div className="grid grid-cols-2 gap-2">
          {([
            ["editable", "Content"],
            ["styleEditable", "Style"],
            ["movable", "Move"],
            ["resizable", "Resize"],
            ["rotatable", "Rotate"],
            ["cropEditable", "Crop"],
            ["deletable", "Delete"]
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 rounded-lg border border-[#ded4c4] bg-white px-3 py-2 text-xs font-medium">
              <input
                type="checkbox"
                checked={Boolean(permissions[key])}
                onChange={(event) => onChange({ permissions: { ...permissions, [key]: event.target.checked } })}
              />
              {label}
            </label>
          ))}
        </div>
      </InspectorSection>
    </div>
  );
}

function TextInspector({ layer, onChange }: { layer: TemplateTextLayer; onChange: (patch: Partial<TemplateTextLayer>) => void }) {
  return (
    <InspectorSection title="Typography">
      <Label>Matn</Label>
      <Textarea className="mt-2 bg-white" value={layer.text} onChange={(event) => onChange({ text: event.target.value })} />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <ColorField label="Rang" value={layer.color} onChange={(color) => onChange({ color })} />
        <NumberField label="Font size" value={layer.fontSize} min={8} onChange={(fontSize) => onChange({ fontSize })} />
      </div>
      <Label className="mt-3 block">Font</Label>
      <FontPicker className="mt-2" value={layer.fontFamily} onChange={(fontFamily) => onChange({ fontFamily })} />
      <Label className="mt-3 block">Data binding</Label>
      <select value={layer.binding ?? ""} onChange={(event) => onChange({ binding: event.target.value ? event.target.value as TemplateTextLayer["binding"] : undefined })} className="mt-2 h-10 w-full rounded-md border border-[#d9cdb9] bg-white px-3 text-sm">
        <option value="">Static matn</option>
        {templateTextBindings.map((binding) => <option key={binding} value={binding}>{binding}</option>)}
      </select>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {(["left", "center", "right"] as const).map((align) => (
          <button key={align} type="button" onClick={() => onChange({ align })} className={cn("grid h-9 place-items-center rounded-md border", layer.align === align ? "border-[#98763e] bg-[#eaddc5]" : "border-[#ded4c4] bg-white")}>
            {align === "left" ? <AlignLeft className="h-4 w-4" /> : align === "center" ? <AlignCenter className="h-4 w-4" /> : <AlignRight className="h-4 w-4" />}
          </button>
        ))}
      </div>
    </InspectorSection>
  );
}

function ShapeInspector({ layer, onChange }: { layer: TemplateShapeLayer; onChange: (patch: Partial<TemplateShapeLayer>) => void }) {
  return (
    <InspectorSection title="Shape style">
      <div className="grid grid-cols-2 gap-3">
        <ColorField label="Fill" value={layer.fill.startsWith("#") ? layer.fill : "#e8dcc5"} onChange={(fill) => onChange({ fill })} />
        <ColorField label="Stroke" value={layer.stroke || "#000000"} onChange={(stroke) => onChange({ stroke })} />
        <NumberField label="Stroke width" value={layer.strokeWidth} min={0} onChange={(strokeWidth) => onChange({ strokeWidth })} />
        <NumberField label="Radius" value={layer.radius} min={0} onChange={(radius) => onChange({ radius })} />
      </div>
    </InspectorSection>
  );
}

function ImageInspector({ layer, onChange }: { layer: TemplateImageLayer; onChange: (patch: Partial<TemplateImageLayer>) => void }) {
  return (
    <InspectorSection title="Image slot">
      <Label>Image URL</Label>
      <Input className="mt-2 bg-white" value={layer.src} onChange={(event) => onChange({ src: event.target.value })} />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <NumberField label="Radius" value={layer.radius} min={0} onChange={(radius) => onChange({ radius })} />
        <div>
          <Label>Fit</Label>
          <select value={layer.fit} onChange={(event) => onChange({ fit: event.target.value as "cover" | "contain" })} className="mt-2 h-10 w-full rounded-md border border-[#d9cdb9] bg-white px-3 text-sm">
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
          </select>
        </div>
      </div>
      <label className="mt-3 flex items-center gap-2 rounded-lg border border-[#ded4c4] bg-white px-3 py-2 text-xs">
        <input type="checkbox" checked={layer.binding === "coverImageUrl"} onChange={(event) => onChange({ binding: event.target.checked ? "coverImageUrl" : undefined })} />
        User rasmi uchun slot
      </label>
    </InspectorSection>
  );
}

function OrnamentInspector({ layer, onChange }: { layer: TemplateOrnamentLayer; onChange: (patch: Partial<TemplateOrnamentLayer>) => void }) {
  return (
    <InspectorSection title="Ornament">
      <div className="grid grid-cols-2 gap-3">
        <ColorField label="Asosiy rang" value={layer.color} onChange={(color) => onChange({ color })} />
        <ColorField label="Ikkinchi rang" value={layer.secondaryColor} onChange={(secondaryColor) => onChange({ secondaryColor })} />
        <NumberField label="Stroke" value={layer.strokeWidth} min={0.5} onChange={(strokeWidth) => onChange({ strokeWidth })} />
      </div>
    </InspectorSection>
  );
}

function CountdownInspector({
  layer,
  onChange
}: {
  layer: TemplateCountdownLayer;
  onChange: (patch: Partial<TemplateCountdownLayer>) => void;
}) {
  return (
    <InspectorSection title="Countdown">
      <Label>Sarlavha</Label>
      <Input className="mt-2 bg-white" value={layer.title} onChange={(event) => onChange({ title: event.target.value })} />
      <div className="mt-4 rounded-xl border border-[#ded4c4] bg-white/55 p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a744c]">Sarlavha stili</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <ColorField label="Sarlavha rangi" value={layer.titleColor} onChange={(titleColor) => onChange({ titleColor })} />
          <NumberField label="Font size" value={layer.titleFontSize} min={8} onChange={(titleFontSize) => onChange({ titleFontSize })} />
          <NumberField label="Font weight" value={layer.titleFontWeight} min={100} max={900} onChange={(titleFontWeight) => onChange({ titleFontWeight })} />
          <NumberField label="Letter spacing" value={layer.titleLetterSpacing} onChange={(titleLetterSpacing) => onChange({ titleLetterSpacing })} />
          <NumberField label="Pastki masofa" value={layer.titleMarginBottom} min={0} onChange={(titleMarginBottom) => onChange({ titleMarginBottom })} />
        </div>
        <Label className="mt-3 block">Sarlavha fonti</Label>
        <FontPicker className="mt-2" value={layer.titleFontFamily} onChange={(titleFontFamily) => onChange({ titleFontFamily })} />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(["left", "center", "right"] as const).map((titleAlign) => (
            <button key={titleAlign} type="button" onClick={() => onChange({ titleAlign })} className={cn("grid h-9 place-items-center rounded-md border", layer.titleAlign === titleAlign ? "border-[#98763e] bg-[#eaddc5]" : "border-[#ded4c4] bg-white")}>
              {titleAlign === "left" ? <AlignLeft className="h-4 w-4" /> : titleAlign === "center" ? <AlignCenter className="h-4 w-4" /> : <AlignRight className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a744c]">Raqam va label</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <ColorField label="Raqam rangi" value={layer.color} onChange={(color) => onChange({ color })} />
        <ColorField label="Label rangi" value={layer.labelColor} onChange={(labelColor) => onChange({ labelColor })} />
        <ColorField label="Panel rangi" value={layer.panelColor.startsWith("#") ? layer.panelColor : "#ffffff"} onChange={(panelColor) => onChange({ panelColor })} />
        <ColorField label="Panel border" value={layer.panelStroke.startsWith("#") ? layer.panelStroke : "#ded4c4"} onChange={(panelStroke) => onChange({ panelStroke })} />
        <NumberField label="Raqam size" value={layer.valueFontSize} min={12} onChange={(valueFontSize) => onChange({ valueFontSize })} />
        <NumberField label="Raqam weight" value={layer.valueFontWeight} min={100} max={900} onChange={(valueFontWeight) => onChange({ valueFontWeight })} />
        <NumberField label="Label size" value={layer.labelFontSize} min={8} onChange={(labelFontSize) => onChange({ labelFontSize })} />
        <NumberField label="Label weight" value={layer.labelFontWeight} min={100} max={900} onChange={(labelFontWeight) => onChange({ labelFontWeight })} />
        <NumberField label="Label spacing" value={layer.labelLetterSpacing} onChange={(labelLetterSpacing) => onChange({ labelLetterSpacing })} />
        <NumberField label="Gap" value={layer.gap} min={0} onChange={(gap) => onChange({ gap })} />
        <NumberField label="Radius" value={layer.radius} min={0} onChange={(radius) => onChange({ radius })} />
        <NumberField label="Border width" value={layer.panelStrokeWidth} min={0} onChange={(panelStrokeWidth) => onChange({ panelStrokeWidth })} />
      </div>
      <Label className="mt-3 block">Font</Label>
      <FontPicker className="mt-2" value={layer.fontFamily} onChange={(fontFamily) => onChange({ fontFamily })} />
      <label className="mt-3 flex items-center gap-2 rounded-lg border border-[#ded4c4] bg-white px-3 py-2 text-xs font-medium">
        <input type="checkbox" checked={layer.showSeconds} onChange={(event) => onChange({ showSeconds: event.target.checked })} />
        Soniyani ko‘rsatish
      </label>
    </InspectorSection>
  );
}

function MultiInspector({
  layers,
  onAlign,
  onDistribute,
  onGroup
}: {
  layers: TemplateLayer[];
  onAlign: (mode: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  onDistribute: (axis: "horizontal" | "vertical") => void;
  onGroup: () => void;
}) {
  const horizontalDistributed = isDistributed(layers, "horizontal");
  const verticalDistributed = isDistributed(layers, "vertical");

  return (
    <div className="space-y-6 p-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#937440]">Multi selection</p>
        <h2 className="mt-1 font-['Cormorant_Garamond'] text-2xl font-bold">{layers.length} layer tanlandi</h2>
      </div>
      <InspectorSection title="Align">
        <div className="grid grid-cols-3 gap-2">
          {(["left", "center", "right", "top", "middle", "bottom"] as const).map((mode) => (
            <Button key={mode} type="button" variant="outline" size="sm" onClick={() => onAlign(mode)}>{mode}</Button>
          ))}
        </div>
      </InspectorSection>
      <InspectorSection title="Distribute">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            aria-pressed={horizontalDistributed}
            className={cn(horizontalDistributed && "border-[#98763e] bg-[#eaddc5] text-[#4b3a20] hover:bg-[#eaddc5]")}
            onClick={() => onDistribute("horizontal")}
          >
            <AlignHorizontalDistributeCenter className="h-4 w-4" /> Horizontal
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-pressed={verticalDistributed}
            className={cn(verticalDistributed && "border-[#98763e] bg-[#eaddc5] text-[#4b3a20] hover:bg-[#eaddc5]")}
            onClick={() => onDistribute("vertical")}
          >
            <AlignVerticalDistributeCenter className="h-4 w-4" /> Vertical
          </Button>
        </div>
      </InspectorSection>
      <Button type="button" className="w-full" onClick={onGroup}><Group className="h-4 w-4" /> Group</Button>
    </div>
  );
}

function isDistributed(layers: TemplateLayer[], axis: "horizontal" | "vertical") {
  if (layers.length < 3) return false;
  const positions = layers
    .map((layer) => axis === "horizontal" ? layer.x : layer.y)
    .sort((a, b) => a - b);
  const gap = positions[1] - positions[0];
  return positions.slice(2).every((position, index) =>
    Math.abs(position - positions[index + 1] - gap) < 1
  );
}

function DocumentInspector({
  name,
  description,
  status,
  document,
  onName,
  onDescription,
  onStatus,
  onChange,
  onUploadBackground,
  isUploading
}: {
  name: string;
  description: string;
  status: "active" | "inactive";
  document: ReturnType<typeof cloneStarterTemplateDocument>;
  onName: (value: string) => void;
  onDescription: (value: string) => void;
  onStatus: (value: "active" | "inactive") => void;
  onChange: (document: ReturnType<typeof cloneStarterTemplateDocument>) => void;
  onUploadBackground: (file?: File) => void;
  isUploading: boolean;
}) {
  return (
    <div className="space-y-6 p-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#937440]">Document</p>
        <h2 className="mt-1 font-['Cormorant_Garamond'] text-2xl font-bold">Template settings</h2>
      </div>
      <InspectorSection title="Information">
        <Label>Nomi</Label>
        <Input className="mt-2 bg-white" value={name} onChange={(event) => onName(event.target.value)} />
        <Label className="mt-3 block">Tavsif</Label>
        <Textarea className="mt-2 bg-white" value={description} onChange={(event) => onDescription(event.target.value)} />
        <Label className="mt-3 block">Status</Label>
        <select
          value={status}
          onChange={(event) => onStatus(event.target.value as "active" | "inactive")}
          className="mt-2 h-10 w-full rounded-md border border-[#d9cdb9] bg-white px-3 text-sm"
        >
          <option value="active">Aktiv</option>
          <option value="inactive">Noaktiv</option>
        </select>
      </InspectorSection>
      <InspectorSection title="Canvas">
        <ColorField label="Fon rangi" value={document.background.startsWith("#") ? document.background : "#fffaf2"} onChange={(background) => onChange({ ...document, background })} />
        <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#bda77d] bg-white px-3 py-4 text-xs font-semibold">
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => onUploadBackground(event.target.files?.[0])} />
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Background yuklash
        </label>
        {document.backgroundImage ? (
          <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => onChange({ ...document, backgroundImage: undefined })}>
            Backgroundni olib tashlash
          </Button>
        ) : null}
      </InspectorSection>
      <div className="rounded-xl border border-[#d8c7a5] bg-[#eee3cf] p-4 text-xs leading-5 text-[#6e5933]">
        <MousePointer2 className="mb-2 h-4 w-4" />
        Shift bilan bir nechta layer tanlang. Arrow bilan 1px, Shift+Arrow bilan 10px suring.
      </div>
    </div>
  );
}

function InspectorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[#ded4c4] pt-4 first:border-0 first:pt-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-[#786849]">{title}</h3>
      {children}
    </section>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-3">
      <h3 className="font-['Cormorant_Garamond'] text-lg font-bold text-white">{title}</h3>
      <p className="text-[10px] text-white/30">{subtitle}</p>
    </div>
  );
}

function ToolButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-2 py-3 text-[10px] text-white/55 transition hover:border-[#d5b975]/50 hover:bg-[#d5b975]/10 hover:text-white">
      <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      {label}
    </button>
  );
}

function StudioIcon({ label, children, onClick, disabled }: { label: string; children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="grid h-9 w-9 place-items-center rounded-lg text-white/55 transition hover:bg-white/10 hover:text-white disabled:opacity-20 [&>svg]:h-4 [&>svg]:w-4">
      {children}
    </button>
  );
}

function MiniButton({ label, children, onClick, danger }: { label: string; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={cn("grid h-6 w-6 shrink-0 place-items-center rounded text-white/30 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-white [&>svg]:h-3 [&>svg]:w-3", danger && "hover:bg-red-500/15 hover:text-red-300")}>
      {children}
    </button>
  );
}

function Tab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[9px] font-semibold", active ? "bg-[#d5b975]/12 text-[#e3c984]" : "text-white/35 hover:text-white/65")}>
      <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      {label}
    </button>
  );
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (value: number) => void }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input className="mt-1.5 bg-white" type="number" value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0} min={min} max={max} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1.5 flex h-10 items-center gap-2 rounded-md border border-[#d9cdb9] bg-white px-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-6 w-7 cursor-pointer border-0 bg-transparent p-0" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs outline-none" />
      </div>
    </div>
  );
}

function LayerIcon({ layer }: { layer: TemplateLayer }) {
  if (layer.type === "text") return <Type className="h-3.5 w-3.5 shrink-0 text-[#d5b975]" />;
  if (layer.type === "image") return <ImagePlus className="h-3.5 w-3.5 shrink-0 text-[#d5b975]" />;
  if (layer.type === "ornament") return <Flower2 className="h-3.5 w-3.5 shrink-0 text-[#d5b975]" />;
  if (layer.type === "countdown") return <Timer className="h-3.5 w-3.5 shrink-0 text-[#d5b975]" />;
  return <Square className="h-3.5 w-3.5 shrink-0 text-[#d5b975]" />;
}
