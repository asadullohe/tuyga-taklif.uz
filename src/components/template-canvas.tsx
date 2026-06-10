"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import {
  Circle,
  Group,
  Image as KonvaImage,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
  Transformer
} from "react-konva";
import useImage from "use-image";
import { loadGoogleFonts } from "@/lib/google-fonts";
import {
  getLayerKeyframeState,
  getLayerPermissions,
  normalizeTemplateDocument,
  resolveLayerText
} from "@/lib/template-document";
import type {
  TemplateDocument,
  TemplateCountdownLayer,
  TemplateImageLayer,
  TemplateLayer,
  TemplateOrnamentLayer,
  TemplateShapeLayer,
  TemplateTextLayer,
  WeddingFormData
} from "@/types";
import { cn } from "@/lib/utils";

type TemplateCanvasProps = {
  document: TemplateDocument;
  data?: Partial<WeddingFormData>;
  selectedLayerId?: string | null;
  selectedLayerIds?: string[];
  interactive?: boolean;
  permissionMode?: "designer" | "user";
  snapToGrid?: boolean;
  gridSize?: number;
  scale?: number;
  playbackMs?: number;
  playing?: boolean;
  className?: string;
  onSelectLayer?: (id: string | null) => void;
  onSelectLayers?: (ids: string[]) => void;
  onChangeLayer?: (id: string, patch: Partial<TemplateLayer>) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  onExportReady?: (exporter: () => string) => void;
  onPlaybackTick?: (value: number) => void;
  onPlaybackEnd?: () => void;
};

type TemplateDocumentPreviewProps = {
  document: TemplateDocument;
  data?: Partial<WeddingFormData>;
  className?: string;
};

type GuideState = { vertical?: number; horizontal?: number };

const transformerStyle = {
  anchorFill: "#f8f2e7",
  anchorStroke: "#0f766e",
  anchorStrokeWidth: 2,
  anchorSize: 12,
  borderStroke: "#0f766e",
  borderStrokeWidth: 2,
  rotateAnchorOffset: 32
};

