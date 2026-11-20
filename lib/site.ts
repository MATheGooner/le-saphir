export const SITE_URL =
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const RESTAURANT = {
  name: "Le Saphir",
  telephone: "+33 1 84 25 03 72",
  email: "bonjour@lesaphir-paris.fr",
  streetAddress: "42 rue du Bac",
  postalCode: "75007",
  city: "Paris",
  country: "FR",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}