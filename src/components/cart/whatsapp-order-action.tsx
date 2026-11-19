"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { menuProducts } from "@/data/menu";
import { prepareWhatsAppOrder } from "@/lib/whatsapp";
import { useSelection } from "./selection-context";

export function WhatsAppOrderAction() {
  const selection = useSelection();
  const [error, setError] = useState("");
  const prepared = selection.demo ? { ok: false as const, error: "Produtos fictícios não podem ser enviados ao WhatsApp do restaurante." } : prepareWhatsAppOrder(selection.lines, menuProducts);
  const blocked = !selection.ready || !prepared.ok;

  function openWhatsApp() {
    setError("");
    const current = prepareWhatsAppOrder(selection.lines, menuProducts);
    if (selection.demo || !current.ok) { setError(selection.demo ? "A demonstração não envia pedidos reais." : current.ok ? "" : current.error); return; }
    // Uma abertura HTTPS por clique. Nenhum envio de mensagem, limpeza ou confirmação de pedido.
    try {
      window.open(current.url, "_blank", "noopener,noreferrer");
    } catch { setError("Não foi possível abrir o WhatsApp. Tente novamente."); }
  }

  return <section className="whatsapp-action" aria-label="Pedido pelo WhatsApp">
    <button type="button" className="primary-button whatsapp-button full-width" disabled={blocked} onClick={openWhatsApp}><MessageCircle size={21} aria-hidden="true" />Fazer pedido pelo WhatsApp</button>
    {(!prepared.ok && selection.lines.length > 0) && <p className="form-error">{prepared.error}</p>}
    {error && <p role="alert" className="form-error">{error}</p>}
  </section>;
}
