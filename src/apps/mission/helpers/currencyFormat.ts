import type { Ref } from 'vue';

// composables/useCurrencyFormatter.ts
export function useCurrencyFormatter() {
  const formatCurrency = (value: string | number): string => {
    const num = Number(value);
    return num.toLocaleString('en-US');
  };

  const extractRawNumeric = (value: string): string => {
    return value.replace(/[^\d]/g, '');
  };

  const preventNonNumeric = (e: KeyboardEvent) => {
    if (
      !/[0-9]/.test(e.key)
      && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)
    ) {
      e.preventDefault();
    }
  };
  
  const createBudgetInputHandler = (
    modelRef: Ref<string>,
    onRawValueChange?: (raw: string) => void
  ) => {
    return (e: Event) => {
      const rawValue = extractRawNumeric((e.target as HTMLInputElement).value);
      modelRef.value = formatCurrency(rawValue);
      onRawValueChange?.(rawValue);
    };
  };

  return {
    formatCurrency,
    extractRawNumeric,
    preventNonNumeric,
    createBudgetInputHandler,
  };
}

export const formatCurrency = (value: string | number | null | undefined) => {
  if (value == null || isNaN(Number(value))){
    return '';
  }
  return Number(value).toLocaleString('vi-VN');
};
