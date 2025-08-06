
// Utility functions for safe Select component usage

export interface SafeSelectOption {
  id: string;
  name: string;
  [key: string]: any;
}

export const createSafeSelectValue = (value: any, fallback?: string): string => {
  // Generate unique fallback if none provided
  const uniqueFallback = fallback || `safe_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    console.warn('createSafeSelectValue: null/undefined value, using fallback:', uniqueFallback);
    return uniqueFallback;
  }
  
  // Convert to string and trim
  let stringValue: string;
  try {
    stringValue = String(value).trim();
  } catch (error) {
    console.warn('createSafeSelectValue: error converting to string:', error, 'using fallback:', uniqueFallback);
    return uniqueFallback;
  }
  
  // Multi-layer validation for empty or invalid strings
  if (stringValue === '' || 
      stringValue === 'null' || 
      stringValue === 'undefined' || 
      stringValue.length === 0 ||
      stringValue.replace(/\s/g, '') === '' ||
      !stringValue ||
      typeof stringValue !== 'string') {
    console.warn('createSafeSelectValue: empty/invalid string value:', value, 'using fallback:', uniqueFallback);
    return uniqueFallback;
  }
  
  return stringValue;
};

export const validateSelectOption = (option: any, index: number): SafeSelectOption | null => {
  if (!option) {
    console.warn(`validateSelectOption: null/undefined option at index ${index}`);
    return null;
  }
  
  // Generate unique fallback IDs with multiple entropy sources
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 15);
  const fallbackId = `option_${index}_${timestamp}_${randomString}`;
  const fallbackName = `Option ${index + 1}`;
  
  const safeId = createSafeSelectValue(option.id, fallbackId);
  const safeName = createSafeSelectValue(option.name, fallbackName);
  
  // Additional validation with multiple checks
  if (!safeId || 
      safeId.trim() === '' || 
      safeId.length === 0 ||
      typeof safeId !== 'string') {
    console.error(`validateSelectOption: Failed to create safe ID for option ${index}:`, option);
    return null;
  }
  
  console.log(`validateSelectOption: validated option ${index}:`, { 
    originalId: option.id,
    safeId, 
    safeName,
    safeIdLength: safeId.length,
    safeIdType: typeof safeId
  });
  
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
    .filter((option): option is SafeSelectOption => {
      if (!option) return false;
      
      // Enhanced filtering with multiple validation layers
      if (!option.id || 
          option.id === '' || 
          option.id === 'null' || 
          option.id === 'undefined' ||
          option.id.trim() === '' ||
          option.id.length === 0 ||
          typeof option.id !== 'string') {
        console.warn('createSafeSelectOptions: filtering out option with invalid ID:', option);
        return false;
      }
      return true;
    });
  
  console.log(`createSafeSelectOptions: created ${safeOptions.length} safe options from ${options.length} input options`);
  
  return safeOptions;
};

// Enhanced utility function specifically for ensuring SelectItem values are never empty
export const ensureValidSelectItemValue = (value: any, fallback?: string): string => {
  // Generate highly unique fallback if none provided
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substr(2, 20);
  const uniqueFallback = fallback || `validated_${timestamp}_${randomPart}`;
  
  // Handle null/undefined with immediate return
  if (value === null || value === undefined) {
    console.warn('ensureValidSelectItemValue: null/undefined value, using fallback:', uniqueFallback);
    return uniqueFallback;
  }
  
  // Convert to string with error handling
  let stringValue: string;
  try {
    stringValue = String(value);
  } catch (error) {
    console.warn('ensureValidSelectItemValue: error converting to string:', error, 'using fallback:', uniqueFallback);
    return uniqueFallback;
  }
  
  // Trim the string value
  stringValue = stringValue.trim();
  
  // Comprehensive validation with multiple checks
  if (stringValue === '' || 
      stringValue === 'null' || 
      stringValue === 'undefined' || 
      stringValue.length === 0 ||
      stringValue.replace(/\s/g, '') === '' ||
      !stringValue ||
      typeof stringValue !== 'string') {
    console.warn('ensureValidSelectItemValue: invalid string value:', value, 'using fallback:', uniqueFallback);
    return uniqueFallback;
  }
  
  // Final validation - ensure the value is truly non-empty
  if (typeof stringValue !== 'string' || stringValue.trim().length === 0) {
    console.warn('ensureValidSelectItemValue: final validation failed for value:', value, 'using fallback:', uniqueFallback);
    return uniqueFallback;
  }
  
  return stringValue;
};

// Additional utility for team names specifically
export const createSafeTeamValue = (teamName: any, teamIndex: number): string => {
  const fallback = `team_${teamIndex}_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  return ensureValidSelectItemValue(teamName, fallback);
};

// Utility for player names specifically  
export const createSafePlayerValue = (player: any, index: number): string => {
  const playerId = player?.id;
  const fallback = `player_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  return ensureValidSelectItemValue(playerId, fallback);
};
