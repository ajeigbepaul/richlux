// import Header from "@/components/Header";
import Hero from "@/components/Hero";
// import Richlux from "@/components/Richlux";
export default function Home() {
  return (
    <main className="flex relative flex-col items-center justify-between overflow-x-hidden">
      <div className="w-full bg-gray-900 fixed z-30">
        {/* <Header /> */}
      </div>

      <div className="w-screen bg-gray-900">
        {/* <Richlux /> */}
      </div>
      <div className="w-full h-full">
        <Hero />
      </div>
    </main>
  );
}