function cssFill(fill: string) {
  if (!fill.includes("gradient")) return { fill };
  const colors = fill.match(/#[0-9a-fA-F]{3,8}/g) ?? ["#ffffff", "#d8c39a"];
  const stops = colors.flatMap((color, index) => [
    colors.length === 1 ? 0 : index / (colors.length - 1),
    color
  ]);
  return {
    fillLinearGradientStartPoint: { x: 0, y: 0 },
    fillLinearGradientEndPoint: { x: 1080, y: 1920 },
    fillLinearGradientColorStops: stops
  };
}

function shadowProps(layer: TemplateLayer) {
  return layer.shadow
    ? {
        shadowColor: layer.shadow.color,
        shadowBlur: layer.shadow.blur,
        shadowOffsetX: layer.shadow.x,
        shadowOffsetY: layer.shadow.y,
        shadowEnabled: true
      }
    : {};
}

function canMove(layer: TemplateLayer, mode: "designer" | "user") {
  return !layer.locked && (mode === "designer" || getLayerPermissions(layer).movable);
}

function ImageNode({
  layer,
  source
}: {
  layer: TemplateImageLayer;
  source: string;
}) {
  const [image] = useImage(source, "anonymous");
  const crop = useMemo(() => {
    if (layer.crop) return layer.crop;
    if (!image || layer.fit === "contain") return undefined;
    const imageRatio = image.width / image.height;
    const frameRatio = layer.width / layer.height;
    const focalX = layer.focalX ?? 0.5;
    const focalY = layer.focalY ?? 0.5;
    if (imageRatio > frameRatio) {
      const width = image.height * frameRatio;
      return {
        x: Math.max(0, Math.min(image.width - width, (image.width - width) * focalX)),
        y: 0,
        width,
        height: image.height
      };
    }
    const height = image.width / frameRatio;
    return {
      x: 0,
      y: Math.max(0, Math.min(image.height - height, (image.height - height) * focalY)),
      width: image.width,
      height
    };
  }, [image, layer.crop, layer.fit, layer.focalX, layer.focalY, layer.height, layer.width]);
  const contain = useMemo(() => {
    if (!image || layer.fit !== "contain") return { x: 0, y: 0, width: layer.width, height: layer.height };
    const ratio = Math.min(layer.width / image.width, layer.height / image.height);
    const width = image.width * ratio;
    const height = image.height * ratio;
    return { x: (layer.width - width) / 2, y: (layer.height - height) / 2, width, height };
  }, [image, layer.fit, layer.height, layer.width]);

  return (
    <KonvaImage
      image={image}
      x={contain.x}
      y={contain.y}
      width={contain.width}
      height={contain.height}
      crop={crop}
      cornerRadius={layer.radius}
      scaleX={layer.flipX ? -1 : 1}
      scaleY={layer.flipY ? -1 : 1}
      offsetX={layer.flipX ? contain.width : 0}
      offsetY={layer.flipY ? contain.height : 0}
    />
  );
}

function ShapeImageNode({ layer }: { layer: TemplateShapeLayer }) {
  const [image] = useImage(layer.backgroundImage?.src ?? "", "anonymous");
  if (!layer.backgroundImage || !image) return null;

  return (
    <KonvaImage
      image={image}
      width={layer.width}
      height={layer.height}
      opacity={layer.backgroundImage.opacity}
      cornerRadius={layer.radius}
    />
  );
}

function OrnamentNode({ layer }: { layer: TemplateOrnamentLayer }) {
  const wide = layer.ornament === "royal-divider";
  const strokeWidth = Math.max(1.5, layer.strokeWidth);

  if (wide) {
    return (
      <Group scaleX={layer.width / 480} scaleY={layer.height / 120}>
        <Line points={[8, 60, 180, 60]} stroke={layer.color} strokeWidth={strokeWidth} />
        <Line points={[300, 60, 472, 60]} stroke={layer.color} strokeWidth={strokeWidth} />
        <Line
          points={[240, 15, 252, 48, 286, 60, 252, 72, 240, 108, 228, 72, 194, 60, 228, 48]}
          closed
          fill={layer.secondaryColor}
          stroke={layer.color}
          strokeWidth={strokeWidth}
          tension={0.18}
        />
        <Circle x={240} y={60} radius={5} fill={layer.color} />
      </Group>
    );
  }

  if (layer.ornament === "islamic-arch") {
    return (
      <Group scaleX={layer.width / 240} scaleY={layer.height / 240}>
        <Line
          points={[32, 225, 32, 104, 48, 58, 82, 26, 120, 10, 158, 26, 192, 58, 208, 104, 208, 225]}
          stroke={layer.color}
          strokeWidth={strokeWidth}
          tension={0.28}
        />
        <Line
          points={[52, 225, 52, 112, 68, 72, 92, 44, 120, 30, 148, 44, 172, 72, 188, 112, 188, 225]}
          stroke={layer.secondaryColor}
          strokeWidth={strokeWidth}
          tension={0.28}
        />
        <Circle x={120} y={74} radius={7} stroke={layer.color} strokeWidth={strokeWidth} />
      </Group>
    );
  }

  if (layer.ornament === "double-ring") {
    return (
      <Group scaleX={layer.width / 240} scaleY={layer.height / 240}>
        <Circle x={94} y={118} radius={58} stroke={layer.color} strokeWidth={strokeWidth * 1.4} />
        <Circle x={146} y={118} radius={58} stroke={layer.secondaryColor} strokeWidth={strokeWidth * 1.4} />
        <Line points={[32, 184, 78, 205, 120, 208, 162, 205, 208, 184]} stroke={layer.color} strokeWidth={strokeWidth} tension={0.5} />
      </Group>
    );
  }

  if (layer.ornament === "wax-seal") {
    return (
      <Group scaleX={layer.width / 240} scaleY={layer.height / 240}>
        <Circle x={120} y={120} radius={96} fill={layer.secondaryColor} stroke={layer.color} strokeWidth={strokeWidth * 2} />
        <Circle x={120} y={120} radius={70} stroke={layer.color} strokeWidth={strokeWidth} />
        <Text x={65} y={75} width={110} height={90} text="T" align="center" verticalAlign="middle" fontFamily="Georgia" fontSize={76} fill={layer.color} />
      </Group>
    );
  }

  if (layer.ornament === "sparkle-cluster") {
    return (
      <Group scaleX={layer.width / 240} scaleY={layer.height / 240}>
        {[{ x: 120, y: 110, r: 58 }, { x: 180, y: 54, r: 22 }, { x: 52, y: 172, r: 30 }].map((star) => (
          <Line
            key={`${star.x}-${star.y}`}
            points={[star.x, star.y - star.r, star.x + 8, star.y - 8, star.x + star.r, star.y, star.x + 8, star.y + 8, star.x, star.y + star.r, star.x - 8, star.y + 8, star.x - star.r, star.y, star.x - 8, star.y - 8]}
            closed
            fill={layer.secondaryColor}
            stroke={layer.color}
            strokeWidth={strokeWidth}
          />
        ))}
      </Group>
    );
  }

  const branchPoints =
    layer.ornament === "art-deco-fan"
      ? [24, 216, 120, 124, 216, 216]
      : [18, 220, 48, 168, 82, 122, 128, 76, 176, 38, 220, 16];

  return (
    <Group scaleX={layer.width / 240} scaleY={layer.height / 240}>
      <Line points={branchPoints} stroke={layer.color} strokeWidth={strokeWidth} tension={0.32} />
      {[48, 82, 118, 154, 188].map((value, index) => (
        <Group key={value} x={value} y={188 - index * 35} rotation={index % 2 ? 130 : -42}>
          <Line
            points={[0, 0, 14, -18, 38, -12, 30, 8, 8, 12]}
            closed
            fill={layer.secondaryColor}
            stroke={layer.color}
            strokeWidth={strokeWidth * 0.7}
            tension={0.32}
          />
        </Group>
      ))}
    </Group>
  );
}

function BackgroundImage({ document }: { document: TemplateDocument }) {
  const [image] = useImage(document.backgroundImage?.src ?? "", "anonymous");
  if (!document.backgroundImage || !image) return null;

  return (
    <KonvaImage
      image={image}
      width={document.width}
      height={document.height}
      opacity={document.backgroundImage.opacity}
      listening={false}
    />
  );
}

function CountdownNode({
  layer,
  data,
  now
}: {
  layer: TemplateCountdownLayer;
  data?: Partial<WeddingFormData>;
  now: number;
}) {
  const countdown = getCountdownValues(data, now, layer.timezoneOffsetMinutes);
  const units = layer.showSeconds
    ? [
        { value: countdown.days, label: "Kun" },
        { value: countdown.hours, label: "Soat" },
        { value: countdown.minutes, label: "Daqiqa" },
        { value: countdown.seconds, label: "Soniya" }
      ]
    : [
        { value: countdown.days, label: "Kun" },
        { value: countdown.hours, label: "Soat" },
        { value: countdown.minutes, label: "Daqiqa" }
      ];
  const titleHeight = Math.min(
    layer.height * 0.36,
    Math.max(layer.titleFontSize * 1.5, layer.titleFontSize + layer.titleMarginBottom)
  );

  const totalGap = layer.gap * Math.max(0, units.length - 1);
  const boxWidth = (layer.width - totalGap) / units.length;
  const boxTop = titleHeight;
  const boxHeight = Math.max(40, layer.height - titleHeight);

  return (
    <Group>
      <Text
        width={layer.width}
        height={Math.max(1, titleHeight - layer.titleMarginBottom)}
        text={layer.title}
        fill={layer.titleColor}
        fontFamily={layer.titleFontFamily}
        fontSize={Math.min(layer.titleFontSize, titleHeight * 0.72)}
        fontStyle={layer.titleFontWeight >= 700 ? "bold" : layer.titleFontWeight >= 600 ? "600" : "normal"}
        letterSpacing={layer.titleLetterSpacing}
        align={layer.titleAlign}
        verticalAlign="middle"
      />
      {units.map((unit, index) => {
        const x = index * (boxWidth + layer.gap);
        return (
          <Group key={unit.label} x={x} y={boxTop}>
            <Rect
              width={boxWidth}
              height={boxHeight}
              fill={layer.panelColor}
              stroke={layer.panelStroke}
              strokeWidth={layer.panelStrokeWidth}
              cornerRadius={layer.radius}
            />
            <Text
              y={boxHeight * 0.12}
              width={boxWidth}
              height={boxHeight * 0.56}
              text={String(unit.value).padStart(2, "0")}
              fill={layer.color}
              fontFamily={layer.fontFamily}
              fontSize={Math.min(layer.valueFontSize, boxHeight * 0.48)}
              fontStyle={layer.valueFontWeight >= 700 ? "bold" : layer.valueFontWeight >= 600 ? "600" : "normal"}
              align="center"
              verticalAlign="middle"
            />
            <Text
              y={boxHeight * 0.68}
              width={boxWidth}
              height={boxHeight * 0.22}
              text={unit.label}
              fill={layer.labelColor}
              fontFamily={layer.fontFamily}
              fontSize={Math.min(layer.labelFontSize, boxHeight * 0.13)}
              fontStyle={layer.labelFontWeight >= 700 ? "bold" : layer.labelFontWeight >= 600 ? "600" : "normal"}
              letterSpacing={layer.labelLetterSpacing}
              align="center"
              verticalAlign="middle"
            />
          </Group>
        );
      })}
    </Group>
  );
}

function TemplateCanvasComponent({
  document: sourceDocument,
  data,
  selectedLayerId,
  selectedLayerIds,
  interactive = false,
  permissionMode = "designer",
  snapToGrid = true,
  gridSize = 20,
  scale = 0.36,
  playbackMs,
  playing = false,
  className,
  onSelectLayer,
  onSelectLayers,
  onChangeLayer,
  onInteractionStart,
  onInteractionEnd,
  onExportReady,
  onPlaybackTick,
  onPlaybackEnd
}: TemplateCanvasProps) {
  const document = useMemo(() => normalizeTemplateDocument(sourceDocument), [sourceDocument]);
  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const nodeRefs = useRef(new Map<string, Konva.Node>());
  const motionNodeRefs = useRef(new Map<string, Konva.Group>());
  const textNodeRefs = useRef(new Map<string, Konva.Text>());
  const textClipRefs = useRef(new Map<string, Konva.Group>());
  const dragStartRef = useRef(new Map<string, { x: number; y: number }>());
  const playbackStartRef = useRef(0);
  const lastTickRef = useRef(0);
  const [guides, setGuides] = useState<GuideState>({});
  const [now, setNow] = useState(() => Date.now());
  const [, setFontRevision] = useState(0);
  const selection = selectedLayerIds ?? (selectedLayerId ? [selectedLayerId] : []);
  const documentFonts = useMemo(
    () => [
      ...new Set(
        document.layers.flatMap((layer) =>
          layer.type === "text"
            ? [layer.fontFamily]
            : layer.type === "countdown"
              ? [layer.fontFamily, layer.titleFontFamily]
              : []
        )
      )
    ],
    [document.layers]
  );
  const applyPlayback = useCallback(
    (value: number) => {
      let contentLayer: Konva.Layer | null = null;
      for (const layer of document.layers) {
        const layerNode = nodeRefs.current.get(layer.id);
        const node = motionNodeRefs.current.get(layer.id);
        if (!node) continue;
        contentLayer ??= node.getLayer();
        const keyframe = getLayerKeyframeState(layer, value);
        layerNode?.position({ x: keyframe.x, y: keyframe.y });
        layerNode?.scale({ x: keyframe.scale, y: keyframe.scale });
        layerNode?.rotation(keyframe.rotation);
        layerNode?.opacity(keyframe.opacity);
        const motion = getMotionState(layer, value);
        node.position({
          x: motion.x + (motion.scale === 1 ? 0 : layer.width / 2),
          y: motion.y + (motion.scale === 1 ? 0 : layer.height / 2)
        });
        node.opacity(motion.opacity);
        node.scale({ x: motion.scale, y: motion.scale });
        node.offset({
          x: motion.scale === 1 ? 0 : layer.width / 2,
          y: motion.scale === 1 ? 0 : layer.height / 2
        });
        if (layer.type === "text") {
          const textNode = textNodeRefs.current.get(layer.id);
          const clipNode = textClipRefs.current.get(layer.id);
          const textMotion = getTextMotionState(
            layer,
            resolveLayerText(layer, data),
            value
          );
          if (textNode && textNode.text() !== textMotion.text) textNode.text(textMotion.text);
          if (textNode && Math.abs(textNode.opacity() - textMotion.opacity) > 0.001) {
            textNode.opacity(textMotion.opacity);
          }
          if (textNode && Math.abs(textNode.letterSpacing() - textMotion.letterSpacing) > 0.01) {
            textNode.letterSpacing(textMotion.letterSpacing);
          }
          if (clipNode && Math.abs(clipNode.clipWidth() - textMotion.clipWidth) > 0.1) {
            clipNode.clipWidth(textMotion.clipWidth);
          }
        }
      }
      contentLayer?.batchDraw();
    },
    [data, document.layers]
  );

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    transformer.nodes(selection.map((id) => nodeRefs.current.get(id)).filter((node): node is Konva.Node => Boolean(node)));
    transformer.getLayer()?.batchDraw();
  }, [selection.join("|"), document.layers]);

  useEffect(() => {
    if (!onExportReady) return;
    onExportReady(() => {
      const stage = stageRef.current;
      if (!stage) return "";
      const overlays = stage.find(".editor-overlay");
      const motionNodes = stage.find(".motion-content");
      const layerNodes = document.layers
        .map((layer) => ({ layer, node: nodeRefs.current.get(layer.id) }))
        .filter((item): item is { layer: TemplateLayer; node: Konva.Node } => Boolean(item.node));
      const textNodes = stage.find<Konva.Text>(".animated-text");
      const textClips = stage.find<Konva.Group>(".text-clip");
      const motionState = motionNodes.map((node) => ({
        node,
        x: node.x(),
        y: node.y(),
        opacity: node.opacity(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
        offsetX: node.offsetX(),
        offsetY: node.offsetY()
      }));
      const layerState = layerNodes.map(({ node }) => ({
        node,
        x: node.x(),
        y: node.y(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
        rotation: node.rotation(),
        opacity: node.opacity()
      }));
      const textState = textNodes.map((node) => ({
        node,
        text: node.text(),
        opacity: node.opacity(),
        letterSpacing: node.letterSpacing()
      }));
      const clipState = textClips.map((node) => ({
        node,
        clipWidth: node.clipWidth()
      }));
      overlays.forEach((node) => node.hide());
      motionNodes.forEach((node) => {
        node.position({ x: 0, y: 0 });
        node.opacity(1);
        node.scale({ x: 1, y: 1 });
        node.offset({ x: 0, y: 0 });
      });
      layerNodes.forEach(({ layer, node }) => {
        node.position({ x: layer.x, y: layer.y });
        node.scale({ x: 1, y: 1 });
        node.rotation(layer.rotation);
        node.opacity(layer.opacity);
      });
      for (const layer of document.layers) {
        if (layer.type !== "text") continue;
        const textNode = textNodeRefs.current.get(layer.id);
        const clipNode = textClipRefs.current.get(layer.id);
        textNode?.text(resolveLayerText(layer, data));
        textNode?.opacity(1);
        textNode?.letterSpacing(layer.letterSpacing);
        clipNode?.clipWidth(layer.width);
      }
      stage.batchDraw();
      const dataUrl = stage.toDataURL({ pixelRatio: Math.max(1, 1 / scale) });
      overlays.forEach((node) => node.show());
      motionState.forEach(({ node, ...state }) => {
        node.position({ x: state.x, y: state.y });
        node.opacity(state.opacity);
        node.scale({ x: state.scaleX, y: state.scaleY });
        node.offset({ x: state.offsetX, y: state.offsetY });
      });
      layerState.forEach(({ node, ...state }) => {
        node.position({ x: state.x, y: state.y });
        node.scale({ x: state.scaleX, y: state.scaleY });
        node.rotation(state.rotation);
        node.opacity(state.opacity);
      });
      textState.forEach(({ node, ...state }) => {
        node.text(state.text);
        node.opacity(state.opacity);
        node.letterSpacing(state.letterSpacing);
      });
      clipState.forEach(({ node, clipWidth }) => node.clipWidth(clipWidth));
      stage.batchDraw();
      return dataUrl;
    });
  }, [data, document.layers, onExportReady, scale]);

  useEffect(() => {
    let active = true;
    void loadGoogleFonts(documentFonts).then(() => {
      if (active) setFontRevision((revision) => revision + 1);
    });
    return () => {
      active = false;
    };
  }, [documentFonts.join("|")]);

  useEffect(() => {
    if (!playing) applyPlayback(playbackMs ?? 0);
  }, [applyPlayback, playbackMs, playing]);

  useEffect(() => {
    if (!playing) return;
    const duration = document.timeline?.durationMs ?? 6000;
    playbackStartRef.current = performance.now() - (playbackMs ?? 0);
    lastTickRef.current = 0;
    let frame = 0;

    const tick = (now: number) => {
      const value = Math.min(duration, now - playbackStartRef.current);
      applyPlayback(value);
      if (now - lastTickRef.current >= 200 || value >= duration) {
        lastTickRef.current = now;
        onPlaybackTick?.(value);
      }
      if (value >= duration) {
        onPlaybackEnd?.();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [
    applyPlayback,
    document.timeline?.durationMs,
    onPlaybackEnd,
    onPlaybackTick,
    playing
  ]);

  useEffect(() => {
    if (!document.layers.some((layer) => layer.type === "countdown")) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [document.layers]);

  const select = (id: string, additive: boolean) => {
    const clickedLayer = document.layers.find((layer) => layer.id === id);
    const groupSelection = clickedLayer?.groupId
      ? document.layers.filter((layer) => layer.groupId === clickedLayer.groupId).map((layer) => layer.id)
      : [id];
    const next = additive
      ? selection.includes(id)
        ? selection.filter((selectedId) => !groupSelection.includes(selectedId))
        : [...new Set([...selection, ...groupSelection])]
      : groupSelection;
    onSelectLayers?.(next);
    onSelectLayer?.(next[0] ?? null);
  };

  const clearSelection = () => {
    onSelectLayers?.([]);
    onSelectLayer?.(null);
  };

  const snapPosition = (layer: TemplateLayer, x: number, y: number) => {
    if (!snapToGrid) return { x, y, guides: {} };
    let nextX = Math.round(x / gridSize) * gridSize;
    let nextY = Math.round(y / gridSize) * gridSize;
    const centerX = nextX + layer.width / 2;
    const centerY = nextY + layer.height / 2;
    const nextGuides: GuideState = {};

    if (Math.abs(centerX - document.width / 2) <= gridSize) {
      nextX = document.width / 2 - layer.width / 2;
      nextGuides.vertical = document.width / 2;
    }
    if (Math.abs(centerY - document.height / 2) <= gridSize) {
      nextY = document.height / 2 - layer.height / 2;
      nextGuides.horizontal = document.height / 2;
    }

    let closestX: { delta: number; guide: number } | null = null;
    let closestY: { delta: number; guide: number } | null = null;
    for (const target of document.layers) {
      if (target.id === layer.id || selection.includes(target.id)) continue;
      const targetX = [target.x, target.x + target.width / 2, target.x + target.width];
      const targetY = [target.y, target.y + target.height / 2, target.y + target.height];
      const layerX = [nextX, nextX + layer.width / 2, nextX + layer.width];
      const layerY = [nextY, nextY + layer.height / 2, nextY + layer.height];
      for (const targetValue of targetX) {
        for (const layerValue of layerX) {
          const delta = targetValue - layerValue;
          if (Math.abs(delta) <= gridSize / 2 && (!closestX || Math.abs(delta) < Math.abs(closestX.delta))) {
            closestX = { delta, guide: targetValue };
          }
        }
      }
      for (const targetValue of targetY) {
        for (const layerValue of layerY) {
          const delta = targetValue - layerValue;
          if (Math.abs(delta) <= gridSize / 2 && (!closestY || Math.abs(delta) < Math.abs(closestY.delta))) {
            closestY = { delta, guide: targetValue };
          }
        }
      }
    }
    if (closestX) {
      nextX += closestX.delta;
      nextGuides.vertical = closestX.guide;
    }
    if (closestY) {
      nextY += closestY.delta;
      nextGuides.horizontal = closestY.guide;
    }

    return { x: nextX, y: nextY, guides: nextGuides };
  };

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden shadow-[0_36px_100px_rgba(13,18,16,.28)]", className)}
      style={{
        width: document.width * scale,
        height: document.height * scale,
        background: document.background
      }}
    >
      <Stage
        ref={stageRef}
        width={document.width * scale}
        height={document.height * scale}
        scaleX={scale}
        scaleY={scale}
        style={{ width: document.width * scale, height: document.height * scale }}
        onPointerDown={(event) => {
          if (event.target === event.target.getStage()) clearSelection();
        }}
      >
        <Layer>
          <Rect width={document.width} height={document.height} listening={false} {...cssFill(document.background)} />
          <BackgroundImage document={document} />
          {document.layers.map((layer) => {
            if (!layer.visible) return null;
            const draggable = interactive && canMove(layer, permissionMode);
            const source =
              layer.type === "image" && layer.binding && data?.coverImageUrl
                ? data.coverImageUrl
                : layer.type === "image"
                  ? layer.src
                  : "";
            const motion = getMotionState(layer, playbackMs);
            const keyframe = getLayerKeyframeState(layer, playbackMs ?? 0);
            const resolvedText = layer.type === "text" ? resolveLayerText(layer, data) : "";
            const textMotion =
              layer.type === "text"
                ? getTextMotionState(layer, resolvedText, playbackMs)
                : null;

            return (
              <Group
                key={layer.id}
                id={layer.id}
                ref={(node) => {
                  if (node) nodeRefs.current.set(layer.id, node);
                  else nodeRefs.current.delete(layer.id);
                }}
                {...(playing
                  ? {}
                  : {
                      x: keyframe.x,
                      y: keyframe.y,
                      scaleX: keyframe.scale,
                      scaleY: keyframe.scale,
                      rotation: keyframe.rotation,
                      opacity: keyframe.opacity
                    })}
                width={layer.width}
                height={layer.height}
                draggable={draggable}
                listening={interactive || layer.type === "image"}
                {...shadowProps(layer)}
                onPointerDown={(event) => {
                  if (!interactive) return;
                  event.cancelBubble = true;
                  select(layer.id, Boolean(event.evt.shiftKey || event.evt.metaKey || event.evt.ctrlKey));
                }}
                onDragStart={() => {
                  const activeIds = selection.includes(layer.id) ? selection : [layer.id];
                  dragStartRef.current = new Map(
                    activeIds.map((id) => {
                      const activeLayer = document.layers.find((item) => item.id === id);
                      return [id, { x: activeLayer?.x ?? 0, y: activeLayer?.y ?? 0 }];
                    })
                  );
                  onInteractionStart?.();
                }}
                onDragMove={(event) => {
                  const snapped = snapPosition(layer, event.target.x(), event.target.y());
                  event.target.position({ x: snapped.x, y: snapped.y });
                  setGuides(snapped.guides);
                  const primaryStart = dragStartRef.current.get(layer.id) ?? { x: layer.x, y: layer.y };
                  const deltaX = snapped.x - primaryStart.x;
                  const deltaY = snapped.y - primaryStart.y;
                  const activeIds = selection.includes(layer.id) ? selection : [layer.id];
                  for (const id of activeIds) {
                    const start = dragStartRef.current.get(id);
                    if (!start) continue;
                    const x = Math.round(start.x + deltaX);
                    const y = Math.round(start.y + deltaY);
                    nodeRefs.current.get(id)?.position({ x, y });
                    onChangeLayer?.(id, { x, y });
                  }
                }}
                onDragEnd={() => {
                  setGuides({});
                  dragStartRef.current.clear();
                  onInteractionEnd?.();
                }}
                onTransformStart={() => onInteractionStart?.()}
                onTransformEnd={(event) => {
                  const node = event.target;
                  const width = Math.max(20, layer.width * Math.abs(node.scaleX()));
                  const height = Math.max(20, layer.height * Math.abs(node.scaleY()));
                  node.scaleX(1);
                  node.scaleY(1);
                  onChangeLayer?.(layer.id, {
                    x: Math.round(node.x()),
                    y: Math.round(node.y()),
                    width: Math.round(width),
                    height: Math.round(height),
                    rotation: Math.round(node.rotation())
                  });
                  onInteractionEnd?.();
                }}
              >
                <Group
                  name="motion-content"
                  ref={(node) => {
                    if (node) motionNodeRefs.current.set(layer.id, node);
                    else motionNodeRefs.current.delete(layer.id);
                  }}
                  {...(playing
                    ? {}
                    : {
                        x: motion.x + (motion.scale === 1 ? 0 : layer.width / 2),
                        y: motion.y + (motion.scale === 1 ? 0 : layer.height / 2),
                        opacity: motion.opacity,
                        scaleX: motion.scale,
                        scaleY: motion.scale,
                        offsetX: motion.scale === 1 ? 0 : layer.width / 2,
                        offsetY: motion.scale === 1 ? 0 : layer.height / 2
                      })}
                >
                  {layer.type === "shape" ? (
                    <>
                      <Rect
                        width={layer.width}
                        height={layer.height}
                        stroke={layer.stroke}
                        strokeWidth={layer.strokeWidth}
                        cornerRadius={layer.radius}
                        {...cssFill(layer.fill)}
                      />
                      <ShapeImageNode layer={layer} />
                    </>
                  ) : null}
                  {layer.type === "text" ? (
                    <Group
                      name="text-clip"
                      ref={(node) => {
                        if (node) textClipRefs.current.set(layer.id, node);
                        else textClipRefs.current.delete(layer.id);
                      }}
                      clipX={0}
                      clipY={0}
                      clipHeight={layer.height}
                      {...(playing ? {} : { clipWidth: textMotion?.clipWidth ?? layer.width })}
                    >
                      <Text
                        name="animated-text"
                        ref={(node) => {
                          if (node) textNodeRefs.current.set(layer.id, node);
                          else textNodeRefs.current.delete(layer.id);
                        }}
                        width={layer.width}
                        height={layer.height}
                        {...(playing
                          ? {}
                          : {
                              text: textMotion?.text ?? resolvedText,
                              opacity: textMotion?.opacity ?? 1,
                              letterSpacing: textMotion?.letterSpacing ?? layer.letterSpacing
                            })}
                        fill={layer.color}
                        fontFamily={layer.fontFamily}
                        fontSize={layer.fontSize}
                        fontStyle={layer.fontWeight >= 700 ? "bold" : "normal"}
                        lineHeight={layer.lineHeight}
                        align={layer.align}
                        verticalAlign="middle"
                        wrap="word"
                      />
                    </Group>
                  ) : null}
                  {layer.type === "image" ? <ImageNode layer={layer} source={source} /> : null}
                  {layer.type === "ornament" ? <OrnamentNode layer={layer} /> : null}
                  {layer.type === "countdown" ? <CountdownNode layer={layer} data={data} now={now} /> : null}
                </Group>
              </Group>
            );
          })}
        </Layer>

        <Layer>
          {interactive && snapToGrid
            ? Array.from({ length: Math.ceil(document.width / gridSize) + 1 }, (_, index) => (
                <Line name="editor-overlay" key={`gx-${index}`} points={[index * gridSize, 0, index * gridSize, document.height]} stroke="#0f766e" opacity={0.06} strokeWidth={1} listening={false} />
              ))
            : null}
          {interactive && snapToGrid
            ? Array.from({ length: Math.ceil(document.height / gridSize) + 1 }, (_, index) => (
                <Line name="editor-overlay" key={`gy-${index}`} points={[0, index * gridSize, document.width, index * gridSize]} stroke="#0f766e" opacity={0.06} strokeWidth={1} listening={false} />
              ))
            : null}

          {guides.vertical !== undefined ? (
            <Line name="editor-overlay" points={[guides.vertical, 0, guides.vertical, document.height]} stroke="#0d9488" strokeWidth={2 / scale} listening={false} />
          ) : null}
          {guides.horizontal !== undefined ? (
            <Line name="editor-overlay" points={[0, guides.horizontal, document.width, guides.horizontal]} stroke="#0d9488" strokeWidth={2 / scale} listening={false} />
          ) : null}

          {interactive ? (
            <Transformer
              name="editor-overlay"
              ref={transformerRef}
              {...transformerStyle}
              rotateEnabled={selection.every((id) => {
                const layer = document.layers.find((item) => item.id === id);
                return layer ? permissionMode === "designer" || getLayerPermissions(layer).rotatable : false;
              })}
              resizeEnabled={selection.every((id) => {
                const layer = document.layers.find((item) => item.id === id);
                return layer ? permissionMode === "designer" || getLayerPermissions(layer).resizable : false;
              })}
              flipEnabled={false}
              boundBoxFunc={(oldBox, newBox) =>
                newBox.width < 20 || newBox.height < 20 ? oldBox : newBox
              }
            />
          ) : null}
        </Layer>
      </Stage>
    </div>
  );
}

export const TemplateCanvas = memo(TemplateCanvasComponent, (previous, next) => {
  if (!previous.playing || !next.playing) return false;

  return (
    previous.document === next.document &&
    previous.data === next.data &&
    previous.selectedLayerId === next.selectedLayerId &&
    previous.selectedLayerIds === next.selectedLayerIds &&
    previous.interactive === next.interactive &&
    previous.permissionMode === next.permissionMode &&
    previous.snapToGrid === next.snapToGrid &&
    previous.gridSize === next.gridSize &&
    previous.scale === next.scale &&
    previous.className === next.className
  );
});

export function TemplateDocumentPreview({ document, data, className }: TemplateDocumentPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateScale = () => setScale(Math.min(0.5, container.clientWidth / document.width));
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [document.width]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = document.timeline?.durationMs ?? 6000;
    const hasMotion = document.layers.some(
      (layer) =>
        layer.motion &&
        (layer.motion.enter !== "none" ||
          (layer.motion.exit ?? "none") !== "none" ||
          (layer.motion.textEffect ?? "none") !== "none" ||
          (layer.motion.keyframes?.length ?? 0) > 0 ||
          layer.motion.startMs > 0 ||
          (layer.motion.endMs ?? duration) < duration)
    );
    if (reducedMotion || !hasMotion) {
      setPlaying(false);
      return;
    }
    setPlaying(true);
  }, [document.layers, document.timeline?.durationMs]);

  return (
    <div ref={containerRef} className={cn("mx-auto flex w-full max-w-[540px] justify-center", className)}>
      <TemplateCanvas
        document={document}
        data={data}
        scale={scale}
        playbackMs={0}
        playing={playing}
        onPlaybackEnd={() => setPlaying(false)}
      />
    </div>
  );
}

function getCountdownValues(
  data: Partial<WeddingFormData> | undefined,
  now: number,
  timezoneOffsetMinutes: number
) {
  if (!data?.eventDate) {
    return { days: 34, hours: 2, minutes: 35, seconds: 0, completed: false };
  }

  const time = (data.eventTime || "00:00").slice(0, 5);
  const offsetSign = timezoneOffsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(timezoneOffsetMinutes);
  const offsetHours = String(Math.floor(absoluteOffset / 60)).padStart(2, "0");
  const offsetMinutes = String(absoluteOffset % 60).padStart(2, "0");
  const target = Date.parse(`${data.eventDate}T${time}:00${offsetSign}${offsetHours}:${offsetMinutes}`);
  if (!Number.isFinite(target)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: false };
  }

  const remaining = Math.max(0, target - now);
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    completed: remaining <= 0
  };
}

