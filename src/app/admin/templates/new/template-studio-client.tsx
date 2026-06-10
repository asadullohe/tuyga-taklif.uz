"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Flower2,
  ImagePlus,
  Grid3X3,
  Loader2,
  Lock,
  Palette,
  Plus,
  Redo2,
  Save,
  Square,
  Trash2,
  Type,
  Undo2,
  Unlock,
  Upload,
  WandSparkles
} from "lucide-react";
import { TemplateCanvas } from "@/components/template-canvas";
import { TemplateOrnament } from "@/components/template-ornament";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  cloneStarterTemplateDocument,
  defaultLayerPermissions,
  getLayerPermissions,
  templateTextBindings
} from "@/lib/template-document";
import type {
  OrnamentKind,
  TemplateDocument,
  TemplateImageLayer,
  TemplateLayer,
  TemplateOrnamentLayer,
  TemplateShapeLayer,
  TemplateTextLayer
} from "@/types";
import { cn } from "@/lib/utils";

const canvasScale = 0.36;
const fontFamilies = [
  "Cormorant Garamond",
  "Playfair Display",
  "Great Vibes",
  "Cinzel",
  "Marcellus",
  "Montserrat",
  "Georgia",
  "Baskerville",
  "Times New Roman",
  "Arial"
];
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
const gradientPresets = [
  "linear-gradient(135deg, #fff8e8 0%, #d7b66a 52%, #8b652b 100%)",
  "linear-gradient(145deg, #092f27 0%, #176653 55%, #c9a866 100%)",
  "radial-gradient(circle at 30% 18%, #fffdf8 0%, #ead6dc 50%, #b88c99 100%)",
  "linear-gradient(160deg, #f8efe1 0%, #c8d6c6 48%, #6f8c76 100%)"
];
const canvasBackgroundPresets = [
  "#fffaf2",
  "#f4eadb",
  "#eaf0e8",
  "#181d1a",
  gradientPresets[0],
  gradientPresets[1]
];

type UploadedAsset = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
};

