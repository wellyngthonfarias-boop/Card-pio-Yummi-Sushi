import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/menu/hero";
import { MenuShowcase } from "@/components/menu/menu-showcase";

export default function Home() {
  return (
    <div id="inicio">
      <Header />
      <main id="conteudo">
        <Hero />
        <MenuShowcase />
      </main>
      <Footer />
    </div>
  );
}
