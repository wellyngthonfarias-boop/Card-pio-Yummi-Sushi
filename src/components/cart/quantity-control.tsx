"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_QUANTITY } from "@/lib/selection";

export function QuantityControl({ value, onChange, label, allowRemove = false }: { value: number; onChange: (quantity: number) => void; label: string; allowRemove?: boolean }) {
  return <div className="quantity-control" role="group" aria-label={`Quantidade de ${label}`}><button type="button" aria-label={`Diminuir quantidade de ${label}`} disabled={!allowRemove && value <= 1} onClick={() => onChange(value - 1)}><Minus size={18} aria-hidden="true" /></button><output aria-live="polite">{value}</output><button type="button" aria-label={`Aumentar quantidade de ${label}`} disabled={value >= MAX_QUANTITY} onClick={() => onChange(value + 1)}><Plus size={18} aria-hidden="true" /></button></div>;
}
