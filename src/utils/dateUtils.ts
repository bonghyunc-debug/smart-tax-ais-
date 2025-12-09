export const DEEMED_ACQ_DATE_1985 = new Date('1985-01-01');

export function getEffectiveAcquisitionDate(actual: Date): Date {
  if (isNaN(actual.getTime())) return actual;
  if (actual < DEEMED_ACQ_DATE_1985) return DEEMED_ACQ_DATE_1985;
  return actual;
}
