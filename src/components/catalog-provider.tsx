"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { menuProducts, restaurantInfo } from "@/data/menu";
import { deliveryZones } from "@/data/delivery";
import { validCatalog, type CatalogDocument } from "@/lib/catalog-document";
const initial: CatalogDocument = { products: menuProducts, zones: [...deliveryZones], hours: restaurantInfo.hours, revision: 0 };
type CatalogState = CatalogDocument & { ready: boolean; failed: boolean };
const CatalogContext = createContext<CatalogState>({...initial,ready:false,failed:false});
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [document, setDocument] = useState<CatalogState>({...initial,ready:false,failed:false});
  useEffect(() => {
    const refresh = () => { void fetch("/api/catalog", { cache: "no-store" }).then(r=>r.ok?r.json():null).then(d=>{if(!validCatalog(d))throw new Error();setDocument({...d,ready:true,failed:false});}).catch(()=>setDocument(current=>({...current,ready:false,failed:true}))); };
    refresh(); window.addEventListener("focus",refresh); return ()=>window.removeEventListener("focus",refresh);
  }, []);
  return <CatalogContext.Provider value={document}>{document.failed && <p role="status" className="clear-confirm">Não foi possível atualizar o cardápio. Recarregue a página para continuar seu pedido.</p>}{children}</CatalogContext.Provider>;
}
export const useCatalog = () => useContext(CatalogContext);
