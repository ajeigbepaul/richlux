import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Listings from "@/components/Listings";
import Richlux from "@/components/Richlux";
import Footer from "@/components/Footer";
import Banner from "@/model/Banner";
import { connectToDB } from "@/utils/database";

// Fetched here (server-side) rather than left to Hero's client-side SWR call
// so the LCP carousel image's real src is present in the initial HTML --
// otherwise the browser can't start downloading it until JS hydrates and the
// /api/banners round-trip resolves, which was adding ~4s to LCP.
async function getBanners() {
  await connectToDB();
  const banners = await Banner.find({ isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .lean();
  return JSON.parse(JSON.stringify(banners));
}

export default async function Home() {
  const initialBanners = await getBanners();

  return (
    <main className="w-full overflow-x-hidden bg-white dark:bg-surface-900 min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <Richlux />
        <Hero initialBanners={initialBanners} />
        <Listings />
      </div>
      <Footer />
    </main>
  );
}
