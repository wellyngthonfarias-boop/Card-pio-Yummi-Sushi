"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import type { MenuProduct } from "@/types/menu";
import type { SelectionDraft, SelectionLine } from "@/types/selection";
import { createSelectionStore } from "@/lib/selection-store";
import { emptyDeliveryAddress, type DeliveryAddress } from "@/types/delivery";

type SelectionContextValue = {
  lines: SelectionLine[]; ready: boolean; demo: boolean; opened: boolean;
  message: string; storageWarning: string;
  open: () => void; close: () => void;
  add: (draft: SelectionDraft) => string | null;
  addBatch: (drafts: readonly SelectionDraft[]) => string | null;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void; clear: () => void;
  deliveryAddress: DeliveryAddress;
  setDeliveryAddress: (address: DeliveryAddress) => void;
};
const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ catalog, demo, children }: { catalog: readonly MenuProduct[]; demo: boolean; children: ReactNode }) {
  const [store] = useState(() => createSelectionStore(catalog, demo));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [opened, setOpened] = useState(false);
  // Mantém o endereço apenas na memória desta página, sem gravá-lo no localStorage.
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>(emptyDeliveryAddress);
  useEffect(() => {
    if (!snapshot.message) return;
    const timer = setTimeout(store.dismissMessage, 6500);
    return () => clearTimeout(timer);
  }, [snapshot.message, store]);
  const value: SelectionContextValue = {
    ...snapshot, demo, opened,
    deliveryAddress, setDeliveryAddress,
    open: () => setOpened(true), close: () => setOpened(false),
    add: store.add, addBatch: store.addBatch, setQuantity: store.setQuantity, remove: store.remove, clear: store.clear,
  };
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) throw new Error("Seleção fora do provedor.");
  return context;
}
