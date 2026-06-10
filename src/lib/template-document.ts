import type {
  TemplateDocument,
  TemplateLayer,
  TemplateLayerPermissions,
  WeddingFormData
} from "@/types";

const weddingBindings: Array<keyof WeddingFormData> = [
  "brideName",
  "groomName",
  "eventDate",
  "eventTime",
  "venueName",
  "venueAddress",
  "hostText"
];

export const templateTextBindings = weddingBindings;

export const defaultLayerPermissions: TemplateLayerPermissions = {
  editable: true,
  movable: true,
  resizable: true,
  rotatable: true,
  deletable: false,
  styleEditable: true,
  cropEditable: true
};

export function getLayerPermissions(layer: TemplateLayer): TemplateLayerPermissions {
  return {
    ...defaultLayerPermissions,
    ...layer.permissions
  };
}

export const starterTemplateDocument: TemplateDocument = {
  version: 1,
  width: 1080,
  height: 1920,
  background: "#f4eadb",
  layers: [
    {
      id: "paper-panel",
      name: "Asosiy panel",
      type: "shape",
      x: 72,
      y: 72,
      width: 936,
      height: 1776,
      rotation: 0,
      opacity: 1,
      locked: true,
      visible: true,
      fill: "#fffaf2",
      stroke: "#a67c52",
      strokeWidth: 2,
      radius: 44
    },
    {
      id: "starter-floral-left",
      name: "Chap gul bezagi",
      type: "ornament",
      ornament: "floral-corner",
      x: 94,
      y: 92,
      width: 270,
      height: 270,
      rotation: 0,
      opacity: 0.9,
      locked: false,
      visible: true,
      permissions: { ...defaultLayerPermissions },
      color: "#9a743f",
      secondaryColor: "#eadab8",
      strokeWidth: 2.4
    },
    {
      id: "starter-floral-right",
      name: "O'ng gul bezagi",
      type: "ornament",
      ornament: "floral-corner",
      x: 716,
      y: 92,
      width: 270,
      height: 270,
      rotation: 90,
      opacity: 0.9,
      locked: false,
      visible: true,
      permissions: { ...defaultLayerPermissions },
      color: "#9a743f",
      secondaryColor: "#eadab8",
      strokeWidth: 2.4
    },
    {
      id: "starter-divider",
      name: "Royal ajratgich",
      type: "ornament",
      ornament: "royal-divider",
      x: 290,
      y: 340,
      width: 500,
      height: 90,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      permissions: { ...defaultLayerPermissions },
      color: "#9a743f",
      secondaryColor: "#eadab8",
      strokeWidth: 2
    },
    {
      id: "eyebrow",
      name: "Yuqori yozuv",
      type: "text",
      x: 170,
      y: 230,
      width: 740,
      height: 70,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      text: "NIKOH TO'YI",
      color: "#8a6645",
      fontFamily: "Cinzel",
      fontSize: 30,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: 12,
      align: "center"
    },
    {
      id: "groom-name",
      name: "Kuyov ismi",
      type: "text",
      x: 120,
      y: 485,
      width: 840,
      height: 150,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      text: "Ali",
      binding: "groomName",
      color: "#1f2b25",
      fontFamily: "Great Vibes",
      fontSize: 112,
      fontWeight: 500,
      lineHeight: 1,
      letterSpacing: 1,
      align: "center"
    },
    {
      id: "ampersand",
      name: "Bog'lovchi",
      type: "text",
      x: 420,
      y: 650,
      width: 240,
      height: 100,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      text: "&",
      color: "#a67c52",
      fontFamily: "Great Vibes",
      fontSize: 72,
      fontWeight: 400,
      lineHeight: 1,
      letterSpacing: 0,
      align: "center"
    },
    {
      id: "bride-name",
      name: "Kelin ismi",
      type: "text",
      x: 120,
      y: 770,
      width: 840,
      height: 150,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      text: "Zebo",
      binding: "brideName",
      color: "#1f2b25",
      fontFamily: "Great Vibes",
      fontSize: 112,
      fontWeight: 500,
      lineHeight: 1,
      letterSpacing: 1,
      align: "center"
    },
    {
      id: "invite-copy",
      name: "Taklif matni",
      type: "text",
      x: 180,
      y: 1040,
      width: 720,
      height: 190,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      text: "Sizni nikoh to'yimizga lutfan taklif qilamiz.",
      binding: "hostText",
      color: "#5c625f",
      fontFamily: "Cormorant Garamond",
      fontSize: 38,
      fontWeight: 400,
      lineHeight: 1.45,
      letterSpacing: 0,
      align: "center"
    },
    {
      id: "date",
      name: "Sana",
      type: "text",
      x: 190,
      y: 1340,
      width: 700,
      height: 80,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      text: "2026-09-12",
      binding: "eventDate",
      color: "#8a6645",
      fontFamily: "Cinzel",
      fontSize: 42,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: 6,
      align: "center"
    },
    {
      id: "venue",
      name: "To'yxona",
      type: "text",
      x: 150,
      y: 1500,
      width: 780,
      height: 130,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      text: "Navro'z Palace",
      binding: "venueName",
      color: "#1f2b25",
      fontFamily: "Cormorant Garamond",
      fontSize: 44,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: 2,
      align: "center"
    }
  ]
};