function getMotionState(layer: TemplateLayer, playbackMs?: number) {
  if (playbackMs === undefined || !layer.motion) {
    return { x: 0, y: 0, opacity: 1, scale: 1 };
  }
  const motion = layer.motion;
  if (playbackMs < motion.startMs || playbackMs >= motion.endMs) {
    return { x: 0, y: 0, opacity: 0, scale: 1 };
  }

  const enterRaw =
    motion.enter === "none"
      ? 1
      : Math.max(0, Math.min(1, (playbackMs - motion.startMs) / Math.max(1, motion.durationMs)));
  const exitStart = Math.max(motion.startMs, motion.endMs - motion.exitDurationMs);
  const exitRaw =
    motion.exit === "none" || playbackMs < exitStart
      ? 0
      : Math.max(0, Math.min(1, (playbackMs - exitStart) / Math.max(1, motion.exitDurationMs)));
  const enterProgress = easeMotionProgress(enterRaw, motion.easing);
  const exitProgress = easeMotionProgress(exitRaw, motion.easing);
  const enterDistance = 70 * (1 - enterProgress);
  const exitDistance = 70 * exitProgress;

  const enterX =
    motion.enter === "slide-left" ? -enterDistance : motion.enter === "slide-right" ? enterDistance : 0;
  const enterY = motion.enter === "rise" ? enterDistance : 0;
  const exitX =
    motion.exit === "slide-left" ? -exitDistance : motion.exit === "slide-right" ? exitDistance : 0;
  const exitY = motion.exit === "rise" ? -exitDistance : 0;

  return {
    x: enterX + exitX,
    y: enterY + exitY,
    opacity: enterProgress * (1 - exitProgress),
    scale:
      (motion.enter === "zoom" ? 0.84 + enterProgress * 0.16 : 1) *
      (motion.exit === "zoom" ? 1 - exitProgress * 0.16 : 1)
  };
}

