export function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatMenuPrice(value: number | null) {
  return value === null ? "Consultar valor" : value === 0 ? "Sem cobrança" : formatPrice(value);
}
