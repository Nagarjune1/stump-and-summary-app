
// Utility functions for scoring system
export const ensureValidId = (id: any, fallback: string = 'default_id'): string => {
  if (id === null || id === undefined || String(id).trim() === '') {
    return fallback || `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return String(id).trim();
};

export const ensureValidSelectValue = (value: any, fallbackPrefix: string = 'item'): string => {
  const cleanValue = ensureValidId(value);
  // NEVER return empty string - always return a valid fallback
  if (cleanValue === '' || cleanValue === 'default_id') {
    return `${fallbackPrefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return cleanValue;
};

export const validatePlayer = (player: any): boolean => {
  return player && 
         player.id && 
         String(player.id).trim() !== '' &&
         player.name && 
         String(player.name).trim() !== '';
};

export const formatOvers = (overs: number, balls: number = 0): string => {
  const completeOvers = Math.floor(overs);
  const remainingBalls = balls % 6;
  return `${completeOvers}.${remainingBalls}`;
};

export const calculateStrikeRate = (runs: number, balls: number): number => {
  if (balls === 0) return 0;
  return (runs / balls) * 100;
};

export const calculateEconomy = (runs: number, overs: number): number => {
  if (overs === 0) return 0;
  return runs / overs;
};
