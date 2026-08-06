import type { Metadata } from "next";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/hind/300.css";
import "@fontsource/hind/400.css";
import "@fontsource/hind/500.css";
import "@fontsource/hind/600.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import MainWrapper from "@/components/MainWrapper";
import ScrollToTop from "@/components/ScrollToTop";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.name} — Creative Agency`,
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-paper text-ink">
        <Preloader />
        <Header />
        <MainWrapper>{children}</MainWrapper>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}
