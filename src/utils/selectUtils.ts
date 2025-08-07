
// Utility functions for safe Select component usage

export const ensureValidSelectItemValue = (value: any, fallback?: string): string => {
  // Generate unique fallback with more entropy
  const uniqueFallback = fallback || `validated_${Date.now()}_${Math.random().toString(36).substr(2, 15)}_${Math.floor(Math.random() * 10000)}`;
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    console.warn('ensureValidSelectItemValue: null/undefined value, using fallback:', uniqueFallback);
    return uniqueFallback;
  }
  
  // Convert to string
  let stringValue: string;
  try {
    stringValue = String(value);
  } catch (error) {
    console.error('ensureValidSelectItemValue: Error converting to string, using fallback:', error);
    return uniqueFallback;
  }
  
  // Trim whitespace
  stringValue = stringValue.trim();
  
  // Validate string is not empty - critical check
  if (stringValue === '' || 
      stringValue === 'null' || 
      stringValue === 'undefined' || 
      stringValue.length === 0) {
    console.warn('ensureValidSelectItemValue: Empty or invalid string, using fallback:', uniqueFallback);
    return uniqueFallback;
  }
  
  // Additional check to ensure it's truly non-empty
  if (stringValue.replace(/\s/g, '').length === 0) {
    console.warn('ensureValidSelectItemValue: String with only whitespace, using fallback:', uniqueFallback);
    return uniqueFallback;
  }
  
  return stringValue;
};

export const createSafeTeamValue = (teamName: any, teamIndex: number): string => {
  const fallback = `team_${teamIndex}_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  const result = ensureValidSelectItemValue(teamName, fallback);
  console.log('createSafeTeamValue:', { input: teamName, output: result });
  return result;
};

export const createSafePlayerValue = (player: any, index: number): string => {
  const playerId = player?.id;
  const fallback = `player_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  const result = ensureValidSelectItemValue(playerId, fallback);
  console.log('createSafePlayerValue:', { input: playerId, output: result });
  return result;
};

export const createSafeSelectOptions = (players: any[], prefix: string = 'player') => {
  if (!Array.isArray(players)) {
    console.warn('createSafeSelectOptions: players is not an array, returning empty array');
    return [];
  }

  return players
    .filter(player => {
      // More strict filtering - ensure both id and name exist and are not empty
      const hasValidId = player && player.id && String(player.id).trim() !== '';
      const hasValidName = player && player.name && String(player.name).trim() !== '';
      
      if (!hasValidId || !hasValidName) {
        console.warn('createSafeSelectOptions: Filtering out invalid player:', player);
        return false;
      }
      
      return true;
    })
    .map((player, index) => {
      const safeId = ensureValidSelectItemValue(player.id, `${prefix}_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      
      return {
        ...player,
        id: safeId
      };
    });
};

// Additional validation function to check if a value is safe for Select.Item
export const isValidSelectItemValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  
  try {
    const stringValue = String(value).trim();
    return stringValue !== '' && stringValue.length > 0;
  } catch {
    return false;
  }
};

// Function to validate an array of select options
export const validateSelectOptions = (options: any[], itemKey: string = 'value'): any[] => {
  return options.filter(option => {
    const value = option[itemKey];
    const isValid = isValidSelectItemValue(value);
    
    if (!isValid) {
      console.warn('validateSelectOptions: Filtering out option with invalid value:', option);
    }
    
    return isValid;
  });
};
