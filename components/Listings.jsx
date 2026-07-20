import Container from "@/components/ui/Container";
import ListingsBrowser from "@/components/ListingsBrowser";

// Full browse-and-filter experience embedded directly on the homepage --
// previously this was a 6-item "Featured Properties" preview with a "View
// all listings" link to /listings, which meant an extra click before anyone
// could actually filter. basePath="/" so category/filter changes update the
// homepage's own URL in place instead of navigating to /listings.
function Listings() {
  return (
    <div className="bg-ink-100 dark:bg-surface-950 py-16">
      <Container>
        <ListingsBrowser title="Browse Listings" basePath="/" />
      </Container>
    </div>
  );
}

export default Listings;
