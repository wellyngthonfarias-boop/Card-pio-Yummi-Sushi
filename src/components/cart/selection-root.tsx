"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { menuProducts } from "@/data/menu";
import { demoProducts } from "@/data/demo-menu";
import { SelectionProvider, useSelection } from "./selection-context";
import { SelectionAccess } from "./selection-access";
const SelectionDrawer = dynamic(() => import("./selection-drawer").then((module) => module.SelectionDrawer), { ssr: false, loading: () => <p role="status" className="selection-feedback">Abrindo pedido…</p> });

function SelectionPanels() {
  const { opened } = useSelection();
  return opened ? <SelectionDrawer /> : null;
}

export function SelectionRoot({ children }: { children: ReactNode }) {
  const demo = usePathname().startsWith("/demonstracao");
  return <SelectionProvider key={demo ? "demo" : "restaurant"} demo={demo} catalog={demo ? demoProducts : menuProducts}>{children}<SelectionAccess /><SelectionPanels /></SelectionProvider>;
}
