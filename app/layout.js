import Provider from "@/components/Provider";
import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Richlux Properties",
  description: "Your No 1 realtor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
          <Toaster/>
          {/* <Header /> */}
          {children}
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