export function TemplateStudioClient() {
  const router = useRouter();
  const [document, setDocument] = useState<TemplateDocument>(() => cloneStarterTemplateDocument());
  const documentRef = useRef(document);
  const historyRef = useRef<TemplateDocument[]>([structuredClone(document)]);
  const historyIndexRef = useRef(0);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>("groom-name");
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [name, setName] = useState("Yangi premium shablon");
  const [description, setDescription] = useState("Layer-based, to'liq tahrirlanadigan to'y taklifnomasi.");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAsset, setIsUploadingAsset] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [assetError, setAssetError] = useState("");
  const [error, setError] = useState("");

  const selectedLayer = useMemo(
    () => document.layers.find((layer) => layer.id === selectedLayerId) ?? null,
    [document.layers, selectedLayerId]
  );

  const replaceDocument = useCallback((next: TemplateDocument) => {
    documentRef.current = next;
    setDocument(next);
  }, []);

  const commitDocument = useCallback(
    (next: TemplateDocument) => {
      const committed = structuredClone(next);
      const currentHistory = historyRef.current[historyIndexRef.current];
      if (JSON.stringify(currentHistory) === JSON.stringify(committed)) return;

      const history = historyRef.current.slice(0, historyIndexRef.current + 1);
      history.push(committed);
      historyRef.current = history.slice(-80);
      const nextIndex = historyRef.current.length - 1;
      historyIndexRef.current = nextIndex;
      setHistoryIndex(nextIndex);
      replaceDocument(committed);
    },
    [replaceDocument]
  );

  const createLayerDocument = useCallback(
    (id: string, patch: Partial<TemplateLayer>) => ({
      ...documentRef.current,
      layers: documentRef.current.layers.map((layer) =>
        layer.id === id ? ({ ...layer, ...patch } as TemplateLayer) : layer
      )
    }),
    []
  );

  const updateLayer = (id: string, patch: Partial<TemplateLayer>) => {
    commitDocument(createLayerDocument(id, patch));
  };

  const updateLayerTransient = (id: string, patch: Partial<TemplateLayer>) => {
    replaceDocument(createLayerDocument(id, patch));
  };

  const commitCurrentInteraction = useCallback(() => {
    commitDocument(documentRef.current);
  }, [commitDocument]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    const nextIndex = historyIndexRef.current - 1;
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
    replaceDocument(structuredClone(historyRef.current[nextIndex]));
  }, [replaceDocument]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const nextIndex = historyIndexRef.current + 1;
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
    replaceDocument(structuredClone(historyRef.current[nextIndex]));
  }, [replaceDocument]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [redo, undo]);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/admin/assets", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Asset kutubxonasi yuklanmadi");
        return response.json() as Promise<{ assets: UploadedAsset[] }>;
      })
      .then((result) => setUploadedAssets(result.assets))
      .catch((loadError) => {
        if (loadError instanceof Error && loadError.name !== "AbortError") {
          setAssetError(loadError.message);
        }
      });

    return () => controller.abort();
  }, []);

  const addLayer = (type: "text" | "shape" | "image") => {
    const id = `${type}-${crypto.randomUUID()}`;
    const base = {
      id,
      x: 290,
      y: 820,
      width: 500,
      height: 180,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      permissions: { ...defaultLayerPermissions }
    };
    let layer: TemplateLayer;

    if (type === "text") {
      layer = {
        ...base,
        name: "Yangi matn",
        type,
        text: "Yangi matn",
        color: "#1f2b25",
        fontFamily: "Georgia",
        fontSize: 64,
        fontWeight: 500,
        lineHeight: 1.2,
        letterSpacing: 0,
        align: "center"
      };
    } else if (type === "shape") {
      layer = {
        ...base,
        name: "Yangi shakl",
        type,
        fill: "#d7c2a6",
        stroke: "#8a6645",
        strokeWidth: 0,
        radius: 32
      };
    } else {
      layer = {
        ...base,
        name: "Yangi rasm",
        type,
        src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
        fit: "cover",
        radius: 24
      };
    }

    commitDocument({ ...documentRef.current, layers: [...documentRef.current.layers, layer] });
    setSelectedLayerId(id);
  };

  const addOrnament = (ornament: OrnamentKind) => {
    const id = `ornament-${crypto.randomUUID()}`;
    const preset = ornamentPresets.find((item) => item.kind === ornament);
    const layer: TemplateOrnamentLayer = {
      id,
      name: preset?.label ?? "Ornament",
      type: "ornament",
      ornament,
      x: ornament === "floral-corner" ? 80 : 240,
      y: ornament === "floral-corner" ? 80 : 330,
      width: ornament === "royal-divider" ? 600 : 320,
      height: ornament === "royal-divider" ? 90 : 320,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      permissions: { ...defaultLayerPermissions },
      color: preset?.color ?? "#9a743f",
      secondaryColor: preset?.secondaryColor ?? "#eadab8",
      strokeWidth: 2.5
    };

    commitDocument({ ...documentRef.current, layers: [...documentRef.current.layers, layer] });
    setSelectedLayerId(id);
  };

  const addUploadedAsset = (asset: UploadedAsset) => {
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
      fit: "contain",
      radius: 0
    };
    commitDocument({ ...documentRef.current, layers: [...documentRef.current.layers, layer] });
    setSelectedLayerId(id);
  };

  const setBackgroundAsset = (asset: UploadedAsset) => {
    commitDocument({
      ...documentRef.current,
      backgroundImage: {
        src: asset.url,
        fit: "cover",
        position: "center",
        opacity: 1
      }
    });
    setSelectedLayerId(null);
  };

  const uploadAsset = async (
    file?: File,
    target: "layer" | "background" | "library" = "layer"
  ): Promise<UploadedAsset | undefined> => {
    if (!file) return undefined;
    setIsUploadingAsset(true);
    setAssetError("");

    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/admin/assets", {
        method: "POST",
        body: formData
      });
      const result = await response.json() as { asset?: UploadedAsset; message?: string };
      if (!response.ok || !result.asset) throw new Error(result.message ?? "Asset yuklanmadi");

      setUploadedAssets((current) => [result.asset!, ...current]);
      if (target === "background") setBackgroundAsset(result.asset);
      if (target === "layer") addUploadedAsset(result.asset);
      return result.asset;
    } catch (uploadError) {
      setAssetError(uploadError instanceof Error ? uploadError.message : "Asset yuklanmadi");
      return undefined;
    } finally {
      setIsUploadingAsset(false);
    }
  };

  const removeLayer = (layerId: string) => {
    commitDocument({
      ...documentRef.current,
      layers: documentRef.current.layers.filter((layer) => layer.id !== layerId)
    });
    if (selectedLayerId === layerId) setSelectedLayerId(null);
  };

  const removeSelected = () => {
    if (!selectedLayer) return;
    removeLayer(selectedLayer.id);
  };

  const duplicateSelected = () => {
    if (!selectedLayer) return;
    const copy = {
      ...selectedLayer,
      id: `${selectedLayer.type}-${crypto.randomUUID()}`,
      name: `${selectedLayer.name} copy`,
      x: selectedLayer.x + 36,
      y: selectedLayer.y + 36
    };
    commitDocument({ ...documentRef.current, layers: [...documentRef.current.layers, copy] });
    setSelectedLayerId(copy.id);
  };

  const moveSelected = (direction: -1 | 1) => {
    if (!selectedLayerId) return;
    const index = documentRef.current.layers.findIndex((layer) => layer.id === selectedLayerId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= documentRef.current.layers.length) return;
    const layers = [...documentRef.current.layers];
    [layers[index], layers[nextIndex]] = [layers[nextIndex], layers[index]];
    commitDocument({ ...documentRef.current, layers });
  };

  const saveTemplate = async () => {
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          previewImageUrl: "",
          status: "active",
          designDocument: document
        })
      });
      if (!response.ok) throw new Error("Template saqlanmadi");
      router.push("/admin");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Template saqlanmadi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] xl:h-[calc(100dvh-4rem)] xl:min-h-0 xl:grid-cols-[280px_minmax(520px,1fr)_330px] xl:overflow-hidden">
      <aside className="border-r border-white/10 bg-[#1d221f] p-4 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:overscroll-contain">
        <div className="grid grid-cols-3 gap-2">
          <ToolButton icon={<Type />} label="Matn" onClick={() => addLayer("text")} />
          <ToolButton icon={<Square />} label="Shakl" onClick={() => addLayer("shape")} />
          <ToolButton icon={<ImagePlus />} label="Rasm" onClick={() => addLayer("image")} />
        </div>

        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <WandSparkles className="h-4 w-4 text-[#d6b86d]" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Atelier assets</p>
              </div>
              <p className="mt-1 text-[10px] leading-4 text-white/30">Wedding ornament collection</p>
            </div>
            <span className="rounded-full border border-[#d6b86d]/25 bg-[#d6b86d]/10 px-2 py-1 text-[9px] font-bold tracking-wider text-[#d6b86d]">
              LUXE
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {ornamentPresets.map((preset) => (
              <button
                key={preset.kind}
                type="button"
                onClick={() => addOrnament(preset.kind)}
                className="group overflow-hidden rounded-lg border border-[#d8c9aa]/15 bg-[#f4ede0] text-left shadow-[0_8px_24px_rgba(0,0,0,.12)] transition duration-300 hover:-translate-y-0.5 hover:border-[#d6b86d]/60 hover:shadow-[0_12px_30px_rgba(0,0,0,.22)]"
              >
                <div
                  className="relative grid h-[82px] place-items-center overflow-hidden"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 36%, rgba(255,255,255,.94), rgba(231,220,198,.62))"
                  }}
                >
                  <div className="pointer-events-none absolute inset-[5px] border border-[#9b7a3d]/15" />
                  <div className="h-[62px] w-[82px] transition duration-500 group-hover:scale-110 group-hover:rotate-[2deg]">
                    <TemplateOrnament
                      kind={preset.kind}
                      color={preset.color}
                      secondaryColor={preset.secondaryColor}
                      strokeWidth={1.45}
                    />
                  </div>
                </div>
                <div className="border-t border-[#8a6a35]/10 px-2 py-2">
                  <span className="block truncate font-['Cormorant_Garamond'] text-[12px] font-semibold leading-none text-[#30291f]">
                    {preset.label}
                  </span>
                  <span className="mt-1 block truncate text-[8px] font-bold uppercase tracking-[0.16em] text-[#9b7a3d]">
                    {preset.collection}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <label
            className={cn(
              "mt-3 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#d6b86d]/35 bg-[#d6b86d]/[0.06] px-3 py-4 text-center transition hover:border-[#d6b86d]/70 hover:bg-[#d6b86d]/10",
              isUploadingAsset && "pointer-events-none opacity-60"
            )}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void uploadAsset(event.dataTransfer.files[0]);
            }}
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="sr-only"
              disabled={isUploadingAsset}
              onChange={(event) => {
                void uploadAsset(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            {isUploadingAsset ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#d6b86d]" />
            ) : (
              <Upload className="h-5 w-5 text-[#d6b86d]" />
            )}
            <span className="mt-2 text-[11px] font-semibold text-white/70">
              {isUploadingAsset ? "Yuklanmoqda..." : "Asset yuklash"}
            </span>
            <span className="mt-1 text-[9px] leading-4 text-white/30">PNG, JPG, WebP, SVG · 10 MB</span>
          </label>

          {assetError ? <p className="mt-2 text-[10px] leading-4 text-red-300">{assetError}</p> : null}

          {uploadedAssets.length > 0 ? (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">My uploads</p>
                <span className="text-[10px] text-white/25">{uploadedAssets.length}</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {uploadedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative aspect-square overflow-hidden rounded-md border border-white/10 bg-white/[0.04] transition hover:border-[#d6b86d]/60"
                  >
                    <button
                      type="button"
                      title={`${asset.name} ni canvasga qo'shish`}
                      onClick={() => addUploadedAsset(asset)}
                      className="absolute inset-0 z-10"
                      aria-label={`${asset.name} ni canvasga layer sifatida qo'shish`}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="h-full w-full object-contain p-1.5 transition duration-300 group-hover:scale-110"
                    />
                    <span className="absolute inset-x-0 bottom-0 truncate bg-black/65 px-1 py-0.5 text-[7px] text-white/65 opacity-0 transition group-hover:opacity-100">
                      {asset.name}
                    </span>
                    <button
                      type="button"
                      title="Canvas background qilish"
                      aria-label={`${asset.name} ni canvas background qilish`}
                      onClick={() => setBackgroundAsset(asset)}
                      className="absolute right-1 top-1 z-20 rounded bg-black/70 px-1.5 py-1 text-[7px] font-bold text-white opacity-0 shadow transition hover:bg-[#d6b86d] hover:text-[#1d221f] group-hover:opacity-100"
                    >
                      BG
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Layerlar</p>
          <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/60">{document.layers.length}</span>
        </div>

        <div className="mt-3 space-y-1">
          {[...document.layers].reverse().map((layer) => (
            <div
              key={layer.id}
              className={cn(
                "group flex w-full items-center rounded-md text-sm transition",
                selectedLayerId === layer.id
                  ? "bg-[#d3ff65] text-[#142018]"
                  : "text-white/75 hover:bg-white/7 hover:text-white"
              )}
            >
              <button
                type="button"
                onClick={() => setSelectedLayerId(layer.id)}
                className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left"
              >
                <LayerIcon type={layer.type} />
                <span className="min-w-0 flex-1 truncate">{layer.name}</span>
                {layer.locked ? <Lock className="h-3.5 w-3.5 shrink-0 opacity-60" /> : null}
                {!layer.visible ? <EyeOff className="h-3.5 w-3.5 shrink-0 opacity-60" /> : null}
              </button>
              <button
                type="button"
                title={`${layer.name} layerini o'chirish`}
                aria-label={`${layer.name} layerini o'chirish`}
                onClick={() => removeLayer(layer.id)}
                className={cn(
                  "mr-1 grid h-7 w-7 shrink-0 place-items-center rounded text-current opacity-45 transition hover:bg-red-500/15 hover:text-red-400 hover:opacity-100",
                  selectedLayerId === layer.id && "hover:bg-red-950/10 hover:text-red-700"
                )}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="overflow-auto bg-[#252b27] p-5 sm:p-8 xl:h-full xl:min-h-0 xl:overscroll-contain">
        <div className="mx-auto flex min-w-fit flex-col items-center">
          <div className="mb-4 flex w-full max-w-[470px] items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <IconButton label="Undo" onClick={undo} disabled={historyIndex <= 0}>
                <Undo2 />
              </IconButton>
              <IconButton
                label="Redo"
                onClick={redo}
                disabled={historyIndex >= historyRef.current.length - 1}
              >
                <Redo2 />
              </IconButton>
              <IconButton
                label={snapToGrid ? "Gridni o'chirish" : "Gridni yoqish"}
                onClick={() => setSnapToGrid((current) => !current)}
                active={snapToGrid}
              >
                <Grid3X3 />
              </IconButton>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/45">
              <span>{document.width} × {document.height}</span>
              <span>{Math.round(canvasScale * 100)}%</span>
            </div>
          </div>
          <div className="rounded-[24px] bg-black/20 p-3 shadow-inner">
            <TemplateCanvas
              document={document}
              selectedLayerId={selectedLayerId}
              interactive
              snapToGrid={snapToGrid}
              scale={canvasScale}
              onSelectLayer={setSelectedLayerId}
              onChangeLayer={updateLayerTransient}
              onInteractionEnd={commitCurrentInteraction}
            />
          </div>
          <p className="mt-4 text-xs text-white/40">
            Sudrang, burchakdan resize qiling, yuqori nuqtadan aylantiring.
          </p>
        </div>
      </section>

      <aside className="border-l border-white/10 bg-[#1d221f] p-5 text-white xl:h-full xl:min-h-0 xl:overflow-y-auto xl:overscroll-contain">
        <div className="space-y-4 border-b border-white/10 pb-5">
          <Field label="Shablon nomi">
            <DarkInput value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label="Tavsif">
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
            />
          </Field>
          <Field label="Canvas fon rangi">
            <ColorInput
              value={document.background}
              onChange={(background) => commitDocument({ ...documentRef.current, background })}
            />
            <div className="mt-2 grid grid-cols-6 gap-1.5">
              {canvasBackgroundPresets.map((background) => (
                <button
                  key={background}
                  type="button"
                  title={background}
                  aria-label={`Canvas background ${background}`}
                  onClick={() => commitDocument({ ...documentRef.current, background })}
                  className={cn(
                    "h-7 rounded border border-white/15",
                    document.background === background && "ring-2 ring-[#d3ff65]"
                  )}
                  style={{ background }}
                />
              ))}
            </div>
          </Field>
          <Field label="Canvas background rasmi">
            <label
              className={cn(
                "flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-white/15 bg-white/[0.04] px-3 py-3 text-xs text-white/60 transition hover:border-[#d6b86d]/50 hover:text-[#d6b86d]",
                isUploadingAsset && "pointer-events-none opacity-50"
              )}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="sr-only"
                disabled={isUploadingAsset}
                onChange={(event) => {
                  void uploadAsset(event.target.files?.[0], "background");
                  event.target.value = "";
                }}
              />
              {isUploadingAsset ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {document.backgroundImage ? "Backgroundni almashtirish" : "Background yuklash"}
            </label>

            {document.backgroundImage ? (
              <div className="mt-3 space-y-3 rounded-md border border-white/10 bg-white/[0.03] p-3">
                <div className="relative h-24 overflow-hidden rounded-md border border-white/10 bg-black/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={document.backgroundImage.src}
                    alt="Canvas background"
                    className="h-full w-full"
                    style={{
                      objectFit: document.backgroundImage.fit,
                      objectPosition: document.backgroundImage.position,
                      opacity: document.backgroundImage.opacity
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Joylashuv">
                    <select
                      value={document.backgroundImage.position}
                      onChange={(event) =>
                        commitDocument({
                          ...documentRef.current,
                          backgroundImage: {
                            ...document.backgroundImage!,
                            position: event.target.value as NonNullable<TemplateDocument["backgroundImage"]>["position"]
                          }
                        })
                      }
                      className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-2 text-xs text-white outline-none"
                    >
                      <option value="top" className="text-black">Yuqori</option>
                      <option value="center" className="text-black">Markaz</option>
                      <option value="bottom" className="text-black">Past</option>
                    </select>
                  </Field>
                  <Field label="O'lcham">
                    <select
                      value={document.backgroundImage.fit}
                      onChange={(event) =>
                        commitDocument({
                          ...documentRef.current,
                          backgroundImage: {
                            ...document.backgroundImage!,
                            fit: event.target.value as NonNullable<TemplateDocument["backgroundImage"]>["fit"]
                          }
                        })
                      }
                      className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-2 text-xs text-white outline-none"
                    >
                      <option value="cover" className="text-black">Cover</option>
                      <option value="contain" className="text-black">Contain</option>
                    </select>
                  </Field>
                </div>
                <NumberField
                  label="Background opacity"
                  value={document.backgroundImage.opacity}
                  onChange={(opacity) =>
                    commitDocument({
                      ...documentRef.current,
                      backgroundImage: {
                        ...document.backgroundImage!,
                        opacity: Math.min(1, Math.max(0, opacity))
                      }
                    })
                  }
                  min={0}
                  max={1}
                  step={0.05}
                />
                <button
                  type="button"
                  onClick={() =>
                    commitDocument({
                      ...documentRef.current,
                      backgroundImage: undefined
                    })
                  }
                  className="w-full rounded-md border border-red-400/20 px-3 py-2 text-xs text-red-300 transition hover:bg-red-400/10"
                >
                  Backgroundni olib tashlash
                </button>
              </div>
            ) : null}
          </Field>
          {assetError ? <p className="text-xs text-red-300">{assetError}</p> : null}
          <Button className="w-full bg-[#d3ff65] text-[#142018] hover:bg-[#c5f24f]" onClick={saveTemplate} disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? "Saqlanmoqda..." : "Shablonni saqlash"}
          </Button>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>

        {selectedLayer ? (
          <LayerInspector
            layer={selectedLayer}
            onChange={(patch) => updateLayer(selectedLayer.id, patch)}
            onDuplicate={duplicateSelected}
            onDelete={removeSelected}
            onMoveDown={() => moveSelected(-1)}
            onMoveUp={() => moveSelected(1)}
            onUploadShapeBackground={async (file) => {
              if (selectedLayer.type !== "shape") return;
              const asset = await uploadAsset(file, "library");
              if (!asset) return;
              updateLayer(selectedLayer.id, {
                backgroundImage: {
                  src: asset.url,
                  fit: "cover",
                  position: "center",
                  opacity: 1
                }
              });
            }}
            isUploadingAsset={isUploadingAsset}
          />
        ) : (
          <div className="py-12 text-center text-sm leading-6 text-white/40">
            <Plus className="mx-auto mb-3 h-6 w-6" />
            Sozlash uchun layer tanlang.
          </div>
        )}
      </aside>
    </div>
  );
}

function LayerInspector({
  layer,
  onChange,
  onDuplicate,
  onDelete,
  onMoveDown,
  onMoveUp,
  onUploadShapeBackground,
  isUploadingAsset
}: {
  layer: TemplateLayer;
  onChange: (patch: Partial<TemplateLayer>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onUploadShapeBackground: (file: File) => Promise<void>;
  isUploadingAsset: boolean;
}) {
  return (
    <div className="space-y-5 pt-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{layer.name}</p>
          <p className="text-xs uppercase tracking-wider text-white/40">{layer.type}</p>
        </div>
        <div className="flex gap-1">
          <IconButton
            label={layer.visible ? "Yashirish" : "Ko'rsatish"}
            onClick={() => onChange({ visible: !layer.visible })}
          >
            {layer.visible ? <Eye /> : <EyeOff />}
          </IconButton>
          <IconButton
            label={layer.locked ? "Qulfni ochish" : "Qulflash"}
            onClick={() => onChange({ locked: !layer.locked })}
          >
            {layer.locked ? <Lock /> : <Unlock />}
          </IconButton>
        </div>
      </div>

      <Field label="Layer nomi">
        <DarkInput value={layer.name} onChange={(event) => onChange({ name: event.target.value })} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <NumberField label="X" value={layer.x} onChange={(x) => onChange({ x })} />
        <NumberField label="Y" value={layer.y} onChange={(y) => onChange({ y })} />
        <NumberField label="Kenglik" value={layer.width} onChange={(width) => onChange({ width })} min={1} />
        <NumberField label="Balandlik" value={layer.height} onChange={(height) => onChange({ height })} min={1} />
        <NumberField label="Burilish" value={layer.rotation} onChange={(rotation) => onChange({ rotation })} />
        <NumberField
          label="Opacity"
          value={layer.opacity}
          onChange={(opacity) => onChange({ opacity })}
          min={0}
          max={1}
          step={0.05}
        />
      </div>

      <PermissionsInspector layer={layer} onChange={onChange} />

      {layer.type === "text" ? <TextInspector layer={layer} onChange={onChange} /> : null}
      {layer.type === "shape" ? (
        <ShapeInspector
          layer={layer}
          onChange={onChange}
          onUploadBackground={onUploadShapeBackground}
          isUploading={isUploadingAsset}
        />
      ) : null}
      {layer.type === "image" ? <ImageInspector layer={layer} onChange={onChange} /> : null}
      {layer.type === "ornament" ? <OrnamentInspector layer={layer} onChange={onChange} /> : null}
      <EffectsInspector layer={layer} onChange={onChange} />

      <div className="grid grid-cols-4 gap-2 border-t border-white/10 pt-5">
        <IconButton label="Pastga" onClick={onMoveDown}><ArrowDown /></IconButton>
        <IconButton label="Tepaga" onClick={onMoveUp}><ArrowUp /></IconButton>
        <IconButton label="Nusxalash" onClick={onDuplicate}><Copy /></IconButton>
        <IconButton label="O'chirish" onClick={onDelete} danger><Trash2 /></IconButton>
      </div>
    </div>
  );
}

function TextInspector({
  layer,
  onChange
}: {
  layer: TemplateTextLayer;
  onChange: (patch: Partial<TemplateTextLayer>) => void;
}) {
  return (
    <div className="space-y-4 border-t border-white/10 pt-5">
      <Field label="Matn">
        <Textarea
          value={layer.text}
          onChange={(event) => onChange({ text: event.target.value })}
          className="border-white/10 bg-white/5 text-white"
        />
      </Field>
      <Field label="Ma'lumotga bog'lash">
        <select
          value={layer.binding ?? ""}
          onChange={(event) => onChange({ binding: (event.target.value || undefined) as TemplateTextLayer["binding"] })}
          className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
        >
          <option value="" className="text-black">Bog'lanmagan</option>
          {templateTextBindings.map((binding) => (
            <option key={binding} value={binding} className="text-black">{binding}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Font size" value={layer.fontSize} onChange={(fontSize) => onChange({ fontSize })} min={8} />
        <NumberField label="Weight" value={layer.fontWeight} onChange={(fontWeight) => onChange({ fontWeight })} min={100} max={900} step={100} />
      </div>
      <Field label="Font">
        <select
          value={layer.fontFamily}
          onChange={(event) => onChange({ fontFamily: event.target.value })}
          className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
        >
          {fontFamilies.map((font) => (
            <option key={font} value={font} className="text-black" style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {fontFamilies.slice(0, 6).map((font) => (
            <button
              key={font}
              type="button"
              onClick={() => onChange({ fontFamily: font })}
              className={cn(
                "truncate rounded-md border px-2 py-2 text-sm transition",
                layer.fontFamily === font
                  ? "border-[#d3ff65]/60 bg-[#d3ff65]/15 text-[#d3ff65]"
                  : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/10"
              )}
              style={{ fontFamily: font }}
            >
              Aa {font}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Line height"
          value={layer.lineHeight}
          onChange={(lineHeight) => onChange({ lineHeight })}
          min={0.5}
          step={0.05}
        />
        <NumberField
          label="Letter spacing"
          value={layer.letterSpacing}
          onChange={(letterSpacing) => onChange({ letterSpacing })}
          step={1}
        />
      </div>
      <Field label="Tekislash">
        <div className="grid grid-cols-3 gap-2">
          <IconButton label="Chap" onClick={() => onChange({ align: "left" })} active={layer.align === "left"}>
            <AlignLeft />
          </IconButton>
          <IconButton label="Markaz" onClick={() => onChange({ align: "center" })} active={layer.align === "center"}>
            <AlignCenter />
          </IconButton>
          <IconButton label="O'ng" onClick={() => onChange({ align: "right" })} active={layer.align === "right"}>
            <AlignRight />
          </IconButton>
        </div>
      </Field>
      <Field label="Rang">
        <ColorInput value={layer.color} onChange={(color) => onChange({ color })} />
      </Field>
    </div>
  );
}

function ShapeInspector({
  layer,
  onChange,
  onUploadBackground,
  isUploading
}: {
  layer: TemplateShapeLayer;
  onChange: (patch: Partial<TemplateShapeLayer>) => void;
  onUploadBackground: (file: File) => Promise<void>;
  isUploading: boolean;
}) {
  return (
    <div className="space-y-4 border-t border-white/10 pt-5">
      <Field label="Fon rangi">
        <ColorInput value={layer.fill} onChange={(fill) => onChange({ fill })} />
      </Field>
      <Field label="Premium gradientlar">
        <div className="grid grid-cols-4 gap-2">
          {gradientPresets.map((fill) => (
            <button
              key={fill}
              type="button"
              title={fill}
              aria-label="Gradient tanlash"
              onClick={() => onChange({ fill })}
              className={cn(
                "h-12 rounded-md border border-white/15 transition hover:scale-105",
                layer.fill === fill && "ring-2 ring-[#d3ff65]"
              )}
              style={{ background: fill }}
            />
          ))}
        </div>
      </Field>
      <Field label="Chegara rangi">
        <ColorInput value={layer.stroke} onChange={(stroke) => onChange({ stroke })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Chegara" value={layer.strokeWidth} onChange={(strokeWidth) => onChange({ strokeWidth })} min={0} />
        <NumberField label="Radius" value={layer.radius} onChange={(radius) => onChange({ radius })} min={0} />
      </div>
      <Field label="Panel background rasmi">
        <label
          className={cn(
            "flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-white/15 bg-white/[0.04] px-3 py-3 text-xs text-white/60 transition hover:border-[#d6b86d]/50 hover:text-[#d6b86d]",
            isUploading && "pointer-events-none opacity-50"
          )}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onUploadBackground(file);
              event.target.value = "";
            }}
          />
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {layer.backgroundImage ? "Panel rasmini almashtirish" : "Panelga rasm yuklash"}
        </label>
      </Field>
      {layer.backgroundImage ? (
        <div className="space-y-3 rounded-md border border-white/10 bg-white/[0.03] p-3">
          <div className="relative h-24 overflow-hidden rounded-md border border-white/10 bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={layer.backgroundImage.src}
              alt="Panel background"
              className="h-full w-full"
              style={{
                objectFit: layer.backgroundImage.fit,
                objectPosition: layer.backgroundImage.position,
                opacity: layer.backgroundImage.opacity
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Joylashuv">
              <select
                value={layer.backgroundImage.position}
                onChange={(event) =>
                  onChange({
                    backgroundImage: {
                      ...layer.backgroundImage!,
                      position: event.target.value as NonNullable<TemplateShapeLayer["backgroundImage"]>["position"]
                    }
                  })
                }
                className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-2 text-xs text-white outline-none"
              >
                <option value="top" className="text-black">Yuqori</option>
                <option value="center" className="text-black">Markaz</option>
                <option value="bottom" className="text-black">Past</option>
              </select>
            </Field>
            <Field label="O'lcham">
              <select
                value={layer.backgroundImage.fit}
                onChange={(event) =>
                  onChange({
                    backgroundImage: {
                      ...layer.backgroundImage!,
                      fit: event.target.value as NonNullable<TemplateShapeLayer["backgroundImage"]>["fit"]
                    }
                  })
                }
                className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-2 text-xs text-white outline-none"
              >
                <option value="cover" className="text-black">Cover</option>
                <option value="contain" className="text-black">Contain</option>
              </select>
            </Field>
          </div>
          <NumberField
            label="Rasm opacity"
            value={layer.backgroundImage.opacity}
            onChange={(opacity) =>
              onChange({
                backgroundImage: {
                  ...layer.backgroundImage!,
                  opacity: Math.min(1, Math.max(0, opacity))
                }
              })
            }
            min={0}
            max={1}
            step={0.05}
          />
          <button
            type="button"
            onClick={() => onChange({ backgroundImage: undefined })}
            className="w-full rounded-md border border-red-400/20 px-3 py-2 text-xs text-red-300 transition hover:bg-red-400/10"
          >
            Panel rasmini olib tashlash
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ImageInspector({
  layer,
  onChange
}: {
  layer: TemplateImageLayer;
  onChange: (patch: Partial<TemplateImageLayer>) => void;
}) {
  return (
    <div className="space-y-4 border-t border-white/10 pt-5">
      <Field label="Rasm URL">
        <DarkInput value={layer.src} onChange={(event) => onChange({ src: event.target.value })} />
      </Field>
      <label className="flex items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={layer.binding === "coverImageUrl"}
          onChange={(event) => onChange({ binding: event.target.checked ? "coverImageUrl" : undefined })}
        />
        User rasmi bilan almashtirish
      </label>
      <Field label="Rasm joylashuvi">
        <select
          value={layer.fit}
          onChange={(event) => onChange({ fit: event.target.value as TemplateImageLayer["fit"] })}
          className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
        >
          <option value="cover" className="text-black">Cover</option>
          <option value="contain" className="text-black">Contain</option>
        </select>
      </Field>
      <NumberField label="Radius" value={layer.radius} onChange={(radius) => onChange({ radius })} min={0} />
    </div>
  );
}

function OrnamentInspector({
  layer,
  onChange
}: {
  layer: TemplateOrnamentLayer;
  onChange: (patch: Partial<TemplateOrnamentLayer>) => void;
}) {
  return (
    <div className="space-y-4 border-t border-white/10 pt-5">
      <Field label="Ornament turi">
        <select
          value={layer.ornament}
          onChange={(event) => onChange({ ornament: event.target.value as OrnamentKind })}
          className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
        >
          {ornamentPresets.map((preset) => (
            <option key={preset.kind} value={preset.kind} className="text-black">
              {preset.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Asosiy rang">
          <ColorInput value={layer.color} onChange={(color) => onChange({ color })} />
        </Field>
        <Field label="Ikkinchi rang">
          <ColorInput
            value={layer.secondaryColor}
            onChange={(secondaryColor) => onChange({ secondaryColor })}
          />
        </Field>
      </div>
      <NumberField
        label="Chiziq qalinligi"
        value={layer.strokeWidth}
        onChange={(strokeWidth) => onChange({ strokeWidth })}
        min={0.5}
        step={0.5}
      />
    </div>
  );
}

function EffectsInspector({
  layer,
  onChange
}: {
  layer: TemplateLayer;
  onChange: (patch: Partial<TemplateLayer>) => void;
}) {
  const setShadowPreset = (preset: "none" | "soft" | "gold") => {
    if (preset === "none") {
      onChange({ shadow: undefined });
      return;
    }
    onChange({
      shadow:
        preset === "soft"
          ? { color: "rgba(24, 30, 26, 0.28)", blur: 24, x: 0, y: 12 }
          : { color: "rgba(191, 145, 54, 0.55)", blur: 30, x: 0, y: 6 }
    });
  };

  return (
    <div className="space-y-4 border-t border-white/10 pt-5">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-[#d3ff65]" />
        <p className="text-xs font-semibold text-white/70">Effects</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <PresetButton label="Yo'q" active={!layer.shadow} onClick={() => setShadowPreset("none")} />
        <PresetButton label="Soft" active={layer.shadow?.blur === 24} onClick={() => setShadowPreset("soft")} />
        <PresetButton label="Gold" active={layer.shadow?.blur === 30} onClick={() => setShadowPreset("gold")} />
      </div>
      <NumberField
        label="Blur"
        value={layer.blur ?? 0}
        onChange={(blur) => onChange({ blur: Math.max(0, blur) })}
        min={0}
        max={40}
      />
      {layer.shadow ? (
        <>
          <Field label="Shadow rang">
            <ColorInput
              value={layer.shadow.color}
              onChange={(color) => onChange({ shadow: { ...layer.shadow!, color } })}
            />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <NumberField
              label="X"
              value={layer.shadow.x}
              onChange={(x) => onChange({ shadow: { ...layer.shadow!, x } })}
            />
            <NumberField
              label="Y"
              value={layer.shadow.y}
              onChange={(y) => onChange({ shadow: { ...layer.shadow!, y } })}
            />
            <NumberField
              label="Softness"
              value={layer.shadow.blur}
              onChange={(blur) => onChange({ shadow: { ...layer.shadow!, blur: Math.max(0, blur) } })}
              min={0}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function PermissionsInspector({
  layer,
  onChange
}: {
  layer: TemplateLayer;
  onChange: (patch: Partial<TemplateLayer>) => void;
}) {
  const permissions = getLayerPermissions(layer);
  const options: Array<{ key: keyof typeof permissions; label: string }> = [
    { key: "editable", label: "Kontentni edit qilish" },
    { key: "movable", label: "Joyini surish" },
    { key: "resizable", label: "O'lchamini o'zgartirish" },
    { key: "rotatable", label: "Aylantirish" },
    { key: "styleEditable", label: "Stilni o'zgartirish" },
    { key: "deletable", label: "O'chirish" }
  ];

  return (
    <div className="space-y-3 border-t border-white/10 pt-5">
      <div>
        <p className="text-xs font-semibold text-white/70">User ruxsatlari</p>
        <p className="mt-1 text-xs leading-5 text-white/35">Taklifnoma egasi shu layer bilan nima qila oladi.</p>
      </div>
      <div className="grid gap-2">
        {options.map((option) => (
          <label
            key={option.key}
            className="flex cursor-pointer items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/65"
          >
            <span>{option.label}</span>
            <input
              type="checkbox"
              checked={permissions[option.key]}
              onChange={(event) =>
                onChange({
                  permissions: {
                    ...permissions,
                    [option.key]: event.target.checked
                  }
                })
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function ToolButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-3 text-xs text-white/65 transition hover:border-[#d3ff65]/50 hover:bg-[#d3ff65]/10 hover:text-[#d3ff65]"
    >
      <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      {label}
    </button>
  );
}

function LayerIcon({ type }: { type: TemplateLayer["type"] }) {
  if (type === "text") return <Type className="h-4 w-4" />;
  if (type === "image") return <ImagePlus className="h-4 w-4" />;
  if (type === "ornament") return <Flower2 className="h-4 w-4" />;
  return <Square className="h-4 w-4" />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-semibold text-white/55">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function DarkInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...props} className={cn("border-white/10 bg-white/5 text-white placeholder:text-white/30", props.className)} />;
}

function NumberField({
  label,
  value,
  onChange,
  ...props
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
} & Pick<React.InputHTMLAttributes<HTMLInputElement>, "min" | "max" | "step">) {
  return (
    <Field label={label}>
      <DarkInput
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        {...props}
      />
    </Field>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex gap-2">
      <input
        type="color"
        value={normalizeColor(value)}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-11 rounded-md border border-white/10 bg-transparent p-1"
      />
      <DarkInput value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function PresetButton({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-2 py-2 text-xs transition",
        active
          ? "border-[#d3ff65]/60 bg-[#d3ff65]/15 text-[#d3ff65]"
          : "border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/10"
      )}
    >
      {label}
    </button>
  );
}

function normalizeColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff";
}

function IconButton({
  label,
  children,
  onClick,
  danger = false,
  active = false,
  disabled = false
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-9 items-center justify-center rounded-md border border-white/10 bg-white/5 px-2.5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25 [&>svg]:h-4 [&>svg]:w-4",
        active && "border-[#d3ff65]/50 bg-[#d3ff65]/15 text-[#d3ff65]",
        danger && "hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
      )}
    >
      {children}
    </button>
  );
}
