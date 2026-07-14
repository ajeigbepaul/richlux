import { createTheme } from "@mui/material/styles";
import tokens from "@/design-tokens";

// Kept in sync with tailwind.config.js by both reading from design-tokens.js --
// MUI previously ran on its stock default theme (no ThemeProvider existed at
// all), which is why the admin table's pagination/delete button were off-brand.
// Now takes the mode explicitly so it can switch live with the site-wide
// light/dark toggle instead of being hardcoded to one mode.
export function getMuiTheme(mode = "light") {
  const isDark = mode === "dark";
  return createTheme({
    palette: {
      mode,
      primary: { main: tokens.brand[400], contrastText: "#ffffff" },
      secondary: { main: tokens.accent[400] },
      error: { main: tokens.danger },
      warning: { main: tokens.warning },
      success: { main: tokens.success },
      background: {
        default: isDark ? tokens.surface[900] : tokens.ink[100],
        paper: isDark ? tokens.surface[800] : "#ffffff",
      },
      text: {
        primary: isDark ? "#f1f5f9" : tokens.ink[900],
        secondary: isDark ? "#94a3b8" : tokens.ink[500],
      },
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: "var(--font-inter), system-ui, sans-serif",
    },
  });
}
