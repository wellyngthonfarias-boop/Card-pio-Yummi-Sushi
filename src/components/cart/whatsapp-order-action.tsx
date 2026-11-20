"use client";

import { useState, type FormEvent } from "react";
import { MapPin, MessageCircle } from "lucide-react";
import { useCatalog } from "@/components/catalog-provider";
import { formatPostalCode, resolveDelivery } from "@/lib/delivery";
import { formatCents, selectionTotals } from "@/lib/selection";
import { prepareWhatsAppOrder } from "@/lib/whatsapp";
import { paymentMethods, resolvePayment } from "@/lib/payment";
import { useSelection } from "./selection-context";

export function WhatsAppOrderAction() {
  const selection = useSelection();
  const { products: menuProducts, zones: deliveryZones } = useCatalog();
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");
  const address = selection.deliveryAddress;
  const subtotalCents = selectionTotals(selection.lines).subtotalCents;
  const zone = deliveryZones.find((entry) => entry.id === address.zoneId);
  const blocked = !selection.ready || selection.demo || selection.lines.length === 0;
  const resolved = resolveDelivery(address, deliveryZones);
  const payment = resolvePayment(address, subtotalCents + (zone?.feeCents ?? 0));

  function openWhatsApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const current = prepareWhatsAppOrder(selection.lines, menuProducts, address, deliveryZones);
    if (selection.demo || !current.ok) {
      setError(selection.demo ? "A demonstração não envia pedidos reais." : current.ok ? "" : current.error);
      return;
    }
    // Abre a conversa por envio explícito do formulário; não envia nem confirma o pedido.
    try { window.open(current.url, "_blank", "noopener,noreferrer"); }
    catch { setError("Não foi possível abrir o WhatsApp. Tente novamente."); }
  }

  function update(field: keyof typeof address, value: string) {
    selection.setDeliveryAddress({ ...address, [field]: value });
    setError("");
  }

  return <section className="whatsapp-action" aria-label="Pedido pelo WhatsApp">
    {!expanded ? <button type="button" className="primary-button whatsapp-button full-width" disabled={blocked} onClick={() => setExpanded(true)}><MessageCircle size={21} aria-hidden="true" />Fazer pedido pelo WhatsApp</button> :
      <form className="delivery-form" onSubmit={openWhatsApp}>
        <fieldset>
          <legend><MapPin size={20} aria-hidden="true" />Endereço de entrega</legend>
          <label htmlFor="customer-name">Nome do cliente (opcional)
            <input id="customer-name" name="customerName" autoComplete="name" maxLength={80} placeholder="Como podemos chamar você?" value={address.customerName ?? ""} onChange={(event) => update("customerName", event.target.value)} />
          </label>
          <label htmlFor="delivery-street">Rua
            <input id="delivery-street" name="street" autoComplete="address-line1" autoFocus required maxLength={120} value={address.street} onChange={(event) => update("street", event.target.value)} />
          </label>
          <div className="delivery-field-row">
            <label htmlFor="delivery-number">Número
              <input id="delivery-number" name="number" required maxLength={20} placeholder="Número ou S/N" value={address.number} onChange={(event) => update("number", event.target.value)} />
            </label>
            <label htmlFor="delivery-postal-code">CEP
              <input id="delivery-postal-code" name="postalCode" autoComplete="postal-code" inputMode="numeric" required pattern="[0-9]{5}-?[0-9]{3}" maxLength={9} placeholder="00000-000" value={address.postalCode} onChange={(event) => update("postalCode", formatPostalCode(event.target.value))} />
            </label>
          </div>
          <label htmlFor="delivery-complement">Complemento (opcional)
            <input id="delivery-complement" name="complement" autoComplete="address-line2" maxLength={120} placeholder="Ex.: apartamento, bloco ou ponto de referência" value={address.complement} onChange={(event) => update("complement", event.target.value)} />
          </label>
          <label htmlFor="delivery-neighborhood">Bairro
            <select id="delivery-neighborhood" name="zoneId" required value={address.zoneId} onChange={(event) => update("zoneId", event.target.value)} aria-describedby="delivery-area-hint">
              <option value="">Selecione seu bairro</option>
              {deliveryZones.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} — {formatCents(entry.feeCents)}</option>)}
            </select>
          </label>
          <p id="delivery-area-hint" className="field-hint">Escolha um dos bairros atendidos para calcular a entrega.</p>
        </fieldset>
        <dl className="delivery-summary" aria-live="polite" aria-atomic="true">
          <div><dt>Produtos e adicionais</dt><dd>{formatCents(subtotalCents)}</dd></div>
          <div><dt>Taxa de entrega</dt><dd>{zone ? formatCents(zone.feeCents) : "Selecione o bairro"}</dd></div>
          <div className="delivery-grand-total"><dt>Total com entrega</dt><dd>{zone ? formatCents(subtotalCents + zone.feeCents) : "—"}</dd></div>
        </dl>
        <fieldset><legend>Forma de pagamento</legend>
          <label htmlFor="payment-method">Como deseja pagar?<select id="payment-method" required value={address.paymentMethod ?? ""} onChange={(event) => { selection.setDeliveryAddress({ ...address, paymentMethod: event.target.value, changeMode: "", changeFor: "" }); setError(""); }}><option value="">Selecione</option>{Object.entries(paymentMethods).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          {address.paymentMethod === "cash" && <><label htmlFor="change-mode">Precisa de troco?<select id="change-mode" required value={address.changeMode ?? ""} onChange={(event) => update("changeMode", event.target.value)}><option value="">Selecione</option><option value="exact">Não, tenho o valor exato</option><option value="change">Sim</option></select></label>{address.changeMode === "change" && <label htmlFor="change-for">Troco para quanto? (R$)<input id="change-for" inputMode="decimal" required maxLength={10} placeholder="Ex.: 100,00" value={address.changeFor ?? ""} onChange={(event) => update("changeFor", event.target.value)} /></label>}</>}
          {address.paymentMethod === "cash" && address.changeMode === "change" && address.changeFor && !payment.ok && <p role="alert" className="form-error">{payment.error}</p>}
        </fieldset>
        {error && <p role="alert" className="form-error">{error}</p>}
        {!deliveryZones.length && <p role="status" className="form-error">As taxas de entrega ainda não foram cadastradas.</p>}
        <button type="submit" className="primary-button whatsapp-button full-width" disabled={blocked || !resolved.ok || !payment.ok}><MessageCircle size={21} aria-hidden="true" />Fazer pedido pelo WhatsApp</button>
        <button type="button" className="text-action" onClick={() => { setExpanded(false); setError(""); }}>Voltar à seleção</button>
      </form>}
    {selection.demo && selection.lines.length > 0 && <p className="form-error">Produtos fictícios não podem ser enviados ao WhatsApp do restaurante.</p>}
  </section>;
}
