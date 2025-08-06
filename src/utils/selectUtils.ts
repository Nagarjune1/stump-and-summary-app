
// Utility functions for safe Select component usage

export interface SafeSelectOption {
  id: string;
  name: string;
  [key: string]: any;
}

export const createSafeSelectValue = (value: any, fallback: string = 'unknown'): string => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    console.warn('createSafeSelectValue: null/undefined value, using fallback:', fallback);
    return fallback;
  }
  
  // Convert to string and trim
  const stringValue = String(value).trim();
  
  // Check for empty or invalid strings - be more strict
  if (stringValue === '' || 
      stringValue === 'null' || 
      stringValue === 'undefined' ||
      stringValue.length === 0 ||
      stringValue.replace(/\s/g, '') === '') {
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
  
  // Generate unique fallback IDs with timestamp and random string
  const fallbackId = `option_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const fallbackName = `Option ${index + 1}`;
  
  const safeId = createSafeSelectValue(option.id, fallbackId);
  const safeName = createSafeSelectValue(option.name, fallbackName);
  
  // Double check that the safe ID is truly safe
  if (!safeId || safeId.trim() === '') {
    console.error(`validateSelectOption: Failed to create safe ID for option ${index}:`, option);
    return null;
  }
  
  console.log(`validateSelectOption: validated option ${index}:`, { 
    originalId: option.id,
    safeId, 
    safeName,
    safeIdLength: safeId.length
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
      // Ensure no empty string IDs get through with multiple checks
      if (!option.id || 
          option.id === '' || 
          option.id === 'null' || 
          option.id === 'undefined' ||
          option.id.trim() === '' ||
          option.id.length === 0) {
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
  // Generate unique fallback if none provided - make it more unique
  const uniqueFallback = fallback || `safe_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    console.warn('ensureValidSelectItemValue: null/undefined value, using fallback:', uniqueFallback);
    return uniqueFallback;
  }
  
  // Convert to string and trim
  const stringValue = String(value).trim();
  
  // Multi-layer validation for empty or invalid strings
  if (stringValue === '' || 
      stringValue === 'null' || 
      stringValue === 'undefined' || 
      stringValue.length === 0 ||
      stringValue.replace(/\s/g, '') === '' ||
      !stringValue) {
    console.warn('ensureValidSelectItemValue: empty/invalid string value:', value, 'using fallback:', uniqueFallback);
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
  return ensureValidSelectItemValue(teamName, `team_${teamIndex}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`);
};

// Utility for player names specifically  
export const createSafePlayerValue = (player: any, index: number): string => {
  const playerId = player?.id;
  return ensureValidSelectItemValue(playerId, `player_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`);
};
