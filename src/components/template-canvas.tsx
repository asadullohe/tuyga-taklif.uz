"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { TemplateOrnament } from "@/components/template-ornament";
import { getLayerPermissions, resolveLayerText } from "@/lib/template-document";
import type { TemplateDocument, TemplateLayer, WeddingFormData } from "@/types";
import { cn } from "@/lib/utils";

type ResizeCorner = "nw" | "ne" | "sw" | "se";

type TemplateCanvasProps = {
  document: TemplateDocument;
  data?: Partial<WeddingFormData>;
  selectedLayerId?: string | null;
  interactive?: boolean;
  permissionMode?: "designer" | "user";
  snapToGrid?: boolean;
  gridSize?: number;
  scale?: number;
  className?: string;
  onSelectLayer?: (id: string | null) => void;
  onChangeLayer?: (id: string, patch: Partial<TemplateLayer>) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
};

type TemplateDocumentPreviewProps = {
  document: TemplateDocument;
  data?: Partial<WeddingFormData>;
  className?: string;
};

export function TemplateCanvas({
  document,
  data,
  selectedLayerId,
  interactive = false,
  permissionMode = "designer",
  snapToGrid = true,
  gridSize = 20,
  scale = 0.36,
  className,
  onSelectLayer,
  onChangeLayer,
  onInteractionStart,
  onInteractionEnd
}: TemplateCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [guides, setGuides] = useState({ x: false, y: false });

  const snap = (value: number) => (snapToGrid ? Math.round(value / gridSize) * gridSize : value);

  const finishInteraction = () => {
    setGuides({ x: false, y: false });
    onInteractionEnd?.();
  };

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>, layer: TemplateLayer) => {
    const permissions = getLayerPermissions(layer);
    if (
      !interactive ||
      layer.locked ||
      !onChangeLayer ||
      (permissionMode === "user" && !permissions.movable)
    ) return;

    event.stopPropagation();
    onSelectLayer?.(layer.id);
    onInteractionStart?.();

    const startX = event.clientX;
    const startY = event.clientY;
    const layerX = layer.x;
    const layerY = layer.y;

    const move = (moveEvent: PointerEvent) => {
      let x = snap(layerX + (moveEvent.clientX - startX) / scale);
      let y = snap(layerY + (moveEvent.clientY - startY) / scale);
      const centerX = x + layer.width / 2;
      const centerY = y + layer.height / 2;
      const guideX = Math.abs(centerX - document.width / 2) <= gridSize;
      const guideY = Math.abs(centerY - document.height / 2) <= gridSize;

      if (guideX) x = document.width / 2 - layer.width / 2;
      if (guideY) y = document.height / 2 - layer.height / 2;
      setGuides({ x: guideX, y: guideY });

      onChangeLayer(layer.id, {
        x: Math.round(x),
        y: Math.round(y)
      });
    };

    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      finishInteraction();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  };

  const startResize = (
    event: ReactPointerEvent<HTMLDivElement>,
    layer: TemplateLayer,
    corner: ResizeCorner
  ) => {
    const permissions = getLayerPermissions(layer);
    if (
      !interactive ||
      layer.locked ||
      !onChangeLayer ||
      (permissionMode === "user" && !permissions.resizable)
    ) return;

    event.preventDefault();
    event.stopPropagation();
    onInteractionStart?.();

    const startX = event.clientX;
    const startY = event.clientY;
    const original = { x: layer.x, y: layer.y, width: layer.width, height: layer.height };

    const move = (moveEvent: PointerEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;
      const movesLeft = corner.includes("w");
      const movesTop = corner.includes("n");
      const rawWidth = original.width + (movesLeft ? -deltaX : deltaX);
      const rawHeight = original.height + (movesTop ? -deltaY : deltaY);
      const width = Math.max(40, snap(rawWidth));
      const height = Math.max(40, snap(rawHeight));

      onChangeLayer(layer.id, {
        width: Math.round(width),
        height: Math.round(height),
        x: Math.round(movesLeft ? original.x + original.width - width : original.x),
        y: Math.round(movesTop ? original.y + original.height - height : original.y)
      });
    };

    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      finishInteraction();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  };

  const startRotate = (event: ReactPointerEvent<HTMLDivElement>, layer: TemplateLayer) => {
    const permissions = getLayerPermissions(layer);
    if (
      !interactive ||
      layer.locked ||
      !onChangeLayer ||
      !canvasRef.current ||
      (permissionMode === "user" && !permissions.rotatable)
    ) return;

    event.preventDefault();
    event.stopPropagation();
    onInteractionStart?.();

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const centerX = canvasRect.left + (layer.x + layer.width / 2) * scale;
    const centerY = canvasRect.top + (layer.y + layer.height / 2) * scale;

    const move = (moveEvent: PointerEvent) => {
      const angle = (Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * 180) / Math.PI + 90;
      onChangeLayer(layer.id, { rotation: Math.round(snapToGrid ? Math.round(angle / 5) * 5 : angle) });
    };

    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      finishInteraction();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  };

  return (
    <div
      ref={canvasRef}
      className={cn("relative shrink-0 overflow-hidden bg-white shadow-[0_28px_80px_rgba(32,24,17,.2)]", className)}
      style={{
        width: document.width * scale,
        height: document.height * scale,
        background: document.background
      }}
      onPointerDown={() => onSelectLayer?.(null)}
    >
      {document.backgroundImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={document.backgroundImage.src}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{
            objectFit: document.backgroundImage.fit,
            objectPosition: document.backgroundImage.position,
            opacity: document.backgroundImage.opacity
          }}
        />
      ) : null}

      {interactive && snapToGrid ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #173f31 1px, transparent 1px), linear-gradient(to bottom, #173f31 1px, transparent 1px)",
            backgroundSize: `${gridSize * scale}px ${gridSize * scale}px`
          }}
        />
      ) : null}

      {guides.x ? (
        <div className="pointer-events-none absolute bottom-0 top-0 z-[9998] w-px bg-emerald-500" style={{ left: "50%" }} />
      ) : null}
      {guides.y ? (
        <div className="pointer-events-none absolute left-0 right-0 z-[9998] h-px bg-emerald-500" style={{ top: "50%" }} />
      ) : null}

      {document.layers.map((layer) => {
        if (!layer.visible) return null;

        const commonStyle = {
          left: layer.x * scale,
          top: layer.y * scale,
          width: layer.width * scale,
          height: layer.height * scale,
          opacity: layer.opacity,
          transform: `rotate(${layer.rotation}deg)`,
          transformOrigin: "center",
          cursor: interactive
            ? layer.locked || (permissionMode === "user" && !getLayerPermissions(layer).movable)
              ? "not-allowed"
              : "move"
            : "default"
        };
        const permissions = getLayerPermissions(layer);
        const canResize = permissionMode === "designer" || permissions.resizable;
        const canRotate = permissionMode === "designer" || permissions.rotatable;
        const contentFilter = [
          layer.blur ? `blur(${layer.blur * scale}px)` : "",
          layer.shadow
            ? `drop-shadow(${layer.shadow.x * scale}px ${layer.shadow.y * scale}px ${layer.shadow.blur * scale}px ${layer.shadow.color})`
            : ""
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={layer.id}
            className={cn(
              "absolute",
              interactive && selectedLayerId === layer.id && "z-[9997]"
            )}
            style={commonStyle}
            onPointerDown={(event) => startDrag(event, layer)}
            onClick={(event) => {
              event.stopPropagation();
              onSelectLayer?.(layer.id);
            }}
          >
            <div
              className={cn(
                "h-full w-full overflow-visible",
                interactive && selectedLayerId === layer.id && "outline outline-2 outline-offset-2 outline-emerald-600"
              )}
              style={{ filter: contentFilter || undefined }}
            >
              {layer.type === "shape" ? (
                <div
                  className="relative h-full w-full overflow-hidden"
                  style={{
                    background: layer.fill,
                    border: `${layer.strokeWidth * scale}px solid ${layer.stroke}`,
                    borderRadius: layer.radius * scale
                  }}
                >
                  {layer.backgroundImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={layer.backgroundImage.src}
                      alt=""
                      draggable={false}
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      style={{
                        objectFit: layer.backgroundImage.fit,
                        objectPosition: layer.backgroundImage.position,
                        opacity: layer.backgroundImage.opacity
                      }}
                    />
                  ) : null}
                </div>
              ) : null}

              {layer.type === "text" ? (
                <div
                  className="flex h-full w-full items-center whitespace-pre-wrap"
                  style={{
                    color: layer.color,
                    fontFamily: layer.fontFamily,
                    fontSize: layer.fontSize * scale,
                    fontWeight: layer.fontWeight,
                    lineHeight: layer.lineHeight,
                    letterSpacing: layer.letterSpacing * scale,
                    textAlign: layer.align,
                    justifyContent:
                      layer.align === "center" ? "center" : layer.align === "right" ? "flex-end" : "flex-start"
                  }}
                >
                  {resolveLayerText(layer, data)}
                </div>
              ) : null}

              {layer.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={layer.binding && data?.coverImageUrl ? data.coverImageUrl : layer.src}
                  alt=""
                  className="h-full w-full"
                  draggable={false}
                  style={{
                    borderRadius: layer.radius * scale,
                    objectFit: layer.fit
                  }}
                />
              ) : null}

              {layer.type === "ornament" ? (
                <TemplateOrnament
                  kind={layer.ornament}
                  color={layer.color}
                  secondaryColor={layer.secondaryColor}
                  strokeWidth={layer.strokeWidth * scale}
                />
              ) : null}
            </div>

            {interactive && selectedLayerId === layer.id && !layer.locked ? (
              <>
                {canRotate ? (
                  <>
                    <div className="pointer-events-none absolute -top-8 left-1/2 h-8 w-px -translate-x-1/2 bg-emerald-600" />
                    <div
                      role="button"
                      aria-label="Layerni aylantirish"
                      tabIndex={0}
                      className="absolute -top-11 left-1/2 h-4 w-4 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-emerald-600 shadow"
                      onPointerDown={(event) => startRotate(event, layer)}
                    />
                  </>
                ) : null}
                {canResize
                  ? (["nw", "ne", "sw", "se"] as ResizeCorner[]).map((corner) => (
                    <div
                      key={corner}
                      role="button"
                      aria-label={`${corner} resize`}
                      tabIndex={0}
                      className={cn(
                        "absolute h-4 w-4 rounded-sm border-2 border-white bg-emerald-600 shadow",
                        corner === "nw" && "-left-2 -top-2 cursor-nwse-resize",
                        corner === "ne" && "-right-2 -top-2 cursor-nesw-resize",
                        corner === "sw" && "-bottom-2 -left-2 cursor-nesw-resize",
                        corner === "se" && "-bottom-2 -right-2 cursor-nwse-resize"
                      )}
                      onPointerDown={(event) => startResize(event, layer, corner)}
                    />
                  ))
                  : null}
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function TemplateDocumentPreview({ document, data, className }: TemplateDocumentPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      setScale(Math.min(0.5, container.clientWidth / document.width));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [document.width]);

  return (
    <div ref={containerRef} className={cn("mx-auto flex w-full max-w-[540px] justify-center", className)}>
      <TemplateCanvas document={document} data={data} scale={scale} />
    </div>
  );
}
