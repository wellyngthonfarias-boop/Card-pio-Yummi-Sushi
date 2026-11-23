import type { MenuProduct } from "@/types/menu";
export function separateTemakis(products: readonly MenuProduct[]): MenuProduct[] {
  const result = structuredClone([...products]);
  const flavors = [{ id: "kani", name: "Temaki de kani Hot" }, { id: "camarao", name: "Temaki de camarão Hot" }, { id: "salmao", name: "Temaki de salmão Hot" }, { id: "misto", name: "Temaki misto Hot" }];
  const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  for (const flavor of flavors) {
    const base = result.find(p=>p.id===`temaki-${flavor.id}`);
    if(!base) continue;
    base.unitLabel="1 unidade";
    base.options=base.options?.filter(o=>o.name!=="Preparo");
    const existing=result.find(p=>p.category==="temaki" && normalize(p.name).includes("hot") && normalize(p.name).includes(flavor.id));
    const hot: MenuProduct = { ...base, ...(existing??{}), id:existing?.id??`temaki-${flavor.id}-hot`, name:flavor.name, price:37, unitLabel:"1 unidade", description:`Temaki Hot empanado. ${base.description}`, ingredients:[...base.ingredients], options:base.options, image:"/images/products/temaki-hot-yummi.webp", imageKind:"illustration", imageLayout:undefined, imagePrice:undefined, imageWidth:undefined, imageHeight:undefined };
    if(existing) Object.assign(existing,hot); else result.push(hot);
  }
  return result;
}
