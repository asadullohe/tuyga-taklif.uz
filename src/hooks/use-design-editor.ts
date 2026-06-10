"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalizeTemplateDocument } from "@/lib/template-document";
import type { TemplateDocument, TemplateLayer } from "@/types";

type AlignMode = "left" | "center" | "right" | "top" | "middle" | "bottom";

export function useDesignEditor(initialDocument: TemplateDocument) {
  const initial = useMemo(() => normalizeTemplateDocument(initialDocument), [initialDocument]);
  const [document, setDocumentState] = useState(initial);
  const documentRef = useRef(initial);
  const historyRef = useRef<TemplateDocument[]>([structuredClone(initial)]);
  const historyIndexRef = useRef(0);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const clipboardRef = useRef<TemplateLayer[]>([]);

  const replaceDocument = useCallback((next: TemplateDocument) => {
    const normalized = normalizeTemplateDocument(next);
    documentRef.current = normalized;
    setDocumentState(normalized);
  }, []);

  const commitDocument = useCallback(
    (next: TemplateDocument) => {
      const normalized = normalizeTemplateDocument(next);
      const current = historyRef.current[historyIndexRef.current];
      if (JSON.stringify(current) === JSON.stringify(normalized)) return;
      const history = historyRef.current.slice(0, historyIndexRef.current + 1);
      history.push(structuredClone(normalized));
      historyRef.current = history.slice(-80);
      const index = historyRef.current.length - 1;
      historyIndexRef.current = index;
      setHistoryIndex(index);
      replaceDocument(normalized);
    },
    [replaceDocument]
  );

  const updateLayer = useCallback(
    (id: string, patch: Partial<TemplateLayer>, transient = false) => {
      const next = {
        ...documentRef.current,
        layers: documentRef.current.layers.map((layer) =>
          layer.id === id ? ({ ...layer, ...patch } as TemplateLayer) : layer
        )
      };
      if (transient) replaceDocument(next);
      else commitDocument(next);
    },
    [commitDocument, replaceDocument]
  );

  const commitCurrentInteraction = useCallback(() => {
    commitDocument(documentRef.current);
  }, [commitDocument]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    const index = historyIndexRef.current - 1;
    historyIndexRef.current = index;
    setHistoryIndex(index);
    replaceDocument(structuredClone(historyRef.current[index]));
  }, [replaceDocument]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const index = historyIndexRef.current + 1;
    historyIndexRef.current = index;
    setHistoryIndex(index);
    replaceDocument(structuredClone(historyRef.current[index]));
  }, [replaceDocument]);

  const removeSelected = useCallback(() => {
    if (!selectedLayerIds.length) return;
    commitDocument({
      ...documentRef.current,
      layers: documentRef.current.layers.filter((layer) => !selectedLayerIds.includes(layer.id))
    });
    setSelectedLayerIds([]);
  }, [commitDocument, selectedLayerIds]);

  const copySelected = useCallback(() => {
    clipboardRef.current = documentRef.current.layers
      .filter((layer) => selectedLayerIds.includes(layer.id))
      .map((layer) => structuredClone(layer));
  }, [selectedLayerIds]);

  const paste = useCallback(() => {
    if (!clipboardRef.current.length) return;
    const copies = clipboardRef.current.map((layer) => ({
      ...structuredClone(layer),
      id: `${layer.type}-${crypto.randomUUID()}`,
      name: `${layer.name} copy`,
      x: layer.x + 32,
      y: layer.y + 32
    }));
    commitDocument({ ...documentRef.current, layers: [...documentRef.current.layers, ...copies] });
    clipboardRef.current = copies;
    setSelectedLayerIds(copies.map((layer) => layer.id));
  }, [commitDocument]);

  const duplicateSelected = useCallback(() => {
    copySelected();
    paste();
  }, [copySelected, paste]);

  const nudge = useCallback(
    (x: number, y: number) => {
      if (!selectedLayerIds.length) return;
      commitDocument({
        ...documentRef.current,
        layers: documentRef.current.layers.map((layer) =>
          selectedLayerIds.includes(layer.id)
            ? { ...layer, x: layer.x + x, y: layer.y + y }
            : layer
        )
      });
    },
    [commitDocument, selectedLayerIds]
  );

  const alignSelected = useCallback(
    (mode: AlignMode) => {
      const selected = documentRef.current.layers.filter((layer) => selectedLayerIds.includes(layer.id));
      if (!selected.length) return;
      const left = Math.min(...selected.map((layer) => layer.x));
      const top = Math.min(...selected.map((layer) => layer.y));
      const right = Math.max(...selected.map((layer) => layer.x + layer.width));
      const bottom = Math.max(...selected.map((layer) => layer.y + layer.height));
      commitDocument({
        ...documentRef.current,
        layers: documentRef.current.layers.map((layer) => {
          if (!selectedLayerIds.includes(layer.id)) return layer;
          if (mode === "left") return { ...layer, x: left };
          if (mode === "right") return { ...layer, x: right - layer.width };
          if (mode === "center") return { ...layer, x: (left + right - layer.width) / 2 };
          if (mode === "top") return { ...layer, y: top };
          if (mode === "bottom") return { ...layer, y: bottom - layer.height };
          return { ...layer, y: (top + bottom - layer.height) / 2 };
        })
      });
    },
    [commitDocument, selectedLayerIds]
  );

  const distributeSelected = useCallback(
    (axis: "horizontal" | "vertical") => {
      const selected = documentRef.current.layers
        .filter((layer) => selectedLayerIds.includes(layer.id))
        .sort((a, b) => axis === "horizontal" ? a.x - b.x : a.y - b.y);
      if (selected.length < 3) return;
      const start = axis === "horizontal" ? selected[0].x : selected[0].y;
      const last = selected[selected.length - 1];
      const end = axis === "horizontal" ? last.x : last.y;
      const gap = (end - start) / (selected.length - 1);
      const positions = new Map(selected.map((layer, index) => [layer.id, start + gap * index]));
      commitDocument({
        ...documentRef.current,
        layers: documentRef.current.layers.map((layer) =>
          positions.has(layer.id)
            ? { ...layer, [axis === "horizontal" ? "x" : "y"]: positions.get(layer.id)! }
            : layer
        )
      });
    },
    [commitDocument, selectedLayerIds]
  );

  const groupSelected = useCallback(() => {
    if (selectedLayerIds.length < 2) return;
    const groupId = crypto.randomUUID();
    commitDocument({
      ...documentRef.current,
      layers: documentRef.current.layers.map((layer) =>
        selectedLayerIds.includes(layer.id) ? { ...layer, groupId } : layer
      )
    });
  }, [commitDocument, selectedLayerIds]);

  const ungroupSelected = useCallback(() => {
    commitDocument({
      ...documentRef.current,
      layers: documentRef.current.layers.map((layer) =>
        selectedLayerIds.includes(layer.id) ? { ...layer, groupId: undefined } : layer
      )
    });
  }, [commitDocument, selectedLayerIds]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable=true]")) return;
      const command = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (command && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (command && key === "y") {
        event.preventDefault();
        redo();
      } else if (command && key === "c") {
        copySelected();
      } else if (command && key === "v") {
        event.preventDefault();
        paste();
      } else if (command && key === "d") {
        event.preventDefault();
        duplicateSelected();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removeSelected();
      } else if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        const distance = event.shiftKey ? 10 : 1;
        nudge(
          event.key === "ArrowLeft" ? -distance : event.key === "ArrowRight" ? distance : 0,
          event.key === "ArrowUp" ? -distance : event.key === "ArrowDown" ? distance : 0
        );
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [copySelected, duplicateSelected, nudge, paste, redo, removeSelected, undo]);

  return {
    document,
    documentRef,
    historyIndex,
    historyLength: historyRef.current.length,
    selectedLayerIds,
    selectedLayers: document.layers.filter((layer) => selectedLayerIds.includes(layer.id)),
    setSelectedLayerIds,
    replaceDocument,
    commitDocument,
    updateLayer,
    commitCurrentInteraction,
    undo,
    redo,
    removeSelected,
    duplicateSelected,
    alignSelected,
    distributeSelected,
    groupSelected,
    ungroupSelected
  };
}
