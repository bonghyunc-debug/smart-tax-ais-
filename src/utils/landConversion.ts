import { LAND_CONVERSION_CONFIG } from '../constants/landConversionConfig';

export interface LandGradeInput {
  acqGrade: number;
  grade1990Aug30: number;
  gradePrev1990Aug30: number;
  basePrice1990Jan1: number;
}

export function calcConvertedAcquisitionValue(input: LandGradeInput): number {
  const { acqGrade, grade1990Aug30, gradePrev1990Aug30, basePrice1990Jan1 } = input;

  const denom = (grade1990Aug30 + gradePrev1990Aug30) / 2;
  if (!denom || !acqGrade || !basePrice1990Jan1) return 0;

  return Math.floor((basePrice1990Jan1 * acqGrade) / denom);
}

export function getGradeReferenceDate(): string {
  return LAND_CONVERSION_CONFIG.GRADE_REFERENCE_DATE_1990_08_30;
}
