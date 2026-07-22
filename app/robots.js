const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin back-office, raw API routes, and a signed-in user's private
        // request history -- nothing here is meant to be publicly indexed.
        disallow: ["/admin", "/api", "/my-requests"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