export function cloneStarterTemplateDocument(): TemplateDocument {
  return normalizeTemplateDocument(structuredClone(starterTemplateDocument));
}

export function normalizeTemplateDocument(document: TemplateDocument): TemplateDocument {
  return {
    ...structuredClone(document),
    version: 2,
    timeline: document.timeline ?? { durationMs: 6000 },
    layers: document.layers.map((layer) => ({
      ...layer,
      permissions: {
        ...defaultLayerPermissions,
        ...layer.permissions
      },
      motion: layer.motion ?? {
        startMs: 0,
        durationMs: 700,
        easing: "ease-out",
        enter: "none",
        exit: "none"
      }
    }))
  };
}

export function resolveLayerText(layer: TemplateLayer, data?: Partial<WeddingFormData>) {
  if (layer.type !== "text" || !layer.binding || !data) return layer.type === "text" ? layer.text : "";
  const value = data[layer.binding];
  return typeof value === "string" && value.length > 0 ? value : layer.text;
}

export function sanitizeUserDesignDocument(
  current: TemplateDocument,
  candidate: TemplateDocument
): TemplateDocument {
  const normalizedCurrent = normalizeTemplateDocument(current);
  const normalizedCandidate = normalizeTemplateDocument(candidate);
  const candidateLayers = new Map(normalizedCandidate.layers.map((layer) => [layer.id, layer]));
  const layers: TemplateLayer[] = [];

  for (const currentLayer of normalizedCurrent.layers) {
    const candidateLayer = candidateLayers.get(currentLayer.id);
    const permissions = getLayerPermissions(currentLayer);

    if (!candidateLayer) {
      if (!permissions.deletable) layers.push(currentLayer);
      continue;
    }

    if (candidateLayer.type !== currentLayer.type) {
      layers.push(currentLayer);
      continue;
    }

    const nextLayer = { ...currentLayer } as TemplateLayer;

    if (permissions.movable) {
      nextLayer.x = candidateLayer.x;
      nextLayer.y = candidateLayer.y;
    }
    if (permissions.resizable) {
      nextLayer.width = candidateLayer.width;
      nextLayer.height = candidateLayer.height;
    }
    if (permissions.rotatable) nextLayer.rotation = candidateLayer.rotation;
    if (permissions.styleEditable) {
      nextLayer.opacity = candidateLayer.opacity;
      nextLayer.shadow = candidateLayer.shadow;
      nextLayer.blur = candidateLayer.blur;
    }

    if (nextLayer.type === "text" && candidateLayer.type === "text") {
      if (permissions.editable) nextLayer.text = candidateLayer.text;
      if (permissions.styleEditable) {
        nextLayer.color = candidateLayer.color;
        nextLayer.fontFamily = candidateLayer.fontFamily;
        nextLayer.fontSize = candidateLayer.fontSize;
        nextLayer.fontWeight = candidateLayer.fontWeight;
        nextLayer.lineHeight = candidateLayer.lineHeight;
        nextLayer.letterSpacing = candidateLayer.letterSpacing;
        nextLayer.align = candidateLayer.align;
      }
    }

    if (nextLayer.type === "shape" && candidateLayer.type === "shape" && permissions.styleEditable) {
      nextLayer.fill = candidateLayer.fill;
      nextLayer.stroke = candidateLayer.stroke;
      nextLayer.strokeWidth = candidateLayer.strokeWidth;
      nextLayer.radius = candidateLayer.radius;
      nextLayer.backgroundImage = candidateLayer.backgroundImage;
    }

    if (nextLayer.type === "image" && candidateLayer.type === "image") {
      if (permissions.editable) nextLayer.src = candidateLayer.src;
      if (permissions.styleEditable) {
        nextLayer.fit = candidateLayer.fit;
        nextLayer.radius = candidateLayer.radius;
      }
      if (permissions.cropEditable) {
        nextLayer.crop = candidateLayer.crop;
        nextLayer.focalX = candidateLayer.focalX;
        nextLayer.focalY = candidateLayer.focalY;
        nextLayer.flipX = candidateLayer.flipX;
        nextLayer.flipY = candidateLayer.flipY;
      }
    }

    if (nextLayer.type === "ornament" && candidateLayer.type === "ornament" && permissions.styleEditable) {
      nextLayer.color = candidateLayer.color;
      nextLayer.secondaryColor = candidateLayer.secondaryColor;
      nextLayer.strokeWidth = candidateLayer.strokeWidth;
    }

    layers.push(nextLayer);
  }

  return {
    ...normalizedCurrent,
    layers
  };
}
