
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
  
  // Ensure the ID is never an empty string - this is critical for SelectItem
  if (safeId === '' || safeId === 'null' || safeId === 'undefined') {
    console.warn(`validateSelectOption: invalid ID for option ${index}, using generated ID`);
    const generatedId = `generated_option_${index}_${Date.now()}`;
    return {
      ...option,
      id: generatedId,
      name: safeName
    };
  }
  
  // Additional safety check - if somehow still empty, generate unique ID
  const finalId = safeId || `emergency_fallback_${index}_${Date.now()}`;
  
  console.log(`validateSelectOption: validated option ${index}:`, { finalId, safeName });
  
  return {
    ...option,
    id: finalId,
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
    .filter((option): option is SafeSelectOption => {
      if (!option) return false;
      // Critical check: ensure no empty string IDs get through to SelectItem
      if (!option.id || option.id === '' || option.id === 'null' || option.id === 'undefined') {
        console.warn('createSafeSelectOptions: filtering out option with invalid ID:', option);
        return false;
      }
      return true;
    });
  
  console.log(`createSafeSelectOptions: created ${safeOptions.length} safe options from ${options.length} input options`);
  
  return safeOptions;
};

// New utility function specifically for ensuring SelectItem values are never empty
export const ensureValidSelectItemValue = (value: any, fallback?: string): string => {
  const safeValue = createSafeSelectValue(value, fallback || `fallback_${Date.now()}`);
  // Double check - if somehow still empty, use timestamp-based fallback
  return safeValue || `emergency_${Date.now()}`;
};
