import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ListingsBrowser from "@/components/ListingsBrowser";

export default function ListingsPage() {
  return (
    <main className="w-full bg-white dark:bg-surface-900 min-h-screen flex flex-col">
      <Header />
      <Container className="py-10 flex-1">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "All Listings" }]} />
        <ListingsBrowser title="All Listings" basePath="/listings" />
      </Container>
      <Footer />
    </main>
  );
}
