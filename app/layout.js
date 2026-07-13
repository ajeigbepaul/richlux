import Provider from "@/components/Provider";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Richlux Properties",
  description: "Your No 1 realtor",
};

// Footer is rendered per-page (not globally) so the dark admin back-office
// doesn't inherit the light public-site footer.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
          <Toaster />
          {children}
        </Provider>
      </body>
    </html>
  );
}
