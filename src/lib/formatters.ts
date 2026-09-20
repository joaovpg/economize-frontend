const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  minimumFractionDigits: 2,
  style: "currency",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatSignedCurrency(value: number) {
  return value >= 0 ? `+ ${formatCurrency(value)}` : `− ${formatCurrency(Math.abs(value))}`;
}
