import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Listings from "@/components/Listings";
import Richlux from "@/components/Richlux";
import Footer from "@/components/Footer";
export default function Home() {
  return (
    <main className="w-full overflow-x-hidden bg-white dark:bg-surface-900">
      <Header />
      <Richlux />
      <Hero />
      <Listings />
      <Footer />
    </main>
  );
}
