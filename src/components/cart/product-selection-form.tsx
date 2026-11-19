"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { comboChangeFee } from "@/data/menu";
import type { MenuProduct } from "@/types/menu";
import { getSelectionBlockReason } from "@/lib/product-selection";
import { formatCents, MAX_NOTES, toCents } from "@/lib/selection";
import { QuantityControl } from "./quantity-control";
import { useSelection } from "./selection-context";

export function ProductSelectionForm({ product, onAdded, children }: { product: MenuProduct; onAdded: () => void; children?: ReactNode }) {
  const selection = useSelection();
  const [quantity, setQuantity] = useState(1);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [choices, setChoices] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const blocked = getSelectionBlockReason(product, selection.demo);
  const unitPriceCents = product.price === null ? 0 : toCents(product.price) + product.optionalAddons.filter((addon) => addonIds.includes(addon.id)).reduce((sum, addon) => sum + toCents(addon.price), 0);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = selection.add({ id: crypto.randomUUID(), productId: product.id, quantity, addonIds, choices, notes });
    if (result) setError(result); else onAdded();
  }

  return <form className="selection-form" onSubmit={submit}>
    <div className="product-scroll">{children}<div className="selection-fields">
    {product.options?.map((option, groupIndex) => <fieldset key={option.name}><legend>{option.name} {option.required !== false && <span className="field-hint">(obrigatório)</span>}</legend>{Array.from({ length: option.selections ?? 1 }, (_, index) => <label className="choice-label" key={index} htmlFor={`choice-${groupIndex}-${index}`}>{(option.selections ?? 1) > 1 ? `Temaki ${index + 1}` : "Escolha uma opção"}<select id={`choice-${groupIndex}-${index}`} required={option.required !== false} value={choices[option.name]?.[index] ?? ""} onChange={(event) => { const values = [...(choices[option.name] ?? [])]; values[index] = event.target.value; setChoices({ ...choices, [option.name]: values }); }}><option value="">Selecione</option>{option.values.map((value) => <option key={value}>{value}</option>)}</select></label>)}</fieldset>)}
    {product.optionalAddons.length > 0 && <fieldset><legend>Adicionais <span className="field-hint">(por unidade do produto)</span></legend>{product.optionalAddons.map((addon) => <label key={addon.id} className="addon-choice"><input type="checkbox" required={addon.required} disabled={addon.availability === "unavailable"} checked={addonIds.includes(addon.id)} onChange={(event) => setAddonIds(event.target.checked ? [...addonIds, addon.id] : addonIds.filter((id) => id !== addon.id))} /><span>{addon.name}{addon.required ? " · Obrigatório" : " · Opcional"}{addon.availability === "unavailable" ? " · Indisponível" : ""}</span><strong>{addon.price === 0 ? "Sem cobrança" : `+ ${formatCents(toCents(addon.price))}`}</strong></label>)}</fieldset>}
    <div className="notes-label"><label htmlFor="product-notes">Observações <span className="field-hint">(opcional)</span></label><textarea id="product-notes" aria-describedby="product-notes-hint" value={notes} maxLength={MAX_NOTES} rows={2} placeholder="Ex.: sem cebolinha" onChange={(event) => setNotes(event.target.value)} /><span id="product-notes-hint" className="field-hint">{notes.length}/{MAX_NOTES} caracteres.</span></div>
    {(product.category === "combos" || product.category === "promocionais") && <p className="field-hint">Alterações em combos: {formatCents(toCents(comboChangeFee))}, sujeitas à confirmação do restaurante.</p>}
    </div></div>
    <div className="product-action-bar">
    <div className="selection-config-bottom"><QuantityControl value={quantity} onChange={setQuantity} label={product.name} /><div><p className="price-label">Subtotal deste item</p><p className="price">{product.price === null ? "Consultar valor" : formatCents(unitPriceCents * quantity)}</p></div></div>
    {error && <p role="alert" className="form-error">{error}</p>}
    {blocked && <p className="form-error">{blocked}</p>}
    <button type="submit" className="primary-button selection-submit" disabled={!!blocked || !selection.ready || product.optionalAddons.some((addon) => addon.required && addon.availability === "unavailable")}>{product.availability === "unavailable" ? "Produto indisponível" : "Adicionar à seleção"}</button>
    </div>
  </form>;
}
