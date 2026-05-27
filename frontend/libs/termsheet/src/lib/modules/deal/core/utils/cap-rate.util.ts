export function calcCapRate(noi: number, purchasePrice: number): number {
  if (purchasePrice === 0) {
    return 0;
  }
  return noi / purchasePrice;
}
