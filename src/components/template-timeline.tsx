"use client";

import { Pause, Play, TimerReset } from "lucide-react";
import type { TemplateDocument, TemplateLayer } from "@/types";

type TemplateTimelineProps = {
  document: TemplateDocument;
  selectedLayer: TemplateLayer | null;
  playbackMs: number;
  playing: boolean;
  onPlaybackChange: (value: number) => void;
  onPlayingChange: (value: boolean) => void;
  onDocumentChange: (document: TemplateDocument) => void;
  onLayerChange: (patch: Partial<TemplateLayer>) => void;
};

export function TemplateTimeline({
  document,
  selectedLayer,
  playbackMs,
  playing,
  onPlaybackChange,
  onPlayingChange,
  onDocumentChange,
  onLayerChange
}: TemplateTimelineProps) {
  const duration = document.timeline?.durationMs ?? 6000;
  const motion = selectedLayer?.motion ?? {
    startMs: 0,
    durationMs: 700,
    endMs: duration,
    exitDurationMs: 500,
    easing: "ease-out" as const,
    enter: "none" as const,
    exit: "none" as const
  };

  return (
    <div className="border-t border-white/10 bg-[#111613]/95 px-4 py-3 backdrop-blur">
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
            onChange={(event) => onDocumentChange({ ...document, timeline: { durationMs: Number(event.target.value) } })}
            className="h-7 w-20 rounded border border-white/10 bg-white/5 px-2 text-xs text-white outline-none"
          />
        </label>
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
              max={duration}
              onChange={(startMs) =>
                onLayerChange({
                  motion: {
                    ...motion,
                    startMs: Math.min(startMs, motion.endMs),
                    durationMs: Math.min(motion.durationMs, Math.max(0, motion.endMs - startMs))
                  }
                })
              }
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
              max={duration}
              onChange={(endMs) =>
                onLayerChange({
                  motion: {
                    ...motion,
                    endMs: Math.max(motion.startMs + motion.durationMs, Math.min(duration, endMs))
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
        </div>
      ) : (
        <p className="mt-2 text-[10px] text-white/30">Animatsiya berish uchun bitta layer tanlang.</p>
      )}
    </div>
  );
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
  max,
  onChange
}: {
  label: string;
  value: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex h-8 items-center gap-2 rounded border border-white/10 bg-[#202722] px-2 text-[10px] text-white/35">
      {label}
      <input type="number" min={0} max={max} step={100} value={value} onChange={(event) => onChange(Number(event.target.value))} className="min-w-0 flex-1 bg-transparent text-right text-xs text-white/70 outline-none" />
    </label>
  );
}
