"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, Type } from "lucide-react";
import { googleFonts, loadGoogleFonts, type GoogleFontCategory } from "@/lib/google-fonts";
import { cn } from "@/lib/utils";

type FontPickerProps = {
  value: string;
  onChange: (family: string) => void;
  className?: string;
};

const categories: Array<"All" | GoogleFontCategory> = ["All", "Serif", "Script", "Sans", "Display"];

export function FontPicker({ value, onChange, className }: FontPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [panelStyle, setPanelStyle] = useState({ left: 0, top: 0, width: 320 });

  const results = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return googleFonts
      .filter((font) => category === "All" || font.category === category)
      .filter((font) => !query || font.family.toLocaleLowerCase().includes(query))
      .slice(0, 18);
  }, [category, search]);

  useEffect(() => {
    void loadGoogleFonts([value]);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    void loadGoogleFonts(results.map((font) => font.family));
  }, [open, results]);

  useEffect(() => {
    if (!open) return;
    const position = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.max(300, rect.width);
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow >= 380 ? rect.bottom + 6 : Math.max(8, rect.top - 386);
      setPanelStyle({
        left: Math.min(rect.left, window.innerWidth - width - 8),
        top,
        width
      });
    };
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      window.removeEventListener("pointerdown", close);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-[#d9cdb9] bg-white px-3 text-left text-sm"
      >
        <span className="truncate" style={{ fontFamily: value }}>{value}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#8a806f]" />
      </button>

      {open ? createPortal(
        <div
          ref={panelRef}
          className="fixed z-[9999] overflow-hidden rounded-xl border border-[#d8ccb8] bg-[#fffdf9] shadow-[0_24px_70px_rgba(45,35,23,.24)]"
          style={panelStyle}
        >
          <div className="border-b border-[#e2d8c8] p-3">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-[#ded4c4] bg-white px-3">
              <Search className="h-3.5 w-3.5 text-[#8b8172]" />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Google Fonts qidirish..."
                className="min-w-0 flex-1 bg-transparent text-xs outline-none"
              />
            </div>
            <div className="mt-2 flex gap-1 overflow-x-auto">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                    category === item ? "bg-[#173f31] text-white" : "bg-[#eee7da] text-[#776b59]"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5">
            {results.map((font) => (
              <button
                key={font.family}
                type="button"
                onClick={() => {
                  onChange(font.family);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-[#f1e9dc]",
                  value === font.family && "bg-[#e7eee9]"
                )}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#eee5d5]">
                  <Type className="h-3.5 w-3.5 text-[#8e754b]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-lg leading-5 text-[#282c27]" style={{ fontFamily: font.family }}>
                    Taklifnoma
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#958875]">{font.family} · {font.category}</span>
                </span>
                {value === font.family ? <Check className="h-4 w-4 shrink-0 text-[#173f31]" /> : null}
              </button>
            ))}
            {!results.length ? <p className="p-5 text-center text-xs text-[#8b8172]">Font topilmadi</p> : null}
          </div>
        </div>,
        document.body
      ) : null}
    </div>
  );
}
