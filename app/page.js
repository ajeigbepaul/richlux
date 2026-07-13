import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Listings from "@/components/Listings";
import Richlux from "@/components/Richlux";
import Footer from "@/components/Footer";
export default function Home() {
  return (
    <main className="flex relative flex-col items-center justify-between overflow-x-hidden w-full">
      <Header />
      <div className="w-full">
        <Richlux />
      </div>
      <div className="w-full h-full">
        <Hero />
      </div>
      <div className="w-full h-full">
        <Listings />
      </div>
      <Footer />
    </main>
  );
}
