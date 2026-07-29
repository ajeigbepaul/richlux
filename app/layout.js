import Provider from "@/components/Provider";
import "./globals.css";
import { Inter, Rochester, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";

// tailwind.config.js's fontFamily.sans/display/serif reference `var(--font-
// inter)`/`var(--font-rochester)`/`var(--font-playfair)` -- these `variable`
// names are what actually define those CSS custom properties. Without them,
// the utilities silently fall back to their generic last resort (system-ui,
// the browser's default cursive font, or plain serif) instead of the fonts
// actually being loaded below.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const rochester = Rochester({ subsets: ["latin"], weight: "400", variable: "--font-rochester" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-playfair",
});

// Falls back to localhost since NEXTAUTH_URL isn't set to a real production
// domain yet -- set NEXT_PUBLIC_SITE_URL once this is deployed so Open
// Graph/canonical URLs (and app/sitemap.js) resolve to the real domain
// instead of localhost.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

const description =
  "Richlux Properties connects you with verified house sales, rentals, shortlets, land sales, and property management across Lagos and Ibadan.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Richlux Properties",
    template: "%s | Richlux Properties",
  },
  description,
  keywords: [
    "Richlux Properties",
    "Lagos real estate",
    "Ibadan real estate",
    "house for sale Nigeria",
    "apartment for rent Nigeria",
    "shortlet Nigeria",
    "land for sale Nigeria",
  ],
  openGraph: {
    type: "website",
    siteName: "Richlux Properties",
    title: "Richlux Properties",
    description,
    images: [{ url: "/richlux.png", width: 768, height: 325, alt: "Richlux Properties" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Richlux Properties",
    description,
    images: ["/richlux.png"],
  },
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${rochester.variable} ${playfair.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        <Provider>
          <Toaster />
          {children}
        </Provider>
      </body>
    </html>
  );
}
