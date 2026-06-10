"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { Pause, Play, TimerReset } from "lucide-react";
import type { TemplateDocument, TemplateLayer } from "@/types";
import { cn } from "@/lib/utils";

type TemplateTimelineProps = {
  document: TemplateDocument;
  selectedLayer: TemplateLayer | null;
  playbackMs: number;
  playing: boolean;
  onPlaybackChange: (value: number) => void;
  onPlayingChange: (value: boolean) => void;
  onDocumentChange: (document: TemplateDocument) => void;
  onLayerChange: (patch: Partial<TemplateLayer>) => void;
  onSelectLayer?: (id: string) => void;
  onTimelineLayerChange?: (id: string, patch: Partial<TemplateLayer>, transient?: boolean) => void;
  onTimelineInteractionEnd?: () => void;
};

type DragMode = "move" | "start" | "end";

const timelineSnapMs = 50;
const minimumVisibleMs = 100;

export function TemplateTimeline({
  document,
  selectedLayer,
  playbackMs,
  playing,
  onPlaybackChange,
  onPlayingChange,
  onDocumentChange,
  onLayerChange,
  onSelectLayer,
  onTimelineLayerChange,
  onTimelineInteractionEnd
}: TemplateTimelineProps) {
  const duration = document.timeline?.durationMs ?? 6000;
  const defaultMotion = {
    startMs: 0,
    durationMs: 700,
    endMs: duration,
    exitDurationMs: 500,
    easing: "ease-out" as const,
    enter: "none" as const,
    exit: "none" as const,
    textEffect: "none" as const
  };
  const motion = selectedLayer?.motion ?? defaultMotion;
  const ticks = Array.from({ length: 7 }, (_, index) => duration * (index / 6));

  const seekFromPointer = (event: ReactPointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const value = ((event.clientX - rect.left) / Math.max(1, rect.width)) * duration;
    onPlaybackChange(clamp(snapTime(value), 0, duration));
  };

  const startTimelineDrag = (
    event: ReactPointerEvent<HTMLElement>,
    layer: TemplateLayer,
    mode: DragMode
  ) => {
    if (event.button !== 0 || !onTimelineLayerChange) return;
    event.preventDefault();
    event.stopPropagation();
    onSelectLayer?.(layer.id);
    onPlayingChange(false);

    const track = event.currentTarget.closest("[data-timeline-track]") as HTMLElement | null;
    if (!track) return;
    const trackWidth = Math.max(1, track.getBoundingClientRect().width);
    const initialPointerX = event.clientX;
    const initial = layer.motion ?? defaultMotion;

    const move = (pointerEvent: PointerEvent) => {
      const deltaMs = snapTime(((pointerEvent.clientX - initialPointerX) / trackWidth) * duration);
      const visibleDuration = Math.max(minimumVisibleMs, initial.endMs - initial.startMs);
      let startMs = initial.startMs;
      let endMs = initial.endMs;

      if (mode === "move") {
        startMs = clamp(initial.startMs + deltaMs, 0, Math.max(0, duration - visibleDuration));
        endMs = startMs + visibleDuration;
      } else if (mode === "start") {
        const latestStart = initial.endMs - Math.max(minimumVisibleMs, initial.durationMs);
        startMs = clamp(initial.startMs + deltaMs, 0, Math.max(0, latestStart));
      } else {
        const earliestEnd = initial.startMs + Math.max(minimumVisibleMs, initial.durationMs);
        endMs = clamp(initial.endMs + deltaMs, Math.min(duration, earliestEnd), duration);
      }

      const span = Math.max(0, endMs - startMs);
      onTimelineLayerChange(
        layer.id,
        {
          motion: {
            ...initial,
            startMs,
            endMs,
            durationMs: Math.min(initial.durationMs, span),
            exitDurationMs: Math.min(initial.exitDurationMs, span)
          }
        },
        true
      );
    };

    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      onTimelineInteractionEnd?.();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
  };

  return (
    <div className="border-t border-white/10 bg-[#111613]/95 px-4 py-3 shadow-[0_-20px_60px_rgba(0,0,0,.22)] backdrop-blur">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onPlayingChange(!playing)} className="grid h-8 w-8 place-items-center rounded-full bg-[#d5b975] text-[#172019]">
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <span className="w-14 text-xs tabular-nums text-white/55">{(playbackMs / 1000).toFixed(1)}s</span>
        <input
          type="range"
          min={0}
          max={duration}
          step={20}
          value={playbackMs}
          onChange={(event) => onPlaybackChange(Number(event.target.value))}
          className="min-w-0 flex-1 accent-[#d5b975]"
        />
        <label className="flex items-center gap-2 text-[10px] text-white/40">
          <TimerReset className="h-3.5 w-3.5" />
          Duration
          <input
            type="number"
            min={1000}
            step={500}
            value={duration}
            onChange={(event) => {
              const nextDuration = Math.max(1000, Number(event.target.value) || 1000);
              onDocumentChange({
                ...document,
                timeline: { durationMs: nextDuration },
                layers: document.layers.map((layer) => {
                  if (!layer.motion) return layer;
                  const startMs = Math.min(layer.motion.startMs, Math.max(0, nextDuration - minimumVisibleMs));
                  const endMs = clamp(layer.motion.endMs, startMs + minimumVisibleMs, nextDuration);
                  const span = endMs - startMs;
                  return {
                    ...layer,
                    motion: {
                      ...layer.motion,
                      startMs,
                      endMs,
                      durationMs: Math.min(layer.motion.durationMs, span),
                      exitDurationMs: Math.min(layer.motion.exitDurationMs, span)
                    }
                  };
                })
              });
              if (playbackMs > nextDuration) onPlaybackChange(nextDuration);
            }}
            className="h-7 w-20 rounded border border-white/10 bg-white/5 px-2 text-xs text-white outline-none"
          />
        </label>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-[#171d19]">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[180px_minmax(560px,1fr)] border-b border-white/10">
            <div className="flex h-8 items-center px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
              Layers
            </div>
            <div
              className="relative h-8 cursor-crosshair border-l border-white/10"
              onPointerDown={seekFromPointer}
            >
              {ticks.map((tick) => (
                <div
                  key={tick}
                  className="absolute inset-y-0 border-l border-white/10"
                  style={{ left: `${(tick / duration) * 100}%` }}
                >
                  <span className="absolute left-1 top-1.5 text-[9px] tabular-nums text-white/30">
                    {(tick / 1000).toFixed(1)}s
                  </span>
                </div>
              ))}
              <Playhead playbackMs={playbackMs} duration={duration} />
            </div>
          </div>

          <div className="max-h-36 overflow-y-auto">
            {document.layers.map((layer) => {
              const layerMotion = layer.motion ?? defaultMotion;
              const selected = selectedLayer?.id === layer.id;
              const startPercent = (layerMotion.startMs / duration) * 100;
              const widthPercent = ((layerMotion.endMs - layerMotion.startMs) / duration) * 100;
              const span = Math.max(1, layerMotion.endMs - layerMotion.startMs);
              const enterPercent = Math.min(100, (layerMotion.durationMs / span) * 100);
              const exitPercent = Math.min(100, (layerMotion.exitDurationMs / span) * 100);

              return (
                <div
                  key={layer.id}
                  className={cn(
                    "grid grid-cols-[180px_minmax(560px,1fr)] border-b border-white/5 last:border-b-0",
                    selected && "bg-[#d5b975]/5"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelectLayer?.(layer.id)}
                    className={cn(
                      "flex h-8 min-w-0 items-center gap-2 px-3 text-left text-[11px] transition",
                      selected ? "text-[#efd99e]" : "text-white/50 hover:text-white/75"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", layer.visible ? "bg-emerald-400" : "bg-white/20")} />
                    <span className="truncate">{layer.name}</span>
                    <span className="ml-auto text-[9px] uppercase text-white/20">{layer.type}</span>
                  </button>
                  <div
                    data-timeline-track
                    className="relative h-8 cursor-crosshair overflow-hidden border-l border-white/10"
                    onPointerDown={seekFromPointer}
                  >
                    {ticks.map((tick) => (
                      <span
                        key={tick}
                        className="pointer-events-none absolute inset-y-0 border-l border-white/[0.06]"
                        style={{ left: `${(tick / duration) * 100}%` }}
                      />
                    ))}
                    <div
                      className={cn(
                        "absolute top-1 h-6 min-w-3 overflow-visible rounded border shadow-lg",
                        selected
                          ? "border-[#efd99e] bg-[#a58143]"
                          : "border-white/15 bg-[#52645a]"
                      )}
                      style={{ left: `${startPercent}%`, width: `${widthPercent}%`, touchAction: "none" }}
                    >
                      <button
                        type="button"
                        aria-label={`${layer.name} vaqtini ko'chirish`}
                        className="absolute inset-0 cursor-grab overflow-hidden rounded active:cursor-grabbing"
                        onPointerDown={(event) => startTimelineDrag(event, layer, "move")}
                      >
                        {layerMotion.enter !== "none" || layerMotion.textEffect !== "none" ? (
                          <span
                            className="absolute inset-y-0 left-0 bg-white/20"
                            style={{ width: `${enterPercent}%` }}
                          />
                        ) : null}
                        {layerMotion.exit !== "none" ? (
                          <span
                            className="absolute inset-y-0 right-0 bg-black/25"
                            style={{ width: `${exitPercent}%` }}
                          />
                        ) : null}
                      </button>
                      <button
                        type="button"
                        aria-label={`${layer.name} start vaqti`}
                        className="absolute -left-1 top-0 z-10 h-full w-2 cursor-ew-resize rounded-l bg-[#f4dea4] shadow"
                        onPointerDown={(event) => startTimelineDrag(event, layer, "start")}
                      />
                      <button
                        type="button"
                        aria-label={`${layer.name} end vaqti`}
                        className="absolute -right-1 top-0 z-10 h-full w-2 cursor-ew-resize rounded-r bg-[#f4dea4] shadow"
                        onPointerDown={(event) => startTimelineDrag(event, layer, "end")}
                      />
                    </div>
                    <Playhead playbackMs={playbackMs} duration={duration} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedLayer ? (
        <div className="mt-2 space-y-2">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-2">
            <MotionSelect
              label="Enter"
              value={motion.enter}
              onChange={(enter) => onLayerChange({ motion: { ...motion, enter } })}
            />
            <TimelineNumber
              label="Start"
              value={motion.startMs}
              max={Math.max(0, motion.endMs - minimumVisibleMs)}
              onChange={(startMs) => {
                const nextStartMs = clamp(startMs, 0, Math.max(0, motion.endMs - minimumVisibleMs));
                onLayerChange({
                  motion: {
                    ...motion,
                    startMs: nextStartMs,
                    durationMs: Math.min(motion.durationMs, Math.max(0, motion.endMs - nextStartMs))
                  }
                });
              }}
            />
            <TimelineNumber
              label="Enter length"
              value={motion.durationMs}
              max={Math.max(0, motion.endMs - motion.startMs)}
              onChange={(durationMs) =>
                onLayerChange({
                  motion: {
                    ...motion,
                    durationMs: Math.min(durationMs, Math.max(0, motion.endMs - motion.startMs))
                  }
                })
              }
            />
            <select
              value={motion.easing}
              onChange={(event) => onLayerChange({ motion: { ...motion, easing: event.target.value as typeof motion.easing } })}
              className="h-8 rounded border border-white/10 bg-[#202722] px-2 text-xs text-white/70"
            >
              <option value="ease-out">Ease out</option>
              <option value="ease-in">Ease in</option>
              <option value="ease-in-out">Ease both</option>
              <option value="linear">Linear</option>
            </select>
          </div>
          <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-2">
            <MotionSelect
              label="Exit"
              value={motion.exit}
              onChange={(exit) => onLayerChange({ motion: { ...motion, exit } })}
            />
            <TimelineNumber
              label="End"
              value={motion.endMs}
              min={motion.startMs + Math.max(minimumVisibleMs, motion.durationMs)}
              max={duration}
              onChange={(endMs) =>
                onLayerChange({
                  motion: {
                    ...motion,
                    endMs: clamp(
                      endMs,
                      motion.startMs + Math.max(minimumVisibleMs, motion.durationMs),
                      duration
                    )
                  }
                })
              }
            />
            <TimelineNumber
              label="Exit length"
              value={motion.exitDurationMs}
              max={Math.max(0, motion.endMs - motion.startMs)}
              onChange={(exitDurationMs) =>
                onLayerChange({
                  motion: {
                    ...motion,
                    exitDurationMs: Math.min(
                      exitDurationMs,
                      Math.max(0, motion.endMs - motion.startMs)
                    )
                  }
                })
              }
            />
            <div className="flex h-8 items-center rounded border border-white/10 bg-[#202722] px-2 text-[10px] text-white/35">
              Visible: {(motion.startMs / 1000).toFixed(1)}s - {(motion.endMs / 1000).toFixed(1)}s
            </div>
          </div>
          {selectedLayer.type === "text" ? (
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-2">
              <label className="flex h-8 items-center gap-2 rounded border border-[#d5b975]/25 bg-[#d5b975]/5 px-2 text-[10px] text-[#d5b975]/70">
                Text effect
                <select
                  value={motion.textEffect}
                  onChange={(event) =>
                    onLayerChange({
                      motion: {
                        ...motion,
                        textEffect: event.target.value as typeof motion.textEffect
                      }
                    })
                  }
                  className="min-w-0 flex-1 bg-transparent text-xs text-[#f1dfad] outline-none"
                >
                  <option value="none">None</option>
                  <option value="typewriter">Typewriter</option>
                  <option value="word-reveal">Word reveal</option>
                  <option value="letter-reveal">Letter reveal</option>
                  <option value="tracking">Tracking reveal</option>
                  <option value="wipe">Mask wipe</option>
                </select>
              </label>
              <div className="col-span-3 flex h-8 items-center rounded border border-white/10 bg-[#202722] px-3 text-[10px] text-white/35">
                Effect Start va Enter length oralig‘ida ishlaydi.
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-[10px] text-white/30">Animatsiya berish uchun bitta layer tanlang.</p>
      )}
    </div>
  );
}

function Playhead({ playbackMs, duration }: { playbackMs: number; duration: number }) {
  return (
    <span
      className="pointer-events-none absolute inset-y-0 z-20 w-px bg-[#f1cb66] shadow-[0_0_8px_rgba(241,203,102,.8)]"
      style={{ left: `${(clamp(playbackMs, 0, duration) / duration) * 100}%` }}
    />
  );
}

function snapTime(value: number) {
  return Math.round(value / timelineSnapMs) * timelineSnapMs;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function MotionSelect({
  label,
  value,
  onChange
}: {
  label: "Enter" | "Exit";
  value: NonNullable<TemplateLayer["motion"]>["enter"];
  onChange: (value: NonNullable<TemplateLayer["motion"]>["enter"]) => void;
}) {
  return (
    <label className="flex h-8 items-center gap-2 rounded border border-white/10 bg-[#202722] px-2 text-[10px] text-white/35">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as typeof value)}
        className="min-w-0 flex-1 bg-transparent text-xs text-white/70 outline-none"
      >
        <option value="none">None</option>
        <option value="fade">Fade</option>
        <option value="rise">Rise</option>
        <option value="slide-left">Slide left</option>
        <option value="slide-right">Slide right</option>
        <option value="zoom">Zoom</option>
      </select>
    </label>
  );
}

function TimelineNumber({
  label,
  value,
  min = 0,
  max,
  onChange
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex h-8 items-center gap-2 rounded border border-white/10 bg-[#202722] px-2 text-[10px] text-white/35">
      {label}
      <input type="number" min={min} max={max} step={100} value={value} onChange={(event) => onChange(Number(event.target.value))} className="min-w-0 flex-1 bg-transparent text-right text-xs text-white/70 outline-none" />
    </label>
  );
}
