import type { Metadata } from "next";
import Link from "next/link";
import { demoCategories, demoProducts } from "@/data/demo-menu";
import { MenuShowcase } from "@/components/menu/menu-showcase";

export const metadata: Metadata = {
  title: "Demonstração com dados fictícios",
  robots: { index: false, follow: false },
  alternates: { canonical: "/demonstracao" },
};

export default function DemoPage() {
  return <main id="conteudo"><div className="site-container py-8"><h1 className="text-2xl font-semibold">Ambiente de demonstração</h1><p className="mt-3 text-muted">Todos os dados abaixo são fictícios e exclusivos para validar os componentes.</p><Link href="/" className="mt-4 inline-flex min-h-11 items-center text-gold underline">Voltar ao cardápio do restaurante</Link></div><MenuShowcase catalog={demoProducts} menuCategories={demoCategories} demo /></main>;
}
