import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import MainWrapper from "@/components/MainWrapper";
import ScrollToTop from "@/components/ScrollToTop";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Preloader />
      <Header />
      <MainWrapper>{children}</MainWrapper>
      <Footer />
      <ScrollToTop />
    </>
  );
}
