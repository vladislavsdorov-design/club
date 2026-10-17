export const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

// 2026-10-17 -> 17.10.2026
export const fmtDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

export function calcStock(incomes, shifts) {
  const received = incomes.reduce((s, i) => s + i.amount, 0);
  const issued = shifts.reduce((s, x) => s + x.issued, 0);
  const returned = shifts.reduce((s, x) => s + (x.returned ?? 0), 0);
  const onHands = shifts
    .filter((x) => x.status === "open")
    .reduce((s, x) => s + x.issued, 0);
  const used = shifts
    .filter((x) => x.status === "closed")
    .reduce((s, x) => s + (x.issued - x.returned), 0);
  const inStock = received - issued + returned;
  return { received, issued, returned, onHands, used, inStock };
}
