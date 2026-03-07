import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#ffb6ca" },
          100: { value: "#ff97b4" },
          200: { value: "#ff7898" },
          300: { value: "#ff597c" },
          400: { value: "#ff3a60" },
          500: { value: "#ff1645" },
          600: { value: "#dc003d" },
          700: { value: "#b40032" },
          800: { value: "#8c0027" },
          900: { value: "#64001c" },
        },
      },
      fonts: {
        heading: { value: "var(--font-poppins), sans-serif" },
        body: { value: "var(--font-poppins), sans-serif" },
        mono: { value: "ui-monospace, monospace" },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "white" },
          fg: { value: "{colors.brand.700}" },
          muted: { value: "{colors.brand.100}" },
          subtle: { value: "{colors.brand.50}" },
          emphasized: { value: "{colors.brand.300}" },
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
  },
  globalCss: {
    "html, body": {
      colorPalette: "brand",
    },
  },
});

export const system = createSystem(defaultConfig, config);
