import confetti from 'canvas-confetti';

export type MilestoneType = 'half_century' | 'century' | 'wicket_milestone';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  scalar?: number;
  origin?: { x: number; y: number };
  colors?: string[];
}

const defaultColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
const goldColors = ['#ffd700', '#ffb347', '#ffa500', '#ff8c00', '#daa520'];

export const useConfetti = () => {
  const fireConfetti = (options: ConfettiOptions = {}) => {
    confetti({
      particleCount: options.particleCount || 100,
      spread: options.spread || 70,
      startVelocity: options.startVelocity || 30,
      decay: options.decay || 0.9,
      scalar: options.scalar || 1,
      origin: options.origin || { x: 0.5, y: 0.6 },
      colors: options.colors || defaultColors,
    });
  };

  const celebrateHalfCentury = () => {
    // Single burst for 50
    fireConfetti({
      particleCount: 80,
      spread: 60,
      colors: defaultColors,
    });
  };

  const celebrateCentury = () => {
    // Multi-burst celebration for 100
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const interval = 250;

    const intervalId = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(intervalId);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fire from both sides
      confetti({
        particleCount: Math.floor(particleCount),
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: goldColors,
      });
      confetti({
        particleCount: Math.floor(particleCount),
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: goldColors,
      });
    }, interval);

    // Initial center burst
    confetti({
      particleCount: 150,
      spread: 100,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.5 },
      colors: goldColors,
    });
  };

  const celebrateMilestone = (type: MilestoneType) => {
    switch (type) {
      case 'half_century':
        celebrateHalfCentury();
        break;
      case 'century':
        celebrateCentury();
        break;
      default:
        fireConfetti();
    }
  };

  return {
    fireConfetti,
    celebrateHalfCentury,
    celebrateCentury,
    celebrateMilestone,
  };
};
