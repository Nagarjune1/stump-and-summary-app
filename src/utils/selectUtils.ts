
// Utility functions for safe Select component usage

export const ensureValidSelectItemValue = (value: any, fallback?: string): string => {
  // Generate unique fallback
  const uniqueFallback = fallback || `validated_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    return uniqueFallback;
  }
  
  // Convert to string
  let stringValue: string;
  try {
    stringValue = String(value).trim();
  } catch (error) {
    return uniqueFallback;
  }
  
  // Validate string is not empty
  if (stringValue === '' || 
      stringValue === 'null' || 
      stringValue === 'undefined' || 
      stringValue.length === 0) {
    return uniqueFallback;
  }
  
  return stringValue;
};

export const createSafeTeamValue = (teamName: any, teamIndex: number): string => {
  const fallback = `team_${teamIndex}_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  return ensureValidSelectItemValue(teamName, fallback);
};

export const createSafePlayerValue = (player: any, index: number): string => {
  const playerId = player?.id;
  const fallback = `player_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  return ensureValidSelectItemValue(playerId, fallback);
};

// Add back the missing createSafeSelectOptions function
export const createSafeSelectOptions = (players: any[], prefix: string = 'player') => {
  if (!Array.isArray(players)) {
    console.warn('createSafeSelectOptions: players is not an array, returning empty array');
    return [];
  }

  return players
    .filter(player => player && (player.id || player.name)) // Filter out invalid players
    .map((player, index) => ({
      ...player,
      id: ensureValidSelectItemValue(player.id, `${prefix}_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    }));
};
