"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { formatCents, priceSelection, selectionTotals, toCents } from "@/lib/selection";
import { COMPLEMENT_EXTRA_CENTS, isCourtesyComplement } from "@/lib/complement-policy";
import { ProductVisual } from "@/components/menu/product-visual";
import { useSelection } from "./selection-context";
import { QuantityControl } from "./quantity-control";
import { WhatsAppOrderAction } from "./whatsapp-order-action";

export function SelectionDrawer() {
  const { opened } = useSelection();
  return opened ? <SelectionDialog /> : null;
}

function SelectionDialog() {
  const selection = useSelection();
  const [waiter, setWaiter] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const totals = selectionTotals(selection.lines);
  return <Modal title={waiter ? "Mostrar ao garçom" : "Meu pedido"} onClose={selection.close} className="selection-dialog"><div className="selection-content">
    {selection.demo && <p className="demo-note">DEMONSTRAÇÃO · Produtos e preços fictícios. Esta lista não é um pedido.</p>}
    <h2 className="selection-title">{waiter ? "Nossa escolha para a mesa" : "Meu pedido"}</h2>
    {selection.storageWarning && <p role="status" className="form-error">{selection.storageWarning}</p>}
    {selection.lines.length === 0 ? <><div className="selection-empty"><ShoppingBag size={38} aria-hidden="true" /><h3>Sua seleção está vazia</h3><p>Explore o cardápio e adicione seus favoritos.</p><button type="button" className="primary-button" onClick={selection.close}>Explorar cardápio</button></div>{!waiter && <WhatsAppOrderAction />}</> : <>
      {!waiter && <div className="selection-tools"><p>{totals.quantity} {totals.quantity === 1 ? "produto selecionado" : "produtos selecionados"}</p><button type="button" onClick={() => setConfirmClear(true)} className="text-action">Limpar seleção</button></div>}
      {confirmClear && !waiter && <section className="clear-confirm" aria-label="Confirmar limpeza da seleção"><h3>Limpar toda a seleção?</h3><p>Todos os itens e observações serão removidos.</p><div><button type="button" onClick={() => setConfirmClear(false)} autoFocus className="secondary-button">Cancelar</button><button type="button" onClick={() => { selection.clear(); setConfirmClear(false); }} className="danger-button">Confirmar limpeza</button></div></section>}
      <ul className={`selection-lines ${waiter ? "waiter-lines" : ""}`}>{priceSelection(selection.lines).map((line) => <li key={line.id} className="selection-line">
        {!waiter && line.product.image && (isCourtesyComplement(line.product) || line.product.imageLayout === "poster" ? <div className="selection-item-image complement-thumbnail"><ProductVisual product={line.product} /></div> : <Image src={line.product.image} alt={line.product.imageKind === "photo" ? line.product.name : "Imagem ilustrativa do item"} width={96} height={80} className={`selection-item-image ${line.product.imageKind === "photo" ? "selection-item-photo" : ""}`} />)}
        <div className="selection-item-main"><h3>{waiter ? `${line.quantity} × ` : ""}{line.product.name}</h3>{line.product.unitLabel && <p className="selection-unit">{line.product.unitLabel}</p>}
          {Object.entries(line.choices).map(([name, values]) => values.length > 0 && <p key={name} className="selection-option"><strong>{name}:</strong> {values.map((value, index) => values.length > 1 ? `${index + 1}º: ${value}` : value).join(" · ")}</p>)}
          {line.addons.length > 0 && <ul className="selection-addon-list">{line.addons.map((addon) => <li key={addon.id}>{addon.name} · + {formatCents(toCents(addon.price))} por unidade</li>)}</ul>}
          {line.notes && <p className="selection-observation"><strong>Observação:</strong> {line.notes}</p>}
          {line.courtesyQuantity > 0 && <p className="selection-option">1 unidade de cortesia neste pedido.</p>}
          {isCourtesyComplement(line.product) ? line.quantity > line.courtesyQuantity && <p className="selection-unit">Complementos extras: {line.quantity - line.courtesyQuantity} × {formatCents(COMPLEMENT_EXTRA_CENTS)}</p> : !waiter && <p className="selection-unit">Unitário{line.addons.length ? " com adicionais" : ""}: {formatCents(line.unitPriceCents)}</p>}
          {!waiter && <div className="selection-item-controls"><QuantityControl value={line.quantity} onChange={(quantity) => selection.setQuantity(line.id, quantity)} label={line.product.name} allowRemove /><button type="button" onClick={() => selection.remove(line.id)} aria-label={`Remover ${line.product.name}`} className="remove-item"><Trash2 size={18} aria-hidden="true" />Remover</button></div>}
        </div><p className="selection-item-subtotal"><span>Subtotal</span>{formatCents(line.subtotalCents)}</p>
      </li>)}</ul>
      <div className="selection-total"><span>Subtotal da seleção</span><strong>{formatCents(totals.subtotalCents)}</strong></div>
      {waiter ? <button type="button" className="secondary-button full-width" onClick={() => setWaiter(false)}>Voltar ao meu pedido</button> : <><WhatsAppOrderAction /><button type="button" className="secondary-button full-width" onClick={() => { setConfirmClear(false); setWaiter(true); }}>Mostrar ao garçom</button></>}
    </>}
  </div></Modal>;
}
