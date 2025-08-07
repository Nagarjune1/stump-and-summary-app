
/**
 * Utility functions for handling Select components safely
 */

/**
 * Ensures a value is safe for use in Select.Item components
 * Radix UI Select requires non-empty string values
 */
export const ensureValidSelectItemValue = (value: any, fallbackPrefix = 'fallback'): string => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return `${fallbackPrefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Convert to string safely
  let stringValue: string;
  try {
    stringValue = String(value).trim();
  } catch (error) {
    return `${fallbackPrefix}_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Check for empty strings or invalid values
  if (stringValue === '' || stringValue === 'null' || stringValue === 'undefined') {
    return `${fallbackPrefix}_empty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  return stringValue;
};

/**
 * Validates if a value is safe for Select.Item
 */
export const isValidSelectItemValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  
  try {
    const stringValue = String(value).trim();
    return stringValue !== '' && stringValue !== 'null' && stringValue !== 'undefined';
  } catch {
    return false;
  }
};

/**
 * Creates safe select options from an array of objects
 */
export const createSafeSelectOptions = (items: any[], fallbackPrefix = 'item'): any[] => {
  return items
    .filter(item => item && item.id && item.name)
    .map(item => ({
      ...item,
      id: ensureValidSelectItemValue(item.id, `${fallbackPrefix}_${item.name || 'unknown'}`),
      name: item.name || 'Unknown'
    }));
};

/**
 * Creates a safe team value for select components
 */
export const createSafeTeamValue = (teamName: string, teamNumber: number): string => {
  const safeName = teamName ? String(teamName).trim() : `Team ${teamNumber}`;
  return ensureValidSelectItemValue(safeName, `team_${teamNumber}`);
};
