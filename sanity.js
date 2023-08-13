import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
export const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: "2023-05-03",
  token: process.env.SANITY_API_TOKEN,
  useCdn:"production",
});
const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);
