import type { InsurancePaymentFrequency } from '../types/insurance.types';

export const insurancePaymentFrequencyLabels: Record<InsurancePaymentFrequency, string> = {
  monthly: '月缴',
  quarterly: '季缴',
  semi_annual: '半年缴',
  annual: '年缴',
  single: '一次性',
  other: '其他',
};

export const insurancePaymentFrequencyOptions = Object.entries(insurancePaymentFrequencyLabels).map(
  ([value, label]) => ({ value, label })
) as Array<{
  value: InsurancePaymentFrequency;
  label: string;
}>;

export function formatInsurancePaymentFrequency(value?: InsurancePaymentFrequency | null): string {
  return value ? insurancePaymentFrequencyLabels[value] : '-';
}

export function formatInsurancePaymentReminder(enabled?: boolean): string {
  return enabled === false ? '关闭' : '开启';
}
