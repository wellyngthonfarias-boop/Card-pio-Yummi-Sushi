"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Search, X } from "lucide-react";
import { SectionLabel } from "@/components/ui/section-label";
import { CategoryNav } from "./category-nav";
import { ProductCarousel } from "./product-carousel";
import { categories, comboChangeFee } from "@/data/menu";
import { useCatalog } from "@/components/catalog-provider";
import { formatPrice } from "@/lib/format";
import { filterMenuProducts, groupMenuProducts } from "@/lib/menu-search";
import type { CategoryFilter, MenuCategory, MenuProduct } from "@/types/menu";

const ProductDetails = dynamic(() => import("./product-details").then((module) => module.ProductDetails), { ssr: false, loading: () => <p role="status" className="selection-feedback">Abrindo detalhes…</p> });

export function MenuShowcase({ catalog: suppliedCatalog, menuCategories = categories, demo = false }: { catalog?: readonly MenuProduct[]; menuCategories?: readonly MenuCategory[]; demo?: boolean }) {
  const current = useCatalog();
  const catalog = suppliedCatalog ?? current.products;
  const [active, setActive] = useState<CategoryFilter>("todos");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);
  const products = filterMenuProducts(catalog, menuCategories, active, search);
  const groups = groupMenuProducts(products, menuCategories);
  return (
    <section id="cardapio" aria-labelledby="menu-title" className="menu-section">
      <div className="site-container">
        <div className="menu-heading">{demo && <SectionLabel>Dados fictícios · Sem oferta comercial</SectionLabel>}<h2 id="menu-title">{demo ? "Cardápio de demonstração" : "Nosso cardápio"}</h2></div>
        <div className="menu-search"><Search size={20} aria-hidden="true" /><label htmlFor="menu-search" className="sr-only">Buscar no cardápio</label><input id="menu-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busque por prato, ingrediente ou bebida" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Limpar busca"><X size={18} aria-hidden="true" /></button>}</div>
        <CategoryNav active={active} onChange={(category) => { setActive(category); requestAnimationFrame(() => document.getElementById("produtos")?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })); }} categories={menuCategories} products={catalog} />

        <p role="status" className="result-count">{products.length} {products.length === 1 ? "item encontrado" : "itens encontrados"}</p>
        <div id="produtos">
          {groups.map((category) => <section key={category.id} aria-labelledby={`category-${category.id}`} className="menu-group"><div className="group-heading"><h3 id={`category-${category.id}`}>{category.label}</h3><p>{category.description}</p></div><ProductCarousel key={`${category.id}-${search}`} products={category.products} label={category.label} onOpenDetails={setSelectedProduct} /></section>)}
          {products.length === 0 && <div className="empty-menu"><h3>Nenhum item por aqui.</h3><p>Tente outro termo ou explore todas as categorias.</p><button onClick={() => { setSearch(""); setActive("todos"); }} type="button" className="primary-button">Ver todo o cardápio</button></div>}
        </div>
        <details className="menu-rules"><summary>Informações do cardápio</summary>{demo ? <p>DEMONSTRAÇÃO: produtos e preços fictícios.</p> : <p>Alterações em combos: {formatPrice(comboChangeFee)}. Disponibilidade a confirmar com o restaurante.</p>}<p>As imagens ilustrativas são identificadas nos produtos.</p></details>
        {selectedProduct && <ProductDetails key={selectedProduct.id} product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      </div>
    </section>
  );
}
