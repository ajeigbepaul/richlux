import Provider from "@/components/Provider";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Richlux Properties",
  description: "Your No 1 realtor",
};

// Sets the `dark` class before React hydrates so there's no flash of the
// wrong theme -- must run synchronously, before paint, hence a plain inline
// script rather than doing this in lib/ThemeContext.jsx's useEffect (which
// only runs after the initial render).
const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem("richlux-theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

// Footer is rendered per-page (not globally) so the dark admin back-office
// doesn't inherit the light public-site footer.
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={inter.className}>
        <Provider>
          <Toaster />
          {children}
        </Provider>
      </body>
    </html>
  );
}
