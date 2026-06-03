"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { venueOptions, type VenueOption } from "@/lib/venues";
import { Input } from "@/components/ui/input";

type VenuePickerProps = {
  selectedId?: string | null;
  onSelect: (venue: VenueOption) => void;
};

type YandexMapsApi = {
  ready: Promise<void>;
  YMap: new (container: HTMLElement, options: Record<string, unknown>) => YandexMapInstance;
  YMapDefaultSchemeLayer: new (options?: Record<string, unknown>) => unknown;
  YMapDefaultFeaturesLayer: new (options?: Record<string, unknown>) => unknown;
  YMapMarker: new (options: { source?: string; coordinates: [number, number]; zIndex?: number }, element: HTMLElement) => unknown;
};

type YandexMapInstance = {
  addChild: (child: unknown) => void;
  setLocation: (location: { center: [number, number]; zoom: number }) => void;
};

declare global {
  interface Window {
    ymaps3?: YandexMapsApi;
  }
}

let yandexMapsLoader: { apiKey: string; promise: Promise<YandexMapsApi | null> } | null = null;

function loadYandexMaps(apiKey: string) {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.ymaps3) return Promise.resolve(window.ymaps3);
  if (yandexMapsLoader?.apiKey === apiKey) return yandexMapsLoader.promise;
  yandexMapsLoader = null;

  const promise = new Promise<YandexMapsApi | null>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-yandex-maps='true']");
    const finish = () => {
      const maps = window.ymaps3;
      if (!maps) {
        yandexMapsLoader = null;
        reject(new Error("Yandex Maps yuklanmadi"));
        return;
      }
      maps.ready.then(() => resolve(maps)).catch((error) => {
        yandexMapsLoader = null;
        reject(error);
      });
    };

    if (existing) {
      if (existing.dataset.loaded === "true") {
        finish();
        return;
      }

      if (existing.dataset.apiKey !== apiKey) {
        existing.remove();
      } else {
        existing.addEventListener("load", finish, { once: true });
        existing.addEventListener("error", () => {
          yandexMapsLoader = null;
          reject(new Error("Yandex Maps script xato"));
        }, { once: true });
        return;
      }
    }

    const script = document.createElement("script");
    script.dataset.yandexMaps = "true";
    script.dataset.apiKey = apiKey;
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=en_US`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      finish();
    };
    script.onerror = () => {
      yandexMapsLoader = null;
      reject(new Error("Yandex Maps script xato"));
    };
    document.head.appendChild(script);
  }).catch((error) => {
    yandexMapsLoader = null;
    throw error;
  });

  yandexMapsLoader = { apiKey, promise };
  return promise;
}

export function VenuePicker({ selectedId, onSelect }: VenuePickerProps) {
  const [venues, setVenues] = useState<VenueOption[]>(venueOptions);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | VenueOption["category"]>("all");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [mapStatus, setMapStatus] = useState<"idle" | "loading" | "ready" | "missing-key" | "error">("idle");
  const [mapError, setMapError] = useState<string | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<YandexMapInstance | null>(null);
  const markerElementsRef = useRef(new Map<string, HTMLButtonElement>());
  const venueCardRefs = useRef(new Map<string, HTMLButtonElement>());
  const onSelectRef = useRef(onSelect);
  const activeVenueId = selectedId ?? null;

  const scrollVenueIntoView = useCallback((venueId: string) => {
    window.requestAnimationFrame(() => {
      const container = listContainerRef.current;
      const card = venueCardRefs.current.get(venueId);
      if (!container || !card) return;

      const cardTop = card.offsetTop;
      const cardCenter = cardTop + card.offsetHeight / 2;
      const target = Math.max(0, cardCenter - container.clientHeight / 2);
      const start = container.scrollTop;
      const distance = target - start;
      const duration = 320;
      const startedAt = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        container.scrollTop = start + distance * eased;

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    });
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadVenues() {
      try {
        const response = await fetch("/api/venues", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { venues?: VenueOption[] };
        if (alive && Array.isArray(payload.venues) && payload.venues.length > 0) {
          setVenues(payload.venues);
        }
      } catch {
        // local fallback saqlanadi
      }
    }

    loadVenues();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let alive = true;

    async function loadConfig() {
      try {
        const response = await fetch("/api/config/yandex", { cache: "no-store" });
        if (!response.ok) throw new Error("Config olishda xato");
        const payload = (await response.json()) as { apiKey?: string | null };
        if (alive) {
          const nextApiKey = payload.apiKey?.trim() || null;
          setApiKey(nextApiKey);

          if (!nextApiKey) {
            setMapStatus("missing-key");
            setMapError("Yandex Maps key topilmadi");
          }
        }
      } catch (error) {
        if (!alive) return;
        setApiKey(null);
        setMapStatus("missing-key");
        setMapError(error instanceof Error ? error.message : "Yandex config olinmadi");
      }
    }

    loadConfig();

    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(venues.map((venue) => venue.category)))];
  }, [venues]);

  const filteredVenues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return venues.filter((venue) => {
      const matchesCategory = activeCategory === "all" || venue.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [venue.name, venue.address, venue.note, venue.city, venue.category]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query, venues]);

  const selectedVenue = useMemo(
    () => venues.find((venue) => venue.id === activeVenueId) ?? null,
    [activeVenueId, venues]
  );

  const getMarkerTheme = (category: VenueOption["category"], selected: boolean) => {
    const themes = {
      toyxona: {
        accent: selected ? "#1f7a66" : "#d5a04b",
        accentSoft: selected ? "rgba(31, 122, 102, 0.18)" : "rgba(213, 160, 75, 0.22)",
        shadow: selected ? "rgba(15, 79, 67, 0.38)" : "rgba(81, 59, 30, 0.24)"
      },
      restaurant: {
        accent: selected ? "#4c6fbf" : "#8fa7e6",
        accentSoft: selected ? "rgba(76, 111, 191, 0.18)" : "rgba(143, 167, 230, 0.2)",
        shadow: selected ? "rgba(52, 77, 142, 0.34)" : "rgba(56, 70, 104, 0.22)"
      },
      banquet: {
        accent: selected ? "#7a5ba6" : "#c3a5e6",
        accentSoft: selected ? "rgba(122, 91, 166, 0.18)" : "rgba(195, 165, 230, 0.22)",
        shadow: selected ? "rgba(88, 64, 124, 0.34)" : "rgba(72, 56, 98, 0.22)"
      }
    } satisfies Record<VenueOption["category"], { accent: string; accentSoft: string; shadow: string }>;

    return themes[category];
  };

  useEffect(() => {
    if (!apiKey) {
      setMapStatus("missing-key");
      return;
    }

    const yandexApiKey = apiKey;

    let cancelled = false;
    const container = mapContainerRef.current;
    const markerElements = markerElementsRef.current;

    async function initMap() {
      if (!container) return;
      setMapStatus("loading");
      setMapError(null);

      try {
        const maps = await loadYandexMaps(yandexApiKey);
        if (!maps || cancelled || !container) return;

        container.innerHTML = "";
        markerElements.clear();

        const center = venues[0]?.coordinates ?? ([69.2401, 41.2995] as [number, number]);
        const map = new maps.YMap(container, {
          location: {
            center,
            zoom: 11
          },
          behaviors: ["drag", "scrollZoom", "pinchZoom", "dblClick"],
          mode: "vector"
        });

        map.addChild(new maps.YMapDefaultSchemeLayer());
        map.addChild(new maps.YMapDefaultFeaturesLayer());

        venues.forEach((venue) => {
          const markerElement = document.createElement("button");
          markerElement.type = "button";
          markerElement.setAttribute("aria-label", venue.name);
          markerElement.title = venue.name;
          markerElement.className = "venue-map-marker";
          const theme = getMarkerTheme(venue.category, false);
          markerElement.style.setProperty("--marker-accent", theme.accent);
          markerElement.style.setProperty("--marker-accent-soft", theme.accentSoft);
          markerElement.style.setProperty("--marker-shadow", theme.shadow);
          markerElement.style.cursor = "pointer";
          markerElement.style.transform = "translate(-50%, -100%)";
          markerElement.style.transition = "transform 180ms ease, filter 180ms ease";
          markerElement.innerHTML = `
            <span class="venue-map-marker__pin">
              <span class="venue-map-marker__dot"></span>
            </span>
          `;

          markerElement.addEventListener("click", () => {
            onSelectRef.current(venue);
            scrollVenueIntoView(venue.id);
          });

          markerElement.addEventListener("mouseenter", () => {
            markerElement.style.transform = "translate(-50%, -100%) scale(1.05)";
            markerElement.style.filter = "drop-shadow(0 14px 26px var(--marker-shadow))";
          });

          markerElement.addEventListener("mouseleave", () => {
            markerElement.style.transform = "translate(-50%, -100%) scale(1)";
            markerElement.style.filter = "none";
          });

          markerElements.set(venue.id, markerElement);

          const marker = new maps.YMapMarker(
            {
              coordinates: venue.coordinates,
              zIndex: 1
            },
            markerElement
          );

          map.addChild(marker);
        });

        mapRef.current = map;
        setMapStatus("ready");
      } catch (error) {
        if (!cancelled) {
          setMapStatus("error");
          setMapError(error instanceof Error ? error.message : "Yandex map yuklanmadi");
        }
      }
    }

    initMap();

    return () => {
      cancelled = true;
      mapRef.current = null;
      markerElements.clear();
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [apiKey, scrollVenueIntoView, venues]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedVenue) return;

    map.setLocation({
      center: selectedVenue.coordinates,
      zoom: 13
    });

    markerElementsRef.current.forEach((element, venueId) => {
      const isActive = venueId === selectedVenue.id;
      const venue = venues.find((item) => item.id === venueId);
      if (!venue) return;
    const theme = getMarkerTheme(venue.category, isActive);
    element.style.setProperty("--marker-accent", theme.accent);
    element.style.setProperty("--marker-accent-soft", theme.accentSoft);
    element.style.setProperty("--marker-shadow", theme.shadow);
    element.style.filter = isActive ? "drop-shadow(0 12px 20px var(--marker-shadow))" : "none";
    element.style.transform = isActive ? "translate(-50%, -100%) scale(1.08)" : "translate(-50%, -100%) scale(1)";
    });
  }, [mapStatus, selectedVenue, venues]);

  useEffect(() => {
    const visibleIds = new Set(filteredVenues.map((venue) => venue.id));
    if (selectedVenue) {
      visibleIds.add(selectedVenue.id);
    }

    markerElementsRef.current.forEach((element, venueId) => {
      element.style.display = visibleIds.has(venueId) ? "grid" : "none";
    });
  }, [filteredVenues, selectedVenue]);

  const mapMessage =
    mapStatus === "missing-key"
      ? "Yandex Maps key yo'q."
      : mapStatus === "loading"
        ? "Yandex map yuklanmoqda..."
        : mapStatus === "error"
          ? mapError ?? "Map yuklanmadi. Key yoki tarmoqni tekshir."
          : null;

  return (
    <div className="md:col-span-2">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium leading-none">Manzil kartada tanlanadi</p>
          <p className="mt-1 text-xs text-muted-foreground">Yandex map ustida venue bosiladi, form avtomatik to'ladi.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Yandex Maps
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="rounded-3xl border bg-card p-3 shadow-sm">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="To'yxona, restoran, hudud..."
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((category) => {
                const active = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category as typeof activeCategory)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      active ? "border-primary bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {category === "all"
                      ? "Hammasi"
                      : category === "toyxona"
                        ? "To'yxona"
                        : category === "restaurant"
                          ? "Restoran"
                          : "Banquet"}
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={listContainerRef} className="max-h-[520px] space-y-3 overflow-auto pr-1">
            {filteredVenues.map((venue) => {
              const selected = venue.id === activeVenueId;
              return (
                <button
                  key={venue.id}
                  ref={(element) => {
                    if (element) {
                      venueCardRefs.current.set(venue.id, element);
                    } else {
                      venueCardRefs.current.delete(venue.id);
                    }
                  }}
                  type="button"
                  onClick={() => onSelect(venue)}
                  className={cn(
                    "scroll-mt-3 w-full rounded-3xl border p-4 text-left transition-all",
                    selected ? "border-primary bg-primary/5 shadow-sm" : "bg-card hover:-translate-y-0.5 hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold leading-5">{venue.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{venue.note}</p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex h-8 shrink-0 items-center rounded-full border px-2.5 text-[11px] font-medium",
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {venue.category === "toyxona" ? "To'yxona" : venue.category === "restaurant" ? "Restoran" : "Banquet"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{venue.address}</span>
                  </div>
                </button>
              );
            })}

            {filteredVenues.length === 0 ? (
              <div className="rounded-3xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                Hech narsa topilmadi. Qidiruvni o'zgartir.
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Yandex map</p>
                <p className="text-xs text-muted-foreground">Pin bosilsa venue tanlanadi.</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedVenue ? selectedVenue.city : "Toshkent"}
              </div>
            </div>

            <div className="relative h-[520px] bg-[linear-gradient(135deg,rgba(236,243,239,0.9),rgba(244,231,214,0.55))]">
              <div ref={mapContainerRef} className="absolute inset-0" />

              {mapMessage ? (
                <div className="absolute inset-x-4 top-4 z-10 rounded-2xl border bg-background/95 px-4 py-3 text-xs text-muted-foreground shadow-lg backdrop-blur">
                  {mapMessage}
                </div>
              ) : null}

              {mapStatus === "missing-key" ? (
                <div className="absolute inset-0 grid place-items-center p-6">
                  <div className="max-w-sm rounded-3xl border bg-background/90 p-5 text-center shadow-xl backdrop-blur">
                    <p className="text-sm font-semibold">Map uchun API key kerak</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      `.env.local` ga `YANDEX_MAPS_API_KEY` yoki `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` qo'y. Server key'ni API orqali beradi.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {selectedVenue ? (
            <div className="rounded-3xl border bg-muted/20 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tanlangan venue</p>
              <p className="mt-1 font-semibold">{selectedVenue.name}</p>
              <p className="mt-1 text-muted-foreground">{selectedVenue.address}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
