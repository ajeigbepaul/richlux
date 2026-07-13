import { createTheme } from "@mui/material/styles";
import tokens from "@/design-tokens";

// Kept in sync with tailwind.config.js by both reading from design-tokens.js --
// MUI previously ran on its stock default theme (no ThemeProvider existed at
// all), which is why the admin table's pagination/delete button were off-brand.
const muiTheme = createTheme({
  palette: {
    mode: "dark", // admin back-office keeps the dark theme; public site uses Tailwind directly
    primary: { main: tokens.brand[400], contrastText: "#ffffff" },
    secondary: { main: tokens.accent[400] },
    error: { main: tokens.danger },
    warning: { main: tokens.warning },
    success: { main: tokens.success },
    background: {
      default: tokens.surface[900],
      paper: tokens.surface[800],
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: "var(--font-inter), system-ui, sans-serif",
  },
});

export default muiTheme;
