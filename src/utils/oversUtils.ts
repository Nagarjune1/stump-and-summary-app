
export const formatOvers = (ballsPlayed: number): string => {
  if (!ballsPlayed || ballsPlayed < 0) return "0.0";
  
  const completedOvers = Math.floor(ballsPlayed / 6);
  const remainingBalls = ballsPlayed % 6;
  
  return `${completedOvers}.${remainingBalls}`;
};

export const parseBallsFromOvers = (oversString: string): number => {
  if (!oversString || typeof oversString !== 'string') return 0;
  
  const parts = oversString.split('.');
  const overs = parseInt(parts[0]) || 0;
  const balls = parseInt(parts[1]) || 0;
  
  // Validate balls (should be 0-5)
  const validBalls = Math.min(balls, 5);
  
  return (overs * 6) + validBalls;
};

export const calculateEconomyRate = (runsGiven: number, ballsBowled: number): number => {
  if (!ballsBowled || ballsBowled === 0) return 0;
  
  const overs = ballsBowled / 6;
  return parseFloat((runsGiven / overs).toFixed(2));
};

export const calculateStrikeRate = (runs: number, ballsFaced: number): number => {
  if (!ballsFaced || ballsFaced === 0) return 0;
  
  return parseFloat(((runs / ballsFaced) * 100).toFixed(2));
};

export const validateOversInput = (oversString: string): boolean => {
  if (!oversString || typeof oversString !== 'string') return false;
  
  const oversPattern = /^\d+\.\d$/;
  if (!oversPattern.test(oversString)) return false;
  
  const parts = oversString.split('.');
  const balls = parseInt(parts[1]);
  
  // Balls should be between 0 and 5
  return balls >= 0 && balls <= 5;
};

export const addOvers = (overs1: string, overs2: string): string => {
  const balls1 = parseBallsFromOvers(overs1);
  const balls2 = parseBallsFromOvers(overs2);
  
  return formatOvers(balls1 + balls2);
};

export const subtractOvers = (overs1: string, overs2: string): string => {
  const balls1 = parseBallsFromOvers(overs1);
  const balls2 = parseBallsFromOvers(overs2);
  
  const result = Math.max(0, balls1 - balls2);
  return formatOvers(result);
};
