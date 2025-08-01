
// Utility functions for safe Select component usage

export interface SafeSelectOption {
  id: string;
  name: string;
  [key: string]: any;
}

export const createSafeSelectValue = (value: any, fallback: string = 'unknown'): string => {
  if (value === null || value === undefined) {
    console.warn('createSafeSelectValue: null/undefined value, using fallback:', fallback);
    return fallback;
  }
  
  const stringValue = String(value).trim();
  if (stringValue === '' || stringValue === 'null' || stringValue === 'undefined') {
    console.warn('createSafeSelectValue: empty/invalid string value:', value, 'using fallback:', fallback);
    return fallback;
  }
  
  return stringValue;
};

export const validateSelectOption = (option: any, index: number): SafeSelectOption | null => {
  if (!option) {
    console.warn(`validateSelectOption: null/undefined option at index ${index}`);
    return null;
  }
  
  const safeId = createSafeSelectValue(option.id, `option_${index}`);
  const safeName = createSafeSelectValue(option.name, `Option ${index + 1}`);
  
  console.log(`validateSelectOption: validated option ${index}:`, { safeId, safeName });
  
  return {
    ...option,
    id: safeId,
    name: safeName
  };
};

export const createSafeSelectOptions = (options: any[], prefix: string = 'item'): SafeSelectOption[] => {
  if (!Array.isArray(options)) {
    console.warn('createSafeSelectOptions: options is not an array:', options);
    return [];
  }
  
  const safeOptions = options
    .map((option, index) => validateSelectOption(option, index))
    .filter((option): option is SafeSelectOption => option !== null);
  
  console.log(`createSafeSelectOptions: created ${safeOptions.length} safe options from ${options.length} input options`);
  
  return safeOptions;
};
