import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ["/", "weekly", 1], ["/menu", "daily", .9], ["/reservations", "weekly", .8],
    ["/visit", "monthly", .7], ["/about", "monthly", .6], ["/allergens", "monthly", .4],
  ].map(([path, changeFrequency, priority]) => ({ url: absoluteUrl(String(path)), changeFrequency, priority })) as MetadataRoute.Sitemap;
}
