import type { MenuProduct } from "@/types/menu";
import type { SelectionDraft, SelectionLine } from "@/types/selection";
import { changeLineQuantity, MAX_LINES, resolveSelectionLine, restoreSelection, serializeSelection } from "./selection.ts";

type Snapshot = { lines: SelectionLine[]; ready: boolean; message: string; storageWarning: string };
type StorageAccess = Pick<Storage, "getItem" | "setItem">;

// External browser state: one hydration-safe snapshot and no write-back loop on storage events.
export function createSelectionStore(catalog: readonly MenuProduct[], demo: boolean, getStorage: () => StorageAccess = () => window.localStorage) {
  const storageKey = demo ? "yummi.selection.demo.v1" : "yummi.selection.v1";
  const serverSnapshot: Snapshot = { lines: [], ready: false, message: "", storageWarning: "" };
  let snapshot = serverSnapshot;
  const listeners = new Set<() => void>();
  function update(next: Partial<Snapshot>) { snapshot = { ...snapshot, ...next }; for (const listener of listeners) listener(); }
  function persist() {
    try { getStorage().setItem(storageKey, serializeSelection(snapshot.lines)); }
    catch { update({ storageWarning: "Não foi possível salvar a seleção neste navegador. Ela continua disponível nesta página." }); }
  }
  function commit(lines: SelectionLine[], message: string) { update({ lines, message }); persist(); }
  function receive(serialized: string | null) {
    const restored = restoreSelection(serialized, catalog, demo);
    update({ lines: restored.lines, message: restored.notices.join(" ") || "Seleção atualizada em outra aba." });
  }
  function synchronize(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) receive(event.newValue);
  }
  function initialize() {
    if (snapshot.ready) return;
    try {
      const restored = restoreSelection(getStorage().getItem(storageKey), catalog, demo);
      update({ ready: true, lines: restored.lines, message: restored.notices.join(" ") });
      persist();
    } catch { update({ ready: true, storageWarning: "Seu navegador não permite salvar a seleção. Ela funcionará enquanto esta página estiver aberta." }); }
  }
  return {
    storageKey,
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      initialize();
      if (listeners.size === 1 && typeof window !== "undefined") window.addEventListener("storage", synchronize);
      return () => { listeners.delete(listener); if (listeners.size === 0 && typeof window !== "undefined") window.removeEventListener("storage", synchronize); };
    },
    receive,
    dismissMessage: () => { if (snapshot.message) update({ message: "" }); },
    add: (draft: SelectionDraft): string | null => {
      if (!snapshot.ready) return "Aguarde a recuperação da seleção.";
      if (snapshot.lines.length >= MAX_LINES) return "Limite de 100 itens diferentes na seleção.";
      const result = resolveSelectionLine(draft, catalog, demo);
      if (!result.ok) return result.error;
      if (snapshot.lines.some((line) => line.id === result.line.id)) return "Este item já foi adicionado.";
      commit([...snapshot.lines, result.line], `${result.line.quantity} × ${result.line.product.name} adicionado à seleção.`);
      return null;
    },
    setQuantity: (id: string, quantity: number) => commit(changeLineQuantity(snapshot.lines, id, quantity, catalog, demo), quantity === 0 ? "Item removido da seleção." : "Quantidade atualizada."),
    remove: (id: string) => commit(snapshot.lines.filter((line) => line.id !== id), "Item removido da seleção."),
    clear: () => commit([], "Seleção limpa."),
  };
}
