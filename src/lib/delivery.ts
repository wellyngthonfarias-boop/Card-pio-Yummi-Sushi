import type { DeliveryAddress, DeliveryZone, ResolvedDelivery } from "@/types/delivery";

export function formatPostalCode(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function cleanAddressText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned || cleaned.length > maxLength || Array.from(cleaned).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return null;
  return cleaned;
}

type DeliveryResolution = { ok: true; delivery: ResolvedDelivery } | { ok: false; error: string };

export function resolveDelivery(raw: unknown, zones: readonly DeliveryZone[]): DeliveryResolution {
  if (!zones.length) return { ok: false, error: "As taxas de entrega ainda não foram cadastradas." };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, error: "Preencha o endereço de entrega." };
  const value = raw as Record<string, unknown>;
  const street = cleanAddressText(value.street, 120);
  if (!street) return { ok: false, error: "Informe a rua (até 120 caracteres)." };
  const number = cleanAddressText(value.number, 20);
  if (!number) return { ok: false, error: "Informe o número ou S/N (até 20 caracteres)." };
  if (typeof value.postalCode !== "string" || !/^\d{5}-?\d{3}$/.test(value.postalCode.trim())) return { ok: false, error: "Informe um CEP com 8 dígitos." };
  const zone = zones.find((entry) => entry.id === value.zoneId);
  if (!zone) return { ok: false, error: "Selecione um bairro atendido na lista." };
  if (!Number.isSafeInteger(zone.feeCents) || zone.feeCents < 0) return { ok: false, error: "A taxa deste bairro precisa ser revisada pelo restaurante." };
  const address: DeliveryAddress = { street, number, postalCode: formatPostalCode(value.postalCode), zoneId: zone.id };
  return { ok: true, delivery: { address, neighborhood: zone.name, feeCents: zone.feeCents } };
}