function getTextMotionState(
  layer: TemplateTextLayer,
  fullText: string,
  playbackMs?: number
) {
  const effect = layer.motion?.textEffect ?? "none";
  if (playbackMs === undefined || !layer.motion || effect === "none") {
    return {
      text: fullText,
      opacity: 1,
      letterSpacing: layer.letterSpacing,
      clipWidth: layer.width
    };
  }

  const raw = Math.max(
    0,
    Math.min(
      1,
      (playbackMs - layer.motion.startMs) / Math.max(1, layer.motion.durationMs)
    )
  );
  const characters = Array.from(fullText);

  if (effect === "typewriter" || effect === "letter-reveal") {
    const visibleCount = Math.ceil(characters.length * raw);
    const cursor = effect === "typewriter" && raw < 1 ? "|" : "";
    return {
      text: `${characters.slice(0, visibleCount).join("")}${cursor}`,
      opacity: raw > 0 ? 1 : 0,
      letterSpacing: layer.letterSpacing,
      clipWidth: layer.width
    };
  }

  if (effect === "word-reveal") {
    const words = fullText.match(/\S+\s*/g) ?? [];
    const visibleCount = Math.ceil(words.length * raw);
    return {
      text: words.slice(0, visibleCount).join(""),
      opacity: raw > 0 ? 1 : 0,
      letterSpacing: layer.letterSpacing,
      clipWidth: layer.width
    };
  }

  if (effect === "tracking") {
    const progress = easeMotionProgress(raw, layer.motion.easing);
    return {
      text: fullText,
      opacity: progress,
      letterSpacing: layer.letterSpacing + (1 - progress) * Math.max(12, layer.fontSize * 0.22),
      clipWidth: layer.width
    };
  }

  return {
    text: fullText,
    opacity: raw > 0 ? 1 : 0,
    letterSpacing: layer.letterSpacing,
    clipWidth: layer.width * easeMotionProgress(raw, layer.motion.easing)
  };
}

function easeMotionProgress(
  raw: number,
  easing: NonNullable<TemplateLayer["motion"]>["easing"]
) {
  const progress =
    easing === "ease-in"
      ? raw * raw
      : easing === "ease-in-out"
        ? raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2
        : easing === "linear"
          ? raw
          : 1 - Math.pow(1 - raw, 3);
  return progress;
}
