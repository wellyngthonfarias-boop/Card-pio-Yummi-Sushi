import type { CategoryFilter, MenuCategory, MenuProduct } from "@/types/menu";

export function CategoryNav({ active, onChange, categories, products }: { active: CategoryFilter; onChange: (id: CategoryFilter) => void; categories: readonly MenuCategory[]; products: readonly MenuProduct[] }) {
  const options = [{ id: "todos" as const, label: "Todos" }, ...categories];
  return (
    <nav id="categorias" aria-label="Categorias do cardápio" className="category-scroll">
      <div className="category-list">{options.map((category) => (
        <button key={category.id} type="button" aria-label={category.label} aria-pressed={active === category.id} aria-controls="produtos" onClick={() => onChange(category.id)} className={`category-button ${active === category.id ? "active" : ""}`}>
          {category.label}<span aria-hidden="true" className="category-count">{category.id === "todos" ? products.length : products.filter((product) => product.category === category.id).length}</span>
        </button>
      ))}</div>
    </nav>
  );
}
