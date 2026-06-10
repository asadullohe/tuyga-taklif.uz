export type GoogleFontCategory = "Serif" | "Script" | "Sans" | "Display";

export type GoogleFontDefinition = {
  family: string;
  category: GoogleFontCategory;
};

export const googleFonts: GoogleFontDefinition[] = [
  { family: "Cormorant Garamond", category: "Serif" },
  { family: "Playfair Display", category: "Serif" },
  { family: "DM Serif Display", category: "Serif" },
  { family: "Libre Baskerville", category: "Serif" },
  { family: "Lora", category: "Serif" },
  { family: "Merriweather", category: "Serif" },
  { family: "Bodoni Moda", category: "Serif" },
  { family: "Prata", category: "Serif" },
  { family: "Marcellus", category: "Serif" },
  { family: "Cinzel", category: "Serif" },
  { family: "EB Garamond", category: "Serif" },
  { family: "Crimson Pro", category: "Serif" },
  { family: "Spectral", category: "Serif" },
  { family: "Vollkorn", category: "Serif" },
  { family: "Cardo", category: "Serif" },
  { family: "Italiana", category: "Serif" },
  { family: "Great Vibes", category: "Script" },
  { family: "Allura", category: "Script" },
  { family: "Alex Brush", category: "Script" },
  { family: "Parisienne", category: "Script" },
  { family: "Sacramento", category: "Script" },
  { family: "Tangerine", category: "Script" },
  { family: "Italianno", category: "Script" },
  { family: "Pinyon Script", category: "Script" },
  { family: "Mrs Saint Delafield", category: "Script" },
  { family: "Petit Formal Script", category: "Script" },
  { family: "Dancing Script", category: "Script" },
  { family: "Caveat", category: "Script" },
  { family: "Montserrat", category: "Sans" },
  { family: "Raleway", category: "Sans" },
  { family: "Manrope", category: "Sans" },
  { family: "Nunito Sans", category: "Sans" },
  { family: "Josefin Sans", category: "Sans" },
  { family: "Jost", category: "Sans" },
  { family: "Lato", category: "Sans" },
  { family: "Poppins", category: "Sans" },
  { family: "Source Sans 3", category: "Sans" },
  { family: "Work Sans", category: "Sans" },
  { family: "Quicksand", category: "Sans" },
  { family: "Forum", category: "Display" },
  { family: "Poiret One", category: "Display" },
  { family: "Yeseva One", category: "Display" },
  { family: "Cormorant Unicase", category: "Display" },
  { family: "Unbounded", category: "Display" },
  { family: "Abril Fatface", category: "Display" },
  { family: "Lobster Two", category: "Display" },
  { family: "Marck Script", category: "Display" },
  { family: "Oranienbaum", category: "Display" }
];

const loadedFamilies = new Set<string>();
let fontLink: HTMLLinkElement | null = null;
let fontCssReady: Promise<void> = Promise.resolve();

export function isGoogleFont(family: string) {
  return googleFonts.some((font) => font.family === family);
}

export function loadGoogleFonts(families: string[]) {
  if (typeof document === "undefined") return Promise.resolve();

  for (const family of families) {
    if (isGoogleFont(family)) loadedFamilies.add(family);
  }
  if (!loadedFamilies.size) return Promise.resolve();

  const query = [...loadedFamilies]
    .sort()
    .map((family) => `family=${encodeURIComponent(family).replace(/%20/g, "+")}`)
    .join("&");
  const href = `https://fonts.googleapis.com/css2?${query}&display=swap`;

  if (!fontLink) {
    fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.dataset.taklifGoogleFonts = "true";
    document.head.appendChild(fontLink);
  }
  if (fontLink.getAttribute("href") !== href) {
    fontCssReady = new Promise((resolve) => {
      fontLink!.addEventListener("load", () => resolve(), { once: true });
      fontLink!.addEventListener("error", () => resolve(), { once: true });
    });
    fontLink.href = href;
  }

  return fontCssReady
    .then(() =>
      Promise.all(
        families.map((family) =>
          document.fonts.load(`600 24px "${family}"`).catch(() => [])
        )
      )
    )
    .then(() => undefined);
}
