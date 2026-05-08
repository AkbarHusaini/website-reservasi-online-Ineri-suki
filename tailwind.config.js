/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "surface-bright": "#393939",
        "surface-container": "#201f1f",
        "tertiary-fixed": "#ffdbcf",
        "background": "#131313",
        "on-primary-fixed": "#001f2a",
        "surface-variant": "#353534",
        "on-secondary-fixed": "#111d23",
        "on-secondary-container": "#aab7bf",
        "outline": "#8d9195",
        "tertiary-container": "#9c3400",
        "on-surface": "#e5e2e1",
        "inverse-surface": "#e5e2e1",
        "surface-container-low": "#1c1b1b",
        "on-tertiary-fixed": "#380d00",
        "tertiary-fixed-dim": "#ffb59a",
        "secondary-container": "#3c494f",
        "on-secondary": "#263238",
        "on-tertiary-fixed-variant": "#802a00",
        "surface-container-highest": "#353534",
        "secondary": "#bbc8d0",
        "on-secondary-fixed-variant": "#3c494f",
        "on-error-container": "#ffdad6",
        "surface-dim": "#131313",
        "outline-variant": "#42474b",
        "primary-fixed": "#c9e7f7",
        "surface": "#131313",
        "on-tertiary": "#5b1b00",
        "on-primary-container": "#b4d2e2",
        "tertiary": "#ffb59a",
        "error-container": "#93000a",
        "on-primary": "#163440",
        "error": "#ffb4ab",
        "secondary-fixed": "#d7e4ec",
        "secondary-fixed-dim": "#bbc8d0",
        "on-surface-variant": "#c3c7cb",
        "on-tertiary-container": "#ffbea7",
        "on-error": "#690005",
        "inverse-primary": "#466270",
        "surface-container-lowest": "#0e0e0e",
        "inverse-on-surface": "#313030",
        "surface-container-high": "#2a2a2a",
        "primary": "#adcbda",
        "surface-tint": "#adcbda",
        "on-background": "#e5e2e1",
        "primary-container": "#3e5b68",
        "primary-fixed-dim": "#adcbda",
        "on-primary-fixed-variant": "#2e4b57"
      },
      "borderRadius": {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      "fontFamily": {
        "headline": ["Manrope"],
        "body": ["Manrope"],
        "label": ["Manrope"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
