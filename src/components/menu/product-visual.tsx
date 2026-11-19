import Image from "next/image";
import type { CSSProperties } from "react";
import type { MenuProduct } from "@/types/menu";

type Crop = readonly [number, number, number, number];
// Presentation windows only: the original promotional files remain intact.
const crops: Record<string, Crop> = {
  "combo-1": [.01, .15, .98, .58], "combo-2": [.035, .21, .93, .62],
  "combo-3": [.07, .22, .86, .62], "combo-4": [.07, .20, .86, .64],
  "combo-5": [.015, .02, .97, .77], "combo-6": [.07, .235, .86, .60],
  "combo-7": [.07, .225, .86, .61], "combo-8": [.015, .04, .97, .79],
  "combo-9": [.025, .25, .95, .46],
  "combo-10": [.015, .27, .97, .48], "combo-11": [.08, .26, .84, .52],
  "combo-12": [.065, .22, .87, .62], "combo-13": [.06, .24, .88, .57],
  "combo-14": [.06, .25, .88, .56], "barca-1": [.025, .22, .95, .63],
  "barca-2": [.025, .20, .95, .65],
};
const categoryCrops: Partial<Record<MenuProduct["category"], Crop>> = {
  hot: [.01, .32, .98, .42], hossomaki: [.01, .32, .98, .43],
  especiais: [.02, .32, .96, .45], niguiri: [.02, .33, .96, .45],
  temaki: [.01, .28, .98, .50], uramaki: [.01, .34, .98, .39],
  porcoes: [.04, .28, .92, .49], complementos: [.04, .29, .92, .50],
  bebidas: [.12, .16, .76, .66],
};

export function ProductVisual({ product, detail = false }: { product: MenuProduct; detail?: boolean }) {
  if (!product.image) return null;
  const width = product.imageWidth ?? 900;
  const height = product.imageHeight ?? 700;
  const alt = product.imageKind === "photo" ? product.name : `Imagem ilustrativa: ${product.name}; a apresentação real pode variar`;
  const crop = product.imageLayout === "poster" ? crops[product.id] ?? categoryCrops[product.category] : null;
  const [x, y, w, h] = crop ?? [0, 0, 1, 1];
  const ratio = width * w / (height * h);
  return <div className={`product-visual ${detail ? "detail-visual" : ""}`}>
    {crop ? <div className="product-visual-window" style={{ "--crop-ratio": ratio } as CSSProperties}><Image src={product.image} alt={alt} width={width} height={height} style={{ width: `${100 / w}%`, height: `${100 / h}%`, left: `${-100 * x / w}%`, top: `${-100 * y / h}%` }} /></div> : <Image src={product.image} alt={alt} width={width} height={height} style={{ width: "100%", height: "100%", objectFit: "contain", minHeight: 0 }} />}
    {product.imageKind !== "photo" && <span className="visual-credit">Imagem ilustrativa</span>}
  </div>;
}
