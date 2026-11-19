import type { Metadata } from "next";
import { restaurant } from "@/data/restaurant";
import "./globals.css";
import { SelectionRoot } from "@/components/cart/selection-root";
import { themeInitializationScript } from "@/lib/theme";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined)
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
  || "https://yummi-sushi-delivery.beadedcatkin.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  title: { default: restaurant.name, template: "%s | Yummi Sushi Delivery" },
  description: restaurant.description,
  applicationName: restaurant.name,
  openGraph: {
    title: restaurant.name,
    description: restaurant.description,
    locale: "pt_BR",
    type: "website",
    siteName: restaurant.name,
    url: "/",
    images: [{ url: "/brand/yummi-sushi-social.png", width: 1200, height: 630, alt: "Yummi Sushi Delivery — Cardápio digital" }],
  },
  twitter: { card: "summary_large_image", title: restaurant.name, description: restaurant.description, images: ["/brand/yummi-sushi-social.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} /></head>
      <body className="antialiased">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-gold focus:p-4 focus:text-background">Pular para o conteúdo</a>
        <SelectionRoot>{children}</SelectionRoot>
      </body>
    </html>
  );
}
